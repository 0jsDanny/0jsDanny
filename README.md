# Daniel S. de Jesus
### Software Engineer · Belém, PA, Brasil

I build production systems under real-world constraints: limited budgets, legacy government infrastructure, data privacy compliance (LGPD), and zero margin for downtime.

I solo-developed and shipped **[visabelem.net](https://visabelem.net)**, the digital sanitary surveillance platform for the city of Belém, serving a population of 1.3 million. Operating on a VPS and a highly-tuned SQLite database costing **~$500/year**, the platform facilitated over **$1M in municipal fee compliance** by validating payments against the municipal tax system (SIAT) in its first 5 months of operation.

The repositories in this workspace are extracted architectural patterns, production libraries, and ETL pipelines derived from the challenges I faced while building and scaling this infrastructure.

---

## 🛠️ Tech Stack & Tooling

![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite_WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-FF6F61?style=for-the-badge&logo=n8n&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📁 Portfolio Navigation Map

Below is a catalog of the modules, patterns, and case studies included in this repository:

| Category | Project / Subfolder | Core Tech | Key Habilities & Patterns Demonstrated |
| :--- | :--- | :---: | :--- |
| **Case Study** | [visabelem-architecture-case-study](./visabelem-architecture-case-study) | `System Design` | Modular monolith architecture, SQLite WAL optimization, polymorphism, phased database migration strategy. |
| **Go Engineering** | [cnae-risk-classifier](./cnae-risk-classifier) | `Go` | High-performance concurrent classification, bounded goroutine fan-out, GC pressure reduction using `sync.Pool`. |
| **Go Engineering** | [go-event-adapter-pattern](./go-event-adapter-pattern) | `Go` | Event-driven webhook adapter, payload normalization, exponential backoff, Dead Letter Queue (DLQ). |
| **Go Engineering** | [go-redis-cache-patterns](./go-redis-cache-patterns) | `Go` `Redis` | Type-safe Cache-Aside implementation using Go Generics, atomic distributed locks via Lua scripts. |
| **Go Engineering** | [go-n8n-webhook-validator](./go-n8n-webhook-validator) | `Go` | Security middleware, HMAC-SHA256 signature verification, timing-attack mitigation (`ConstantTimeCompare`). |
| **Data Engineering** | [receita-federal-cnpj-miner](./receita-federal-cnpj-miner) | `Python` `SQLite` | Streaming parsing of large-scale CSVs, spelling normalizations, checkpoint/resume mechanics, MEI detection. |
| **Data Engineering** | [node-etl-migration-scripts](./node-etl-migration-scripts) | `Node.js` | Batch ETL pipeline for PocketBase, resumable database synchronization using mapping states. |
| **GIS & Frontend** | [belem-geospatial-viz](./belem-geospatial-viz) | `React` `Leaflet` `ECharts` | Overpass API polygon repair (Shapely), canvas markers, interactive choropleth map. |
| **GIS & Frontend** | [react-health-dashboard-poc](./react-health-dashboard-poc) | `React` `TS` | High-performance dashboard widgets, SOLID component design, real-time indicator simulations. |
| **GIS & Frontend** | [visabelem-mock](./visabelem-mock) | `React` `TS` `Tailwind` | High-fidelity interactive prototype for stakeholder alignment, dual citizen/admin portal flows, and animated transitions. |

---

> **Open Source Scope:** The repositories in this workspace are independently authored demonstrations and extracted architectural patterns. The production government system (`visabelem.net`) is closed-source under municipal contract. No proprietary government data, classified municipal assets, or production source code have been published.

---

## ✉️ Contact & Links

*   **LinkedIn:** [linkedin.com/in/daniel-de-jesus](https://www.linkedin.com/in/daniel-de-jesus-909a10127)
*   **Email:** dpo@visabelem.net

---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
