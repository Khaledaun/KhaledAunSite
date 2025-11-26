/**
 * AI Image Selection
 * Automatically selects relevant images from media library for articles
 */

import OpenAI from 'openai';
import { getFeatureConfig } from './automation-config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MediaAsset {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  tags: string[];
  filename: string;
}

export interface ImageRelevanceScore {
  mediaId: string;
  url: string;
  relevanceScore: number; // 0-100
  reasoning: string;
  suggestedPlacement?: string; // 'header', 'inline', 'footer'
}

/**
 * Analyze image relevance to topic using GPT-4 Vision
 */
async function analyzeImageRelevance(
  imageUrl: string,
  topicTitle: string,
  topicDescription: string,
  keywords: string[]
): Promise<{ score: number; reasoning: string; placement: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert content curator. Analyze this image's relevance to the following article:

Title: ${topicTitle}
Description: ${topicDescription}
Keywords: ${keywords.join(', ')}

Rate the image's relevance on a scale of 0-100, where:
- 90-100: Perfect match, directly illustrates the topic
- 70-89: Highly relevant, supports the topic well
- 50-69: Somewhat relevant, provides context
- 30-49: Loosely relevant, generic business/legal imagery
- 0-29: Not relevant

Also suggest placement: "header" (hero image), "inline" (within content), or "footer" (supplementary).

Respond in JSON format:
{
  "score": 85,
  "reasoning": "Brief explanation of why this score",
  "placement": "header"
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'low', // Lower cost
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Parse JSON response
    const result = JSON.parse(content);

    return {
      score: result.score || 0,
      reasoning: result.reasoning || 'No reasoning provided',
      placement: result.placement || 'inline',
    };
  } catch (error) {
    console.error('Failed to analyze image relevance:', error);

    // Fallback to keyword matching
    return fallbackKeywordMatching(imageUrl, keywords);
  }
}

/**
 * Fallback: Simple keyword matching if AI fails
 */
function fallbackKeywordMatching(
  imageUrl: string,
  keywords: string[]
): { score: number; reasoning: string; placement: string } {
  const filename = imageUrl.toLowerCase();

  let matchCount = 0;
  const matches: string[] = [];

  for (const keyword of keywords) {
    if (filename.includes(keyword.toLowerCase())) {
      matchCount++;
      matches.push(keyword);
    }
  }

  const score = Math.min(matchCount * 20, 60); // Max 60 for fallback

  return {
    score,
    reasoning: matches.length
      ? `Filename matches keywords: ${matches.join(', ')}`
      : 'No keyword matches found',
    placement: 'inline',
  };
}

/**
 * Select relevant images for an article
 */
export async function selectRelevantImages(
  topicTitle: string,
  topicDescription: string,
  keywords: string[],
  availableImages: MediaAsset[]
): Promise<ImageRelevanceScore[]> {
  const config = await getFeatureConfig('aiImageSelection');

  if (!config.enabled) {
    console.log('AI Image Selection is disabled');
    return [];
  }

  if (availableImages.length === 0) {
    console.log('No images available for selection');
    return [];
  }

  console.log(
    `Analyzing ${availableImages.length} images for topic: ${topicTitle}`
  );

  try {
    // Analyze each image (in batches to avoid rate limits)
    const batchSize = 5;
    const results: ImageRelevanceScore[] = [];

    for (let i = 0; i < availableImages.length; i += batchSize) {
      const batch = availableImages.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (image) => {
          // First try text-based relevance (fast)
          const textRelevance = calculateTextRelevance(image, keywords);

          // If text relevance is very low, skip AI analysis (cost optimization)
          if (textRelevance < 20) {
            return {
              mediaId: image.id,
              url: image.url,
              relevanceScore: textRelevance,
              reasoning: 'Low text relevance, skipped AI analysis',
              suggestedPlacement: 'inline' as const,
            };
          }

          // Use AI for promising candidates
          const analysis = await analyzeImageRelevance(
            image.url,
            topicTitle,
            topicDescription,
            keywords
          );

          return {
            mediaId: image.id,
            url: image.url,
            relevanceScore: analysis.score,
            reasoning: analysis.reasoning,
            suggestedPlacement: analysis.placement as 'header' | 'inline' | 'footer',
          };
        })
      );

      results.push(...batchResults);

      // Rate limiting delay between batches
      if (i + batchSize < availableImages.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Filter by minimum score and sort by relevance
    const filtered = results
      .filter((r) => r.relevanceScore >= config.minRelevanceScore)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, config.maxImages);

    console.log(
      `Selected ${filtered.length} images with relevance ≥ ${config.minRelevanceScore}`
    );

    return filtered;
  } catch (error) {
    console.error('Error selecting images:', error);
    return [];
  }
}

/**
 * Calculate text-based relevance score (fast pre-filter)
 */
function calculateTextRelevance(image: MediaAsset, keywords: string[]): number {
  let score = 0;

  const searchText = [
    image.alt || '',
    image.caption || '',
    image.filename,
    ...image.tags,
  ]
    .join(' ')
    .toLowerCase();

  // Check keyword matches
  for (const keyword of keywords) {
    if (searchText.includes(keyword.toLowerCase())) {
      score += 15;
    }
  }

  // Bonus for having alt text (good practice)
  if (image.alt) score += 10;

  // Bonus for having tags
  if (image.tags.length > 0) score += 10;

  return Math.min(score, 100);
}

/**
 * Smart image selection with diversity
 * Ensures selected images represent different aspects of the topic
 */
export async function selectDiverseImages(
  topicTitle: string,
  topicDescription: string,
  keywords: string[],
  availableImages: MediaAsset[],
  desiredCount: number = 5
): Promise<ImageRelevanceScore[]> {
  // Get all relevant images
  const relevant = await selectRelevantImages(
    topicTitle,
    topicDescription,
    keywords,
    availableImages
  );

  if (relevant.length <= desiredCount) {
    return relevant;
  }

  // Select diverse images
  const selected: ImageRelevanceScore[] = [];

  // Always include top-scoring image
  selected.push(relevant[0]);

  // Select remaining images with diversity
  for (let i = 1; i < relevant.length && selected.length < desiredCount; i++) {
    const candidate = relevant[i];

    // Check if this image is different enough from already selected ones
    const isDifferent = selected.every((s) => {
      // Simple diversity check: different placement or significantly different score
      return (
        s.suggestedPlacement !== candidate.suggestedPlacement ||
        Math.abs(s.relevanceScore - candidate.relevanceScore) > 15
      );
    });

    if (isDifferent || selected.length === desiredCount - 1) {
      selected.push(candidate);
    }
  }

  return selected;
}
