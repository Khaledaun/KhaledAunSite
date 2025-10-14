import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@khaledaun/auth';
import { prisma } from '@khaledaun/db';
import { generatePreviewUrl } from '@khaledaun/utils/preview';

/**
 * GET /api/admin/posts/[id]/preview-url
 * Generate a signed preview URL for a draft post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, status: true }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Generate signed preview URL (valid for 60 minutes)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const previewUrl = generatePreviewUrl(post.id, siteUrl, 60);
    
    return NextResponse.json({
      previewUrl,
      expiresIn: 3600, // seconds
      post: {
        id: post.id,
        title: post.title,
        status: post.status
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
      }
    }
    
    console.error('Error generating preview URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

