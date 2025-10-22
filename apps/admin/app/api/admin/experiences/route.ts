import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';

// GET - List all experiences
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const experiences = await prisma.experience.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch experiences' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// POST - Create new experience
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { company, role, startDate, endDate, description, order, enabled, logoUrl } = body;

    if (!company || !role || !startDate || !description) {
      return NextResponse.json(
        { error: 'Company, role, start date, and description are required' },
        { status: 400 }
      );
    }

    const experience = await prisma.experience.create({
      data: {
        company,
        role,
        startDate,
        endDate: endDate || null,
        description,
        order: order ?? 0,
        enabled: enabled ?? true,
        logoUrl: logoUrl || null,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ experience }, { status: 201 });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create experience' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

