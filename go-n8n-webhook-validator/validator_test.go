package webhook

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

// generateValidSignature is a helper for tests
func generateValidSignature(secret, payload []byte) string {
	mac := hmac.New(sha256.New, secret)
	mac.Write(payload)
	return hex.EncodeToString(mac.Sum(nil))
}

func TestHMACValidator_Validate(t *testing.T) {
	secret := []byte("my_super_secret_key")
	validator := NewHMACValidator(string(secret), "X-Signature")

	payload := []byte(`{"event":"payment_received","id":123}`)
	validSig := generateValidSignature(secret, payload)

	// Test 1: Valid signature
	if !validator.Validate(payload, validSig) {
		t.Error("expected valid signature to pass validation")
	}

	// Test 2: Invalid signature (tampered payload)
	tamperedPayload := []byte(`{"event":"payment_received","id":999}`)
	if validator.Validate(tamperedPayload, validSig) {
		t.Error("expected invalid signature to fail validation (payload tampered)")
	}

	// Test 3: Invalid signature (wrong secret)
	wrongSecretSig := generateValidSignature([]byte("wrong_secret"), payload)
	if validator.Validate(payload, wrongSecretSig) {
		t.Error("expected invalid signature to fail validation (wrong secret)")
	}
}

func TestHMACValidator_Middleware(t *testing.T) {
	secret := "test_secret"
	headerName := "X-N8N-Signature"
	validator := NewHMACValidator(secret, headerName)

	payload := []byte(`{"data":"success"}`)
	validSig := generateValidSignature([]byte(secret), payload)

	// A dummy handler that reads the body and writes a 200 OK
	// This proves that the middleware correctly restores the body for the next handler.
	nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("handler failed to read body: %v", err)
		}
		if !bytes.Equal(body, payload) {
			t.Errorf("handler received wrong body. got %q, want %q", string(body), string(payload))
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	middleware := validator.Middleware(nextHandler)

	tests := []struct {
		name           string
		setupRequest   func() *http.Request
		expectedStatus int
	}{
		{
			name: "valid request",
			setupRequest: func() *http.Request {
				req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(payload))
				req.Header.Set(headerName, validSig)
				return req
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "missing signature header",
			setupRequest: func() *http.Request {
				req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(payload))
				return req
			},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "invalid signature",
			setupRequest: func() *http.Request {
				req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(payload))
				req.Header.Set(headerName, "invalid_hash_value")
				return req
			},
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := tt.setupRequest()
			rr := httptest.NewRecorder()

			middleware.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rr.Code)
			}
		})
	}
}
