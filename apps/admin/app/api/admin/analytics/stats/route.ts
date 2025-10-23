import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPosts,
      publishedPosts,
      totalCaseStudies,
      totalLeads,
      aiGenerationsThisMonth,
      urlExtractionsThisMonth,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.caseStudy.count(),
      prisma.lead.count(),
      prisma.aIGeneration.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      prisma.uRLExtraction.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalPosts,
      publishedPosts,
      totalCaseStudies,
      totalLeads,
      aiGenerationsThisMonth,
      urlExtractionsThisMonth,
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics statistics' },
      { status: 500 }
    );
  }
}

