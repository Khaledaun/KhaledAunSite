import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@khaledaun/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/topics/[id]/lock - Lock a topic
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const topic = await prisma.topic.update({
      where: { id: params.id },
      data: {
        locked: true,
        lockedAt: new Date(),
        lockedBy: auth.user?.id || 'unknown',
      },
    });

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Error in POST /api/topics/[id]/lock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/topics/[id]/lock - Unlock a topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const topic = await prisma.topic.update({
      where: { id: params.id },
      data: {
        locked: false,
        lockedAt: null,
        lockedBy: null,
      },
    });

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Error in DELETE /api/topics/[id]/lock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

