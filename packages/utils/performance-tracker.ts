/**
 * Content Performance Tracker
 * Tracks and analyzes content performance to learn from top-performing articles
 */

import { getFeatureConfig } from './automation-config';

export interface ContentPerformance {
  topicId: string;
  articleId: string;
  title: string;
  publishedAt: Date;
  metrics: {
    // Engagement metrics
    views?: number;
    uniqueVisitors?: number;
    avgTimeOnPage?: number; // seconds
    bounceRate?: number; // percentage

    // SEO metrics
    organicTraffic?: number;
    searchRankings?: Map<string, number>; // keyword -> position
    backlinks?: number;

    // Social metrics
    linkedinImpressions?: number;
    linkedinEngagement?: number;
    linkedinClicks?: number;
    shares?: number;

    // Conversion metrics
    leadGenerated?: boolean;
    consultationRequests?: number;
    newsletterSignups?: number;
  };
  performanceScore: number; // 0-100 composite score
  category: string;
  keywords: string[];
  lastUpdated: Date;
}

export interface PerformanceInsights {
  topPerformers: ContentPerformance[];
  underPerformers: ContentPerformance[];
  recommendations: {
    topicTypes: string[]; // Types of topics that perform well
    optimalLength: { min: number; max: number }; // Word count range
    bestKeywords: string[]; // Keywords that drive traffic
    bestPublishTimes: string[]; // Optimal publishing times
    contentGaps: string[]; // Topics to cover more
  };
  trends: {
    avgPerformanceScore: number;
    topCategories: string[];
    growthRate: number; // Month-over-month growth
  };
}

/**
 * Calculate composite performance score
 */
export function calculatePerformanceScore(metrics: ContentPerformance['metrics']): number {
  const weights = {
    views: 0.25,
    engagement: 0.20,
    seo: 0.25,
    social: 0.15,
    conversion: 0.15,
  };

  let score = 0;

  // Views score (normalize to 0-100, assuming 1000 views = 100)
  if (metrics.views) {
    score += Math.min((metrics.views / 1000) * 100, 100) * weights.views;
  }

  // Engagement score (time on page, bounce rate)
  if (metrics.avgTimeOnPage && metrics.bounceRate) {
    const timeScore = Math.min((metrics.avgTimeOnPage / 300) * 100, 100); // 5 min = 100
    const bounceScore = 100 - metrics.bounceRate;
    score += ((timeScore + bounceScore) / 2) * weights.engagement;
  }

  // SEO score (organic traffic, rankings)
  if (metrics.organicTraffic) {
    const organicScore = Math.min((metrics.organicTraffic / 500) * 100, 100);
    score += organicScore * weights.seo;
  }

  // Social score
  if (metrics.linkedinImpressions) {
    const socialScore = Math.min((metrics.linkedinImpressions / 5000) * 100, 100);
    score += socialScore * weights.social;
  }

  // Conversion score
  let conversionScore = 0;
  if (metrics.leadGenerated) conversionScore += 50;
  if (metrics.consultationRequests) conversionScore += metrics.consultationRequests * 25;
  score += Math.min(conversionScore, 100) * weights.conversion;

  return Math.round(score);
}

/**
 * Track content performance
 * This would integrate with analytics APIs (Google Analytics, LinkedIn, etc.)
 */
export async function trackContentPerformance(
  topicId: string,
  articleUrls: { en?: string; ar?: string }
): Promise<void> {
  const config = await getFeatureConfig('performanceTracking');

  if (!config.enabled) {
    return;
  }

  try {
    console.log(`Tracking performance for topic: ${topicId}`);

    // In production, this would:
    // 1. Fetch Google Analytics data for article URLs
    // 2. Fetch LinkedIn post performance
    // 3. Fetch search rankings from Google Search Console
    // 4. Store metrics in database

    // Placeholder for now
    console.log('Performance tracking queued for:', articleUrls);
  } catch (error) {
    console.error('Failed to track performance:', error);
  }
}

/**
 * Analyze top performers and generate insights
 */
