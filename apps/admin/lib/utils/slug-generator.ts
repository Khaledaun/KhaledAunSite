/**
 * Smart Slug Generator
 * Creates SEO-friendly URL slugs from titles
 */

/**
 * Generate a URL-friendly slug from a title
 * @param title - The content title
 * @param maxLength - Maximum slug length (default: 60)
 * @returns SEO-friendly slug
 */
export function generateSlug(title: string, maxLength: 60): string {
  if (!title) return '';

  let slug = title
    // Convert to lowercase
    .toLowerCase()
    // Remove apostrophes
    .replace(/['']/g, '')
    // Replace spaces and special chars with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-');

  // Truncate to max length at word boundary
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove trailing partial word
    const lastHyphen = slug.lastIndexOf('-');
    if (lastHyphen > 0) {
      slug = slug.substring(0, lastHyphen);
    }
  }

  return slug;
}

/**
 * Validate if a slug is SEO-friendly
 * @param slug - The slug to validate
 * @returns Validation result with errors
 */
export function validateSlug(slug: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!slug) {
    errors.push('Slug is required');
    return { valid: false, errors, warnings };
  }

  // Check length
  if (slug.length < 3) {
    errors.push('Slug is too short (minimum 3 characters)');
  }

  if (slug.length > 60) {
    warnings.push('Slug is longer than recommended (60 characters)');
  }

  // Check format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
  }

  // Check for leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Slug cannot start or end with a hyphen');
  }

  // Check for consecutive hyphens
  if (slug.includes('--')) {
    warnings.push('Slug contains consecutive hyphens');
  }

  // Check for numbers-only
  if (/^[0-9-]+$/.test(slug)) {
    warnings.push('Slug should contain some words, not just numbers');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate a unique slug by appending a number if needed
 * @param baseSlug - The base slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Extract keywords from a title for SEO
 * @param title - The content title
 * @returns Array of keywords
 */
export function extractKeywordsFromTitle(title: string): string[] {
  // Common stop words to ignore
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'how', 'what', 'when', 'where', 'why', 'who',
  ]);

  return title
    .toLowerCase()
    // Remove special characters except spaces
    .replace(/[^a-z0-9\s]/g, '')
    // Split into words
    .split(/\s+/)
    // Filter out stop words and short words
    .filter(word => word.length > 3 && !stopWords.has(word))
    // Remove duplicates
    .filter((word, index, self) => self.indexOf(word) === index)
    // Take top 5
    .slice(0, 5);
}

/**
 * Optimize slug for SEO
 * @param slug - The slug to optimize
 * @param keywords - Optional keywords to include
 * @returns Optimized slug
 */
export function optimizeSlugForSEO(
  slug: string,
  keywords?: string[]
): string {
  if (!keywords || keywords.length === 0) {
    return slug;
  }

  // Check if slug already contains the primary keyword
  const primaryKeyword = keywords[0].toLowerCase().replace(/\s+/g, '-');
  
  if (!slug.includes(primaryKeyword)) {
    // Try to prepend primary keyword if it won't make slug too long
    const optimizedSlug = `${primaryKeyword}-${slug}`;
    if (optimizedSlug.length <= 60) {
      return optimizedSlug;
    }
  }

  return slug;
}

/**
 * Preview what a slug will look like as a full URL
 * @param slug - The slug
 * @param baseUrl - Base URL (default: current site)
 * @returns Full URL preview
 */
export function previewSlugUrl(
  slug: string,
  baseUrl: string = 'https://khaledaun.com'
): string {
  return `${baseUrl}/blog/${slug}`;
}

