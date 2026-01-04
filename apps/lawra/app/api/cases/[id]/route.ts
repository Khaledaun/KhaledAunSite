import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCaseSchema } from '@/lib/schemas/case'
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

    const caseRecord = await prisma.case.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clientType: true,
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            filename: true,
            documentType: true,
            createdAt: true,
          },
        },
        timeEntries: {
          orderBy: { date: 'desc' },
          take: 10,
          select: {
            id: true,
            date: true,
            durationMinutes: true,
            description: true,
            activityType: true,
            isBillable: true,
          },
        },
        calendarEvents: {
          where: {
            startTime: { gte: new Date() },
          },
          orderBy: { startTime: 'asc' },
          take: 5,
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            eventType: true,
            location: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            timeEntries: true,
            calendarEvents: true,
          },
        },
      },
    })

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Calculate total time
    const totalMinutes = await prisma.timeEntry.aggregate({
      where: { caseId: params.id },
      _sum: { durationMinutes: true },
    })

    return NextResponse.json({
      ...caseRecord,
      totalMinutes: totalMinutes._sum.durationMinutes || 0,
    })
  } catch (error) {
    console.error('Error fetching case:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case' },
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

    // Verify case belongs to user
    const existingCase = await prisma.case.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateCaseSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const caseRecord = await prisma.case.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.caseNumber !== undefined && { caseNumber: data.caseNumber }),
        ...(data.internalReference !== undefined && { internalReference: data.internalReference }),
        ...(data.caseType !== undefined && { caseType: data.caseType }),
        ...(data.practiceArea !== undefined && { practiceArea: data.practiceArea }),
        ...(data.court !== undefined && { court: data.court }),
        ...(data.judge !== undefined && { judge: data.judge }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.openedDate !== undefined && { openedDate: data.openedDate ? new Date(data.openedDate) : null }),
        ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
        ...(data.opposingParty !== undefined && { opposingParty: data.opposingParty }),
        ...(data.opposingCounsel !== undefined && { opposingCounsel: data.opposingCounsel }),
        ...(data.opposingCounselContact !== undefined && { opposingCounselContact: data.opposingCounselContact }),
        ...(data.feeType !== undefined && { feeType: data.feeType }),
        ...(data.feeAmount !== undefined && { feeAmount: data.feeAmount }),
        ...(data.retainerAmount !== undefined && { retainerAmount: data.retainerAmount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.tags !== undefined && { tags: data.tags }),
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(caseRecord)
  } catch (error) {
    console.error('Error updating case:', error)
    return NextResponse.json(
      { error: 'Failed to update case' },
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

    // Verify case belongs to user
    const existingCase = await prisma.case.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    await prisma.case.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting case:', error)
    return NextResponse.json(
      { error: 'Failed to delete case' },
      { status: 500 }
    )
  }
}
