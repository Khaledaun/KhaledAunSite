/**
 * SEO Analysis Engine
 * Analyzes content and provides SEO scores, recommendations, and optimization suggestions
 * 
 * @module seo-analyzer
 * @author AI Content Management System
 * @version 1.0.0
 */

export interface SEOAnalysis {
  score: number; // 0-100
  issues: SEOIssue[];
  warnings: SEOWarning[];
  recommendations: string[];
  strengths: string[];
  readability: ReadabilityScore;
  keywords: KeywordAnalysis[];
  headings: HeadingAnalysis;
  meta: MetaAnalysis;
}

export interface SEOIssue {
  type: 'meta_title' | 'meta_description' | 'keywords' | 'headings' | 'images' | 'links' | 'content';
  severity: 'error' | 'warning' | 'info';
  message: string;
  fix?: string;
  impact: number; // How much this affects the score
}

export type SEOWarning = SEOIssue;

export interface ReadabilityScore {
  fleschKincaid: number;
  grade: string;
  readingTime: number;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
}

export interface KeywordAnalysis {
  keyword: string;
  count: number;
  density: number; // Percentage
  optimal: boolean;
  positions: number[]; // Where the keyword appears
}

export interface HeadingAnalysis {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  structure: 'excellent' | 'good' | 'poor';
  issues: string[];
}

export interface MetaAnalysis {
  titleLength: number;
  titleOptimal: boolean;
  descriptionLength: number;
  descriptionOptimal: boolean;
  hasKeywordInTitle: boolean;
  hasKeywordInDescription: boolean;
}

/**
 * Main SEO analysis function
 * Analyzes content and returns comprehensive SEO metrics
 */
