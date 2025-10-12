import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Revalidation API for Phase 6 Lite
 * POST /api/revalidate
 * Body: { slug: string }
 * Headers: x-revalidate-secret: <secret>
 */
export async function POST(request: NextRequest) {
  try {
    // Verify secret (in production, always validate this)
    const secret = request.headers.get('x-revalidate-secret');
    const expectedSecret = process.env.REVALIDATE_SECRET || 'dev-secret';
    
    if (secret !== expectedSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { slug } = body;
    
    // Revalidate the blog index
    revalidatePath('/en/blog');
    revalidatePath('/ar/blog');
    
    // Revalidate the specific post if slug is provided
    if (slug) {
      revalidatePath(`/en/blog/${slug}`);
      revalidatePath(`/ar/blog/${slug}`);
    }
    
    return NextResponse.json({ 
      revalidated: true,
      paths: slug 
        ? ['/en/blog', '/ar/blog', `/en/blog/${slug}`, `/ar/blog/${slug}`]
        : ['/en/blog', '/ar/blog']
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    );
  }
}

