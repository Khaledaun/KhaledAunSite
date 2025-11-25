import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import {
  fetchAllLegalNews,
  filterByRelevance,
  filterByAIRelevance,
  type NewsArticle,
} from '@khaledaun/utils/rss-scraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for RSS fetching

/**
 * POST /api/topics/scrape-news
 * Scrape legal news RSS feeds and optionally create topics
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const {
      practiceAreas = ['litigation', 'arbitration', 'business law', 'cross-border'],
      keywords = [],
      useAIFiltering = true,
      saveAsTopics = false,
      limit = 20,
    } = body;

    console.log('🔍 Scraping legal news RSS feeds...');

    // Fetch articles from all sources
    const allArticles = await fetchAllLegalNews(limit * 2); // Fetch more than needed

    console.log(`📰 Found ${allArticles.length} articles from RSS feeds`);

    // Filter by relevance
    let relevantArticles: NewsArticle[];

    if (useAIFiltering && allArticles.length > 0) {
      console.log('🤖 Using AI to filter relevant articles...');
      relevantArticles = await filterByAIRelevance(allArticles, practiceAreas);
    } else if (keywords.length > 0) {
      console.log('🔎 Filtering by keywords...');
      relevantArticles = filterByRelevance(allArticles, keywords);
    } else {
      relevantArticles = allArticles;
    }

    // Limit results
    relevantArticles = relevantArticles.slice(0, limit);

    console.log(`✅ ${relevantArticles.length} relevant articles found`);

    // Optionally create topics from articles
    let createdTopics = [];
    if (saveAsTopics && relevantArticles.length > 0) {
      const { prisma } = await import('@/lib/prisma');

      for (const article of relevantArticles) {
        try {
          // Check if topic already exists for this URL
          const existing = await prisma.topic.findFirst({
            where: { sourceUrl: article.url },
          });

          if (!existing) {
            const topic = await prisma.topic.create({
              data: {
                title: article.title,
                description: article.description,
                sourceUrl: article.url,
                sourceType: 'rss_scrape',
                keywords: article.categories || keywords,
                priority: 6, // Medium-high priority for news-based topics
                status: 'pending',
                metadata: {
                  source: article.source,
                  author: article.author,
                  publishedAt: article.publishedAt,
                  scrapedAt: new Date().toISOString(),
                },
              },
            });
            createdTopics.push(topic);
          }
        } catch (error) {
          console.error(`Failed to create topic for article: ${article.title}`, error);
        }
      }

      console.log(`📝 Created ${createdTopics.length} new topics`);
    }

    return NextResponse.json({
      success: true,
      articles: relevantArticles.map((a) => ({
        title: a.title,
        description: a.description.substring(0, 200),
        url: a.url,
        source: a.source,
        publishedAt: a.publishedAt,
      })),
      created: createdTopics.length,
      topics: createdTopics,
    });
  } catch (error) {
    console.error('Error scraping news:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to scrape news',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
