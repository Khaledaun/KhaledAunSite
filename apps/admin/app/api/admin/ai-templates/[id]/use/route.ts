import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';

/**
 * POST /api/admin/ai-templates/[id]/use
 * Increment usage count and return template
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Check if template exists
    const existing = await prisma.aIPromptTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Increment usage count
    const template = await prisma.aIPromptTemplate.update({
      where: { id: params.id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error using template:', error);
    return NextResponse.json(
      { error: 'Failed to use template' },
      { status: 500 }
    );
  }
}

