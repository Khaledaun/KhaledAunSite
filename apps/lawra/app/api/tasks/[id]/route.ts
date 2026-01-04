import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateTaskSchema, moveTaskSchema } from '@/lib/schemas/task'
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

    const task = await prisma.task.findFirst({
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
            client: {
              select: { id: true, name: true },
            },
          },
        },
        client: {
          select: { id: true, name: true },
        },
        timeEntries: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
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

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateTaskSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Handle status change with completion timestamp
    const updateData: any = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.caseId !== undefined && { caseId: data.caseId }),
      ...(data.clientId !== undefined && { clientId: data.clientId }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.estimatedMinutes !== undefined && { estimatedMinutes: data.estimatedMinutes }),
      ...(data.tags !== undefined && { tags: data.tags }),
    }

    // Set completedAt when task is marked as done
    if (data.status === 'DONE' && existingTask.status !== 'DONE') {
      updateData.completedAt = new Date()
    } else if (data.status && data.status !== 'DONE') {
      updateData.completedAt = null
    }

    const task = await prisma.task.update({
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

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
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

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
