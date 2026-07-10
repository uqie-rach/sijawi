import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy(times) {
    return Math.min(times * 500, 5000);
  }
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error (non-fatal):', err.message);
});