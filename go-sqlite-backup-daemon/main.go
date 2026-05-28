package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	// Parse CLI flags
	dbPath := flag.String("db", "data.db", "Path to the SQLite database file")
	pollInterval := flag.Duration("interval", 1*time.Second, "Interval between file polls")
	vaultDir := flag.String("vault", ".backup_vault", "Directory to store local backup archives")
	remoteURL := flag.String("remote-url", "", "Optional HTTP endpoint URL to upload backups")
	remoteToken := flag.String("remote-token", "", "Optional Authorization token for the remote URL")
	flag.Parse()

	log.Println("[Daemon] Initializing SQLite WAL Backup Daemon...")

	// Verify database file is provided
	if *dbPath == "" {
		log.Fatal("[Daemon] Error: -db parameter cannot be empty")
	}

	// Create communication channel
	uploadChan := make(chan BackupPayload, 100)

	// Context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize components
	watcher := NewDbWatcher(WatcherConfig{
		DbPath:        *dbPath,
		PollInterval:  *pollInterval,
		UploadChannel: uploadChan,
	})

	uploader := NewDbUploader(UploaderConfig{
		VaultDir:     *vaultDir,
		RemoteURL:    *remoteURL,
		RemoteToken:  *remoteToken,
		InputChannel: uploadChan,
	})

	// Start Uploader and Watcher in goroutines
	go uploader.Start(ctx)
	go watcher.Start(ctx)

	// OS signals capturing for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	log.Printf("[Daemon] Running. Press Ctrl+C to stop.")

	// Wait for terminate signal
	sig := <-sigChan
	log.Printf("[Daemon] Received signal %v. Initiating shutdown...", sig)

	// Cancel context to stop watcher and uploader loops
	cancel()

	// Wait for queue flush (uploader will exit when channel is closed)
	close(uploadChan)

	// Let uploader goroutine complete final writes
	time.Sleep(1 * time.Second)
	log.Println("[Daemon] Shutdown complete. Goodbye.")
}
