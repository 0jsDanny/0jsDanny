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
| **Go Engineering** | [go-cnpj-prospector](./go-cnpj-prospector) | `Go` | Multi-API fallback proxy, numeric & alphanumeric CNPJ validation (COCAD 01/2024), thread-safe memory cache. |
| **Go Engineering** | [go-sqlite-backup-daemon](./go-sqlite-backup-daemon) | `Go` `SQLite` | Disaster Recovery WAL-shipping replication daemon, file polling, gzip compression, S3 HTTP uploading. |
| **Go Engineering** | [go-pdf-signer](./go-pdf-signer) | `Go` | Cryptographic PDF PAdES signer & verifier service, PKCS#12 decoding, ByteRange hashing, RSA PKCS1v15 signatures. |
| **Go Engineering** | [go-audit-trail-middleware](./go-audit-trail-middleware) | `Go` | Cryptographic audit trail middleware (HMAC-SHA256), tamper-evident append-only JSON logging for LGPD. |
| **Go Engineering** | [go-cptec-proxy](./go-cptec-proxy) | `Go` | CPTEC XML weather & wave proxy, BrasilAPI JSON schema normalization & fallback, local memory cache, ISO-8859-1 translation. |
| **Open Data Spec** | [cptec-data-catalogs](./cptec-data-catalogs) | `Markdown` | Comprehensive simplified mappings and technical dictionary for CPTEC/INPE FTP and DataServer repositories. |
| **Backend Engineering** | [python-siat-cache-proxy](./python-siat-cache-proxy) | `Python` `FastAPI` `SQLite` | Sidecar caching proxy, Cache-Aside pattern (infinite paid cache vs 15-min TTL), SQLite WAL optimization, LGPD log privacy by design. |
| **Data Engineering** | [receita-federal-cnpj-miner](./receita-federal-cnpj-miner) | `Python` `SQLite` | Streaming parsing of large-scale CSVs, spelling normalizations, checkpoint/resume mechanics, MEI detection. |
| **Data Engineering** | [belem-transparency-analytics](./belem-transparency-analytics) | `Python` `pdfplumber` | Automated extraction and consolidation of municipal financial data (Lei 4320/64) from official Transparency Portals. Dynamically downloads PDFs, extracts complex nested tabular reports (Anexo 8, 9, 10, and Balancetes), and compiles cross-year comparative charts. |
| **Data Engineering** | [node-etl-migration-scripts](./node-etl-migration-scripts) | `Node.js` | Batch ETL pipeline for PocketBase, resumable database synchronization using mapping states. |
| **Data Engineering** | [belem-geospatial-risk-mapping](./belem-geospatial-risk-mapping) | `Python` `Leaflet` `Shapely` | GeoPDF/PDF coordinate extraction pipeline, UTM grid linear regression (`polyfit`), CPRM/Defesa Civil risk data miner and Leaflet viewer. |
| **GIS & Frontend** | [belem-geospatial-viz](./belem-geospatial-viz) | `React` `Leaflet` `ECharts` | Overpass API polygon repair (Shapely), canvas markers, interactive choropleth map. |
| **GIS & Frontend** | [react-health-dashboard-poc](./react-health-dashboard-poc) | `React` `TS` | High-performance dashboard widgets, SOLID component design, real-time indicator simulations. |
| **GIS & Frontend** | [visabelem-mock](./visabelem-mock) | `React` `TS` `Tailwind` | High-fidelity interactive prototype for stakeholder alignment, dual citizen/admin portal flows, and animated transitions. |
| **Public Health & GIS** | [cisc-situation-room](./cisc-situation-room) | `HTML` `JS` `Tailwind` | Interactive Situation Room dashboard (Videowall) mapping multi-sector alerts (epidemiological, meteorological, water levels) and dispatching community educational bulletins. |
| **Data Engineering** | [cisc-data-pipelines](./cisc-data-pipelines) | `Python` `SQLite` `SQL` | Health and climate ETL pipelines (SINAN, INMET, CEMADEN, Navy tides), statistical anomaly models (CUSUM, Spearman lag, logistic regression), and SQL database schemas (LGPD compliant - raw data omitted). |
| **Go Engineering** | [go-cisc-telemetry-hub](./go-cisc-telemetry-hub) | `Go` `gRPC` `GraphQL` | Central data ingestion and real-time distribution engine for the CISC Belém health-climate platform. Implements concurrent servers for gRPC and GraphQL Subscriptions (SSE). |
| **Security & Data** | [ghdb-map-generator](./ghdb-map-generator) | `Python` `HTML` `JS` | ETL pipeline processing large XML datasets (5.5MB) from ZIP files to generate an interactive tactical dashboard, demonstrating practical OSINT and vulnerability testing proficiency as a hobby. |

---

> **Open Source Scope:** The repositories in this workspace are independently authored demonstrations and extracted architectural patterns. The production government system is closed-source under municipal contract. No proprietary government data, classified municipal assets, or production source code have been published.

---

## ✉️ Contact & Links

*   **LinkedIn:** [linkedin.com/in/daniel-de-jesus](https://www.linkedin.com/in/daniel-de-jesus-909a10127)
*   **Email:** dpo@visabelem.net

---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
