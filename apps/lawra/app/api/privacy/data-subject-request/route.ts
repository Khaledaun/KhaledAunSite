/**
 * Data Subject Rights API
 * Handles access, correction, deletion, and portability requests
 * Per Amendment 13 of Israeli Privacy Protection Law
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logDataSubjectRequest } from '@/lib/security/audit-logger'
import { RESPONSE_TIMEFRAMES, DataSubjectRight } from '@/lib/security/compliance'
import { z } from 'zod'

const requestSchema = z.object({
  rightType: z.enum(['ACCESS', 'CORRECTION', 'DELETION', 'PORTABILITY', 'OBJECTION']),
  description: z.string().optional(),
  correctionData: z.record(z.unknown()).optional(), // For CORRECTION requests
})

/**
 * POST - Submit a new data subject request
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = requestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { rightType, description, correctionData } = validation.data

    // Calculate deadline based on right type
    const deadlineDays = RESPONSE_TIMEFRAMES[rightType as DataSubjectRight]
    const deadlineAt = new Date()
    deadlineAt.setDate(deadlineAt.getDate() + deadlineDays)

    // Create the request
    const request = await prisma.dataSubjectRequest.create({
      data: {
        requesterId: user.id,
        requesterType: 'USER',
        requesterEmail: user.email!,
        rightType: rightType as any,
        description,
        verificationMethod: 'AUTHENTICATED_SESSION',
        verifiedAt: new Date(),
        deadlineAt,
        responseData: correctionData ? { correctionData } : undefined,
      },
    })

    // Log the request
    await logDataSubjectRequest(
      { userId: user.id },
      request.id,
      rightType,
      'PENDING'
    )

    return NextResponse.json({
      success: true,
      requestId: request.id,
      message: getResponseMessage(rightType),
      deadlineAt,
    })
  } catch (error) {
    console.error('Data subject request error:', error)
    return NextResponse.json(
      { error: 'שגיאה בהגשת הבקשה' },
      { status: 500 }
    )
  }
}

/**
 * GET - Check status of existing requests or get user data (ACCESS right)
 */
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const requestId = searchParams.get('requestId')

    // Get specific request status
    if (requestId) {
      const request = await prisma.dataSubjectRequest.findFirst({
        where: {
          id: requestId,
          requesterId: user.id,
        },
      })

      if (!request) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }

      return NextResponse.json({ request })
    }

    // Export all user data (DATA_ACCESS implementation)
    if (action === 'export') {
      const userData = await collectUserData(user.id)

      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        userId: user.id,
        email: user.email,
        data: userData,
      })
    }

    // List all requests
    const requests = await prisma.dataSubjectRequest.findMany({
      where: { requesterId: user.id },
      orderBy: { requestedAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Data subject GET error:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הנתונים' },
      { status: 500 }
    )
  }
}

/**
 * Collect all user data for export (Right of Access)
 */
async function collectUserData(userId: string) {
  const [clients, cases, tasks, timeEntries, invoices, documents, consents] =
    await Promise.all([
      prisma.client.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          clientType: true,
          email: true,
          phone: true,
          address: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.case.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          caseNumber: true,
          caseType: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.task.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          createdAt: true,
        },
      }),
      prisma.timeEntry.findMany({
        where: { userId },
        select: {
          id: true,
          date: true,
          durationMinutes: true,
          description: true,
          isBillable: true,
          createdAt: true,
        },
      }),
      prisma.invoice.findMany({
        where: { userId },
        select: {
          id: true,
          invoiceNumber: true,
          issueDate: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.document.findMany({
        where: { userId },
        select: {
          id: true,
          filename: true,
          documentType: true,
          createdAt: true,
        },
      }),
      prisma.consent.findMany({
        where: { userId },
        select: {
          consentType: true,
          granted: true,
          grantedAt: true,
          revokedAt: true,
        },
      }),
    ])

  return {
    clients,
    cases,
    tasks,
    timeEntries,
    invoices,
    documents,
    consents,
  }
}

function getResponseMessage(rightType: string): string {
  const messages: Record<string, string> = {
    ACCESS: 'בקשת העיון התקבלה. תקבל את המידע תוך 30 יום.',
    CORRECTION: 'בקשת התיקון התקבלה. נבדוק ונעדכן תוך 30 יום.',
    DELETION: 'בקשת המחיקה התקבלה. נטפל בה תוך 30 יום.',
    PORTABILITY: 'בקשת הניידות התקבלה. תקבל את הקובץ תוך 30 יום.',
    OBJECTION: 'ההתנגדות התקבלה. נבחן אותה תוך 14 יום.',
  }
  return messages[rightType] || 'הבקשה התקבלה.'
}