export function analyzeSEO(content: {
  title: string;
  description?: string;
  content: string;
  keywords: string[];
  slug: string;
  excerpt?: string;
}): SEOAnalysis {
  const issues: SEOIssue[] = [];
  const warnings: SEOWarning[] = [];
  const recommendations: string[] = [];
  const strengths: string[] = [];
  
  let score = 100; // Start with perfect score and deduct points
  
  // 1. Analyze Meta Title (15 points)
  const metaTitle = content.title;
  if (!metaTitle) {
    issues.push({
      type: 'meta_title',
      severity: 'error',
      message: 'Meta title is missing',
      impact: 15,
    });
    score -= 15;
  } else if (metaTitle.length < 30) {
    issues.push({
      type: 'meta_title',
      severity: 'warning',
      message: 'Meta title is too short (< 30 characters)',
      fix: 'Expand title to 50-60 characters',
      impact: 5,
    });
    score -= 5;
  } else if (metaTitle.length > 60) {
    issues.push({
      type: 'meta_title',
      severity: 'warning',
      message: 'Meta title is too long (> 60 characters)',
      fix: 'Shorten title to 50-60 characters',
      impact: 5,
    });
    score -= 5;
  } else {
    strengths.push('Meta title length is optimal (30-60 characters)');
  }
  
  // Check if primary keyword is in title
  const primaryKeyword = content.keywords[0];
  if (primaryKeyword && !metaTitle.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    issues.push({
      type: 'meta_title',
      severity: 'warning',
      message: `Primary keyword "${primaryKeyword}" not in title`,
      impact: 5,
    });
    score -= 5;
  } else if (primaryKeyword) {
    strengths.push('Primary keyword appears in title');
  }
  
  // 2. Analyze Meta Description (10 points)
  const metaDescription = content.description || content.excerpt || '';
  if (!metaDescription) {
    issues.push({
      type: 'meta_description',
      severity: 'error',
      message: 'Meta description is missing',
      impact: 10,
    });
    score -= 10;
  } else if (metaDescription.length < 120) {
    issues.push({
      type: 'meta_description',
      severity: 'warning',
      message: 'Meta description is too short (< 120 characters)',
      fix: 'Expand description to 150-160 characters',
      impact: 5,
    });
    score -= 5;
  } else if (metaDescription.length > 160) {
    issues.push({
      type: 'meta_description',
      severity: 'info',
      message: 'Meta description is too long (> 160 characters)',
      fix: 'Shorten description to 150-160 characters',
      impact: 3,
    });
    score -= 3;
  } else {
    strengths.push('Meta description length is optimal (120-160 characters)');
  }
  
  // 3. Analyze Content Length (10 points)
  const plainText = stripHtml(content.content);
  const wordCount = countWords(plainText);
  if (wordCount < 300) {
    issues.push({
      type: 'content',
      severity: 'error',
      message: `Content is too short (${wordCount} words, recommended 800+)`,
      impact: 10,
    });
    score -= 10;
  } else if (wordCount < 800) {
    issues.push({
      type: 'content',
      severity: 'warning',
      message: `Content could be longer (${wordCount} words, recommended 800+)`,
      impact: 5,
    });
    score -= 5;
  } else {
    strengths.push(`Good content length (${wordCount} words)`);
  }
  
  // 4. Analyze Heading Structure (15 points)
  const headings = analyzeHeadings(content.content);
  if (headings.h1Count === 0) {
    issues.push({
      type: 'headings',
      severity: 'error',
      message: 'No H1 heading found',
      impact: 8,
    });
    score -= 8;
  } else if (headings.h1Count > 1) {
    issues.push({
      type: 'headings',
      severity: 'warning',
      message: `Multiple H1 headings found (${headings.h1Count})`,
      fix: 'Use only one H1 heading per page',
      impact: 5,
    });
    score -= 5;
  } else {
    strengths.push('Proper H1 usage (exactly one H1)');
  }
  
  if (headings.h2Count === 0) {
    issues.push({
      type: 'headings',
      severity: 'warning',
      message: 'No H2 headings found',
      fix: 'Add H2 headings to structure your content',
      impact: 4,
    });
    score -= 4;
  } else if (headings.h2Count >= 2) {
    strengths.push(`Good use of H2 headings (${headings.h2Count})`);
  }
  
  // 5. Analyze Keyword Density (15 points)
  const keywordAnalysis = analyzeKeywordDensity(plainText, content.keywords);
  keywordAnalysis.forEach((kw) => {
    if (kw.density < 0.5) {
      issues.push({
        type: 'keywords',
        severity: 'warning',
        message: `Keyword "${kw.keyword}" density too low (${kw.density.toFixed(1)}%, recommended 1-2%)`,
        impact: 3,
      });
      score -= 3;
    } else if (kw.density > 3) {
      issues.push({
        type: 'keywords',
        severity: 'warning',
        message: `Keyword "${kw.keyword}" density too high (${kw.density.toFixed(1)}%, recommended 1-2%)`,
        fix: 'Reduce keyword usage to avoid over-optimization',
        impact: 3,
      });
      score -= 3;
    } else {
      strengths.push(`Good keyword density for "${kw.keyword}" (${kw.density.toFixed(1)}%)`);
    }
  });
  
  // 6. Analyze Images (10 points)
  const images = extractImages(content.content);
  const imagesWithoutAlt = images.filter((img) => !img.alt || img.alt.trim() === '');
  if (images.length > 0 && imagesWithoutAlt.length > 0) {
    issues.push({
      type: 'images',
      severity: 'warning',
      message: `${imagesWithoutAlt.length} image(s) without alt text`,
      fix: 'Add descriptive alt text to all images',
      impact: 5,
    });
    score -= 5;
  } else if (images.length > 0) {
    strengths.push('All images have alt text');
  }
  
  // 7. Analyze Internal Links (10 points)
  const links = extractLinks(content.content);
  const internalLinks = links.filter((link) => link.internal);
  if (internalLinks.length === 0) {
    issues.push({
      type: 'links',
      severity: 'info',
      message: 'No internal links found',
      fix: 'Add 2-3 internal links to related content',
      impact: 5,
    });
    score -= 5;
  } else if (internalLinks.length >= 2) {
    strengths.push(`Good internal linking (${internalLinks.length} links)`);
  }
  
  // 8. Analyze Readability (10 points)
  const readability = analyzeReadability(plainText);
  if (readability.fleschKincaid < 60) {
    issues.push({
      type: 'content',
      severity: 'info',
      message: `Content is difficult to read (score: ${readability.fleschKincaid}/100)`,
      fix: 'Simplify sentences and use shorter words',
      impact: 5,
    });
    score -= 5;
  } else if (readability.fleschKincaid >= 70) {
    strengths.push(`Excellent readability (score: ${readability.fleschKincaid}/100)`);
  }
  
  // 9. Analyze URL/Slug (5 points)
  if (!content.slug || content.slug.length === 0) {
    issues.push({
      type: 'meta_title',
      severity: 'error',
      message: 'URL slug is missing',
      impact: 5,
    });
    score -= 5;
  } else if (content.slug.length > 75) {
    issues.push({
      type: 'meta_title',
      severity: 'info',
      message: 'URL slug is too long',
      fix: 'Keep URL slug under 75 characters',
      impact: 2,
    });
    score -= 2;
  } else if (primaryKeyword && content.slug.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    strengths.push('Primary keyword in URL slug');
  }
  
  // Ensure score doesn't go below 0
  score = Math.max(0, Math.min(100, score));
  
  // Generate recommendations
  if (score < 80) {
    recommendations.push('Focus on addressing high-impact issues first');
  }
  if (wordCount < 800) {
    recommendations.push('Expand content to at least 800 words');
  }
  if (internalLinks.length < 2) {
    recommendations.push('Add 2-3 internal links to related content');
  }
  if (images.length === 0) {
    recommendations.push('Add relevant images to improve engagement');
  }
  
  return {
    score,
    issues,
    warnings,
    recommendations,
    strengths,
    readability,
    keywords: keywordAnalysis,
    headings,
    meta: {
      titleLength: metaTitle.length,
      titleOptimal: metaTitle.length >= 30 && metaTitle.length <= 60,
      descriptionLength: metaDescription.length,
      descriptionOptimal: metaDescription.length >= 120 && metaDescription.length <= 160,
      hasKeywordInTitle: primaryKeyword ? metaTitle.toLowerCase().includes(primaryKeyword.toLowerCase()) : false,
      hasKeywordInDescription: primaryKeyword ? metaDescription.toLowerCase().includes(primaryKeyword.toLowerCase()) : false,
    },
  };
}

