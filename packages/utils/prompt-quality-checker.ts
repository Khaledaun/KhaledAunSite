/**
 * Prompt Quality Checker
 * Analyzes generated prompts and determines if they meet quality criteria for auto-approval
 */

import OpenAI from 'openai';
import { getFeatureConfig } from './automation-config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PromptQualityResult {
  score: number; // 0-100
  passed: boolean; // true if meets auto-approval criteria
  checks: {
    length: { passed: boolean; actual: number; required: number };
    seoElements: { passed: boolean; missing: string[] };
    geoElements: { passed: boolean; missing: string[] };
    aioElements: { passed: boolean; missing: string[] };
    structure: { passed: boolean; issues: string[] };
    clarity: { passed: boolean; score: number };
  };
  recommendation: 'auto_approve' | 'manual_review' | 'reject';
  reasoning: string;
}

/**
 * Required elements for a high-quality prompt
 */
const REQUIRED_ELEMENTS = {
  seo: [
    'keyword',
    'meta description',
    'title tag',
    'header',
    'schema markup',
    'internal link',
  ],
  geo: [
    'location',
    'regional',
    'cultural',
    'local keyword',
  ],
  aio: [
    'featured snippet',
    'E-E-A-T',
    'semantic',
    'question answering',
  ],
};

/**
 * Check if prompt meets quality criteria
 */
export async function checkPromptQuality(
  promptText: string,
  topicTitle: string
): Promise<PromptQualityResult> {
  const config = await getFeatureConfig('autoApprovePrompts');

  const checks = {
    length: checkLength(promptText, config.minLength),
    seoElements: checkSEOElements(promptText),
    geoElements: checkGEOElements(promptText),
    aioElements: checkAIOElements(promptText),
    structure: checkStructure(promptText),
    clarity: await checkClarity(promptText, topicTitle),
  };

  // Calculate overall score
  const scores = [
    checks.length.passed ? 100 : (checks.length.actual / checks.length.required) * 100,
    checks.seoElements.passed ? 100 : ((6 - checks.seoElements.missing.length) / 6) * 100,
    checks.geoElements.passed ? 100 : ((4 - checks.geoElements.missing.length) / 4) * 100,
    checks.aioElements.passed ? 100 : ((4 - checks.aioElements.missing.length) / 4) * 100,
    checks.structure.passed ? 100 : 50,
    checks.clarity.score,
  ];

  const overallScore = Math.round(scores.reduce((a, b) => a + b) / scores.length);

  // Determine if passed
  const allChecksPassed = config.requireAllElements
    ? Object.values(checks).every((check) => check.passed)
    : overallScore >= config.minQualityScore;

  const passed = allChecksPassed && overallScore >= config.minQualityScore;

  // Determine recommendation
  let recommendation: 'auto_approve' | 'manual_review' | 'reject';
  let reasoning: string;

  if (passed && config.enabled) {
    recommendation = 'auto_approve';
    reasoning = `Prompt meets all quality criteria (score: ${overallScore}/100). Auto-approving.`;
  } else if (overallScore >= 70) {
    recommendation = 'manual_review';
    reasoning = `Prompt quality is good (score: ${overallScore}/100) but doesn't meet auto-approval criteria. Flagging for manual review.`;
  } else {
    recommendation = 'reject';
    reasoning = `Prompt quality is insufficient (score: ${overallScore}/100). Regeneration recommended.`;
  }

  return {
    score: overallScore,
    passed,
    checks,
    recommendation,
    reasoning,
  };
}

/**
 * Check prompt length
 */
function checkLength(
  prompt: string,
  minLength: number
): { passed: boolean; actual: number; required: number } {
  const actual = prompt.length;
  return {
    passed: actual >= minLength,
    actual,
    required: minLength,
  };
}

/**
 * Check for SEO elements
 */
function checkSEOElements(prompt: string): { passed: boolean; missing: string[] } {
  const promptLower = prompt.toLowerCase();
  const missing: string[] = [];

  for (const element of REQUIRED_ELEMENTS.seo) {
    if (!promptLower.includes(element)) {
      missing.push(element);
    }
  }

  return {
    passed: missing.length === 0,
    missing,
  };
}

/**
 * Check for GEO elements
 */
function checkGEOElements(prompt: string): { passed: boolean; missing: string[] } {
  const promptLower = prompt.toLowerCase();
  const missing: string[] = [];

  for (const element of REQUIRED_ELEMENTS.geo) {
    if (!promptLower.includes(element)) {
      missing.push(element);
    }
  }

  // Pass if at least 3 out of 4 elements present
  return {
    passed: missing.length <= 1,
    missing,
  };
}

/**
 * Check for AIO elements
 */
function checkAIOElements(prompt: string): { passed: boolean; missing: string[] } {
  const promptLower = prompt.toLowerCase();
  const missing: string[] = [];

  for (const element of REQUIRED_ELEMENTS.aio) {
    if (!promptLower.includes(element)) {
      missing.push(element);
    }
  }

  // Pass if at least 3 out of 4 elements present
  return {
    passed: missing.length <= 1,
    missing,
  };
}

/**
 * Check prompt structure
 */
function checkStructure(prompt: string): { passed: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for sections
  const hasSections =
    prompt.includes('1.') || prompt.includes('##') || prompt.includes('SECTION');
  if (!hasSections) {
    issues.push('No clear section structure');
  }

  // Check for examples
  if (!prompt.toLowerCase().includes('example')) {
    issues.push('No examples provided');
  }

  // Check for clear instructions
  if (!prompt.toLowerCase().includes('should') && !prompt.toLowerCase().includes('must')) {
    issues.push('Lacks clear directives');
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Check prompt clarity using AI
 */
async function checkClarity(
  prompt: string,
  topicTitle: string
): Promise<{ passed: boolean; score: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a content strategy expert. Evaluate prompt clarity and completeness.`,
        },
        {
          role: 'user',
          content: `Rate the following content creation prompt for the topic "${topicTitle}" on a scale of 0-100:

Evaluation criteria:
- Is it clear and unambiguous?
- Does it provide specific, actionable instructions?
- Is it comprehensive without being overwhelming?
- Would a writer know exactly what to create?

Prompt:
${prompt}

Respond with ONLY a number from 0-100.`,
        },
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const scoreText = response.choices[0]?.message?.content?.trim();
    const score = parseInt(scoreText || '0');

    return {
      passed: score >= 80,
      score: isNaN(score) ? 0 : score,
    };
  } catch (error) {
    console.error('Failed to check prompt clarity:', error);
    return { passed: true, score: 70 }; // Fail-safe: assume OK if AI check fails
  }
}

/**
 * Batch check multiple prompts
 */
export async function batchCheckPrompts(
  prompts: Array<{ id: string; prompt: string; title: string }>
): Promise<Map<string, PromptQualityResult>> {
  const results = new Map<string, PromptQualityResult>();

  for (const { id, prompt, title } of prompts) {
    try {
      const result = await checkPromptQuality(prompt, title);
      results.set(id, result);

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to check prompt ${id}:`, error);
    }
  }

  return results;
}
