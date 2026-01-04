import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatRequestSchema } from '@/lib/schemas/chat'
import {
  LEGAL_ASSISTANT_PROMPT,
  CASE_CONTEXT_PROMPT,
  CLIENT_CONTEXT_PROMPT,
  PRACTICE_AREA_PROMPTS,
} from '@/lib/ai/prompts'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if ANTHROPIC_API_KEY is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const validationResult = chatRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { messages, clientId, caseId, conversationId } = validationResult.data

    // Build context
    let contextPrompt = ''

    // Add case context if provided
    if (caseId) {
      const { data: caseData } = await supabase
        .from('lawra_cases')
        .select('title, case_number, court, practice_area, description')
        .eq('id', caseId)
        .eq('user_id', user.id)
        .single()

      if (caseData) {
        contextPrompt += CASE_CONTEXT_PROMPT({
          title: caseData.title,
          caseNumber: caseData.case_number,
          court: caseData.court,
          practiceArea: caseData.practice_area,
          description: caseData.description,
        })

        // Add practice area specific guidance
        if (caseData.practice_area && PRACTICE_AREA_PROMPTS[caseData.practice_area]) {
          contextPrompt += `\n\n## הנחיות תחום\n${PRACTICE_AREA_PROMPTS[caseData.practice_area]}`
        }
      }
    }

    // Add client context if provided
    if (clientId) {
      const { data: clientData } = await supabase
        .from('lawra_clients')
        .select('name, client_type')
        .eq('id', clientId)
        .eq('user_id', user.id)
        .single()

      if (clientData) {
        // Get active cases count
        const { count: activeCases } = await supabase
          .from('lawra_cases')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .eq('status', 'ACTIVE')

        contextPrompt += CLIENT_CONTEXT_PROMPT({
          name: clientData.name,
          clientType: clientData.client_type,
          activeCases: activeCases || 0,
        })
      }
    }

    // Build the full system prompt
    const systemPrompt = LEGAL_ASSISTANT_PROMPT + contextPrompt

    // Stream the response
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      onFinish: async ({ text }) => {
        // Save conversation to database
        if (conversationId) {
          // Update existing conversation
          const allMessages = [
            ...messages,
            { role: 'assistant' as const, content: text },
          ]

          await supabase
            .from('lawra_ai_conversations')
            .update({
              messages: allMessages,
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversationId)
            .eq('user_id', user.id)
        } else {
          // Create new conversation
          const title = messages[0]?.content?.slice(0, 50) || 'שיחה חדשה'

          await supabase
            .from('lawra_ai_conversations')
            .insert({
              user_id: user.id,
              client_id: clientId || null,
              case_id: caseId || null,
              agent_type: 'general',
              title,
              messages: [
                ...messages,
                { role: 'assistant', content: text },
              ],
              context: {},
            })
        }
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('AI Chat error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'יותר מדי בקשות. נסה שוב בעוד דקה.' },
          { status: 429 }
        )
      }
      if (error.message.includes('invalid_api_key')) {
        return NextResponse.json(
          { error: 'שגיאה בהגדרות השירות' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'שגיאה בעיבוד הבקשה' },
      { status: 500 }
    )
  }
}
