/**
 * Phase 7: URL Content Extraction
 * Extract article content from web pages using Cheerio
 */

import { load } from 'cheerio';

export interface ExtractedContent {
  title: string;
  author?: string;
  publishedDate?: Date;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  siteName?: string;
  language?: string;
  wordCount: number;
}

/**
 * Extract content from a URL
 */
export async function extractFromURL(url: string): Promise<ExtractedContent> {
  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentExtractor/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .comments').remove();

    // Extract metadata
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('h1').first().text() ||
      $('title').text();

    const author =
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      $('.author').first().text() ||
      $('[rel="author"]').first().text();

    const publishedDateStr =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="publish-date"]').attr('content') ||
      $('time[datetime]').attr('datetime');

    const publishedDate = publishedDateStr ? new Date(publishedDateStr) : undefined;

    const excerpt =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content');

    const imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('article img').first().attr('src');

    const siteName =
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[name="application-name"]').attr('content');

    const language =
      $('html').attr('lang') ||
      $('meta[property="og:locale"]').attr('content');

    // Extract main content
    let content = '';

    // Try common article selectors
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.content',
      'main',
    ];

    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length > 0 && element.text().trim().length > 100) {
        content = element.html() || '';
        break;
      }
    }

    // Fallback: get all paragraphs
    if (!content || content.length < 100) {
      const paragraphs = $('p');
      content = paragraphs
        .map((i, el) => $(el).html())
        .get()
        .join('\n\n');
    }

    // Clean up content
    content = content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<!--.*?-->/g, '')
      .trim();

    // Calculate word count
    const textContent = $('<div>').html(content).text();
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

    return {
      title: title.trim(),
      author: author?.trim(),
      publishedDate,
      content,
      excerpt: excerpt?.trim(),
      imageUrl,
      siteName: siteName?.trim(),
      language: language?.split('-')[0], // e.g., "en-US" -> "en"
      wordCount,
    };

  } catch (error) {
    console.error('URL extraction error:', error);
    throw new Error(`Failed to extract content from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate if a URL is accessible and likely contains article content
 */
export async function validateURL(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentExtractor/1.0)',
      },
    });

    // Check if it's HTML content
    const contentType = response.headers.get('content-type');
    return response.ok && contentType?.includes('text/html') || false;

  } catch (error) {
    return false;
  }
}

export default {
  extractFromURL,
  validateURL,
};

