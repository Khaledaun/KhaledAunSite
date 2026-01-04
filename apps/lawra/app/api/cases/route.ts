import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCaseSchema } from '@/lib/schemas/case'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const caseType = searchParams.get('type')
    const clientId = searchParams.get('clientId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: user.id,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (caseType && caseType !== 'all') {
      where.caseType = caseType
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { opposingParty: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              clientType: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              documents: true,
              timeEntries: true,
            },
          },
        },
      }),
      prisma.case.count({ where }),
    ])

    return NextResponse.json({
      cases,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createCaseSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, userId: user.id },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Generate internal reference if not provided
    const internalRef = data.internalReference || await generateInternalReference(user.id)

    const caseRecord = await prisma.case.create({
      data: {
        userId: user.id,
        clientId: data.clientId,
        title: data.title,
        caseNumber: data.caseNumber,
        internalReference: internalRef,
        caseType: data.caseType,
        practiceArea: data.practiceArea,
        court: data.court,
        judge: data.judge,
        status: data.status,
        priority: data.priority,
        openedDate: data.openedDate ? new Date(data.openedDate) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        opposingParty: data.opposingParty,
        opposingCounsel: data.opposingCounsel,
        opposingCounselContact: data.opposingCounselContact,
        feeType: data.feeType,
        feeAmount: data.feeAmount,
        retainerAmount: data.retainerAmount,
        description: data.description,
        notes: data.notes,
        tags: data.tags,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(caseRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating case:', error)
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    )
  }
}

async function generateInternalReference(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.case.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  })
  return `INT-${year}-${String(count + 1).padStart(4, '0')}`
}
