import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const globalForRedis = globalThis as unknown as { _redis: Redis | undefined };

export const redis = globalForRedis._redis ?? new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

if (!globalForRedis._redis) {
  globalForRedis._redis = redis;
}
