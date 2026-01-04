import { z } from 'zod'

export const clientTypeEnum = z.enum(['INDIVIDUAL', 'COMPANY', 'GOVERNMENT'])
export const clientStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'POTENTIAL', 'ARCHIVED'])

export const createClientSchema = z.object({
  name: z.string().min(2, 'השם חייב להכיל לפחות 2 תווים'),
  clientType: clientTypeEnum.default('INDIVIDUAL'),
  idNumber: z.string().optional().nullable(),
  email: z.string().email('כתובת דוא"ל לא תקינה').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  phoneSecondary: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  billingRate: z.number().positive().optional().nullable(),
  paymentTerms: z.number().int().positive().default(30),
  notes: z.string().optional().nullable(),
  status: clientStatusEnum.default('ACTIVE'),
})

export const updateClientSchema = createClientSchema.partial()

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>

// Hebrew labels for client types
export const clientTypeLabels: Record<string, string> = {
  INDIVIDUAL: 'יחיד',
  COMPANY: 'חברה',
  GOVERNMENT: 'גוף ממשלתי',
}

// Hebrew labels for client status
export const clientStatusLabels: Record<string, string> = {
  ACTIVE: 'פעיל',
  INACTIVE: 'לא פעיל',
  POTENTIAL: 'פוטנציאלי',
  ARCHIVED: 'בארכיון',
}
