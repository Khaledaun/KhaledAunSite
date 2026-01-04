import { z } from 'zod'

// Activity type enum
export const activityTypeEnum = z.enum([
  'RESEARCH',
  'DRAFTING',
  'REVIEW',
  'COURT_APPEARANCE',
  'NEGOTIATION',
  'MEETING_CLIENT',
  'MEETING_OTHER',
  'EMAIL',
  'PHONE_CALL',
  'CORRESPONDENCE',
  'TRAVEL',
  'FILING',
  'ADMINISTRATIVE',
])

export type ActivityType = z.infer<typeof activityTypeEnum>

// Hebrew labels for activity types
export const activityTypeLabels: Record<ActivityType, string> = {
  RESEARCH: 'מחקר משפטי',
  DRAFTING: 'ניסוח מסמכים',
  REVIEW: 'עיון ובדיקה',
  COURT_APPEARANCE: 'הופעה בבית משפט',
  NEGOTIATION: 'משא ומתן',
  MEETING_CLIENT: 'פגישת לקוח',
  MEETING_OTHER: 'פגישה אחרת',
  EMAIL: 'דואר אלקטרוני',
  PHONE_CALL: 'שיחת טלפון',
  CORRESPONDENCE: 'התכתבות',
  TRAVEL: 'נסיעה',
  FILING: 'הגשת מסמכים',
  ADMINISTRATIVE: 'מנהלי',
}

// Create time entry schema
export const createTimeEntrySchema = z.object({
  date: z.string().min(1, 'תאריך הוא שדה חובה'),
  durationMinutes: z.number().int().min(1, 'משך הזמן חייב להיות לפחות דקה אחת'),
  description: z.string().min(1, 'תיאור הוא שדה חובה'),
  activityType: activityTypeEnum.optional().nullable(),
  caseId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  taskId: z.string().optional().nullable(),
  isBillable: z.boolean().default(true),
  hourlyRate: z.number().optional().nullable(),
})

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>

// Update time entry schema
export const updateTimeEntrySchema = createTimeEntrySchema.partial().extend({
  invoiceId: z.string().optional().nullable(),
})

export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>

// Time entry filters
export const timeEntryFiltersSchema = z.object({
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isBillable: z.boolean().optional(),
  invoiced: z.boolean().optional(),
})

export type TimeEntryFilters = z.infer<typeof timeEntryFiltersSchema>

// Helper to format duration
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) {
    return `${mins} דק'`
  }
  if (mins === 0) {
    return `${hours} ש'`
  }
  return `${hours}:${mins.toString().padStart(2, '0')} ש'`
}

// Helper to parse duration string (e.g., "1:30" -> 90 minutes)
export function parseDurationString(duration: string): number | null {
  // Try HH:MM format
  const colonMatch = duration.match(/^(\d+):(\d{1,2})$/)
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10)
    const minutes = parseInt(colonMatch[2], 10)
    if (minutes < 60) {
      return hours * 60 + minutes
    }
  }

  // Try decimal hours (e.g., 1.5 -> 90 minutes)
  const decimalMatch = duration.match(/^(\d+(?:\.\d+)?)$/)
  if (decimalMatch) {
    const hours = parseFloat(decimalMatch[1])
    return Math.round(hours * 60)
  }

  // Try minutes only
  const minutesMatch = duration.match(/^(\d+)\s*(?:דק|min|m)?$/)
  if (minutesMatch) {
    return parseInt(minutesMatch[1], 10)
  }

  return null
}
