import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/ai/conversations - List conversations
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const caseId = searchParams.get('caseId')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('lawra_ai_conversations')
      .select(`
        id,
        title,
        agent_type,
        client_id,
        case_id,
        created_at,
        updated_at,
        client:lawra_clients(id, name),
        case:lawra_cases(id, title)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (caseId) {
      query = query.eq('case_id', caseId)
    }

    const { data: conversations, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Conversations GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/ai/conversations - Create new conversation
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, clientId, caseId, agentType } = body

    const { data: conversation, error } = await supabase
      .from('lawra_ai_conversations')
      .insert({
        user_id: user.id,
        title: title || 'שיחה חדשה',
        client_id: clientId || null,
        case_id: caseId || null,
        agent_type: agentType || 'general',
        messages: [],
        context: {},
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Conversations POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
