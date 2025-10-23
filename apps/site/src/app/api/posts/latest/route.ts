import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const limit = parseInt(searchParams.get('limit') || '3');

    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        featuredImage: {
          select: {
            url: true,
            alt: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return NextResponse.json({ posts: [] });
  }
}

