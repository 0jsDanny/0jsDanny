"""
Extrai os contornos vetoriais dos bairros de Belem a partir dos PDFs da CODEM.

Gera:
  - belem_maps/bairros_codem_extracted.geojson
  - belem_maps/extraction_report.csv
"""

from __future__ import annotations

import csv
import gc
import json
import math
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import fitz
import numpy as np
from pyproj import Transformer


if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


BASE_DIR = Path(__file__).resolve().parent
PDF_DIR = BASE_DIR / "pdfs" / "bairros"
OUTPUT_GEOJSON = BASE_DIR / "bairros_codem_extracted.geojson"
OUTPUT_REPORT = BASE_DIR / "extraction_report.csv"

SOURCE_EPSG = 31982
TARGET_EPSG = 4326
TARGET_COLOR = (1.0, 0.49803999066352844, 0.49803999066352844)
COLOR_TOLERANCE = 0.05
CURVE_STEPS = 16
MAX_ACCEPTABLE_RESIDUAL_M = 0.5

EASTING_RE = re.compile(r"^\d{6}(?:,000000)?$")
NORTHING_RE = re.compile(r"^\d{7}(?:,000000)?$")
FILE_RE = re.compile(r"^(?P<id>\d+)_?(?P<name>.+?)\.pdf$", re.IGNORECASE)

TO_WGS84 = Transformer.from_crs(
    f"EPSG:{SOURCE_EPSG}",
    f"EPSG:{TARGET_EPSG}",
    always_xy=True,
)


@dataclass
class LinearTransform:
    slope: float
    intercept: float
    max_residual: float

    def apply(self, value: float) -> float:
        return (self.slope * value) + self.intercept


def parse_filename(pdf_path: Path) -> tuple[str, str]:
    match = FILE_RE.match(pdf_path.name)
    if not match:
        return ("", pdf_path.stem)
    return (match.group("id"), match.group("name").replace("_", " "))


def is_easting(token: str) -> bool:
    return bool(EASTING_RE.match(token))


def is_northing(token: str) -> bool:
    return bool(NORTHING_RE.match(token))


def parse_utm_label(token: str) -> float:
    return float(token.replace(".", "").replace(",", "."))


def fit_linear_transform(samples: list[tuple[float, float]], axis_name: str) -> LinearTransform:
    if len(samples) < 2:
        raise ValueError(f"GCPs insuficientes para {axis_name}: {len(samples)}")

    pdf_coords = np.array([sample[0] for sample in samples], dtype=float)
    world_coords = np.array([sample[1] for sample in samples], dtype=float)
    slope, intercept = np.polyfit(pdf_coords, world_coords, 1)
    fitted = (slope * pdf_coords) + intercept
    residuals = np.abs(fitted - world_coords)
    return LinearTransform(
        slope=float(slope),
        intercept=float(intercept),
        max_residual=float(residuals.max(initial=0.0)),
    )


def extract_grid_transforms(page: fitz.Page) -> tuple[LinearTransform, LinearTransform, int, int]:
    easting_samples: list[tuple[float, float]] = []
    northing_samples: list[tuple[float, float]] = []

    for x0, y0, x1, y1, word, *_rest in page.get_text("words"):
        token = str(word).strip()
        center_x = (float(x0) + float(x1)) / 2.0
        center_y = (float(y0) + float(y1)) / 2.0
        
        # Skip labels that belong to inset/location maps on the right side of landscape pages
        if center_x > 2500:
            continue
            
        if is_easting(token):
            easting_samples.append((center_x, parse_utm_label(token)))
        elif is_northing(token):
            northing_samples.append((center_y, parse_utm_label(token)))

    easting_transform = fit_linear_transform(easting_samples, "easting")
    northing_transform = fit_linear_transform(northing_samples, "northing")
    return (
        easting_transform,
        northing_transform,
        len(easting_samples),
        len(northing_samples),
    )


def color_distance(color: tuple[float, float, float] | None, target: tuple[float, float, float]) -> float:
    if color is None:
        return float("inf")
    return math.dist(tuple(float(component) for component in color), target)


def rect_area(rect: fitz.Rect | None) -> float:
    if rect is None:
        return 0.0
    return max(0.0, float(rect.width) * float(rect.height))


def choose_polygon_drawing(page: fitz.Page) -> tuple[dict, float, int]:
    best_drawing = None
    best_distance = float("inf")
    best_score = -1.0

    for drawing in page.get_drawings():
        distance = color_distance(drawing.get("color"), TARGET_COLOR)
        if distance > COLOR_TOLERANCE:
            continue

        items = drawing.get("items", [])
        score = (len(items) * 1_000_000.0) + rect_area(drawing.get("rect"))
        if score > best_score:
            best_drawing = drawing
            best_distance = distance
            best_score = score

    if best_drawing is None:
        raise ValueError("Nenhum path com a cor-alvo foi encontrado")

    return best_drawing, best_distance, len(best_drawing.get("items", []))