export async function generatePerformanceInsights(
  allContent: ContentPerformance[]
): Promise<PerformanceInsights> {
  // Sort by performance score
  const sorted = [...allContent].sort((a, b) => b.performanceScore - a.performanceScore);

  const topPerformers = sorted.slice(0, 10);
  const underPerformers = sorted.slice(-10);

  // Analyze top performers
  const categoryCount = new Map<string, number>();
  const keywordCount = new Map<string, number>();
  const avgWordCounts: number[] = [];

  for (const content of topPerformers) {
    // Count categories
    categoryCount.set(content.category, (categoryCount.get(content.category) || 0) + 1);

    // Count keywords
    for (const keyword of content.keywords) {
      keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
    }
  }

  // Get top categories
  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category);

  // Get best keywords
  const bestKeywords = Array.from(keywordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword]) => keyword);

  // Calculate average performance
  const avgPerformanceScore =
    allContent.reduce((sum, c) => sum + c.performanceScore, 0) / allContent.length;

  // Identify content gaps (categories with few articles but high performance)
  const contentGaps = identifyContentGaps(allContent, categoryCount);

  // Recommendations based on top performers
  const recommendations = {
    topicTypes: topCategories,
    optimalLength: calculateOptimalLength(topPerformers),
    bestKeywords,
    bestPublishTimes: [], // Would analyze publish timestamps
    contentGaps,
  };

  const trends = {
    avgPerformanceScore: Math.round(avgPerformanceScore),
    topCategories,
    growthRate: 0, // Would calculate from historical data
  };

  return {
    topPerformers,
    underPerformers,
    recommendations,
    trends,
  };
}

/**
 * Identify content gaps (high-performing categories with low content volume)
 */
function identifyContentGaps(
  allContent: ContentPerformance[],
  categoryCount: Map<string, number>
): string[] {
  const categoryPerformance = new Map<string, { count: number; avgScore: number }>();

  // Calculate average score per category
  for (const content of allContent) {
    const existing = categoryPerformance.get(content.category) || { count: 0, avgScore: 0 };
    categoryPerformance.set(content.category, {
      count: existing.count + 1,
      avgScore:
        (existing.avgScore * existing.count + content.performanceScore) /
        (existing.count + 1),
    });
  }

  // Find categories with high performance but low volume
  const gaps: string[] = [];

  for (const [category, stats] of categoryPerformance.entries()) {
    // Gap: avg score > 70 but count < 5
    if (stats.avgScore > 70 && stats.count < 5) {
      gaps.push(category);
    }
  }

  return gaps;
}

/**
 * Calculate optimal content length based on top performers
 */
function calculateOptimalLength(topPerformers: ContentPerformance[]): { min: number; max: number } {
  // Placeholder - would analyze actual word counts
  return {
    min: 2000,
    max: 4000,
  };
}

/**
 * Get recommendations for new topic
 */
export async function getTopicRecommendations(
  currentTopics: ContentPerformance[]
): Promise<{
  suggestedCategories: string[];
  suggestedKeywords: string[];
  reasoning: string;
}> {
  const insights = await generatePerformanceInsights(currentTopics);

  return {
    suggestedCategories: insights.recommendations.contentGaps.slice(0, 3),
    suggestedKeywords: insights.recommendations.bestKeywords.slice(0, 5),
    reasoning: `Based on analysis of ${currentTopics.length} articles, focusing on ${insights.recommendations.contentGaps.join(', ')} and targeting keywords like ${insights.recommendations.bestKeywords.slice(0, 3).join(', ')} will likely drive better performance.`,
  };
}

/**
 * Schedule performance tracking (called by cron)
 */
export async function scheduledPerformanceTracking(): Promise<void> {
  const config = await getFeatureConfig('performanceTracking');

  if (!config.enabled) {
    console.log('Performance tracking is disabled');
    return;
  }

  console.log('🔍 Starting scheduled performance tracking...');

  try {
    // In production:
    // 1. Fetch all published articles from last 30 days
    // 2. Update their performance metrics
    // 3. Generate insights
    // 4. Store in database
    // 5. Send weekly digest email with insights

    console.log('✅ Performance tracking complete');
  } catch (error) {
    console.error('❌ Performance tracking failed:', error);
  }
}
