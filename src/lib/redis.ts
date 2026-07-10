import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis) return _redis;
  _redis = new Redis(REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    lazyConnect: true, // don't connect immediately
  });
  return _redis;
}

// Expose as a Proxy so `redis.get(...)`, `redis.set(...)` work naturally
export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    return (getRedis() as any)[prop];
  },
});