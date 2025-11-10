import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis client (will be undefined if env vars not set, falling back to in-memory)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : undefined;

// In-memory fallback for development
class InMemoryStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  async get(key: string) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.resetAt) {
      this.store.delete(key);
      return null;
    }

    return item.count;
  }

  async set(key: string, count: number, ttl: number) {
    this.store.set(key, {
      count,
      resetAt: Date.now() + ttl * 1000,
    });
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

const memoryStore = new InMemoryStore();

// Cleanup memory store every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => memoryStore.cleanup(), 5 * 60 * 1000);
}

/**
 * Rate limit configurations for different endpoint types
 */
export const rateLimitConfigs = {
  // Public API endpoints (no auth required)
  public: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '15 m'), // 100 requests per 15 minutes
        analytics: true,
        prefix: 'ratelimit:public',
      })
    : null,

  // Admin API endpoints (requires auth)
  admin: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1000, '15 m'), // 1000 requests per 15 minutes
        analytics: true,
        prefix: 'ratelimit:admin',
      })
    : null,

  // AI generation endpoints (expensive operations)
  aiGeneration: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
        analytics: true,
        prefix: 'ratelimit:ai',
      })
    : null,

  // LinkedIn posting (API rate limits)
  linkedInPost: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 posts per hour
        analytics: true,
        prefix: 'ratelimit:linkedin',
      })
    : null,

  // Contact form (prevent spam)
  contactForm: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 submissions per hour
        analytics: true,
        prefix: 'ratelimit:contact',
      })
    : null,
};

/**
 * In-memory rate limiting fallback (for development without Redis)
 */
async function inMemoryRateLimit(
  identifier: string,
  limit: number,
  window: number // in seconds
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`;
  const current = await memoryStore.get(key);

  if (current === null) {
    await memoryStore.set(key, 1, window);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + window * 1000,
    };
  }

  if (current >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Date.now() + window * 1000,
    };
  }

  await memoryStore.set(key, current + 1, window);
  return {
    success: true,
    limit,
    remaining: limit - current - 1,
    reset: Date.now() + window * 1000,
  };
}

/**
 * Get identifier for rate limiting
 * Uses IP address for unauthenticated requests, user ID for authenticated
 */
export function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from headers (Vercel provides this)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] ?? realIp ?? 'anonymous';

  return `ip:${ip}`;
}

/**
 * Rate limit middleware
 * Usage:
 * ```typescript
 * const result = await rateLimit(request, 'public', userId);
 * if (!result.success) {
 *   return new NextResponse('Too Many Requests', { status: 429 });
 * }
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof rateLimitConfigs,
  userId?: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  headers: Record<string, string>;
}> {
  const identifier = getRateLimitIdentifier(request, userId);
  const ratelimiter = rateLimitConfigs[type];

  let result: { success: boolean; limit: number; remaining: number; reset: number };

  if (!ratelimiter) {
    // Fallback to in-memory for development
    const limits = {
      public: { limit: 100, window: 900 }, // 15 minutes
      admin: { limit: 1000, window: 900 },
      aiGeneration: { limit: 10, window: 3600 }, // 1 hour
      linkedInPost: { limit: 5, window: 3600 },
      contactForm: { limit: 3, window: 3600 },
    };

    const config = limits[type];
    result = await inMemoryRateLimit(`${type}:${identifier}`, config.limit, config.window);
  } else {
    // Use Upstash Redis
    const { success, limit, remaining, reset } = await ratelimiter.limit(identifier);
    result = { success, limit, remaining, reset };
  }

  // Prepare headers
  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };

  if (!result.success) {
    headers['Retry-After'] = Math.ceil((result.reset - Date.now()) / 1000).toString();
  }

  return {
    ...result,
    headers,
  };
}

/**
 * Create rate limit response
 */
export function rateLimitResponse(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return new NextResponse(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: keyof typeof rateLimitConfigs = 'public',
  getUserId?: (request: NextRequest) => Promise<string | undefined>
) {
  return async (request: NextRequest) => {
    try {
      // Get user ID if function provided
      const userId = getUserId ? await getUserId(request) : undefined;

      // Apply rate limit
      const result = await rateLimit(request, type, userId);

      // If rate limit exceeded, return 429
      if (!result.success) {
        return rateLimitResponse(result.reset);
      }

      // Call original handler
      const response = await handler(request);

      // Add rate limit headers to response
      Object.entries(result.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Rate limit error:', error);
      // On error, allow the request to proceed (fail open)
      return handler(request);
    }
  };
}

/**
 * Utility: Check if user is admin (for rate limit bypasses if needed)
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    // Get session from cookies or headers
    // This is a placeholder - implement based on your auth system
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    // Add your admin check logic here
    // For now, return false
    return false;
  } catch (error) {
    return false;
  }
}
