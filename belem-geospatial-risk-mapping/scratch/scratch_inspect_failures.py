import fitz
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PDF_DIR = BASE_DIR / "pdfs" / "riscos-geologicos"

def inspect_file(fname):
    path = PDF_DIR / fname
    doc = fitz.open(path)
    page = doc[0]
    drawings = page.get_drawings()
    
    print(f"\n=================== INSPECTING {fname} (Total drawings: {len(drawings)}) ===================")
    # Print drawings that have color and are NOT grayscale
    for i, d in enumerate(drawings):
        color = d.get("color")
        fill = d.get("fill")
        rect = d.get("rect")
        
        is_grayscale = True
        if color:
            r, g, b = color
            if abs(r - g) > 0.05 or abs(g - b) > 0.05:
                is_grayscale = False
        if fill:
            r, g, b = fill
            if abs(r - g) > 0.05 or abs(g - b) > 0.05:
                is_grayscale = False
                
        if not is_grayscale:
            c_str = f"({color[0]:.3f}, {color[1]:.3f}, {color[2]:.3f})" if color else "None"
            f_str = f"({fill[0]:.3f}, {fill[1]:.3f}, {fill[2]:.3f})" if fill else "None"
            print(f"  Drawing {i}: rect={rect}, color={c_str}, fill={f_str}, type={d['type']}, items={len(d['items'])}")
            
    doc.close()

def main():
    for fname in ["PA_BELEM_SR_030_CPRM.pdf", "PA_BELEM_SR_091_CPRM.pdf", "PA_BELEM_SR_093_CPRM.pdf"]:
        inspect_file(fname)

if __name__ == "__main__":
    main()
