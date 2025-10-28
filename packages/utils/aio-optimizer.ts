/**
 * AIO (AI Optimization) Engine
 * Optimizes content for AI search engines (ChatGPT, Perplexity, Google SGE)
 * 
 * @module aio-optimizer
 * @author AI Content Management System
 * @version 1.0.0
 */

export interface AIOAnalysis {
  score: number; // 0-100
  chatGPTOptimization: ChatGPTOptimization;
  perplexityOptimization: PerplexityOptimization;
  googleSGEOptimization: GoogleSGEOptimization;
  structuredData: StructuredDataAnalysis;
  recommendations: string[];
}

export interface ChatGPTOptimization {
  citationQuality: number; // 0-100
  factDensity: number; // 0-100
  structuredData: boolean;
  quotableSnippets: number;
  sourceAttribution: boolean;
}

export interface PerplexityOptimization {
  questionAnswerFormat: boolean;
  factBoxes: number;
  sources: number;
  clearSections: boolean;
}

export interface GoogleSGEOptimization {
  keyTakeaways: boolean;
  bulletSummaries: boolean;
  expertQuotes: number;
  visualElements: number;
}

export interface StructuredDataAnalysis {
  hasSchema: boolean;
  schemaType?: string;
  completeness: number; // 0-100
}

/**
 * Main AIO analysis function
 */
export function analyzeAIO(content: {
  title: string;
  content: string;
  excerpt?: string;
  schema?: any;
  keywords?: string[];
}): AIOAnalysis {
  let score = 0;
  const recommendations: string[] = [];
  
  // 1. ChatGPT Optimization (35 points)
  const chatGPTOpt = analyzeChatGPTOptimization(content);
  score += (chatGPTOpt.citationQuality + chatGPTOpt.factDensity) / 2 * 0.35;
  
  if (chatGPTOpt.citationQuality < 70) {
    recommendations.push('Add more factual citations and data points');
  }
  if (!chatGPTOpt.structuredData) {
    recommendations.push('Add structured data (Schema.org markup)');
  }
  if (chatGPTOpt.quotableSnippets < 3) {
    recommendations.push('Create more quotable, standalone snippets');
  }
  
  // 2. Perplexity Optimization (30 points)
  const perplexityOpt = analyzePerplexityOptimization(content);
  let perplexityScore = 0;
  if (perplexityOpt.questionAnswerFormat) perplexityScore += 40;
  if (perplexityOpt.clearSections) perplexityScore += 30;
  perplexityScore += Math.min(30, perplexityOpt.factBoxes * 10);
  score += perplexityScore * 0.30;
  
  if (!perplexityOpt.questionAnswerFormat) {
    recommendations.push('Structure content in Q&A format');
  }
  if (perplexityOpt.factBoxes < 2) {
    recommendations.push('Add highlighted fact boxes or statistics');
  }
  
  // 3. Google SGE Optimization (25 points)
  const googleSGEOpt = analyzeGoogleSGEOptimization(content);
  let sgeScore = 0;
  if (googleSGEOpt.keyTakeaways) sgeScore += 40;
  if (googleSGEOpt.bulletSummaries) sgeScore += 30;
  sgeScore += Math.min(30, googleSGEOpt.expertQuotes * 15);
  score += sgeScore * 0.25;
  
  if (!googleSGEOpt.keyTakeaways) {
    recommendations.push('Add a "Key Takeaways" section at the beginning');
  }
  if (!googleSGEOpt.bulletSummaries) {
    recommendations.push('Include bullet point summaries');
  }
  
  // 4. Structured Data (10 points)
  const structuredData = analyzeStructuredData(content);
  if (structuredData.hasSchema) {
    score += structuredData.completeness * 0.10;
  } else {
    recommendations.push('Add Schema.org markup (Article, FAQ, or HowTo)');
  }
  
  return {
    score: Math.round(score),
    chatGPTOptimization: chatGPTOpt,
    perplexityOptimization: perplexityOpt,
    googleSGEOptimization: googleSGEOpt,
    structuredData,
    recommendations,
  };
}

/**
 * Analyze ChatGPT optimization
 */
