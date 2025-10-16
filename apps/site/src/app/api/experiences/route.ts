import { NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      where: { enabled: true },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    // Return fallback experiences if database fails
    return NextResponse.json({
      experiences: [
        {
          id: 'fallback-1',
          company: 'Facebook',
          role: 'Senior Legal Counsel',
          startDate: '2019',
          endDate: '2023',
          description: 'Led complex international legal matters and strategic business initiatives.',
          logoUrl: '/images/experience/facebook.png',
          images: [],
        },
        {
          id: 'fallback-2',
          company: 'Google',
          role: 'Legal Strategy Advisor',
          startDate: '2018',
          endDate: '2019',
          description: 'Provided strategic legal guidance for global business expansion.',
          logoUrl: '/images/experience/google.png',
          images: [],
        },
      ],
    });
  }
}

