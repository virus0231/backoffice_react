import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface RequestInfo {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RequestInfo>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, info] of this.store.entries()) {
      if (now > info.resetTime) {
        this.store.delete(key);
      }
    }
  }

  private getKey(request: NextRequest): string {
    // Use IP address as identifier
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] :
               request.headers.get('x-real-ip') ||
               'unknown';
    return `rate_limit:${ip}`;
  }

  async isAllowed(request: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.getKey(request);
    const now = Date.now();

    let requestInfo = this.store.get(key);

    if (!requestInfo || now > requestInfo.resetTime) {
      // Create new window
      requestInfo = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      this.store.set(key, requestInfo);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: requestInfo.resetTime
      };
    }

    if (requestInfo.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: requestInfo.resetTime
      };
    }

    requestInfo.count++;
    this.store.set(key, requestInfo);

    return {
      allowed: true,
      remaining: this.config.maxRequests - requestInfo.count,
      resetTime: requestInfo.resetTime
    };
  }
}

// Create rate limiter instance for filter endpoints
// 100 requests per minute as recommended in assessment
const filterRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many requests to filter endpoints. Please try again later.'
});

export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const url = new URL(request.url);

  // Only apply rate limiting to filter endpoints
  if (!url.pathname.startsWith('/api/filters/')) {
    return null; // Continue to next middleware
  }

  const result = await filterRateLimiter.isAllowed(request);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': filterRateLimiter['config'].maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', filterRateLimiter['config'].maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

  return response;
}

export { filterRateLimiter };