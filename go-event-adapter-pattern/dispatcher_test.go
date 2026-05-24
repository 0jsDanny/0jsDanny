package main

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"
)

// TestDispatcher_DispatchAsync verifies normal asynchronous dispatching.
func TestDispatcher_DispatchAsync(t *testing.T) {
	var mu sync.Mutex
	received := false
	var receivedBody StandardEvent

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		defer mu.Unlock()
		received = true
		
		body, _ := io.ReadAll(r.Body)
		_ = json.Unmarshal(body, &receivedBody)
		w.WriteHeader(http.StatusOK)
	}))
	defer ts.Close()

	dispatcher := NewDispatcher(ts.URL)
	payload := TallyPayload{
		ResponseID: "test_tally_001",
		Data: map[string]any{"key": "value"},
	}

	dispatcher.DispatchAsync(context.Background(), payload, false)

	// Wait up to 500ms for async goroutine to complete
	deadline := time.Now().Add(500 * time.Millisecond)
	for time.Now().Before(deadline) {
		mu.Lock()
		done := received
		mu.Unlock()
		if done {
			break
		}
		time.Sleep(10 * time.Millisecond)
	}

	if !received {
		t.Fatal("expected dispatcher to send webhook request, but none was received")
	}

	if receivedBody.SubmissionID != "test_tally_001" {
		t.Errorf("expected SubmissionID test_tally_001, got %s", receivedBody.SubmissionID)
	}
}

// BenchmarkEncodeWithPool measures the performance of JSON encoding using sync.Pool buffer reuse.
func BenchmarkEncodeWithPool(b *testing.B) {
	event := StandardEvent{
		EventType:    "FORM_RESPONSE",
		FormID:       "EXTERNAL_TALLY",
		SubmissionID: "bench_tally_001",
		Payload: map[string]any{
			"fee_amount": 150.00,
			"cnae":       "5611201",
		},
	}

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		buf := bufferPool.Get().(*bytes.Buffer)
		buf.Reset()

		if err := json.NewEncoder(buf).Encode(event); err != nil {
			b.Fatal(err)
		}

		_ = buf.Bytes() // Simulate reading the payload bytes
		bufferPool.Put(buf)
	}
}

// BenchmarkEncodeWithoutPool measures the performance of JSON encoding allocating a new buffer every time.
func BenchmarkEncodeWithoutPool(b *testing.B) {
	event := StandardEvent{
		EventType:    "FORM_RESPONSE",
		FormID:       "EXTERNAL_TALLY",
		SubmissionID: "bench_tally_001",
		Payload: map[string]any{
			"fee_amount": 150.00,
			"cnae":       "5611201",
		},
	}

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		var buf bytes.Buffer
		if err := json.NewEncoder(&buf).Encode(event); err != nil {
			b.Fatal(err)
		}
		_ = buf.Bytes()
	}
}
