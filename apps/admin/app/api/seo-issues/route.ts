import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/seo-issues
 * Get SEO issues for content
 * 
 * Query params:
 * - resolved: boolean (default: false)
 * - limit: number (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // For now, return empty array since SEO issues table doesn't exist yet
    // This is a placeholder that prevents 404 errors
    // TODO: Implement when SEO issues table is created
    
    return NextResponse.json({
      issues: [],
      total: 0,
      resolved,
    });
  } catch (error) {
    console.error('Error fetching SEO issues:', error);
    
    // Return empty array on error (graceful degradation)
    return NextResponse.json({
      issues: [],
      total: 0,
    }, { status: 200 });
  }
}




