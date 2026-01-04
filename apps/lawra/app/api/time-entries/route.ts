import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTimeEntrySchema } from '@/lib/schemas/time-entry'
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
    const caseId = searchParams.get('caseId')
    const clientId = searchParams.get('clientId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const isBillable = searchParams.get('isBillable')
    const invoiced = searchParams.get('invoiced')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: any = {
      userId: user.id,
    }

    if (caseId) {
      where.caseId = caseId
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (startDate) {
      where.date = {
        ...where.date,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.date = {
        ...where.date,
        lte: new Date(endDate),
      }
    }

    if (isBillable !== null && isBillable !== undefined) {
      where.isBillable = isBillable === 'true'
    }

    if (invoiced !== null && invoiced !== undefined) {
      if (invoiced === 'true') {
        where.invoiceId = { not: null }
      } else {
        where.invoiceId = null
      }
    }

    const [timeEntries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
        include: {
          case: {
            select: {
              id: true,
              title: true,
              caseNumber: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
            },
          },
        },
      }),
      prisma.timeEntry.count({ where }),
    ])

    // Calculate totals
    const totals = await prisma.timeEntry.aggregate({
      where,
      _sum: {
        durationMinutes: true,
      },
    })

    const billableTotals = await prisma.timeEntry.aggregate({
      where: {
        ...where,
        isBillable: true,
      },
      _sum: {
        durationMinutes: true,
      },
    })

    return NextResponse.json({
      timeEntries,
      total,
      totalMinutes: totals._sum.durationMinutes || 0,
      billableMinutes: billableTotals._sum.durationMinutes || 0,
    })
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
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
    const validationResult = createTimeEntrySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get client from case if not specified
    let clientId = data.clientId
    if (data.caseId && !clientId) {
      const caseData = await prisma.case.findUnique({
        where: { id: data.caseId },
        select: { clientId: true },
      })
      clientId = caseData?.clientId || null
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId: user.id,
        date: new Date(data.date),
        durationMinutes: data.durationMinutes,
        description: data.description,
        activityType: data.activityType,
        caseId: data.caseId || null,
        clientId: clientId || null,
        taskId: data.taskId || null,
        isBillable: data.isBillable,
        hourlyRate: data.hourlyRate || null,
      },
      include: {
        case: {
          select: { id: true, title: true },
        },
        client: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(timeEntry, { status: 201 })
  } catch (error) {
    console.error('Error creating time entry:', error)
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    )
  }
}
