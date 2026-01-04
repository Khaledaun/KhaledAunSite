import { z } from 'zod'

// Invoice status enum
export const invoiceStatusEnum = z.enum([
  'DRAFT',
  'SENT',
  'PAID',
  'PARTIAL',
  'OVERDUE',
  'CANCELLED',
])

export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>

// Hebrew labels for invoice status
export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'טיוטה',
  SENT: 'נשלחה',
  PAID: 'שולמה',
  PARTIAL: 'שולמה חלקית',
  OVERDUE: 'באיחור',
  CANCELLED: 'בוטלה',
}

// Status colors for badges
export const invoiceStatusColors: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

// Create invoice schema
export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'לקוח הוא שדה חובה'),
  issueDate: z.string().min(1, 'תאריך הנפקה הוא שדה חובה'),
  dueDate: z.string().min(1, 'תאריך פירעון הוא שדה חובה'),
  timeEntryIds: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
  taxRate: z.number().default(17), // Israeli VAT
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>

// Update invoice schema
export const updateInvoiceSchema = z.object({
  status: invoiceStatusEnum.optional(),
  paidAmount: z.number().optional(),
  paidDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>

// Invoice line item (for display)
export interface InvoiceLineItem {
  id: string
  date: string
  description: string
  duration: number
  hourlyRate: number
  amount: number
}

// Format currency for Israeli Shekels
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Generate invoice number
export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear()
  return `INV-${year}-${sequence.toString().padStart(4, '0')}`
}
