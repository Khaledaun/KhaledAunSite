import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100');
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes

// CORS configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://www.khaledaun.com',
  'https://khaledaun.com'
];

// Security headers configuration
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co wss://*.supabase.io",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
};

// Rate limiting function
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  
  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  const current = rateLimitStore.get(ip);
  
  if (!current) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (current.resetTime < now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  current.count++;
  return true;
}

// Admin authentication check using Supabase
async function checkAdminAuth(request: NextRequest, response: NextResponse): Promise<boolean> {
  try {
    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    // Check if user has admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!user) {
      return false;
    }
    
    // Allow ADMIN, EDITOR, REVIEWER, AUTHOR roles
    const allowedRoles = ['OWNER', 'ADMIN', 'EDITOR', 'REVIEWER', 'AUTHOR'];
    return allowedRoles.includes(user.role);
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// CORS function
function handleCORS(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const method = request.method;
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }
  
  // Handle actual requests
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse('CORS policy violation', { status: 403 });
  }
  
  return null;
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // TEMPORARY: Bypass all auth checks to debug
  // TODO: Re-enable after fixing Supabase auth-helpers  
  return NextResponse.next();
  
  // @ts-ignore - Unreachable code below, kept for reference when re-enabling auth
  // eslint-disable-next-line no-unreachable
  // Skip middleware for static files and API health checks
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/api/health' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/auth') || // Allow all auth routes (login, callback, etc.)
    pathname.startsWith('/api/auth') // Allow auth API endpoints
  ) {
    return NextResponse.next();
  }
  
  // Create response early for Supabase middleware
  const response = NextResponse.next();
  
  // Protect admin dashboard and API routes
  const isAdminRoute = pathname.startsWith('/api/admin') || pathname.match(/^\/((?!api|_next|static|favicon|auth).+)/);
  
  if (isAdminRoute) {
    const isAuthenticated = await checkAdminAuth(request, response);
    
    if (!isAuthenticated) {
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized', message: 'Admin access required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // For UI routes, redirect to Supabase auth
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Handle CORS
  const corsResponse = handleCORS(request);
  if (corsResponse) {
    return corsResponse;
  }
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!rateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_WINDOW_MS).toISOString()
          }
        }
      );
    }
  }
  
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CORS headers for allowed origins
  const origin = request.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Add rate limit headers for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const current = rateLimitStore.get(ip);
    
    if (current) {
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - current.count).toString());
      response.headers.set('X-RateLimit-Reset', new Date(current.resetTime).toISOString());
    }
  }
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication pages)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
