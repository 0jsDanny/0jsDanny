package lock

import (
	"context"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	ErrLockAcquisitionFailed = errors.New("lock acquisition failed")
	ErrLockNotHeld           = errors.New("lock is not held or was released by timeout")
)

// luaReleaseLock is a Lua script that atomically releases a lock
// only if the value in Redis matches the expected owner ID.
// This prevents a client from releasing another client's lock.
const luaReleaseLock = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
`

// DistributedLock provides mutual exclusion across multiple instances.
type DistributedLock struct {
	client  *redis.Client
	key     string
	ownerID string // Unique identifier for the client (e.g. UUID)
	ttl     time.Duration
}

func NewDistributedLock(client *redis.Client, key string, ownerID string, ttl time.Duration) *DistributedLock {
	return &DistributedLock{
		client:  client,
		key:     key,
		ownerID: ownerID,
		ttl:     ttl,
	}
}

// Acquire attempts to acquire the lock. Returns ErrLockAcquisitionFailed if it cannot.
func (l *DistributedLock) Acquire(ctx context.Context) error {
	// SET key ownerID NX PX ttl
	ok, err := l.client.SetNX(ctx, l.key, l.ownerID, l.ttl).Result()
	if err != nil {
		return err
	}
	if !ok {
		return ErrLockAcquisitionFailed
	}
	return nil
}

// Release releases the lock using the atomic Lua script.
func (l *DistributedLock) Release(ctx context.Context) error {
	res, err := l.client.Eval(ctx, luaReleaseLock, []string{l.key}, l.ownerID).Result()
	if err != nil {
		return err
	}

	released, ok := res.(int64)
	if !ok || released != 1 {
		return ErrLockNotHeld
	}
	return nil
}
