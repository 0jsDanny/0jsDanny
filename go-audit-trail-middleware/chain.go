package main

import (
	"bufio"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"
)

// AuditEntry represents a single cryptographically chained block in the audit trail
type AuditEntry struct {
	Index     int64  `json:"index"`
	Timestamp string `json:"timestamp"`
	Action    string `json:"action"`
	Actor     string `json:"actor"`
	Target    string `json:"target"`
	Payload   string `json:"payload"`
	PrevHash  string `json:"prevHash"`
	Hash      string `json:"hash"`
}

// AuditChain manages append-only file persistence and verification of logs
type AuditChain struct {
	mu         sync.Mutex
	filePath   string
	hmacSecret []byte
}

func NewAuditChain(filePath string, hmacSecret []byte) (*AuditChain, error) {
	// Create file if it does not exist
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600)
	if err != nil {
		return nil, fmt.Errorf("failed to open audit trail file: %w", err)
	}
	file.Close()

	return &AuditChain{
		filePath:   filePath,
		hmacSecret: hmacSecret,
	}, nil
}

// AddEntry creates and appends a new signed audit log entry to the chain
func (c *AuditChain) AddEntry(action, actor, target, payload string) (*AuditEntry, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// 1. Read last entry to obtain PrevHash and calculate next Index
	lastEntry, err := c.getLastEntry()
	if err != nil {
		return nil, fmt.Errorf("failed to read last audit entry: %w", err)
	}

	var nextIndex int64 = 0
	prevHash := strings.Repeat("0", 64) // Genesis block has zero-filled hash
	if lastEntry != nil {
		nextIndex = lastEntry.Index + 1
		prevHash = lastEntry.Hash
	}

	// 2. Build entry structure
	entry := &AuditEntry{
		Index:     nextIndex,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Action:    action,
		Actor:     actor,
		Target:    target,
		Payload:   payload,
		PrevHash:  prevHash,
	}

	// 3. Calculate Cryptographic Hash signature
	hashString := fmt.Sprintf("%d|%s|%s|%s|%s|%s|%s",
		entry.Index, entry.Timestamp, entry.Action, entry.Actor, entry.Target, entry.Payload, entry.PrevHash)
	entry.Hash = c.computeHMAC(hashString)

	// 4. Append to file (JSON line format)
	file, err := os.OpenFile(c.filePath, os.O_WRONLY|os.O_APPEND, 0600)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	if err := encoder.Encode(entry); err != nil {
		return nil, err
	}

	return entry, nil
}

// ValidateChain checks the entire audit log file for any cryptographic modifications
func (c *AuditChain) ValidateChain() (bool, int64, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	file, err := os.Open(c.filePath)
	if err != nil {
		return false, -1, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var expectedPrevHash = strings.Repeat("0", 64)
	var expectedIndex int64 = 0

	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}

		var entry AuditEntry
		if err := json.Unmarshal(line, &entry); err != nil {
			return false, -1, fmt.Errorf("failed to parse log entry: %w", err)
		}

		// Check index order
		if entry.Index != expectedIndex {
			return false, entry.Index, nil // Order broken / block missing
		}

		// Verify previous hash link
		if entry.PrevHash != expectedPrevHash {
			return false, entry.Index, nil // Chain link broken (modification detected)
		}

		// Recalculate and verify signature (HMAC)
		hashString := fmt.Sprintf("%d|%s|%s|%s|%s|%s|%s",
			entry.Index, entry.Timestamp, entry.Action, entry.Actor, entry.Target, entry.Payload, entry.PrevHash)
		calculatedHash := c.computeHMAC(hashString)

		// Constant-time comparison to prevent timing side-channel attacks
		sigBytes, _ := hex.DecodeString(entry.Hash)
		calcBytes, _ := hex.DecodeString(calculatedHash)
		if !hmac.Equal(sigBytes, calcBytes) {
			return false, entry.Index, nil // Tampered block data!
		}

		// Move expected states to next iteration
		expectedPrevHash = entry.Hash
		expectedIndex++
	}

	if err := scanner.Err(); err != nil {
		return false, -1, err
	}

	return true, -1, nil
}

func (c *AuditChain) getLastEntry() (*AuditEntry, error) {
	file, err := os.Open(c.filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var lastLine string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.TrimSpace(line) != "" {
			lastLine = line
		}
	}

	if scanner.Err() != nil {
		return nil, scanner.Err()
	}

	if lastLine == "" {
		return nil, nil // Empty file
	}

	var entry AuditEntry
	if err := json.Unmarshal([]byte(lastLine), &entry); err != nil {
		return nil, err
	}

	return &entry, nil
}

func (c *AuditChain) computeHMAC(message string) string {
	mac := hmac.New(sha256.New, c.hmacSecret)
	mac.Write([]byte(message))
	return hex.EncodeToString(mac.Sum(nil))
}
