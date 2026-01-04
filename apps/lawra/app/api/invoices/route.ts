import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createInvoiceSchema, generateInvoiceNumber } from '@/lib/schemas/invoice'
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
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: any = {
      userId: user.id,
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: [
          { issueDate: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              timeEntries: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ])

    // Calculate totals
    const totals = await prisma.invoice.aggregate({
      where,
      _sum: {
        total: true,
        paidAmount: true,
      },
    })

    return NextResponse.json({
      invoices,
      total,
      totalAmount: totals._sum.total || 0,
      paidAmount: totals._sum.paidAmount || 0,
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
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
    const validationResult = createInvoiceSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { userId: user.id },
    })
    const invoiceNumber = generateInvoiceNumber(invoiceCount + 1)

    // Get time entries if provided
    let subtotal = 0
    if (data.timeEntryIds && data.timeEntryIds.length > 0) {
      const timeEntries = await prisma.timeEntry.findMany({
        where: {
          id: { in: data.timeEntryIds },
          userId: user.id,
          isBillable: true,
          invoiceId: null, // Only uninvoiced entries
        },
      })

      // Calculate subtotal from time entries
      for (const entry of timeEntries) {
        if (entry.hourlyRate) {
          const hours = entry.durationMinutes / 60
          subtotal += hours * Number(entry.hourlyRate)
        }
      }
    }

    // Calculate tax and total
    const taxRate = data.taxRate || 17
    const taxAmount = (subtotal * taxRate) / 100
    const total = subtotal + taxAmount

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: data.clientId,
        invoiceNumber,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        subtotal,
        taxAmount,
        total,
        notes: data.notes || null,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })

    // Link time entries to invoice
    if (data.timeEntryIds && data.timeEntryIds.length > 0) {
      await prisma.timeEntry.updateMany({
        where: {
          id: { in: data.timeEntryIds },
          userId: user.id,
        },
        data: {
          invoiceId: invoice.id,
        },
      })
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
