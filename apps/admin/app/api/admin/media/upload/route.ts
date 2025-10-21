import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { z } from 'zod';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// File upload constants
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'application/pdf',
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

// Validation schema
const uploadSchema = z.object({
  folder: z.string().optional().default('uploads'),
  altText: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement authentication
    // For now, using a mock user ID
    const userId = 'mock-user-id'; // Replace with actual auth

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Parse metadata
    const metadata = uploadSchema.parse({
      folder: formData.get('folder'),
      altText: formData.get('altText'),
      caption: formData.get('caption'),
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
    });

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${userId}/${metadata.folder}/${timestamp}-${randomString}.${extension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process image (if image)
    let processedBuffer = buffer;
    let width: number | null = null;
    let height: number | null = null;
    let thumbnailUrl: string | null = null;

    if (file.type.startsWith('image/')) {
      try {
        const image = sharp(buffer);
        const imageMetadata = await image.metadata();
        width = imageMetadata.width || null;
        height = imageMetadata.height || null;

        // Optimize original image
        const optimizedBuffer = await image
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        // @ts-ignore - Sharp returns Buffer<ArrayBufferLike> but we need Buffer<ArrayBuffer>
        processedBuffer = optimizedBuffer;

        // Create thumbnail
        // @ts-ignore - Sharp buffer type compatibility
        const thumbnailBuffer = await sharp(buffer)
          .resize(400, 400, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();

        const thumbnailFilename = filename.replace(/\.[^.]+$/, '-thumb.jpg');

        const { error: thumbError } = await supabase.storage
          .from('media')
          .upload(thumbnailFilename, thumbnailBuffer, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (!thumbError) {
          const { data: thumbData } = supabase.storage
            .from('media')
            .getPublicUrl(thumbnailFilename);
          thumbnailUrl = thumbData.publicUrl;
        }
      } catch (error) {
        console.error('Image processing error:', error);
        // Continue with original buffer if processing fails
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, processedBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Upload failed: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(filename);

    // Save to database
    const media = await prisma.mediaAsset.create({
      data: {
        filename,
        originalName: file.name,
        url: urlData.publicUrl,
        thumbnailUrl,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        alt: metadata.altText,
        caption: metadata.caption,
        folder: metadata.folder,
        tags: metadata.tags,
        uploadedBy: userId,
      },
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

    return NextResponse.json(
      {
        success: true,
        media,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}

// GET: List all media
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');

    const where: any = {
      status: 'ACTIVE',
    };

    if (folder) where.folder = folder;
    if (type) where.mimeType = { startsWith: type };
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mediaAsset.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}



