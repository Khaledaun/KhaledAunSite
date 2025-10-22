import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, getSessionUser } from '@khaledaun/auth';

/**
 * GET /api/admin/case-studies
 * List all case studies with filtering and sorting
 * 
 * Query params:
 * - type: LITIGATION | ARBITRATION | ADVISORY | VENTURE
 * - published: true | false
 * - search: search in title, problem, strategy, outcome
 * - sort: createdAt | updatedAt | publishedAt | title
 * - order: asc | desc
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    
    // Filters
    const type = searchParams.get('type');
    const published = searchParams.get('published');
    const search = searchParams.get('search');
    
    // Sorting
    const sort = searchParams.get('sort') || 'createdAt';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (published !== null && published !== undefined) {
      where.published = published === 'true';
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { problem: { contains: search, mode: 'insensitive' } },
        { strategy: { contains: search, mode: 'insensitive' } },
        { outcome: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get case studies
    const caseStudies = await prisma.caseStudy.findMany({
      where,
      orderBy: { [sort]: order },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            url: true,
            alt: true,
          },
        },
      },
    });

    return NextResponse.json({ caseStudies, total: caseStudies.length });
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/case-studies
 * Create a new case study
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Validate required fields
    if (!type || !title || !slug || !problem || !strategy || !outcome) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, slug, problem, strategy, outcome' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['LITIGATION', 'ARBITRATION', 'ADVISORY', 'VENTURE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.caseStudy.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A case study with this slug already exists' },
        { status: 409 }
      );
    }

    // Create case study
    const caseStudy = await prisma.caseStudy.create({
      data: {
        type,
        confidential: confidential || false,
        title,
        slug,
        problem,
        strategy,
        outcome,
        categories: categories || [],
        practiceArea: practiceArea || null,
        year: year ? parseInt(year) : null,
        jurisdiction: jurisdiction || null,
        authorId: user.id,
        featuredImageId: featuredImageId || null,
        published: false,
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

    return NextResponse.json(caseStudy, { status: 201 });
  } catch (error) {
    console.error('Error creating case study:', error);
    return NextResponse.json(
      { error: 'Failed to create case study' },
      { status: 500 }
    );
  }
}

