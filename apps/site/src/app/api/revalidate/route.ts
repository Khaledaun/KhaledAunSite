import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Revalidation API for Phase 6 Full
 * POST /api/revalidate
 * Supports multiple body formats:
 *   { path: '/en/blog/post-slug' } - Specific path
 *   { locale: 'en', slug: 'post-slug' } - Per-locale slug
 *   { slug: 'post-slug' } - Both locales (backward compat)
 * Headers: x-reval-secret: <secret>
 */
export async function POST(request: NextRequest) {
  try {
    // Verify secret
    const secret = request.headers.get('x-reval-secret');
    const expectedSecret = process.env.REVALIDATE_SECRET;
    
    if (!expectedSecret) {
      console.error('REVALIDATE_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (secret !== expectedSecret) {
      console.warn('Invalid revalidation secret attempt');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid secret' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const revalidatedPaths: string[] = [];
    
    // Format 1: Specific path
    if (body.path) {
      revalidatePath(body.path);
      revalidatedPaths.push(body.path);
    }
    // Format 2: Per-locale slug
    else if (body.locale && body.slug) {
      const locale = body.locale;
      if (locale !== 'en' && locale !== 'ar') {
        return NextResponse.json(
          { error: 'Invalid locale. Must be "en" or "ar"' },
          { status: 400 }
        );
      }
      
      // Revalidate blog index for this locale
      revalidatePath(`/${locale}/blog`);
      revalidatedPaths.push(`/${locale}/blog`);
      
      // Revalidate specific post
      revalidatePath(`/${locale}/blog/${body.slug}`);
      revalidatedPaths.push(`/${locale}/blog/${body.slug}`);
    }
    // Format 3: Slug only (backward compat - both locales)
    else if (body.slug) {
      // Revalidate blog indices
      revalidatePath('/en/blog');
      revalidatePath('/ar/blog');
      revalidatedPaths.push('/en/blog', '/ar/blog');
      
      // Revalidate specific post in both locales
      revalidatePath(`/en/blog/${body.slug}`);
      revalidatePath(`/ar/blog/${body.slug}`);
      revalidatedPaths.push(`/en/blog/${body.slug}`, `/ar/blog/${body.slug}`);
    }
    // No valid format provided
    else {
      return NextResponse.json(
        { error: 'Invalid body. Provide either: { path }, { locale, slug }, or { slug }' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      revalidated: true,
      paths: revalidatedPaths
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    );
  }
}

