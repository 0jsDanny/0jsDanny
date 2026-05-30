import os
import sys
import sqlite3
import glob
import argparse
import requests
import zipfile
from datetime import datetime, timedelta
from dotenv import load_dotenv
import re
import pdfplumber
import xml.etree.ElementTree as ET
import struct
import urllib.request


# Set console encoding to UTF-8
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "cisc_health.db")
ENV_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", ".env"))

# Load environment variables
load_dotenv(ENV_PATH)

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}")

def clean_float(val_str):
    if not val_str:
        return None
    val_str = val_str.strip()
    if val_str == "" or val_str == "-9999" or val_str == "-9999,0" or val_str == "-9999.0":
        return None
    val_str = val_str.replace(",", ".")
    try:
        return float(val_str)
    except ValueError:
        return None

def convert_datetime(data_str, hora_str):
    if not data_str or not hora_str:
        return None, None
    date_clean = data_str.replace("/", "-").strip()
    
    # Clean time string: extract digits
    time_digits = "".join(c for c in hora_str if c.isdigit())
    if len(time_digits) == 4:
        hh = time_digits[:2]
        mm = time_digits[2:]
    elif len(time_digits) == 2:
        hh = time_digits
        mm = "00"
    elif len(time_digits) == 1:
        hh = "0" + time_digits
        mm = "00"
    elif len(time_digits) == 3:
        hh = "0" + time_digits[0]
        mm = time_digits[1:]
    else:
        if ":" in hora_str:
            parts = hora_str.split(":")
            hh = "".join(c for c in parts[0] if c.isdigit())
            mm = "".join(c for c in parts[1] if c.isdigit())
            hh = f"{int(hh):02d}" if hh else "00"
            mm = f"{int(mm):02d}" if mm else "00"
        else:
            return None, None
            
    datahora_utc_str = f"{date_clean} {hh}:{mm}:00"
    try:
        dt_utc = datetime.strptime(datahora_utc_str, "%Y-%m-%d %H:%M:%S")
        dt_local = dt_utc - timedelta(hours=3)
        datahora_local_str = dt_local.strftime("%Y-%m-%d %H:%M:%S")
        return datahora_utc_str, datahora_local_str
    except Exception:
        return None, None

def extract_station_code(file_path):
    try:
        with open(file_path, "r", encoding="latin-1") as f:
            for _ in range(8):
                line = f.readline()
                if "CODIGO (WMO)" in line:
                    parts = line.strip().split(";")
                    if len(parts) > 1:
                        val = parts[1].strip()
                        if val:
                            return val
    except Exception:
        pass
    return "A201"
# Bairro mappings for standardization (consistent with correlation_analytics.py)
BAIRRO_MAP = {
    "GUAMA": "GUAMÁ",
    "TAPANA": "TAPANÃ",
    "TAPANA (ICOARACI)": "TAPANÃ",
    "TELEGRAFO": "TELÉGRAFO",
    "TELEGRAFO SEM FIO": "TELÉGRAFO",
    "BENGUI": "BENGUÍ",
    "BENGUI (VAL-DE-CANS)": "BENGUÍ",
    "AGUAS LINDAS": "ÁGUAS LINDAS",
    "CREMACAO": "CREMAÇÃO",
    "CRAMACAO": "CREMAÇÃO",
    "CRAMAÇÃO": "CREMAÇÃO",
    "VAL DE CANS": "VAL-DE-CANS",
    "VAL DE CAES": "VAL-DE-CANS",
    "VAL-DE-CAES": "VAL-DE-CANS",
    "VAL DE CANS (ICOARACI)": "VAL-DE-CANS",
    "JURUNAS": "JURUNAS",
    "SACRAMENTA": "SACRAMENTA",
    "CONDOR": "CONDOR",
    "GUANABARA": "GUANABARA",
    "PRATINHA": "PRATINHA",
    "FATIMA": "FÁTIMA",
    "CABANOS": "CABANOS",
    "REDUTO": "REDUTO",
    "BATISTA CAMPOS": "BATISTA CAMPOS",
    "ICOARACI": "ICOARACI",
    "MOSQUEIRO": "MOSQUEIRO",
    "OUTEIRO": "OUTEIRO",
    "MARACUACU": "MARACUAÇU",
    "TENEPA": "TENONÉ",
    "TENONE": "TENONÉ",
    "AGULHA": "AGULHA",
    "CAMPINA": "CAMPINA",
    "SAO BRAS": "SÃO BRÁS",
    "SÃO BRAS": "SÃO BRÁS",
    "MARACUAÇU": "MARACUAÇU",
    "PARQUE GUAJA": "PARQUE GUAJÁ",
    "AURORA": "AURORA",
    "CASTANHEIRA": "CASTANHEIRA",
    "SOUZA": "SOUZA",
    "JADERLANDIA": "JADERLÂNDIA",
    "JADERLANDIA (VAL-DE-CANS)": "JADERLÂNDIA",
    "JADERLANNDIA": "JADERLÂNDIA",
    "JADERLÂNDIA": "JADERLÂNDIA",
    "MARAMBAIA": "MARAMBAIA",
    "COQUEIRO": "COQUEIRO",
    "PEDREIRA": "PEDREIRA",
    "MARCO": "MARCO",
    "MONTESE": "MONTESE",
    "PARQUE VERDE": "PARQUE VERDE",
    "UMARIZAL": "UMARIZAL",
    "BARREIRO": "BARREIRO",
    "MARACANGALHA": "MARACANGALHA",
    "ÁGUAS NEGRAS": "ÁGUAS NEGRAS",
    "AGUAS NEGRAS": "ÁGUAS NEGRAS",
    "ÁGUA NEGRA": "ÁGUAS NEGRAS",
    "AGUA NEGRA": "ÁGUAS NEGRAS",
}

def clean_bairro(b):
    if b is None or not isinstance(b, str):
        return "NÃO INFORMADO"
    b_clean = b.strip().upper()
    b_clean = " ".join(b_clean.split()) # normalize spaces
    if b_clean in BAIRRO_MAP:
        return BAIRRO_MAP[b_clean]
    return b_clean

