import { z } from 'zod'

// Message schema
export const messageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  createdAt: z.date().optional(),
})

export type Message = z.infer<typeof messageSchema>

// Chat request schema
export const chatRequestSchema = z.object({
  messages: z.array(messageSchema),
  clientId: z.string().optional(),
  caseId: z.string().optional(),
  conversationId: z.string().optional(),
})

export type ChatRequest = z.infer<typeof chatRequestSchema>

// Conversation schema
export const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  clientId: z.string().optional(),
  caseId: z.string().optional(),
  messages: z.array(messageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Conversation = z.infer<typeof conversationSchema>

// Agent types
export const agentTypes = ['general', 'client-agent', 'document-assistant'] as const
export type AgentType = (typeof agentTypes)[number]

export const agentTypeLabels: Record<AgentType, string> = {
  'general': 'עוזר כללי',
  'client-agent': 'סוכן לקוח',
  'document-assistant': 'עוזר מסמכים',
}
