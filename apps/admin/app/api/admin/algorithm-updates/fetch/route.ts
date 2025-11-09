import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';
import {
  classifyImpact,
  categorizeUpdate,
  extractPlatform,
} from '@khaledaun/utils/algorithm-update-fetcher';

/**
 * POST /api/admin/algorithm-updates/fetch
 * Fetch latest algorithm updates from various sources
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { daysBack = 7 } = await request.json();

    const updates: any[] = [];
    const errors: string[] = [];
    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // 1. Fetch SEO updates
    try {
      const seoUpdates = await fetchSEOUpdates(cutoffDate);
      updates.push(...seoUpdates);
    } catch (error) {
      errors.push(`SEO fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 2. Fetch AIO updates
    try {
      const aioUpdates = await fetchAIOUpdates(cutoffDate);
      updates.push(...aioUpdates);
    } catch (error) {
      errors.push(`AIO fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3. Fetch LinkedIn updates
    try {
      const linkedinUpdates = await fetchLinkedInUpdates(cutoffDate);
      updates.push(...linkedinUpdates);
    } catch (error) {
      errors.push(`LinkedIn fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Save new updates to database
    let savedCount = 0;
    let skippedCount = 0;

    for (const update of updates) {
      // Check if already exists
      const existing = await prisma.algorithmUpdate.findFirst({
        where: { url: update.url },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Save new update
      await prisma.algorithmUpdate.create({
        data: update,
      });
      savedCount++;
    }

    return NextResponse.json({
      success: true,
      stats: {
        fetched: updates.length,
        saved: savedCount,
        skipped: skippedCount,
        errors: errors.length,
      },
      errors,
    });
  } catch (error) {
    console.error('Error fetching algorithm updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch algorithm updates' },
      { status: 500 }
    );
  }
}

/**
 * Fetch SEO updates from Google Search Central and other sources
 */
async function fetchSEOUpdates(since: Date) {
  const updates: any[] = [];

  // Example: Fetch from Google Search Central Blog using web search
  // In production, you'd use the WebSearch or WebFetch tool here
  // For now, we'll use a simplified approach

  const queries = [
    'Google algorithm update site:developers.google.com/search/blog',
    'Google core update 2024 site:searchenginejournal.com',
    'Google helpful content update site:moz.com',
  ];

  // Note: In production, this would use the actual WebSearch tool
  // For now, we return a placeholder structure

  // Simulated example (replace with actual WebSearch implementation):
  // const searchResults = await webSearch(query);
  // Parse results and extract updates

  return updates;
}

/**
 * Fetch AIO (AI Optimization) updates from ChatGPT, Perplexity, Google SGE
 */
async function fetchAIOUpdates(since: Date) {
  const updates: any[] = [];

  const queries = [
    'ChatGPT search update site:openai.com/blog',
    'Perplexity algorithm site:blog.perplexity.ai',
    'Google SGE update site:blog.google/technology/ai',
  ];

  // Note: In production, this would use the actual WebSearch tool

  return updates;
}

/**
 * Fetch LinkedIn algorithm updates
 */
async function fetchLinkedInUpdates(since: Date) {
  const updates: any[] = [];

  const queries = [
    'LinkedIn feed algorithm site:engineering.linkedin.com',
    'LinkedIn content ranking site:linkedin.com/blog',
  ];

  // Note: In production, this would use the actual WebSearch tool

  return updates;
}

/**
 * Parse search result into update object
 */
function parseSearchResult(result: any, source: 'SEO' | 'AIO' | 'LINKEDIN'): any {
  const { title, snippet, url, publishedDate } = result;

  const description = snippet || '';
  const impact = classifyImpact(title, description);
  const category = categorizeUpdate(title, description);
  const platform = extractPlatform(source, title, description);

  return {
    source,
    title,
    description,
    url,
    publishedAt: new Date(publishedDate),
    category,
    impact,
    platform,
    analyzed: false,
    applied: false,
  };
}
