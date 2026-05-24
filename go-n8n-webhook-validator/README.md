# Go Webhook HMAC Validator

![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)

A Go (Golang) library and middleware to validate and authenticate HMAC signatures of webhooks.

## 📌 Context
Extracted from the real architecture of **visabelem.net**, where [n8n](https://n8n.io/) acts as the orchestrator for retrying municipal tax (DAM) emissions in the legacy municipal system (SIAT). This middleware ensures that the main Go backend only processes webhooks legitimately signed by n8n, preventing fraud and request injection attacks.

In event-driven architectures, it is common to use Webhooks to notify services of state changes. To avoid attacks and guarantee that the request originated from a trusted source, the payload signature is validated via HMAC.

This package isolates this security logic, allowing you to easily integrate it into Go-based REST APIs.

## 🚀 Usage

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/0jsDanny/go-n8n-webhook-validator"
)

func main() {
	secretKey := os.Getenv("WEBHOOK_SECRET_KEY")
	if secretKey == "" {
		log.Fatal("WEBHOOK_SECRET_KEY env var is required")
	}
	
	// Configure the Validator
	validator := webhook.NewHMACValidator(secretKey, "X-Signature")

	mux := http.NewServeMux()
	
	// Route protected by the middleware
	mux.Handle("/api/v1/events", validator.Middleware(http.HandlerFunc(eventHandler)))

	fmt.Println("Server running on port 8080...")
	http.ListenAndServe(":8080", mux)
}

func eventHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Webhook received and validated securely!"}`))
}
```

## 🛠️ Under the Hood (Summary)
- Computes the SHA-256 HMAC of the request body using the shared secret key.
- Securely compares the computed signature with the signature provided in the header using `subtle.ConstantTimeCompare` to mitigate *Timing Attacks*.
- Restores/re-populates the HTTP request body stream buffer so subsequent handler logic can read it again.

*Created as an open-source spin-off project derived from high-criticality government integrations.*
