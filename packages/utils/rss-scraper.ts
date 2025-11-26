/**
 * RSS Feed Scraper for Legal News Sources
 * Fetches and parses RSS feeds from legal news websites
 */

import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['description', 'content', 'contentSnippet', 'pubDate', 'creator'],
  },
});

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  source: string;
  categories?: string[];
  author?: string;
}

/**
 * Legal news RSS feeds - customize these for your practice areas
 */
export const LEGAL_NEWS_FEEDS = {
  // General Legal News
  lawcom: 'https://www.law.com/feed/',
  americanlawyer: 'https://www.law.com/americanlawyer/feed/',
  natlawjournal: 'https://www.law.com/nationallawjournal/feed/',

  // International/Business Law
  jdsupra: 'https://www.jdsupra.com/rss/topics/all/',
  lexology: 'https://www.lexology.com/rss',

  // Alternative feeds (may require API keys)
  // Add your preferred legal news sources here
};

/**
 * Fetch articles from a single RSS feed
 */
export async function fetchFeed(feedUrl: string, sourceName: string): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(feedUrl);

    return (feed.items || []).map((item) => ({
      title: item.title || '',
      description: item.contentSnippet || item.description || '',
      url: item.link || '',
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: sourceName,
      categories: item.categories || [],
      author: item.creator || item.author,
    }));
  } catch (error) {
    console.error(`Error fetching feed ${sourceName}:`, error);
    return [];
  }
}

/**
 * Fetch articles from all configured legal news sources
 */
export async function fetchAllLegalNews(limit?: number): Promise<NewsArticle[]> {
  const feedPromises = Object.entries(LEGAL_NEWS_FEEDS).map(([name, url]) =>
    fetchFeed(url, name)
  );

  const results = await Promise.allSettled(feedPromises);

  const allArticles = results
    .filter((result): result is PromiseFulfilledResult<NewsArticle[]> =>
      result.status === 'fulfilled'
    )
    .flatMap((result) => result.value);

  // Sort by publish date (newest first)
  const sorted = allArticles.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Filter articles by relevance to specific keywords/topics
 */
export function filterByRelevance(
  articles: NewsArticle[],
  keywords: string[]
): NewsArticle[] {
  if (keywords.length === 0) return articles;

  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  return articles.filter((article) => {
    const searchText = `${article.title} ${article.description}`.toLowerCase();
    return lowerKeywords.some((keyword) => searchText.includes(keyword));
  });
}

/**
 * Use AI to determine article relevance to practice areas
 */
export async function filterByAIRelevance(
  articles: NewsArticle[],
  practiceAreas: string[]
): Promise<NewsArticle[]> {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

  try {

    const relevantArticles: NewsArticle[] = [];

    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);

      const prompt = `You are a legal content strategist. Review these articles and determine which ones are relevant to these practice areas: ${practiceAreas.join(', ')}.

Articles:
${batch.map((a, idx) => `${idx + 1}. ${a.title}\n${a.description.substring(0, 200)}...`).join('\n\n')}

Return ONLY a JSON array of relevant article indices (1-based). For example: [1, 3, 5]
Only include articles that are directly relevant to the specified practice areas.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 100,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{"relevant":[]}');
      const relevantIndices = result.relevant || [];

      relevantIndices.forEach((idx: number) => {
        if (idx >= 1 && idx <= batch.length) {
          relevantArticles.push(batch[idx - 1]);
        }
      });

      // Rate limiting delay
      if (i + batchSize < articles.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return relevantArticles;
  } catch (error) {
    console.error('Error filtering by AI relevance:', error);
    // Fallback to keyword filtering
    return filterByRelevance(articles, practiceAreas);
  }
}

export default {
  fetchFeed,
  fetchAllLegalNews,
  filterByRelevance,
  filterByAIRelevance,
};
