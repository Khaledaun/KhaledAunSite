import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/admin/case-studies/[id]/publish
 * Publish or unpublish a case study
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { publish } = body;

    if (publish === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: publish (boolean)' },
        { status: 400 }
      );
    }

    // Check if case study exists
    const existing = await prisma.caseStudy.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      );
    }

    // Update publication status
    const caseStudy = await prisma.caseStudy.update({
      where: { id: params.id },
      data: {
        published: publish,
        publishedAt: publish ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        featuredImage: true,
      },
    });

    // Revalidate case studies pages
    revalidatePath('/case-studies');
    revalidatePath(`/case-studies/${caseStudy.slug}`);
    revalidatePath('/'); // Home page might list case studies

    return NextResponse.json({
      ...caseStudy,
      message: publish ? 'Case study published successfully' : 'Case study unpublished',
    });
  } catch (error) {
    console.error('Error publishing case study:', error);
    return NextResponse.json(
      { error: 'Failed to update publication status' },
      { status: 500 }
    );
  }
}

