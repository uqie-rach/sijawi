import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

interface RateLimiterConfig {
  windowMs?: number;      // Time window in milliseconds
  max?: number;           // Max requests per window per IP
}

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX = 60;              // 60 requests per minute

/**
 * A simple Redis-based rate limiter for Next.js API routes.
 * Uses express-rate-limit compatible config but implemented with ioredis.
 */
export function createRateLimiter(config: RateLimiterConfig = {}) {
  const windowMs = config.windowMs || DEFAULT_WINDOW_MS;
  const max = config.max || DEFAULT_MAX;

  return async function rateLimit(req: NextRequest): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  } | null> {
    try {
      const ip = req.ip || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
      const key = `ratelimit:${ip}`;

      const now = Date.now();
      const windowStart = now - windowMs;

      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart); // Remove old entries
      pipeline.zcard(key);                            // Count current entries
      pipeline.zadd(key, now, `${now}-${Math.random()}`); // Add current request
      pipeline.expire(key, Math.ceil(windowMs / 1000) + 1); // Set TTL

      const results = await pipeline.exec();
      if (!results) return null; // Redis error, allow request

      const count = (results[1]?.[1] as number) || 0;

      // Calculate reset time (end of current window)
      const oldestEntry = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const oldestTime = oldestEntry[1] ? parseInt(oldestEntry[1]) : now;
      const reset = oldestTime + windowMs;

      if (count > max) {
        return {
          success: false,
          remaining: 0,
          reset,
        };
      }

      return {
        success: true,
        remaining: max - count,
        reset,
      };
    } catch (err) {
      console.error('[Rate Limiter] Redis error, allowing request:', err);
      return null; // Allow on Redis failure
    }
  };
}

// Pre-configured rate limiters
export const apiRateLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });  // 60 req/min
export const authRateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 }); // 10 req/min