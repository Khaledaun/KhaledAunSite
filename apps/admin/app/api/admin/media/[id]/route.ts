import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update schema
const updateSchema = z.object({
  alt: z.string().optional(),
  caption: z.string().optional(),
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET: Get single media by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const media = await prisma.mediaAsset.findUnique({
      where: { id: params.id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        PostMedia: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// PATCH: Update media metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement authentication and authorization
    const userId = 'mock-user-id';

    const body = await request.json();
    const data = updateSchema.parse(body);

    // Check if media exists
    const existingMedia = await prisma.mediaAsset.findUnique({
      where: { id: params.id },
    });

    if (!existingMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Check ownership (unless admin)
    // TODO: Implement proper RBAC check
    // if (existingMedia.uploadedBy !== userId && !isAdmin(user)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Update media
    const updatedMedia = await prisma.mediaAsset.update({
      where: { id: params.id },
      data,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ media: updatedMedia });
  } catch (error) {
    console.error('Media update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}

// DELETE: Delete media
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement authentication and authorization
    const userId = 'mock-user-id';

    // Check if media exists
    const existingMedia = await prisma.mediaAsset.findUnique({
      where: { id: params.id },
    });

    if (!existingMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Check ownership (unless admin)
    // TODO: Implement proper RBAC check
    // if (existingMedia.uploadedBy !== userId && !isAdmin(user)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Check if media is being used
    const usage = await prisma.postMedia.findFirst({
      where: { mediaAssetId: params.id },
    });

    if (usage) {
      return NextResponse.json(
        { error: 'Cannot delete media: it is being used in posts' },
        { status: 400 }
      );
    }

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([existingMedia.filename]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete thumbnail if exists
    if (existingMedia.thumbnailUrl) {
      const thumbnailFilename = existingMedia.filename.replace(/\.[^.]+$/, '-thumb.jpg');
      await supabase.storage.from('media').remove([thumbnailFilename]);
    }

    // Soft delete in database (mark as DELETED)
    await prisma.mediaAsset.update({
      where: { id: params.id },
      data: { status: 'DELETED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media deletion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deletion failed' },
      { status: 500 }
    );
  }
}



