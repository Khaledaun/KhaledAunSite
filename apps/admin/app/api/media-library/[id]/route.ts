import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, checkAuth } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/media-library/[id] - Get single media item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manage_content');
    if (!auth.authorized) {
      return auth.response;
    }

    const supabase = getSupabaseClient();
    const { data: media, error } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Error in GET /api/media-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/media-library/[id] - Update media metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manage_content');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const supabase = getSupabaseClient();

    const { data: media, error } = await supabase
      .from('media_library')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating media:', error);
      return NextResponse.json(
        { error: 'Failed to update media' },
        { status: 500 }
      );
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Error in PATCH /api/media-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/media-library/[id] - Delete media
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manage_content');
    if (!auth.authorized) {
      return auth.response;
    }

    const supabase = getSupabaseClient();
    
    // First, get the media to find the file URL
    const { data: media, error: fetchError } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete from storage if it's a Supabase storage URL
    if (media.url.includes('supabase')) {
      const urlParts = new URL(media.url);
      const path = urlParts.pathname.split('/').slice(3).join('/'); // Extract path after bucket name
      
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue anyway - record deletion is more important
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('media_library')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting media:', error);
      return NextResponse.json(
        { error: 'Failed to delete media' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/media-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

