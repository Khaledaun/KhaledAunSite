/**
 * Prompt Update Analyzer
 * Uses LLM to analyze algorithm updates and generate actionable prompt improvements
 *
 * @module prompt-update-analyzer
 * @version 1.0.0
 */

import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export interface UpdateAnalysis {
  insights: {
    summary: string;
    actionableChanges: string[];
    affectedAreas: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  promptUpdates: {
    seoPrompts?: PromptUpdate[];
    aioPrompts?: PromptUpdate[];
    linkedinPrompts?: PromptUpdate[];
    generalGuidelines: string[];
  };
}

export interface PromptUpdate {
  section: string; // Which part of the prompt to update
  currentApproach: string;
  suggestedChange: string;
  reasoning: string;
}

/**
 * Analyze algorithm update and generate insights
 */
export async function analyzeUpdate(update: {
  source: 'SEO' | 'AIO' | 'LINKEDIN';
  title: string;
  description: string;
  url: string;
  category: string[];
  platform?: string;
}): Promise<UpdateAnalysis> {
  const systemPrompt = `You are an expert SEO and content optimization strategist specializing in algorithm updates.
Your job is to analyze algorithm updates from Google Search, AI search engines (ChatGPT, Perplexity, SGE), and LinkedIn,
then provide actionable recommendations for updating content generation prompts.

Focus on:
1. Extracting key changes and their implications
2. Identifying specific adjustments needed in content generation prompts
3. Providing clear, actionable recommendations
4. Prioritizing changes by impact

Your analysis should be practical and ready to implement in AI content generation systems.`;

  const userPrompt = `Analyze this algorithm update and provide detailed recommendations for updating our content generation prompts:

**Source**: ${update.source} (${update.platform || 'N/A'})
**Title**: ${update.title}
**Description**: ${update.description}
**Categories**: ${update.category.join(', ')}
**URL**: ${update.url}

Provide your analysis in the following JSON format:
{
  "insights": {
    "summary": "Brief summary of the update and its importance",
    "actionableChanges": ["List of specific changes content creators should make"],
    "affectedAreas": ["List of content areas affected: e.g., 'title optimization', 'content structure', 'keyword usage'"],
    "priority": "low|medium|high|critical"
  },
  "promptUpdates": {
    "seoPrompts": [
      {
        "section": "which part of SEO prompt to update",
        "currentApproach": "what we currently do",
        "suggestedChange": "what we should change to",
        "reasoning": "why this change is needed"
      }
    ],
    "aioPrompts": [...],
    "linkedinPrompts": [...],
    "generalGuidelines": ["Overall guidelines to incorporate in all content generation"]
  }
}

Be specific and actionable. Focus on changes that can be implemented in prompt engineering.`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return analysis as UpdateAnalysis;
  } catch (error) {
    console.error('Update analysis error:', error);
    throw new Error('Failed to analyze algorithm update');
  }
}

/**
 * Analyze multiple updates and consolidate recommendations
 */
export async function analyzeBatchUpdates(updates: Array<{
  source: 'SEO' | 'AIO' | 'LINKEDIN';
  title: string;
  description: string;
  url: string;
  category: string[];
  platform?: string;
}>): Promise<{
  consolidatedInsights: string;
  priorityUpdates: PromptUpdate[];
  summary: {
    totalUpdates: number;
    criticalCount: number;
    highCount: number;
    affectedAreas: string[];
  };
}> {
  const systemPrompt = `You are an expert SEO and content optimization strategist.
Analyze multiple algorithm updates and provide consolidated, prioritized recommendations for updating content generation prompts.
Focus on finding patterns and the most impactful changes.`;

  const updatesText = updates.map((u, i) => `
Update ${i + 1}:
- Source: ${u.source} (${u.platform || 'N/A'})
- Title: ${u.title}
- Description: ${u.description}
- Categories: ${u.category.join(', ')}
`).join('\n');

  const userPrompt = `Analyze these ${updates.length} algorithm updates from the past week and provide consolidated recommendations:

${updatesText}

Provide your analysis in JSON format:
{
  "consolidatedInsights": "Comprehensive summary of all updates and their combined impact",
  "priorityUpdates": [
    {
      "section": "area to update (e.g., 'content generation system prompt')",
      "currentApproach": "current method",
      "suggestedChange": "recommended change based on ALL updates",
      "reasoning": "why this is a priority change"
    }
  ],
  "summary": {
    "totalUpdates": ${updates.length},
    "criticalCount": 0,
    "highCount": 0,
    "affectedAreas": ["list of all affected areas"]
  }
}

Focus on the most impactful changes that should be implemented first.`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return analysis;
  } catch (error) {
    console.error('Batch analysis error:', error);
    throw new Error('Failed to analyze batch updates');
  }
}

/**
 * Generate updated prompt based on analysis
 */
export async function generateUpdatedPrompt(
  currentPrompt: string,
  updates: PromptUpdate[]
): Promise<string> {
  const systemPrompt = `You are an expert prompt engineer. Update AI content generation prompts based on algorithm update recommendations.
Maintain the original prompt's style and structure while incorporating new best practices.`;

  const updatesText = updates.map((u, i) => `
${i + 1}. ${u.section}
   Current: ${u.currentApproach}
   Change to: ${u.suggestedChange}
   Reason: ${u.reasoning}
`).join('\n');

  const userPrompt = `Update this content generation prompt to incorporate the following algorithm update recommendations:

**Current Prompt:**
${currentPrompt}

**Required Updates:**
${updatesText}

Provide the updated prompt that incorporates all recommendations while maintaining clarity and effectiveness.
Output ONLY the updated prompt, no explanations.`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || currentPrompt;
  } catch (error) {
    console.error('Prompt generation error:', error);
    throw new Error('Failed to generate updated prompt');
  }
}

/**
 * Compare two prompts and highlight changes
 */
export function comparePrompts(
  oldPrompt: string,
  newPrompt: string
): {
  additions: string[];
  removals: string[];
  modifications: string[];
} {
  // Simple diff algorithm
  const oldLines = oldPrompt.split('\n').map(l => l.trim()).filter(l => l);
  const newLines = newPrompt.split('\n').map(l => l.trim()).filter(l => l);

  const additions: string[] = [];
  const removals: string[] = [];
  const modifications: string[] = [];

  // Find additions
  newLines.forEach(line => {
    if (!oldLines.includes(line)) {
      // Check if it's a modification or pure addition
      const similar = oldLines.find(oldLine =>
        calculateSimilarity(oldLine, line) > 0.7
      );
      if (similar) {
        modifications.push(`Changed: "${similar}" → "${line}"`);
      } else {
        additions.push(line);
      }
    }
  });

  // Find removals
  oldLines.forEach(line => {
    if (!newLines.includes(line) && !modifications.some(m => m.includes(line))) {
      removals.push(line);
    }
  });

  return { additions, removals, modifications };
}

/**
 * Calculate similarity between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
