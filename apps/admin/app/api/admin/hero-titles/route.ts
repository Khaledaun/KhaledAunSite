import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';

// GET - List all hero titles
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const titles = await prisma.heroTitle.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ titles });
  } catch (error) {
    console.error('Error fetching hero titles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch hero titles' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// POST - Create new hero title
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { titleEn, titleAr, order, enabled } = body;

    if (!titleEn || !titleAr) {
      return NextResponse.json(
        { error: 'Title in both English and Arabic is required' },
        { status: 400 }
      );
    }

    const title = await prisma.heroTitle.create({
      data: {
        titleEn,
        titleAr,
        order: order ?? 0,
        enabled: enabled ?? true,
      },
    });

    return NextResponse.json({ title }, { status: 201 });
  } catch (error) {
    console.error('Error creating hero title:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create hero title' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

