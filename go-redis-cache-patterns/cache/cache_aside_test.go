package cache

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func TestCacheAside(t *testing.T) {
	// Start in-memory miniredis
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("failed to start miniredis: %v", err)
	}
	defer mr.Close()

	rClient := redis.NewClient(&redis.Options{
		Addr: mr.Addr(),
	})
	defer rClient.Close()

	ctx := context.Background()
	cache := NewCacheAside[User](rClient, 1*time.Minute)

	key := "user:123"
	user := User{ID: "123", Name: "Daniel", Email: "daniel@example.com"}

	// 1. Get on cache miss
	_, found, err := cache.Get(ctx, key)
	if err != nil {
		t.Errorf("unexpected error on get: %v", err)
	}
	if found {
		t.Error("expected cache miss, but key was found")
	}

	// 2. Set value
	err = cache.Set(ctx, key, user)
	if err != nil {
		t.Fatalf("failed to set cache: %v", err)
	}

	// 3. Get on cache hit
	cachedUser, found, err := cache.Get(ctx, key)
	if err != nil {
		t.Errorf("unexpected error on hit: %v", err)
	}
	if !found {
		t.Error("expected cache hit, but got miss")
	}
	if cachedUser.Name != "Daniel" || cachedUser.Email != "daniel@example.com" {
		t.Errorf("cached content mismatch: got %+v, want %+v", cachedUser, user)
	}

	// 4. Invalidate key
	err = cache.Invalidate(ctx, key)
	if err != nil {
		t.Errorf("failed to invalidate: %v", err)
	}

	// 5. Verify hit becomes miss again
	_, found, err = cache.Get(ctx, key)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if found {
		t.Error("expected cache miss after invalidation, but got hit")
	}
}
