import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCalendarEventSchema } from '@/lib/schemas/calendar-event'
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const caseId = searchParams.get('caseId')
    const eventType = searchParams.get('eventType')

    const where: any = {
      userId: user.id,
    }

    if (startDate) {
      where.startTime = {
        ...where.startTime,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.startTime = {
        ...where.startTime,
        lte: new Date(endDate),
      }
    }

    if (caseId) {
      where.caseId = caseId
    }

    if (eventType && eventType !== 'all') {
      where.eventType = eventType
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: [
        { startTime: 'asc' },
      ],
      include: {
        case: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
          },
        },
      },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
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
    const validationResult = createCalendarEventSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const event = await prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        allDay: data.allDay,
        eventType: data.eventType || null,
        caseId: data.caseId || null,
      },
      include: {
        case: {
          select: { id: true, title: true },
        },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}
