import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Retry helper for database queries
async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error: any) {
      if (error.code === 'P1001' || error.code === 'P1017') {
        // Database connection error - retry
        if (i === maxRetries - 1) {
          console.error(`Query failed after ${maxRetries} attempts:`, error.message);
          return null; // Return null instead of throwing
        }
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        // Other error - don't retry
        console.error('Query failed with non-retryable error:', error.message);
        return null;
      }
    }
  }
  return null;
}

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for command center
 */
export async function GET(request: NextRequest) {
  try {
    // Use retry logic for all queries - return 0 if query fails
    const [
      topicsCount,
      pendingTopicsCount,
      contentCount,
      draftContentCount,
      publishedContentCount,
      mediaCount,
      contentWithScores,
    ] = await Promise.all([
      queryWithRetry(() => prisma.topic.count()),
      queryWithRetry(() => prisma.topic.count({ where: { status: 'pending' } })),
      queryWithRetry(() => prisma.contentLibrary.count()),
      queryWithRetry(() => prisma.contentLibrary.count({ where: { status: 'draft' } })),
      queryWithRetry(() => prisma.contentLibrary.count({ where: { status: 'published' } })),
      queryWithRetry(() => prisma.mediaLibrary.count()),
      queryWithRetry(() =>
        prisma.contentLibrary.findMany({
          where: {
            OR: [
              { seoScore: { not: null } },
              // Note: aioScore doesn't exist in schema, removing for now
            ],
          },
          select: {
            seoScore: true,
          },
        })
      ),
    ]);

    // Calculate average SEO score - handle null/undefined from retry
    const seoScores = (contentWithScores || [])
      .map((c) => c.seoScore)
      .filter((score): score is number => score !== null && score !== undefined);
    const avgSeoScore = seoScores.length > 0
      ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length)
      : 0;

    // Count open SEO issues (placeholder - SEO issues table may not exist)
    const openSeoIssues = 0; // TODO: Implement when SEO issues table exists

    // Return partial data even if some queries failed
    return NextResponse.json({
      totalTopics: topicsCount || 0,
      pendingTopics: pendingTopicsCount || 0,
      totalContent: contentCount || 0,
      draftContent: draftContentCount || 0,
      publishedContent: publishedContentCount || 0,
      totalMedia: mediaCount || 0,
      avgSeoScore,
      avgAioScore: 0, // TODO: Implement when AIO scoring is added
      openSeoIssues,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return default stats on error (graceful degradation)
    return NextResponse.json({
      totalTopics: 0,
      pendingTopics: 0,
      totalContent: 0,
      draftContent: 0,
      publishedContent: 0,
      totalMedia: 0,
      avgSeoScore: 0,
      avgAioScore: 0,
      openSeoIssues: 0,
    }, { status: 200 }); // Return 200 to prevent UI errors
  }
}

