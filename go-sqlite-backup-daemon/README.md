# Go SQLite WAL Backup Daemon

A high-performance, lightweight **Disaster Recovery (DR)** daemon written in Go to continuously backup SQLite databases under WAL (Write-Ahead Logging) mode. It tracks changes to database files and incremental log records (WAL frame-shipping), compresses them using gzip, and saves them to a local vault or streams them to S3-compatible remote endpoints.

This project demonstrates system-level programming in Go, concurrency design (goroutines, channels, and context propagation), I/O optimization, and database durability patterns for low-cost VPS architectures.

---

## The Challenge

SQLite under WAL mode writes database updates to a separate write-ahead log (`.db-wal` file) before committing them to the main database file. Standard backup mechanisms (like simply copying `.db`) fail because:
1. They miss active transactions stored in the WAL file.
2. Direct copies can result in database corruption if copied mid-write.
3. Full database copying is expensive for large databases over network pipes.

---

## The Solution

This daemon implements a **WAL-shipping replication strategy**:
1. **Initial Baseline**: When started, it performs a cryptographic hash checks (`SHA-256`) of the main `.db` database, creating an initial full baseline compressed snapshot.
2. **Incremental Delta Logging**: It polls the `-wal` companion file. When new bytes are appended, it reads only the newly written WAL frames (incremental delta) from the last known offset.
3. **Compression & Archiving**: Captured deltas and database snapshots are immediately compressed on-the-fly via `gzip` to reduce storage and transfer overhead.
4. **Checkpoint Tracking**: When SQLite performs a checkpoint (which truncates or deletes the WAL file), the daemon detects the size contraction, resets the tracking cursor, and captures a fresh full baseline database snapshot.
5. **Local & Remote Storage**: Saves backups into a local vault (`.backup_vault/`) and can optionally upload them to S3-compatible endpoints via HTTP PUT.

---

## Directory Structure

```text
go-sqlite-backup-daemon/
├── main.go         # Command-line interface and daemon orchestrator
├── watcher.go      # Polling loops and WAL delta tracking logic
├── uploader.go     # Gzip compression and S3/Local Vault uploader
├── backup_test.go  # Unit tests for replication and checkpoint recovery
└── go.mod          # Go module file
```

---

## How to Run

### Command-line Parameters

- `-db`: Path to the SQLite database file (default: `data.db`).
- `-interval`: Time interval between file system polls (default: `1s`).
- `-vault`: Local directory where backup files are archived (default: `.backup_vault`).
- `-remote-url`: Remote endpoint URL to PUT compressed backups.
- `-remote-token`: Optional Bearer token for remote authorization.

### Running the Daemon

```bash
# Run locally monitoring 'production.db' every 500ms
go run . -db production.db -interval 500ms -vault ./backups
```

### Running Unit Tests

To execute the test suite, which creates a mock database/WAL pipeline, triggers checkpoints, and validates compressed payloads:

```bash
go test -v ./...
```
