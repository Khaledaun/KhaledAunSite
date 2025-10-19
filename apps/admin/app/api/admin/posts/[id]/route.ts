import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, requirePermission } from '@khaledaun/auth';
import { prisma } from '@khaledaun/db';
import { ZodError } from 'zod';

/**
 * GET /api/admin/posts/[id]
 * Get a single post by ID with all translations
 * Phase 6 Full: Returns translations array
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, email: true, name: true }
        },
        translations: {
          orderBy: { locale: 'asc' }
        }
      }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Check permission: AUTHOR can only edit own posts
    requirePermission(user, 'editPost', post);
    
    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/posts/[id]
 * Update post translations
 * Phase 6 Full: Upserts translations for EN/AR
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { translations } = body;
    
    if (!translations || (!translations.en && !translations.ar)) {
      return NextResponse.json(
        { error: 'At least one translation (EN or AR) is required' },
        { status: 400 }
      );
    }
    
    // Check if post exists
    const existing = await prisma.post.findUnique({
      where: { id: params.id },
      include: { translations: true }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Check permission: AUTHOR can only edit own posts
    requirePermission(user, 'editPost', existing);
    
    // Check for slug collisions per locale
    if (translations.en?.slug) {
      const enCollision = await prisma.postTranslation.findFirst({
        where: {
          locale: 'en',
          slug: translations.en.slug,
          postId: { not: params.id }
        }
      });
      
      if (enCollision) {
        return NextResponse.json(
          { error: 'English slug already exists', field: 'en.slug' },
          { status: 409 }
        );
      }
    }
    
    if (translations.ar?.slug) {
      const arCollision = await prisma.postTranslation.findFirst({
        where: {
          locale: 'ar',
          slug: translations.ar.slug,
          postId: { not: params.id }
        }
      });
      
      if (arCollision) {
        return NextResponse.json(
          { error: 'Arabic slug already exists', field: 'ar.slug' },
          { status: 409 }
        );
      }
    }
    
    // Upsert translations
    const upsertOperations = [];
    
    if (translations.en && translations.en.title && translations.en.content) {
      upsertOperations.push(
        prisma.postTranslation.upsert({
          where: {
            postId_locale: {
              postId: params.id,
              locale: 'en'
            }
          },
          create: {
            postId: params.id,
            locale: 'en',
            title: translations.en.title,
            slug: translations.en.slug,
            excerpt: translations.en.excerpt || null,
            content: translations.en.content
          },
          update: {
            title: translations.en.title,
            slug: translations.en.slug,
            excerpt: translations.en.excerpt || null,
            content: translations.en.content
          }
        })
      );
    }
    
    if (translations.ar && translations.ar.title && translations.ar.content) {
      upsertOperations.push(
        prisma.postTranslation.upsert({
          where: {
            postId_locale: {
              postId: params.id,
              locale: 'ar'
            }
          },
          create: {
            postId: params.id,
            locale: 'ar',
            title: translations.ar.title,
            slug: translations.ar.slug,
            excerpt: translations.ar.excerpt || null,
            content: translations.ar.content
          },
          update: {
            title: translations.ar.title,
            slug: translations.ar.slug,
            excerpt: translations.ar.excerpt || null,
            content: translations.ar.content
          }
        })
      );
    }
    
    await Promise.all(upsertOperations);
    
    // Fetch updated post
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, email: true, name: true }
        },
        translations: true
      }
    });
    
    // Create audit trail
    await prisma.audit.create({
      data: {
        entity: 'Post',
        entityId: params.id,
        action: 'UPDATE',
        payload: {
          translationsUpdated: Object.keys(translations)
        },
        actorId: user.id
      }
    });
    
    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/posts/[id]
 * Delete a post and all its translations
 * Phase 6 Full: ADMIN+ only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check permission: ADMIN+ can delete
    requirePermission(user, 'deletePost');
    
    // Check if post exists
    const existing = await prisma.post.findUnique({
      where: { id: params.id }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Delete post (cascade will handle related records)
    await prisma.post.delete({
      where: { id: params.id }
    });
    
    // Create audit trail
    await prisma.audit.create({
      data: {
        entity: 'Post',
        entityId: params.id,
        action: 'DELETE',
        payload: {
          title: existing.title,
          slug: existing.slug
        },
        actorId: user.id
      }
    });
    
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
      }
    }
    
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
