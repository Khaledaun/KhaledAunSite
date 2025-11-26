/**
 * Comprehensive Prompt Generator for Content Creation
 * Generates detailed prompts optimized for SEO, GEO, and AIO
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export interface AuthorProfile {
  name: string;
  expertise: string[];
  tone: string; // professional, authoritative, conversational, etc.
  background: string;
  targetAudience: string;
  reputationLevel: 'emerging' | 'established' | 'expert' | 'thought-leader';
}

export interface ContentStrategy {
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  focus: string[]; // e.g., ['practical guidance', 'case studies', 'legal analysis']
  keywords: string[];
  geoTargets: string[]; // e.g., ['UAE', 'Saudi Arabia', 'International']
  competitorUrls?: string[];
}

export interface PromptGenerationOptions {
  topic: string;
  author: AuthorProfile;
  strategy: ContentStrategy;
  language: 'en' | 'ar';
  existingContent?: string; // For learning author's style
}

/**
 * Generate a comprehensive content creation prompt
 * This prompt will be used to generate the actual article
 */
export async function generateContentPrompt(
  options: PromptGenerationOptions
): Promise<string> {
  const { topic, author, strategy, language, existingContent } = options;

  const metaPrompt = `You are an expert content strategist specializing in SEO, GEO (Geographic SEO), and AIO (AI Optimization).

Create a COMPREHENSIVE content creation prompt for the following article:

**Topic**: ${topic}

**Author Profile**:
- Name: ${author.name}
- Expertise: ${author.expertise.join(', ')}
- Tone: ${author.tone}
- Background: ${author.background}
- Target Audience: ${author.targetAudience}
- Reputation Level: ${author.reputationLevel}

**Content Strategy**:
- Complexity Level: ${strategy.complexity}
- Focus Areas: ${strategy.focus.join(', ')}
- Primary Keywords: ${strategy.keywords.join(', ')}
- Geographic Targets: ${strategy.geoTargets.join(', ')}

**Language**: ${language === 'en' ? 'English' : 'Arabic (RTL)'}

${existingContent ? `**Author's Writing Style Reference**:\n${existingContent.substring(0, 1000)}...\n` : ''}

Generate a detailed prompt that includes:

1. **SEO Optimization Requirements**:
   - Primary keyword placement strategy
   - LSI (Latent Semantic Indexing) keywords
   - Meta title and description templates
   - Header structure (H1, H2, H3)
   - Internal linking suggestions
   - Content length recommendation (word count)
   - Schema markup suggestions

2. **GEO (Geographic SEO) Requirements**:
   - Location-specific keywords
   - Regional legal considerations
   - Cultural nuances for target markets
   - Local search intent optimization

3. **AIO (AI Optimization) Requirements**:
   - Featured snippet optimization
   - Question-answer format sections
   - Entity recognition (people, places, organizations)
   - Semantic relationships
   - Contextual depth indicators
   - E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)

4. **Content Structure**:
   - Engaging introduction hook
   - Logical flow of sections
   - Practical examples and case studies
   - Expert insights and analysis
   - Actionable takeaways
   - Strong conclusion with CTA

5. **Writing Style Guidelines**:
   - Match author's tone and voice
   - Professional credibility markers
   - Appropriate complexity for reputation level
   - Bilingual considerations (if Arabic)

6. **Media and Formatting**:
   - Image placeholder suggestions with alt text
   - Infographic opportunities
   - Pull quotes or highlights
   - Bullet points and lists for scanability

7. **Engagement Elements**:
   - Discussion points
   - Reader questions
   - Social sharing hooks
   - LinkedIn-friendly excerpts

The prompt should result in a ${strategy.complexity} level article that positions ${author.name} as ${author.reputationLevel === 'emerging' ? 'an emerging voice' : author.reputationLevel === 'established' ? 'an established authority' : 'a thought leader'} in ${author.expertise.join(' and ')}.

Format your response as a complete, ready-to-use prompt that I can give to GPT-4 to generate the article.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist who creates comprehensive, actionable prompts for AI content generation.',
        },
        {
          role: 'user',
          content: metaPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating content prompt:', error);
    throw new Error('Failed to generate content prompt');
  }
}

/**
 * Analyze existing content to learn author's writing style
 */
export async function analyzeAuthorStyle(existingArticles: string[]): Promise<string> {
  if (existingArticles.length === 0) {
    return 'No existing content available for style analysis.';
  }

  const analysisPrompt = `Analyze these writing samples and describe the author's unique writing style, including:
- Tone and voice characteristics
- Sentence structure preferences
- Vocabulary level and technical language use
- Use of examples and analogies
- Engagement techniques
- Signature phrases or approaches

Samples:
${existingArticles.map((article, i) => `\n--- Sample ${i + 1} ---\n${article.substring(0, 800)}`).join('\n')}

Provide a concise style guide (200-300 words) that can be used to replicate this writing style.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error analyzing author style:', error);
    return 'Unable to analyze writing style.';
  }
}

/**
 * Generate keyword research for a topic
 */
export async function generateKeywordResearch(
  topic: string,
  geoTargets: string[]
): Promise<{
  primary: string[];
  secondary: string[];
  lsi: string[];
  questions: string[];
  local: Record<string, string[]>;
}> {
  const prompt = `Perform comprehensive keyword research for this topic: "${topic}"

Geographic targets: ${geoTargets.join(', ')}

Provide:
1. 3-5 primary keywords (high volume, high relevance)
2. 5-10 secondary keywords (medium volume, good relevance)
3. 10-15 LSI keywords (semantic variations)
4. 5-10 common questions people ask
5. Location-specific keyword variations for each geographic target

Format as JSON:
{
  "primary": ["keyword1", "keyword2"],
  "secondary": ["keyword1", "keyword2"],
  "lsi": ["keyword1", "keyword2"],
  "questions": ["question1", "question2"],
  "local": {
    "UAE": ["keyword1", "keyword2"],
    "Saudi Arabia": ["keyword1", "keyword2"]
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      primary: result.primary || [],
      secondary: result.secondary || [],
      lsi: result.lsi || [],
      questions: result.questions || [],
      local: result.local || {},
    };
  } catch (error) {
    console.error('Error generating keyword research:', error);
    return {
      primary: [],
      secondary: [],
      lsi: [],
      questions: [],
      local: {},
    };
  }
}

export default {
  generateContentPrompt,
  analyzeAuthorStyle,
  generateKeywordResearch,
};
