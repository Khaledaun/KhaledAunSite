import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createKnowledgeSchema } from '@/lib/schemas/knowledge'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const practiceArea = searchParams.get('practiceArea')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      OR: [
        { userId: user.id },
        { isPublic: true },
      ],
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
            { citation: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
          ],
        },
      ]
    }

    if (type) {
      where.type = type
    }

    if (practiceArea) {
      where.practiceArea = practiceArea
    }

    const [items, total] = await Promise.all([
      prisma.knowledgeItem.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.knowledgeItem.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching knowledge items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge items' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = createKnowledgeSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      )
    }

    const item = await prisma.knowledgeItem.create({
      data: {
        ...result.data,
        userId: user.id,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating knowledge item:', error)
    return NextResponse.json(
      { error: 'Failed to create knowledge item' },
      { status: 500 }
    )
  }
}