def load_neighborhood_centroids():
    geojson_path = os.path.join(os.path.dirname(BASE_DIR), "belem_maps", "belem_bairros_supremo.geojson")
    if not os.path.exists(geojson_path):
        geojson_path = os.path.join(os.path.dirname(BASE_DIR), "belem_pa_bairros.geojson")
        
    if not os.path.exists(geojson_path):
        log(f"Warning: GeoJSON file not found for centroids calculation. Using fallback.")
        return [("BELÉM", -48.48, -1.45)]
        
    import json
    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    centroids = []
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        bairro = props.get("bairro_nome") or props.get("name")
        is_bg = props.get("is_background", False)
        
        if is_bg or not bairro or "Limite" in bairro:
            continue
            
        geom = feature.get("geometry", {})
        geom_type = geom.get("type")
        coords = geom.get("coordinates", [])
        
        try:
            from shapely.geometry import shape
            poly = shape(geom)
            centroid = poly.centroid
            centroids.append((bairro.strip().upper(), centroid.x, centroid.y))
        except Exception:
            if geom_type == "Polygon" and coords:
                pts = coords[0]
                xs = [p[0] for p in pts]
                ys = [p[1] for p in pts]
                centroids.append((bairro.strip().upper(), sum(xs)/len(xs), sum(ys)/len(ys)))
            elif geom_type == "MultiPolygon" and coords:
                pts = coords[0][0]
                xs = [p[0] for p in pts]
                ys = [p[1] for p in pts]
                centroids.append((bairro.strip().upper(), sum(xs)/len(xs), sum(ys)/len(ys)))
                
    cleaned_centroids = []
    for b, lon, lat in centroids:
        b_clean = clean_bairro(b)
        cleaned_centroids.append((b_clean, lon, lat))
        
    seen = set()
    deduped = []
    for b, lon, lat in cleaned_centroids:
        if b not in seen:
            seen.add(b)
            deduped.append((b, lon, lat))
            
    return deduped

def get_bairro_from_coords(lon, lat, geojson_data=None):
    if lon is None or lat is None:
        return None
        
    if geojson_data is None:
        geojson_path = os.path.join(os.path.dirname(BASE_DIR), "belem_maps", "belem_bairros_supremo.geojson")
        if not os.path.exists(geojson_path):
            geojson_path = os.path.join(os.path.dirname(BASE_DIR), "belem_pa_bairros.geojson")
        if not os.path.exists(geojson_path):
            return None
        import json
        with open(geojson_path, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)
            
    try:
        from shapely.geometry import Point, shape
        pt = Point(lon, lat)
        for feature in geojson_data.get("features", []):
            props = feature.get("properties", {})
            bairro = props.get("bairro_nome") or props.get("name")
            is_bg = props.get("is_background", False)
            if is_bg or not bairro or "Limite" in bairro:
                continue
                
            geom = shape(feature.get("geometry"))
            if geom.contains(pt):
                return clean_bairro(bairro)
    except Exception:
        pass
    return None

_station_bairro_cache = {}
def get_cached_station_bairro(station_code, lat, lon, geojson_data):
    if not station_code:
        return None
    if station_code in _station_bairro_cache:
        return _station_bairro_cache[station_code]
    b = get_bairro_from_coords(lon, lat, geojson_data)
    _station_bairro_cache[station_code] = b
    return b

def extract_grads_grid_remote(ctl_url, gra_url, target_coords, var_name, z_level_idx=None, sequential=False):
    req_ctl = urllib.request.Request(ctl_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_ctl, timeout=15) as r:
        ctl_text = r.read().decode('utf-8', errors='ignore')
    
    nx, x_start, x_step = parse_ctl_def(ctl_text, 'xdef')
    ny, y_start, y_step = parse_ctl_def(ctl_text, 'ydef')
    vars_list = parse_ctl_vars(ctl_text)
    
    var_idx = -1
    for i, v in enumerate(vars_list):
        if v.split()[0] == var_name.lower():
            var_idx = i
            break
            
    if var_idx == -1:
        raise ValueError(f"Variable '{var_name}' not found in CTL.")
        
    grid_size = nx * ny
    record_size = grid_size * 4
    
    if sequential:
        record_idx = z_level_idx if z_level_idx is not None else 0
        block_offset = record_idx * (4 + record_size + 4) + 4
    else:
        z_offset = z_level_idx if z_level_idx is not None else 0
        block_offset = (var_idx * grid_size + z_offset * grid_size) * 4
        
    block_len = record_size
    
    endian = '<'
    if 'options big_endian' in ctl_text.lower():
        endian = '>'
        
    req_gra = urllib.request.Request(gra_url, headers={
        'User-Agent': 'Mozilla/5.0',
        'Range': f'bytes={block_offset}-{block_offset + block_len - 1}'
    })
    
    with urllib.request.urlopen(req_gra, timeout=15) as r:
        byte_data = r.read()
        
    if len(byte_data) != block_len:
        raise ValueError(f"Expected {block_len} bytes, received {len(byte_data)} bytes.")
        
    grid_vals = list(struct.unpack(f'{endian}{grid_size}f', byte_data))
    
    results = {}
    for name, lon, lat in target_coords:
        col = int((lon - x_start) / x_step + 0.5)
        row = int((lat - y_start) / y_step + 0.5)
        
        if 0 <= col < nx and 0 <= row < ny:
            val = grid_vals[row * nx + col]
            if val < -9.0e33 or val > 9.0e33:
                results[name] = None
            else:
                results[name] = val
        else:
            results[name] = None
            
    return results

# Helpers for CPTEC GrADS Remote Parsing
def parse_ctl_def(ctl_text, axis_name):
    for line in ctl_text.splitlines():
        line_clean = line.strip().lower()
        if line_clean.startswith(axis_name):
            parts = line_clean.split()
            if len(parts) >= 5:
                count = int(parts[1])
                start_val = float(parts[3])
                step_val = float(parts[4])
                return count, start_val, step_val
    raise ValueError(f"Definition of {axis_name} not found in CTL.")

def parse_ctl_vars(ctl_text):
    vars_list = []
    in_vars = False
    for line in ctl_text.splitlines():
        line_clean = line.strip().lower()
        if line_clean.startswith("vars"):
            in_vars = True
            continue
        if line_clean.startswith("endvars"):
            in_vars = False
            break
        if in_vars:
            parts = line_clean.split()
            if len(parts) > 0:
                var_name = parts[0].split("=>")[0]
                vars_list.append(var_name)
    return vars_list

def extract_grads_val_remote(ctl_url, gra_url, target_lon, target_lat, var_name, z_level_idx=None, sequential=False):
    req_ctl = urllib.request.Request(ctl_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_ctl, timeout=15) as r:
        ctl_text = r.read().decode('utf-8', errors='ignore')
    
    nx, x_start, x_step = parse_ctl_def(ctl_text, 'xdef')
    ny, y_start, y_step = parse_ctl_def(ctl_text, 'ydef')
    vars_list = parse_ctl_vars(ctl_text)
    
    col = int((target_lon - x_start) / x_step + 0.5)
    row = int((target_lat - y_start) / y_step + 0.5)
    
    if not (0 <= col < nx and 0 <= row < ny):
        raise ValueError(f"Target coordinates ({target_lon}, {target_lat}) outside grid bounds.")
        
    var_idx = -1
    for i, v in enumerate(vars_list):
        if v.split()[0] == var_name.lower():
            var_idx = i
            break
            
    if var_idx == -1:
        raise ValueError(f"Variable '{var_name}' not found in CTL.")
        
    grid_size = nx * ny
    
    # Calculate bytes offset
    if sequential:
        # options sequential: Fortran sequential files wrap each record with a 4-byte header and footer.
        # Record size = grid_size * 4 bytes
        # Each record offset = record_idx * (4 + record_size + 4) + 4
        # Since 'us' (soil moisture) has 8 levels, each level is a record of size grid_size * 4.
        record_idx = z_level_idx if z_level_idx is not None else 0
        record_size = grid_size * 4
        offset = record_idx * (4 + record_size + 4) + 4 + (row * nx + col) * 4
    else:
        # Standard flat binary: preceding variables + level offset + grid cell
        # For 3D variables, we assume surface level (index 0) if z_level_idx is not specified.
        z_offset = z_level_idx if z_level_idx is not None else 0
        offset = (var_idx * grid_size + z_offset * grid_size + (row * nx + col)) * 4
        
    endian = '<'
    if 'options big_endian' in ctl_text.lower():
        endian = '>'
        
    req_gra = urllib.request.Request(gra_url, headers={
        'User-Agent': 'Mozilla/5.0',
        'Range': f'bytes={offset}-{offset+3}'
    })
    
    with urllib.request.urlopen(req_gra, timeout=15) as r:
        byte_data = r.read()
        
    if len(byte_data) != 4:
        raise ValueError(f"Expected 4 bytes, received {len(byte_data)} bytes.")
        
    val = struct.unpack(f'{endian}f', byte_data)[0]
    # Handle undef value (GrADS missing value)
    if val < -9.0e33 or val > 9.0e33:
        return None
    return val

