import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const url = new URL(request.url);

  // Only apply authentication to filter endpoints
  if (!url.pathname.startsWith('/api/filters/')) {
    return null; // Continue to next middleware
  }

  try {
    // Get JWT token from request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required to access filter endpoints'
        },
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer'
          }
        }
      );
    }

    // Validate token expiration
    if (token.exp && Date.now() >= token.exp * 1000) {
      return NextResponse.json(
        {
          success: false,
          error: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired'
        },
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer error="invalid_token", error_description="The access token expired"'
          }
        }
      );
    }

    // Add user context to request headers for downstream use
    const response = NextResponse.next();
    if (token.sub) {
      response.headers.set('X-User-ID', token.sub);
    }
    if (token.email) {
      response.headers.set('X-User-Email', token.email as string);
    }

    return response;

  } catch (error) {
    console.error('Authentication middleware error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'AUTH_ERROR',
        message: 'Authentication validation failed'
      },
      {
        status: 500
      }
    );
  }
}

// Helper function to extract user context from request headers
export function getUserContext(request: NextRequest): { userId?: string; email?: string } {
  return {
    userId: request.headers.get('X-User-ID') || undefined,
    email: request.headers.get('X-User-Email') || undefined
  };
}