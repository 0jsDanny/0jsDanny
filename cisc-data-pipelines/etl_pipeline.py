import os
import sys
import sqlite3
import json
import datetime
import unicodedata
import struct
import pandas as pd
import numpy as np

# Set console encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "cisc_health.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "cisc_health_sqlite.sql")
GEOJSON_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "belem_pa_bairros.geojson"))

# Files to process
DENGUE_FILES = [
    os.path.join(BASE_DIR, "raw_data", "clinical", "DENGON2755262_00.dbf"),
    os.path.join(BASE_DIR, "raw_data", "clinical", "DENGON2755271_00.dbf")
]
LEPTO_FILE = os.path.join(BASE_DIR, "raw_data", "clinical", "LEPTONET.DBF")
SRAG_FILE = os.path.join(BASE_DIR, "raw_data", "clinical", "SRAGHOSPITALIZADO2755583_00.dbf")
DDA_CASOS_HTML = os.path.join(BASE_DIR, "raw_data", "clinical", "SIDEV_DDA relatório.html")
DDA_SURTOS_HTML = os.path.join(BASE_DIR, "raw_data", "clinical", "relatório e nº de surtos.html")

def log(msg):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}")

# ---------------------------------------------------------
# 1. DBF File Parser (Pure Python)
# ---------------------------------------------------------
def read_dbf(file_path):
    log(f"Reading DBF file: {os.path.basename(file_path)}")
    try:
        with open(file_path, 'rb') as f:
            header = f.read(32)
            if len(header) < 32:
                log(f"Error: Header too short for {file_path}")
                return
            
            num_records, header_len, record_len = struct.unpack('<IHH', header[4:12])
            
            # Read field descriptors
            fields = []
            bytes_read = 32
            while True:
                descriptor = f.read(32)
                bytes_read += 32
                if not descriptor or descriptor[0] == 0x0D:
                    break
                name = descriptor[:11].split(b'\x00')[0].decode('cp1252', errors='replace').strip()
                field_type = chr(descriptor[11])
                length = descriptor[16]
                fields.append((name, field_type, length))
                
            # Move pointer to the start of records (header_len)
            f.seek(header_len)
            
            for i in range(num_records):
                record_data = f.read(record_len)
                if len(record_data) < record_len:
                    break
                
                # Check deletion flag (0x2A is '*', deleted)
                if record_data[0] == 0x2A:
                    continue
                    
                record = {}
                offset = 1
                for name, field_type, length in fields:
                    val_bytes = record_data[offset:offset+length]
                    offset += length
                    val = val_bytes.decode('cp1252', errors='replace').strip()
                    record[name] = val
                yield record
    except Exception as e:
        log(f"Error reading DBF {file_path}: {e}")

# ---------------------------------------------------------
# 2. Normalization Helpers
# ---------------------------------------------------------
def normalize_string(s):
    if not s:
        return ""
    s = str(s).upper().strip()
    s = unicodedata.normalize('NFKD', s)
    return "".join([c for c in s if not unicodedata.combining(c)])

def parse_date(date_str):
    if not date_str:
        return None
    s = str(date_str).strip()
    if s in ('', '00000000', '00/00/0000', 'NaN', 'nan', 'None'):
        return None
    
    # DD/MM/YYYY format (often in SRAG)
    if '/' in s:
        try:
            parts = s.split('/')
            if len(parts) == 3:
                day = int(parts[0])
                month = int(parts[1])
                year = int(parts[2])
                if 1900 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31:
                    return f"{year:04d}-{month:02d}-{day:02d}"
        except Exception:
            pass
            
    # YYYYMMDD format (often in Dengue/Lepto)
    if len(s) == 8 and s.isdigit():
        try:
            year = int(s[:4])
            month = int(s[4:6])
            day = int(s[6:])
            if 1900 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31:
                return f"{year:04d}-{month:02d}-{day:02d}"
        except Exception:
            pass
            
    return None

def decode_sinan_age(age_val):
    if age_val is None:
        return None
    try:
        s = str(age_val).strip()
        if '.' in s:
            s = s.split('.')[0]
        if not s or not s.isdigit():
            return None
            
        if len(s) == 4:
            prefix = int(s[0])
            val = int(s[1:])
            if prefix == 1:   # Days
                return round(val / 365.25, 3)
            elif prefix == 2: # Months
                return round(val / 12.0, 3)
            elif prefix in (3, 4): # Years
                return float(val)
            else:
                return float(val)
        else:
            return float(s)
    except Exception:
        return None

def parse_srag_age(nu_idade_n, tp_idade, cod_idade):
    # Try cod_idade first if it's 4 digits
    if cod_idade and len(str(cod_idade).strip()) == 4:
        age = decode_sinan_age(cod_idade)
        if age is not None:
            return age
            
    # Fallback to nu_idade_n and tp_idade
    if nu_idade_n is not None and str(nu_idade_n).strip().isdigit():
        val = float(str(nu_idade_n).strip())
        tp = str(tp_idade).strip() if tp_idade is not None else '3'
        if tp == '1': # Days
            return round(val / 365.25, 3)
        elif tp == '2': # Months
            return round(val / 12.0, 3)
        else: # Years
            return val
    return None

