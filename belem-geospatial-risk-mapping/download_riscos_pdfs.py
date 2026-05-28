"""
download_riscos_pdfs.py
Extrai links de PDF da página estática da Defesa Civil e baixa os arquivos
de riscos geológicos para a pasta belem_maps/pdfs/riscos-geologicos/.

Uso:
    python belem_maps/download_riscos_pdfs.py
"""

import re
import sys
import time
import urllib.request
import quopri
from pathlib import Path

# Força UTF-8 no stdout (evita UnicodeEncodeError no terminal Windows)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# --- Configuração ---
BASE_DIR = Path(__file__).resolve().parent
MHTML_FILE = BASE_DIR / "scratch" / "view-source_https___defesacivil.belem.pa.gov.br_riscos-geologicos_.mhtml"
OUTPUT_DIR = BASE_DIR / "pdfs" / "riscos-geologicos"
DELAY_SEC = 1.5   # intervalo entre requests (respeito ao servidor)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            dest.write_bytes(resp.read())
        return True
    except Exception as e:
        print(f"  ✗ ERRO: {e}")
        return False


def main():
    if not MHTML_FILE.exists():
        print(f"Erro: Arquivo auxiliar {MHTML_FILE} não encontrado.")
        return

    print("Lendo e decodificando página estática MHTML...")
    content = MHTML_FILE.read_bytes()
    decoded = quopri.decodestring(content)
    html_text = decoded.decode('utf-8', errors='replace')

    # Construímos a lista completa de 125 setores + o arquivo de índice A3-Indice.pdf.
    # Fazemos isso porque o site da Defesa Civil tem erros/typos no HTML:
    # - O botão do Setor 024 aponta para o PDF do Setor 023.
    # - O botão do Setor 046 aponta para o PDF do Setor 003.
    # No entanto, os arquivos corretos (SR_024 e SR_046) existem no servidor e são baixados por este script.
    pdf_links = ["https://defesacivil.belem.pa.gov.br/wp-content/uploads/2023/03/A3-Indice.pdf"]
    for i in range(1, 126):
        num_str = f"{i:03d}"
        pdf_links.append(f"https://defesacivil.belem.pa.gov.br/wp-content/uploads/2023/setores_de_risco/PA_BELEM_SR_{num_str}_CPRM.pdf")

    print(f"Encontrados {len(pdf_links)} links de PDF para download.\n")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    ok = 0
    skip = 0
    fail = 0

    for url in pdf_links:
        filename = url.split("/")[-1]
        dest = OUTPUT_DIR / filename

        if dest.exists():
            print(f"  [SKIP] Já existe: {filename}")
            skip += 1
            continue

        print(f"  [DOWN] {filename}")
        print(f"         {url}")
        if download(url, dest):
            size_kb = dest.stat().st_size // 1024
            print(f"         OK ({size_kb} KB)")
            ok += 1
        else:
            fail += 1

        time.sleep(DELAY_SEC)

    print(f"\n{'='*50}")
    print(f"Concluído: {ok} baixados, {skip} já existiam, {fail} erros")
    print(f"Pasta de saída: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()