def bezier_point(
    p0: fitz.Point,
    p1: fitz.Point,
    p2: fitz.Point,
    p3: fitz.Point,
    t: float,
) -> fitz.Point:
    mt = 1.0 - t
    x = (
        (mt ** 3) * float(p0.x)
        + 3.0 * (mt ** 2) * t * float(p1.x)
        + 3.0 * mt * (t ** 2) * float(p2.x)
        + (t ** 3) * float(p3.x)
    )
    y = (
        (mt ** 3) * float(p0.y)
        + 3.0 * (mt ** 2) * t * float(p1.y)
        + 3.0 * mt * (t ** 2) * float(p2.y)
        + (t ** 3) * float(p3.y)
    )
    return fitz.Point(x, y)


def append_point(points: list[tuple[float, float]], point: fitz.Point | tuple[float, float]) -> None:
    if hasattr(point, "x") and hasattr(point, "y"):
        x_value = float(point.x)
        y_value = float(point.y)
    else:
        x_value = float(point[0])
        y_value = float(point[1])

    candidate = (x_value, y_value)
    if not points or candidate != points[-1]:
        points.append(candidate)


def points_from_item(item: tuple) -> list[tuple[float, float]]:
    item_type = item[0]
    if item_type == "l":
        return [
            (float(item[1].x), float(item[1].y)),
            (float(item[2].x), float(item[2].y)),
        ]

    if item_type == "re":
        rect = item[1]
        return [
            (float(rect.x0), float(rect.y0)),
            (float(rect.x1), float(rect.y0)),
            (float(rect.x1), float(rect.y1)),
            (float(rect.x0), float(rect.y1)),
            (float(rect.x0), float(rect.y0)),
        ]

    if item_type == "qu":
        quad = item[1]
        return [
            (float(quad.ul.x), float(quad.ul.y)),
            (float(quad.ur.x), float(quad.ur.y)),
            (float(quad.lr.x), float(quad.lr.y)),
            (float(quad.ll.x), float(quad.ll.y)),
            (float(quad.ul.x), float(quad.ul.y)),
        ]

    if item_type == "c":
        p0, p1, p2, p3 = item[1], item[2], item[3], item[4]
        samples = []
        for step in range(CURVE_STEPS + 1):
            t = step / CURVE_STEPS
            point = bezier_point(p0, p1, p2, p3, t)
            samples.append((float(point.x), float(point.y)))
        return samples

    return []


def drawing_to_pdf_ring(drawing: dict) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for item in drawing.get("items", []):
        for item_point in points_from_item(item):
            append_point(points, item_point)

    if len(points) < 3:
        raise ValueError("Path vetorial sem pontos suficientes para poligono")

    if points[0] != points[-1]:
        points.append(points[0])
    return points


def pdf_ring_to_utm(
    pdf_ring: Iterable[tuple[float, float]],
    easting_transform: LinearTransform,
    northing_transform: LinearTransform,
) -> list[tuple[float, float]]:
    return [
        (
            easting_transform.apply(pdf_x),
            northing_transform.apply(pdf_y),
        )
        for pdf_x, pdf_y in pdf_ring
    ]


def utm_ring_to_wgs84(utm_ring: Iterable[tuple[float, float]]) -> list[list[float]]:
    coordinates: list[list[float]] = []
    for easting, northing in utm_ring:
        lon, lat = TO_WGS84.transform(easting, northing)
        coordinates.append([float(lon), float(lat)])
    return coordinates


def polygon_area_square_meters(utm_ring: list[tuple[float, float]]) -> float:
    if len(utm_ring) < 4:
        return 0.0

    area = 0.0
    for (x1, y1), (x2, y2) in zip(utm_ring, utm_ring[1:]):
        area += (x1 * y2) - (x2 * y1)
    return abs(area) / 2.0


def polygon_bounds(coords: list[list[float]]) -> tuple[float, float, float, float]:
    longitudes = [point[0] for point in coords]
    latitudes = [point[1] for point in coords]
    return (
        min(longitudes),
        min(latitudes),
        max(longitudes),
        max(latitudes),
    )


