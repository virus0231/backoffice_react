import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from './src/lib/middleware/rate-limit';
import { authMiddleware } from './src/lib/middleware/auth';

export async function middleware(request: NextRequest) {
  // Apply rate limiting first
  const rateLimitResponse = await rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse; // Rate limit exceeded
  }

  // Apply authentication
  const authResponse = await authMiddleware(request);
  if (authResponse) {
    return authResponse; // Authentication failed or succeeded
  }

  // Continue to the route
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/filters/:path*'
  ]
};