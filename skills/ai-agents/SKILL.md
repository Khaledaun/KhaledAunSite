# AI Agents Skill

> Best practices for implementing Claude-powered AI agents in LaWra AI.

---

## Overview

LaWra AI uses Anthropic's Claude API through the Vercel AI SDK to provide:
1. **Legal Mind** - General legal assistant chat
2. **Per-Client Agents** - Context-aware agents with client memory
3. **Document Assistants** - Summarization and enhancement

---

## Architecture

### 4-Brain Concept Implementation

From the business plan, LaWra has a "4-Brain Architecture":

| Brain | Implementation |
|-------|----------------|
| **General (Master)** | Orchestration layer that routes queries |
| **Domestic** | Local knowledge base + Israeli law context |
| **Academic** | Citations, research backing (future: university APIs) |
| **End User** | Per-client memory and personalization |

```typescript
// lib/ai/orchestrator.ts
import { anthropic } from '@ai-sdk/anthropic'
import { generateText, streamText } from 'ai'

interface QueryContext {
  userId: string
  clientId?: string
  caseId?: string
  query: string
  conversationHistory: Message[]
}

export async function processQuery(context: QueryContext) {
  // 1. Determine query type (Master Brain)
  const queryType = await classifyQuery(context.query)
  
  // 2. Gather relevant context
  const domesticContext = await getDomesticContext(context)
  const clientContext = context.clientId 
    ? await getClientContext(context.clientId)
    : null
  
  // 3. Build system prompt with all contexts
  const systemPrompt = buildSystemPrompt({
    queryType,
    domesticContext,
    clientContext,
    userPreferences: await getUserPreferences(context.userId),
  })
  
  // 4. Generate response
  return streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: systemPrompt,
    messages: context.conversationHistory,
  })
}
```

---

## Legal Mind Chat

### System Prompt

```typescript
// lib/ai/prompts/legal-assistant.ts
export const LEGAL_ASSISTANT_PROMPT = `
אתה "לורה" (LaWra), עוזרת משפטית מבוססת בינה מלאכותית.
אתה מסייע לעורכי דין ישראליים בעבודתם היומיומית.

## יכולות
- מענה על שאלות משפטיות בדין הישראלי
- סיכום וניתוח מסמכים משפטיים
- הצעת טיעונים, טקטיקות ואסטרטגיות
- חיפוש במאגר הידע של המשרד
- עזרה בניסוח מסמכים משפטיים
- ניהול משימות ותזכורות

## הנחיות
1. תמיד ציין שאתה AI ולא תחליף לייעוץ משפטי אנושי
2. אם אינך בטוח במידע, אמור זאת במפורש
3. השתמש בשפה משפטית מקצועית אך ברורה
4. הפנה לפסיקה וחקיקה רלוונטית כשאפשר
5. שמור על סודיות - אל תשתף מידע בין לקוחות

## פורמט תשובות
- השב בעברית תקנית
- השתמש בנקודות כשיש רשימה
- הדגש מונחים משפטיים חשובים
- הצע פעולות המשך כשרלוונטי

## הגבלות
- אל תמציא פסקי דין או חוקים
- אל תספק ייעוץ משפטי סופי
- אל תנחש מידע שאינך בטוח בו
`
```

### Streaming Implementation

```typescript
// app/api/ai/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { LEGAL_ASSISTANT_PROMPT } from '@/lib/ai/prompts/legal-assistant'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const { messages, clientId, caseId, conversationId } = await req.json()
  
  // Build context
  let contextPrompt = ''
  
  if (caseId) {
    const caseData = await getCaseContext(caseId)
    contextPrompt += `\n\n## הקשר התיק הנוכחי\n${caseData}`
  }
  
  if (clientId) {
    const clientData = await getClientContext(clientId)
    contextPrompt += `\n\n## הקשר הלקוח\n${clientData}`
  }
  
  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: LEGAL_ASSISTANT_PROMPT + contextPrompt,
    messages,
    onFinish: async ({ text }) => {
      // Save conversation to database
      await saveConversation({
        conversationId,
        userId: user.id,
        clientId,
        caseId,
        messages: [...messages, { role: 'assistant', content: text }],
      })
    },
  })
  
  return result.toDataStreamResponse()
}
```

### Client-Side Hook

```typescript
// lib/hooks/use-chat.ts
import { useChat as useAIChat } from 'ai/react'

interface UseLegalChatOptions {
  clientId?: string
  caseId?: string
  conversationId?: string
}

