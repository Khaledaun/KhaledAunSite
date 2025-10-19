import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@khaledaun/auth';
import { signPreview } from '@khaledaun/utils/preview';

/**
 * GET /api/admin/posts/[id]/preview-url
 * Generate a signed preview URL for a post
 * Phase 6 Full: Supports ?locale=en|ar parameter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    if (locale !== 'en' && locale !== 'ar') {
      return NextResponse.json(
        { error: 'Invalid locale. Must be "en" or "ar"' },
        { status: 400 }
      );
    }
    
    // Generate signed token with locale
    const token = signPreview({ 
      id: params.id,
      locale,
      exp: Date.now() + 3600000 // 1 hour
    });
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const previewUrl = `${siteUrl}/api/preview?id=${params.id}&locale=${locale}&token=${token}`;
    
    return NextResponse.json({ previewUrl });
  } catch (error) {
    console.error('Error generating preview URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
