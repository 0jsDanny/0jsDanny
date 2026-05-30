# Daniel S. de Jesus

Software Engineer based in Belém, Brazil. I build production systems for real constraints: limited budget, legacy government infrastructure, LGPD data privacy obligations, and zero margin for downtime.

I shipped [visabelem.net](https://visabelem.net) — a public digital services platform for the Sanitary Surveillance of Belém — solo. The system processes business licenses, municipal fees, and health inspection workflows for a city of 1.3 million people. It's been live since January 2026.

The infrastructure runs at **~$500/year**. In its first 5 months of operation, the system facilitated over **$1M in municipal fee compliance** by validating payments against the municipal tax system (SIAT). That's a 2000:1 infrastructure ROI — achieved on a VPS, an S3-compatible object store, and a well-tuned SQLite database.

The repositories here are extracted patterns, architecture case studies, and engineering proofs-of-concept from problems I've actually had to solve.

---

Engenheiro de Software baseado em Belém, Brasil. Construo sistemas de produção para restrições reais: orçamento limitado, infraestrutura legada de governo e zero tolerância a downtime.

---

## What I'm drawn to technically

- **Concurrency and resource control in Go** — goroutine lifecycle, semaphore patterns, GC pressure reduction via `sync.Pool`.
- **Low-operational-cost architecture** — SQLite WAL, embedded databases, and knowing *when not* to use distributed systems.
- **Privacy-by-design under regulatory constraints (LGPD/GDPR)** — audit trails, data minimization, and role-based access control for government systems handling citizen PII at scale.
- **Integrating with legacy systems** — session-stateful HTTP scraping, HMAC authentication bridges, ETL pipelines for dirty real-world data.
- **Distributed system primitives** — atomic Redis locks with Lua scripts, exponential backoff, dead letter queues.

---

## Stack

![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite_WAL-003B57?style=flat&logo=sqlite&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-FF6F61?style=flat&logo=n8n&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white)

---

## 🏙️ Production Systems

**[visabelem.net](https://visabelem.net)** — Public digital services platform for the Sanitary Surveillance of Belém (SESMA). Handles business licensing, health inspections, and municipal fee collection. Solo-built and deployed on a Contabo VPS + IDrive e2 (S3-compatible) + Amazon SES. Source is closed by municipal contract.

**[cisc-situation-room](./cisc-situation-room)** — Interactive Situation Room dashboard (Videowall) for the Health and Climate Information Center of Belém (CISC), mapping multi-sector alerts (epidemiological, meteorological, water levels, sanitary compliance) and generating community educational bulletins.

**[cisc-data-pipelines](./cisc-data-pipelines)** — Health and climate ETL pipelines (SINAN, INMET, CEMADEN, Navy tides), statistical anomaly models (CUSUM, Spearman lag, logistic regression), and SQL database schemas developed for the CISC Belém health-climate platform (LGPD compliant - raw database and private case files omitted).

**[visabelem-mock](https://github.com/0jsDanny/visabelem-mock)** — Interface prototype built before the backend existed, to get stakeholder buy-in from city managers. React + Vite + TypeScript + Tailwind. Covers the triage flow, business portal, and operational dashboard.

**[visabelem-architecture-case-study](https://github.com/0jsDanny/visabelem-architecture-case-study)** — Technical deep-dive into the architectural decisions: Modular Monolith vs. microservices, SQLite → PostgreSQL migration playbook, legacy SIAT tax system integration, LGPD-compliant data handling for citizen PII, and layered security model.

---

## ⚙️ Engineering Patterns

**[cnae-risk-classifier](https://github.com/0jsDanny/cnae-risk-classifier)** — Go library for concurrent sanitary risk classification by CNAE (Brazilian economic activity code). Demonstrates bounded goroutine fan-out via buffered channel semaphore, context cancellation, `sync.Once` for first-error capture, and GC pressure reduction via `sync.Pool`. Zero external dependencies.

**[go-redis-cache-patterns](https://github.com/0jsDanny/go-redis-cache-patterns)** — Generic `Cache-Aside[T any]` pattern and atomic `DistributedLock` using a Lua script for ownership-validated deletion (prevents lock-stealing). Tested with `miniredis` — no running Redis instance required.

**[go-event-adapter-pattern](https://github.com/0jsDanny/go-event-adapter-pattern)** — Event-Driven Architecture in pure Go. Normalizes heterogeneous form payloads (Tally vs. Internal) into a `StandardEvent` contract, dispatches webhooks asynchronously (fire-and-forget goroutine), and implements Exponential Backoff + Dead Letter Queue for resilience. Uses `sync.Pool` for zero-allocation JSON encoding under load.

**[go-n8n-webhook-validator](https://github.com/0jsDanny/go-n8n-webhook-validator)** — HTTP middleware for HMAC-SHA256 webhook signature validation. Guards against timing attacks via `subtle.ConstantTimeCompare` and correctly handles the HTTP request body read state. Used in production to authenticate n8n orchestrator callbacks.

**[go-cnpj-prospector](https://github.com/0jsDanny/go-cnpj-prospector)** — High-availability CNPJ querying service in Go. Integrates multi-API fallbacks (ReceitaWS, BrasilAPI, local DB), thread-safe memory caching, and COCAD 01/2024 compliance.

**[go-sqlite-backup-daemon](https://github.com/0jsDanny/go-sqlite-backup-daemon)** — Resilient disaster recovery daemon written in Go. Monitores WAL file generation, ships compressed backups (gzip) to S3-compatible storage, and handles network retry failures gracefully.

**[go-pdf-signer](https://github.com/0jsDanny/go-pdf-signer)** — Cryptographic PDF signing microservice in Go. Implements PAdES-compliant digital signatures, ByteRange hashing, PKCS#12 certificate parsing, and signature verification.

**[go-audit-trail-middleware](https://github.com/0jsDanny/go-audit-trail-middleware)** — HTTP middleware in Go for tamper-evident activity logging. Generates HMAC-SHA256 authenticated log entries for LGPD compliance in an append-only structure.

**[go-cptec-proxy](https://github.com/0jsDanny/go-cptec-proxy)** — Go proxy service for the CPTEC/INPE meteorological XML API. Translates ISO-8859-1 encodings, normalizes payloads to JSON, and implements thread-safe memory caching with fallbacks.

---

## 📊 Data Engineering

**[node-etl-migration-scripts](https://github.com/0jsDanny/node-etl-migration-scripts)** — Node.js scripts used in production for large-scale ETL. Covers SQLite → PocketBase migration, batch processing, exponential backoff with checkpointing (resumable across crashes), and sanitization of real-world legacy dirty data.

**[receita-federal-cnpj-miner](https://github.com/0jsDanny/receita-federal-cnpj-miner)** — Python pipeline that downloads and processes the full Brazilian Federal Revenue CNPJ dataset (gigabytes of ZIP/CSV), extracting only active businesses from a target municipality. Streaming processing to avoid OOM, phase checkpointing, and optimized relational modeling in SQLite.

**[belem-geospatial-viz](https://github.com/0jsDanny/belem-geospatial-viz)** — Geospatial data processing (GeoPandas, Shapely) to extract and repair geographic polygons from the Overpass API (OpenStreetMap), exported to GeoJSON. React + Apache ECharts frontend renders high-performance interactive choropleth maps.

**[belem-geospatial-risk-mapping](https://github.com/0jsDanny/belem-geospatial-risk-mapping)** — Python spatial data mining pipeline. Extracts UTM coordinates from CPRM/Defesa Civil risk map PDFs using linear regressions (`polyfit`), cleans geometry shapes, and plots active landslide/flood risk sectors in a Leaflet map.

**[python-siat-cache-proxy](https://github.com/0jsDanny/python-siat-cache-proxy)** — High-performance sidecar caching proxy for the municipal tax system (SIAT). Implements Cache-Aside, WAL-shipping, and LGPD-compliant data masking using Python, FastAPI, and SQLite.

**[cptec-data-catalogs](https://github.com/0jsDanny/cptec-data-catalogs)** — Data dictionary and mapping specification of meteorological repositories at CPTEC/INPE. Simplified schemas for wave forecasts, precipitation data, and weather forecasts.

**[react-health-dashboard-poc](https://github.com/0jsDanny/react-health-dashboard-poc)** — High-fidelity healthcare monitoring dashboard built with React and TypeScript. Demonstrates SOLID component design, custom hooks for real-time telemetry, and modular widgets.

**[ghdb-map-generator](./ghdb-map-generator) (OSINT & Security)** — Passive OSINT audit tool. Includes a Python ETL pipeline that processes 5.5MB of ZIP-compressed Google Hacking Database XML data and outputs a highly optimized, interactive HTML/JS tactical dashboard in Portuguese.

---

## Education

B.Sc. Computer Science — UNIAMÉRICA (2022-2026)

---

📫 [LinkedIn](https://www.linkedin.com/in/daniel-de-jesus-909a10127) · [0jsdanny@gmail.com]
