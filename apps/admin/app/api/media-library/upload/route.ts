import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, checkAuth } from '@/lib/supabase';
import { prisma } from '@khaledaun/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/media-library/upload - Upload file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uncategorized';
    const altText = formData.get('altText') as string;
    const caption = formData.get('caption') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    // Create media record in database using Prisma
    try {
      const media = await prisma.mediaLibrary.create({
        data: {
          filename: fileName,
          originalFilename: file.name,
          storagePath: filePath,
          publicUrl: urlData.publicUrl,
          mimeType: file.type,
          fileSize: file.size,
          altText,
          caption,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
          folder,
          uploadedBy: auth.user?.id,
        },
      });

      return NextResponse.json({ media }, { status: 201 });
    } catch (dbError) {
      console.error('Error creating media record:', dbError);
      // Try to clean up the uploaded file
      await supabase.storage.from('media').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to create media record' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/media-library/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

