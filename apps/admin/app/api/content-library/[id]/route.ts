import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { requirePermission } from '@khaledaun/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/content-library/[id] - Get single content item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permission = await requirePermission(request, 'manage_content');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.message }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { data: content, error } = await supabase
      .from('content_library')
      .select('*, topics(title)')
      .eq('id', params.id)
      .single();

    if (error || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in GET /api/content-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/content-library/[id] - Update content
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permission = await requirePermission(request, 'manage_content');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.message }, { status: 403 });
    }

    const body = await request.json();
    
    // Recalculate word count and reading time if content changed
    if (body.content) {
      const wordCount = body.content.split(/\s+/).length;
      body.word_count = wordCount;
      body.reading_time_minutes = Math.ceil(wordCount / 200);
    }

    body.last_edited_by = permission.user?.id;
    body.last_edited_at = new Date().toISOString();

    const supabase = getSupabaseClient();

    const { data: content, error } = await supabase
      .from('content_library')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content:', error);
      return NextResponse.json(
        { error: 'Failed to update content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in PATCH /api/content-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/content-library/[id] - Delete content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permission = await requirePermission(request, 'manage_content');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.message }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('content_library')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting content:', error);
      return NextResponse.json(
        { error: 'Failed to delete content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/content-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