def map_sex(sex_val):
    if not sex_val:
        return 'I'
    s = str(sex_val).strip().upper()
    if s.startswith('M'):
        return 'M'
    elif s.startswith('F'):
        return 'F'
    return 'I'

def map_hospitalized(hosp_val, default='I'):
    if not hosp_val:
        return default
    s = str(hosp_val).strip()
    if s == '1':
        return 'S'
    elif s == '2':
        return 'N'
    return default

def get_field(record, key, default=None):
    val = record.get(key)
    if val is None:
        return default
    val = str(val).strip()
    if val == '' or val.upper() in ('NAN', 'NONE', 'NULL'):
        return default
    return val

# ---------------------------------------------------------
# 3. Spatial & Geocoding Centroids (latin-1)
# ---------------------------------------------------------
def compute_geometry_centroid(geom):
    if not geom or 'type' not in geom or 'coordinates' not in geom:
        return None
    g_type = geom['type']
    coords = geom['coordinates']
    
    if g_type == 'Polygon':
        if not coords or len(coords) < 1:
            return None
        pts = coords[0]
        if not pts:
            return None
        longs = [p[0] for p in pts if len(p) >= 2]
        lats = [p[1] for p in pts if len(p) >= 2]
        if not lats or not longs:
            return None
        return sum(lats) / len(lats), sum(longs) / len(longs)
    elif g_type == 'MultiPolygon':
        total_lat = 0
        total_long = 0
        total_pts = 0
        for poly in coords:
            if not poly or len(poly) < 1:
                continue
            pts = poly[0]
            if not pts:
                continue
            total_lat += sum(p[1] for p in pts if len(p) >= 2)
            total_long += sum(p[0] for p in pts if len(p) >= 2)
            total_pts += len(pts)
        if total_pts > 0:
            return total_lat / total_pts, total_long / total_pts
        return None
    elif g_type == 'Point':
        if len(coords) >= 2:
            return coords[1], coords[0]
    return None

def load_neighborhood_centroids():
    centroids = {}
    supremo_path = os.path.abspath(os.path.join(BASE_DIR, "..", "belem_maps", "belem_bairros_supremo.geojson"))
    path_to_load = supremo_path if os.path.exists(supremo_path) else GEOJSON_PATH
    log(f"Loading neighborhood centroids from {path_to_load}")
    try:
        with open(path_to_load, 'r', encoding='utf-8' if path_to_load == supremo_path else 'latin-1') as f:
            data = json.load(f)
            
        for feature in data.get('features', []):
            properties = feature.get('properties', {})
            name = properties.get('bairro_nome') or properties.get('name')
            is_bg = properties.get('is_background', False)
            geom = feature.get('geometry', {})
            
            if is_bg or not name or "Limite" in name:
                continue
                
            centroid = compute_geometry_centroid(geom)
            if centroid:
                norm_name = normalize_string(name)
                centroids[norm_name] = (centroid[0], centroid[1], name.strip().upper())
                    
        log(f"Successfully loaded {len(centroids)} neighborhood centroids.")
    except Exception as e:
        log(f"Error loading GeoJSON: {e}")
        
    return centroids

def geocode_bairro(bairro_name, centroids, default_center):
    if not bairro_name:
        return default_center[0], default_center[1], "NÃO INFORMADO"
        
    norm_name = normalize_string(bairro_name)
    if not norm_name:
        return default_center[0], default_center[1], "NÃO INFORMADO"
        
    # 1. Exact match
    if norm_name in centroids:
        lat, lon, canonical_name = centroids[norm_name]
        return lat, lon, canonical_name
        
    # 2. Try cleanup
    clean_name = norm_name.replace('-', ' ').replace('_', ' ')
    if clean_name in centroids:
        lat, lon, canonical_name = centroids[clean_name]
        return lat, lon, canonical_name
        
    # 3. Substring match
    for geo_name, val in centroids.items():
        if geo_name in norm_name or norm_name in geo_name:
            return val[0], val[1], val[2]
            
    # 4. Fuzzy match using built-in difflib
    import difflib
    matches = difflib.get_close_matches(norm_name, list(centroids.keys()), n=1, cutoff=0.6)
    if matches:
        lat, lon, canonical_name = centroids[matches[0]]
        return lat, lon, canonical_name
            
    return default_center[0], default_center[1], bairro_name.strip().upper()

# ---------------------------------------------------------
# 4. Database Core Execution and Commits
# ---------------------------------------------------------
def init_database():
    log(f"Initializing SQLite database at: {DB_PATH}")
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            log("Removed existing database to perform a clean load.")
        except Exception as e:
            log(f"Warning: Could not remove database file: {e}")
            
    conn = sqlite3.connect(DB_PATH)
    # Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON;")
    
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        ddl = f.read()
        
    conn.executescript(ddl)
    conn.commit()
    return conn

