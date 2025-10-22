import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@khaledaun/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/audit?entity=Post&entityId=xyz
 * Get audit trail for an entity
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const entityId = searchParams.get('entityId');
    
    if (!entity) {
      return NextResponse.json(
        { error: 'entity parameter is required' },
        { status: 400 }
      );
    }
    
    const where: any = { entity };
    if (entityId) {
      where.entityId = entityId;
    }
    
    const audits = await prisma.audit.findMany({
      where,
      include: {
        actor: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 entries
    });
    
    return NextResponse.json({ audits });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
      }
    }
    
    console.error('Error fetching audit trail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

