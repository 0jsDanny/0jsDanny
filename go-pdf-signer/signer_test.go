package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"math/big"
	"testing"
	"time"
)

func TestSignAndVerifyPDF(t *testing.T) {
	// 1. Generate RSA key pair for testing
	privKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("Failed to generate private key: %v", err)
	}

	// 2. Generate self-signed X.509 certificate template
	template := x509.Certificate{
		SerialNumber: big.NewInt(12345),
		Subject: pkix.Name{
			CommonName:   "Daniel de Jesus (Test)",
			Organization: []string{"VisaBelem Digital"},
		},
		Issuer: pkix.Name{
			CommonName:   "VisaBelem Test CA",
			Organization: []string{"VisaBelem CA Corp"},
		},
		NotBefore:             time.Now().Add(-1 * time.Hour),
		NotAfter:              time.Now().Add(10 * time.Hour),
		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		BasicConstraintsValid: true,
	}

	certBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, &privKey.PublicKey, privKey)
	if err != nil {
		t.Fatalf("Failed to create certificate: %v", err)
	}

	cert, err := x509.ParseCertificate(certBytes)
	if err != nil {
		t.Fatalf("Failed to parse certificate: %v", err)
	}

	// 3. Test LoadCertificate with invalid bytes (error path)
	_, _, err = LoadCertificate([]byte("invalid pfx data"), "password")
	if err == nil {
		t.Error("LoadCertificate with invalid bytes should have failed")
	}

	// 4. Test PDF Signing
	mockPDF := []byte("%PDF-1.4\r\n1 0 obj\r\n<< /Type /Catalog /Pages 2 0 R >>\r\nendobj\r\n2 0 obj\r\n<< /Type /Pages /Kids [] /Count 0 >>\r\nendobj\r\n%%EOF")
	
	signedPDF, err := SignPDF(mockPDF, privKey, cert)
	if err != nil {
		t.Fatalf("SignPDF failed: %v", err)
	}

	// Verify the signed PDF size grew (incremental update is appended)
	if len(signedPDF) <= len(mockPDF) {
		t.Errorf("Signed PDF size (%d) should be larger than original (%d)", len(signedPDF), len(mockPDF))
	}

	// 5. Test PDF Verification
	res, err := VerifyPDF(signedPDF)
	if err != nil {
		t.Fatalf("VerifyPDF failed with error: %v", err)
	}

	if !res.ValidSignature {
		t.Errorf("Verification failed. Output result error: %s", res.Error)
	}

	if res.SignerName != "Daniel de Jesus (Test)" {
		t.Errorf("Expected signer common name 'Daniel de Jesus (Test)', got %q", res.SignerName)
	}
}
