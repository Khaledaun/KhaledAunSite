import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { requireAdmin } from '@khaledaun/auth';

// GET - Get single hero title
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const title = await prisma.heroTitle.findUnique({
      where: { id: params.id },
    });

    if (!title) {
      return NextResponse.json({ error: 'Title not found' }, { status: 404 });
    }

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error fetching hero title:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch hero title' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// PUT - Update hero title
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { titleEn, titleAr, order, enabled } = body;

    const title = await prisma.heroTitle.update({
      where: { id: params.id },
      data: {
        ...(titleEn !== undefined && { titleEn }),
        ...(titleAr !== undefined && { titleAr }),
        ...(order !== undefined && { order }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error updating hero title:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update hero title' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// DELETE - Delete hero title
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    await prisma.heroTitle.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Title deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero title:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete hero title' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

