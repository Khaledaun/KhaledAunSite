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

// GET /api/topics - List all topics with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const locked = searchParams.get('locked');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (locked !== null) {
      where.locked = locked === 'true';
    }

    // Fetch topics with count - use retry logic
    const [topics, total] = await Promise.all([
      queryWithRetry(() =>
        prisma.topic.findMany({
          where,
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          skip: offset,
          take: limit,
        })
      ),
      queryWithRetry(() => prisma.topic.count({ where })),
    ]);

    // Return empty array/0 if queries failed
    return NextResponse.json({
      topics: topics || [],
      total: total || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/topics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const {
      title,
      description,
      sourceUrl,
      sourceType = 'manual',
      keywords = [],
      priority = 0,
      userNotes,
      scheduledFor,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        sourceUrl,
        sourceType,
        keywords,
        priority,
        userNotes,
        status: 'pending',
      },
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/topics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

