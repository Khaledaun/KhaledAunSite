import { NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const titles = await prisma.heroTitle.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ titles });
  } catch (error) {
    console.error('Error fetching hero titles:', error);
    // Return fallback titles if database fails
    return NextResponse.json({
      titles: [
        {
          id: 'fallback-1',
          titleEn: 'Litigation Expert',
          titleAr: 'خبير التقاضي',
          order: 1,
        },
        {
          id: 'fallback-2',
          titleEn: 'Conflict Resolution and Prevention Advisor',
          titleAr: 'مستشار حل ومنع النزاعات',
          order: 2,
        },
      ],
    });
  }
}

