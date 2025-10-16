import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { requireAdmin } from '@khaledaun/auth';

// GET - Get hero media settings
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const media = await prisma.heroMedia.findFirst({
      where: { enabled: true },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Error fetching hero media:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch hero media' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// POST - Create or update hero media
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { type, imageUrl, videoUrl, videoType, autoplay } = body;

    if (!type || !['IMAGE', 'VIDEO'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either IMAGE or VIDEO' },
        { status: 400 }
      );
    }

    if (type === 'IMAGE' && !imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required for IMAGE type' },
        { status: 400 }
      );
    }

    if (type === 'VIDEO' && !videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required for VIDEO type' },
        { status: 400 }
      );
    }

    // Disable all existing media
    await prisma.heroMedia.updateMany({
      where: { enabled: true },
      data: { enabled: false },
    });

    // Create new media entry
    const media = await prisma.heroMedia.create({
      data: {
        type,
        imageUrl: type === 'IMAGE' ? imageUrl : null,
        videoUrl: type === 'VIDEO' ? videoUrl : null,
        videoType: type === 'VIDEO' ? videoType || 'selfhosted' : null,
        autoplay: autoplay ?? false,
        enabled: true,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error('Error creating hero media:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create hero media' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