function analyzeChatGPTOptimization(content: {
  title: string;
  content: string;
  schema?: any;
}): ChatGPTOptimization {
  const plainText = stripHtml(content.content);
  
  // Citation quality: Look for numbers, statistics, sources
  const hasNumbers = /\d+(%|percent|\s+(percent|million|billion|thousand))/.test(plainText);
  const hasStatistics = /(according to|study|research|survey|data|report)/i.test(plainText);
  const hasSources = /(source:|via|according to|cited|reference)/i.test(plainText);
  
  let citationQuality = 0;
  if (hasNumbers) citationQuality += 40;
  if (hasStatistics) citationQuality += 30;
  if (hasSources) citationQuality += 30;
  
  // Fact density: Count factual statements
  const sentences = plainText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const factualSentences = sentences.filter((s) =>
    /\d+/.test(s) || /(is|are|was|were|has|have)\s+\w+/.test(s)
  );
  const factDensity = sentences.length > 0 
    ? Math.min(100, (factualSentences.length / sentences.length) * 150)
    : 0;
  
  // Quotable snippets: Short, complete statements
  const quotableSnippets = sentences.filter((s) => {
    const words = s.split(/\s+/).length;
    return words >= 10 && words <= 25 && /^[A-Z]/.test(s.trim());
  }).length;
  
  return {
    citationQuality,
    factDensity: Math.round(factDensity),
    structuredData: !!content.schema,
    quotableSnippets,
    sourceAttribution: hasSources,
  };
}

/**
 * Analyze Perplexity optimization
 */
function analyzePerplexityOptimization(content: {
  content: string;
}): PerplexityOptimization {
  const html = content.content;
  const plainText = stripHtml(html);
  
  // Q&A format: Look for questions and answers
  const questionCount = (plainText.match(/\?/g) || []).length;
  const questionAnswerFormat = questionCount >= 2;
  
  // Fact boxes: Look for blockquotes or highlighted sections
  const factBoxes = (html.match(/<blockquote|<aside|<div class=".*?(highlight|fact|stat)/gi) || []).length;
  
  // Sources: Look for links and citations
  const sources = (html.match(/<a href/gi) || []).length;
  
  // Clear sections: Look for H2/H3 headings
  const headings = (html.match(/<h[23]/gi) || []).length;
  const clearSections = headings >= 3;
  
  return {
    questionAnswerFormat,
    factBoxes,
    sources,
    clearSections,
  };
}

/**
 * Analyze Google SGE optimization
 */
function analyzeGoogleSGEOptimization(content: {
  content: string;
  excerpt?: string;
}): GoogleSGEOptimization {
  const html = content.content;
  const plainText = stripHtml(html);
  
  // Key takeaways: Look for summary sections
  const keyTakeaways =
    /key takeaways|in summary|tldr|quick summary|at a glance/i.test(plainText);
  
  // Bullet summaries: Look for lists
  const bulletLists = (html.match(/<[uo]l>/gi) || []).length;
  const bulletSummaries = bulletLists >= 1;
  
  // Expert quotes: Look for blockquotes with attribution
  const expertQuotes = (html.match(/<blockquote[\s\S]*?<\/blockquote>/gi) || []).length;
  
  // Visual elements: Images, videos, diagrams
  const images = (html.match(/<img/gi) || []).length;
  const videos = (html.match(/<video|<iframe/gi) || []).length;
  const visualElements = images + videos;
  
  return {
    keyTakeaways,
    bulletSummaries,
    expertQuotes,
    visualElements,
  };
}

/**
 * Analyze structured data
 */
function analyzeStructuredData(content: {
  schema?: any;
}): StructuredDataAnalysis {
  if (!content.schema) {
    return {
      hasSchema: false,
      completeness: 0,
    };
  }
  
  const schema = content.schema;
  const requiredFields = ['@context', '@type', 'headline', 'author', 'datePublished'];
  const optionalFields = ['image', 'description', 'publisher', 'dateModified'];
  
  let completeness = 0;
  requiredFields.forEach((field) => {
    if (schema[field]) completeness += 60 / requiredFields.length;
  });
  optionalFields.forEach((field) => {
    if (schema[field]) completeness += 40 / optionalFields.length;
  });
  
  return {
    hasSchema: true,
    schemaType: schema['@type'],
    completeness: Math.round(completeness),
  };
}

/**
 * Generate Schema.org markup
 */
export function generateSchemaMarkup(
  type: 'Article' | 'BlogPosting' | 'FAQ' | 'HowTo',
  data: {
    title: string;
    description: string;
    author?: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    url?: string;
    keywords?: string[];
  }
): Record<string, any> {
  const baseSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': type,
    headline: data.title,
    description: data.description,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
  };
  
  if (data.author) {
    baseSchema.author = {
      '@type': 'Person',
      name: data.author,
    };
  }
  
  if (data.image) {
    baseSchema.image = data.image;
  }
  
  if (data.url) {
    baseSchema.url = data.url;
  }
  
  if (data.keywords && data.keywords.length > 0) {
    baseSchema.keywords = data.keywords.join(', ');
  }
  
  // Type-specific enhancements
  if (type === 'Article' || type === 'BlogPosting') {
    baseSchema.publisher = {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'Your Site',
      logo: {
        '@type': 'ImageObject',
        url: process.env.NEXT_PUBLIC_SITE_LOGO || '',
      },
    };
  }
  
  return baseSchema;
}

// Helper function
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

