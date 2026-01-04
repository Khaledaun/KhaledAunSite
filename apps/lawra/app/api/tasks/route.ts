import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTaskSchema } from '@/lib/schemas/task'
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
    const caseId = searchParams.get('caseId')
    const clientId = searchParams.get('clientId')
    const assigneeId = searchParams.get('assigneeId')
    const search = searchParams.get('search')
    const includeDone = searchParams.get('includeDone') === 'true'

    const where: any = {
      userId: user.id,
    }

    if (status && status !== 'all') {
      where.status = status
    } else if (!includeDone) {
      // By default, exclude completed tasks
      where.status = { not: 'DONE' }
    }

    if (caseId) {
      where.caseId = caseId
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (assigneeId) {
      where.assigneeId = assigneeId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { position: 'asc' },
        { createdAt: 'desc' },
      ],
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
      },
    })

    // Group tasks by status for kanban view
    const tasksByStatus = tasks.reduce((acc: any, task) => {
      if (!acc[task.status]) {
        acc[task.status] = []
      }
      acc[task.status].push(task)
      return acc
    }, {})

    return NextResponse.json({
      tasks,
      tasksByStatus,
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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
    const validationResult = createTaskSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get max position for the status column
    const maxPosition = await prisma.task.aggregate({
      where: {
        userId: user.id,
        status: data.status,
      },
      _max: {
        position: true,
      },
    })

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description,
        caseId: data.caseId,
        clientId: data.clientId,
        assigneeId: data.assigneeId,
        status: data.status,
        priority: data.priority,
        position: (maxPosition._max.position || 0) + 1,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedMinutes: data.estimatedMinutes,
        tags: data.tags,
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

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
