import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPreview } from '@khaledaun/utils/preview';

/**
 * Preview API Route for Phase 6 Lite
 * GET /api/preview?id=<postId>&token=<optional>
 * Enables draft mode and redirects to preview the post
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const token = searchParams.get('token');
  
  // Validate required parameters
  if (!id) {
    return new NextResponse('Missing id parameter', { status: 400 });
  }
  
  // Production: verify signed token
  if (process.env.NODE_ENV === 'production') {
    if (!token) return new NextResponse('Unauthorized', { status: 401 });
    const payload = verifyPreview(token);
    if (!payload || payload.id !== id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }
  
  // Enable Draft Mode
  draftMode().enable();
  
  // Redirect to the blog post preview
  // Note: For Phase 6 Lite, we preview by ID, not slug
  const redirectUrl = new URL(`/en/blog/preview/${id}`, request.url);
  redirectUrl.searchParams.set('preview', '1');
  
  return NextResponse.redirect(redirectUrl);
}

