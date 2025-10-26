import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, getSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/media-library/[id] - Get single media item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const media = await prisma.mediaLibrary.findUnique({
      where: { id: params.id },
    });

    if (!media) {
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
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();

    const media = await prisma.mediaLibrary.update({
      where: { id: params.id },
      data: body,
    });

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
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    // First, get the media to find the storage path
    const media = await prisma.mediaLibrary.findUnique({
      where: { id: params.id },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete from storage if it's a Supabase storage URL
    if (media.url.includes('supabase')) {
      const supabase = getSupabaseClient();
      // Extract the file path from the URL
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
    await prisma.mediaLibrary.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/media-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

