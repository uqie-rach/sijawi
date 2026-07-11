import { NextRequest, NextResponse } from 'next/server';
import { logApiRequest } from '@/lib/api-logger';
import { apiRateLimiter } from '@/lib/rate-limiter';

type RouteHandler = (req: Request, ...args: any[]) => Promise<Response>;

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function withApiProtection(handler: RouteHandler): RouteHandler {
  return async (req: Request, ...args: any[]) => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname + url.search;
    const ip = getClientIp(req);

    const rateLimitResult = await apiRateLimiter(req as unknown as NextRequest);
    if (rateLimitResult && !rateLimitResult.success) {
      const durationMs = Date.now() - startTime;
      logApiRequest(method, path, 429, durationMs, 'Rate limit exceeded', ip);
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
      logApiRequest(method, path, response.status, durationMs, undefined, ip);
      return response;
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      logApiRequest(method, path, 500, durationMs, error.message, ip);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}