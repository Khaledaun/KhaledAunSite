/**
 * Site Configuration Utility
 *
 * Controls whether the site operates in "personal" or "firm" mode.
 * In production, this can be configured via:
 * 1. Environment variable: NEXT_PUBLIC_SITE_MODE
 * 2. Database SiteConfig table
 *
 * Site Modes:
 * - "personal": Original personal website (khaledaun.com)
 * - "firm": NAS & Co. law firm website (nas-law.com)
 * - "dual": Both sites accessible (personal at /, firm at /firm)
 */

// Valid site modes
export const SITE_MODES = {
  PERSONAL: 'personal',
  FIRM: 'firm',
  DUAL: 'dual',
};

/**
 * Get the current site mode from environment
 * Default is "dual" to allow both sites to coexist during development
 */
export function getSiteMode() {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE || SITE_MODES.DUAL;

  if (!Object.values(SITE_MODES).includes(mode)) {
    console.warn(`Invalid SITE_MODE "${mode}", falling back to "dual"`);
    return SITE_MODES.DUAL;
  }

  return mode;
}

/**
 * Check if the firm site is enabled
 */
export function isFirmEnabled() {
  const mode = getSiteMode();
  return mode === SITE_MODES.FIRM || mode === SITE_MODES.DUAL;
}

/**
 * Check if the personal site is enabled
 */
export function isPersonalEnabled() {
  const mode = getSiteMode();
  return mode === SITE_MODES.PERSONAL || mode === SITE_MODES.DUAL;
}

/**
 * Get the default homepage path for the current mode
 */
export function getDefaultHomePath(locale = 'en') {
  const mode = getSiteMode();

  switch (mode) {
    case SITE_MODES.FIRM:
      return `/${locale}/firm`;
    case SITE_MODES.PERSONAL:
      return `/${locale}`;
    case SITE_MODES.DUAL:
    default:
      return `/${locale}`;
  }
}

/**
 * Get site metadata based on current mode
 */
export function getSiteMetadata(locale = 'en') {
  const mode = getSiteMode();

  if (mode === SITE_MODES.FIRM) {
    return {
      name: locale === 'he' ? 'נאשף, עון, שאבאן ושות\'' :
            locale === 'ar' ? 'ناشف، عون، شعبان وشركاه' :
            'NAS & Co.',
      description: locale === 'he' ? 'משרד עורכי דין בוטיק ושותף משפטי לחברות, תאגידים, משקיעים ויזמים' :
                   locale === 'ar' ? 'مكتب محاماة بوتيك وشريك قانوني للشركات والمستثمرين ورجال الأعمال' :
                   'A boutique law firm and legal partner for companies, corporations, investors and entrepreneurs',
      domain: 'nas-law.com',
    };
  }

  return {
    name: locale === 'ar' ? 'خالد عون' : 'Khaled Aun',
    description: locale === 'ar' ? 'محامي ومستشار قانوني' : 'Attorney & Legal Consultant',
    domain: 'khaledaun.com',
  };
}

/**
 * Configuration for redirects when site mode changes
 * Use this in middleware for production deployment
 */
export const SITE_REDIRECTS = {
  // When in firm-only mode, redirect personal pages to firm
  [SITE_MODES.FIRM]: {
    from: /^\/[a-z]{2}(?!\/firm)/,
    to: (locale) => `/${locale}/firm`,
  },
  // When in personal-only mode, redirect firm pages to personal
  [SITE_MODES.PERSONAL]: {
    from: /^\/[a-z]{2}\/firm/,
    to: (locale) => `/${locale}`,
  },
};