/**
 * Analyze readability using Flesch-Kincaid algorithm
 */
export function analyzeReadability(text: string): ReadabilityScore {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  const sentenceCount = sentences.length || 1;
  const wordCount = words.length || 1;
  const syllableCount = syllables;
  
  // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
  const fleschKincaid = 206.835
    - 1.015 * (wordCount / sentenceCount)
    - 84.6 * (syllableCount / wordCount);
  
  let grade = 'Unknown';
  if (fleschKincaid >= 90) grade = 'Very Easy (5th grade)';
  else if (fleschKincaid >= 80) grade = 'Easy (6th grade)';
  else if (fleschKincaid >= 70) grade = 'Fairly Easy (7th grade)';
  else if (fleschKincaid >= 60) grade = 'Standard (8th-9th grade)';
  else if (fleschKincaid >= 50) grade = 'Fairly Difficult (10th-12th grade)';
  else if (fleschKincaid >= 30) grade = 'Difficult (College)';
  else grade = 'Very Difficult (College graduate)';
  
  return {
    fleschKincaid: Math.max(0, Math.min(100, Math.round(fleschKincaid))),
    grade,
    readingTime: Math.ceil(wordCount / 200), // Assuming 200 words per minute
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(wordCount / sentenceCount),
  };
}

/**
 * Analyze keyword density
 */
export function analyzeKeywordDensity(text: string, keywords: string[]): KeywordAnalysis[] {
  const lowercaseText = text.toLowerCase();
  const wordCount = countWords(text);
  
  if (wordCount === 0) return [];
  
  return keywords.map((keyword) => {
    const lowercaseKeyword = keyword.toLowerCase();
    const regex = new RegExp(`\\b${escapeRegex(lowercaseKeyword)}\\b`, 'gi');
    const matches = lowercaseText.match(regex) || [];
    const count = matches.length;
    const density = (count / wordCount) * 100;
    const optimal = density >= 0.5 && density <= 3;
    
    // Find positions
    const positions: number[] = [];
    let match;
    const regexExec = new RegExp(`\\b${escapeRegex(lowercaseKeyword)}\\b`, 'gi');
    while ((match = regexExec.exec(lowercaseText)) !== null) {
      positions.push(match.index);
    }
    
    return {
      keyword,
      count,
      density,
      optimal,
      positions,
    };
  });
}

/**
 * Analyze heading structure
 */
export function analyzeHeadings(html: string): HeadingAnalysis {
  const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>.*?<\/h2>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>.*?<\/h3>/gi) || [];
  const h4Matches = html.match(/<h4[^>]*>.*?<\/h4>/gi) || [];
  
  const h1Count = h1Matches.length;
  const h2Count = h2Matches.length;
  const h3Count = h3Matches.length;
  const h4Count = h4Matches.length;
  
  const issues: string[] = [];
  let structure: 'excellent' | 'good' | 'poor' = 'excellent';
  
  if (h1Count === 0) {
    issues.push('Missing H1 heading');
    structure = 'poor';
  } else if (h1Count > 1) {
    issues.push('Multiple H1 headings');
    structure = 'good';
  }
  
  if (h2Count === 0) {
    issues.push('No H2 headings');
    if (structure === 'excellent') structure = 'good';
  }
  
  if (h2Count > 0 && h3Count > h2Count * 3) {
    issues.push('Too many H3 headings relative to H2');
  }
  
  return {
    h1Count,
    h2Count,
    h3Count,
    h4Count,
    structure,
    issues,
  };
}

// Helper functions
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractImages(html: string): Array<{ src: string; alt: string }> {
  const regex = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
  const images: Array<{ src: string; alt: string }> = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    images.push({ src: match[1], alt: match[2] || '' });
  }
  return images;
}

function extractLinks(html: string): Array<{ href: string; internal: boolean; text: string }> {
  const regex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
  const links: Array<{ href: string; internal: boolean; text: string }> = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const internal = href.startsWith('/') || href.includes(process.env.NEXT_PUBLIC_SITE_URL || '');
    links.push({ href, internal, text: stripHtml(match[2]) });
  }
  return links;
}

