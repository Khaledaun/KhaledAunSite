/**
 * Phase 7: AI Content Generation Service
 * Integrates with OpenAI GPT-4 and Anthropic Claude for content generation
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateContentOptions {
  topic: string;
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  length?: 'short' | 'medium' | 'long';
  language?: 'en' | 'ar';
  keywords?: string[];
  outline?: string;
}

export interface TranslateOptions {
  text: string;
  from: 'en' | 'ar';
  to: 'en' | 'ar';
  preserveFormatting?: boolean;
}

export interface GenerateSEOOptions {
  content: string;
  targetKeywords?: string[];
}

/**
 * Generate blog post content using AI
 */
export async function generateContent(options: GenerateContentOptions): Promise<string> {
  const {
    topic,
    tone = 'professional',
    length = 'medium',
    language = 'en',
    keywords = [],
    outline,
  } = options;

  const wordCount = length === 'short' ? 500 : length === 'medium' ? 1000 : 2000;

  const systemPrompt = `You are an expert content writer creating high-quality blog posts. 
Write in a ${tone} tone. 
Target language: ${language === 'en' ? 'English' : 'Arabic'}.
${keywords.length > 0 ? `Include these keywords naturally: ${keywords.join(', ')}` : ''}
Format the output in clean HTML with proper headings, paragraphs, and lists.`;

  const userPrompt = outline
    ? `Write a ${wordCount}-word blog post about "${topic}" following this outline:\n\n${outline}`
    : `Write a ${wordCount}-word blog post about "${topic}". Include an engaging introduction, well-structured body with headings, and a strong conclusion.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: wordCount * 2, // Rough estimate
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI content generation error:', error);
    throw new Error('Failed to generate content');
  }
}

/**
 * Generate content outline/structure
 */
export async function generateOutline(topic: string, keywords?: string[]): Promise<string> {
  const systemPrompt = `You are an expert content strategist. Create detailed blog post outlines with clear sections and subsections.`;

  const userPrompt = `Create a detailed outline for a blog post about "${topic}".
${keywords ? `Target keywords: ${keywords.join(', ')}` : ''}
Include:
- Introduction hook
- 3-5 main sections with subsections
- Key points to cover in each section
- Conclusion/call-to-action

Format as a numbered outline.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI outline generation error:', error);
    throw new Error('Failed to generate outline');
  }
}

/**
 * Translate content between English and Arabic
 */
export async function translateContent(options: TranslateOptions): Promise<string> {
  const { text, from, to, preserveFormatting = true } = options;

  if (from === to) {
    return text; // No translation needed
  }

  const systemPrompt = `You are an expert translator specializing in ${from === 'en' ? 'English to Arabic' : 'Arabic to English'} translation.
${preserveFormatting ? 'Preserve all HTML formatting, tags, and structure exactly.' : 'Translate the text naturally.'}
Maintain the tone and style of the original content.
Ensure cultural appropriateness and natural phrasing.`;

  const userPrompt = preserveFormatting
    ? `Translate the following HTML content from ${from} to ${to}. Keep all HTML tags exactly as they are:\n\n${text}`
    : `Translate the following text from ${from} to ${to}:\n\n${text}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more accurate translation
      max_tokens: text.length * 3, // Allow for expansion in translation
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI translation error:', error);
    throw new Error('Failed to translate content');
  }
}

/**
 * Generate SEO metadata (title, description, keywords)
 */
export async function generateSEOMetadata(options: GenerateSEOOptions): Promise<{
  title: string;
  description: string;
  keywords: string[];
}> {
  const { content, targetKeywords = [] } = options;

  const systemPrompt = `You are an SEO expert. Generate optimized meta tags for blog posts.`;

  const userPrompt = `Based on this blog post content, generate:
1. An SEO-optimized title (50-60 characters)
2. A meta description (120-160 characters)
3. 5-10 relevant keywords

${targetKeywords.length > 0 ? `Include these keywords if relevant: ${targetKeywords.join(', ')}` : ''}

Content:
${content.substring(0, 1000)}...

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "keywords": ["...", "..."]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      title: result.title || '',
      description: result.description || '',
      keywords: result.keywords || [],
    };
  } catch (error) {
    console.error('AI SEO generation error:', error);
    throw new Error('Failed to generate SEO metadata');
  }
}

/**
 * Improve/enhance existing content
 */
export async function improveContent(content: string, instructions?: string): Promise<string> {
  const systemPrompt = `You are an expert content editor. Improve blog posts while maintaining the author's voice and key points.`;

  const userPrompt = instructions
    ? `Improve this content following these instructions: ${instructions}\n\nContent:\n${content}`
    : `Improve this content by:
- Enhancing clarity and readability
- Improving structure and flow
- Adding engaging transitions
- Strengthening the introduction and conclusion
- Maintaining all key information

Content:\n${content}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: content.length * 2,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI content improvement error:', error);
    throw new Error('Failed to improve content');
  }
}

/**
 * Generate content ideas/topics
 */
export async function generateIdeas(category: string, count: number = 10): Promise<string[]> {
  const systemPrompt = `You are a content strategist specializing in generating blog post ideas.`;

  const userPrompt = `Generate ${count} unique and engaging blog post ideas about "${category}".
Make them specific, actionable, and SEO-friendly.
Format as a JSON array of strings.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"ideas":[]}');
    return result.ideas || [];
  } catch (error) {
    console.error('AI idea generation error:', error);
    throw new Error('Failed to generate ideas');
  }
}

export default {
  generateContent,
  generateOutline,
  translateContent,
  generateSEOMetadata,
  improveContent,
  generateIdeas,
};


