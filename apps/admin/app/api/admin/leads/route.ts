import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@khaledaun/auth';
import { prisma } from '@khaledaun/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    
    // Fetch leads from database
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ leads });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
      }
    }
    
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}