def process_pdf(pdf_path: Path) -> tuple[dict, dict]:
    bairro_id, bairro_nome = parse_filename(pdf_path)

    with fitz.open(pdf_path) as doc:
        page = doc[0]
        easting_transform, northing_transform, easting_gcps, northing_gcps = extract_grid_transforms(page)
        drawing, color_dist, item_count = choose_polygon_drawing(page)
        pdf_ring = drawing_to_pdf_ring(drawing)
        utm_ring = pdf_ring_to_utm(pdf_ring, easting_transform, northing_transform)
        geo_ring = utm_ring_to_wgs84(utm_ring)
        area_m2 = polygon_area_square_meters(utm_ring)
        bounds = polygon_bounds(geo_ring)

    feature = {
        "type": "Feature",
        "properties": {
            "bairro_id": bairro_id,
            "bairro_nome": bairro_nome,
            "source_pdf": pdf_path.name,
            "area_m2": round(area_m2, 2),
            "vertex_count": len(geo_ring),
            "grid_easting_gcps": easting_gcps,
            "grid_northing_gcps": northing_gcps,
            "grid_easting_max_residual_m": round(easting_transform.max_residual, 4),
            "grid_northing_max_residual_m": round(northing_transform.max_residual, 4),
            "path_color_distance": round(color_dist, 6),
            "path_item_count": item_count,
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [geo_ring],
        },
    }

    report_row = {
        "bairro_id": bairro_id,
        "bairro_nome": bairro_nome,
        "source_pdf": pdf_path.name,
        "status": "ok",
        "grid_easting_gcps": easting_gcps,
        "grid_northing_gcps": northing_gcps,
        "grid_easting_max_residual_m": round(easting_transform.max_residual, 6),
        "grid_northing_max_residual_m": round(northing_transform.max_residual, 6),
        "path_item_count": item_count,
        "path_color_distance": round(color_dist, 8),
        "vertex_count": len(geo_ring),
        "area_m2": round(area_m2, 2),
        "min_lon": round(bounds[0], 8),
        "min_lat": round(bounds[1], 8),
        "max_lon": round(bounds[2], 8),
        "max_lat": round(bounds[3], 8),
        "warning": (
            "grid_residual_above_threshold"
            if max(easting_transform.max_residual, northing_transform.max_residual) > MAX_ACCEPTABLE_RESIDUAL_M
            else ""
        ),
        "error": "",
    }

    return feature, report_row


def write_geojson(features: list[dict]) -> None:
    collection = {
        "type": "FeatureCollection",
        "name": "bairros_codem_extracted",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
        },
        "features": features,
    }
    OUTPUT_GEOJSON.write_text(
        json.dumps(collection, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def write_report(rows: list[dict]) -> None:
    fieldnames = [
        "bairro_id",
        "bairro_nome",
        "source_pdf",
        "status",
        "grid_easting_gcps",
        "grid_northing_gcps",
        "grid_easting_max_residual_m",
        "grid_northing_max_residual_m",
        "path_item_count",
        "path_color_distance",
        "vertex_count",
        "area_m2",
        "min_lon",
        "min_lat",
        "max_lon",
        "max_lat",
        "warning",
        "error",
    ]
    with OUTPUT_REPORT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    pdf_paths = sorted(PDF_DIR.glob("*.pdf"))
    if not pdf_paths:
        print(f"Nenhum PDF encontrado em {PDF_DIR}")
        return 1

    features: list[dict] = []
    report_rows: list[dict] = []

    print(f"Processando {len(pdf_paths)} PDFs de bairros da CODEM...\n")

    for index, pdf_path in enumerate(pdf_paths, start=1):
        bairro_id, bairro_nome = parse_filename(pdf_path)
        label = f"{bairro_id} {bairro_nome}".strip()
        try:
            feature, report_row = process_pdf(pdf_path)
            features.append(feature)
            report_rows.append(report_row)
            print(
                f"[{index:02d}/{len(pdf_paths)}] OK  {label} | "
                f"residuos=({report_row['grid_easting_max_residual_m']:.3f}m, "
                f"{report_row['grid_northing_max_residual_m']:.3f}m) | "
                f"vertices={report_row['vertex_count']}"
            )
        except Exception as exc:
            report_rows.append(
                {
                    "bairro_id": bairro_id,
                    "bairro_nome": bairro_nome,
                    "source_pdf": pdf_path.name,
                    "status": "error",
                    "grid_easting_gcps": "",
                    "grid_northing_gcps": "",
                    "grid_easting_max_residual_m": "",
                    "grid_northing_max_residual_m": "",
                    "path_item_count": "",
                    "path_color_distance": "",
                    "vertex_count": "",
                    "area_m2": "",
                    "min_lon": "",
                    "min_lat": "",
                    "max_lon": "",
                    "max_lat": "",
                    "warning": "",
                    "error": str(exc),
                }
            )
            print(f"[{index:02d}/{len(pdf_paths)}] ERRO {label} | {exc}")
        finally:
            gc.collect()

    write_geojson(features)
    write_report(report_rows)

    ok_count = sum(1 for row in report_rows if row["status"] == "ok")
    error_count = len(report_rows) - ok_count
    print("\nResumo:")
    print(f"  Sucessos: {ok_count}")
    print(f"  Erros   : {error_count}")
    print(f"  GeoJSON : {OUTPUT_GEOJSON}")
    print(f"  CSV     : {OUTPUT_REPORT}")
    return 0 if ok_count else 1


if __name__ == "__main__":
    raise SystemExit(main())
