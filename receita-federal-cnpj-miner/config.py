import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import sys
import os

def get_share_token():
    # 1. Try environment variable
    token = os.environ.get("RECEITA_SHARE_TOKEN")
    if token:
        return token.strip()
    
    # 2. Try loading from a local .env file (if it exists)
    try:
        if os.path.exists(".env"):
            with open(".env", "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("RECEITA_SHARE_TOKEN="):
                        return line.split("=", 1)[1].strip()
    except Exception:
        pass

    # 3. Interactive prompt fallback
    try:
        user_input = input("Enter Receita Federal Nextcloud share token: ").strip()
        if user_input:
            return user_input
    except Exception:
        pass
        
    raise ValueError(
        "Error: Receita Federal share token is required.\n"
        "Please provide it by setting the RECEITA_SHARE_TOKEN environment variable,\n"
        "defining it in a .env file, or running the script interactively."
    )

# Load configuration values
SHARE_TOKEN = get_share_token()
DATA_MONTH = "latest"  # Set to a specific month (e.g., "2026-05") or "latest" to auto-discover

def resolve_base_url():
    base = f"https://arquivos.receitafederal.gov.br/public.php/dav/files/{SHARE_TOKEN}/"
    if DATA_MONTH != "latest":
        return f"{base}{DATA_MONTH}/"
    
    # Auto-detect latest monthly folder under the share using WebDAV PROPFIND
    try:
        propfind_xml = """<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:resourcetype/>
  </d:prop>
</d:propfind>"""
        req = urllib.request.Request(
            base,
            data=propfind_xml.encode('utf-8'),
            headers={
                "Depth": "1",
                "Content-Type": "application/xml"
            },
            method="PROPFIND"
        )
        # 10 seconds timeout to prevent hanging if RFB servers are slow/offline
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read()
            root = ET.fromstring(content)
            ns = {'d': 'DAV:'}
            months = []
            for response_node in root.findall('.//d:response', ns):
                href = response_node.find('d:href', ns).text
                unquoted = urllib.parse.unquote(href)
                parts = [p for p in unquoted.split('/') if p]
                if parts:
                    last_part = parts[-1]
                    # Check if directory name matches YYYY-MM format
                    if len(last_part) == 7 and last_part[4] == '-' and last_part[:4].isdigit() and last_part[5:].isdigit():
                        months.append(last_part)
            if months:
                months.sort()
                latest_month = months[-1]
                sys.stdout.write(f"Auto-resolved latest dataset month: {latest_month}\n")
                sys.stdout.flush()
                return f"{base}{latest_month}/"
    except Exception as e:
        sys.stderr.write(f"Warning: Failed to auto-resolve latest dataset month ({e}). Using default 2026-05 fallback.\n")
        sys.stderr.flush()
    
    return f"{base}2026-05/"

BASE_URL = resolve_base_url()
DB_FILE = "dados_cnpj_belem_ativo.db"
TARGET_MUNICIPALITY_CODE = "0427"  # Belém/PA
CHUNK_SIZE = 1024 * 1024  # 1MB - Maximum bandwidth
TARGET_SITUACAO_ATIVA = "02"  # 02 = ATIVA
