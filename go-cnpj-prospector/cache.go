package main

import (
	"sync"
	"time"
)

type CacheEntry struct {
	Data      *CNPJNormalizedResponse
	Timestamp time.Time
}

type CNPJCache struct {
	mu    sync.RWMutex
	store map[string]CacheEntry
}

func NewCNPJCache() *CNPJCache {
	return &CNPJCache{
		store: make(map[string]CacheEntry),
	}
}

// Get retrieves a CNPJ entry from the cache if it hasn't expired yet
func (c *CNPJCache) Get(cnpj string, ttl time.Duration) (*CNPJNormalizedResponse, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	entry, exists := c.store[cnpj]
	if !exists {
		return nil, false
	}

	if time.Since(entry.Timestamp) > ttl {
		return nil, false
	}

	return entry.Data, true
}

// Set stores a CNPJ entry in the cache with the current timestamp
func (c *CNPJCache) Set(cnpj string, data *CNPJNormalizedResponse) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.store[cnpj] = CacheEntry{
		Data:      data,
		Timestamp: time.Now(),
	}
}

// Clear empties the entire cache
func (c *CNPJCache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.store = make(map[string]CacheEntry)
}