# ---------------------------------------------------------
# 5. DBF Ingestion Engine
# ---------------------------------------------------------
def ingest_dengue(conn, centroids, default_center):
    log("Ingesting Dengue cases...")
    cursor = conn.cursor()
    total_records = 0
    inserted_records = 0
    duplicate_records = 0
    
    insert_core_sql = """
        INSERT OR IGNORE INTO notificacoes (
            id_notificacao, tp_notificacao, agravo_id, doenca,
            data_notificacao, semana_notificacao, ano_notificacao,
            data_sintomas, semana_sintomas, paciente_nome,
            paciente_nascimento, paciente_idade_anos, paciente_sexo,
            paciente_gestante, paciente_raca, paciente_escolaridade,
            paciente_cns, paciente_mae, residencia_uf,
            residencia_municipio_ibge, residencia_bairro, residencia_logradouro,
            residencia_numero, residencia_complemento, residencia_cep,
            residencia_zona, data_investigacao, hospitalizado,
            data_internacao, classificacao_final, criterio_confirmacao,
            evolucao, data_obito, data_encerramento, observacao,
            latitude, longitude
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    """
    
    insert_details_sql = """
        INSERT OR IGNORE INTO dengue_detalhes (
            id_notificacao, febre, mialgia, cefaleia, exantema, vomito, nausea, dor_costas,
            conjuntvit, artrite, artralgia, petequia_n, leucopenia, laco, dor_retro,
            diabetes, hematolog, hepatopat, renal, hipertensa, acido_pept, auto_imune,
            resul_soro, resul_ns1, resul_vi_n, resul_pcr_, sorotipo, histopa_n, imunoh_n,
            alrm_hipot, alrm_plaq, alrm_vom, alrm_sang, alrm_hemat, alrm_abdom, alrm_letar,
            alrm_hepat, alrm_liq,
            grav_pulso, grav_conv, grav_ench, grav_insuf, grav_taqui, grav_extre, grav_hipot,
            grav_hemat, grav_melen, grav_metro, grav_sang, grav_ast, grav_mioc, grav_consc, grav_orgao
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    """

    for file_path in DENGUE_FILES:
        if not os.path.exists(file_path):
            log(f"Warning: Dengue file not found: {file_path}")
            continue
            
        for record in read_dbf(file_path):
            total_records += 1
            id_not = get_field(record, 'NU_NOTIFIC')
            if not id_not:
                continue
                
            bairro_raw = get_field(record, 'NM_BAIRRO')
            lat, lon, bairro = geocode_bairro(bairro_raw, centroids, default_center)
            
            # Map core notification
            ano_val = get_field(record, 'NU_ANO')
            ano = int(ano_val) if ano_val and ano_val.isdigit() else None
            
            core_vals = (
                id_not,
                get_field(record, 'TP_NOT'),
                get_field(record, 'ID_AGRAVO'),
                'DENGUE',
                parse_date(get_field(record, 'DT_NOTIFIC')),
                get_field(record, 'SEM_NOT'),
                ano,
                parse_date(get_field(record, 'DT_SIN_PRI')),
                get_field(record, 'SEM_PRI'),
                get_field(record, 'NM_PACIENT'),
                parse_date(get_field(record, 'DT_NASC')),
                decode_sinan_age(get_field(record, 'NU_IDADE_N')),
                map_sex(get_field(record, 'CS_SEXO')),
                get_field(record, 'CS_GESTANT'),
                get_field(record, 'CS_RACA'),
                get_field(record, 'CS_ESCOL_N'),
                get_field(record, 'ID_CNS_SUS'),
                get_field(record, 'NM_MAE_PAC'),
                get_field(record, 'SG_UF'),
                get_field(record, 'ID_MN_RESI'),
                bairro,
                get_field(record, 'NM_LOGRADO'),
                get_field(record, 'NU_NUMERO'),
                get_field(record, 'NM_COMPLEM'),
                get_field(record, 'NU_CEP'),
                get_field(record, 'CS_ZONA'),
                parse_date(get_field(record, 'DT_INVEST')),
                map_hospitalized(get_field(record, 'HOSPITALIZ'), 'N'),
                parse_date(get_field(record, 'DT_INTERNA')),
                get_field(record, 'CLASSI_FIN'),
                get_field(record, 'CRITERIO'),
                get_field(record, 'EVOLUCAO'),
                parse_date(get_field(record, 'DT_OBITO')),
                parse_date(get_field(record, 'DT_ENCERRA')),
                get_field(record, 'DS_OBS'),
                lat,
                lon
            )
            
            cursor.execute(insert_core_sql, core_vals)
            if cursor.rowcount == 0:
                duplicate_records += 1
                # If core exists, we can still load details or skip
                continue
                
            # Map Dengue Details
            details_vals = (
                id_not,
                get_field(record, 'FEBRE'),
                get_field(record, 'MIALGIA'),
                get_field(record, 'CEFALEIA'),
                get_field(record, 'EXANTEMA'),
                get_field(record, 'VOMITO'),
                get_field(record, 'NAUSEA'),
                get_field(record, 'DOR_COSTAS'),
                get_field(record, 'CONJUNTVIT'),
                get_field(record, 'ARTRITE'),
                get_field(record, 'ARTRALGIA'),
                get_field(record, 'PETEQUIA_N'),
                get_field(record, 'LEUCOPENIA'),
                get_field(record, 'LACO'),
                get_field(record, 'DOR_RETRO'),
                get_field(record, 'DIABETES'),
                get_field(record, 'HEMATOLOG'),
                get_field(record, 'HEPATOPAT'),
                get_field(record, 'RENAL'),
                get_field(record, 'HIPERTENSA'),
                get_field(record, 'ACIDO_PEPT'),
                get_field(record, 'AUTO_IMUNE'),
                get_field(record, 'RESUL_SORO'),
                get_field(record, 'RESUL_NS1'),
                get_field(record, 'RESUL_VI_N'),
                get_field(record, 'RESUL_PCR_'),
                get_field(record, 'SOROTIPO'),
                get_field(record, 'HISTOPA_N'),
                get_field(record, 'IMUNOH_N'),
                get_field(record, 'ALRM_HIPOT'),
                get_field(record, 'ALRM_PLAQ'),
                get_field(record, 'ALRM_VOM'),
                get_field(record, 'ALRM_SANG'),
                get_field(record, 'ALRM_HEMAT'),
                get_field(record, 'ALRM_ABDOM'),
                get_field(record, 'ALRM_LETAR'),
                get_field(record, 'ALRM_HEPAT'),
                get_field(record, 'ALRM_LIQ'),
                get_field(record, 'GRAV_PULSO'),
                get_field(record, 'GRAV_CONV'),
                get_field(record, 'GRAV_ENCH'),
                get_field(record, 'GRAV_INSUF'),
                get_field(record, 'GRAV_TAQUI'),
                get_field(record, 'GRAV_EXTRE'),
                get_field(record, 'GRAV_HIPOT'),
                get_field(record, 'GRAV_HEMAT'),
                get_field(record, 'GRAV_MELEN'),
                get_field(record, 'GRAV_METRO'),
                get_field(record, 'GRAV_SANG'),
                get_field(record, 'GRAV_AST'),
                get_field(record, 'GRAV_MIOC'),
                get_field(record, 'GRAV_CONSC'),
                get_field(record, 'GRAV_ORGAO')
            )
            cursor.execute(insert_details_sql, details_vals)
            inserted_records += 1
            
    conn.commit()
    log(f"Dengue ingestion finished. Total: {total_records}, Inserted: {inserted_records}, Duplicates skipped: {duplicate_records}")