export function useLegalChat(options: UseLegalChatOptions = {}) {
  return useAIChat({
    api: '/api/ai/chat',
    body: {
      clientId: options.clientId,
      caseId: options.caseId,
      conversationId: options.conversationId,
    },
    onError: (error) => {
      console.error('Chat error:', error)
      // Show toast
    },
  })
}
```

---

## Per-Client Agents

### Client Context Building

```typescript
// lib/ai/agents/client-agent.ts
interface ClientContext {
  clientSummary: string
  caseHistory: string[]
  preferences: string[]
  recentTopics: string[]
  importantDates: { date: Date; description: string }[]
}

export async function getClientContext(clientId: string): Promise<ClientContext> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      cases: {
        select: {
          id: true,
          title: true,
          status: true,
          practiceArea: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      aiConversations: {
        orderBy: { updatedAt: 'desc' },
        take: 5,
      },
    },
  })
  
  if (!client) throw new Error('Client not found')
  
  // Build summary
  const clientSummary = buildClientSummary(client)
  
  // Extract case history
  const caseHistory = client.cases.map(c => 
    `${c.title} (${c.status}) - ${c.practiceArea}`
  )
  
  // Extract recent topics from conversations
  const recentTopics = extractTopics(client.aiConversations)
  
  // Get important dates
  const importantDates = await getImportantDates(clientId)
  
  return {
    clientSummary,
    caseHistory,
    preferences: client.customFields?.preferences || [],
    recentTopics,
    importantDates,
  }
}

function buildClientSummary(client: Client): string {
  return `
לקוח: ${client.name}
סוג: ${client.clientType === 'INDIVIDUAL' ? 'יחיד' : client.clientType === 'COMPANY' ? 'חברה' : 'ממשלתי'}
סטטוס: ${client.status === 'ACTIVE' ? 'פעיל' : 'לא פעיל'}
תיקים פתוחים: ${client.cases.filter(c => c.status === 'ACTIVE').length}
  `.trim()
}
```

### Agent Memory

```typescript
// lib/ai/agents/memory.ts
interface ConversationMemory {
  shortTerm: Message[]  // Last 10 messages
  longTerm: string[]    // Summarized insights
}

export async function updateAgentMemory(
  clientId: string,
  newMessages: Message[]
): Promise<void> {
  const existing = await prisma.aIConversation.findFirst({
    where: { clientId },
    orderBy: { updatedAt: 'desc' },
  })
  
  // Add to short-term memory
  const shortTerm = [
    ...(existing?.messages || []),
    ...newMessages,
  ].slice(-20) // Keep last 20 messages
  
  // If conversation is long, summarize for long-term memory
  if (shortTerm.length >= 20) {
    const summary = await summarizeConversation(shortTerm.slice(0, 10))
    const longTerm = [
      ...(existing?.context?.longTerm || []),
      summary,
    ].slice(-10) // Keep last 10 summaries
    
    await prisma.aIConversation.update({
      where: { id: existing.id },
      data: {
        messages: shortTerm.slice(-10),
        context: { ...existing.context, longTerm },
      },
    })
  } else {
    await prisma.aIConversation.upsert({
      where: { id: existing?.id || 'new' },
      create: {
        clientId,
        userId: getCurrentUserId(),
        agentType: 'client-agent',
        messages: shortTerm,
        context: {},
      },
      update: {
        messages: shortTerm,
      },
    })
  }
}

async function summarizeConversation(messages: Message[]): Promise<string> {
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: 'סכם את השיחה הבאה בעברית, תוך שמירה על נקודות מפתח והעדפות שהתגלו.',
    messages: [{ 
      role: 'user', 
      content: messages.map(m => `${m.role}: ${m.content}`).join('\n') 
    }],
  })
  return text
}
```

---

## Document Assistants

### Summarization

```typescript
// lib/ai/summarize.ts
interface SummaryOptions {
  style: 'brief' | 'detailed' | 'bullet-points'
  maxLength?: number
}

