# CISC Alert & Telemetry Hub

This microservice acts as the central data ingestion and real-time distribution engine for the **Health and Climate Information Center of Belém (CISC)**. 

It is designed to close the gap between background data collectors (`cisc-data-pipelines`) and the live operation dashboard (`cisc-situation-room`), demonstrating advanced proficiency in **gRPC**, **GraphQL Subscriptions (via Server-Sent Events)**, and high-performance concurrency patterns in Go.

---

## 🛠️ Architectural Overview

The service operates on two interfaces concurrently:

```
                  ┌───────────────────────────────┐
                  │   Data Pipeline Collectors    │
                  │   (SINAN, CEMADEN, NAVY)      │
                  └───────────────┬───────────────┘
                                  │ (gRPC on :50051)
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                      go-cisc-telemetry-hub                       │
│                                                                  │
│    ┌──────────────────┐                  ┌──────────────────┐    │
│    │   gRPC Server    ├─────────────────►│  Event Broadcaster│    │
│    │    (Ingest)      │                  │   (Go Channels)  │    │
│    └────────┬─────────┘                  └────────┬─────────┘    │
│             │                                     │              │
│             ▼ (WAL Mode write)                    ▼ (SSE Stream) │
│    ┌────────┴─────────┐                  ┌────────┴─────────┐    │
│    │  SQLite Database │                  │  GraphQL Server  │    │
│    │ (cisc_health.db) │                  │  (Subscriptions) │    │
│    └──────────────────┘                  └────────┬─────────┘    │
└───────────────────────────────────────────────────┼──────────────┘
                                                    │ (HTTP on :8080)
                                                    ▼
                                    ┌───────────────────────────────┐
                                    │    CISC Situation Room        │
                                    │    (Videowall Dashboard)      │
                                    └───────────────────────────────┘
```

1.  **High-Performance Ingestion (gRPC - Port `:50051`):** Receives weather, tidal, and epidemiological telemetry from background scrapers. Built on HTTP/2 with strict protobuf-defined type constraints (`telemetry.proto`).
2.  **WAL-Enabled Persistence (SQLite):** Telemetry metrics are written to a shared SQLite instance configured in **Write-Ahead Logging (WAL) Mode**, allowing concurrent reads from Python analytical pipelines while Go performs fast writes.
3.  **Real-time Streaming (GraphQL Subscriptions - Port `:8080`):** Distributes incoming emergency alerts and telemetry to client web interfaces instantly. Subscriptions are implemented over **Server-Sent Events (SSE)**, providing a lightweight, standard HTTP/1.1 compatible streaming solution that operates seamlessly through Nginx proxies.

---

## 📡 API Specifications

### 1. gRPC Ingestion Contract (`proto/telemetry.proto`)

```protobuf
syntax = "proto3";
package telemetry;

service TelemetryIngestion {
  rpc SubmitTelemetry (TelemetryData) returns (TelemetryResponse);
}

message TelemetryData {
  string timestamp = 1;
  string source = 2;
  string neighborhood = 3;
  float temperature = 4;
  float humidity = 5;
  float heat_index = 6;
  float rainfall = 7;
  float river_level = 8;
  string alert_level = 9; // "NORMAL", "ATENCAO", "ALERTA", "EMERGENCIA"
  string alert_description = 10;
}
```

### 2. GraphQL Schema (`/graphql` and `/graphql/subscriptions`)

*   **Query (POST `/graphql`):** Fetch historical telemetry metrics.
    ```graphql
    query {
      getRecentTelemetry {
        id
        neighborhood
        temperature
        rainfall
        alert_level
      }
    }
    ```
*   **Mutation (POST `/graphql`):** Manually dispatch emergency alerts from the administrative command line.
    ```graphql
    mutation {
      createAlert(neighborhood: "Marco", level: "EMERGENCIA", desc: "Flood threat due to high tide alignment") {
        id
        success
        message
      }
    }
    ```
*   **Subscription (GET `/graphql/subscriptions`):** Real-time Server-Sent Events (SSE) feed.
    ```graphql
    subscription {
      telemetrySubscribed {
        id
        neighborhood
        alert_level
        alert_description
      }
    }
    ```

---

## ⚡ Concurrency & Optimization Highlights

*   **CGO-Free SQLite Compilation:** Utilizes `modernc.org/sqlite` (pure Go SQLite translation), eliminating the dependency on C compilers (`gcc`) and ensuring compilation portability across Windows and Linux.
*   **Non-Blocking Event Broadcasting:** When telemetry is received via gRPC, it is dispatched to the GraphQL Subscription broadcaster using buffered Go channels. Slow or stalled SSE clients are safely skipped (`select { case ... default }`) to prevent ingestion bottlenecks.
*   **Zero-Allocation Thread-Safe Mapping:** Manages multiple concurrent active SSE streams using a mutex-guarded registration loop (`sync.Mutex`).

---

## 🚀 How to Run

1.  Initialize dependencies and compile:
    ```powershell
    go mod tidy
    go build -o cisc-hub.exe main.go
    ```
2.  Start the service:
    ```powershell
    ./cisc-hub.exe
    ```
    The servers will boot concurrently:
    *   gRPC: [http://localhost:50051](http://localhost:50051)
    *   GraphQL POST API: [http://localhost:8080/graphql](http://localhost:8080/graphql)
    *   GraphQL SSE Stream: [http://localhost:8080/graphql/subscriptions](http://localhost:8080/graphql/subscriptions)