# ---------------------------------------------------------
# 1. INMET Processor
# ---------------------------------------------------------
def process_inmet(conn):
    log("Processing INMET (portal.inmet.gov.br_dadoshistoricos)...")
    cursor = conn.cursor()
    
    inmet_dir = os.path.join(BASE_DIR, "raw_data", "climate", "portal.inmet.gov.br_dadoshistoricos")
    if not os.path.exists(inmet_dir):
        log(f"Error: INMET directory not found at {inmet_dir}")
        return
        
    csv_files = glob.glob(os.path.join(inmet_dir, "*A201_BELEM*.CSV"))
    if not csv_files:
        log(f"No INMET A201 Belém CSV files found in {inmet_dir}")
        return
        
    insert_sql = """
        INSERT OR IGNORE INTO clima_inmet_horario (
            estacao_codigo, datahora_utc, datahora_local, chuva_mm,
            temperatura_seco_c, temperatura_orvalho_c, temperatura_maxima_c, temperatura_minima_c,
            umidade_relativa_pct, umidade_maxima_pct, umidade_minima_pct, pressao_atmosferica_mb,
            radiacao_global_kj_m2, vento_direcao_gr, vento_velocidade_ms, vento_rajada_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    total_inserted = 0
    
    for file_path in csv_files:
        log(f"Reading file: {os.path.basename(file_path)}")
        station_code = extract_station_code(file_path)
        
        with open(file_path, "r", encoding="latin-1") as f:
            lines = f.readlines()
            
        if len(lines) <= 9:
            log(f"File {os.path.basename(file_path)} has no data rows.")
            continue
            
        # Line 9 is the header (index 8), data starts at Line 10 (index 9)
        data_lines = lines[9:]
        
        file_inserted = 0
        for line in data_lines:
            row = line.strip().split(";")
            if len(row) < 19:
                continue
                
            data_str = row[0]
            hora_str = row[1]
            if not data_str or not hora_str:
                continue
                
            datahora_utc, datahora_local = convert_datetime(data_str, hora_str)
            if not datahora_utc:
                continue
                
            chuva = clean_float(row[2])
            pressao = clean_float(row[3])
            radiacao = clean_float(row[6])
            temp_seco = clean_float(row[7])
            temp_orvalho = clean_float(row[8])
            temp_max = clean_float(row[9])
            temp_min = clean_float(row[10])
            umidade_max = clean_float(row[13])
            umidade_min = clean_float(row[14])
            umidade_rel = clean_float(row[15])
            vento_dir = clean_float(row[16])
            vento_rajada = clean_float(row[17])
            vento_vel = clean_float(row[18])
            
            vals = (
                station_code,
                datahora_utc,
                datahora_local,
                chuva,
                temp_seco,
                temp_orvalho,
                temp_max,
                temp_min,
                umidade_rel,
                umidade_max,
                umidade_min,
                pressao,
                radiacao,
                vento_dir,
                vento_vel,
                vento_rajada
            )
            
            cursor.execute(insert_sql, vals)
            if cursor.rowcount > 0:
                file_inserted += 1
                
        conn.commit()
        log(f"Inserted {file_inserted} records from {os.path.basename(file_path)}")
        total_inserted += file_inserted
        
    log(f"INMET processing complete. Total records inserted: {total_inserted}")

# Helper to extract zip files in a folder
def extract_zips(directory):
    zip_files = glob.glob(os.path.join(directory, "*.zip"))
    for zf in zip_files:
        try:
            with zipfile.ZipFile(zf, "r") as zip_ref:
                for file_info in zip_ref.infolist():
                    if file_info.filename.endswith(".csv"):
                        zip_ref.extract(file_info, directory)
                        log(f"Extracted {file_info.filename} from {os.path.basename(zf)}")
        except Exception as e:
            log(f"Error extracting zip {os.path.basename(zf)}: {e}")

# Helper to get the last timestamp for a station in the DB
def get_latest_cemaden_utc(cursor, station_code):
    cursor.execute("SELECT MAX(datahora_utc) FROM clima_cemaden_precipitacao WHERE estacao_codigo = ?", (station_code,))
    res = cursor.fetchone()
    if res and res[0]:
        try:
            return datetime.strptime(res[0], "%Y-%m-%d %H:%M:%S")
        except Exception:
            pass
    return datetime(2024, 1, 1, 0, 0, 0)

# Process local CEMADEN files (mainly Cremação)
def process_cemaden_local(cursor, cemaden_dir):
    log("Checking for local CEMADEN CSV files...")
    extract_zips(cemaden_dir)
    
    csv_files = glob.glob(os.path.join(cemaden_dir, "*.csv"))
    if not csv_files:
        log("No local CEMADEN CSV files found.")
        return
        
    # Load GeoJSON data for spatial join mapping
    import json
    geojson_path = os.path.join(os.path.dirname(BASE_DIR), "belem_maps", "belem_bairros_supremo.geojson")
    if not os.path.exists(geojson_path):
        geojson_path = os.path.join(os.path.dirname(BASE_DIR), "belem_pa_bairros.geojson")
    
    geojson_data = None
    if os.path.exists(geojson_path):
        with open(geojson_path, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)

    insert_sql = """
        INSERT OR IGNORE INTO clima_cemaden_precipitacao (
            estacao_codigo, datahora_utc, datahora_local, estacao_nome,
            chuva_mm, intensidade_mm_h, qualificacao, latitude, longitude, bairro_nome
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    total_inserted = 0
    for file_path in csv_files:
        log(f"Reading local CEMADEN CSV: {os.path.basename(file_path)}")
        try:
            with open(file_path, "r", encoding="latin-1") as f:
                header_line = f.readline()
                if "codestacao" not in header_line:
                    # Skip if it is not the local CSV format
                    continue
                
                pivoted = {}
                for line in f:
                    row = line.strip().split(",")
                    if len(row) < 11:
                        continue
                    
                    # Columns: cidade,codestacao,datahora,id_sensor,latitude,longitude,nome,offset,qualificacao,uf,valor
                    est_code = row[1].strip()
                    dt_utc_str = row[2].strip()
                    id_sensor = row[3].strip()
                    lat = clean_float(row[4])
                    lon = clean_float(row[5])
                    est_name = row[6].strip()
                    qual = int(row[8]) if row[8].isdigit() else None
                    val = clean_float(row[10])
                    
                    key = (est_code, dt_utc_str)
                    if key not in pivoted:
                        try:
                            dt_utc = datetime.strptime(dt_utc_str, "%Y-%m-%d %H:%M:%S")
                            dt_local = dt_utc - timedelta(hours=3)
                            dt_local_str = dt_local.strftime("%Y-%m-%d %H:%M:%S")
                        except Exception:
                            continue
                            
                        pivoted[key] = {
                            'estacao_nome': est_name,
                            'datahora_local': dt_local_str,
                            'chuva_mm': None,
                            'intensidade_mm_h': None,
                            'qualificacao': qual,
                            'latitude': lat,
                            'longitude': lon
                        }
                        
                    record = pivoted[key]
                    if id_sensor == '10': # chuva
                        record['chuva_mm'] = val
                    elif id_sensor == '240': # intensidade
                        record['intensidade_mm_h'] = val
                    if qual is not None and record['qualificacao'] is None:
                        record['qualificacao'] = qual
                
                # Insert pivoted records
                file_inserted = 0
                for (est_c, dt_u), r in pivoted.items():
                    bairro_nome = get_cached_station_bairro(est_c, r['latitude'], r['longitude'], geojson_data)
                    vals = (
                        est_c,
                        dt_u,
                        r['datahora_local'],
                        r['estacao_nome'],
                        r['chuva_mm'],
                        r['intensidade_mm_h'],
                        r['qualificacao'],
                        r['latitude'],
                        r['longitude'],
                        bairro_nome
                    )
                    cursor.execute(insert_sql, vals)
                    if cursor.rowcount > 0:
                        file_inserted += 1
                        
                log(f"Inserted {file_inserted} records from {os.path.basename(file_path)}")
                total_inserted += file_inserted
        except Exception as e:
            log(f"Error processing local file {os.path.basename(file_path)}: {e}")
            
    log(f"Local CEMADEN CSV ingestion completed. Total records: {total_inserted}")

# Process CEMADEN API
def process_cemaden_api(conn):
    cursor = conn.cursor()
    
    login = os.getenv("CEMADEN_LOGIN")
    senha = os.getenv("CEMADEN_SENHA")
    if not login or not senha:
        log("Warning: CEMADEN_LOGIN or CEMADEN_SENHA not found in .env. Skipping API fetch.")
        return
        
    url_auth = "https://sgaa.cemaden.gov.br/SGAA/rest/controle-token/tokens"
    headers = {"Content-Type": "application/json"}
    payload = {"email": login, "password": senha}
    
    log("Authenticating with CEMADEN SGAA API...")
    try:
        r = requests.post(url_auth, json=payload, headers=headers, timeout=15)
        if r.status_code != 200:
            log(f"Authentication failed with status code: {r.status_code}. Response: {r.text}")
            return
        token = r.json().get("token")
        if not token:
            log("Authentication token not found in response.")
            return
        log("Authentication successful.")
    except Exception as e:
        log(f"Error during authentication: {e}")
        return
        
    url_stations = "https://sws.cemaden.gov.br/PED/rest/pcds-cadastro/estacoes"
    headers_api = {"token": token}
    params_stations = {"codibge": "1501402"}
    
    log("Fetching Belém stations from API...")
    try:
        r = requests.get(url_stations, headers=headers_api, params=params_stations, timeout=15)
        if r.status_code != 200:
            log(f"Failed to fetch stations. Status: {r.status_code}")
            return
        stations = r.json()
        log(f"Found {len(stations)} stations in Belém.")
    except Exception as e:
        log(f"Error fetching stations: {e}")
        return
        
    import json
    geojson_path = os.path.join(os.path.dirname(BASE_DIR), "belem_maps", "belem_bairros_supremo.geojson")
    if not os.path.exists(geojson_path):
        geojson_path = os.path.join(os.path.dirname(BASE_DIR), "belem_pa_bairros.geojson")
    
    geojson_data = None
    if os.path.exists(geojson_path):
        with open(geojson_path, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)

    url_data = "https://sws.cemaden.gov.br/PED/rest/pcds/dados_pcd"
    insert_sql = """
        INSERT OR IGNORE INTO clima_cemaden_precipitacao (
            estacao_codigo, datahora_utc, datahora_local, estacao_nome,
            chuva_mm, intensidade_mm_h, qualificacao, latitude, longitude, bairro_nome
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    end_dt = datetime.now()
    
    for station in stations:
        station_code = station.get("codestacao")
        station_name = station.get("nome")
        if not station_code:
            continue
            
        start_dt = get_latest_cemaden_utc(cursor, station_code)
        log(f"Processing station {station_code} ({station_name}) starting from {start_dt}")
        
        current_start = start_dt
        station_inserted = 0
        while current_start < end_dt:
            current_end = min(current_start + timedelta(days=30), end_dt)
            if (current_end - current_start).total_seconds() < 3600:
                break
                
            inicio_str = current_start.strftime("%Y%m%d%H%M")
            fim_str = current_end.strftime("%Y%m%d%H%M")
            
            params_data = {
                "codigo": station_code,
                "inicio": inicio_str,
                "fim": fim_str,
                "rede": "11"
            }
            
            log(f"  Fetching interval {inicio_str} to {fim_str}...")
            try:
                r = requests.get(url_data, headers=headers_api, params=params_data, timeout=30)
                if r.status_code != 200:
                    log(f"    Failed to fetch data for station {station_code}. Status: {r.status_code}")
                    current_start = current_end
                    continue
                    
                lines = r.text.splitlines()
                if len(lines) <= 2:
                    current_start = current_end
                    continue
                    
                pivoted = {}
                for line in lines[2:]:
                    row = line.strip().split(";")
                    if len(row) < 10:
                        continue
                    
                    est_code = row[0].strip()
                    est_name = row[1].strip()
                    lat = clean_float(row[4])
                    lon = clean_float(row[5])
                    dt_utc_str = row[6].strip()
                    sensor = row[7].strip()
                    val = clean_float(row[8])
                    qual = int(row[9]) if row[9].isdigit() else None
                    
                    key = (est_code, dt_utc_str)
                    if key not in pivoted:
                        try:
                            dt_utc = datetime.strptime(dt_utc_str, "%Y-%m-%d %H:%M:%S")
                            dt_local = dt_utc - timedelta(hours=3)
                            dt_local_str = dt_local.strftime("%Y-%m-%d %H:%M:%S")
                        except Exception:
                            continue
                            
                        pivoted[key] = {
                            'estacao_nome': est_name,
                            'datahora_local': dt_local_str,
                            'chuva_mm': None,
                            'intensidade_mm_h': None,
                            'qualificacao': qual,
                            'latitude': lat,
                            'longitude': lon
                        }
                        
                    record = pivoted[key]
                    if sensor == 'chuva':
                        record['chuva_mm'] = val
                    elif sensor == 'intensidade_precipitacao':
                        record['intensidade_mm_h'] = val
                    if qual is not None and record['qualificacao'] is None:
                        record['qualificacao'] = qual
                
                interval_inserted = 0
                for (est_c, dt_u), record in pivoted.items():
                    bairro_nome = get_cached_station_bairro(est_c, record['latitude'], record['longitude'], geojson_data)
                    vals = (
                        est_c,
                        dt_u,
                        record['datahora_local'],
                        record['estacao_nome'],
                        record['chuva_mm'],
                        record['intensidade_mm_h'],
                        record['qualificacao'],
                        record['latitude'],
                        record['longitude'],
                        bairro_nome
                    )
                    cursor.execute(insert_sql, vals)
                    if cursor.rowcount > 0:
                        interval_inserted += 1
                        
                conn.commit()
                station_inserted += interval_inserted
                log(f"    Inserted {interval_inserted} records for this interval.")
            except Exception as e:
                log(f"    Error processing interval: {e}")
                
            current_start = current_end
            
        log(f"Completed station {station_code}. Total API records inserted: {station_inserted}")

# ---------------------------------------------------------
# 2. CEMADEN Processor
# ---------------------------------------------------------
def process_cemaden(conn):
    log("Processing CEMADEN...")
    cursor = conn.cursor()
    cemaden_dir = os.path.join(BASE_DIR, "raw_data", "climate", "ped.cemaden.gov.br")
    if not os.path.exists(cemaden_dir):
        log(f"Error: CEMADEN directory not found at {cemaden_dir}")
        return
        
    # First load local data
    process_cemaden_local(cursor, cemaden_dir)
    conn.commit()
    
    # Then query API to pull other stations / update latest
    process_cemaden_api(conn)

# ---------------------------------------------------------
# 3. Marinha Processor
# ---------------------------------------------------------
# ---------------------------------------------------------
# 3. Marinha Processor
# ---------------------------------------------------------
def extract_header_info(page):
    text = page.extract_text()
    lines = text.splitlines() if text else []
    location = None
    year = None
    
    for line in lines[:5]:
        line_upper = line.upper()
        if "MOSQUEIRO" in line_upper:
            location = "Mosqueiro"
        elif "PORTO DE BEL" in line_upper or "PORTO DE BELÉM" in line_upper or "PORTO DE BELEM" in line_upper:
            location = "Porto de Belém"
            
        match = re.search(r"\b(202\d)\b", line)
        if match:
            year = int(match.group(1))
            
        if location and year:
            break
            
    return location, year

def process_marinha(conn):
    log("Processing Marinha (tabuas-de-mare PDFs)...")
    cursor = conn.cursor()
    
    marinha_dir = os.path.join(BASE_DIR, "raw_data", "climate", "marinha.mil.br_chm_tabuas-de-mare-4")
    if not os.path.exists(marinha_dir):
        log(f"Error: Marinha directory not found at {marinha_dir}")
        return
        
    pdf_files = glob.glob(os.path.join(marinha_dir, "*.pdf"))
    if not pdf_files:
        log(f"No Marinha tide PDF files found in {marinha_dir}")
        return
        
    insert_sql = """
        INSERT OR IGNORE INTO clima_marinha_tabua_mare (
            localidade, datahora_local, datahora_utc, altura_metros, tipo_evento
        ) VALUES (?, ?, ?, ?, ?)
    """
    
    total_inserted = 0
    
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        log(f"Reading PDF file: {filename}")
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                if len(pdf.pages) < 3:
                    log(f"Warning: PDF {filename} has fewer than 3 pages. Skipping.")
                    continue
                    
                location, year = extract_header_info(pdf.pages[0])
                if not location or not year:
                    log(f"Warning: Could not extract location/year from {filename}. Skipping.")
                    continue
                    
                log(f"Parsed header - Location: {location}, Year: {year}")
                all_tides = []
                
                for page_idx, page in enumerate(pdf.pages):
                    words = page.extract_words()
                    
                    # Detect layout based on minimum x0 of day labels near the top of the table
                    day_candidate_x0s = [w['x0'] for w in words if re.match(r"^\d{1,2}$", w['text']) and 90 < w['top'] < 130]
                    min_x0 = min(day_candidate_x0s) if day_candidate_x0s else 31.0
                    
                    if min_x0 < 45:
                        # Left Shifted Layout
                        COL_BOUNDARIES = [25, 90, 153, 216, 279, 342, 405, 468, 540]
                    else:
                        # Right Shifted Layout
                        COL_BOUNDARIES = [50, 114, 177, 240, 303, 366, 429, 492, 565]
                        
                    def get_col_idx(x0):
                        for i in range(len(COL_BOUNDARIES) - 1):
                            if COL_BOUNDARIES[i] <= x0 < COL_BOUNDARIES[i+1]:
                                return i
                        return -1
                        
                    columns = {i: [] for i in range(8)}
                    for w in words:
                        col_idx = get_col_idx(w['x0'])
                        if col_idx != -1:
                            columns[col_idx].append(w)
                            
                    for col_idx in range(8):
                        col_words = columns[col_idx]
                        col_words.sort(key=lambda w: (w['top'], w['x0']))
                        col_start = COL_BOUNDARIES[col_idx]
                        
                        is_even = (col_idx % 2 == 0)
                        day_min = 1 if is_even else 17
                        day_max = 16 if is_even else 31
                        month = (page_idx * 4) + (col_idx // 2) + 1
                        
                        # Extract day labels
                        day_labels = []
                        for w in col_words:
                            if w['x0'] < col_start + 25 and re.match(r"^\d{1,2}$", w['text']):
                                val = int(w['text'])
                                if day_min <= val <= day_max:
                                    day_labels.append((val, w['top']))
                                    
                        day_labels.sort(key=lambda x: x[1])
                        
                        for j in range(len(day_labels)):
                            day_num, y_top = day_labels[j]
                            y_bottom = day_labels[j+1][1] if j + 1 < len(day_labels) else 800.0
                            
                            # Filter words for this day in the column
                            day_words = [w for w in col_words if y_top - 10 <= w['top'] < y_bottom - 10]
                            
                            tides = []
                            i = 0
                            while i < len(day_words):
                                w = day_words[i]
                                if re.match(r"^\d{4}$", w['text']):
                                    # Look for height
                                    height = None
                                    for k in range(1, min(4, len(day_words) - i)):
                                        next_w = day_words[i+k]
                                        if re.match(r"^\d+[\.,]\d+$", next_w['text']):
                                            height = float(next_w['text'].replace(",", "."))
                                            break
                                    if height is not None:
                                        time_str = w['text']
                                        tides.append((time_str, height))
                                        i += 2
                                        continue
                                i += 1
                                
                            for time_str, height in tides:
                                hour = int(time_str[:2])
                                minute = int(time_str[2:])
                                try:
                                    dt_local = datetime(year, month, day_num, hour, minute)
                                    all_tides.append((dt_local, height))
                                except Exception as e:
                                    log(f"Warning: Invalid date/time {year}-{month}-{day_num} {hour:02d}:{minute:02d}: {e}")
                                    
                if not all_tides:
                    log(f"No tides found in PDF {filename}")
                    continue
                    
                all_tides.sort(key=lambda x: x[0])
                
                file_inserted = 0
                for i in range(len(all_tides)):
                    dt_local, height = all_tides[i]
                    
                    # Convert Local to UTC (+3 hours)
                    dt_utc = dt_local + timedelta(hours=3)
                    
                    datahora_local_str = dt_local.strftime("%Y-%m-%d %H:%M:%S")
                    datahora_utc_str = dt_utc.strftime("%Y-%m-%d %H:%M:%S")
                    
                    prev_height = all_tides[i-1][1] if i > 0 else None
                    next_height = all_tides[i+1][1] if i < len(all_tides) - 1 else None
                    
                    if prev_height is not None and next_height is not None:
                        if height >= prev_height and height >= next_height:
                            tipo = 'PREAMAR'
                        elif height <= prev_height and height <= next_height:
                            tipo = 'BAIXAMAR'
                        else:
                            tipo = 'PREAMAR' if height > prev_height else 'BAIXAMAR'
                    elif prev_height is None and next_height is not None:
                        tipo = 'PREAMAR' if height >= next_height else 'BAIXAMAR'
                    elif next_height is None and prev_height is not None:
                        tipo = 'PREAMAR' if height >= prev_height else 'BAIXAMAR'
                    else:
                        tipo = 'PREAMAR'
                        
                    cursor.execute(insert_sql, (location, datahora_local_str, datahora_utc_str, height, tipo))
                    if cursor.rowcount > 0:
                        file_inserted += 1
                        
                conn.commit()
                log(f"Inserted {file_inserted} records for {location} ({year})")
                total_inserted += file_inserted
                
        except Exception as e:
            log(f"Error processing PDF {filename}: {e}")
            
    log(f"Marinha processing complete. Total records inserted: {total_inserted}")

def process_cptec_precipitacao(conn):
    log("Processing CPTEC Precipitation (prec/diario)...")
    cursor = conn.cursor()
    
    cursor.execute("SELECT MAX(data_prec) FROM clima_cptec_precipitacao")
    res = cursor.fetchone()
    if res and res[0]:
        try:
            start_date = datetime.strptime(res[0], "%Y-%m-%d") + timedelta(days=1)
        except Exception:
            start_date = datetime.now() - timedelta(days=15)
    else:
        start_date = datetime.now() - timedelta(days=15)
        
    end_date = datetime.now() - timedelta(days=1)
    
    insert_sql = """
        INSERT OR IGNORE INTO clima_cptec_precipitacao (
            data_prec, chuva_mm, data_atualizacao
        ) VALUES (?, ?, ?)
    """
    
    current = start_date
    inserted = 0
    
    while current <= end_date:
        date_str = current.strftime("%Y-%m-%d")
        year = current.year
        day = current.day
        month = current.month
        
        filename = f"prec{day:02d}{month:02d}{year}12.dat"
        url = f"https://ftp.cptec.inpe.br/clima/dados/prec/diario/{year}/{filename}"
        
        log(f"Fetching precipitation for {date_str} from {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as r:
                content = r.read().decode('utf-8', errors='ignore')
                
            lines = content.splitlines()
            belem_vals = []
            
            for line in lines:
                parts = line.strip().split()
                if len(parts) >= 4:
                    try:
                        lon = float(parts[1])
                        lat = float(parts[2])
                        val = float(parts[3])
                        if abs(lon - (-48.48)) < 0.1 and abs(lat - (-1.45)) < 0.1:
                            belem_vals.append(val)
                    except ValueError:
                        pass
                        
            if not belem_vals:
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) >= 4:
                        try:
                            lon = float(parts[1])
                            lat = float(parts[2])
                            val = float(parts[3])
                            if abs(lon - (-48.48)) < 0.25 and abs(lat - (-1.45)) < 0.25:
                                belem_vals.append(val)
                        except ValueError:
                            pass
                            
            if belem_vals:
                chuva_mm = sum(belem_vals) / len(belem_vals)
                atualizacao = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cursor.execute(insert_sql, (date_str, chuva_mm, atualizacao))
                inserted += cursor.rowcount
            else:
                log(f"No rainfall readings found for Belém region on {date_str}")
        except Exception as e:
            log(f"Failed to fetch precipitation for {date_str}: {e}")
            
        current += timedelta(days=1)
        
    log(f"CPTEC Precipitation Ingestion Complete. Inserted {inserted} records.")

def process_cptec_umidade_solo(conn, start_date=None, end_date=None):
    log("Processing CPTEC Soil Moisture (umid_solo) by neighborhood...")
    cursor = conn.cursor()
    
    if start_date is None:
        cursor.execute("SELECT MAX(datahora_utc) FROM clima_cptec_umidade_solo")
        res = cursor.fetchone()
        if res and res[0]:
            try:
                start_date = datetime.strptime(res[0], "%Y-%m-%d %H:%M:%S") + timedelta(days=1)
            except Exception:
                start_date = datetime.now() - timedelta(days=5)
        else:
            start_date = datetime.now() - timedelta(days=5)
        
    if end_date is None:
        end_date = datetime.now() - timedelta(days=1)
    
    insert_sql = """
        INSERT OR IGNORE INTO clima_cptec_umidade_solo (
            datahora_utc, datahora_local, bairro_nome, umidade_solo_l1, umidade_solo_l2, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?)
    """
    
    centroids = load_neighborhood_centroids()
    current = start_date
    inserted = 0
    
    while current <= end_date:
        year = current.year
        month = current.month
        day = current.day
        date_str = current.strftime("%Y-%m-%d")
        
        base_url = f"http://dataserver.cptec.inpe.br/dataserver_modelos/umid_solo/brutos/{year}/{month:02d}/{day:02d}/12/"
        ctl_url = f"{base_url}GL_SM.GPNR.{year}{month:02d}{day:02d}12.ctl"
        gra_url = f"{base_url}GL_SM.GPNR.{year}{month:02d}{day:02d}12.gra"
        
        log(f"Fetching soil moisture for {date_str}...")
        try:
            l1_grid = extract_grads_grid_remote(ctl_url, gra_url, centroids, "us", z_level_idx=7, sequential=True)
            l2_grid = extract_grads_grid_remote(ctl_url, gra_url, centroids, "us", z_level_idx=6, sequential=True)
            
            dt_utc_str = f"{date_str} 12:00:00"
            dt_local_str = f"{date_str} 09:00:00"
            atualizacao = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            for bairro_nome, lon, lat in centroids:
                val_l1 = l1_grid.get(bairro_nome)
                val_l2 = l2_grid.get(bairro_nome)
                
                cursor.execute(insert_sql, (dt_utc_str, dt_local_str, bairro_nome, val_l1, val_l2, atualizacao))
                inserted += cursor.rowcount
        except Exception as e:
            log(f"Failed to fetch soil moisture for {date_str}: {e}")
            
        current += timedelta(days=1)
        conn.commit()
        
    log(f"CPTEC Soil Moisture ingestion complete. Inserted {inserted} records.")

def process_cptec_brams_gases(conn, start_date=None, end_date=None, hours=None):
    log("Processing CPTEC Air Quality / BRAMS Gases (ams_15km) by neighborhood...")
    cursor = conn.cursor()
    
    if start_date is None:
        cursor.execute("SELECT MAX(datahora_utc) FROM clima_cptec_brams_gases")
        res = cursor.fetchone()
        if res and res[0]:
            try:
                start_date = datetime.strptime(res[0], "%Y-%m-%d %H:%M:%S") + timedelta(days=1)
            except Exception:
                start_date = datetime.now() - timedelta(days=4)
        else:
            start_date = datetime.now() - timedelta(days=4)
            
    if end_date is None:
        end_date = datetime.now() - timedelta(days=1)
        
    if hours is None:
        hours = [0, 3, 6, 9, 12, 15, 18, 21]
        
    insert_sql = """
        INSERT OR IGNORE INTO clima_cptec_brams_gases (
            datahora_utc, datahora_local, bairro_nome, co_ppm, pm25_ugm3, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?)
    """
    
    centroids = load_neighborhood_centroids()
    current = start_date
    inserted = 0
    
    while current <= end_date:
        year = current.year
        month = current.month
        day = current.day
        date_str = current.strftime("%Y-%m-%d")
        
        log(f"Fetching BRAMS air quality for {date_str}...")
        
        for hour in hours:
            base_url = f"http://dataserver.cptec.inpe.br/dataserver_modelos/brams/ams_15km/brutos/gases/{year}/{month:02d}/{day:02d}/00/"
            filename = f"profile_{year}{month:02d}{day:02d}00G-A-{year}-{month:02d}-{day:02d}-{hour:02d}0000-g1"
            ctl_url = f"{base_url}{filename}.ctl"
            gra_url = f"{base_url}{filename}.gra"
            
            try:
                co_grid = extract_grads_grid_remote(ctl_url, gra_url, centroids, "co")
                pm25_grid = extract_grads_grid_remote(ctl_url, gra_url, centroids, "pm25")
                
                dt_utc = datetime(year, month, day, hour, 0, 0)
                dt_local = dt_utc - timedelta(hours=3)
                dt_utc_str = dt_utc.strftime("%Y-%m-%d %H:%M:%S")
                dt_local_str = dt_local.strftime("%Y-%m-%d %H:%M:%S")
                atualizacao = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                for bairro_nome, lon, lat in centroids:
                    co_ppbv = co_grid.get(bairro_nome)
                    pm25 = pm25_grid.get(bairro_nome)
                    co_ppm = co_ppbv / 1000.0 if co_ppbv is not None else None
                    
                    cursor.execute(insert_sql, (dt_utc_str, dt_local_str, bairro_nome, co_ppm, pm25, atualizacao))
                    inserted += cursor.rowcount
            except Exception as e:
                log(f"  Warning: Failed to fetch BRAMS gases for {date_str} {hour:02d}:00: {e}")
                
        current += timedelta(days=1)
        conn.commit()
        
    log(f"CPTEC BRAMS Gases Ingestion Complete. Inserted {inserted} records.")

# ---------------------------------------------------------
# 4. CPTEC Processor
# ---------------------------------------------------------
def process_cptec(conn, start_date=None, end_date=None, hours=None):
    log("Processing CPTEC (Previsão de Tempo e Ondas)...")
    cursor = conn.cursor()
    
    # 1. Fetch and process 7-day weather forecast
    url_7d = "http://servicos.cptec.inpe.br/XML/cidade/7dias/221/previsao.xml"
    log(f"Fetching 7-day weather forecast from: {url_7d}")
    try:
        r = requests.get(url_7d, timeout=15)
        if r.status_code == 200:
            root = ET.fromstring(r.content)
            atualizacao = root.find("atualizacao")
            atualizacao_str = atualizacao.text.strip() if atualizacao is not None else None
            
            insert_previsao_sql = """
                INSERT OR REPLACE INTO clima_cptec_previsao (
                    data_previsao, data_atualizacao, tempo_condicao,
                    temperatura_maxima, temperatura_minima, iuv, fonte
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """
            
            inserted_7d = 0
            for prev in root.findall("previsao"):
                dia_elem = prev.find("dia")
                tempo_elem = prev.find("tempo")
                max_elem = prev.find("maxima")
                min_elem = prev.find("minima")
                iuv_elem = prev.find("iuv")
                
                if dia_elem is None or dia_elem.text is None:
                    continue
                    
                data_prev = dia_elem.text.strip()
                tempo_cond = tempo_elem.text.strip() if tempo_elem is not None and tempo_elem.text else None
                temp_max = int(max_elem.text.strip()) if max_elem is not None and max_elem.text else None
                temp_min = int(min_elem.text.strip()) if min_elem is not None and min_elem.text else None
                iuv = float(iuv_elem.text.strip()) if iuv_elem is not None and iuv_elem.text else None
                
                cursor.execute(insert_previsao_sql, (
                    data_prev, atualizacao_str, tempo_cond, temp_max, temp_min, iuv, "CPTEC/INPE 7dias"
                ))
                inserted_7d += 1
                
            conn.commit()
            log(f"Inserted/updated {inserted_7d} 7-day forecast records.")
        else:
            log(f"Error fetching 7-day weather forecast: HTTP {r.status_code}")
    except Exception as e:
        log(f"Exception processing 7-day weather forecast: {e}")
        
    # 2. Fetch and process extended weather forecast
    url_ext = "http://servicos.cptec.inpe.br/XML/cidade/221/estendida.xml"
    log(f"Fetching extended weather forecast from: {url_ext}")
    try:
        r = requests.get(url_ext, timeout=15)
        if r.status_code == 200:
            root = ET.fromstring(r.content)
            atualizacao = root.find("atualizacao")
            atualizacao_str = atualizacao.text.strip() if atualizacao is not None else None
            
            insert_previsao_sql = """
                INSERT OR REPLACE INTO clima_cptec_previsao (
                    data_previsao, data_atualizacao, tempo_condicao,
                    temperatura_maxima, temperatura_minima, iuv, fonte
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """
            
            inserted_ext = 0
            for prev in root.findall("previsao"):
                dia_elem = prev.find("dia")
                tempo_elem = prev.find("tempo")
                max_elem = prev.find("maxima")
                min_elem = prev.find("minima")
                iuv_elem = prev.find("iuv")
                
                if dia_elem is None or dia_elem.text is None:
                    continue
                    
                data_prev = dia_elem.text.strip()
                tempo_cond = tempo_elem.text.strip() if tempo_elem is not None and tempo_elem.text else None
                temp_max = int(max_elem.text.strip()) if max_elem is not None and max_elem.text else None
                temp_min = int(min_elem.text.strip()) if min_elem is not None and min_elem.text else None
                iuv = float(iuv_elem.text.strip()) if iuv_elem is not None and iuv_elem.text else None
                
                cursor.execute(insert_previsao_sql, (
                    data_prev, atualizacao_str, tempo_cond, temp_max, temp_min, iuv, "CPTEC/INPE estendida"
                ))
                inserted_ext += 1
                
            conn.commit()
            log(f"Inserted/updated {inserted_ext} extended forecast records.")
        else:
            log(f"Error fetching extended weather forecast: HTTP {r.status_code}")
    except Exception as e:
        log(f"Exception processing extended weather forecast: {e}")
        
    # 3. Fetch and process wave forecast
    url_waves = "http://servicos.cptec.inpe.br/XML/cidade/221/todos/tempos/ondas.xml"
    log(f"Fetching wave forecast from: {url_waves}")
    try:
        r = requests.get(url_waves, timeout=15)
        if r.status_code == 200:
            root = ET.fromstring(r.content)
            atualizacao = root.find("atualizacao")
            atualizacao_str = atualizacao.text.strip() if atualizacao is not None else None
            
            insert_waves_sql = """
                INSERT OR REPLACE INTO clima_cptec_previsao_ondas (
                    datahora_utc, datahora_local, data_atualizacao,
                    agitacao, altura_metros, direcao_ondas,
                    vento_velocidade_kmh, vento_direcao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """
            
            inserted_waves = 0
            for prev in root.findall("previsao"):
                dia_elem = prev.find("dia")
                agitacao_elem = prev.find("agitacao")
                altura_elem = prev.find("altura")
                direcao_elem = prev.find("direcao")
                vento_elem = prev.find("vento")
                vento_dir_elem = prev.find("vento_dir")
                
                if dia_elem is None or dia_elem.text is None:
                    continue
                    
                dia_text = dia_elem.text.strip()
                
                # Parse dia_text like "22-05-2026 00h Z"
                match = re.match(r"(\d{2})-(\d{2})-(\d{4})\s+(\d{2})h\s*Z", dia_text)
                if not match:
                    log(f"Warning: Could not parse wave forecast date format: {dia_text}")
                    continue
                    
                d, m, y, h = match.groups()
                dt_utc = datetime(int(y), int(m), int(d), int(h), 0, 0)
                datahora_utc_str = dt_utc.strftime("%Y-%m-%d %H:%M:%S")
                dt_local = dt_utc - timedelta(hours=3)
                datahora_local_str = dt_local.strftime("%Y-%m-%d %H:%M:%S")
                
                agitacao = agitacao_elem.text.strip() if agitacao_elem is not None and agitacao_elem.text else None
                altura = float(altura_elem.text.strip()) if altura_elem is not None and altura_elem.text else None
                direcao = direcao_elem.text.strip() if direcao_elem is not None and direcao_elem.text else None
                vento = float(vento_elem.text.strip()) if vento_elem is not None and vento_elem.text else None
                vento_dir = vento_dir_elem.text.strip() if vento_dir_elem is not None and vento_dir_elem.text else None
                
                cursor.execute(insert_waves_sql, (
                    datahora_utc_str, datahora_local_str, atualizacao_str,
                    agitacao, altura, direcao, vento, vento_dir
                ))
                inserted_waves += 1
                
            conn.commit()
            log(f"Inserted/updated {inserted_waves} wave forecast records.")
        else:
            log(f"Error fetching wave forecast: HTTP {r.status_code}")
    except Exception as e:
        log(f"Exception processing wave forecast: {e}")

    # 4. Ingest advanced historical datasets
    try:
        process_cptec_precipitacao(conn)
    except Exception as e:
        log(f"Error processing CPTEC historical precipitation: {e}")
        
    try:
        process_cptec_umidade_solo(conn)
    except Exception as e:
        log(f"Error processing CPTEC soil moisture: {e}")
        
    try:
        process_cptec_brams_gases(conn, start_date=start_date, end_date=end_date, hours=hours)
    except Exception as e:
        log(f"Error processing CPTEC BRAMS gases: {e}")

# ---------------------------------------------------------
# Main Execution Entry Point
# ---------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="ETL pipeline for weather data (CISC Belém)")
    parser.add_argument(
        "--source", 
        choices=["inmet", "cemaden", "marinha", "cptec", "cptec_prec", "cptec_solo", "cptec_gases", "all"], 
        default="all",
        help="Specify the source to execute (default: all)"
    )
    parser.add_argument(
        "--start",
        help="Start date in YYYY-MM-DD format (for backfilling CPTEC sources)"
    )
    parser.add_argument(
        "--end",
        help="End date in YYYY-MM-DD format (for backfilling CPTEC sources)"
    )
    parser.add_argument(
        "--quick",
        action="store_true",
        help="Quick backfill mode: downloads only 12:00 UTC hourly data instead of all 8 hours for BRAMS gases"
    )
    args = parser.parse_args()
    
    start_dt = None
    if args.start:
        start_dt = datetime.strptime(args.start, "%Y-%m-%d")
        
    end_dt = None
    if args.end:
        end_dt = datetime.strptime(args.end, "%Y-%m-%d")
        
    hours = [12] if args.quick else [0, 3, 6, 9, 12, 15, 18, 21]
    
    if not os.path.exists(DB_PATH):
        log(f"Error: Database file not found at {DB_PATH}. Please run DDL schema scripts first.")
        sys.exit(1)
        
    log(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    
    try:
        if args.source == "inmet":
            process_inmet(conn)
        elif args.source == "cemaden":
            process_cemaden(conn)
        elif args.source == "marinha":
            process_marinha(conn)
        elif args.source == "cptec":
            process_cptec(conn, start_date=start_dt, end_date=end_dt, hours=hours)
        elif args.source == "cptec_prec":
            process_cptec_precipitacao(conn)
        elif args.source == "cptec_solo":
            process_cptec_umidade_solo(conn, start_date=start_dt, end_date=end_dt)
        elif args.source == "cptec_gases":
            process_cptec_brams_gases(conn, start_date=start_dt, end_date=end_dt, hours=hours)
        elif args.source == "all":
            process_inmet(conn)
            process_cemaden(conn)
            process_marinha(conn)
            process_cptec(conn, start_date=start_dt, end_date=end_dt, hours=hours)
    except Exception as e:
        log(f"Error during ETL execution: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()
        log("Database connection closed.")

if __name__ == "__main__":
    main()
