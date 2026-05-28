# Go PDF Digital Signer & Verifier

A lightweight, self-contained microservice in Go to cryptographically sign and verify PDF documents using the **PAdES (PDF Advanced Electronic Signatures) detached PKCS#7** standard, compatible with **ICP-Brasil** specifications.

Built entirely using Go's standard library (`net/http`, `crypto/rsa`, `crypto/x509`) and Go's official `golang.org/x/crypto/pkcs12` extension, this project demonstrates advanced cryptography, ASN.1 serialization, byte-level file slicing, and secure API design.

---

## Technical Concept

Digital signature of a PDF in PAdES format follows these phases:
1. **Incremental Update**: The original PDF file is never rewritten or mutated directly. Instead, a new PDF update block (containing a Signature Field annotation widget, a `/Sig` dictionary, a modified catalog with `/AcroForm`, and a new cross-reference table/trailer pointing to the previous xref) is appended to the end of the file.
2. **ByteRange Allocation**: The `/ByteRange` offset is computed. This array of integers specifies which bytes of the PDF file are covered by the signature. It typically covers the entire file *except* the hex-encoded signature `/Contents` placeholder block (e.g., `[ 0 <offset_start_of_contents> <offset_end_of_contents> <length_of_remaining_file>]`).
3. **Hashing**: The bytes defined in the ByteRange are concatenated, and their `SHA-256` hash is computed.
4. **Signature & PKCS#7 Envelope**: The hash is encrypted (signed) using the signer's RSA private key. The signature, along with the signer's public key X.509 certificate, is structured into a DER-encoded **PKCS#7 SignedData** ASN.1 container.
5. **Overwriting Placeholder**: The PKCS#7 envelope is hex-encoded and written directly into the zero-filled `/Contents` placeholder block.

---

## Directory Structure

```text
go-pdf-signer/
├── main.go         # API handlers, multipart form parsing, and routing
├── signer.go       # PKCS#12 decoding and PDF incremental PAdES signer
├── verifier.go     # ByteRange parsing, hashing, and cryptographic validation
├── signer_test.go  # Unit tests with self-signed certificate generation
├── go.mod          # Go module file
└── go.sum          # Go dependency sum file
```

---

## API Endpoints

The microservice runs on port `8081` by default.

### 1. Sign PDF
`POST /api/pdf/sign`

Expects a multipart form submission to sign a PDF using a PKCS#12 (`.pfx` or `.p12`) certificate.

- **Parameters**:
  - `pdf`: The target PDF binary file.
  - `certificate`: The PKCS#12 certificate file containing the private key and public certificate chain.
  - `password`: Password to decrypt the PKCS#12 file.

- **Response (HTTP 200)**:
  Returns the signed PDF as an attachment download (`signed_document.pdf`).

### 2. Verify Signed PDF
`POST /api/pdf/verify`

Validates a signed PDF, checking the ByteRange hash match and the signer's RSA signature.

- **Parameters**:
  - `pdf`: The signed PDF file.

- **Success Response (HTTP 200)**:
```json
{
  "validSignature": true,
  "signerName": "Daniel de Jesus",
  "signingTime": "2026-05-28 18:00:00 UTC",
  "certSubject": "CN=Daniel de Jesus,O=VisaBelem Digital,C=BR",
  "certIssuer": "CN=VisaBelem Test CA,O=VisaBelem CA Corp,C=BR",
  "certNotAfter": "2026-05-29T04:00:00Z"
}
```

### 3. Health Check
`GET /health`

---

## How to Run

### Run Service
```bash
# Start the HTTP API server
go run .
```

### Run Unit Tests
```bash
go test -v ./...
```
