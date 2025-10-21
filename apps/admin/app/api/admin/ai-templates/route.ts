import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { requireAdmin } from '@khaledaun/auth';
import { z } from 'zod';
import { AIUseCase } from '@prisma/client';

// Schema for creating/updating templates
const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  useCase: z.nativeEnum(AIUseCase),
  tone: z.string().optional(),
  language: z.string().optional(),
});

/**
 * GET /api/admin/ai-templates
 * List all AI prompt templates
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const useCase = searchParams.get('useCase') as AIUseCase | null;
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    if (category) where.category = category;
    if (useCase) where.useCase = useCase;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { prompt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.aIPromptTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Get unique categories for filtering
    const categories = await prisma.aIPromptTemplate.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return NextResponse.json({
      templates,
      categories: categories.map(c => c.category),
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-templates
 * Create a new prompt template
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = templateSchema.parse(body);

    const template = await prisma.aIPromptTemplate.create({
      data: {
        ...data,
        usageCount: 0,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

