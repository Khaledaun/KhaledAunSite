import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, requirePermission } from '@khaledaun/auth';
import { prisma } from '@khaledaun/db';
import { PostCreateSchema } from '@khaledaun/schemas';
import { ZodError } from 'zod';

/**
 * GET /api/admin/posts
 * List all posts (for admin dashboard)
 * Phase 6 Full: AUTHORs see only their posts, others see all
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // AUTHORs can only see their own posts
    const where = user.role === 'AUTHOR' ? { authorId: user.id } : {};
    
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, email: true, name: true, role: true }
        },
        translations: {
          select: { id: true, locale: true, title: true, slug: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    return NextResponse.json({ posts });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }
    
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/posts
 * Create a new post (draft by default)
 * Phase 6 Full: AUTHOR+ can create posts
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check permission: AUTHOR+ can create posts
    requirePermission(user, 'createPost');
    
    const body = await request.json();
    
    // Validate input with Zod
    const validated = PostCreateSchema.parse(body);
    
    // Check for slug collision
    const existing = await prisma.post.findUnique({
      where: { slug: validated.slug }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists', field: 'slug' },
        { status: 409 }
      );
    }
    
    // Create post
    const post = await prisma.post.create({
      data: {
        ...validated,
        authorId: user.id,
        status: 'DRAFT'
      },
      include: {
        author: {
          select: { id: true, email: true, name: true, role: true }
        }
      }
    });
    
    // Create audit trail
    await prisma.audit.create({
      data: {
        entity: 'Post',
        entityId: post.id,
        action: 'CREATE',
        payload: {
          title: post.title,
          slug: post.slug,
          status: post.status
        },
        actorId: user.id
      }
    });
    
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Forbidden - You do not have permission to create posts' },
          { status: 403 }
        );
      }
    }
    
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}