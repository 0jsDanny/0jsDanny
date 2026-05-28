package main

import (
	"context"
	"compress/gzip"
	"io"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestWatcherAndUploader(t *testing.T) {
	// 1. Setup temporary directory for test environment
	tempDir, err := os.MkdirTemp("", "sqlite-backup-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	walPath := dbPath + "-wal"
	vaultDir := filepath.Join(tempDir, "vault")

	// Create initial database file
	err = os.WriteFile(dbPath, []byte("INITIAL DATABASE STATE"), 0644)
	if err != nil {
		t.Fatalf("Failed to write initial db: %v", err)
	}

	uploadChan := make(chan BackupPayload, 10)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	watcher := NewDbWatcher(WatcherConfig{
		DbPath:        dbPath,
		PollInterval:  50 * time.Millisecond,
		UploadChannel: uploadChan,
	})

	uploader := NewDbUploader(UploaderConfig{
		VaultDir:     vaultDir,
		InputChannel: uploadChan,
	})

	// Start watcher and uploader
	go watcher.Start(ctx)
	go uploader.Start(ctx)

	// Await initial full backup trigger
	select {
	case <-time.After(200 * time.Millisecond):
		// Done polling
	}

	// Verify local vault has full backup gzip
	files, err := os.ReadDir(vaultDir)
	if err != nil {
		t.Fatalf("Failed to read vault: %v", err)
	}

	foundFull := false
	for _, f := range files {
		if f.Name() == "test.db.gz" {
			foundFull = true
			// Validate gzip content
			var out []byte
			gzFile, err := os.Open(filepath.Join(vaultDir, f.Name()))
			if err != nil {
				t.Fatalf("Open err: %v", err)
			}
			gzReader, err := gzip.NewReader(gzFile)
			if err == nil {
				out, err = io.ReadAll(gzReader)
				gzReader.Close()
			}
			gzFile.Close()

			if err != nil {
				t.Fatalf("Gzip decompress err: %v", err)
			}

			if string(out) != "INITIAL DATABASE STATE" {
				t.Errorf("Expected 'INITIAL DATABASE STATE', got %q", string(out))
			}
		}
	}

	if !foundFull {
		t.Error("Initial full backup file test.db.gz not found in vault")
	}

	// 2. Simulate WAL write (append bytes to WAL)
	err = os.WriteFile(walPath, []byte("WAL FRAME 1"), 0644)
	if err != nil {
		t.Fatalf("Failed to write WAL: %v", err)
	}

	// Wait for watcher poll
	time.Sleep(100 * time.Millisecond)

	// Verify delta backup file was created
	files, _ = os.ReadDir(vaultDir)
	foundDelta := false
	for _, f := range files {
		if filepath.Ext(f.Name()) == ".gz" && f.Name() != "test.db.gz" {
			foundDelta = true
			gzFile, _ := os.Open(filepath.Join(vaultDir, f.Name()))
			gzReader, _ := gzip.NewReader(gzFile)
			out, _ := io.ReadAll(gzReader)
			gzReader.Close()
			gzFile.Close()

			if string(out) != "WAL FRAME 1" {
				t.Errorf("Expected 'WAL FRAME 1', got %q", string(out))
			}
		}
	}

	if !foundDelta {
		t.Error("WAL delta backup file not found in vault")
	}

	// 3. Simulate database checkpoint (WAL truncation)
	// Clear WAL
	err = os.WriteFile(walPath, []byte(""), 0644)
	if err != nil {
		t.Fatalf("Failed to truncate WAL: %v", err)
	}
	// Change DB baseline
	err = os.WriteFile(dbPath, []byte("NEW DATABASE BASELINE STATE"), 0644)
	if err != nil {
		t.Fatalf("Failed to modify db: %v", err)
	}

	// Wait for watcher poll
	time.Sleep(100 * time.Millisecond)

	// Verify updated baseline snapshot was saved
	gzFile, err := os.Open(filepath.Join(vaultDir, "test.db.gz"))
	if err != nil {
		t.Fatalf("Failed to open updated test.db.gz: %v", err)
	}
	gzReader, _ := gzip.NewReader(gzFile)
	out, _ := io.ReadAll(gzReader)
	gzReader.Close()
	gzFile.Close()

	if string(out) != "NEW DATABASE BASELINE STATE" {
		t.Errorf("Expected baseline update 'NEW DATABASE BASELINE STATE', got %q", string(out))
	}
}
