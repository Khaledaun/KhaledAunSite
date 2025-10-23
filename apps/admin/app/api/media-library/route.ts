import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@repo/db/supabase-client';
import { requirePermission } from '@repo/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/media-library - List all media with filters
export async function GET(request: NextRequest) {
  try {
    const permission = await requirePermission(request, 'manage_content');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.message }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const folder = searchParams.get('folder');
    const tags = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('media_library')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    if (folder) {
      query = query.eq('folder', folder);
    }

    if (tags) {
      const tagArray = tags.split(',');
      query = query.contains('tags', tagArray);
    }

    const { data: media, error, count } = await query;

    if (error) {
      console.error('Error fetching media library:', error);
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      media: media || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/media-library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/media-library - Create media record (after upload to Supabase Storage)
export async function POST(request: NextRequest) {
  try {
    const permission = await requirePermission(request, 'manage_content');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.message }, { status: 403 });
    }

    const body = await request.json();
    const {
      filename,
      originalFilename,
      url,
      thumbnailUrl,
      type,
      sizeBytes,
      mimeType,
      width,
      height,
      durationSeconds,
      altText,
      caption,
      tags = [],
      folder = 'uncategorized',
    } = body;

    if (!filename || !url || !type) {
      return NextResponse.json(
        { error: 'Filename, url, and type are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: media, error } = await supabase
      .from('media_library')
      .insert({
        filename,
        original_filename: originalFilename,
        url,
        thumbnail_url: thumbnailUrl,
        type,
        size_bytes: sizeBytes,
        mime_type: mimeType,
        width,
        height,
        duration_seconds: durationSeconds,
        alt_text: altText,
        caption,
        tags,
        folder,
        uploaded_by: permission.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating media record:', error);
      return NextResponse.json(
        { error: 'Failed to create media record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/media-library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