def ingest_lepto(conn, centroids, default_center):
    log("Ingesting Leptospirosis cases...")
    cursor = conn.cursor()
    total_records = 0
    inserted_records = 0
    duplicate_records = 0
    
    if not os.path.exists(LEPTO_FILE):
        log(f"Warning: Leptospirosis file not found: {LEPTO_FILE}")
        return
        
    insert_core_sql = """
        INSERT OR IGNORE INTO notificacoes (
            id_notificacao, tp_notificacao, agravo_id, doenca,
            data_notificacao, semana_notificacao, ano_notificacao,
            data_sintomas, semana_sintomas, paciente_nome,
            paciente_nascimento, paciente_idade_anos, paciente_sexo,
            paciente_gestante, paciente_raca, paciente_escolaridade,
            paciente_cns, paciente_mae, residencia_uf,
            residencia_municipio_ibge, residencia_bairro, residencia_logradouro,
            residencia_numero, residencia_complemento, residencia_cep,
            residencia_zona, data_investigacao, hospitalizado,
            data_internacao, classificacao_final, criterio_confirmacao,
            evolucao, data_obito, data_encerramento, observacao,
            latitude, longitude
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    """
    
    insert_details_sql = """
        INSERT OR IGNORE INTO leptospirose_detalhes (
            id_notificacao, ant_cb_lam, ant_cb_cri, ant_cb_cai, ant_cb_fos, ant_cb_sin,
            ant_cb_pla, ant_cb_cor, ant_cb_roe, ant_cb_gra, ant_cb_ter, ant_cb_lix, ant_cb_out,
            ant_ou_des, ant_humano, ant_animai,
            cli_febre, cli_mialgi, cli_cefale, cli_prost, cli_conges, cli_pantur, cli_vomito,
            cli_diarre, cli_icteri, cli_renal, cli_respir, cli_cardia, cli_hemopu, cli_hemorr,
            cli_mening, cli_outros, cli_otrdes,
            lab_elis_1, lab_elis_2, lab_micr_1, lab_micr_2, res_isol, res_imuno, res_pcr
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    """
    
    for record in read_dbf(LEPTO_FILE):
        total_records += 1
        id_not = get_field(record, 'NU_NOTIFIC')
        if not id_not:
            continue
            
        bairro_raw = get_field(record, 'NM_BAIRRO')
        lat, lon, bairro = geocode_bairro(bairro_raw, centroids, default_center)
        
        ano_val = get_field(record, 'NU_ANO')
        ano = int(ano_val) if ano_val and ano_val.isdigit() else None
        
        core_vals = (
            id_not,
            get_field(record, 'TP_NOT'),
            get_field(record, 'ID_AGRAVO'),
            'LEPTOSPIROSE',
            parse_date(get_field(record, 'DT_NOTIFIC')),
            get_field(record, 'SEM_NOT'),
            ano,
            parse_date(get_field(record, 'DT_SIN_PRI')),
            get_field(record, 'SEM_PRI'),
            get_field(record, 'NM_PACIENT'),
            parse_date(get_field(record, 'DT_NASC')),
            decode_sinan_age(get_field(record, 'NU_IDADE_N')),
            map_sex(get_field(record, 'CS_SEXO')),
            get_field(record, 'CS_GESTANT'),
            get_field(record, 'CS_RACA'),
            get_field(record, 'CS_ESCOL_N'),
            get_field(record, 'ID_CNS_SUS'),
            get_field(record, 'NM_MAE_PAC'),
            get_field(record, 'SG_UF'),
            get_field(record, 'ID_MN_RESI'),
            bairro,
            get_field(record, 'NM_LOGRADO'),
            get_field(record, 'NU_NUMERO'),
            get_field(record, 'NM_COMPLEM'),
            get_field(record, 'NU_CEP'),
            get_field(record, 'CS_ZONA'),
            parse_date(get_field(record, 'DT_INVEST')),
            map_hospitalized(get_field(record, 'ATE_HOSP'), 'N'),
            parse_date(get_field(record, 'ATE_DT_INT')),
            get_field(record, 'CLASSI_FIN'),
            get_field(record, 'CRITERIO'),
            get_field(record, 'EVOLUCAO'),
            parse_date(get_field(record, 'DT_OBITO')),
            parse_date(get_field(record, 'DT_ENCERRA')),
            get_field(record, 'DS_OBS'),
            lat,
            lon
        )
        
        cursor.execute(insert_core_sql, core_vals)
        if cursor.rowcount == 0:
            duplicate_records += 1
            continue
            
        # Map Details
        details_vals = (
            id_not,
            get_field(record, 'ANT_CB_LAM'),
            get_field(record, 'ANT_CB_CRI'),
            get_field(record, 'ANT_CB_CAI'),
            get_field(record, 'ANT_CB_FOS'),
            get_field(record, 'ANT_CB_SIN'),
            get_field(record, 'ANT_CB_PLA'),
            get_field(record, 'ANT_CB_COR'),
            get_field(record, 'ANT_CB_ROE'),
            get_field(record, 'ANT_CB_GRA'),
            get_field(record, 'ANT_CB_TER'),
            get_field(record, 'ANT_CB_LIX'),
            get_field(record, 'ANT_CB_OUT'),
            get_field(record, 'ANT_OU_DES'),
            get_field(record, 'ANT_HUMANO'),
            get_field(record, 'ANT_ANIMAI'),
            get_field(record, 'CLI_FEBRE'),
            get_field(record, 'CLI_MIALGI'),
            get_field(record, 'CLI_CEFALE'),
            get_field(record, 'CLI_PROST'),
            get_field(record, 'CLI_CONGES'),
            get_field(record, 'CLI_PANTUR'),
            get_field(record, 'CLI_VOMITO'),
            get_field(record, 'CLI_DIARRE'),
            get_field(record, 'CLI_ICTERI'),
            get_field(record, 'CLI_RENAL'),
            get_field(record, 'CLI_RESPIR'),
            get_field(record, 'CLI_CARDIA'),
            get_field(record, 'CLI_HEMOPU'),
            get_field(record, 'CLI_HEMORR'),
            get_field(record, 'CLI_MENING'),
            get_field(record, 'CLI_OUTROS'),
            get_field(record, 'CLI_OTRDES'),
            get_field(record, 'LAB_ELIS_1'),
            get_field(record, 'LAB_ELIS_2'),
            get_field(record, 'LAB_MICR_1'),
            get_field(record, 'LAB_MICR_2'),
            get_field(record, 'RES_ISOL'),
            get_field(record, 'RES_IMUNO'),
            get_field(record, 'RES_PCR')
        )
        cursor.execute(insert_details_sql, details_vals)
        inserted_records += 1
        
    conn.commit()
    log(f"Leptospirosis ingestion finished. Total: {total_records}, Inserted: {inserted_records}, Duplicates skipped: {duplicate_records}")

