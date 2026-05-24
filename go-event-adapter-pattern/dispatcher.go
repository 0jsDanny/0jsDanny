package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

// bufferPool reduces Garbage Collector pressure by reusing bytes.Buffer
// instances across multiple high-throughput JSON serialization requests.
var bufferPool = sync.Pool{
	New: func() any {
		return new(bytes.Buffer)
	},
}

// Dispatcher handles the asynchronous delivery of normalized events.
type Dispatcher struct {
	WebhookURL string
	Client     *http.Client
}

func NewDispatcher(url string) *Dispatcher {
	return &Dispatcher{
		WebhookURL: url,
		Client:     &http.Client{Timeout: 5 * time.Second},
	}
}

// DispatchAsync simulates a non-blocking background hook (fire-and-forget).
// skipEvents enables idempotency during bulk data migrations (prevents email storms).
func (d *Dispatcher) DispatchAsync(ctx context.Context, adapter EventAdapter, skipEvents bool) {
	if skipEvents {
		log.Println("[EDA] Event skipped (Idempotency flag active - e.g. Bulk Import)")
		return
	}

	event := adapter.Normalize()
	
	// Fire and forget - do not block the main HTTP request thread
	go func(evt StandardEvent) {
		bgCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Get a buffer from the pool and ensure it's returned
		buf := bufferPool.Get().(*bytes.Buffer)
		buf.Reset()
		defer bufferPool.Put(buf)

		if err := json.NewEncoder(buf).Encode(evt); err != nil {
			log.Printf("[EDA] Failed to encode JSON for %s: %v\n", evt.SubmissionID, err)
			return
		}

		req, err := http.NewRequestWithContext(bgCtx, "POST", d.WebhookURL, buf)
		if err != nil {
			log.Printf("[EDA] Failed to build request for %s: %v\n", evt.SubmissionID, err)
			return
		}
		
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := d.Client.Do(req)
		if err != nil {
			log.Printf("[EDA] Failed to dispatch event %s: %v\n", evt.SubmissionID, err)
			return
		}
		defer resp.Body.Close()
		
		log.Printf("[EDA] Successfully dispatched event %s to %s\n", evt.SubmissionID, d.WebhookURL)
	}(event)
}

// DeadLetterEvent wraps an event that failed all retry attempts.
type DeadLetterEvent struct {
	Event    StandardEvent
	Attempts int
	LastErr  error
}

// RetryDispatcher wraps Dispatcher with exponential backoff and DLQ capabilities.
type RetryDispatcher struct {
	base       *Dispatcher
	maxRetries int
	DLQ        chan DeadLetterEvent
}

func NewRetryDispatcher(url string, maxRetries int, dlqSize int) *RetryDispatcher {
	return &RetryDispatcher{
		base:       NewDispatcher(url),
		maxRetries: maxRetries,
		DLQ:        make(chan DeadLetterEvent, dlqSize),
	}
}

// DispatchAsync implements the retry mechanism with exponential backoff.
func (r *RetryDispatcher) DispatchAsync(ctx context.Context, adapter EventAdapter, skipEvents bool) {
	if skipEvents {
		log.Println("[EDA-Retry] Event skipped (Idempotency flag active - e.g. Bulk Import)")
		return
	}

	event := adapter.Normalize()

	go func(evt StandardEvent) {
		var lastErr error
		backoff := 100 * time.Millisecond

		// Get buffer outside the loop to reuse it across all retry attempts!
		buf := bufferPool.Get().(*bytes.Buffer)
		buf.Reset()
		defer bufferPool.Put(buf)

		if err := json.NewEncoder(buf).Encode(evt); err != nil {
			log.Printf("[EDA-Retry] Failed to encode JSON for %s: %v\n", evt.SubmissionID, err)
			return
		}

		// Because http.NewRequest consumes the body reader, we need the raw bytes
		// to create a fresh reader on each retry attempt.
		payloadBytes := buf.Bytes()

		for attempt := 1; attempt <= r.maxRetries; attempt++ {
			attemptCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			
			req, err := http.NewRequestWithContext(attemptCtx, "POST", r.base.WebhookURL, bytes.NewReader(payloadBytes))
			if err != nil {
				cancel()
				lastErr = err
				break
			}
			req.Header.Set("Content-Type", "application/json")

			resp, err := r.base.Client.Do(req)
			if err != nil {
				cancel()
				lastErr = err
			} else {
				if resp.StatusCode >= 200 && resp.StatusCode < 300 {
					resp.Body.Close()
					cancel()
					log.Printf("[EDA-Retry] Successfully dispatched event %s to %s on attempt %d\n", evt.SubmissionID, r.base.WebhookURL, attempt)
					return // Success
				}
				lastErr = fmt.Errorf("unexpected status code: %d", resp.StatusCode)
				resp.Body.Close()
				cancel()
			}

			if attempt < r.maxRetries {
				log.Printf("[EDA-Retry] Attempt %d failed for event %s. Retrying in %v. Error: %v\n", attempt, evt.SubmissionID, backoff, lastErr)
				time.Sleep(backoff)
				backoff *= 2
			}
		}

		// Permanently failed — send to Dead Letter Queue (DLQ)
		log.Printf("[EDA-Retry] All attempts failed for event %s. Sending to DLQ. Error: %v\n", evt.SubmissionID, lastErr)
		select {
		case r.DLQ <- DeadLetterEvent{Event: evt, Attempts: r.maxRetries, LastErr: lastErr}:
		default:
			log.Printf("[EDA-Retry] DLQ full. Dropping event %s. Error: %v\n", evt.SubmissionID, lastErr)
		}
	}(event)
}
