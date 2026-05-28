"""
test_pdf_vectors.py
Testa se os PDFs da CODEM contêm geometrias vetoriais extraíveis (paths do ArcGIS/QGIS).

Analisa:
  - Quantidade de paths vetoriais por página
  - Bounding boxes dos paths
  - Amostra de coordenadas brutas
  - Determina se é PDF vetorial (GIS export) ou raster (scan/imagem)

Uso:
    python belem_maps/test_pdf_vectors.py
"""

import sys
import json
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ERRO: instale pymupdf: pip install pymupdf")
    sys.exit(1)

PDF_FILE = Path(__file__).parent.parent / "pdfs" / "bairros" / "002_Cidade_Velha.pdf"

def analyze_page_drawings(page):
    """Extrai todos os paths vetoriais de uma página PyMuPDF."""
    drawings = page.get_drawings()
    return drawings

def classify_pdf(pdf_path: Path):
    doc = fitz.open(pdf_path)
    print(f"\n{'='*60}")
    print(f"Arquivo : {pdf_path.name}")
    print(f"Paginas : {doc.page_count}")
    print(f"Metadata: {json.dumps(doc.metadata, ensure_ascii=False, indent=2)}")

    page = doc[0]
    print(f"\nTamanho da pagina : {page.rect}")
    print(f"Rotacao           : {page.rotation}")

    # --- Imagens embutidas ---
    images = page.get_images(full=True)
    print(f"\nImagens na pagina : {len(images)}")
    for img in images[:3]:
        xref, smask, w, h, bpc, cs, *_ = img
        print(f"  xref={xref}  {w}x{h}px  bpc={bpc}  cs={cs}")

    # --- Paths vetoriais ---
    drawings = analyze_page_drawings(page)
    print(f"\nPaths vetoriais   : {len(drawings)}")

    if not drawings:
        print("\n[CONCLUSAO] PDF RASTER — nenhum path vetorial encontrado.")
        print("  Estrategia necessaria: georeferenciamento da imagem + digitalizacao.")
        doc.close()
        return

    # Resumo dos tipos de path
    type_counts = {}
    for d in drawings:
        t = d.get("type", "?")
        type_counts[t] = type_counts.get(t, 0) + 1
    print(f"  Tipos de path: {type_counts}")

    # Mostrar as 5 maiores areas (provavelmente os poligonos de bairro)
    def area(d):
        r = d.get("rect")
        if r:
            return (r[2] - r[0]) * (r[3] - r[1])
        return 0

    top = sorted(drawings, key=area, reverse=True)[:5]
    print(f"\nTop-5 paths por area (coordenadas PDF user-space):")
    for i, d in enumerate(top):
        r = d.get("rect")
        color = d.get("color") or d.get("fill")
        items = d.get("items", [])
        # items sao tuplas: (tipo, *args) onde tipo in ('l','c','re','qu')
        npts = len(items)
        print(f"  [{i+1}] rect={r}  color={color}  n_items={npts}")
        # Mostrar primeiros pontos dos primeiros items
        sample = []
        for item in items[:8]:
            itype = item[0]
            if itype == 'l':   # line: (type, p1, p2)
                sample.append(item[1])
            elif itype == 'c': # curve: (type, p1, p2, p3, p4)
                sample.append(item[1])
            elif itype == 're': # rect: (type, rect)
                sample.append(item[1].tl)
        if sample:
            print(f"       amostra de pontos (PDF space): {sample[:4]}")

    # Verificar se ha texto (nome do bairro) detectavel
    text = page.get_text("text")
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    print(f"\nTexto extraido ({len(lines)} linhas, primeiras 15):")
    for l in lines[:15]:
        print(f"  {l}")

    # --- Conclusao ---
    print(f"\n{'='*60}")
    if len(drawings) > 50:
        print("[CONCLUSAO] PDF VETORIAL RICO — provavel export de ArcGIS/QGIS.")
        print("  Paths extraiveis. Coordenadas em PDF user-space (pontos tipograficos).")
        print("  Necessario: converter de PDF space para UTM/WGS84 usando a grade do mapa.")
    elif len(drawings) > 5:
        print("[CONCLUSAO] PDF VETORIAL PARCIAL — tem paths mas pode misturar raster.")
        print("  Investigar quais paths correspondem ao poligono do bairro.")
    else:
        print("[CONCLUSAO] PDF predominantemente RASTER.")
        print("  Poucos paths — provavelmente so bordas/caixas de texto.")

    doc.close()

if __name__ == "__main__":
    if not PDF_FILE.exists():
        # Tenta qualquer PDF na pasta
        pdfs = list((Path(__file__).parent.parent / "pdfs" / "bairros").glob("*.pdf"))
        if not pdfs:
            print("Nenhum PDF encontrado em belem_maps/pdfs/")
            sys.exit(1)
        PDF_FILE = sorted(pdfs)[1]  # pega o segundo (001 é Aldeia)

    classify_pdf(PDF_FILE)
