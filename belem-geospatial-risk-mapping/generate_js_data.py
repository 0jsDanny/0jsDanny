import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# 1. Bairros
geojson_path = BASE_DIR / "belem_bairros_supremo.geojson"
js_path = BASE_DIR / "belem_bairros_supremo.js"

if geojson_path.exists():
    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("const BELEM_GEOJSON = ")
        json.dump(data, f, ensure_ascii=False)
        f.write(";\n")
    print(f"Successfully generated JS data at: {js_path}")
else:
    print(f"Error: {geojson_path} not found.")

# 2. Riscos Geológicos
riscos_path = BASE_DIR / "belem_riscos_geologicos.geojson"
riscos_js_path = BASE_DIR / "belem_riscos_geologicos.js"

if riscos_path.exists():
    with open(riscos_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    with open(riscos_js_path, "w", encoding="utf-8") as f:
        f.write("const RISCOS_GEOJSON = ")
        json.dump(data, f, ensure_ascii=False)
        f.write(";\n")
    print(f"Successfully generated JS data at: {riscos_js_path}")
else:
    print(f"Error: {riscos_path} not found.")

