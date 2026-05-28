package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"
)

var (
	auditChain *AuditChain
)

func main() {
	// Secret key for HMAC signing
	hmacSecret := []byte("VisaBelemLGPDSecretKeySignature2026")

	// Initialize the audit log chain file
	var err error
	auditChain, err = NewAuditChain("audit_trail.log", hmacSecret)
	if err != nil {
		log.Fatalf("Failed to initialize audit chain: %v", err)
	}

	// Initialize middleware
	auditMiddleware := NewAuditMiddleware(auditChain)

	mux := http.NewServeMux()

	// Base API handlers
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/api/data", handleData)
	mux.HandleFunc("/api/audit/verify", handleVerify)

	// Wrap entire routing mux with the cryptographic audit middleware
	handler := auditMiddleware.Handler(mux)

	server := &http.Server{
		Addr:         ":8082",
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Println("[Audit Trail Service] Starting server on :8082...")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed: %v", err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "UP", "service": "go-audit-trail-middleware"})
}

func handleData(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut && r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "success",
		"received": string(body),
	})
}

func handleVerify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	valid, tamperedIndex, err := auditChain.ValidateChain()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"valid":          valid,
		"tamperedIndex": tamperedIndex,
	})
}
