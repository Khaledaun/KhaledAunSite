import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  classifyImpact,
  categorizeUpdate,
  extractPlatform,
} from '@khaledaun/utils/algorithm-update-fetcher';
import { analyzeBatchUpdates } from '@khaledaun/utils/prompt-update-analyzer';

/**
 * GET /api/cron/algorithm-updates
 * Weekly cron job to fetch and analyze algorithm updates
 * Vercel Cron will call this endpoint automatically
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting weekly algorithm updates fetch...');

    const results = {
      fetched: 0,
      saved: 0,
      analyzed: 0,
      errors: [] as string[],
    };

    // Step 1: Fetch updates from various sources
    const updates: any[] = [];
    const daysBack = 7; // Last 7 days
    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Note: In production, implement actual web scraping/search here
    // For now, this is a placeholder structure

    try {
      // Example: Fetch SEO updates using web search
      const seoSearches = [
        'Google algorithm update since:7d site:developers.google.com',
        'Google core update since:7d site:searchenginejournal.com',
      ];

      // TODO: Implement actual web search using WebSearch tool
      // const seoResults = await fetchWithWebSearch(seoSearches);
      // updates.push(...seoResults);

      results.fetched = updates.length;
    } catch (error) {
      results.errors.push(`Fetch failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // Step 2: Save new updates to database
    for (const update of updates) {
      try {
        // Check for duplicates
        const existing = await prisma.algorithmUpdate.findFirst({
          where: { url: update.url },
        });

        if (!existing) {
          await prisma.algorithmUpdate.create({
            data: {
              source: update.source,
              title: update.title,
              description: update.description || '',
              url: update.url,
              publishedAt: new Date(update.publishedAt),
              category: update.category || ['general'],
              impact: update.impact || 'MEDIUM',
              platform: update.platform,
              analyzed: false,
              applied: false,
            },
          });
          results.saved++;
        }
      } catch (error) {
        results.errors.push(`Save failed for "${update.title}": ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    // Step 3: Auto-analyze new updates
    const unanalyzedUpdates = await prisma.algorithmUpdate.findMany({
      where: {
        analyzed: false,
        publishedAt: {
          gte: cutoffDate,
        },
      },
      orderBy: { impact: 'desc' },
      take: 10, // Analyze top 10 by impact
    });

    if (unanalyzedUpdates.length > 0) {
      try {
        console.log(`[Cron] Analyzing ${unanalyzedUpdates.length} updates...`);

        const batchAnalysis = await analyzeBatchUpdates(
          unanalyzedUpdates.map(u => ({
            source: u.source as 'SEO' | 'AIO' | 'LINKEDIN',
            title: u.title,
            description: u.description || '',
            url: u.url,
            category: u.category,
            platform: u.platform || undefined,
          }))
        );

        // Update all with analysis
        await Promise.all(
          unanalyzedUpdates.map(update =>
            prisma.algorithmUpdate.update({
              where: { id: update.id },
              data: {
                analyzed: true,
                insights: batchAnalysis,
                promptUpdates: JSON.stringify(batchAnalysis.priorityUpdates),
              },
            })
          )
        );

        results.analyzed = unanalyzedUpdates.length;

        // Send notification if critical/high impact updates found
        const criticalCount = unanalyzedUpdates.filter(u => u.impact === 'CRITICAL').length;
        const highCount = unanalyzedUpdates.filter(u => u.impact === 'HIGH').length;

        if (criticalCount > 0 || highCount > 0) {
          await sendNotification({
            type: 'algorithm-update',
            title: `${criticalCount + highCount} Important Algorithm Updates`,
            message: `${criticalCount} critical and ${highCount} high-impact algorithm updates require review.`,
            data: batchAnalysis,
          });
        }
      } catch (error) {
        results.errors.push(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    console.log('[Cron] Algorithm updates job completed:', results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Algorithm updates job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Send notification about important updates
 * This can be email, Slack, or in-app notification
 */
async function sendNotification(notification: {
  type: string;
  title: string;
  message: string;
  data: any;
}) {
  try {
    // Save to database for in-app notifications
    // TODO: Implement actual notification system
    console.log('[Notification]', notification.title);

    // Optional: Send email or Slack notification
    // await sendEmail({ ... });
    // await sendSlackMessage({ ... });

    return true;
  } catch (error) {
    console.error('[Notification] Failed to send:', error);
    return false;
  }
}
