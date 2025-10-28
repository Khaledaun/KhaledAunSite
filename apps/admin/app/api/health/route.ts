import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.db = true;
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      overallStatus = 'unhealthy';
    }

    // Check Supabase Storage (env vars)
    checks.storage = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    if (!checks.storage) {
      overallStatus = overallStatus === 'unhealthy' ? 'unhealthy' : 'degraded';
    }

    // Check Auth configuration
    checks.adminAuth = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    if (!checks.adminAuth) {
      overallStatus = overallStatus === 'unhealthy' ? 'unhealthy' : 'degraded';
    }
    
    const responseTime = Date.now() - startTime;
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
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
