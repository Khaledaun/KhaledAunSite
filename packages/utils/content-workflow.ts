/**
 * Content Production Workflow Service
 * Manages the complete pipeline: Topic → Prompt → Article → Approval → Publishing → LinkedIn
 */

import OpenAI from 'openai';
import type {
  AuthorProfile,
  ContentStrategy,
} from './prompt-generator';
import { generateContentPrompt, generateKeywordResearch } from './prompt-generator';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export type WorkflowStatus =
  | 'topic_created'
  | 'prompt_generating'
  | 'prompt_ready'
  | 'prompt_approved'
  | 'article_generating'
  | 'article_ready'
  | 'article_approved'
  | 'publishing'
  | 'published'
  | 'linkedin_generating'
  | 'linkedin_ready'
  | 'linkedin_approved'
  | 'linkedin_published'
  | 'completed';

export interface WorkflowState {
  status: WorkflowStatus;
  topic: string;
  prompt?: string;
  articleEn?: string;
  articleAr?: string;
  linkedinPost?: string;
  linkedinPostAr?: string;
  keywords?: any;
  mediaIds?: string[];
  publishedUrl?: string;
  linkedinUrl?: string;
  errors?: string[];
}

/**
 * Generate article from comprehensive prompt
 */
export async function generateArticleFromPrompt(
  prompt: string,
  language: 'en' | 'ar',
  mediaIds: string[] = []
): Promise<string> {
  try {
    // Add media placeholder instructions if mediaIds provided
    const mediaInstructions = mediaIds.length > 0
      ? `\n\nINCLUDE IMAGE PLACEHOLDERS: Insert ${mediaIds.length} image placeholders throughout the article using this format: [IMAGE:${mediaIds[0]}] with descriptive captions. Distribute images evenly throughout the content.`
      : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert legal content writer. Follow the provided prompt EXACTLY to create a high-quality ${language === 'en' ? 'English' : 'Arabic'} article. Format in clean HTML with proper semantic tags.`,
        },
        {
          role: 'user',
          content: prompt + mediaInstructions,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    let article = completion.choices[0]?.message?.content || '';

    // Replace image placeholders with actual media IDs
    mediaIds.forEach((mediaId, index) => {
      article = article.replace(
        new RegExp(`\\[IMAGE:${mediaId}\\]`, 'g'),
        `<figure class="article-image">
  <img src="/api/media/${mediaId}" alt="Article illustration ${index + 1}" loading="lazy" />
  <figcaption>Image ${index + 1}</figcaption>
</figure>`
      );
    });

    return article;
  } catch (error) {
    console.error('Error generating article:', error);
    throw new Error(`Failed to generate ${language} article`);
  }
}

/**
 * Generate LinkedIn post from article
 */
export async function generateLinkedInPost(
  articleTitle: string,
  articleContent: string,
  articleUrl: string,
  language: 'en' | 'ar',
  authorName: string
): Promise<string> {
  const prompt = `Create an engaging LinkedIn post to promote this article:

**Article Title**: ${articleTitle}
**URL**: ${articleUrl}
**Author**: ${authorName}
**Language**: ${language === 'en' ? 'English' : 'Arabic'}

**Article Excerpt**:
${articleContent.substring(0, 500)}...

Requirements:
- ${language === 'en' ? 'Professional English' : 'Professional Arabic with RTL formatting'}
- 150-200 words
- Engaging hook in first line
- Key insights from article (2-3 points)
- Professional tone matching author's expertise
- Include relevant hashtags (3-5)
- End with call-to-action to read full article
- Include article URL

Format as plain text (no HTML), ready to post on LinkedIn.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating LinkedIn post:', error);
    throw new Error(`Failed to generate LinkedIn post in ${language}`);
  }
}

/**
 * Complete workflow: Generate prompt for a topic
 */
export async function generatePromptForTopic(
  topic: string,
  author: AuthorProfile,
  strategy: ContentStrategy
): Promise<{
  promptEn: string;
  promptAr: string;
  keywords: any;
}> {
  try {
    console.log(`Generating comprehensive prompts for topic: ${topic}`);

    // Step 1: Generate keyword research
    const keywords = await generateKeywordResearch(topic, strategy.geoTargets);

    // Update strategy with researched keywords
    const enhancedStrategy = {
      ...strategy,
      keywords: [...strategy.keywords, ...keywords.primary, ...keywords.secondary],
    };

    // Step 2: Generate English prompt
    const promptEn = await generateContentPrompt({
      topic,
      author,
      strategy: enhancedStrategy,
      language: 'en',
    });

    // Step 3: Generate Arabic prompt
    const promptAr = await generateContentPrompt({
      topic,
      author,
      strategy: enhancedStrategy,
      language: 'ar',
    });

    return {
      promptEn,
      promptAr,
      keywords,
    };
  } catch (error) {
    console.error('Error generating prompts for topic:', error);
    throw error;
  }
}

/**
 * Complete workflow: Generate bilingual articles
 */
export async function generateBilingualArticles(
  promptEn: string,
  promptAr: string,
  mediaIds: string[] = []
): Promise<{
  articleEn: string;
  articleAr: string;
}> {
  try {
    console.log('Generating bilingual articles...');

    // Generate both articles in parallel
    const [articleEn, articleAr] = await Promise.all([
      generateArticleFromPrompt(promptEn, 'en', mediaIds),
      generateArticleFromPrompt(promptAr, 'ar', mediaIds),
    ]);

    return {
      articleEn,
      articleAr,
    };
  } catch (error) {
    console.error('Error generating bilingual articles:', error);
    throw error;
  }
}

/**
 * Complete workflow: Generate LinkedIn posts
 */
export async function generateBilingualLinkedInPosts(
  title: string,
  articleEn: string,
  articleAr: string,
  articleUrl: string,
  authorName: string
): Promise<{
  linkedinEn: string;
  linkedinAr: string;
}> {
  try {
    console.log('Generating LinkedIn posts...');

    const [linkedinEn, linkedinAr] = await Promise.all([
      generateLinkedInPost(title, articleEn, articleUrl, 'en', authorName),
      generateLinkedInPost(title, articleAr, articleUrl, 'ar', authorName),
    ]);

    return {
      linkedinEn,
      linkedinAr,
    };
  } catch (error) {
    console.error('Error generating LinkedIn posts:', error);
    throw error;
  }
}

/**
 * Notify Google about new content (submit to indexing)
 */
export async function notifyGoogleIndexing(url: string): Promise<boolean> {
  try {
    // Note: This requires Google Search Console API setup
    // For now, we'll just log it. In production, implement:
    // 1. Google Indexing API
    // 2. Or submit sitemap to Search Console
    // 3. Or use Google Search Console API

    console.log(`Would notify Google about new content: ${url}`);

    // Placeholder for actual implementation
    // const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${GOOGLE_ACCESS_TOKEN}`,
    //   },
    //   body: JSON.stringify({
    //     url,
    //     type: 'URL_UPDATED',
    //   }),
    // });

    return true;
  } catch (error) {
    console.error('Error notifying Google:', error);
    return false;
  }
}

export default {
  generateArticleFromPrompt,
  generateLinkedInPost,
  generatePromptForTopic,
  generateBilingualArticles,
  generateBilingualLinkedInPosts,
  notifyGoogleIndexing,
};
