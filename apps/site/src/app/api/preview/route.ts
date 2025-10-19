import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPreview } from '@khaledaun/utils/preview';

/**
 * Preview API Route for Phase 6 Full
 * GET /api/preview?id=<postId>&locale=<en|ar>&token=<signed>
 * Enables draft mode and redirects to preview the post in specified locale
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const locale = searchParams.get('locale') || 'en';
  const token = searchParams.get('token');
  
  // Validate required parameters
  if (!id) {
    return new NextResponse('Missing id parameter', { status: 400 });
  }
  
  // Validate locale
  if (locale !== 'en' && locale !== 'ar') {
    return new NextResponse('Invalid locale. Must be "en" or "ar"', { status: 400 });
  }
  
  // Verify signed token
  if (!token) {
    return new NextResponse('Missing token parameter', { status: 401 });
  }
  
  const payload = verifyPreview(token);
  
  if (!payload) {
    return new NextResponse('Invalid or expired token', { status: 401 });
  }
  
  // Verify payload matches request
  if (payload.id !== id) {
    return new NextResponse('Token mismatch: ID does not match', { status: 401 });
  }
  
  if (payload.locale && payload.locale !== locale) {
    return new NextResponse('Token mismatch: Locale does not match', { status: 401 });
  }
  
  // Enable Draft Mode
  draftMode().enable();
  
  // Redirect to the blog post preview in correct locale
  const redirectUrl = new URL(`/${locale}/blog/preview/${id}`, request.url);
  redirectUrl.searchParams.set('preview', '1');
  
  return NextResponse.redirect(redirectUrl);
}

