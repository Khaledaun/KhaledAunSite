import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const [content, total] = await Promise.all([
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
      }),
      prisma.contentLibrary.count({ where }),
    ]);

    return NextResponse.json({
      content,
      total,
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
      type = 'BLOG',
      format,
      summary,
      keywords = [],
      tags = [],
      scheduledFor,
    } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    // Calculate word count
    const wordCount = content.split(/\s+/).length;

    const contentItem = await prisma.contentLibrary.create({
      data: {
        topicId,
        title,
        content,
        type,
        format,
        summary,
        keywords,
        tags,
        status: 'DRAFT',
        authorId: auth.user?.id || 'system',
        wordCount,
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

