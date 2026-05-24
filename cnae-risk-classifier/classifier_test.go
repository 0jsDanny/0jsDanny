package classifier

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"testing"
	"time"
)

// --- Unit Tests ---

func TestConsolidatedRisk_HighestWins(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		cnaes        []string
		expectedRisk RiskLevel
	}{
		{
			name:         "single high-risk CNAE",
			cnaes:        []string{"5611201"}, // restaurant
			expectedRisk: RiskHigh,
		},
		{
			name:         "single low-risk CNAE",
			cnaes:        []string{"4781400"}, // clothing store
			expectedRisk: RiskLow,
		},
		{
			name:         "mixed: one high among lows — high wins",
			cnaes:        []string{"4781400", "4712100", "5611201"},
			expectedRisk: RiskHigh,
		},
		{
			name:         "mixed: medium and low — medium wins",
			cnaes:        []string{"4781400", "4771701"},
			expectedRisk: RiskMedium,
		},
		{
			name:         "unknown CNAE defaults to low",
			cnaes:        []string{"0000000"},
			expectedRisk: RiskLow,
		},
		{
			name:         "empty input returns low",
			cnaes:        []string{},
			expectedRisk: RiskLow,
		},
		{
			name:         "hospital + pharmacy — hospital (high) wins",
			cnaes:        []string{"4771701", "8610101"},
			expectedRisk: RiskHigh,
		},
	}

	src := MatrixSource{}
	clf := New(src, 4)

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result, err := clf.Classify(context.Background(), tt.cnaes)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if result.ConsolidatedRisk != tt.expectedRisk {
				t.Errorf("got %s, want %s (cnaes: %v)",
					result.ConsolidatedRisk, tt.expectedRisk, tt.cnaes)
			}
		})
	}
}

func TestNormaliseCNAE(t *testing.T) {
	t.Parallel()

	tests := []struct {
		input    string
		expected string
	}{
		{"5611201", "5611201"},  // already 7 digits
		{"561120100", "5611201"}, // 9 digits with "00" suffix
		{"561120103", "5611201"}, // 9 digits with "03" suffix
		{"56.1120-1", "5611201"}, // formatted with punctuation
		{"", ""},                 // empty
		{"ABC", ""},              // no digits
	}

	for _, tt := range tests {
		tt := tt
		t.Run(fmt.Sprintf("input=%q", tt.input), func(t *testing.T) {
			t.Parallel()
			got := normaliseCNAE(tt.input)
			if got != tt.expected {
				t.Errorf("normaliseCNAE(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}

// TestContextCancellation verifies that in-flight lookups abort when the
// context is cancelled — critical for preventing goroutine leaks.
func TestContextCancellation(t *testing.T) {
	t.Parallel()

	// slowSource simulates a backend that never responds.
	slow := &stubSource{delay: 10 * time.Second}
	clf := New(slow, 2)

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	_, err := clf.Classify(ctx, []string{"5611201", "8610101", "4771701"})
	if err == nil {
		t.Fatal("expected a timeout error, got nil")
	}
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Errorf("expected DeadlineExceeded, got: %v", err)
	}
}

// TestSourceError verifies that a single lookup failure is propagated and
// cancels sibling goroutines.
func TestSourceError(t *testing.T) {
	t.Parallel()

	errSrc := &stubSource{err: fmt.Errorf("connection refused")}
	clf := New(errSrc, 4)

	_, err := clf.Classify(context.Background(), []string{"5611201"})
	if err == nil {
		t.Fatal("expected an error, got nil")
	}
}

// TestRaceCondition is designed to be run with: go test -race
// It verifies that concurrent result collection is free of data races.
func TestRaceCondition(t *testing.T) {
	src := MatrixSource{}
	clf := New(src, 8)

	cnaes := []string{
		"5611201", "4771701", "8610101", "4781400",
		"4712100", "3811400", "7500100", "8640202",
	}

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if _, err := clf.Classify(context.Background(), cnaes); err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		}()
	}
	wg.Wait()
}

// --- Benchmarks ---
// Run with: go test -bench=. -benchmem

func BenchmarkClassify_8CNAEs(b *testing.B) {
	src := MatrixSource{}
	clf := New(src, 8)
	cnaes := []string{
		"5611201", "4771701", "8610101", "4781400",
		"4712100", "3811400", "7500100", "8640202",
	}

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		if _, err := clf.Classify(context.Background(), cnaes); err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkClassify_1CNAE(b *testing.B) {
	src := MatrixSource{}
	clf := New(src, 4)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		if _, err := clf.Classify(context.Background(), []string{"5611201"}); err != nil {
			b.Fatal(err)
		}
	}
}

// BenchmarkClassify_WorkerScaling compares throughput at different worker counts.
func BenchmarkClassify_WorkerScaling(b *testing.B) {
	src := MatrixSource{}
	cnaes := []string{
		"5611201", "4771701", "8610101", "4781400",
		"4712100", "3811400", "7500100", "8640202",
		"4731800", "5611202", "1091101", "8630501",
	}

	for _, workers := range []int{1, 2, 4, 8, 12} {
		workers := workers
		b.Run(fmt.Sprintf("workers=%d", workers), func(b *testing.B) {
			clf := New(src, workers)
			b.ReportAllocs()
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				if _, err := clf.Classify(context.Background(), cnaes); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

// --- Test Helpers ---

// stubSource is a controllable Source for testing cancellation and error paths.
type stubSource struct {
	delay time.Duration
	err   error
}

func (s *stubSource) Lookup(ctx context.Context, _ string) (CNAEResult, error) {
	if s.err != nil {
		return CNAEResult{}, s.err
	}
	select {
	case <-time.After(s.delay):
		return CNAEResult{Risk: RiskLow}, nil
	case <-ctx.Done():
		return CNAEResult{}, ctx.Err()
	}
}