def ingest_srag(conn, centroids, default_center):
    log("Ingesting SRAG cases...")
    cursor = conn.cursor()
    total_records = 0
    inserted_records = 0
    duplicate_records = 0
    
    if not os.path.exists(SRAG_FILE):
        log(f"Warning: SRAG file not found: {SRAG_FILE}")
        return
        
    insert_core_sql = """
        INSERT OR IGNORE INTO notificacoes (
            id_notificacao, tp_notificacao, agravo_id, doenca,
            data_notificacao, semana_notificacao, ano_notificacao,
            data_sintomas, semana_sintomas, paciente_nome,
            paciente_nascimento, paciente_idade_anos, paciente_sexo,
            paciente_gestante, paciente_raca, paciente_escolaridade,
            paciente_cns, paciente_mae, residencia_uf,
            residencia_municipio_ibge, residencia_bairro, residencia_logradouro,
            residencia_numero, residencia_complemento, residencia_cep,
            residencia_zona, data_investigacao, hospitalizado,
            data_internacao, classificacao_final, criterio_confirmacao,
            evolucao, data_obito, data_encerramento, observacao,
            latitude, longitude
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    """
    
    insert_details_sql = """
        INSERT OR IGNORE INTO srag_detalhes (
            id_notificacao, nosocomial, ave_suino, febre, tosse, garganta, dispneia, desc_resp,
            saturacao, diarreia, vomito, outro_sin, outro_des, dor_abd, fadiga, perd_olft, perd_pala,
            puerpera, cardiopati, hematologi, sind_down, hepatica, asma, diabetes, neurologic,
            pneumopati, imunodepre, renal, obesidade, obes_imc, out_morbi, morb_desc, tabag,
            vacina, mae_vac, m_amamenta, antiviral, tp_antiviral, out_antiv, vacina_cov,
            dose_1_cov, dose_2_cov, dose_ref, dose_2ref, dose_adic, dos_re_bi,
            fab_cov_1, fab_cov_2, fab_covrf, fab_covrf2, fab_adic, fab_re_bi,
            lote_1_cov, lote_2_cov, lote_ref, lote_ref2, lote_adic, lot_re_bi, trat_cov,
            pcr_resul, pos_pcrflu, tp_flu_pcr, pcr_fluasu, fluasu_out, pcr_flubli, flubli_out,
            pos_pcrout, pcr_vsr, pcr_para1, pcr_para2, pcr_para3, pcr_para4, pcr_adeno, pcr_metap,
            pcr_boca, pcr_rino, pcr_outro, ds_pcr_out, pcr_sars2, tomo_res, tomo_out, tp_tes_an,
            res_an, an_sars2, an_vsr, an_para1, an_para2, an_para3, an_adeno, an_outro,
            res_igg, res_igm, res_iga
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    """
    
    for record in read_dbf(SRAG_FILE):
        total_records += 1
        id_not = get_field(record, 'NU_NOTIFIC')
        if not id_not:
            continue
            
        bairro_raw = get_field(record, 'NM_BAIRRO')
        lat, lon, bairro = geocode_bairro(bairro_raw, centroids, default_center)
        
        # Parse Dates
        dt_not = parse_date(get_field(record, 'DT_NOTIFIC'))
        dt_sin = parse_date(get_field(record, 'DT_SIN_PRI'))
        
        # Week handling
        year = dt_not[:4] if dt_not else get_field(record, 'NU_ANO')
        sem_not = get_field(record, 'SEM_NOT')
        semana_notificacao = f"{year}{int(sem_not):02d}" if year and sem_not and sem_not.isdigit() else None
        
        year_sin = dt_sin[:4] if dt_sin else None
        sem_sin = get_field(record, 'SEM_PRI')
        semana_sintomas = f"{year_sin}{int(sem_sin):02d}" if year_sin and sem_sin and sem_sin.isdigit() else None
        
        ano = int(year) if year and year.isdigit() else None
        
        # Death date handling
        evolucao = get_field(record, 'EVOLUCAO')
        dt_obito = None
        if evolucao in ('2', '3'):
            dt_obito = parse_date(get_field(record, 'DT_EVOLUCA'))
            
        core_vals = (
            id_not,
            get_field(record, 'TP_NOT', '2'), # SRAG default to individual notification '2'
            None, # agravo_id
            'SRAG',
            dt_not,
            semana_notificacao,
            ano,
            dt_sin,
            semana_sintomas,
            get_field(record, 'NM_PACIENT'),
            parse_date(get_field(record, 'DT_NASC')),
            parse_srag_age(get_field(record, 'NU_IDADE_N'), get_field(record, 'TP_IDADE'), get_field(record, 'COD_IDADE')),
            map_sex(get_field(record, 'CS_SEXO')),
            get_field(record, 'CS_GESTANT'),
            get_field(record, 'CS_RACA'),
            get_field(record, 'CS_ESCOL_N'),
            get_field(record, 'NU_CNS'),
            get_field(record, 'NM_MAE_PAC'),
            get_field(record, 'SG_UF'),
            get_field(record, 'CO_MUN_RES'),
            bairro,
            get_field(record, 'NM_LOGRADO'),
            get_field(record, 'NU_NUMERO'),
            get_field(record, 'NM_COMPLEM'),
            get_field(record, 'NU_CEP'),
            get_field(record, 'CS_ZONA'),
            parse_date(get_field(record, 'DT_DIGITA')), # Fallback to digitacao date if no DT_INVEST
            map_hospitalized(get_field(record, 'HOSPITAL'), 'S'), # SRAG default is S (Hospitalized)
            parse_date(get_field(record, 'DT_INTERNA')),
            get_field(record, 'CLASSI_FIN'),
            get_field(record, 'CRITERIO'),
            evolucao,
            dt_obito,
            parse_date(get_field(record, 'DT_ENCERRA')),
            get_field(record, 'OBSERVA'),
            lat,
            lon
        )
        
        cursor.execute(insert_core_sql, core_vals)
        if cursor.rowcount == 0:
            duplicate_records += 1
            continue
            
        # Map Details
        details_vals = (
            id_not,
            get_field(record, 'NOSOCOMIAL'),
            get_field(record, 'AVE_SUINO'),
            get_field(record, 'FEBRE'),
            get_field(record, 'TOSSE'),
            get_field(record, 'GARGANTA'),
            get_field(record, 'DISPNEIA'),
            get_field(record, 'DESC_RESP'),
            get_field(record, 'SATURACAO'),
            get_field(record, 'DIARREIA'),
            get_field(record, 'VOMITO'),
            get_field(record, 'OUTRO_SIN'),
            get_field(record, 'OUTRO_DES'),
            get_field(record, 'DOR_ABD'),
            get_field(record, 'FADIGA'),
            get_field(record, 'PERD_OLFT'),
            get_field(record, 'PERD_PALA'),
            get_field(record, 'PUERPERA'),
            get_field(record, 'CARDIOPATI'),
            get_field(record, 'HEMATOLOGI'),
            get_field(record, 'SIND_DOWN'),
            get_field(record, 'HEPATICA'),
            get_field(record, 'ASMA'),
            get_field(record, 'DIABETES'),
            get_field(record, 'NEUROLOGIC'),
            get_field(record, 'PNEUMOPATI'),
            get_field(record, 'IMUNODEPRE'),
            get_field(record, 'RENAL'),
            get_field(record, 'OBESIDADE'),
            get_field(record, 'OBES_IMC'),
            get_field(record, 'OUT_MORBI'),
            get_field(record, 'MORB_DESC'),
            get_field(record, 'TABAG'),
            get_field(record, 'VACINA'),
            get_field(record, 'MAE_VAC'),
            get_field(record, 'M_AMAMENTA'),
            get_field(record, 'ANTIVIRAL'),
            get_field(record, 'TP_ANTIVIR'),
            get_field(record, 'OUT_ANTIV'),
            get_field(record, 'VACINA_COV'),
            get_field(record, 'DOSE_1_COV'),
            get_field(record, 'DOSE_2_COV'),
            get_field(record, 'DOSE_REF'),
            get_field(record, 'DOSE_2REF'),
            get_field(record, 'DOSE_ADIC'),
            get_field(record, 'DOS_RE_BI'),
            get_field(record, 'FAB_COV_1'),
            get_field(record, 'FAB_COV_2'),
            get_field(record, 'FAB_COVRF'),
            get_field(record, 'FAB_COVRF2'),
            get_field(record, 'FAB_ADIC'),
            get_field(record, 'FAB_RE_BI'),
            get_field(record, 'LOTE_1_COV'),
            get_field(record, 'LOTE_2_COV'),
            get_field(record, 'LOTE_REF'),
            get_field(record, 'LOTE_REF2'),
            get_field(record, 'LOTE_ADIC'),
            get_field(record, 'LOT_RE_BI'),
            get_field(record, 'TRAT_COV'),
            get_field(record, 'PCR_RESUL'),
            get_field(record, 'POS_PCRFLU'),
            get_field(record, 'TP_FLU_PCR'),
            get_field(record, 'PCR_FLUASU'),
            get_field(record, 'FLUASU_OUT'),
            get_field(record, 'PCR_FLUBLI'),
            get_field(record, 'FLUBLI_OUT'),
            get_field(record, 'POS_PCROUT'),
            get_field(record, 'PCR_VSR'),
            get_field(record, 'PCR_PARA1'),
            get_field(record, 'PCR_PARA2'),
            get_field(record, 'PCR_PARA3'),
            get_field(record, 'PCR_PARA4'),
            get_field(record, 'PCR_ADENO'),
            get_field(record, 'PCR_METAP'),
            get_field(record, 'PCR_BOCA'),
            get_field(record, 'PCR_RINO'),
            get_field(record, 'PCR_OUTRO'),
            get_field(record, 'DS_PCR_OUT'),
            get_field(record, 'PCR_SARS2'),
            get_field(record, 'TOMO_RES'),
            get_field(record, 'TOMO_OUT'),
            get_field(record, 'TP_TES_AN'),
            get_field(record, 'RES_AN'),
            get_field(record, 'AN_SARS2'),
            get_field(record, 'AN_VSR'),
            get_field(record, 'AN_PARA1'),
            get_field(record, 'AN_PARA2'),
            get_field(record, 'AN_PARA3'),
            get_field(record, 'AN_ADENO'),
            get_field(record, 'AN_OUTRO'),
            get_field(record, 'RES_IGG'),
            get_field(record, 'RES_IGM'),
            get_field(record, 'RES_IGA')
        )
        cursor.execute(insert_details_sql, details_vals)
        inserted_records += 1
        
    conn.commit()
    log(f"SRAG ingestion finished. Total: {total_records}, Inserted: {inserted_records}, Duplicates skipped: {duplicate_records}")

