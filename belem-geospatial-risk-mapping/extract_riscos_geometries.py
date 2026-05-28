"""
extract_riscos_geometries.py
Processa em lote todos os PDFs de risco geológico na pasta pdfs/riscos-geologicos/,
extrai a geometria vetorial da área de risco (polígono laranja), georreferencia
usando os metadados do GeoPDF (/VP e /GPTS) e extrai todas as propriedades
textuais (endereço, descrição, tipologia, população, equipe, data, etc.)
padronizando os nomes de bairros conforme belem_bairros_supremo.geojson.

Gera o arquivo final: belem_maps/belem_riscos_geologicos.geojson
"""

import csv
import json
import re
import sys
import unicodedata
import difflib
from pathlib import Path
import fitz  # PyMuPDF
from shapely.geometry import Polygon, mapping, shape

# Força UTF-8 no stdout (evita UnicodeEncodeError no terminal Windows)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# --- Configurações ---
BASE_DIR = Path(__file__).resolve().parent
PDF_DIR = BASE_DIR / "pdfs" / "riscos-geologicos"
REFERENCE_GEOJSON = BASE_DIR / "belem_bairros_supremo.geojson"
OUTPUT_GEOJSON = BASE_DIR / "belem_riscos_geologicos.geojson"
OUTPUT_REPORT = BASE_DIR / "riscos_geologicos_report.csv"

