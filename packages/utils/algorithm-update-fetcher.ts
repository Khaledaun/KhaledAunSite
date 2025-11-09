/**
 * Algorithm Update Fetcher Service
 * Fetches latest algorithm updates from SEO, AIO, and LinkedIn sources
 * Runs weekly to keep content generation prompts up-to-date
 *
 * @module algorithm-update-fetcher
 * @version 1.0.0
 */

export interface AlgorithmUpdate {
  source: 'SEO' | 'AIO' | 'LINKEDIN';
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  category: string[];
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  platform?: string;
}

export interface FetchResult {
  updates: AlgorithmUpdate[];
  errors: string[];
}

/**
 * Sources for algorithm updates
 */
const SOURCES = {
  SEO: [
    {
      name: 'Google Search Central Blog',
      url: 'https://developers.google.com/search/blog',
      keywords: ['algorithm update', 'ranking', 'core update', 'helpful content'],
    },
    {
      name: 'Search Engine Journal',
      url: 'https://www.searchenginejournal.com/category/google/google-algorithm-updates/',
      keywords: ['google update', 'algorithm change', 'seo update'],
    },
    {
      name: 'Moz Blog',
      url: 'https://moz.com/blog/category/google-algorithm-updates',
      keywords: ['algorithm', 'ranking factor', 'google update'],
    },
  ],
  AIO: [
    {
      name: 'OpenAI Blog',
      url: 'https://openai.com/blog',
      keywords: ['chatgpt', 'search', 'web browsing', 'citations'],
    },
    {
      name: 'Perplexity Blog',
      url: 'https://blog.perplexity.ai',
      keywords: ['search', 'ranking', 'sources', 'citations'],
    },
    {
      name: 'Google AI Blog',
      url: 'https://blog.google/technology/ai/',
      keywords: ['search generative experience', 'sge', 'ai overviews'],
    },
  ],
  LINKEDIN: [
    {
      name: 'LinkedIn Engineering Blog',
      url: 'https://engineering.linkedin.com/blog',
      keywords: ['feed', 'algorithm', 'ranking', 'engagement'],
    },
    {
      name: 'LinkedIn Official Blog',
      url: 'https://www.linkedin.com/blog',
      keywords: ['algorithm', 'feed', 'content', 'visibility'],
    },
  ],
};

/**
 * Fetch algorithm updates from all sources
 */
export async function fetchAllUpdates(daysBack: number = 7): Promise<FetchResult> {
  const allUpdates: AlgorithmUpdate[] = [];
  const errors: string[] = [];

  // Fetch from SEO sources
  for (const source of SOURCES.SEO) {
    try {
      const updates = await fetchFromSource(source, 'SEO', daysBack);
      allUpdates.push(...updates);
    } catch (error) {
      errors.push(`Failed to fetch from ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch from AIO sources
  for (const source of SOURCES.AIO) {
    try {
      const updates = await fetchFromSource(source, 'AIO', daysBack);
      allUpdates.push(...updates);
    } catch (error) {
      errors.push(`Failed to fetch from ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch from LinkedIn sources
  for (const source of SOURCES.LINKEDIN) {
    try {
      const updates = await fetchFromSource(source, 'LINKEDIN', daysBack);
      allUpdates.push(...updates);
    } catch (error) {
      errors.push(`Failed to fetch from ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Deduplicate by URL
  const uniqueUpdates = deduplicateByUrl(allUpdates);

  // Sort by publishedAt (newest first)
  uniqueUpdates.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return {
    updates: uniqueUpdates,
    errors,
  };
}

/**
 * Fetch updates from a specific source using web search
 * In production, this would use the WebFetch/WebSearch tool or RSS feeds
 */
async function fetchFromSource(
  source: { name: string; url: string; keywords: string[] },
  type: 'SEO' | 'AIO' | 'LINKEDIN',
  daysBack: number
): Promise<AlgorithmUpdate[]> {
  // This is a placeholder for the actual implementation
  // In a real implementation, this would:
  // 1. Fetch the RSS feed or use web scraping
  // 2. Parse the content
  // 3. Filter by date (last 7 days)
  // 4. Extract relevant articles

  // For now, we'll return an empty array
  // The actual implementation will be done via API route using WebFetch
  return [];
}

/**
 * Classify update impact based on keywords and content
 */
export function classifyImpact(title: string, description: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const text = `${title} ${description}`.toLowerCase();

  // Critical impact keywords
  const criticalKeywords = [
    'core update',
    'major algorithm',
    'breaking change',
    'critical update',
    'penalty',
  ];

  // High impact keywords
  const highKeywords = [
    'algorithm update',
    'ranking factor',
    'significant change',
    'new feature',
    'major change',
  ];

  // Medium impact keywords
  const mediumKeywords = [
    'best practice',
    'recommendation',
    'improvement',
    'enhancement',
  ];

  if (criticalKeywords.some(keyword => text.includes(keyword))) {
    return 'CRITICAL';
  }

  if (highKeywords.some(keyword => text.includes(keyword))) {
    return 'HIGH';
  }

  if (mediumKeywords.some(keyword => text.includes(keyword))) {
    return 'MEDIUM';
  }

  return 'LOW';
}

/**
 * Categorize update based on content
 */
export function categorizeUpdate(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const categories: string[] = [];

  const categoryKeywords = {
    'ranking': ['ranking', 'position', 'serp', 'visibility'],
    'content-quality': ['content', 'quality', 'helpful', 'e-e-a-t', 'expertise'],
    'technical-seo': ['technical', 'crawling', 'indexing', 'sitemap', 'robots', 'structured data'],
    'user-experience': ['core web vitals', 'page speed', 'mobile', 'ux', 'user experience'],
    'ai-optimization': ['ai', 'chatgpt', 'perplexity', 'sge', 'citations', 'sources'],
    'social-media': ['linkedin', 'engagement', 'feed', 'social'],
    'local-seo': ['local', 'maps', 'location', 'geographic'],
    'link-building': ['backlinks', 'link', 'authority', 'domain'],
    'spam': ['spam', 'manipulation', 'black hat', 'penalty'],
  };

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      categories.push(category);
    }
  });

  return categories.length > 0 ? categories : ['general'];
}

/**
 * Extract platform from update content
 */
export function extractPlatform(source: string, title: string, description: string): string | undefined {
  const text = `${title} ${description}`.toLowerCase();

  if (source === 'SEO') {
    if (text.includes('google')) return 'google';
    if (text.includes('bing')) return 'bing';
  }

  if (source === 'AIO') {
    if (text.includes('chatgpt') || text.includes('openai')) return 'chatgpt';
    if (text.includes('perplexity')) return 'perplexity';
    if (text.includes('sge') || text.includes('generative experience')) return 'google-sge';
    if (text.includes('claude')) return 'claude';
  }

  if (source === 'LINKEDIN') {
    return 'linkedin';
  }

  return undefined;
}

/**
 * Deduplicate updates by URL
 */
function deduplicateByUrl(updates: AlgorithmUpdate[]): AlgorithmUpdate[] {
  const seen = new Set<string>();
  return updates.filter(update => {
    if (seen.has(update.url)) {
      return false;
    }
    seen.add(update.url);
    return true;
  });
}

/**
 * Search for updates using specific query
 */
export async function searchUpdates(query: string, source: 'SEO' | 'AIO' | 'LINKEDIN'): Promise<AlgorithmUpdate[]> {
  // This will be implemented in the API route using WebSearch
  return [];
}
