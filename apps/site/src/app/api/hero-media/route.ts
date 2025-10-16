import { NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const media = await prisma.heroMedia.findFirst({
      where: { enabled: true },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Error fetching hero media:', error);
    // Return default image if database fails
    return NextResponse.json({
      media: {
        id: 'fallback',
        type: 'IMAGE',
        imageUrl: '/images/hero/khaled-portrait.jpg',
        enabled: true,
      },
    });
  }
}

