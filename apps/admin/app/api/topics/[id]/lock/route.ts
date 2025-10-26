import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, checkAuth } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/topics/[id]/lock - Lock a topic
export async function POST(
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
      .update({
        locked: true,
        locked_at: new Date().toISOString(),
        locked_by: auth.user?.id || 'unknown',
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error locking topic:', error);
      return NextResponse.json(
        { error: 'Failed to lock topic' },
        { status: 500 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Error in POST /api/topics/[id]/lock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/topics/[id]/lock - Unlock a topic
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
    const { data: topic, error } = await supabase
      .from('topics')
      .update({
        locked: false,
        locked_at: null,
        locked_by: null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error unlocking topic:', error);
      return NextResponse.json(
        { error: 'Failed to unlock topic' },
        { status: 500 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Error in DELETE /api/topics/[id]/lock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

