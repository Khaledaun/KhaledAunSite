import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, requirePermission } from '@khaledaun/auth';
import { prisma } from '@khaledaun/db';

/**
 * POST /api/admin/posts/[id]/publish
 * Publish a post (sets status to PUBLISHED, publishedAt to now, triggers ISR)
 * Phase 6 Full: EDITOR+ can publish
 */
export async function POST(
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
    
    // Check permission: EDITOR+ can publish
    requirePermission(user, 'publish');
    
    // Check if post exists and is in DRAFT status
    const existing = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        translations: true
      }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    if (existing.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Post is already published' },
        { status: 400 }
      );
    }
    
    // Phase 6 Full: Check for AR requirement
    const requireAR = process.env.REQUIRE_AR_FOR_PUBLISH === 'true';
    const hasEN = existing.translations.some(t => t.locale === 'en');
    const hasAR = existing.translations.some(t => t.locale === 'ar');
    
    if (!hasEN) {
      return NextResponse.json(
        { error: 'English translation is required before publishing' },
        { status: 400 }
      );
    }
    
    if (requireAR && !hasAR) {
      return NextResponse.json(
        { error: 'Arabic translation is required before publishing (REQUIRE_AR_FOR_PUBLISH is enabled)' },
        { status: 400 }
      );
    }
    
    // Publish post
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      include: {
        author: {
          select: { id: true, email: true, name: true }
        },
        translations: {
          select: { locale: true, slug: true }
        }
      }
    });
    
    // Create audit trail
    await prisma.audit.create({
      data: {
        entity: 'Post',
        entityId: post.id,
        action: 'PUBLISH',
        payload: {
          title: post.title,
          slug: post.slug,
          publishedAt: post.publishedAt
        },
        actorId: user.id
      }
    });
    
    // Phase 6 Full: Trigger ISR revalidation for each translation
    try {
      // Revalidate each translation's slug individually
      for (const translation of post.translations) {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidate-secret': process.env.REVALIDATE_SECRET || 'dev-secret'
          },
          body: JSON.stringify({ 
            locale: translation.locale, 
            slug: translation.slug 
          })
        });
      }
    } catch (revalidateError) {
      console.error('Error triggering revalidation:', revalidateError);
      // Don't fail the publish if revalidation fails
    }
    
    return NextResponse.json({ 
      post,
      message: 'Post published successfully' 
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
    
    console.error('Error publishing post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

