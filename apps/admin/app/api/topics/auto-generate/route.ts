/**
 * Automated Topic Generation Cron Job
 * GET /api/topics/auto-generate
 *
 * Called by Vercel Cron daily/weekly to automatically generate new topic ideas
 * Combines AI suggestions + RSS news scraping
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateIdeas } from '@khaledaun/utils/ai-content';
import {
  fetchAllLegalNews,
  filterByAIRelevance,
  type NewsArticle,
} from '@khaledaun/utils/rss-scraper';
import { checkForDuplicates, quickDuplicateCheck } from '@khaledaun/utils/duplicate-detection';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution for cron jobs

// Configuration for auto-generation
const AUTO_GEN_CONFIG = {
  // Practice areas to focus on
  practiceAreas: [
    'litigation',
    'arbitration',
    'business law',
    'cross-border transactions',
    'corporate governance',
    'compliance',
    'international trade',
  ],

  // Categories for AI idea generation
  ideaCategories: [
    'recent legal developments',
    'compliance best practices',
    'dispute resolution strategies',
    'cross-border business guidance',
  ],

  // Number of ideas to generate per category
  ideasPerCategory: 3,

  // Number of news articles to fetch and convert to topics
  maxNewsArticles: 10,
};

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request for auto-generate');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🤖 Starting automated topic generation...');

    const results = {
      aiTopics: 0,
      newsTopics: 0,
      skipped: 0,
      duplicates: 0,
      similarTopics: 0,
      errors: [] as string[],
    };

    // Get existing topics for duplicate checking
    const existingTopics = await prisma.topic.findMany({
      select: { id: true, title: true, description: true },
    });

    console.log(`Loaded ${existingTopics.length} existing topics for duplicate detection`);

    // PART 1: Generate AI-powered topic ideas
    console.log('💡 Generating AI topic suggestions...');

    for (const category of AUTO_GEN_CONFIG.ideaCategories) {
      try {
        const ideas = await generateIdeas(category, AUTO_GEN_CONFIG.ideasPerCategory);

        for (const idea of ideas) {
          try {
            const description = `AI-generated topic for ${category}`;

            // Quick check first (fast, no API calls)
            const quickDupe = quickDuplicateCheck(
              idea,
              existingTopics.map((t) => t.title)
            );

            if (quickDupe) {
              results.duplicates++;
              console.log(`Skipped duplicate (quick check): ${idea}`);
              continue;
            }

            // Semantic similarity check (more thorough but slower)
            const duplicateCheck = await checkForDuplicates(idea, description, existingTopics);

            if (duplicateCheck.isDuplicate) {
              results.duplicates++;
              console.log(
                `Skipped duplicate (${(duplicateCheck.maxSimilarity * 100).toFixed(1)}% similar): ${idea}`
              );
              continue;
            }

            if (duplicateCheck.isSimilar) {
              // Flag similar topics for manual review
              results.similarTopics++;
              console.log(
                `Flagging similar topic (${(duplicateCheck.maxSimilarity * 100).toFixed(1)}% similar): ${idea}`
              );

              await prisma.topic.create({
                data: {
                  title: idea,
                  description,
                  sourceType: 'ai_auto_generation',
                  keywords: [category],
                  priority: 5,
                  status: 'needs_review', // Flag for manual review
                  metadata: {
                    category,
                    generatedBy: 'auto_cron',
                    timestamp: new Date().toISOString(),
                    similarityFlag: true,
                    similarTo: duplicateCheck.matches.map((m) => ({
                      id: m.id,
                      title: m.title,
                      similarity: m.similarity,
                    })),
                  },
                },
              });
              results.aiTopics++;
              continue;
            }

            // No duplicates or similar topics, create it
            await prisma.topic.create({
              data: {
                title: idea,
                description,
                sourceType: 'ai_auto_generation',
                keywords: [category],
                priority: 5,
                status: 'pending',
                metadata: {
                  category,
                  generatedBy: 'auto_cron',
                  timestamp: new Date().toISOString(),
                },
              },
            });

            // Add to existing topics list for next iteration
            existingTopics.push({ id: 'temp', title: idea, description });

            results.aiTopics++;
          } catch (error) {
            results.errors.push(`Failed to create AI topic: ${idea}`);
          }
        }

        // Rate limiting between categories
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        results.errors.push(`Failed to generate ideas for ${category}: ${error}`);
      }
    }

    console.log(`✅ Created ${results.aiTopics} AI-generated topics`);

    // PART 2: Scrape legal news and create topics
    console.log('📰 Scraping legal news RSS feeds...');

    try {
      const articles = await fetchAllLegalNews(AUTO_GEN_CONFIG.maxNewsArticles * 2);

      if (articles.length > 0) {
        // Filter by AI relevance
        const relevantArticles = await filterByAIRelevance(
          articles,
          AUTO_GEN_CONFIG.practiceAreas
        );

        const limitedArticles = relevantArticles.slice(0, AUTO_GEN_CONFIG.maxNewsArticles);

        for (const article of limitedArticles) {
          try {
            // Check if topic already exists for this URL
            const existing = await prisma.topic.findFirst({
              where: { sourceUrl: article.url },
            });

            if (!existing) {
              await prisma.topic.create({
                data: {
                  title: article.title,
                  description: article.description,
                  sourceUrl: article.url,
                  sourceType: 'rss_auto_scrape',
                  keywords: article.categories || [],
                  priority: 7, // Higher priority for timely news
                  status: 'pending',
                  metadata: {
                    source: article.source,
                    author: article.author,
                    publishedAt: article.publishedAt,
                    scrapedAt: new Date().toISOString(),
                    generatedBy: 'auto_cron',
                  },
                },
              });
              results.newsTopics++;
            } else {
              results.skipped++;
            }
          } catch (error) {
            results.errors.push(`Failed to create news topic: ${article.title}`);
          }
        }

        console.log(`✅ Created ${results.newsTopics} news-based topics`);
      }
    } catch (error) {
      results.errors.push(`News scraping failed: ${error}`);
    }

    const duration = Date.now() - startTime;

    console.log('✅ Automated topic generation completed', {
      duration: `${duration}ms`,
      ...results,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      results,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('❌ Automated topic generation failed:', error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
