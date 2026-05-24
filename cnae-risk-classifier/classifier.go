// Package classifier provides concurrent CNAE sanitary risk classification.
//
// Given a set of CNAE codes (Brazilian economic activity codes), it fans out
// lookups concurrently, respects context deadlines, and consolidates results
// using the sanitary risk hierarchy: HIGH > MEDIUM > LOW.
package classifier

import (
	"context"
	"fmt"
	"sync"
)

// RiskLevel represents a sanitary risk tier.
// Higher numeric values denote higher risk, enabling direct comparison.
type RiskLevel int

const (
	RiskLow    RiskLevel = iota // Baixo  — simplified licensing
	RiskMedium                  // Médio  — protocol team decides rite
	RiskHigh                    // Alto   — mandatory multi-sector inspection
)

func (r RiskLevel) String() string {
	switch r {
	case RiskLow:
		return "BAIXO"
	case RiskMedium:
		return "MEDIO"
	case RiskHigh:
		return "ALTO"
	default:
		return "DESCONHECIDO"
	}
}

// CNAEResult holds the classification output for a single CNAE code.
type CNAEResult struct {
	Code        string
	Description string
	Risk        RiskLevel
	BaseFee     float64 // in BRL, base value before correction factor
}

// ClassificationResult aggregates results for a full set of CNAEs.
// ConsolidatedRisk follows the "highest wins" rule: a single HIGH-risk
// CNAE classifies the entire establishment as HIGH risk.
type ClassificationResult struct {
	Results          []CNAEResult
	ConsolidatedRisk RiskLevel
	MaxFee           float64 // highest base fee among all CNAEs
}

var resultPool = sync.Pool{
	New: func() any {
		return &ClassificationResult{
			// Pre-allocate slice capacity to prevent reallocation for most businesses
			Results: make([]CNAEResult, 0, 8),
		}
	},
}

// ReleaseResult returns a ClassificationResult to the pool to reduce Garbage Collector pressure.
// The slice length is reset while preserving capacity, and fields are zeroed to prevent data leakage.
func ReleaseResult(r *ClassificationResult) {
	if r == nil {
		return
	}
	r.ConsolidatedRisk = RiskLow
	r.MaxFee = 0
	r.Results = r.Results[:0]
	resultPool.Put(r)
}

// Source is the interface that wraps CNAE lookup.
// Implementations can be backed by SQLite, PostgreSQL, an HTTP API,
// or an in-memory table — the Classifier does not care.
type Source interface {
	Lookup(ctx context.Context, cnae string) (CNAEResult, error)
}

// Classifier performs concurrent CNAE risk classification.
type Classifier struct {
	source     Source
	maxWorkers int // limits goroutine fan-out; acts as a semaphore
}

// New creates a Classifier. maxWorkers caps concurrent Lookup calls.
// If maxWorkers <= 0, it defaults to 10.
func New(source Source, maxWorkers int) *Classifier {
	if maxWorkers <= 0 {
		maxWorkers = 10
	}
	return &Classifier{source: source, maxWorkers: maxWorkers}
}

// Classify runs one goroutine per CNAE (bounded by maxWorkers) and returns
// the consolidated result. If any lookup fails, the first error is returned
// and all in-flight goroutines are cancelled via the shared context.
func (c *Classifier) Classify(ctx context.Context, cnaes []string) (*ClassificationResult, error) {
	out := resultPool.Get().(*ClassificationResult)
	// Ensure fields are reset (especially if pulled from pool without prior release)
	out.ConsolidatedRisk = RiskLow
	out.MaxFee = 0
	out.Results = out.Results[:0]

	if len(cnaes) == 0 {
		return out, nil
	}

	// Derive a child context so we can cancel all goroutines on the first error.
	gctx, cancel := context.WithCancel(ctx)
	defer cancel()

	// Semaphore: a buffered channel with maxWorkers slots limits the degree
	// of parallelism, preventing socket/connection exhaustion under high load.
	sem := make(chan struct{}, c.maxWorkers)

	var (
		wg       sync.WaitGroup
		mu       sync.Mutex    // guards results slice
		once     sync.Once     // ensures firstErr is written exactly once
		firstErr error
	)

	for _, cnae := range cnaes {
		cnae := cnae // capture loop variable before goroutine launch

		wg.Add(1)
		go func() {
			defer wg.Done()

			// Acquire a semaphore slot — block if at capacity, bail on cancel.
			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
			case <-gctx.Done():
				once.Do(func() { firstErr = gctx.Err() })
				return
			}

			result, err := c.source.Lookup(gctx, cnae)
			if err != nil {
				// sync.Once guarantees only the first error is recorded,
				// and cancel() signals all sibling goroutines to stop.
				once.Do(func() {
					firstErr = fmt.Errorf("lookup %q: %w", cnae, err)
					cancel()
				})
				return
			}

			// Mutex guards the shared results slice; this is the canonical
			// "channels for coordination, mutex for shared state" trade-off.
			mu.Lock()
			out.Results = append(out.Results, result)
			mu.Unlock()
		}()
	}

	wg.Wait()

	if firstErr != nil {
		ReleaseResult(out)
		return nil, firstErr
	}

	return consolidate(out), nil
}

// consolidate applies the "highest wins" rule across all results in-place.
func consolidate(out *ClassificationResult) *ClassificationResult {
	for _, r := range out.Results {
		if r.Risk > out.ConsolidatedRisk {
			out.ConsolidatedRisk = r.Risk
		}
		if r.BaseFee > out.MaxFee {
			out.MaxFee = r.BaseFee
		}
	}
	return out
}
