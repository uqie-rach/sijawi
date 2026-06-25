import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// General API rate limiter: 100 requests per 15 minutes (900 seconds)
const generalLimiter = new RateLimiterMemory({
  points: 100,
  duration: 900,
});

// Stricter login rate limiter: 5 requests per 1 minute (60 seconds)
const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    // Bypass seed endpoint to avoid blocking setup
    if (pathname === '/api/seed') {
      return NextResponse.next();
    }

    // Get client IP address safely
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    try {
      if (pathname === '/api/auth/login') {
        // Apply strict login rate limiting
        await loginLimiter.consume(ip, 1);
      } else {
        // Apply general API rate limiting
        await generalLimiter.consume(ip, 1);
      }
    } catch (rejRes) {
      // Rate limit exceeded
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter: rejRes instanceof Error ? '60' : Math.round((rejRes as any).msBeforeNext / 1000) || '60',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': rejRes instanceof Error ? '60' : String(Math.round((rejRes as any).msBeforeNext / 1000) || '60'),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

// Configure middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
};