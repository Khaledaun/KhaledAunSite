import { z } from 'zod'

// Event type enum
export const eventTypeEnum = z.enum([
  'HEARING',
  'MEETING',
  'DEADLINE',
  'REMINDER',
  'INTERNAL',
  'MARKETING',
  'OTHER',
])

export type EventType = z.infer<typeof eventTypeEnum>

// Hebrew labels for event types
export const eventTypeLabels: Record<EventType, string> = {
  HEARING: 'דיון',
  MEETING: 'פגישה',
  DEADLINE: 'מועד אחרון',
  REMINDER: 'תזכורת',
  INTERNAL: 'פנימי',
  MARKETING: 'שיווק',
  OTHER: 'אחר',
}

// Event type colors
export const eventTypeColors: Record<EventType, string> = {
  HEARING: 'bg-red-500',
  MEETING: 'bg-green-500',
  DEADLINE: 'bg-orange-500',
  REMINDER: 'bg-yellow-500',
  INTERNAL: 'bg-blue-500',
  MARKETING: 'bg-pink-500',
  OTHER: 'bg-gray-500',
}

// Create calendar event schema
export const createCalendarEventSchema = z.object({
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startTime: z.string().min(1, 'שעת התחלה היא שדה חובה'),
  endTime: z.string().min(1, 'שעת סיום היא שדה חובה'),
  allDay: z.boolean().default(false),
  eventType: eventTypeEnum.optional().nullable(),
  caseId: z.string().optional().nullable(),
})

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>

// Update calendar event schema
export const updateCalendarEventSchema = createCalendarEventSchema.partial()

export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>

// Helper to format time range
export function formatTimeRange(start: Date, end: Date, allDay: boolean): string {
  if (allDay) {
    return 'כל היום'
  }

  const startStr = start.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const endStr = end.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${startStr} - ${endStr}`
}
