import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { requireAdmin } from '@khaledaun/auth';

// GET - Get single experience
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const experience = await prisma.experience.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    return NextResponse.json({ experience });
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch experience' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// PUT - Update experience
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { company, role, startDate, endDate, description, order, enabled, logoUrl } = body;

    const experience = await prisma.experience.update({
      where: { id: params.id },
      data: {
        ...(company !== undefined && { company }),
        ...(role !== undefined && { role }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(enabled !== undefined && { enabled }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ experience });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update experience' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// DELETE - Delete experience
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    await prisma.experience.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete experience' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

