/**
 * Enhanced Duplicate Detection using Semantic Similarity
 * Uses OpenAI embeddings to detect similar topics beyond exact title matching
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  isSimilar: boolean;
  maxSimilarity: number;
  matches: Array<{
    id: string;
    title: string;
    similarity: number;
    reason: string;
  }>;
}

/**
 * Calculate cosine similarity between two embedding vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return similarity;
}

/**
 * Get embedding vector for text using OpenAI
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to get embedding:', error);
    throw error;
  }
}

/**
 * Check if a new topic is a duplicate or similar to existing topics
 *
 * Similarity thresholds:
 * - >= 0.95: Exact duplicate (auto-reject)
 * - 0.70-0.94: Very similar (flag for manual review)
 * - < 0.70: Sufficiently different (auto-approve)
 */
export async function checkForDuplicates(
  newTopicTitle: string,
  newTopicDescription: string,
  existingTopics: Array<{ id: string; title: string; description: string }>
): Promise<DuplicateCheckResult> {
  if (existingTopics.length === 0) {
    return {
      isDuplicate: false,
      isSimilar: false,
      maxSimilarity: 0,
      matches: [],
    };
  }

  // Combine title and description for more accurate matching
  const newTopicText = `${newTopicTitle}\n${newTopicDescription}`;

  try {
    // Get embedding for new topic
    const newEmbedding = await getEmbedding(newTopicText);

    // Get embeddings for existing topics (batch for efficiency)
    const existingTexts = existingTopics.map((t) => `${t.title}\n${t.description}`);

    const existingEmbeddings = await Promise.all(
      existingTexts.map((text) => getEmbedding(text))
    );

    // Calculate similarities
    const similarities = existingTopics.map((topic, index) => {
      const similarity = cosineSimilarity(newEmbedding, existingEmbeddings[index]);

      let reason = '';
      if (similarity >= 0.95) {
        reason = 'Nearly identical content';
      } else if (similarity >= 0.85) {
        reason = 'Very similar content';
      } else if (similarity >= 0.70) {
        reason = 'Moderately similar content';
      }

      return {
        id: topic.id,
        title: topic.title,
        similarity,
        reason,
      };
    });

    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Get max similarity
    const maxSimilarity = similarities[0]?.similarity || 0;

    // Filter matches above threshold
    const significantMatches = similarities.filter((s) => s.similarity >= 0.70);

    return {
      isDuplicate: maxSimilarity >= 0.95, // Auto-reject
      isSimilar: maxSimilarity >= 0.70 && maxSimilarity < 0.95, // Flag for review
      maxSimilarity,
      matches: significantMatches,
    };
  } catch (error) {
    console.error('Duplicate detection failed:', error);

    // Fallback to simple title matching on error
    const titleMatches = existingTopics.filter(
      (topic) =>
        topic.title.toLowerCase() === newTopicTitle.toLowerCase() ||
        topic.title.toLowerCase().includes(newTopicTitle.toLowerCase()) ||
        newTopicTitle.toLowerCase().includes(topic.title.toLowerCase())
    );

    return {
      isDuplicate: titleMatches.length > 0,
      isSimilar: false,
      maxSimilarity: titleMatches.length > 0 ? 1.0 : 0,
      matches: titleMatches.map((topic) => ({
        id: topic.id,
        title: topic.title,
        similarity: 1.0,
        reason: 'Title match (fallback)',
      })),
    };
  }
}

/**
 * Batch check multiple topics for duplicates
 * Returns only the topics that are not duplicates
 */
export async function filterDuplicates(
  newTopics: Array<{ title: string; description: string }>,
  existingTopics: Array<{ id: string; title: string; description: string }>
): Promise<
  Array<{
    title: string;
    description: string;
    duplicateCheck: DuplicateCheckResult;
    shouldCreate: boolean;
  }>
> {
  const results = await Promise.all(
    newTopics.map(async (topic) => {
      const duplicateCheck = await checkForDuplicates(
        topic.title,
        topic.description,
        existingTopics
      );

      return {
        ...topic,
        duplicateCheck,
        shouldCreate: !duplicateCheck.isDuplicate, // Only create if not a duplicate
      };
    })
  );

  return results;
}

/**
 * Simple text-based duplicate check (fast, no AI)
 * Useful for basic filtering before semantic check
 */
export function quickDuplicateCheck(
  newTopicTitle: string,
  existingTitles: string[]
): boolean {
  const normalizedNew = newTopicTitle.toLowerCase().trim();

  return existingTitles.some((title) => {
    const normalizedExisting = title.toLowerCase().trim();

    // Exact match
    if (normalizedNew === normalizedExisting) return true;

    // One contains the other
    if (
      normalizedNew.includes(normalizedExisting) ||
      normalizedExisting.includes(normalizedNew)
    ) {
      // Only if they're similar length (avoid "Law" matching "International Law")
      const lengthRatio = normalizedNew.length / normalizedExisting.length;
      return lengthRatio > 0.7 && lengthRatio < 1.3;
    }

    return false;
  });
}
