# VisaBelém — Architecture Case Study

![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite_WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-FF6F61?style=for-the-badge&logo=n8n&logoColor=white)
![Traefik](https://img.shields.io/badge/Traefik-24A1C1?style=for-the-badge&logo=traefik&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

> *This repository documents engineering decisions and architectural patterns. All published code in this workspace represents standalone, independently re-implemented demonstrations of the patterns used — not extracted production source code. No database schemas, operational data, classified workflows, or municipal proprietary assets from SESMA/Prefeitura de Belém have been published. The production source code (`visabelem-v1`) remains closed-source under government contract.*

---

## The Problem

The Sanitary Surveillance Department (DEVISA/SESMA) of Belém managed thousands of licensing processes per year through a fragmented manual workflow:

- Citizens had to scan, merge and organize fees, receipts, and technical documents into a single PDF file — transferring bureaucratic load to the weakest point of the chain.
- Payment verification required a human to manually query an external tax system (SIAT) for each individual application.
- Servers had to re-enter data into a generic protocol system (G-Doc) that was entirely disconnected from the sanitary database, creating duplicate records.
- All compliance notices ("cumpra-se") were sent by email, creating legal traceability gaps.
- The risk classification for 80,000+ active legal entities in the municipality depended entirely on manual judgment.

The constraint: a very small technical team, tight infrastructure budget, and no room for downtime during annual peak renewal periods.

---

## The Solution

A modular monolith — single deployable binary — exposing two separate portals:

- **Citizen Portal:** self-service licensing, fee payment, document upload, process tracking, certificate download.
- **Admin Panel:** triage queue, parallel sector evaluation, inspection workflow, batch document generation, strategic dashboard with geospatial CNAE distribution.

### Stack

| Layer | Technology | Reason |
|---|---|---|
| Backend | Go (single binary) | Sub-5ms API latency, <100MB RAM under full load, no runtime dependencies |
| Database | SQLite (WAL mode) | Zero-latency embedded SQL; architecture is ORM-abstracted for future PostgreSQL migration |
| Cache / Pub-Sub | Redis | Background job queuing and async notification dispatch |
| Frontend | React 19 + Vite + TypeScript | SPA with PWA support for offline-capable inspector workflow |
| Workflow engine | n8n | ETL orchestration and retry logic for unreliable legacy integrations |
| Reverse proxy | Traefik | Automatic SSL, rate limiting, HTTP verb restriction |
| Edge | Cloudflare | WAF, DDoS mitigation, CDN |

Capacity benchmarks (Isolated PocketBase/Go engine benchmarks on equivalent hardware. Real-world end-to-end production capacity varies due to network proxies, WAF rules, and legacy database synchronizations):

| Metric | Expected peak (Belém) | Measured capacity (Engine) | Safety margin |
|---|---|---|---|
| Write ops | ~50 req/min | >10,000 req/sec | >12,000% |
| Read ops | ~500 req/min | >25,000 req/sec | Extreme |
| API latency | <200ms acceptable | <5ms typical | Real-time |

---

## Key Engineering Decisions

### 1. The Licensee Abstraction

The system unifies legal entities (companies, CNPJ) and individual professionals (autonomous workers, CPF) into a single polymorphic domain model:

```go
type Licensee struct {
    ID             string    // Internal PocketBase UUID
    Type           string    // "PJ" or "PF"
    DocumentNumber string    // CNPJ or CPF (digits only)
    MunicipalInscr string    // Primary key for SEFIN integration
    Name           string
    TradeName      string
    Cnaes          []string  // ["561120100", "477170100"]
    IsMEI          bool      // Mapped from opcao_mei: 'S'/'N'
    EconomicRisk   string    // "BAIXO", "MEDIO", "ALTO" (calculated)
    Address        Address
    LastSyncAt     time.Time
    StatusSefin    string    // "02" = Active
}
```

This eliminated two separate processing pipelines and allowed a single risk calculation engine to handle both entity types.

### 2. Dual-Mode Sync Strategy

The municipal tax authority (SEFIN) exposes two database views. Rather than calling these on every request, the system implements a two-layer cache:

- **Batch sync (every 4 hours):** fetches changed records since `LastSyncAt`, transforms and upserts into local SQLite.
- **On-demand sync:** if a user's local record is older than 24h at login time, a targeted query fires before returning the response.

This means the system continues operating if the legacy integration is down — it serves from the local authoritative cache and queues reconciliation for when the external system recovers.

### 3. The Financial Gatekeeper

License emission is blocked until tax payment is confirmed. The validation logic:

```go
func CheckFinancialStatus(licenseeID string) error {
    dams := repository.FetchDAMs(licenseeID)
    for _, dam := range dams {
        if dam.IsOverdue() && !dam.IsPaid() {
            return ErrOutstandingDebt{
                Amount:  dam.Value,
                DueDate: dam.DueDate,
            }
        }
    }
    return nil
}
```

A DAM (municipal tax document) uniqueness constraint prevents the same payment from being reused across multiple processes — a fraud vector that was identified and closed during the security audit.

### 4. Risk-Based Routing

The highest-risk CNAE among all activities registered for a business determines the processing tier:

- **Low risk + payment confirmed:** license issued automatically, no human intervention.
- **Medium risk:** protocol team can route to full review or simplified track.
- **High risk:** mandatory parallel dispatch to all competent sanitary divisions (DVSA, DVSE, DVSCEP, DVSDM). The license generation is blocked until every sector has validated every CNAE under their jurisdiction. A business with 4 CNAEs across 2 sectors generates 4 independent validation requirements.

This parallel approval model replaced a sequential manual process that had no enforced completion gate.

### 5. QSA-Based Company Binding

When a user authenticates with their CPF, the system automatically queries the municipal commercial registry (via SEFIN's QSA data) and surfaces all companies where that CPF appears as a partner or administrator. The user selects which entity they are acting for — no manual CNPJ entry required. A separate digital proxy mechanism allows representation of companies where the user is not a registered partner.

### 6. Event-Driven Architecture (EDA) & Legacy Decoupling

The municipal tax system (SIAT) experiences daily instability and external email SMTP servers are notoriously slow. To prevent cascading failures and API timeouts, the system relies on asynchronous decoupling rather than synchronous blocking calls.

The core Go backend writes state changes to the database and immediately returns `HTTP 200 OK` to the client. Background database hooks then intercept these changes, format a standardized data contract, and dispatch webhooks to an external event orchestrator (n8n).

1. **Idempotency & Bulk Operations:** Hooks respect a `skip_n8n` flag. This allows mass data migrations and bulk inserts without triggering accidental notification storms or DDoS-ing the municipal email server.
2. **Adapter Pattern for Data Contracts:** Regardless of whether an event originated from an internal administrative action or a public citizen form, the backend normalizes the heterogeneous payloads into a predictable, unified format before dispatching to the message bus.
3. **Resilient Retries:** If the SIAT tax system is down, the operation intent is queued. The n8n orchestrator handles the retry schedule and only triggers the "document ready" email to the citizen when the legacy system finally responds.

*Note on Redis Durability:* To guarantee that queued tasks and event states are not lost in the event of an unexpected Redis server crash, Redis is configured with **AOF (Append Only File) persistence** enabled (using `appendfsync everysec`), ensuring a maximum of 1 second of data loss under catastrophic failures.

By separating hard constraints (security, DB transactions) into the Go backend and volatile workflows (HTML email templates, external retry loops) into the orchestrator, the system achieves both resilience and operational agility. Minor notification text changes no longer require full backend redeploys.

### 7. Architectural Trade-offs & Database Selection

Building a high-impact government platform with zero license cost and minimal budget requires careful trade-off evaluations. Below is the rationale behind our core architectural decisions:

#### I. Modular Monolith vs. Microservices
* **Why Modular Monolith?** Exposing the Citizen Portal and the Admin Panel as a single Go binary running in a single process eliminates the network latency, distributed tracing complexity, and operational overhead of managing multiple containers. It keeps deployment trivial (a single binary replacement) and resource consumption extremely low (<100MB RAM in production). 
* **Maintainability:** Clear package boundaries in Go separate core domains (Licensing, Payment, Auditing, Users). If a domain needs to scale independently in the future, it can be easily extracted into a standalone service because it communicates through well-defined repository interfaces.

#### II. Embedded SQLite (WAL mode) vs. External PostgreSQL
* **Why SQLite WAL?** At peak renewal periods in Belém, the system handles ~50 writes/minute (only 0.008% of SQLite's write limit of ~10,000 writes/sec). Choosing PostgreSQL from day one would have introduced TCP round-trip latencies, connection pool management overhead, and separate server daemon security, with zero performance gain.
* **Low-Cost Infrastructure & Memory Overhead:** A PostgreSQL database server requires significant RAM (typically 256MB–512MB minimum for shared buffers and connections) and CPU overhead to maintain daemon processes. In contrast, SQLite runs directly inside the Go process's memory space and relies on the OS page cache for reading/writing to a single file. This allowed the entire production stack (Go backend, Database, and reverse proxy) to run comfortably and stably on a single **$4/month VPS with 1GB of RAM**, maximizing the Return on Investment (ROI) of public infrastructure spending.
* **Short Time-to-Market (Zero-Configuration):** SQLite requires zero installation, zero user/role setup, zero port configuration, and zero database administration. This eliminated database provisioning bottlenecks, enabling a very small technical team to deliver and audit the production MVP weeks ahead of the annual peak renewal period.
* **Performance:** Running SQLite in WAL (Write-Ahead Log) mode enables concurrent reads while writing, yielding sub-millisecond read times.

| Property | SQLite (WAL mode) | PostgreSQL |
|---|---|---|
| **Latency** | **<0.1ms** (embedded in Go process memory) | **~3–5ms** (network round-trip latency) |
| **Operational Overhead** | **Zero** (no daemon, file-based backup via Litestream) | **High** (connection pooling, daemon access rules) |
| **Hosting Cost & Resources** | **Minimal** (runs on a $4/month, 1GB RAM VPS) | **Moderate/High** (requires dedicated RAM & separate instance/service) |
| **Write Concurrency** | Single writer, unlimited concurrent readers | Multi-MVCC concurrent writers |
| **CAP Position** | **CP** (Consistency + Partition tolerance) | **CP** by default (highly configurable) |

#### III. n8n Integration Engine vs. Custom Go Workers
* **Why n8n?** Interfacing with unreliable external APIs (like the municipal SIAT tax system) and volatile HTML email templates requires frequent updates. Writing custom retry loops and message queues in Go would require recompiling and redeploying the backend for every email text change. Offloading email formatting and third-party webhook integrations to n8n keeps the Go backend focused on core database transactions and security constraints, raising agility.


The backend decoupled storage implementation using the Repository pattern:

```go
type ProcessRepository interface {
    Create(ctx context.Context, p *Process) error
    FindByCNPJ(ctx context.Context, cnpj string) ([]*Process, error)
    UpdateStatus(ctx context.Context, id string, status ProcessStatus) error
}
```

This interface guarantees that the database engine can be swapped seamlessly without touching the core business logic.

#### Zero-Downtime Migration Path to PostgreSQL

Should municipal volume cross the write concurrency threshold (projected at ~5,000 concurrent active applicants filling forms simultaneously), the database transition will follow this phased migration plan:

1. **Dual-Write State:** Deploy a backend version that writes transactions to both SQLite and PostgreSQL (using a feature flag). Reads continue to be served from SQLite.
2. **Data Backfill:** Run a background ETL job to migrate the 173k+ historical records in batches of 500 with exponential backoff on write conflicts.
3. **Consistency Verification:** Compare row hashes and record counts between SQLite and PostgreSQL, with random spot-checks on 1,000 active processes.
4. **Read Cutover:** Flip the routing flag to serve reads directly from PostgreSQL. Monitor error logs for a 48-hour stabilization period.
5. **SQLite Decommission:** Remove the dual-write engine and archive the SQLite file on S3 for backup compliance.

### 8. PocketBase Performance Tuning (Official Benchmark Analysis)

Beyond just selecting SQLite, scaling PocketBase in production requires understanding its internal constraints. Analysis of PocketBase's official benchmarks reveals critical IO-bound bottlenecks and caching strategies that we employ:

1. **CGO Driver Compilation:** Compiling PocketBase with `CGO_ENABLED=1` and the `mattn/go-sqlite3` driver delivers **1.5x to 4x faster SELECTs** on large datasets compared to the default pure Go SQLite driver (`modernc.org/sqlite`). While cross-compilation is harder, the latency gains for analytical queries (e.g., geospatial dashboard aggregations) are substantial.
2. **skipTotal Optimization:** PocketBase's default pagination executes an expensive `COUNT` query with every list request. By appending `?skipTotal=1` on non-paginated frontend queries, execution times drop drastically (e.g., from ~3.5s to ~9ms). We enforce this at the API client layer for all infinite-scroll and autocomplete queries.

---

## Security Audit Results

The MVP was formally audited by the municipal IT nucleus (NATI/SESMA) before production deployment. Selected test results:

| Test | Scenario | Result |
|---|---|---|
| T.01.A | CPF with invalid check digits submitted via raw API | HTTP 400, blocked before persistence |
| T.01.B | Record submission with missing required payload field | HTTP 400, backend intercepted |
| T.01.C | Payload exceeding 500KB size limit | HTTP 400, DoS protection triggered |
| T.02 | Multi-CNAE fee calculation (3 CNAEs with different rates) | Correctly selected highest-value CNAE per municipal decree |
| T.03 | High-risk CNAE (hemodialysis) selected in form | Mandatory architectural project alert displayed |
| T.04 | QR code read from printed license | Positive lookup, 100% data match confirmed |
| T.05 | Duplicate DAM number reuse attempt | Uniqueness constraint blocked, fraud prevented |

NATI conclusion: *"The asset presents security adequate to the hybrid workflow. Nothing to oppose technically."*

---

## Database at Audit Time

- **173,582** structured records
- **867,000+** active data cells
- Stable under combined historical legacy + new process load

---

## What This System Replaced

| Before | After |
|---|---|
| PDF assembly by citizen (scan, merge, organize) | Structured per-field document upload |
| Manual SIAT query per application for payment check | Automated financial gatekeeper |
| Re-entry into G-Doc protocol system | Native NUP-VISA process number, no re-entry |
| Email-based compliance notices | In-portal tracking with timestamped audit log |
| Subjective manual risk classification | Deterministic matrix via ANVISA IN 66/2020 |
| No concurrent sector evaluation | Parallel multi-sector dispatch with completion gate |

---

## Repository Layout

```
visabelem-mock/     ← Public: the UI prototype built to validate flows with stakeholders
                       before backend development began (React + Vite + TypeScript)
visabelem-v1/       ← Private: the Go + PocketBase MVP that was formally audited
                       and approved for production (closed source under government contract and IP restrictions)
visabelem.net       ← Production: the live system (closed source, government contract)
```

---

*The architectural specification document (`ANEXO II — ETAS`) was signed by the author and acknowledged by the municipal IT unit (NATI/SESMA) on January 27, 2026.*
