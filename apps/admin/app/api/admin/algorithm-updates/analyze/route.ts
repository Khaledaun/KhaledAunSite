import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';
import {
  analyzeUpdate,
  analyzeBatchUpdates,
} from '@khaledaun/utils/prompt-update-analyzer';

/**
 * POST /api/admin/algorithm-updates/analyze
 * Analyze algorithm updates using LLM
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { updateIds, batchMode = false } = await request.json();

    if (!updateIds || !Array.isArray(updateIds) || updateIds.length === 0) {
      return NextResponse.json(
        { error: 'updateIds array is required' },
        { status: 400 }
      );
    }

    // Fetch updates from database
    const updates = await prisma.algorithmUpdate.findMany({
      where: {
        id: { in: updateIds },
        analyzed: false, // Only analyze unanalyzed updates
      },
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No unanalyzed updates found with provided IDs' },
        { status: 404 }
      );
    }

    let result;

    if (batchMode && updates.length > 1) {
      // Batch analysis for multiple updates
      const batchAnalysis = await analyzeBatchUpdates(
        updates.map(u => ({
          source: u.source as 'SEO' | 'AIO' | 'LINKEDIN',
          title: u.title,
          description: u.description || '',
          url: u.url,
          category: u.category,
          platform: u.platform || undefined,
        }))
      );

      // Update all updates with consolidated insights
      await Promise.all(
        updates.map(update =>
          prisma.algorithmUpdate.update({
            where: { id: update.id },
            data: {
              analyzed: true,
              insights: {
                ...batchAnalysis,
                individualSummary: `Part of batch analysis of ${updates.length} updates`,
              } as any,
              promptUpdates: JSON.stringify(batchAnalysis.priorityUpdates),
            },
          })
        )
      );

      result = batchAnalysis;
    } else {
      // Individual analysis
      const analyses = await Promise.all(
        updates.map(async update => {
          const analysis = await analyzeUpdate({
            source: update.source as 'SEO' | 'AIO' | 'LINKEDIN',
            title: update.title,
            description: update.description || '',
            url: update.url,
            category: update.category,
            platform: update.platform || undefined,
          });

          // Update database with analysis
          await prisma.algorithmUpdate.update({
            where: { id: update.id },
            data: {
              analyzed: true,
              insights: analysis.insights as any,
              promptUpdates: JSON.stringify(analysis.promptUpdates),
            },
          });

          return {
            updateId: update.id,
            analysis,
          };
        })
      );

      result = { analyses };
    }

    return NextResponse.json({
      success: true,
      analyzedCount: updates.length,
      result,
    });
  } catch (error) {
    console.error('Error analyzing updates:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to analyze updates',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/algorithm-updates/analyze/unanalyzed
 * Get count of unanalyzed updates
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');

    const where: any = { analyzed: false };
    if (source) where.source = source;

    const count = await prisma.algorithmUpdate.count({ where });

    const updates = await prisma.algorithmUpdate.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        source: true,
        title: true,
        publishedAt: true,
        impact: true,
        category: true,
      },
    });

    return NextResponse.json({
      count,
      updates,
    });
  } catch (error) {
    console.error('Error fetching unanalyzed updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unanalyzed updates' },
      { status: 500 }
    );
  }
}
