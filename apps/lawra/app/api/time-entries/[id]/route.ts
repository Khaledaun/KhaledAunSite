import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateTimeEntrySchema } from '@/lib/schemas/time-entry'
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

    const timeEntry = await prisma.timeEntry.findFirst({
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
    })

    if (!timeEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    return NextResponse.json(timeEntry)
  } catch (error) {
    console.error('Error fetching time entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entry' },
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

    // Verify time entry belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateTimeEntrySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const updateData: any = {}

    if (data.date !== undefined) {
      updateData.date = new Date(data.date)
    }
    if (data.durationMinutes !== undefined) {
      updateData.durationMinutes = data.durationMinutes
    }
    if (data.description !== undefined) {
      updateData.description = data.description
    }
    if (data.activityType !== undefined) {
      updateData.activityType = data.activityType
    }
    if (data.caseId !== undefined) {
      updateData.caseId = data.caseId
    }
    if (data.clientId !== undefined) {
      updateData.clientId = data.clientId
    }
    if (data.taskId !== undefined) {
      updateData.taskId = data.taskId
    }
    if (data.isBillable !== undefined) {
      updateData.isBillable = data.isBillable
    }
    if (data.hourlyRate !== undefined) {
      updateData.hourlyRate = data.hourlyRate
    }
    if (data.invoiceId !== undefined) {
      updateData.invoiceId = data.invoiceId
    }

    const timeEntry = await prisma.timeEntry.update({
      where: { id: params.id },
      data: updateData,
      include: {
        case: {
          select: { id: true, title: true },
        },
        client: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(timeEntry)
  } catch (error) {
    console.error('Error updating time entry:', error)
    return NextResponse.json(
      { error: 'Failed to update time entry' },
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

    // Verify time entry belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    // Don't allow deletion if already invoiced
    if (existingEntry.invoiceId) {
      return NextResponse.json(
        { error: 'Cannot delete invoiced time entry' },
        { status: 400 }
      )
    }

    await prisma.timeEntry.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting time entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete time entry' },
      { status: 500 }
    )
  }
}
