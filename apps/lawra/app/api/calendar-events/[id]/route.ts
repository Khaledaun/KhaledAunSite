import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCalendarEventSchema } from '@/lib/schemas/calendar-event'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
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

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar event' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify event belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateCalendarEventSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const updateData: any = {}

    if (data.title !== undefined) {
      updateData.title = data.title
    }
    if (data.description !== undefined) {
      updateData.description = data.description
    }
    if (data.location !== undefined) {
      updateData.location = data.location
    }
    if (data.startTime !== undefined) {
      updateData.startTime = new Date(data.startTime)
    }
    if (data.endTime !== undefined) {
      updateData.endTime = new Date(data.endTime)
    }
    if (data.allDay !== undefined) {
      updateData.allDay = data.allDay
    }
    if (data.eventType !== undefined) {
      updateData.eventType = data.eventType
    }
    if (data.caseId !== undefined) {
      updateData.caseId = data.caseId
    }

    const event = await prisma.calendarEvent.update({
      where: { id: params.id },
      data: updateData,
      include: {
        case: {
          select: { id: true, title: true },
        },
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify event belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    await prisma.calendarEvent.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    )
  }
}
