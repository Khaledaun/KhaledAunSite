import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { updateKnowledgeSchema } from '@/lib/schemas/knowledge'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const item = await prisma.knowledgeItem.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          { isPublic: true },
        ],
      },
    })

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching knowledge item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge item' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const result = updateKnowledgeSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      )
    }

    // Check ownership
    const existing = await prisma.knowledgeItem.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
    }

    const item = await prisma.knowledgeItem.update({
      where: { id },
      data: result.data,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating knowledge item:', error)
    return NextResponse.json(
      { error: 'Failed to update knowledge item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const existing = await prisma.knowledgeItem.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
    }

    await prisma.knowledgeItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting knowledge item:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge item' },
      { status: 500 }
    )
  }
}
