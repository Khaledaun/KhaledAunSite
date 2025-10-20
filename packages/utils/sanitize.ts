import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize social media embed HTML
 * Phase 8 Full: Strict allowlist for security
 * 
 * Allowed: iframe, div, span, p, a with specific attributes
 * Blocked: script, style, onclick, onerror, etc.
 */
export function sanitizeSocialEmbed(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'iframe',
      'div',
      'span',
      'p',
      'a',
      'blockquote',
      'section',
      'article',
    ],
    allowedAttributes: {
      iframe: [
        'src',
        'width',
        'height',
        'frameborder',
        'allow',
        'allowfullscreen',
        'title',
        'style',
        'class',
      ],
      a: [
        'href',
        'target',
        'rel',
        'class',
      ],
      div: [
        'class',
        'id',
        'data-*',
        'style',
      ],
      span: [
        'class',
        'id',
        'data-*',
      ],
      p: [
        'class',
        'id',
      ],
      blockquote: [
        'class',
        'cite',
        'data-*',
      ],
      section: [
        'class',
        'id',
      ],
      article: [
        'class',
        'id',
      ],
    },
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {
      iframe: ['http', 'https'],
    },
    allowVulnerableTags: false,
    // Drop scripts and dangerous tags entirely
    disallowedTagsMode: 'discard',
    // Explicitly disallow script-like attributes
    parser: {
      decodeEntities: true,
    },
  });
}

/**
 * Validate embed key format
 * Must be uppercase letters, numbers, and underscores only
 */
export function validateEmbedKey(key: string): boolean {
  return /^[A-Z0-9_]+$/.test(key);
}

