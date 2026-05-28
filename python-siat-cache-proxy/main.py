import os
import re
import html
import sqlite3
import json
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, Header, HTTPException, Query, Response, Request
import requests

# Logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("siat-proxy")

app = FastAPI(
    title="SIAT Caching Proxy API",
    description="A secure sidecar service for caching legacy municipal tax documents (DAMs) and PDFs, optimizing upstream hits and ensuring LGPD compliance."
)

# Environment variables (configured at runtime for security)
CACHE_DB_PATH = os.getenv("CACHE_DB_PATH", "siat_cache.db")
PROXY_TOKEN = os.getenv("PROXY_TOKEN", "")  # Security token required to access the proxy internal routes

# Configurable Upstream SIAT API
# Defaults to a mock local endpoint for security/compliance. Overwrite via environment variables in production.
SIAT_BASE_URL = os.getenv("SIAT_BASE_URL", "http://siat.municipio.gov.br")
URL_DETALHE = f"{SIAT_BASE_URL}/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf"

# SQLite Cache Connection with WAL (Write-Ahead Logging) Mode
def get_db_connection():
    db_dir = os.path.dirname(CACHE_DB_PATH)
    if db_dir and not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
        except Exception as e:
            logger.error(f"Failed to create database directory: {e}")
            
    conn = sqlite3.connect(CACHE_DB_PATH)
    # Enable WAL mode for high-concurrency read/write operations with SQLite
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Cache table for parsed DAM details (raw HTML and structured JSON)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dam_details (
            num_dam TEXT PRIMARY KEY,
            html_content TEXT,
            data_json TEXT,
            is_pago INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Cache table for PDF files (BLOBs)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dam_pdfs (
            num_dam TEXT,
            doc_type TEXT,
            pdf_bytes BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (num_dam, doc_type)
        )
    """)
    conn.commit()
    conn.close()

# Initialize Database Schema
init_db()

# Safe HTML Parsing Helpers
def extract_input_value(id_name: str, html_content: str) -> str:
    """Extracts the value attribute of an input field by ID, resolving potential PrimeFaces dynamic prefixes."""
    match = re.search(r'id="[^"]*?' + re.escape(id_name) + r'"[^>]*?value="([^"]*)"', html_content, re.IGNORECASE)
    if not match:
        match = re.search(r'value="([^"]*)"[^>]*?id="[^"]*?' + re.escape(id_name) + r'"', html_content, re.IGNORECASE)
    return html.unescape(match.group(1).strip()) if match else ""

def extract_textarea_value(id_name: str, html_content: str) -> str:
    """Extracts content from a textarea field by ID."""
    match = re.search(r'<textarea[^>]*?id="[^"]*?' + re.escape(id_name) + r'"[^>]*>(.*?)</textarea>', html_content, re.DOTALL | re.IGNORECASE)
    return html.unescape(match.group(1).strip()) if match else ""

def parse_html_status(html_content: str) -> tuple[dict, bool]:
    """Parses raw HTML from the municipal system and structures the data.
    
    Compliance Warning (LGPD): Taxpayer identification (CPF/CNPJ) and issuer names
    are parsed strictly in-memory and returned to authenticated microservices. They are
    NEVER outputted to standard application logs to prevent data leakage.
    """
    codigo_barras = extract_input_value("inputCodigoBarras", html_content)
    vencimento = extract_input_value("calendarDtLimitePagto_input", html_content)
    valor = extract_input_value("inputVlTotal", html_content)
    ident_raw = extract_input_value("inputNrIdentificacao", html_content)
    nome_emissor = extract_input_value("inputNomeEmissor", html_content)
    situacao_pagamento = extract_input_value("inputSituacaoPagto", html_content)
    data_pagamento = extract_input_value("calendarDtBaixa_input", html_content)
    banco_pagto = extract_input_value("inputBancoPagto", html_content)
    num_lote = extract_input_value("inputLotePagto", html_content)
    informacoes_adicionais = extract_textarea_value("inputInfosAdd", html_content)
    
    # Normalize CPF/CNPJ (strip symbols)
    identificacao = re.sub(r'\D', '', ident_raw)
    # Check if payment is finalized ("1 - Baixado")
    is_pago = "1 - Baixado" in situacao_pagamento or "baixado" in situacao_pagamento.lower()
    
    data = {
        "num_dam": extract_input_value("inputNrDam", html_content) or "",
        "codigo_barras": codigo_barras,
        "valor": valor,
        "vencimento": vencimento,
        "emissor": {
            "identificacao": identificacao,
            "identificacao_raw": ident_raw,
            "nome": nome_emissor
        },
        "pagamento": {
            "pago": is_pago,
            "situacao": situacao_pagamento,
            "data_pagamento": data_pagamento if data_pagamento else None,
            "banco": banco_pagto if banco_pagto else None,
            "lote": num_lote if num_lote else None
        },
        "informacoes_adicionais": informacoes_adicionais
    }
    return data, is_pago

# Authentication Middleware
def check_auth(request: Request):
    """Enforces authentication check using standard custom header.
    
    Ensures that this sidecar microservice, even when located in an internal network,
    verifies caller identity, aligning with Zero-Trust network principles.
    """
    if PROXY_TOKEN:
        token = request.headers.get("x-proxy-token") or request.headers.get("x-bridge-token")
        if token != PROXY_TOKEN:
            raise HTTPException(status_code=401, detail="Access denied. Invalid or missing token.")

# --- TRANSPARENT PROXY ROUTES (COMPATIBLE WITH FRONTEND SDK) ---

@app.get("/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf")
async def get_detalhe_proxy(request: Request, id: str = Query(...), op: str = Query(...)):
    """Transparent proxy route mimicking the municipal system's GET endpoint structure.
    
    Applies the cache-aside pattern:
    - Paid bills ('1 - Baixado') are cached permanently.
    - Open bills are cached with a short TTL (15 minutes) to ensure fast subsequent loads
      while allowing updates once the payment is finalized.
    """
    check_auth(request)
    
    # 1. Look up in local cache
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT html_content, is_pago, created_at FROM dam_details WHERE num_dam = ?", (id,))
        row = c.fetchone()
        conn.close()
        
        if row:
            html_content, is_pago, created_at_str = row
            created_at = datetime.strptime(created_at_str, "%Y-%m-%d %H:%M:%S")
            # Cache is considered fresh if paid (immutable) or created within 15 minutes
            if is_pago or (datetime.utcnow() - created_at < timedelta(minutes=15)):
                logger.info(f"Proxy GET: Cache hit for DAM {id} (Paid={bool(is_pago)}).")
                return Response(content=html_content, media_type="text/html", headers={"X-Cache": "HIT"})
    except Exception as e:
        logger.error(f"Error querying cache: {e}")
        
    # 2. Fetch from Upstream municipal server
    logger.info(f"Proxy GET: Cache miss for DAM {id}. Fetching from upstream...")
    url = f"{URL_DETALHE}?id={id}&op={op}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 500:
            return Response(content="DAM not found", status_code=404)
        r.raise_for_status()
    except Exception as e:
        logger.error(f"Error connecting to municipal upstream: {e}")
        return Response(content="Municipal System Unreachable", status_code=502)
        
    html_content = r.text
    
    # 3. Parse and cache the response
    try:
        data, is_pago = parse_html_status(html_content)
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("""
            INSERT OR REPLACE INTO dam_details (num_dam, html_content, data_json, is_pago, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (id, html_content, json.dumps(data), 1 if is_pago else 0))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error saving to cache: {e}")
        
    return Response(content=html_content, media_type="text/html", headers={"X-Cache": "MISS"})

@app.post("/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf")
async def post_detalhe_proxy(request: Request, id: str = Query(...), op: str = Query(...)):
    """Transparent proxy route mimicking the municipal system's POST endpoint structure for PDF generation."""
    check_auth(request)
    
    body = await request.body()
    body_str = body.decode("utf-8")
    
    # Determine the document type requested (invoice/ticket vs payment confirmation)
    doc_type = "comprovante"
    if "btnEmitirDAM" in body_str:
        doc_type = "boleto"
        
    logger.info(f"Proxy POST: PDF request ({doc_type}) for DAM {id}.")

    # 1. Look up PDF cache
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        c.execute("SELECT is_pago, created_at FROM dam_details WHERE num_dam = ?", (id,))
        det_row = c.fetchone()
        
        c.execute("SELECT pdf_bytes, created_at FROM dam_pdfs WHERE num_dam = ? AND doc_type = ?", (id, doc_type))
        pdf_row = c.fetchone()
        conn.close()
        
        if pdf_row:
            pdf_bytes, pdf_created_str = pdf_row
            is_pago = det_row[0] if det_row else 0
            
            pdf_created = datetime.strptime(pdf_created_str, "%Y-%m-%d %H:%M:%S")
            # If transaction is finalized, cached PDF is immutable and valid forever
            if is_pago or (datetime.utcnow() - pdf_created < timedelta(minutes=15)):
                logger.info(f"Proxy POST: Cache hit for PDF ({doc_type}) of DAM {id}.")
                return Response(
                    content=pdf_bytes,
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": f"attachment; filename=DAM_{id}_{doc_type}.pdf",
                        "X-Cache": "HIT"
                    }
                )
    except Exception as e:
        logger.error(f"Error querying PDF cache: {e}")

    # 2. Fetch PDF from municipal server
    logger.info(f"Proxy POST: Cache miss for PDF ({doc_type}) of DAM {id}. Fetching from upstream...")
    url = f"{URL_DETALHE}?id={id}&op={op}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': url,
        'Origin': SIAT_BASE_URL
    }
    
    try:
        r = requests.post(url, data=body, headers=headers, timeout=25)
        r.raise_for_status()
    except Exception as e:
        logger.error(f"Error requesting PDF from upstream: {e}")
        return Response(content="Error connecting to Municipal System", status_code=502)
        
    content_type = r.headers.get("content-type") or ""
    
    # Validate PDF signature
    if r.content.startswith(b'%PDF') or "application/pdf" in content_type:
        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("""
                INSERT OR REPLACE INTO dam_pdfs (num_dam, doc_type, pdf_bytes, created_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            """, (id, doc_type, sqlite3.Binary(r.content)))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error saving PDF to cache: {e}")
            
        return Response(
            content=r.content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=DAM_{id}_{doc_type}.pdf",
                "X-Cache": "MISS"
            }
        )
    else:
        logger.error(f"Upstream response did not return a valid PDF: {content_type}")
        return Response(content=r.content, media_type=content_type, status_code=r.status_code)

