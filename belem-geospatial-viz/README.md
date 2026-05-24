# Geospatial Data Processing & Visualization (GIS)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Apache ECharts](https://img.shields.io/badge/Apache_ECharts-AA232E?style=for-the-badge&logo=apache-echarts&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![GeoPandas](https://img.shields.io/badge/GeoPandas-15DB95?style=for-the-badge&logo=pandas&logoColor=white)
![Shapely](https://img.shields.io/badge/Shapely-3776AB?style=for-the-badge&logo=python&logoColor=white)

A demonstration of end-to-end Geospatial Engineering, starting from raw OpenStreetMap (OSM) data extraction to interactive frontend visualizations using React and Apache ECharts. 

Built to power the Geographic BI Dashboards for [visabelem.net](https://visabelem.net), visualizing the density of sanitary licenses across the city's neighborhoods and islands.

---

## 🛠️ The Pipeline

This project demonstrates two distinct but connected layers of engineering:

### 1. Point Mapping & Spatial Analysis (Leaflet)
Rendering specific geographic coordinates and interacting with metadata over map tiles.

**Highlights:**
*   **Leaflet Integration:** Uses `react-leaflet` to render a dark-themed base map (CartoDB Dark Matter).
*   **Vector Layers:** Overlays the Belém neighborhood boundaries (`GeoJSON`) dynamically underneath the points.
*   **Interactive Markers:** Renders custom `CircleMarker` elements for açaí points, colored by Sanitary District, with animated fly-to features upon click.
*   **Geolocation API:** Implements user geolocation to center the map on the user's coordinates.

### 2. Data Extraction & Geoprocessing (`extrair_bairros.py`)
Extracting accurate administrative boundaries from OpenStreetMap can be challenging due to multipolygons, unconnected lines, and varying admin levels.

**Highlights:**
*   **Overpass API Integration:** Uses the Overpass QL to query specific geographic relations (e.g., `admin_level=10` for Belém, plus manual inclusion of specific islands like Cotijuba and Combu).
*   **Geospatial Mathematics:** Uses `Shapely` to stitch disconnected lines (`LineString`) into unified polygons (`unary_union`, `polygonize`) to handle badly mapped OSM relations.
*   **Robustness:** Implements an exponential backoff/retry mechanism (`query_overpass`) to handle the frequent timeouts from public OSM servers.
*   **Geopandas Export:** Loads the cleaned geometry into a `GeoDataFrame` and exports it as a pristine `GeoJSON` file ready for web consumption.

### 3. Interactive Choropleth Visualization (Apache ECharts)
Rendering heavy GeoJSON polygons efficiently on the web requires specialized charting libraries.

**Highlights:**
*   **Apache ECharts Integration:** Uses `echarts-for-react` to register the custom GeoJSON (`echarts.registerMap`) and render an interactive Choropleth Map (Heatmap).
*   **Visual Mapping:** Dynamically colors the polygons based on data values (Licensing Density) using a gradient visual map (Yellow -> Orange -> Red).
*   **Interactivity:** Supports pan, zoom, and click events to update side-panel statistics reactively without re-rendering the entire SVG/Canvas map.
*   **Responsive UI:** Styled with Tailwind CSS and Lucide icons to present a modern, professional executive dashboard.

### 4. Data Anonymization & Privacy (`anonymize_acai.py`)
Public portfolios often require real-world datasets that contain sensitive Personally Identifiable Information (PII). 

**Highlights:**
*   **PII Removal:** Automatically replaces real owner names, professional IDs, and phone numbers with synthetic, context-aware alternatives.
*   **Deterministic Randomness:** Maintains data distribution (e.g., density per district) while ensuring no real person can be identified.
*   **JSON Processing:** Handles complex nested GeoJSON structures efficiently using Python's native `json` and `random` libraries.

---

## 📁 Project Structure

```text
/belem-geospatial-viz
├── /scripts                # Python Automation Scripts
│   ├── extrair_bairros.py  # OSM Geoprocessing (Shapely/GeoPandas)
│   └── anonymize_acai.py   # Data Sanitization (PII Removal)
├── /src                    # Frontend (React 18 + Vite)
│   ├── AcaiMapPage.tsx     # Leaflet Visualizer
│   └── ChoroplethMapPage.tsx # ECharts Visualizer
├── /public/data            # Processed GeoJSON & Sanitized Datasets
└── vite.config.ts          # Build Optimization (Vendor Splitting)
```

## 🚀 Running

### 🐍 Data Engineering (Optional)
If you wish to re-generate or re-sanitize the data:
1.  Ensure Python is installed with dependencies: `pip install geopandas shapely requests`.
2.  Run the extraction: `python scripts/extrair_bairros.py`.
3.  Run the anonymization: `python scripts/anonymize_acai.py`.

### ⚛️ Frontend Development
1.  Install dependencies: `npm install`.
2.  Run dev server: `npm run dev`.
3.  Build for production: `npm run build`.

---
*Created as part of my Geospatial Visualization Portfolio, demonstrating Full-Cycle Data Engineering and Frontend development.*
