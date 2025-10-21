import { load } from 'cheerio';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
  details: {
    wordCount: number;
    readabilityScore: number;
    imageCount: number;
    linkCount: number;
    headingStructure: {
      h1: number;
      h2: number;
      h3: number;
    };
  };
}

export interface PostContent {
  title: string;
  excerpt?: string;
  content: string;
  featuredImageId?: string;
  locale: string;
}

/**
 * Validates post content for SEO, readability, and accessibility
 */
export async function validatePost(post: PostContent): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Load content with Cheerio for parsing
  const $ = load(post.content);
  const textContent = $.text();
  
  // Calculate word count
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // 1. Title validation
  if (post.title.length < 10) {
    errors.push('Title too short (minimum 10 characters)');
    score -= 20;
  } else if (post.title.length > 70) {
    warnings.push('Title too long for SEO (recommended: 50-60 characters)');
    score -= 5;
  }

  if (!post.title.trim()) {
    errors.push('Title cannot be empty');
    score -= 30;
  }

  // 2. Excerpt validation
  if (!post.excerpt || post.excerpt.length < 50) {
    warnings.push('Excerpt missing or too short (recommended: 120-160 characters for SEO)');
    score -= 10;
  } else if (post.excerpt.length > 160) {
    warnings.push('Excerpt too long (recommended: 120-160 characters)');
    score -= 5;
  }

  // 3. Content length validation
  if (wordCount < 300) {
    warnings.push(
      `Content too short (${wordCount} words, recommended: 300+ words for SEO)`
    );
    score -= 15;
  }

  if (wordCount === 0) {
    errors.push('Content cannot be empty');
    score -= 40;
  }

  // 4. Image validation
  const images = $('img');
  const imageCount = images.length;

  if (imageCount === 0) {
    warnings.push('No images in content (images improve engagement)');
    score -= 10;
  }

  // Check image alt text
  let missingAltCount = 0;
  images.each((i, img) => {
    const alt = $(img).attr('alt');
    if (!alt || alt.trim() === '') {
      missingAltCount++;
    }
  });

  if (missingAltCount > 0) {
    errors.push(
      `${missingAltCount} image(s) missing alt text (accessibility and SEO issue)`
    );
    score -= missingAltCount * 5;
  }

  // 5. Featured image check
  if (!post.featuredImageId) {
    warnings.push('No featured image set (recommended for social sharing)');
    score -= 10;
  }

  // 6. Link validation
  const links = $('a[href]');
  const linkCount = links.length;
  const externalLinks: string[] = [];

  links.each((i, link) => {
    const href = $(link).attr('href');
    if (href && href.startsWith('http')) {
      externalLinks.push(href);
    }
  });

  // Note: Skipping actual link checking to avoid network calls in validation
  // This could be done asynchronously in a background job

  // 7. Heading structure validation
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  if (h1Count > 1) {
    errors.push('Multiple H1 headings found (SEO issue - should only have one H1)');
    score -= 10;
  }

  if (h2Count === 0 && wordCount > 500) {
    warnings.push('No H2 headings (improves readability and SEO)');
    score -= 5;
  }

  // 8. Readability check (Flesch Reading Ease approximation)
  const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  const syllables = estimateSyllables(textContent);
  
  // Flesch Reading Ease formula
  const fleschScore =
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);

  let readabilityScore = fleschScore;

  if (fleschScore < 30) {
    warnings.push(
      'Content may be very difficult to read (consider simpler language)'
    );
    score -= 10;
  } else if (fleschScore < 50) {
    warnings.push('Content may be difficult to read');
    score -= 5;
  }

  // 9. Paragraph length check
  const paragraphs = $('p');
  let longParagraphCount = 0;
  
  paragraphs.each((i, p) => {
    const text = $(p).text();
    const pWords = text.split(/\s+/).length;
    if (pWords > 150) {
      longParagraphCount++;
    }
  });

  if (longParagraphCount > 0) {
    warnings.push(
      `${longParagraphCount} paragraph(s) are very long (consider breaking up for readability)`
    );
    score -= 3;
  }

  // 10. List usage check
  const lists = $('ul, ol');
  if (lists.length === 0 && wordCount > 800) {
    warnings.push('No lists found (lists improve scannability)');
    score -= 3;
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, Math.min(100, score)),
    details: {
      wordCount,
      readabilityScore,
      imageCount,
      linkCount,
      headingStructure: {
        h1: h1Count,
        h2: h2Count,
        h3: h3Count,
      },
    },
  };
}

/**
 * Estimates syllable count for readability calculation
 */
function estimateSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let syllableCount = 0;

  for (const word of words) {
    // Skip empty words
    if (word.length === 0) continue;

    // Count vowel groups
    const vowels = word.match(/[aeiouy]+/g);
    const vowelGroupCount = vowels ? vowels.length : 0;

    // Adjust for common patterns
    let syllables = vowelGroupCount;

    // Silent 'e' at end
    if (word.endsWith('e')) {
      syllables--;
    }

    // Minimum 1 syllable per word
    syllables = Math.max(1, syllables);

    syllableCount += syllables;
  }

  return syllableCount;
}

/**
 * Quick validation for form fields (before full validation)
 */
export function quickValidate(title: string, content: string): string[] {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (title && title.length < 10) {
    errors.push('Title must be at least 10 characters');
  }

  const $ = load(content);
  const textContent = $.text();
  const wordCount = textContent.split(/\s+/).filter((w) => w.length > 0).length;

  if (wordCount < 50) {
    errors.push('Content must be at least 50 words');
  }

  return errors;
}

export default { validatePost, quickValidate };



