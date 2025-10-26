import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, checkAuth } from '@/lib/supabase';

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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('content_library')
      .select('*, topics(title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,keywords.cs.{${search}}`);
    }

    const { data: content, error, count } = await query;

    if (error) {
      console.error('Error fetching content library:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: content || [],
      total: count || 0,
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
      type,
      format,
      title,
      content,
      summary,
      excerpt,
      keywords = [],
      tags = [],
      category,
      mediaIds = [],
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

    const supabase = getSupabaseClient();

    const { data: contentItem, error } = await supabase
      .from('content_library')
      .insert({
        topic_id: topicId,
        type,
        format,
        title,
        content,
        summary,
        excerpt,
        keywords,
        tags,
        category,
        media_ids: mediaIds,
        featured_image_id: featuredImageId,
        word_count: wordCount,
        reading_time_minutes: readingTimeMinutes,
        scheduled_for: scheduledFor,
        status: 'draft',
        author_id: auth.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating content:', error);
      return NextResponse.json(
        { error: 'Failed to create content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: contentItem }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/content-library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

