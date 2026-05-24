package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

// CacheAside implements the Cache-Aside (Lazy Loading) pattern.
// The caller is responsible for populating the cache on a miss.
// This pattern trades consistency for resilience: if Redis is down,
// the system falls back to the source of truth without failing.
type CacheAside[T any] struct {
	client redis.Cmdable
	ttl    time.Duration
}

func NewCacheAside[T any](client redis.Cmdable, ttl time.Duration) *CacheAside[T] {
	return &CacheAside[T]{client: client, ttl: ttl}
}

// Get returns the cached value or (zero, false, nil) on a miss.
// A Redis error is returned only if the error is NOT a cache miss.
func (c *CacheAside[T]) Get(ctx context.Context, key string) (T, bool, error) {
	var zero T
	data, err := c.client.Get(ctx, key).Bytes()
	if err == redis.Nil {
		return zero, false, nil // Cache miss — caller should populate
	}
	if err != nil {
		return zero, false, err
	}

	var value T
	if err := json.Unmarshal(data, &value); err != nil {
		return zero, false, err
	}
	return value, true, nil
}

// Set writes a value to the cache with the configured TTL.
func (c *CacheAside[T]) Set(ctx context.Context, key string, value T) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, data, c.ttl).Err()
}

// Invalidate removes a key from the cache.
// Used on write operations to prevent stale reads.
func (c *CacheAside[T]) Invalidate(ctx context.Context, key string) error {
	return c.client.Del(ctx, key).Err()
}
