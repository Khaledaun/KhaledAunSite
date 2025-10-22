import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';
import { revalidatePath } from 'next/cache';

/**
 * GET /api/admin/case-studies/[id]
 * Get a single case study by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id: params.id },
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

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error('Error fetching case study:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case study' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/case-studies/[id]
 * Update a case study
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      type,
      confidential,
      title,
      slug,
      problem,
      strategy,
      outcome,
      categories,
      practiceArea,
      year,
      jurisdiction,
      featuredImageId,
    } = body;

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

    // Check for slug conflict if slug is being changed
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.caseStudy.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A case study with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update case study
    const caseStudy = await prisma.caseStudy.update({
      where: { id: params.id },
      data: {
        ...(type && { type }),
        ...(confidential !== undefined && { confidential }),
        ...(title && { title }),
        ...(slug && { slug }),
        ...(problem && { problem }),
        ...(strategy && { strategy }),
        ...(outcome && { outcome }),
        ...(categories !== undefined && { categories }),
        ...(practiceArea !== undefined && { practiceArea }),
        ...(year !== undefined && { year: year ? parseInt(year) : null }),
        ...(jurisdiction !== undefined && { jurisdiction }),
        ...(featuredImageId !== undefined && { featuredImageId }),
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

    // Revalidate if published
    if (caseStudy.published) {
      revalidatePath('/case-studies');
      revalidatePath(`/case-studies/${caseStudy.slug}`);
    }

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error('Error updating case study:', error);
    return NextResponse.json(
      { error: 'Failed to update case study' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/case-studies/[id]
 * Delete a case study
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

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

    // Delete case study
    await prisma.caseStudy.delete({
      where: { id: params.id },
    });

    // Revalidate if it was published
    if (existing.published) {
      revalidatePath('/case-studies');
      revalidatePath(`/case-studies/${existing.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting case study:', error);
    return NextResponse.json(
      { error: 'Failed to delete case study' },
      { status: 500 }
    );
  }
}

