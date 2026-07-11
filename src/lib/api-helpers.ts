import { NextRequest, NextResponse } from 'next/server';
import { logApiRequest } from '@/lib/api-logger';
import { apiRateLimiter } from '@/lib/rate-limiter';

type RouteHandler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

/**
 * Wraps an API route handler with rate limiting and request logging.
 * Usage:
 *   export const GET = withApiProtection(async (req) => { ... });
 */
export function withApiProtection(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const method = req.method;
    const url = req.nextUrl.pathname + req.nextUrl.search;

    // Rate limiting
    const rateLimitResult = await apiRateLimiter(req);
    if (rateLimitResult && !rateLimitResult.success) {
      const durationMs = Date.now() - startTime;
      logApiRequest(method, url, 429, durationMs, 'Rate limit exceeded', req.ip || undefined);
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      );
    }

    try {
      const response = await handler(req, ...args);
      const durationMs = Date.now() - startTime;
      logApiRequest(method, url, response.status, durationMs);
      return response;
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      logApiRequest(method, url, 500, durationMs, error.message, req.ip || undefined);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}