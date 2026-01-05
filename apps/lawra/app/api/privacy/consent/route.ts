/**
 * Consent Management API
 * Handles user consent for data processing per Amendment 13
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logConsentChange } from '@/lib/security/audit-logger'
import { headers } from 'next/headers'
import { z } from 'zod'

// Current consent form versions - update when forms change
const CONSENT_VERSIONS: Record<string, string> = {
  DATA_PROCESSING: '1.0.0',
  MARKETING: '1.0.0',
  THIRD_PARTY_SHARING: '1.0.0',
  AI_PROCESSING: '1.0.0',
  DATA_RETENTION: '1.0.0',
  CROSS_BORDER_TRANSFER: '1.0.0',
}

// Hebrew consent texts
const CONSENT_TEXTS: Record<string, string> = {
  DATA_PROCESSING: `
אני מסכים/ה לעיבוד הנתונים האישיים שלי לצורך קבלת שירותים משפטיים,
כולל ניהול תיקים, מעקב משימות, וניהול מסמכים.
הנתונים יישמרו בהתאם לחוק הגנת הפרטיות, התשמ"א-1981.
  `.trim(),
  AI_PROCESSING: `
אני מסכים/ה לשימוש בבינה מלאכותית לצורך:
- סיוע במחקר משפטי
- ניתוח מסמכים
- הצעות אוטומטיות
המידע יעובד באופן מאובטח ולא יועבר לצדדים שלישיים.
  `.trim(),
  DATA_RETENTION: `
אני מסכים/ה לשמירת הנתונים שלי למשך 7 שנים לאחר סיום ההתקשרות,
בהתאם לדרישות חוק לשכת עורכי הדין וחוק התיישנות.
  `.trim(),
  MARKETING: `
אני מסכים/ה לקבל עדכונים ומידע שיווקי מהמשרד באימייל או בהודעות טקסט.
ניתן לבטל הסכמה זו בכל עת.
  `.trim(),
  THIRD_PARTY_SHARING: `
אני מסכים/ה לשיתוף מידע עם נותני שירותים חיצוניים הכרחיים
(כגון מומחים, יועצים, בתי משפט) לצורך הטיפול בתיקים שלי.
  `.trim(),
  CROSS_BORDER_TRANSFER: `
אני מסכים/ה להעברת מידע לשרתים מחוץ לישראל,
בכפוף לאמצעי הגנה מתאימים בהתאם לתקנות הגנת הפרטיות.
  `.trim(),
}

const consentSchema = z.object({
  consentType: z.enum([
    'DATA_PROCESSING',
    'MARKETING',
    'THIRD_PARTY_SHARING',
    'AI_PROCESSING',
    'DATA_RETENTION',
    'CROSS_BORDER_TRANSFER',
  ]),
  granted: z.boolean(),
  clientId: z.string().optional(), // If consent is on behalf of a client
})

/**
 * GET - Get current consent status
 */
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')

    // Get all consents for the user (or client)
    const consents = await prisma.consent.findMany({
      where: {
        userId: user.id,
        clientId: clientId || null,
      },
    })

    // Map to a more usable format
    const consentStatus = Object.keys(CONSENT_VERSIONS).reduce(
      (acc, type) => {
        const consent = consents.find((c) => c.consentType === type)
        acc[type] = {
          granted: consent?.granted ?? false,
          grantedAt: consent?.grantedAt,
          revokedAt: consent?.revokedAt,
          version: CONSENT_VERSIONS[type],
          currentVersion: consent?.version,
          needsUpdate: consent?.version !== CONSENT_VERSIONS[type],
          text: CONSENT_TEXTS[type],
        }
        return acc
      },
      {} as Record<string, any>
    )

    return NextResponse.json({
      consents: consentStatus,
      lastUpdated: consents.length > 0
        ? Math.max(...consents.map((c) => c.updatedAt.getTime()))
        : null,
    })
  } catch (error) {
    console.error('Consent GET error:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת ההסכמות' },
      { status: 500 }
    )
  }
}

/**
 * POST - Grant or revoke consent
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = consentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { consentType, granted, clientId } = validation.data
    const headersList = await headers()

    // Upsert consent record
    const consent = await prisma.consent.upsert({
      where: {
        userId_consentType_clientId: {
          userId: user.id,
          consentType: consentType as any,
          clientId: clientId || null,
        },
      },
      create: {
        userId: user.id,
        clientId,
        consentType: consentType as any,
        granted,
        version: CONSENT_VERSIONS[consentType],
        formText: CONSENT_TEXTS[consentType],
        ipAddress: headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   headersList.get('x-real-ip') || null,
        userAgent: headersList.get('user-agent'),
        grantedAt: granted ? new Date() : null,
        revokedAt: granted ? null : new Date(),
      },
      update: {
        granted,
        version: CONSENT_VERSIONS[consentType],
        formText: CONSENT_TEXTS[consentType],
        ipAddress: headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   headersList.get('x-real-ip') || null,
        userAgent: headersList.get('user-agent'),
        grantedAt: granted ? new Date() : undefined,
        revokedAt: granted ? null : new Date(),
      },
    })

    // Log consent change
    await logConsentChange({ userId: user.id }, consentType, granted)

    return NextResponse.json({
      success: true,
      consent: {
        type: consent.consentType,
        granted: consent.granted,
        timestamp: granted ? consent.grantedAt : consent.revokedAt,
      },
      message: granted
        ? 'ההסכמה נרשמה בהצלחה'
        : 'ההסכמה בוטלה בהצלחה',
    })
  } catch (error) {
    console.error('Consent POST error:', error)
    return NextResponse.json(
      { error: 'שגיאה בשמירת ההסכמה' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Revoke all consents (for account deletion)
 */
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Revoke all consents
    await prisma.consent.updateMany({
      where: {
        userId: user.id,
        granted: true,
      },
      data: {
        granted: false,
        revokedAt: new Date(),
      },
    })

    // Log each revocation
    for (const type of Object.keys(CONSENT_VERSIONS)) {
      await logConsentChange({ userId: user.id }, type, false)
    }

    return NextResponse.json({
      success: true,
      message: 'כל ההסכמות בוטלו בהצלחה',
    })
  } catch (error) {
    console.error('Consent DELETE error:', error)
    return NextResponse.json(
      { error: 'שגיאה בביטול ההסכמות' },
      { status: 500 }
    )
  }
}
