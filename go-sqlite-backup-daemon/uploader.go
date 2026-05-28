package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// UploaderConfig defines remote and local targets
type UploaderConfig struct {
	VaultDir     string
	RemoteURL    string // If set, acts as a webhook/S3 target for POSTing updates
	RemoteToken  string // Authorization token for remote uploads
	InputChannel <-chan BackupPayload
}

// DbUploader compresses and uploads database snapshots and WAL deltas
type DbUploader struct {
	config UploaderConfig
}

func NewDbUploader(config UploaderConfig) *DbUploader {
	// Ensure local vault directory exists
	if config.VaultDir == "" {
		config.VaultDir = ".backup_vault"
	}
	_ = os.MkdirAll(config.VaultDir, 0755)

	return &DbUploader{
		config: config,
	}
}

// Start listens to the payload channel and processes uploads
func (u *DbUploader) Start(ctx context.Context) {
	log.Println("[Uploader] Starting uploader listener...")

	for {
		select {
		case <-ctx.Done():
			log.Println("[Uploader] Stopping uploader listener...")
			return
		case payload, ok := <-u.config.InputChannel:
			if !ok {
				log.Println("[Uploader] Payload channel closed. Exiting.")
				return
			}
			u.process(payload)
		}
	}
}

func (u *DbUploader) process(payload BackupPayload) {
	log.Printf("[Uploader] Processing %s backup for file: %s (%d bytes)", payload.Type, payload.Filename, len(payload.Data))

	// 1. Compress payload using Gzip
	compressedData, err := u.compress(payload.Data)
	if err != nil {
		log.Printf("[Uploader] Compression error: %v", err)
		return
	}
	log.Printf("[Uploader] Gzip compression completed: %d ➔ %d bytes (ratio: %.2f%%)",
		len(payload.Data), len(compressedData), float64(len(compressedData))/float64(len(payload.Data))*100)

	// 2. Save locally to Vault (Local DR Storage)
	localFilename := payload.Filename + ".gz"
	localPath := filepath.Join(u.config.VaultDir, localFilename)
	err = os.WriteFile(localPath, compressedData, 0644)
	if err != nil {
		log.Printf("[Uploader] Local Vault write failed: %v", err)
	} else {
		log.Printf("[Uploader] Saved locally to Vault: %s", localPath)
	}

	// 3. Upload to Remote endpoint if configured
	if u.config.RemoteURL != "" {
		err = u.uploadRemote(localFilename, compressedData)
		if err != nil {
			log.Printf("[Uploader] Remote upload failed: %v", err)
		} else {
			log.Printf("[Uploader] Uploaded successfully to remote: %s", u.config.RemoteURL)
		}
	}
}

func (u *DbUploader) compress(data []byte) ([]byte, error) {
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	_, err := gw.Write(data)
	if err != nil {
		return nil, err
	}
	if err := gw.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func (u *DbUploader) uploadRemote(filename string, data []byte) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	url := fmt.Sprintf("%s/%s", u.config.RemoteURL, filename)
	req, err := http.NewRequestWithContext(ctx, "PUT", url, bytes.NewReader(data))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-gzip")
	if u.config.RemoteToken != "" {
		req.Header.Set("Authorization", "Bearer "+u.config.RemoteToken)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}

	return nil
}
