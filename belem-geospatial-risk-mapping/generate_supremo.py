import json
import re
import sys
import traceback
from pathlib import Path
import fitz
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, LineString
from shapely.ops import unary_union, polygonize

# Add current directory to path
BELEM_MAPS_DIR = Path(__file__).resolve().parent
sys.path.append(str(BELEM_MAPS_DIR))

import extract_codem_geometries
from extract_codem_geometries import (
    extract_grid_transforms,
    points_from_item,
    TO_WGS84
)

# Configure relaxed regexes for coordinate extraction on islands
extract_codem_geometries.EASTING_RE = re.compile(r"^\d{6}(?:,000000)?$")
extract_codem_geometries.NORTHING_RE = re.compile(r"^\d{7}(?:,000000)?$")

PDF_DIR = BELEM_MAPS_DIR / "pdfs" / "bairros"
INPUT_GEOJSON = BELEM_MAPS_DIR / "bairros_codem_extracted.geojson"
OUTPUT_GEOJSON = BELEM_MAPS_DIR / "belem_bairros_supremo.geojson"

import pyproj
from shapely.ops import transform

TO_UTM = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:31982", always_xy=True).transform

def calculate_area_m2(geom):
    """Calculates area of a WGS84 geometry in square meters by projecting it to UTM."""
    if geom.is_empty:
        return 0.0
    return transform(TO_UTM, geom).area

def georeference_polygon(poly, easting_transform, northing_transform):
    """Transforms a Shapely Polygon or MultiPolygon from PDF space to WGS84."""
    if poly.geom_type == 'MultiPolygon':
        parts = []
        for part in poly.geoms:
            parts.append(georeference_polygon(part, easting_transform, northing_transform))
        return MultiPolygon(parts)
        
    # Transform exterior
    ext_coords = []
    for x, y in poly.exterior.coords:
        utm_x = easting_transform.apply(x)
        utm_y = northing_transform.apply(y)
        lon, lat = TO_WGS84.transform(utm_x, utm_y)
        ext_coords.append((lon, lat))
        
    # Transform interiors
    int_coords = []
    for interior in poly.interiors:
        int_pts = []
        for x, y in interior.coords:
            utm_x = easting_transform.apply(x)
            utm_y = northing_transform.apply(y)
            lon, lat = TO_WGS84.transform(utm_x, utm_y)
            int_pts.append((lon, lat))
        int_coords.append(int_pts)
        
    return Polygon(ext_coords, int_coords)

def extract_island_geometry(pdf_path: Path):
    print(f"Extracting geometry from: {pdf_path.name}")
    doc = fitz.open(pdf_path)
    page = doc[0]
    
    # 1. Get georeferencing transforms
    easting_transform, northing_transform, easting_gcps, northing_gcps = extract_grid_transforms(page)
    print(f"  Georeferenced with {easting_gcps} easting GCPs, {northing_gcps} northing GCPs")
    
    # 2. Extract drawings with green fill color
    GREEN_FILL = (0.450980007648468, 0.6980400085449219, 0.450980007648468)
    green_polys = []
    
    for d in page.get_drawings():
        fill = d.get("fill")
        rect = d.get("rect")
        # Ignore drawings outside the page bounds or in the bottom template (y > 2800)
        if rect and (rect.y0 > 2800 or rect.x0 > page.rect.width):
            continue
            
        if fill is not None and isinstance(fill, (list, tuple)) and len(fill) == 3:
            dist = sum((fill[j] - GREEN_FILL[j])**2 for j in range(3))**0.5
            if dist < 0.01:
                items = d.get("items", [])
                points = []
                for item in items:
                    for pt in points_from_item(item):
                        candidate = (pt[0], pt[1])
                        if not points or candidate != points[-1]:
                            points.append(candidate)
                            
                if len(points) >= 3:
                    if points[0] != points[-1]:
                        points.append(points[0])
                    poly = Polygon(points)
                    if not poly.is_valid:
                        poly = poly.buffer(0)
                    green_polys.append(poly)
                    
    if not green_polys:
        raise ValueError(f"No valid green-filled geometries found in {pdf_path.name}")
        
    union_poly = unary_union(green_polys)
    if not union_poly.is_valid:
        union_poly = union_poly.buffer(0)
        
    geo_poly = georeference_polygon(union_poly, easting_transform, northing_transform)
    print(f"  Successfully constructed geometry: {geo_poly.geom_type} with area {geo_poly.area:.8f}")
    return geo_poly

def clean_geometry(geom, area_threshold=0.000005):
    """Filters out tiny sliver polygons from a Polygon or MultiPolygon."""
    if geom.is_empty:
        return geom
    if isinstance(geom, Polygon):
        return geom if geom.area >= area_threshold else Polygon()
    elif isinstance(geom, MultiPolygon):
        parts = [p for p in geom.geoms if p.area >= area_threshold]
        if not parts:
            return Polygon()
        return parts[0] if len(parts) == 1 else MultiPolygon(parts)
    return geom

def count_vertices(geom):
    if geom.is_empty:
        return 0
    if hasattr(geom, "geoms"):
        return sum(count_vertices(g) for g in geom.geoms)
    return len(geom.exterior.coords) + sum(len(interior.coords) for interior in geom.interiors)