# --- Normalização e Padronização de Bairros ---
def normalize_string(s):
    if not s:
        return ""
    # Caixa baixa, remove acentos e caracteres especiais
    s = s.lower()
    s = "".join(c for c in unicodedata.normalize('NFKD', s) if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    s = re.sub(r'\b(bairro|bairros|distrito de|ilha de|ilha do|ilha dos|ilha da|complementar)\b', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def load_official_bairros():
    bairros = []
    bairros_sorted = []
    if not REFERENCE_GEOJSON.exists():
        print(f"Aviso: {REFERENCE_GEOJSON.name} não encontrado para padronização de bairros.")
        return bairros, bairros_sorted

    with open(REFERENCE_GEOJSON, encoding="utf-8") as f:
        data = json.load(f)
        
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        nome = props.get("bairro_nome")
        b_id = props.get("bairro_id")
        is_bg = props.get("is_background", False)
        if nome and b_id:
            bairros.append({
                "id": b_id,
                "nome": nome,
                "is_bg": is_bg,
                "geom": shape(feature["geometry"]),
                "norm_name": normalize_string(nome)
            })
            
    bairros_sorted = sorted(bairros, key=lambda x: len(x["norm_name"]), reverse=True)
    return bairros, bairros_sorted

def find_text_match(location, bairros_sorted):
    if not location:
        return None
    norm_loc = normalize_string(location)
    for b in bairros_sorted:
        if b["is_bg"]:
            continue
        if b["norm_name"] and re.search(r'\b' + re.escape(b["norm_name"]) + r'\b', norm_loc):
            return b
    for b in bairros_sorted:
        if not b["is_bg"]:
            continue
        if b["norm_name"] and re.search(r'\b' + re.escape(b["norm_name"]) + r'\b', norm_loc):
            return b
    return None

def resolve_bairro(location, poly_geom, bairros, bairros_sorted):
    centroid = poly_geom.centroid
    
    # 1. Busca Espacial em bairros específicos
    spatial_match = None
    for b in bairros:
        if not b["is_bg"] and b["geom"].contains(centroid):
            spatial_match = b
            break
            
    # 2. Busca Espacial em limites de background (Mosqueiro, Outeiro/Caratateua, Cotijuba)
    if not spatial_match:
        for b in bairros:
            if b["is_bg"] and b["geom"].contains(centroid):
                spatial_match = b
                break
                
    # 3. Busca por Texto
    text_match = find_text_match(location, bairros_sorted)
    
    # 4. Decisão Híbrida
    if spatial_match and not spatial_match["is_bg"]:
        return spatial_match["nome"], spatial_match["id"]
    elif spatial_match and spatial_match["is_bg"]:
        # Se estiver em um limite background, vê se o texto indica um bairro específico contido nesse limite
        if text_match and not text_match["is_bg"] and text_match["geom"].intersects(spatial_match["geom"]):
            return text_match["nome"], text_match["id"]
        else:
            return spatial_match["nome"], spatial_match["id"]
    else:
        # Sem contenção espacial
        if text_match:
            return text_match["nome"], text_match["id"]
        else:
            # Fallback heurístico para nome do bairro
            island_match = re.search(r'(Ilha de\s+\w+|Ilha do\s+\w+|Ilha dos\s+\w+|Ilha Nova)', location, re.IGNORECASE)
            if island_match:
                bairro_nome = island_match.group(1).strip()
            else:
                bairro_nome = location.split("-")[0].split(",")[0].strip()
                bairro_nome = re.sub(r'^(Bairros?:|Distrito de|Passagem|Avenida|Praia|Rua)\s*', '', bairro_nome, flags=re.IGNORECASE).strip()
            return bairro_nome, "N/A"

# --- Extração de Metadados Textuais ---
def clean_text_spaces(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFKC', text)
    text = text.replace('\u2003', ' ')
    return re.sub(r'\s+', ' ', text).strip()

def extract_metadata(text):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    
    sector_id = None
    sector_idx = -1
    for idx, line in enumerate(lines):
        if re.search(r'PA_BELEM_SR_\d+_CPRM', line):
            sector_id = re.search(r'PA_BELEM_SR_\d+_CPRM', line).group(0)
            sector_idx = idx
            break
            
    if sector_idx == -1:
        return None
        
    date = lines[sector_idx + 1] if sector_idx + 1 < len(lines) else ""
    location = lines[sector_idx + 2] if sector_idx + 2 < len(lines) else ""
    
    full_text = "\n".join(lines)
    full_text_clean = clean_text_spaces(full_text)
    
    # Descrição
    desc_match = re.search(r'Descri[çc][ãa]o:\s*(.*?)(?=___|Tipologia|Quantidade|$)', full_text_clean)
    description = desc_match.group(1).strip() if desc_match else ""
    
    # Tipologia
    tipo_match = re.search(r'Tipologia do Processo:\s*(.*?)(?=___|Quantidade|$)', full_text_clean)
    tipologia = tipo_match.group(1).strip() if tipo_match else ""
    
    # Imóveis em Risco
    imoveis_match = re.search(r'Quantidade de im[óo]veis em risco:\s*(\d+)', full_text_clean)
    imoveis = int(imoveis_match.group(1)) if imoveis_match else 0
    
    # Pessoas em Risco
    pessoas_match = re.search(r'Quantidade de pessoas em risco:\s*(\d+)', full_text_clean)
    pessoas = int(pessoas_match.group(1)) if pessoas_match else 0
    
    # Grau de Risco
    grau_match = re.search(r'Grau de risco:\s*(.*?)(?=___|Sugest|$)', full_text_clean)
    grau = grau_match.group(1).strip() if grau_match else ""
    
    # Sugestões de Intervenção
    sugestoes = []
    sug_start = text.find("Sugestões de intervenção:")
    if sug_start == -1:
        sug_start = text.find("Sugestoes de intervencao:")
        
    if sug_start != -1:
        sug_end = len(text)
        for term in ["Notas:", "Legenda", "Equipe Técnica", "Equipe Tecnica"]:
            term_pos = text.find(term, sug_start)
            if term_pos != -1 and term_pos < sug_end:
                sug_end = term_pos
                
        sug_block = text[sug_start:sug_end]
        parts = sug_block.split("•")
        for part in parts[1:]:
            cleaned_part = clean_text_spaces(part)
            for copyright_term in ["Google Earth", "Airbus", "Google"]:
                if copyright_term in cleaned_part:
                    cleaned_part = cleaned_part.split(copyright_term)[0].strip()
            if cleaned_part:
                sugestoes.append(cleaned_part)
                
    # Notas
    notas = []
    notas_start = text.find("Notas:")
    if notas_start != -1:
        notas_end = len(text)
        for term in ["Legenda", "Equipe Técnica", "Equipe Tecnica"]:
            term_pos = text.find(term, notas_start)
            if term_pos != -1 and term_pos < notas_end:
                notas_end = term_pos
        notas_block = text[notas_start:notas_end]
        # Notas costumam ser numeradas: 1 -, 2 -, etc.
        parts = re.split(r'\n\s*\d+\s*-\s*', notas_block)
        for part in parts[1:]:
            cleaned_part = clean_text_spaces(part)
            if cleaned_part:
                notas.append(cleaned_part)
                
    # Equipe Técnica
    equipe = []
    eq_start = text.find("Equipe Técnica")
    if eq_start == -1:
        eq_start = text.find("Equipe Tecnica")
    if eq_start != -1:
        eq_block = text[eq_start:]
        eq_lines = [l.strip() for l in eq_block.splitlines() if l.strip()]
        for el in eq_lines[1:]:
            if any(term in el for term in ["Google", "Legenda", "Notas"]):
                continue
            equipe.append(clean_text_spaces(el))
            
    # Extração heurística do Bairro
    bairro_extraido = ""
    b_match = re.search(r'Bairro\s+([^-\n]+)', location)
    if b_match:
        bairro_extraido = b_match.group(1).strip()
    else:
        # Tenta pegar a penúltima parte antes de "Ilha" ou similar
        parts = [p.strip() for p in location.split("-")]
        for part in parts:
            if "Bairro" in part:
                bairro_extraido = part.replace("Bairro", "").strip()
                break
                
    return {
        "sector_id": sector_id,
        "date": date,
        "location": location,
        "bairro_extracted": bairro_extraido,
        "description": description,
        "tipologia": tipologia,
        "imoveis_risco": imoveis,
        "pessoas_risco": pessoas,
        "grau_risco": grau,
        "sugestoes": sugestoes,
        "notas": notas,
        "equipe": equipe
    }

# --- Georreferenciamento ---
def extract_geopdf_params(doc, page):
    page_source = doc.xref_object(page.xref)
    vp_match = re.search(r'/VP\s*\[\s*(\d+)\s+0\s+R\s*\]', page_source)
    if not vp_match:
        vp_match = re.search(r'/VP\s*(\d+)\s+0\s+R', page_source)
        
    if not vp_match:
        return None, "Viewport (/VP) não encontrado."
        
    vp_xref = int(vp_match.group(1))
    vp_source = doc.xref_object(vp_xref)
    
    measure_match = re.search(r'/Measure\s*(\d+)\s+0\s+R', vp_source)
    if not measure_match:
        return None, "Measure não encontrado no viewport."
        
    measure_xref = int(measure_match.group(1))
    measure_source = doc.xref_object(measure_xref)
    
    gpts_match = re.search(r'/GPTS\s*\[\s*([^\]]+)\s*\]', measure_source)
    if not gpts_match:
        return None, "GPTS não encontrado no measure."
        
    gpts_str = gpts_match.group(1).replace('\n', ' ').strip()
    gpts = [float(x) for x in gpts_str.split()]
    
    bbox_match = re.search(r'/BBox\s*\[\s*([^\]]+)\s*\]', vp_source)
    if not bbox_match:
        return None, "BBox não encontrado no viewport."
        
    bbox_str = bbox_match.group(1).replace('\n', ' ').strip()
    bbox = [float(x) for x in bbox_str.split()]
    
    return {"gpts": gpts, "bbox": bbox}, None

# --- Execução Principal ---
def main():
    print("Iniciando processamento das áreas de risco geológico de Belém...")
    
    bairros, bairros_sorted = load_official_bairros()
    print(f"Carregados {len(bairros)} bairros oficiais para padronização.")
    
    pdf_paths = sorted(PDF_DIR.glob("*.pdf"))
    # Filtra apenas arquivos de setores de risco (ignora o A3-Indice.pdf)
    pdf_paths = [p for p in pdf_paths if "PA_BELEM_SR_" in p.name]
    
    if not pdf_paths:
        print(f"Erro: Nenhum PDF de setor de risco encontrado em: {PDF_DIR}")
        sys.exit(1)
        
    print(f"Total de PDFs para processar: {len(pdf_paths)}")
    
    features = []
    report_rows = []
    
    for idx, path in enumerate(pdf_paths, start=1):
        filename = path.name
        try:
            doc = fitz.open(path)
            page = doc[0]
            
            # 1. Extração de Metadados
            text = page.get_text()
            meta = extract_metadata(text)
            if not meta:
                raise ValueError("Incapaz de extrair metadados do texto da página")
                
            # Padroniza bairro (adiado até termos a geometria para busca espacial)
            
            # 2. Extração de Parâmetros GeoPDF
            geo_params, err = extract_geopdf_params(doc, page)
            if err:
                raise ValueError(f"Erro no Georreferenciamento: {err}")
                
            bbox = geo_params["bbox"]
            gpts = geo_params["gpts"]
            
            # Parâmetros de mapeamento
            lon_min = gpts[1] # lon_tl
            lon_max = gpts[7] # lon_tr
            w_page = bbox[2] - bbox[0]
            
            lat_min = gpts[2] # lat_bl
            lat_max = gpts[0] # lat_tl
            h_page = bbox[3] - bbox[1]
            
            def pdf_to_wgs84(x, y):
                x_rel = x - bbox[0]
                # Inverte o eixo y: y=0 no topo do viewport corresponde a lat_max, e y=h_page na base corresponde a lat_min
                y_user = bbox[3] - y
                y_rel = y_user - bbox[1]
                lon = lon_min + (x_rel / w_page) * (lon_max - lon_min)
                lat = lat_min + (y_rel / h_page) * (lat_max - lat_min)
                return lon, lat

            # 3. Extração e conversão da geometria vetorial (polígono laranja ou vermelho)
            drawings = page.get_drawings()
            orange_drawing = None
            for d in drawings:
                color = d.get("color")
                rect = d.get("rect")
                if color and rect:
                    r, g, b = color
                    # Assinatura de cor laranja/amarelo (Alto) ou vermelho (Muito Alto)
                    # E que esteja dentro do map viewport (excluindo a legenda no rodapé)
                    if r > 0.8 and b < 0.3 and rect.y1 < 580 and rect.x0 > 220 and rect.x1 < 880:
                        orange_drawing = d
                        break
                        
            if not orange_drawing:
                raise ValueError("Polígono de contorno (laranja/vermelho) do setor de risco não encontrado")
                
            # Extração de vértices
            raw_vertices = []
            for item in orange_drawing['items']:
                item_type = item[0]
                if item_type == 'l':
                    raw_vertices.append(item[1])
                    raw_vertices.append(item[2])
                elif item_type == 'c':
                    raw_vertices.append(item[1])
                    raw_vertices.append(item[4])
                elif item_type == 'qu':
                    quad = item[1]
                    raw_vertices.extend([quad.ul, quad.ur, quad.lr, quad.ll, quad.ul])
                elif item_type == 're':
                    rect = item[1]
                    raw_vertices.extend([
                        fitz.Point(rect.x0, rect.y0),
                        fitz.Point(rect.x1, rect.y0),
                        fitz.Point(rect.x1, rect.y1),
                        fitz.Point(rect.x0, rect.y1),
                        fitz.Point(rect.x0, rect.y0)
                    ])
                    
            unique_vertices = []
            for pt in raw_vertices:
                candidate = (pt.x, pt.y)
                if not unique_vertices or candidate != unique_vertices[-1]:
                    unique_vertices.append(candidate)
            
            if len(unique_vertices) > 0 and unique_vertices[0] != unique_vertices[-1]:
                unique_vertices.append(unique_vertices[0])
                
            if len(unique_vertices) < 4:
                raise ValueError(f"Vértices insuficientes para formar um polígono: {len(unique_vertices)}")
                
            # Converte para WGS84
            wgs84_coords = [pdf_to_wgs84(x, y) for x, y in unique_vertices]
            poly_geom = Polygon(wgs84_coords)
            
            if not poly_geom.is_valid:
                poly_geom = poly_geom.buffer(0)
                
            # Padroniza bairro usando a geometria e a localização
            bairro_oficial, id_oficial = resolve_bairro(meta["location"], poly_geom, bairros, bairros_sorted)
            meta["bairro_oficial"] = bairro_oficial if bairro_oficial else meta["bairro_extracted"]
            meta["bairro_id"] = id_oficial if id_oficial else "N/A"
            
            # 4. Criação da Feature GeoJSON
            feature = {
                "type": "Feature",
                "properties": {
                    "setor_id": meta["sector_id"],
                    "bairro_nome": meta["bairro_oficial"],
                    "bairro_id": meta["bairro_id"],
                    "bairro_original": meta["bairro_extracted"],
                    "localizacao": meta["location"],
                    "data_referencia": meta["date"],
                    "tipologia": meta["tipologia"],
                    "grau_risco": meta["grau_risco"],
                    "imoveis_em_risco": meta["imoveis_risco"],
                    "pessoas_em_risco": meta["pessoas_risco"],
                    "descricao": meta["description"],
                    "sugestoes_intervencao": meta["sugestoes"],
                    "notas": meta["notas"],
                    "equipe_tecnica": meta["equipe"],
                    "pdf_origem": filename,
                    "vertices": len(wgs84_coords)
                },
                "geometry": mapping(poly_geom)
            }
            
            features.append(feature)
            
            # Adiciona ao CSV de relatório
            report_rows.append({
                "setor_id": meta["sector_id"],
                "bairro_original": meta["bairro_extracted"],
                "bairro_oficial": meta["bairro_oficial"],
                "bairro_id": meta["bairro_id"],
                "status": "ok",
                "grau_risco": meta["grau_risco"],
                "tipologia": meta["tipologia"],
                "vertices": len(wgs84_coords),
                "error": ""
            })
            
            print(f"[{idx:03d}/{len(pdf_paths)}] OK  {meta['sector_id']} -> Bairro: {meta['bairro_oficial']} (ID: {meta['bairro_id']})")
            
        except Exception as e:
            import traceback
            tb_str = traceback.format_exc()
            report_rows.append({
                "setor_id": filename.replace(".pdf", ""),
                "bairro_original": "N/A",
                "bairro_oficial": "N/A",
                "bairro_id": "N/A",
                "status": "error",
                "grau_risco": "N/A",
                "tipologia": "N/A",
                "vertices": 0,
                "error": str(e)
            })
            print(f"[{idx:03d}/{len(pdf_paths)}] ERRO {filename} -> {e}")
            print(tb_str)
            
        finally:
            doc.close()
            
    # 5. Escrita do GeoJSON final
    geojson_collection = {
        "type": "FeatureCollection",
        "name": "belem_riscos_geologicos",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": features
    }
    
    with open(OUTPUT_GEOJSON, "w", encoding="utf-8") as f:
        json.dump(geojson_collection, f, ensure_ascii=False, indent=2)
        
    # 6. Escrita do Relatório CSV
    with open(OUTPUT_REPORT, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["setor_id", "bairro_original", "bairro_oficial", "bairro_id", "status", "grau_risco", "tipologia", "vertices", "error"])
        writer.writeheader()
        writer.writerows(report_rows)
        
    print("\nProcessamento Concluído!")
    print(f"  GeoJSON consolidado: {OUTPUT_GEOJSON}")
    print(f"  Relatório de extração: {OUTPUT_REPORT}")
    
    sucessos = sum(1 for r in report_rows if r["status"] == "ok")
    erros = len(pdf_paths) - sucessos
    print(f"  Sucessos: {sucessos} | Erros: {erros}")

if __name__ == "__main__":
    main()
