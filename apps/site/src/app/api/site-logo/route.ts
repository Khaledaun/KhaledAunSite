import { NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';

export async function GET() {
  try {
    const logo = await prisma.siteLogo.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ logo });
  } catch (error) {
    console.error('Error fetching logo:', error);
    return NextResponse.json({ logo: null });
  }
}

