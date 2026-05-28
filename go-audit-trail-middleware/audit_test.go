package main

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestAuditChainValidationAndTamperDetection(t *testing.T) {
	// 1. Setup temporary directory for test environment
	tempDir, err := os.MkdirTemp("", "audit-trail-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	logPath := filepath.Join(tempDir, "audit.log")
	secret := []byte("MyTestSecretKey")

	chain, err := NewAuditChain(logPath, secret)
	if err != nil {
		t.Fatalf("Failed to create AuditChain: %v", err)
	}

	// 2. Add normal valid entries
	_, err = chain.AddEntry("POST", "admin", "/api/documents", `{"title": "Doc 1"}`)
	if err != nil {
		t.Fatalf("AddEntry failed: %v", err)
	}

	_, err = chain.AddEntry("PUT", "user_1", "/api/documents/1", `{"title": "Doc 1 Updated"}`)
	if err != nil {
		t.Fatalf("AddEntry failed: %v", err)
	}

	_, err = chain.AddEntry("DELETE", "admin", "/api/documents/2", "")
	if err != nil {
		t.Fatalf("AddEntry failed: %v", err)
	}

	// 3. Validate chain (should be valid)
	valid, index, err := chain.ValidateChain()
	if err != nil {
		t.Fatalf("ValidateChain failed with error: %v", err)
	}
	if !valid {
		t.Errorf("Expected chain to be valid, but was invalid. Failed at block index %d", index)
	}

	// 4. Tamper with the second entry (index 1) in the file
	err = tamperLogFile(logPath, 1, `{"title": "TAMPERED PAYLOAD"}`)
	if err != nil {
		t.Fatalf("Failed to tamper with log file: %v", err)
	}

	// 5. Re-validate chain (should detect tampering at index 1)
	validAfterTamper, tamperedIndex, err := chain.ValidateChain()
	if err != nil {
		t.Fatalf("Re-ValidateChain failed with error: %v", err)
	}

	if validAfterTamper {
		t.Error("ValidateChain failed to detect tampering on log entries")
	}

	// Index 1 was tampered, so it should report index 1
	if tamperedIndex != 1 {
		t.Errorf("Expected validation to report failure at block index 1, got index %d", tamperedIndex)
	}
}

// Helper function to simulate a malicious attacker editing the log file directly
func tamperLogFile(filePath string, targetIndex int64, newPayload string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	file.Close()

	// Modify the target line
	for i, line := range lines {
		var entry AuditEntry
		_ = json.Unmarshal([]byte(line), &entry)
		if entry.Index == targetIndex {
			entry.Payload = newPayload
			// Serialize back to JSON (simulating database tampering)
			tamperedLineBytes, _ := json.Marshal(entry)
			lines[i] = string(tamperedLineBytes)
			break
		}
	}

	// Write lines back
	outFile, err := os.OpenFile(filePath, os.O_WRONLY|os.O_TRUNC, 0600)
	if err != nil {
		return err
	}
	defer outFile.Close()

	for _, line := range lines {
		if strings.TrimSpace(line) != "" {
			_, err = outFile.WriteString(line + "\n")
			if err != nil {
				return err
			}
		}
	}

	return nil
}