# ---------------------------------------------------------
# 6. HTML DDA Ingestion Engine
# ---------------------------------------------------------
def clean_int(val):
    if pd.isna(val):
        return None
    try:
        s = str(val).strip().split('.')[0]
        # Remove commas/thousands separators if any
        s = s.replace(',', '').replace(' ', '')
        if s.isdigit():
            return int(s)
    except Exception:
        pass
    return None

def clean_float(val):
    if pd.isna(val):
        return None
    try:
        s = str(val).strip()
        s = s.replace(',', '.').replace('%', '').replace(' ', '')
        return float(s)
    except Exception:
        pass
    return None

def ingest_dda_casos(conn):
    log("Ingesting DDA Cases HTML report...")
    if not os.path.exists(DDA_CASOS_HTML):
        log(f"Warning: DDA Casos report not found: {DDA_CASOS_HTML}")
        return
        
    cursor = conn.cursor()
    tables = pd.read_html(DDA_CASOS_HTML)
    df = tables[0]
    
    insert_sql = """
        INSERT OR REPLACE INTO dda_casos_semanal (
            semana, faixa_menor_1, faixa_1_a_4, faixa_5_a_9, faixa_10_mais, faixa_ign, faixa_total,
            plano_a, plano_b, plano_c, plano_ign, plano_total,
            us_mdda_implantada, us_que_informou, pct_informou
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    count = 0
    for idx, row in df.iterrows():
        # Column 0 is Semana
        semana_raw = str(row.iloc[0]).strip()
        if not semana_raw or semana_raw.upper() in ('TOTAL', 'NAN', 'SEMANA', 'IGN'):
            continue
            
        # Parse and format semana as YYYYWW (e.g. 202501)
        try:
            sem_num = int(semana_raw)
            semana_key = f"2025{sem_num:02d}"
        except ValueError:
            # Skip rows where Semana is not a number (e.g., headers or totals)
            continue
            
        # Extract columns by index to prevent Unicode column name matching errors
        faixa_m1 = clean_int(row.iloc[1])
        faixa_1_4 = clean_int(row.iloc[2])
        faixa_5_9 = clean_int(row.iloc[3])
        faixa_10m = clean_int(row.iloc[4])
        faixa_ign = clean_int(row.iloc[5])
        faixa_tot = clean_int(row.iloc[6])
        
        plano_a = clean_int(row.iloc[7])
        plano_b = clean_int(row.iloc[8])
        plano_c = clean_int(row.iloc[9])
        plano_ign = clean_int(row.iloc[10])
        plano_tot = clean_int(row.iloc[11])
        
        us_imp = clean_int(row.iloc[12])
        us_inf = clean_int(row.iloc[13])
        
        # Percent is column 14, standard reports save it multiplied by 100
        pct_inf_val = clean_float(row.iloc[14])
        pct_inf = round(pct_inf_val / 100.0, 2) if pct_inf_val is not None else None
        
        vals = (
            semana_key, faixa_m1, faixa_1_4, faixa_5_9, faixa_10m, faixa_ign, faixa_tot,
            plano_a, plano_b, plano_c, plano_ign, plano_tot,
            us_imp, us_inf, pct_inf
        )
        
        cursor.execute(insert_sql, vals)
        count += 1
        
    conn.commit()
    log(f"DDA Cases ingestion finished. Inserted/Updated {count} weekly records.")

def ingest_dda_surtos(conn):
    log("Ingesting DDA Surtos HTML report...")
    if not os.path.exists(DDA_SURTOS_HTML):
        log(f"Warning: DDA Surtos report not found: {DDA_SURTOS_HTML}")
        return
        
    cursor = conn.cursor()
    tables = pd.read_html(DDA_SURTOS_HTML)
    df = tables[0]
    
    insert_sql = """
        INSERT OR REPLACE INTO dda_surtos_semanal (
            semana, surtos_detectados, surtos_investigados, pct_investigados, surtos_com_amostras
        ) VALUES (?, ?, ?, ?, ?)
    """
    
    count = 0
    for idx, row in df.iterrows():
        # Column 0 is Semana
        semana_raw = str(row.iloc[0]).strip()
        if not semana_raw or semana_raw.upper() in ('TOTAL', 'NAN', 'SEMANA', 'IGN'):
            continue
            
        try:
            sem_num = int(semana_raw)
            semana_key = f"2025{sem_num:02d}"
        except ValueError:
            continue
            
        surtos_det = clean_int(row.iloc[1])
        surtos_inv = clean_int(row.iloc[2])
        
        # Percent is column 3, standard reports save it multiplied by 100
        pct_inv_val = clean_float(row.iloc[3])
        pct_inv = round(pct_inv_val / 100.0, 2) if pct_inv_val is not None else None
        
        surtos_amostras = clean_int(row.iloc[4])
        
        vals = (
            semana_key, surtos_det, surtos_inv, pct_inv, surtos_amostras
        )
        
        cursor.execute(insert_sql, vals)
        count += 1
        
    conn.commit()
    log(f"DDA Surtos ingestion finished. Inserted/Updated {count} weekly records.")

# ---------------------------------------------------------
# 7. Main Coordinator Flow
# ---------------------------------------------------------
def main():
    log("=== CISC HEALTH DATABASE ETL PIPELINE START ===")
    
    # 1. Load neighborhood spatial boundaries from GeoJSON
    centroids = load_neighborhood_centroids()
    
    # Calculate global average centroid for Belém
    if centroids:
        avg_lat = sum(c[0] for c in centroids.values()) / len(centroids)
        avg_lon = sum(c[1] for c in centroids.values()) / len(centroids)
        default_center = (avg_lat, avg_lon)
    else:
        # Hardcoded center of Belém coordinates fallback
        default_center = (-1.455, -48.480)
    log(f"Default geocoding center: {default_center}")
    
    # 2. Setup SQLite Database
    conn = init_database()
    
    try:
        # 3. Load Dengue
        ingest_dengue(conn, centroids, default_center)
        
        # 4. Load Leptospirose
        ingest_lepto(conn, centroids, default_center)
        
        # 5. Load SRAG
        ingest_srag(conn, centroids, default_center)
        
        # 6. Load DDA Cases
        ingest_dda_casos(conn)
        
        # 7. Load DDA Surtos
        ingest_dda_surtos(conn)
        
        log("Database ETL Pipeline completed successfully!")
    except Exception as e:
        log(f"CRITICAL ERROR in pipeline execution: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        conn.close()
        log("=== CISC HEALTH DATABASE ETL PIPELINE END ===")

if __name__ == "__main__":
    main()
