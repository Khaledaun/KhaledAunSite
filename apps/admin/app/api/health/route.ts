import { NextRequest, NextResponse } from 'next/server';

// Health check endpoint for monitoring and load balancers
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Basic health check
    const health: Record<string, any> = {
      ok: true,
      service: 'admin',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local'
    };
    
    // Check database configuration (don't actually connect in CI/test environments)
    let dbStatus = 'unknown';
    
    if (process.env.DATABASE_URL) {
      // In production, you could add actual DB connectivity check
      // For now, just verify the env var exists
      dbStatus = 'configured';
    } else {
      dbStatus = 'not_configured';
    }
    
    const services = {
      database: {
        status: dbStatus
      }
    };
    
    const responseTime = Date.now() - startTime;
    
    const healthResponse = {
      ...health,
      services,
      responseTime
    };
    
    return NextResponse.json(healthResponse, { 
      status: 200,
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
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    }, { 
      status: 500,
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
