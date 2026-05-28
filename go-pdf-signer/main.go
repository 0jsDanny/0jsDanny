package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"
)

func main() {
	mux := http.NewServeMux()

	corsHandler := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next(w, r)
		}
	}

	mux.HandleFunc("/health", corsHandler(handleHealth))
	mux.HandleFunc("/api/pdf/sign", corsHandler(handleSign))
	mux.HandleFunc("/api/pdf/verify", corsHandler(handleVerify))

	server := &http.Server{
		Addr:         ":8081",
		Handler:      mux,
		ReadTimeout:  10 * time.Minute,
		WriteTimeout: 10 * time.Minute,
	}

	log.Println("[PDF Signer Service] Starting server on :8081...")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed: %v", err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "UP", "service": "go-pdf-signer"})
}

func handleSign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 1. Parse Multipart Form
	err := r.ParseMultipartForm(10 << 20) // 10MB max in memory
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	// Read PDF file
	pdfFile, _, err := r.FormFile("pdf")
	if err != nil {
		http.Error(w, "Missing 'pdf' file parameter", http.StatusBadRequest)
		return
	}
	defer pdfFile.Close()

	pdfBytes, err := io.ReadAll(pdfFile)
	if err != nil {
		http.Error(w, "Failed to read pdf file", http.StatusInternalServerError)
		return
	}

	// Read certificate file
	certFile, _, err := r.FormFile("certificate")
	if err != nil {
		http.Error(w, "Missing 'certificate' file parameter", http.StatusBadRequest)
		return
	}
	defer certFile.Close()

	certBytes, err := io.ReadAll(certFile)
	if err != nil {
		http.Error(w, "Failed to read certificate file", http.StatusInternalServerError)
		return
	}

	password := r.FormValue("password")

	// 2. Load private key and certificate
	privKey, cert, err := LoadCertificate(certBytes, password)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// 3. Sign the PDF
	signedPdfBytes, err := SignPDF(pdfBytes, privKey, cert)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// 4. Return signed PDF as download attachment
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=signed_document.pdf")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(signedPdfBytes)
}

func handleVerify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("pdf")
	if err != nil {
		http.Error(w, "Missing 'pdf' file parameter", http.StatusBadRequest)
		return
	}
	defer file.Close()

	pdfBytes, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read pdf file", http.StatusInternalServerError)
		return
	}

	// Verify
	result, err := VerifyPDF(pdfBytes)
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}
