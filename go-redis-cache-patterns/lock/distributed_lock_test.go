package lock

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

func TestDistributedLock(t *testing.T) {
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
	lockKey := "resource_lock:job_01"

	lock1 := NewDistributedLock(rClient, lockKey, "worker_A", 1*time.Second)
	lock2 := NewDistributedLock(rClient, lockKey, "worker_B", 1*time.Second)

	// 1. Worker A acquires lock successfully
	err = lock1.Acquire(ctx)
	if err != nil {
		t.Errorf("expected Worker A to acquire lock, got error: %v", err)
	}

	// 2. Worker B tries to acquire lock and fails
	err = lock2.Acquire(ctx)
	if err != ErrLockAcquisitionFailed {
		t.Errorf("expected ErrLockAcquisitionFailed, got: %v", err)
	}

	// 3. Worker B tries to release Worker A's lock (should fail)
	err = lock2.Release(ctx)
	if err != ErrLockNotHeld {
		t.Errorf("expected Worker B release to fail with ErrLockNotHeld, got: %v", err)
	}

	// 4. Worker A releases lock successfully
	err = lock1.Release(ctx)
	if err != nil {
		t.Errorf("expected Worker A to release lock successfully, got: %v", err)
	}

	// 5. Worker B can now acquire the lock
	err = lock2.Acquire(ctx)
	if err != nil {
		t.Errorf("expected Worker B to acquire lock after release, got: %v", err)
	}
}

func TestDistributedLock_Timeout(t *testing.T) {
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
	lockKey := "resource_lock:job_02"

	lock := NewDistributedLock(rClient, lockKey, "worker_A", 100*time.Millisecond)

	// Acquire lock
	err = lock.Acquire(ctx)
	if err != nil {
		t.Fatalf("failed to acquire: %v", err)
	}

	// Fast-forward miniredis time by 200ms
	mr.FastForward(200 * time.Millisecond)

	// Releasing now should fail because key expired in Redis
	err = lock.Release(ctx)
	if err != ErrLockNotHeld {
		t.Errorf("expected release to fail with ErrLockNotHeld after timeout, got: %v", err)
	}
}
