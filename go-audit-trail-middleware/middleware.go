package main

import (
	"bytes"
	"io"
	"log"
	"net/http"
)

// AuditMiddleware logs HTTP write operations to an AuditChain
type AuditMiddleware struct {
	chain *AuditChain
}

func NewAuditMiddleware(chain *AuditChain) *AuditMiddleware {
	return &AuditMiddleware{
		chain: chain,
	}
}

// Handler returns an http.Handler middleware function
func (m *AuditMiddleware) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Log only mutating HTTP operations (POST, PUT, DELETE, PATCH)
		if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		// 1. Capture and read request payload
		var payload string
		if r.Body != nil {
			bodyBytes, err := io.ReadAll(r.Body)
			if err == nil {
				payload = string(bodyBytes)
				// Restore request body so downstream handlers can read it
				r.Body = io.NopCloser(bytes.NewReader(bodyBytes))
			} else {
				log.Printf("[AuditMiddleware] Error reading body: %v", err)
			}
		}

		// 2. Identify actor (user or system ID)
		actor := r.Header.Get("X-Actor")
		if actor == "" {
			actor = "anonymous"
		}

		// 3. Log to Cryptographic Audit Chain
		action := r.Method
		target := r.URL.Path

		entry, err := m.chain.AddEntry(action, actor, target, payload)
		if err != nil {
			log.Printf("[AuditMiddleware] Failed to append audit log: %v", err)
			// In production, you might block the transaction if audit log fails (fail-closed)
			http.Error(w, "Audit logging failed", http.StatusInternalServerError)
			return
		}

		log.Printf("[AuditMiddleware] Audit Entry #%d added. Hash: %s", entry.Index, entry.Hash[:8])

		// 4. Continue execution chain
		next.ServeHTTP(w, r)
	})
}
