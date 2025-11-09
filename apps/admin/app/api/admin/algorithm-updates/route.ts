import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';
import { z } from 'zod';

const updateSchema = z.object({
  source: z.enum(['SEO', 'AIO', 'LINKEDIN']),
  title: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  publishedAt: z.string().datetime(),
  category: z.array(z.string()),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  platform: z.string().optional(),
});

/**
 * GET /api/admin/algorithm-updates
 * List algorithm updates with filtering
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const analyzed = searchParams.get('analyzed');
    const applied = searchParams.get('applied');
    const impact = searchParams.get('impact');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (source) where.source = source;
    if (analyzed !== null) where.analyzed = analyzed === 'true';
    if (applied !== null) where.applied = applied === 'true';
    if (impact) where.impact = impact;

    const updates = await prisma.algorithmUpdate.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    // Get summary stats
    const stats = await prisma.algorithmUpdate.groupBy({
      by: ['source', 'impact'],
      _count: true,
      where: {
        publishedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    return NextResponse.json({
      updates,
      stats: {
        total: updates.length,
        bySource: stats.reduce((acc, s) => {
          acc[s.source] = (acc[s.source] || 0) + s._count;
          return acc;
        }, {} as Record<string, number>),
        byImpact: stats.reduce((acc, s) => {
          acc[s.impact] = (acc[s.impact] || 0) + s._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Error fetching algorithm updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch algorithm updates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/algorithm-updates
 * Manually add an algorithm update
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = updateSchema.parse(body);

    // Check for duplicates by URL
    const existing = await prisma.algorithmUpdate.findFirst({
      where: { url: data.url },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Update with this URL already exists' },
        { status: 409 }
      );
    }

    const update = await prisma.algorithmUpdate.create({
      data: {
        ...data,
        publishedAt: new Date(data.publishedAt),
      },
    });

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating algorithm update:', error);
    return NextResponse.json(
      { error: 'Failed to create algorithm update' },
      { status: 500 }
    );
  }
}