export async function summarizeDocument(
  content: string,
  options: SummaryOptions = { style: 'brief' }
): Promise<{
  summary: string
  keyPoints: string[]
  entities: {
    parties: string[]
    dates: string[]
    amounts: string[]
  }
}> {
  const styleInstructions = {
    brief: 'ספק תקציר קצר של 2-3 משפטים.',
    detailed: 'ספק סיכום מפורט הכולל את כל הנקודות החשובות.',
    'bullet-points': 'ספק סיכום בנקודות תבליט.',
  }
  
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: `
אתה מסכם מסמכים משפטיים בעברית.
${styleInstructions[options.style]}

החזר תשובה בפורמט JSON:
{
  "summary": "הסיכום",
  "keyPoints": ["נקודה 1", "נקודה 2"],
  "entities": {
    "parties": ["צד א", "צד ב"],
    "dates": ["01.01.2025"],
    "amounts": ["₪50,000"]
  }
}
    `,
    messages: [{ role: 'user', content }],
  })
  
  return JSON.parse(text)
}
```

### Document Q&A

```typescript
// lib/ai/document-qa.ts
export async function askAboutDocument(
  documentContent: string,
  question: string
): Promise<string> {
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: `
אתה עונה על שאלות לגבי מסמך משפטי.
הסתמך רק על המידע במסמך.
אם התשובה לא נמצאת במסמך, אמור זאת.
ענה בעברית.
    `,
    messages: [
      { 
        role: 'user', 
        content: `מסמך:\n${documentContent}\n\nשאלה: ${question}` 
      },
    ],
  })
  
  return text
}
```

---

## Action Extraction

### Extracting Actionable Items

```typescript
// lib/ai/actions.ts
interface ExtractedAction {
  type: 'task' | 'reminder' | 'event' | 'document'
  title: string
  details: Record<string, any>
}

export async function extractActions(
  conversation: Message[]
): Promise<ExtractedAction[]> {
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: `
נתח את השיחה וזהה פעולות שצריך לבצע.

החזר JSON:
[
  {
    "type": "task",
    "title": "שם המשימה",
    "details": { "dueDate": "2025-01-10", "priority": "HIGH" }
  }
]

סוגי פעולות אפשריים: task, reminder, event, document
    `,
    messages: [{ 
      role: 'user', 
      content: conversation.map(m => `${m.role}: ${m.content}`).join('\n')
    }],
  })
  
  return JSON.parse(text)
}
```

---

## Safety & Compliance

### Content Filtering

```typescript
// lib/ai/safety.ts
export async function validateResponse(
  response: string,
  context: { clientId?: string }
): Promise<{ safe: boolean; issues: string[] }> {
  // Check for leaked information from other clients
  if (context.clientId) {
    const otherClients = await getOtherClientNames(context.clientId)
    const leaked = otherClients.filter(name => 
      response.toLowerCase().includes(name.toLowerCase())
    )
    if (leaked.length > 0) {
      return { safe: false, issues: ['מידע של לקוחות אחרים נמצא בתשובה'] }
    }
  }
  
  // Check for definitive legal advice
  const definitivePatterns = [
    /אתה חייב ל/,
    /זה בוודאות/,
    /אני מבטיח ש/,
  ]
  const hasDefinitive = definitivePatterns.some(p => p.test(response))
  if (hasDefinitive) {
    return { safe: false, issues: ['תשובה מכילה ייעוץ משפטי סופי'] }
  }
  
  return { safe: true, issues: [] }
}
```

### Rate Limiting

```typescript
// lib/ai/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, '1 h'), // 50 requests per hour
})

export async function checkRateLimit(userId: string): Promise<boolean> {
  const { success, remaining } = await ratelimit.limit(userId)
  
  if (!success) {
    throw new Error(`הגעת למגבלת השימוש. נותרו ${remaining} בקשות.`)
  }
  
  return true
}
```

---

## Error Handling

```typescript
// lib/ai/errors.ts
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export function handleAIError(error: unknown): Response {
  if (error instanceof AIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.retryable ? 503 : 400 }
    )
  }
  
  // Anthropic API errors
  if (error?.message?.includes('rate_limit')) {
    return NextResponse.json(
      { error: 'יותר מדי בקשות. נסה שוב בעוד דקה.', code: 'RATE_LIMIT' },
      { status: 429 }
    )
  }
  
  console.error('AI Error:', error)
  return NextResponse.json(
    { error: 'שגיאה בעיבוד הבקשה', code: 'INTERNAL' },
    { status: 500 }
  )
}
```

---

## Testing

```typescript
// __tests__/ai/chat.test.ts
import { describe, it, expect, vi } from 'vitest'
import { processQuery } from '@/lib/ai/orchestrator'

describe('AI Chat', () => {
  it('should include case context when caseId provided', async () => {
    const mockStream = vi.fn()
    // ... test implementation
  })
  
  it('should not leak client information', async () => {
    const response = await getAIResponse({
      clientId: 'client-1',
      query: 'Tell me about client-2',
    })
    
    expect(response).not.toContain('client-2-secret-info')
  })
})
```

---

## Dependencies

```json
{
  "@ai-sdk/anthropic": "^0.0.39",
  "ai": "^3.4.33",
  "@upstash/ratelimit": "^1.0.0",
  "@upstash/redis": "^1.0.0"
}
```

---

*Always monitor AI usage and costs. Set up alerts for unusual patterns.*
