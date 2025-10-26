import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, checkAuth } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/topics - List all topics with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth('manage_content');
    if (!auth.authorized) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const locked = searchParams.get('locked');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('topics')
      .select('*', { count: 'exact' })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (locked !== null) {
      query = query.eq('locked', locked === 'true');
    }

    const { data: topics, error, count } = await query;

    if (error) {
      console.error('Error fetching topics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch topics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      topics: topics || [],
      total: count || 0,
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
    const auth = await checkAuth('manage_content');
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

    const supabase = getSupabaseClient();

    const { data: topic, error } = await supabase
      .from('topics')
      .insert({
        title,
        description,
        source_url: sourceUrl,
        source_type: sourceType,
        keywords,
        priority,
        user_notes: userNotes,
        scheduled_for: scheduledFor,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating topic:', error);
      return NextResponse.json(
        { error: 'Failed to create topic' },
        { status: 500 }
      );
    }

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/topics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

