import { z } from 'zod'

export const caseTypeEnum = z.enum(['LITIGATION', 'ARBITRATION', 'MEDIATION', 'ADVISORY', 'TRANSACTION'])
export const practiceAreaEnum = z.enum([
  'CIVIL', 'COMMERCIAL', 'REAL_ESTATE', 'FAMILY', 'CRIMINAL',
  'EMPLOYMENT', 'TORT', 'ADMINISTRATIVE', 'CORPORATE', 'IP', 'TAX', 'BANKRUPTCY'
])
export const caseStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'PENDING', 'ON_HOLD', 'CLOSED', 'WON', 'LOST', 'SETTLED'])
export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export const feeTypeEnum = z.enum(['HOURLY', 'FIXED', 'CONTINGENCY', 'RETAINER', 'HYBRID'])

export const createCaseSchema = z.object({
  clientId: z.string().min(1, 'יש לבחור לקוח'),
  title: z.string().min(2, 'כותרת התיק חייבת להכיל לפחות 2 תווים'),
  caseNumber: z.string().optional().nullable(),
  internalReference: z.string().optional().nullable(),
  caseType: caseTypeEnum.default('LITIGATION'),
  practiceArea: practiceAreaEnum.optional().nullable(),
  court: z.string().optional().nullable(),
  judge: z.string().optional().nullable(),
  status: caseStatusEnum.default('ACTIVE'),
  priority: priorityEnum.default('MEDIUM'),
  openedDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  opposingParty: z.string().optional().nullable(),
  opposingCounsel: z.string().optional().nullable(),
  opposingCounselContact: z.string().optional().nullable(),
  feeType: feeTypeEnum.default('HOURLY'),
  feeAmount: z.number().positive().optional().nullable(),
  retainerAmount: z.number().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
})

export const updateCaseSchema = createCaseSchema.partial().omit({ clientId: true })

export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>

// Hebrew labels
export const caseTypeLabels: Record<string, string> = {
  LITIGATION: 'ליטיגציה',
  ARBITRATION: 'בוררות',
  MEDIATION: 'גישור',
  ADVISORY: 'ייעוץ',
  TRANSACTION: 'עסקה',
}

export const practiceAreaLabels: Record<string, string> = {
  CIVIL: 'אזרחי',
  COMMERCIAL: 'מסחרי',
  REAL_ESTATE: 'מקרקעין',
  FAMILY: 'משפחה',
  CRIMINAL: 'פלילי',
  EMPLOYMENT: 'עבודה',
  TORT: 'נזיקין',
  ADMINISTRATIVE: 'מנהלי',
  CORPORATE: 'תאגידים',
  IP: 'קניין רוחני',
  TAX: 'מס',
  BANKRUPTCY: 'פשיטת רגל',
}

export const caseStatusLabels: Record<string, string> = {
  DRAFT: 'טיוטה',
  ACTIVE: 'פעיל',
  PENDING: 'ממתין',
  ON_HOLD: 'מוקפא',
  CLOSED: 'סגור',
  WON: 'ניצחון',
  LOST: 'הפסד',
  SETTLED: 'פשרה',
}

export const priorityLabels: Record<string, string> = {
  LOW: 'נמוכה',
  MEDIUM: 'בינונית',
  HIGH: 'גבוהה',
  URGENT: 'דחוף',
}

export const feeTypeLabels: Record<string, string> = {
  HOURLY: 'שעתי',
  FIXED: 'גלובלי',
  CONTINGENCY: 'אחוזים',
  RETAINER: 'ריטיינר',
  HYBRID: 'משולב',
}
