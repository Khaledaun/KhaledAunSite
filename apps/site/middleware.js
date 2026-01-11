import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

// Site mode configuration
const SITE_MODE = process.env.NEXT_PUBLIC_SITE_MODE || 'dual';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'ar', 'he'],
  defaultLocale: 'en',
  localePrefix: 'always' // Always show locale in URL for clear separation
});

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // Handle site mode redirects
  if (SITE_MODE === 'firm') {
    // In firm-only mode, redirect root to /firm
    const localeMatch = pathname.match(/^\/([a-z]{2})$/);
    if (localeMatch) {
      const locale = localeMatch[1];
      if (['en', 'ar', 'he'].includes(locale)) {
        return NextResponse.redirect(new URL(`/${locale}/firm`, request.url));
      }
    }
  } else if (SITE_MODE === 'personal') {
    // In personal-only mode, redirect /firm to root
    const firmMatch = pathname.match(/^\/([a-z]{2})\/firm/);
    if (firmMatch) {
      const locale = firmMatch[1];
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  // Continue with intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all routes except API routes, Next.js internals, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

