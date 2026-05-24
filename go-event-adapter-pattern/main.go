package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"time"
)

func main() {
	// 1. Setup a dummy n8n webhook receiver to demonstrate the dispatch
	dummyN8n := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer dummyN8n.Close()

	fmt.Println("=== Event-Driven Architecture: Adapter Pattern Demo ===")
	dispatcher := NewDispatcher(dummyN8n.URL)
	ctx := context.Background()

	// 2. Simulate an incoming webhook from an external system (e.g., Tally Forms)
	tallyPayload := TallyPayload{
		ResponseID: "req_tally_001",
		Data: map[string]any{
			"fee_amount": 150.00,
			"cnae":       "5611201",
		},
	}
	
	// Dispatching Tally event (Normal flow)
	dispatcher.DispatchAsync(ctx, tallyPayload, false)

	// 3. Simulate an incoming submission from the Internal Frontend
	internalPayload := InternalPayload{
		RecordID: "rec_internal_002",
		ProcType: "Sanitary License Renewal",
		CPFCNPJ:  "12345678000199",
		Contact: map[string]any{
			"email": "contact@business.com",
		},
	}
	
	// Dispatching Internal event (Normal flow)
	dispatcher.DispatchAsync(ctx, internalPayload, false)

	// 4. Simulate a bulk import (Idempotency check)
	bulkImportPayload := InternalPayload{
		RecordID: "rec_migrated_003",
	}
	// Dispatching with skipEvents = true (Prevents email storms)
	dispatcher.DispatchAsync(ctx, bulkImportPayload, true)

	// 5. Demonstrate the RetryDispatcher with a failing destination and DLQ capture
	fmt.Println("\n=== Demo: Asynchronous Retries & Dead-Letter Queue (DLQ) ===")
	failingN8n := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError) // Force failure
	}))
	defer failingN8n.Close()

	retryDispatcher := NewRetryDispatcher(failingN8n.URL, 3, 5) // 3 retries max
	failingPayload := TallyPayload{
		ResponseID: "req_failed_004",
		Data: map[string]any{
			"status": "critical_update",
		},
	}

	retryDispatcher.DispatchAsync(ctx, failingPayload, false)

	// Wait for retries to run and event to reach the DLQ
	// 100ms first sleep -> 200ms second sleep -> total ~400ms
	time.Sleep(1 * time.Second)

	// Inspect the Dead-Letter Queue
	select {
	case dlqEvent := <-retryDispatcher.DLQ:
		fmt.Printf("[DLQ Audit] Caught failed event in DLQ!\n")
		fmt.Printf(" - ID: %s\n", dlqEvent.Event.SubmissionID)
		fmt.Printf(" - Failed Attempts: %d\n", dlqEvent.Attempts)
		fmt.Printf(" - Last Error: %v\n", dlqEvent.LastErr)
	default:
		fmt.Println("[DLQ Audit] No events in DLQ (unexpected)")
	}

	fmt.Println("=== End of Demo ===")
}
