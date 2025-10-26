import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, checkAuth } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/topics/[id] - Get single topic
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const supabase = getSupabaseClient();
    const { data: topic, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Error in GET /api/topics/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/topics/[id] - Update topic
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const supabase = getSupabaseClient();

    const { data: topic, error } = await supabase
      .from('topics')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating topic:', error);
      return NextResponse.json(
        { error: 'Failed to update topic' },
        { status: 500 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Error in PATCH /api/topics/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/topics/[id] - Delete topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting topic:', error);
      return NextResponse.json(
        { error: 'Failed to delete topic' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/topics/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

