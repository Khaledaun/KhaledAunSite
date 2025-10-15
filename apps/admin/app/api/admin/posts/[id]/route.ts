import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@khaledaun/auth';
import { prisma } from '@khaledaun/db';
import { PostUpdateSchema } from '@khaledaun/schemas';
import { ZodError } from 'zod';

/**
 * GET /api/admin/posts/[id]
 * Get a single post by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();
    
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, email: true, name: true }
        }
      }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
      }
    }
    
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/posts/[id]
 * Update a post (title, slug, excerpt, content)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    
    // Validate input with Zod
    const validated = PostUpdateSchema.parse(body);
    
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
    
    // If slug is being changed, check for collision
    if (validated.slug && validated.slug !== existing.slug) {
      const slugTaken = await prisma.post.findUnique({
        where: { slug: validated.slug }
      });
      
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug already exists', field: 'slug' },
          { status: 409 }
        );
      }
    }
    
    // Update post
    const post = await prisma.post.update({
      where: { id: params.id },
      data: validated,
      include: {
        author: {
          select: { id: true, email: true, name: true }
        }
      }
    });
    
    // Create audit trail
    await prisma.audit.create({
      data: {
        entity: 'Post',
        entityId: post.id,
        action: 'UPDATE',
        payload: validated,
        actorId: user.id
      }
    });
    
    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
      }
    }
    
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/posts/[id]
 * Delete a post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();
    
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
