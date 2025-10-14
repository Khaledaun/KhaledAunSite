import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring
 * GET /api/health
 */
export async function GET() {
  const health = {
    ok: true,
    service: 'site',
    version: process.env.npm_package_version || '1.0.0',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  };
  
  return NextResponse.json(health);
}

