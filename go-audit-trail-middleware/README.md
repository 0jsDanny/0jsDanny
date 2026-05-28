# Go Cryptographic Audit Trail Middleware

A secure, high-performance middleware for Go (`net/http`) that captures data-mutating operations and appends them to a cryptographically chained audit log. This pattern enforces **tamper-evident audit logging** for data privacy regulations like **LGPD** and **GDPR**.

Implemented entirely in standard Go, the project demonstrates how to enforce cryptographic data integrity without blockchain overhead.

---

## The Challenge

Compliance regulations require organizations to maintain access and modification logs for sensitive PII (Personally Identifiable Information). However, if an attacker (or a malicious DBA) gains write access to the logging database, they can alter or delete log records to cover their tracks.

---

## The Solution

This middleware implements a **Linked Cryptographic Audit Chain**:
1. **HTTP Interception**: The middleware intercepts all data-mutating requests (POST, PUT, DELETE). It reads the JSON request body (restoring the body afterwards for downstream handlers) and captures the actor identity.
2. **Cryptographic Chaining**: Every log entry is treated as a block. It contains a `PrevHash` linking to the previous block's signature.
3. **HMAC-SHA256 Signing**: The hash for each block is computed as an HMAC signature using a secret master key. The input message for the HMAC is a concatenated string of the block's fields:
   `Index | Timestamp | Action | Actor | Target | Payload | PrevHash`
4. **JSON-Lines Persistence**: Blocks are appended to an append-only flat file (`audit_trail.log`) in JSON Lines format, keeping it human-readable while preserving cryptographic validity.
5. **Tamper Detection**: The daemon validates the chain by reading it sequentially. It recomputes the HMAC of each block, compares it using constant-time evaluation (`hmac.Equal` to prevent timing-attacks), and checks if the `PrevHash` matches the previous block's `Hash`. If a single character in a payload, timestamp, or actor is modified, the signature validation fails and exposes the exact tampered index.

---

## Directory Structure

```text
go-audit-trail-middleware/
├── main.go         # API server setup and endpoint handlers
├── chain.go        # Cryptographic chain management and validation logic
├── middleware.go   # HTTP interceptor middleware
├── audit_test.go   # Unit tests verifying validation and tamper detection
└── go.mod          # Go module file
```

---

## API Endpoints

The microservice runs on port `8082` by default.

### 1. Perform Action
`POST /api/data` or `PUT /api/data`

Any write request sent to this endpoint is automatically captured and signed in the audit log.

- **Headers**:
  - `X-Actor`: Identity of the user performing the action (default: `anonymous`).

### 2. Verify Audit Trail Integrity
`GET /api/audit/verify`

Scans the audit trail file and validates the cryptographic integrity of all blocks.

- **Response (HTTP 200 - Valid)**:
```json
{
  "valid": true,
  "tamperedIndex": -1
}
```

- **Response (HTTP 200 - Tampered)**:
  If any block has been retroactively modified or deleted, the response indicates the failure:
```json
{
  "valid": false,
  "tamperedIndex": 3
}
```

---

## How to Run

### Run Service
```bash
# Start the HTTP server
go run .
```

### Run Unit Tests
To execute the test suite, which creates a mock log chain, appends records, simulates file-based tampering, and verifies that the tampered block is detected:

```bash
go test -v ./...
```
