"""
download_codem_pdfs.py
Extrai todos os links de PDF da página salva da CODEM e baixa os arquivos
para a pasta belem_maps/, nomeando cada arquivo com o nome do bairro.

Uso:
    python belem_maps/download_codem_pdfs.py
"""

import re
import sys
import time
import urllib.request
from pathlib import Path
from html.parser import HTMLParser

# Força UTF-8 no stdout (evita UnicodeEncodeError no terminal Windows)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# --- Configuração ---
HTML_FILE = Path(__file__).parent / "scratch" / "Bairros de Belém – CODEM.html"
OUTPUT_DIR = Path(__file__).parent / "pdfs" / "bairros"
DELAY_SEC = 1.5   # intervalo entre requests (respeito ao servidor)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}

# --- Parser: extrai pares (url_pdf, nome_bairro) ---
class CodemParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self._current_href = None
        self._in_text_span = False
        self.links = []  # lista de (url, nome)

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "a" and "href" in attrs_dict:
            href = attrs_dict["href"]
            if href.endswith(".pdf"):
                self._current_href = href
        if tag == "span" and attrs_dict.get("class") == "elementor-icon-list-text":
            self._in_text_span = True

    def handle_data(self, data):
        if self._in_text_span and self._current_href:
            nome = data.strip()
            if nome:
                self.links.append((self._current_href, nome))
                self._current_href = None
                self._in_text_span = False

    def handle_endtag(self, tag):
        if tag == "span":
            self._in_text_span = False


def sanitize_filename(name: str) -> str:
    """Remove caracteres invalidos para nomes de arquivo no Windows."""
    name = name.strip()
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    name = re.sub(r'\s+', '_', name)
    return name


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
    # Ler HTML local
    html_text = HTML_FILE.read_text(encoding="utf-8", errors="replace")

    parser = CodemParser()
    parser.feed(html_text)
    links = parser.links

    if not links:
        print("Nenhum link PDF encontrado. Verifique o arquivo HTML.")
        return

    print(f"Encontrados {len(links)} bairros com PDF.\n")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    ok = 0
    skip = 0
    fail = 0

    for url, nome in links:
        safe_name = sanitize_filename(nome)
        # Pega o número do prefixo da URL (ex: 001, 052) para manter ordem
        num_match = re.search(r'/(\d+)[_-]', url)
        prefix = num_match.group(1) if num_match else "000"
        filename = f"{prefix}_{safe_name}.pdf"
        dest = OUTPUT_DIR / filename

        if dest.exists():
            print(f"  [SKIP] Ja existe: {filename}")
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
