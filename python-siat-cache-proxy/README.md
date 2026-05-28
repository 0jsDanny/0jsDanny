# Python SIAT Cache Proxy Sidecar

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite_WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

A high-performance, secure sidecar caching proxy built in Python using **FastAPI** and **SQLite (WAL Mode)**. It is designed to act as an intermediary buffer for querying and caching tax document (DAM) details and PDF receipts from legacy municipal government systems (SIAT Belém), preventing IP blacklisting and boosting transaction performance.

## 📌 Context & System Design

Extracted from the real production architecture of **visabelem.net**. The legacy municipal system (SIAT) has rate limits, high latency, and frequent downtimes, posing a risk of system failure when citizens pay taxes or issue licenses. 

This proxy solves these issues through a robust **Cache-Aside** strategy:
*   **Finalized Payments ("1 - Baixado"):** Since paid bills are immutable, the parsed data and PDF files are stored permanently in the local SQLite database. Future queries are resolved locally in less than 2ms.
*   **Pending Payments:** Open bills are cached temporarily with a **15-minute Time-To-Live (TTL)**. This avoids overloading the government servers on repeated checks while allowing the status to refresh once paid.
*   **SQLite WAL (Write-Ahead Logging) Persistence:** Configured with concurrent WAL journal mode and normal sync mode to ensure fast, concurrent read/write operations without locking the database under load.

```
                           +--------------------------+
                           |   visabelem.net Hooks    |
                           +------------+-------------+
                                        | (with Token Auth)
                                        v
                           +------------+-------------+
                           |  SIAT Cache Proxy        |
                           +------------+-------------+
                                        |
                 +----------------------+----------------------+
                 | Cache HIT                                   | Cache MISS
                 v                                             v
     +-----------+-----------+                     +-----------+-----------+
     | SQLite WAL Cache DB   |                     | Upstream SIAT Server  |
     +-----------------------+                     +-----------+-----------+
                                                               | (Parses & Caches)
                                                               v
```

---

## 🛡️ Privacy & LGPD Compliance (Privacy by Design)

Dealing with taxpayer data requires compliance with the Brazilian General Data Protection Law (**LGPD**). This proxy implements security measures directly into its codebase:

1.  **Zero PII Leakage in Logs:** Log outputs only display document transactional IDs (`num_dam`). Personally Identifiable Information (PII), such as taxpayer names, CPF/CNPJ, and additional payment details, are parsed strictly in-memory and stored inside the local SQLite database without exposing them to stdout/stderr.
2.  **Zero-Trust Token Authentication:** The proxy enforces internal route protection via the `PROXY_TOKEN` environment variable. Callers must pass the `x-proxy-token` header, preventing unauthorized lateral movements within the server network.
3.  **Configurable Upstream endpoint:** The target municipal URL is not hardcoded. The codebase defaults to a safe mock server (`http://siat.municipio.gov.br`) and allows production URLs to be injected dynamically at runtime via environment variables.

---

## 🚀 Usage & Deployment

### Environment Variables
*   `PORT`: The port the application will bind to (Default: `8000`).
*   `CACHE_DB_PATH`: Path to the SQLite database file (Default: `siat_cache.db`).
*   `PROXY_TOKEN`: Secret authorization token. If set, requires `x-proxy-token` on headers.
*   `SIAT_BASE_URL`: Base URL of the upstream municipal system (e.g., `http://siat.belem.pa.gov.br:8081`).

### ⚠️ Host Location & Geo-IP Blocking

In production environments, Brazilian municipal tax portals (such as Belém's SIAT) frequently configure Web Application Firewalls (WAFs) with strict **Geo-IP blocking** to mitigate automated scans, botnets, and DDoS attacks originating from abroad.

Therefore, if this proxy sidecar is deployed on a foreign VPS (e.g., US/Europe datacenters from AWS, DigitalOcean, Hetzner, or GCP), upstream requests to the real municipal server may return `403 Forbidden`, `502 Bad Gateway`, or connection timeouts.

**Recommended Solutions:**
1.  **Deploy in Brazil:** Host the application on a VPS or cloud provider located physically within Brazil (e.g., AWS São Paulo region `sa-east-1`, Azure `brazilsouth`, Umbler, or local hosting).
2.  **Proxy Tunneling:** If a foreign host is mandatory, configure the outgoing requests to route through a VPN or proxy service using a Brazilian IP address.

### Running Locally

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2.  Start the FastAPI server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```

### Running with Docker

Build and run the container securely:
```bash
# Build the image
docker build -t siat-cache-proxy .

# Run the container mapping persistence volume for SQLite WAL files
docker run -d \
  -p 8000:8000 \
  -e PROXY_TOKEN="my-secure-token" \
  -v $(pwd)/data:/app/data \
  siat-cache-proxy
```

---

## 🔌 API Endpoints

### 1. Transparent Proxy Routes (For legacy SDK compatibility)
Mimics the original endpoint structures of the municipal portal, allowing seamless drop-in replacement:
*   **GET** `/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf?id={num_dam}&op=4`
    *   Returns the cached or freshly fetched HTML page.
*   **POST** `/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf?id={num_dam}&op=4`
    *   Accepts form parameters (e.g., `btnEmitirDAM` or `btnRelPdf`) and streams back the pure PDF document.

### 2. Structured JSON API
*   **GET** `/api/siat/detalhar/{num_dam}`
    *   Parses, normalizes, and structures the HTML data, returning a clean, modern RESTful JSON schema.
*   **GET** `/`
    *   Simple health check returning metadata and local SQLite cache item count.

---

## 🧪 Testing

The project contains a test suite using `pytest` and `fastapi.testclient` that mocks upstream calls using safe, fictional HTML payloads (preventing connections to the live government server during test execution):

```bash
pytest test_main.py
```