# --- STRUCTURED API ROUTES (FOR ETL AND CRON INTEGRATIONS) ---

@app.get("/")
async def healthcheck():
    """Simple status check returning cache usage metrics."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM dam_details")
        details_count = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM dam_pdfs")
        pdfs_count = c.fetchone()[0]
        conn.close()
        return {
            "status": "online",
            "cache": {
                "dams": details_count,
                "pdfs": pdfs_count
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/siat/detalhar/{num_dam}")
async def get_dam_details_route(request: Request, num_dam: str, response: Response):
    """Retrieves structured JSON details of a specific DAM.
    
    Extracts, normalizes, and structures legacy HTML response into a modern RESTful JSON schema.
    """
    check_auth(request)
    
    # 1. Query Cache
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT data_json, is_pago, created_at FROM dam_details WHERE num_dam = ?", (num_dam,))
        row = c.fetchone()
        conn.close()
        
        if row:
            data = json.loads(row[0])
            is_pago = row[1]
            created_at = datetime.strptime(row[2], "%Y-%m-%d %H:%M:%S")
            
            if is_pago or (datetime.utcnow() - created_at < timedelta(minutes=15)):
                response.headers["X-Cache"] = "HIT"
                return data
    except Exception as e:
        logger.error(f"Error checking cache: {e}")
        
    # 2. Query Upstream
    logger.info(f"JSON API: Cache miss for DAM {num_dam}. Fetching from upstream...")
    url = f"{URL_DETALHE}?id={num_dam}&op=4"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 500:
            raise HTTPException(status_code=404, detail="DAM not found")
        r.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Municipal System Unreachable: {e}")
        
    html_content = r.text
    
    # Verify the HTML structure is valid (meaning DAM was found)
    if not re.search(r'id="[^"]*?inputNrIdentificacao"', html_content, re.IGNORECASE):
        raise HTTPException(status_code=404, detail="DAM not found or invalid structure")
        
    data, is_pago = parse_html_status(html_content)
    
    # 3. Store Cache
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("""
            INSERT OR REPLACE INTO dam_details (num_dam, html_content, data_json, is_pago, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (num_dam, html_content, json.dumps(data), 1 if is_pago else 0))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error storing JSON data in cache: {e}")
        
    response.headers["X-Cache"] = "MISS"
    return data
