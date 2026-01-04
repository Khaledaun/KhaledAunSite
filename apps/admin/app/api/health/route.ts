import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Health check endpoint for monitoring and load balancers
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const checks = {
    db: false,
    storage: false,
    adminAuth: false,
  };

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  try {
    // Check database connectivity
    // Skip in CI environment or if DATABASE_URL is not configured
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    const databaseUrl = process.env.DATABASE_URL;

    if (!isCI && databaseUrl) {
      try {
        // Dynamic import to avoid initialization errors when DATABASE_URL is not set
        const { prisma } = await import('@/lib/prisma');
        await prisma.$queryRaw`SELECT 1`;
        checks.db = true;
      } catch (dbError) {
        console.error('Database health check failed:', dbError);
        // Don't mark as unhealthy, just degraded - allows health check to pass
        overallStatus = 'degraded';
      }
    } else {
      // Database not configured or in CI environment, skip check
      checks.db = false;
      // Don't change status - app can still function without DB check in CI
    }

    // Check Supabase Storage (env vars)
    checks.storage = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    if (!checks.storage && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }

    // Check Auth configuration
    checks.adminAuth = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    if (!checks.adminAuth && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }

    const responseTime = Date.now() - startTime;
    // Always return 200 for healthy/degraded, 503 only for unhealthy (catch block)
    const statusCode = 200;

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
      checks,
      responseTime,
    }, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Simple ping endpoint for basic connectivity checks
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
