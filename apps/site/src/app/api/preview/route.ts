import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
  
  // Phase 6 Lite: Simple token validation (optional)
  // In production, verify token against a server secret or session
  // For now, we'll allow preview in development mode or with any token
  const isAuthorized = process.env.NODE_ENV === 'development' || token;
  
  if (!isAuthorized) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Enable Draft Mode
  draftMode().enable();
  
  // Redirect to the blog post preview
  // Note: For Phase 6 Lite, we preview by ID, not slug
  const redirectUrl = new URL(`/en/blog/preview/${id}`, request.url);
  redirectUrl.searchParams.set('preview', '1');
  
  return NextResponse.redirect(redirectUrl);
}

