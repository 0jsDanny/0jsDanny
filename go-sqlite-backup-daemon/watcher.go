package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"
)

// WatcherConfig defines parameters for database watching
type WatcherConfig struct {
	DbPath        string
	PollInterval  time.Duration
	UploadChannel chan<- BackupPayload
}

// BackupType indicates whether it's a full DB copy or WAL delta
type BackupType string

const (
	BackupFull  BackupType = "FULL"
	BackupDelta BackupType = "DELTA"
)

// BackupPayload wraps the data to be uploaded
type BackupPayload struct {
	Type      BackupType
	Filename  string
	Data      []byte
	Timestamp time.Time
}

// DbWatcher monitors a SQLite file and its -wal companion
type DbWatcher struct {
	config    WatcherConfig
	lastDbSize int64
	lastWalSize int64
	walOffset int64
	dbHash    string
}

func NewDbWatcher(config WatcherConfig) *DbWatcher {
	return &DbWatcher{
		config: config,
	}
}

// Start initiates the polling loop
func (w *DbWatcher) Start(ctx context.Context) {
	ticker := time.NewTicker(w.config.PollInterval)
	defer ticker.Stop()

	log.Printf("[Watcher] Starting watcher for database: %s", w.config.DbPath)

	// Perform initial full backup check
	w.checkForFullBackup()

	for {
		select {
		case <-ctx.Done():
			log.Println("[Watcher] Stopping database watcher...")
			return
		case <-ticker.C:
			w.poll()
		}
	}
}

func (w *DbWatcher) poll() {
	dbPath := w.config.DbPath
	walPath := dbPath + "-wal"

	// 1. Check main database changes/checkpoints
	dbStat, err := os.Stat(dbPath)
	if err != nil {
		if os.IsNotExist(err) {
			return // Database file not created yet
		}
		log.Printf("[Watcher] Error stat db: %v", err)
		return
	}

	// 2. Check WAL changes
	walStat, err := os.Stat(walPath)
	if err != nil {
		if os.IsNotExist(err) {
			// WAL file doesn't exist. If we previously had one, a checkpoint might have committed and deleted it.
			if w.lastWalSize > 0 {
				log.Println("[Watcher] WAL file deleted (checkpoint committed). Triggering full base verification...")
				w.lastWalSize = 0
				w.walOffset = 0
				w.checkForFullBackup()
			}
			return
		}
		log.Printf("[Watcher] Error stat WAL: %v", err)
		return
	}

	walSize := walStat.Size()

	// If WAL shrank (checkpoint committed and truncated)
	if walSize < w.lastWalSize {
		log.Printf("[Watcher] WAL truncated from %d to %d bytes. Resetting WAL tracker.", w.lastWalSize, walSize)
		w.walOffset = 0
		w.lastWalSize = walSize
		w.checkForFullBackup() // Base db changed, get fresh copy
		return
	}

	// If WAL grew, extract the delta bytes
	if walSize > w.walOffset {
		w.readWalDelta(walPath, walSize)
	}

	w.lastDbSize = dbStat.Size()
	w.lastWalSize = walSize
}

func (w *DbWatcher) readWalDelta(walPath string, currentSize int64) {
	file, err := os.Open(walPath)
	if err != nil {
		log.Printf("[Watcher] Error opening WAL file: %v", err)
		return
	}
	defer file.Close()

	_, err = file.Seek(w.walOffset, io.SeekStart)
	if err != nil {
		log.Printf("[Watcher] Error seeking WAL offset: %v", err)
		return
	}

	bytesToRead := currentSize - w.walOffset
	buf := make([]byte, bytesToRead)

	n, err := io.ReadFull(file, buf)
	if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF {
		log.Printf("[Watcher] Error reading WAL delta: %v", err)
		return
	}

	if n > 0 {
		deltaBytes := buf[:n]
		log.Printf("[Watcher] Captured WAL delta: %d bytes (offset %d to %d)", n, w.walOffset, w.walOffset+int64(n))
		
		w.walOffset += int64(n)
		
		// Send payload to uploader
		w.config.UploadChannel <- BackupPayload{
			Type:      BackupDelta,
			Filename:  filepath.Base(w.config.DbPath) + fmtWalSuffix(w.walOffset),
			Data:      deltaBytes,
			Timestamp: time.Now(),
		}
	}
}

func (w *DbWatcher) checkForFullBackup() {
	dbPath := w.config.DbPath
	file, err := os.Open(dbPath)
	if err != nil {
		if os.IsNotExist(err) {
			return
		}
		log.Printf("[Watcher] Error opening db for full backup check: %v", err)
		return
	}
	defer file.Close()

	// Compute hash to check if base DB actually changed
	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		log.Printf("[Watcher] Error hashing database file: %v", err)
		return
	}
	newHash := hex.EncodeToString(hasher.Sum(nil))

	if newHash != w.dbHash {
		log.Printf("[Watcher] Database baseline changed. Preparing full snapshot. Hash: %s", newHash[:8])
		w.dbHash = newHash

		// Read full content for upload
		_, _ = file.Seek(0, io.SeekStart)
		data, err := io.ReadAll(file)
		if err != nil {
			log.Printf("[Watcher] Error reading db: %v", err)
			return
		}

		w.config.UploadChannel <- BackupPayload{
			Type:      BackupFull,
			Filename:  filepath.Base(dbPath),
			Data:      data,
			Timestamp: time.Now(),
		}
	}
}

func fmtWalSuffix(offset int64) string {
	// e.g., .wal.0000004096
	return time.Now().Format("-20060102150405") + ".wal"
}
