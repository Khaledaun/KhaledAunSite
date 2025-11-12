import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Retry helper for database queries
async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error: any) {
      if (error.code === 'P1001' || error.code === 'P1017') {
        // Database connection error - retry
        if (i === maxRetries - 1) {
          console.error(`Query failed after ${maxRetries} attempts:`, error.message);
          return null; // Return null instead of throwing
        }
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        // Other error - don't retry
        console.error('Query failed with non-retryable error:', error.message);
        return null;
      }
    }
  }
  return null;
}

// GET /api/content-library - List all content with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    
    if (contentType) {
      where.type = contentType;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { keywords: { has: search } },
      ];
    }

    // Use retry logic for queries
    const [content, total] = await Promise.all([
      queryWithRetry(() =>
        prisma.contentLibrary.findMany({
          where,
          include: {
            topic: {
              select: { title: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        })
      ),
      queryWithRetry(() => prisma.contentLibrary.count({ where })),
    ]);

    // Return empty array/0 if queries failed
    return NextResponse.json({
      content: content || [],
      total: total || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/content-library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/content-library - Create new content
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const {
      topicId,
      title,
      content,
      type = 'blog',
      format,
      summary,
      excerpt,
      keywords = [],
      tags = [],
      category,
      featuredImageId,
      scheduledFor,
    } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    // Calculate word count and reading time
    const wordCount = content.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200); // Average reading speed

    const contentItem = await prisma.contentLibrary.create({
      data: {
        topicId,
        title,
        content,
        type,
        format,
        summary,
        excerpt,
        keywords,
        tags,
        category,
        status: 'draft',
        authorId: auth.user?.id,
        wordCount,
        readingTimeMinutes,
        featuredImageId,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
    });

    return NextResponse.json({ content: contentItem }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/content-library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

