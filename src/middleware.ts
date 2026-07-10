import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (pathname.startsWith('/api')) {
    // Bypass seed endpoint to avoid blocking setup
    if (pathname === '/api/seed') {
      return NextResponse.next();
    }

    // Rate limiting placeholder — re-add with Edge-compatible solution later
  }

  return NextResponse.next();
}

// Configure middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
};
