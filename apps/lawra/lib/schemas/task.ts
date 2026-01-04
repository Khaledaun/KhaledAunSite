import { z } from 'zod'

export const taskStatusEnum = z.enum(['INBOX', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'])
export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

export const createTaskSchema = z.object({
  title: z.string().min(1, 'כותרת המשימה היא שדה חובה'),
  description: z.string().optional().nullable(),
  caseId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  status: taskStatusEnum.default('INBOX'),
  priority: priorityEnum.default('MEDIUM'),
  dueDate: z.string().optional().nullable(),
  estimatedMinutes: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).default([]),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  position: z.number().int().optional(),
})

export const moveTaskSchema = z.object({
  status: taskStatusEnum,
  position: z.number().int(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type MoveTaskInput = z.infer<typeof moveTaskSchema>

// Hebrew labels
export const taskStatusLabels: Record<string, string> = {
  INBOX: 'תיבת דואר',
  TODO: 'לביצוע',
  IN_PROGRESS: 'בעבודה',
  REVIEW: 'לבדיקה',
  DONE: 'הושלם',
  CANCELLED: 'בוטל',
}

export const priorityLabels: Record<string, string> = {
  LOW: 'נמוכה',
  MEDIUM: 'בינונית',
  HIGH: 'גבוהה',
  URGENT: 'דחוף',
}

// Kanban columns configuration
export const kanbanColumns = [
  { id: 'INBOX', title: 'תיבת דואר', color: 'bg-gray-100' },
  { id: 'TODO', title: 'לביצוע', color: 'bg-blue-50' },
  { id: 'IN_PROGRESS', title: 'בעבודה', color: 'bg-yellow-50' },
  { id: 'REVIEW', title: 'לבדיקה', color: 'bg-purple-50' },
  { id: 'DONE', title: 'הושלם', color: 'bg-green-50' },
]
