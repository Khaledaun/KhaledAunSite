import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@khaledaun/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/media-library - List all media with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const mimeType = searchParams.get('type');
    const folder = searchParams.get('folder');
    const tagsParam = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    
    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    if (folder) {
      where.folder = folder;
    }

    if (tagsParam) {
      const tagArray = tagsParam.split(',');
      where.tags = { hasSome: tagArray };
    }

    const [media, total] = await Promise.all([
      prisma.mediaLibrary.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.mediaLibrary.count({ where }),
    ]);

    return NextResponse.json({
      media,
      total,
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
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const {
      filename,
      originalFilename,
      storagePath,
      publicUrl,
      mimeType,
      fileSize,
      width,
      height,
      durationSeconds,
      altText,
      caption,
      tags = [],
      folder = 'uncategorized',
    } = body;

    if (!filename || !storagePath || !publicUrl || !mimeType) {
      return NextResponse.json(
        { error: 'Filename, storagePath, publicUrl, and mimeType are required' },
        { status: 400 }
      );
    }

    const media = await prisma.mediaLibrary.create({
      data: {
        filename,
        originalFilename: originalFilename || filename,
        storagePath,
        publicUrl,
        mimeType,
        fileSize: fileSize || 0,
        width,
        height,
        durationSeconds,
        altText,
        caption,
        tags,
        folder,
        uploadedBy: auth.user?.id,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/media-library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

