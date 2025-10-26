import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@khaledaun/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/content-library/[id] - Get single content item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const content = await prisma.contentLibrary.findUnique({
      where: { id: params.id },
      include: {
        topic: {
          select: { title: true },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in GET /api/content-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/content-library/[id] - Update content
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const updateData: any = { ...body };
    
    // Recalculate word count and reading time if content changed
    if (body.content) {
      const wordCount = body.content.split(/\s+/).length;
      updateData.wordCount = wordCount;
      updateData.readingTimeMinutes = Math.ceil(wordCount / 200);
    }

    updateData.lastEditedBy = auth.user?.id;
    updateData.lastEditedAt = new Date();
    updateData.humanEdited = true;

    const content = await prisma.contentLibrary.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in PATCH /api/content-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/content-library/[id] - Delete content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    await prisma.contentLibrary.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/content-library/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

