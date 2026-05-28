import fitz
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PDF_DIR = BASE_DIR / "pdfs" / "riscos-geologicos"

def main():
    pdf_paths = sorted(PDF_DIR.glob("PA_BELEM_SR_*.pdf"))[:10]
    for path in pdf_paths:
        doc = fitz.open(path)
        page = doc[0]
        drawings = page.get_drawings()
        
        found = []
        for i, d in enumerate(drawings):
            color = d.get("color")
            rect = d.get("rect")
            if color and rect:
                r, g, b = color
                # Match Red or Orange boundary inside map viewport (y < 580)
                if r > 0.8 and b < 0.3 and rect.y1 < 580 and rect.x0 > 220 and rect.x1 < 880:
                    found.append((i, color, rect, len(d.get("items", []))))
                    
        print(f"{path.name} -> Found matching drawings: {len(found)}")
        for idx, color, rect, items in found:
            print(f"  Drawing {idx}: color=({color[0]:.3f}, {color[1]:.3f}, {color[2]:.3f}), rect={rect}, items={items}")
        doc.close()

if __name__ == "__main__":
    main()
