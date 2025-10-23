import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';

export async function GET() {
  try {
    await requireAdmin();

    const logo = await prisma.siteLogo.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ logo });
  } catch (error) {
    console.error('Error fetching logo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logo' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { url, alt, width, height } = await request.json();

    // Deactivate all existing logos
    await prisma.siteLogo.updateMany({
      where: { active: true },
      data: { active: false },
    });

    // Create new logo
    const logo = await prisma.siteLogo.create({
      data: {
        url,
        alt: alt || 'Khaled Aun',
        width,
        height,
        active: true,
      },
    });

    return NextResponse.json({ logo }, { status: 201 });
  } catch (error) {
    console.error('Error creating logo:', error);
    return NextResponse.json(
      { error: 'Failed to create logo' },
      { status: 500 }
    );
  }
}

