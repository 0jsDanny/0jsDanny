# Go CNPJ Prospector Proxy API

A high-performance, lightweight, and self-contained **Go Proxy API** for CNPJ prospecting in Brazil. It queries multiple public APIs in a sequential fallback priority chain, normalizes their highly heterogeneous JSON payloads into a unified format, caches results in a thread-safe local cache, and naturally bypasses browser CORS restrictions.

It is implemented entirely using Go's standard library (`net/http`) to demonstrate concurrency, clean architecture, memory management, and optimization without third-party frameworks.

---

## Key Features

1. **Multi-API Sequential Fallback Strategy**:
   - Queries a chain of public APIs in order of preference: **OpenCNPJ ➔ CNPJ.ws ➔ ReceitaWS ➔ BrasilAPI**.
   - Each API query is bounded by a context timeout (`context.WithTimeout`) to prevent slow APIs from locking the request.
   - Tries the next provider in the chain only if the current one fails, returns a rate limit error (HTTP 429), or times out.
   - Excludes CNPJA due to its deprecated public policy.

2. **Full Numeric & Alphanumeric Validation**:
   - Supports both the legacy numeric-only CNPJ format and the new alphanumeric format launched under Receita Federal **COCAD 01/2024** guidelines.
   - Handles the custom base-36 conversion mapping where characters `A-Z` represent values `17-42` (ASCII minus 48) and digits `0-9` represent `0-9`.
   - Computes weighted check digits using the Modulo 11 algorithm.

3. **Thread-Safe RWMutex Memory Caching**:
   - Implements a concurrent memory cache using `sync.RWMutex` to avoid calling remote APIs for identical CNPJs within a TTL window (default: 5 minutes).
   - Supports caching bypass via query parameters (`?bypass_cache=true`) and custom TTL durations.

4. **Throttled Batch Queries**:
   - Offers a dedicated batch endpoint that queries multiple CNPJs.
   - Incorporates a 1.2-second sleep throttle between external API calls for non-cached CNPJs to protect and respect public rate limits (e.g. 3 requests/minute limits).

5. **Zero External Dependencies**:
   - Built 100% using standard Go packages, keeping compilation fast and the compiled binary extremely small (~6MB).

---

## Directory Structure

```text
go-cnpj-prospector/
├── main.go         # API Entrypoint, router, and server handlers
├── models.go       # CNPJ normalized schemas and alphanumeric validation
├── cache.go        # Thread-safe RWMutex cache with TTL
├── client.go       # HTTP integrations and normalizers for BrasilAPI, ReceitaWS, CNPJ.ws, and OpenCNPJ
├── cnpj_test.go    # Unit tests for validation, cleaning, formatting, and cache
└── go.mod          # Go module configuration
```

---

## API Endpoints

### 1. Query CNPJ
`GET /api/cnpj/{cnpj}`

Queries the fallback chain for the specified CNPJ. Supports both formatted (`19.131.243/0001-97`) and cleaned (`19131243000197`) inputs, as well as new alphanumeric CNPJs (e.g., `A1.B2C.3D4/E5F6-68`).

- **Query Parameters**:
  - `bypass_cache=true`: Force query from external APIs and update cache.
  - `timeout=5s`: Set custom timeout for individual API queries.
  - `cache_ttl=10m`: Set custom TTL for this query's cache entry.

- **Success Response (HTTP 200)**:
```json
{
  "success": true,
  "data": {
    "cnpj": "19131243000197",
    "cnpjFormatado": "19.131.243/0001-97",
    "razaoSocial": "OPEN KNOWLEDGE BRASIL",
    "nomeFantasia": "REDE PELO CONHECIMENTO LIVRE",
    "situacaoCadastral": "ATIVA",
    "dataSituacaoCadastral": "2013-10-03",
    "tipo": "MATRIZ",
    "porte": "DEMAIS",
    "naturezaJuridica": "Associação Privada",
    "capitalSocial": 0,
    "atividadePrincipal": {
      "codigo": "9430800",
      "descricao": "Atividades de associações de defesa de direitos sociais"
    },
    "atividadesSecundarias": [
      {
        "codigo": "9493600",
        "descricao": "Atividades de organizações associativas ligadas à cultura e à arte"
      }
    ],
    "endereco": {
      "tipoLogradouro": "AVENIDA",
      "logradouro": "AVENIDA PAULISTA",
      "numero": "37",
      "complemento": "ANDAR 4",
      "bairro": "BELA VISTA",
      "cep": "01311902",
      "municipio": "SAO PAULO",
      "uf": "SP"
    },
    "telefone1": "1123851939",
    "email": "contato@ok.org.br",
    "dataAbertura": "2013-10-03",
    "simplesNacional": {
      "optante": false
    },
    "_meta": {
      "provider": "OpenCNPJ",
      "responseTime": 182,
      "timestamp": "2026-05-28T18:30:00Z"
    }
  },
  "providers": {
    "attempted": ["OpenCNPJ"],
    "successful": "OpenCNPJ",
    "failed": []
  }
}
```

### 2. Batch Query CNPJ
`POST /api/cnpj/batch`

Queries multiple CNPJs sequentially, enforcing a 1.2-second rate-limiting throttle between non-cached external requests.

- **Request Body**:
```json
{
  "cnpjs": [
    "19131243000197",
    "00000000000191"
  ]
}
```

- **Query Parameters**:
  - `delay=2s`: Customize the rate-limiting delay between external requests.

### 3. Clear Cache
`POST /api/cnpj/cache/clear`

Clears all entries stored in the memory cache.

---

## How to Run

### Prerequisite
Install Go (version 1.22 or higher).

### Run Locally
```bash
# Navigate to the folder
cd go-cnpj-prospector

# Start the proxy server
go run .
```
The server will start on port `8080`. You can test it by accessing `http://localhost:8080/api/cnpj/19131243000197` in your browser or client.

### Run Unit Tests
```bash
go test -v ./...
```
