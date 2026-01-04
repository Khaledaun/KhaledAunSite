import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateInvoiceSchema } from '@/lib/schemas/invoice'
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

    const invoice = await prisma.invoice.findFirst({
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
            address: true,
          },
        },
        timeEntries: {
          orderBy: { date: 'asc' },
          include: {
            case: {
              select: { id: true, title: true },
            },
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
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

    // Verify invoice belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateInvoiceSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const updateData: any = {}

    if (data.status !== undefined) {
      updateData.status = data.status
    }
    if (data.paidAmount !== undefined) {
      updateData.paidAmount = data.paidAmount
      // Auto-update status based on payment
      if (data.paidAmount >= Number(existingInvoice.total)) {
        updateData.status = 'PAID'
      } else if (data.paidAmount > 0) {
        updateData.status = 'PARTIAL'
      }
    }
    if (data.paidDate !== undefined) {
      updateData.paidDate = data.paidDate ? new Date(data.paidDate) : null
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
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

    // Verify invoice belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Only allow deletion of draft invoices
    if (existingInvoice.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      )
    }

    // Unlink time entries before deleting
    await prisma.timeEntry.updateMany({
      where: { invoiceId: params.id },
      data: { invoiceId: null },
    })

    await prisma.invoice.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