def main():
    if not INPUT_GEOJSON.exists():
        print(f"Error: {INPUT_GEOJSON} not found. Run extract_codem_geometries.py first.")
        sys.exit(1)
        
    print("Loading existing neighborhood shapes...")
    with open(INPUT_GEOJSON, encoding="utf-8") as f:
        data = json.load(f)
        
    features = data["features"]
    print(f"Loaded {len(features)} neighborhoods.")
    
    # Map neighborhoods by ID for easy access
    bairros_by_id = {f["properties"]["bairro_id"]: f for f in features}
    
    # Extract geometries of the 4 islands
    islands = {}
    for name in ["Ilha-de-Caratateua.pdf", "Ilha-de-Cotijuba.pdf", "Ilha-de-Mosqueiro.pdf", "Ilha-do-Combu.pdf"]:
        path = PDF_DIR / name
        if not path.exists():
            print(f"Warning: Island file {name} not found in pdfs directory.")
            continue
        try:
            islands[name] = extract_island_geometry(path)
        except Exception as e:
            print(f"Error extracting {name}: {e}")
            traceback.print_exc()
            
    # Process 1: Ilha do Combu (has no neighborhoods)
    if "Ilha-do-Combu.pdf" in islands:
        combu_geom = islands["Ilha-do-Combu.pdf"]
        combu_feature = {
            "type": "Feature",
            "properties": {
                "bairro_id": "081",
                "bairro_nome": "Ilha do Combu",
                "source_pdf": "Ilha-do-Combu.pdf",
                "area_m2": round(calculate_area_m2(combu_geom), 2),
                "vertex_count": 0,
                "notes": "Representação completa da Ilha do Combu"
            },
            "geometry": mapping(combu_geom)
        }
        features.append(combu_feature)
        print("Added feature: Ilha do Combu")
        
    # Process 2: Ilha de Cotijuba (has no neighborhoods)
    if "Ilha-de-Cotijuba.pdf" in islands:
        cotijuba_geom = islands["Ilha-de-Cotijuba.pdf"]
        cotijuba_feature = {
            "type": "Feature",
            "properties": {
                "bairro_id": "082",
                "bairro_nome": "Ilha de Cotijuba",
                "source_pdf": "Ilha-de-Cotijuba.pdf",
                "area_m2": round(calculate_area_m2(cotijuba_geom), 2),
                "vertex_count": 0,
                "notes": "Representação completa da Ilha de Cotijuba"
            },
            "geometry": mapping(cotijuba_geom)
        }
        features.append(cotijuba_feature)
        print("Added feature: Ilha de Cotijuba")
        
    # Process 3: Ilha de Caratateua (Outeiro) Limit
    # We use the complete PDF-extracted shape as a background outline layer
    caratateua_limit_feature = None
    if "Ilha-de-Caratateua.pdf" in islands:
        caratateua_geom = islands["Ilha-de-Caratateua.pdf"]
        caratateua_limit_feature = {
            "type": "Feature",
            "properties": {
                "bairro_id": "904",
                "bairro_nome": "Ilha de Caratateua (Limite)",
                "source_pdf": "Ilha-de-Caratateua.pdf",
                "area_m2": round(calculate_area_m2(caratateua_geom), 2),
                "vertex_count": 0,
                "is_background": True,
                "notes": "Contorno completo da ilha (extraído via PDF CODEM)"
            },
            "geometry": mapping(caratateua_geom)
        }
        print("Prepared background shape: Ilha de Caratateua (Limite)")

    # Load reference geometries for background island outlines
    REFERENCE_GEOJSON = BELEM_MAPS_DIR.parent / "belem_pa_bairros.geojson"
    background_features = []
    if REFERENCE_GEOJSON.exists():
        print("Loading reference geometries for background island outlines...")
        with open(REFERENCE_GEOJSON, encoding="utf-8") as f:
            ref_data = json.load(f)
        
        # Only load Mosqueiro and Cotijuba from reference (Combu is active-only, Outeiro is PDF-derived)
        island_mapping = {
            "Ilha do Mosqueiro": ("901", "Ilha do Mosqueiro (Limite)"),
            "Ilha Cotijuba": ("902", "Ilha de Cotijuba (Limite)"),
        }
        
        for f in ref_data["features"]:
            name = f["properties"].get("name")
            if name in island_mapping:
                b_id, b_name = island_mapping[name]
                geom = shape(f["geometry"])
                bg_feat = {
                    "type": "Feature",
                    "properties": {
                        "bairro_id": b_id,
                        "bairro_nome": b_name,
                        "source_pdf": "belem_pa_bairros.geojson",
                        "area_m2": round(calculate_area_m2(geom), 2),
                        "vertex_count": 0,
                        "is_background": True,
                        "notes": "Contorno completo da ilha (referência: belem_pa_bairros.geojson)"
                    },
                    "geometry": f["geometry"]
                }
                background_features.append(bg_feat)
                print(f"Added background shape: {b_name}")

    if caratateua_limit_feature:
        background_features.append(caratateua_limit_feature)
        print("Added background shape: Ilha de Caratateua (Limite) [from PDF]")
                
    # Prepend background features so they render below other layers
    features = background_features + features

    # Update properties (vertex counts, etc.) for all features safely
    for f in features:
        geom = shape(f["geometry"])
        f["properties"]["vertex_count"] = count_vertices(geom)
        
    # Write the supreme GeoJSON
    output_collection = {
        "type": "FeatureCollection",
        "name": "belem_bairros_supremo",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
        },
        "features": features
    }
    
    with open(OUTPUT_GEOJSON, "w", encoding="utf-8") as f:
        json.dump(output_collection, f, ensure_ascii=False, indent=2)
        
    print(f"\nSuccessfully generated supreme GeoJSON at: {OUTPUT_GEOJSON}")
    print(f"Total features: {len(features)}")

if __name__ == "__main__":
    main()
