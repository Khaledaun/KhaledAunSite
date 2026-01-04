import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/ai/conversations/[id] - Get single conversation
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: conversation, error } = await supabase
      .from('lawra_ai_conversations')
      .select(`
        *,
        client:lawra_clients(id, name),
        case:lawra_cases(id, title)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !conversation) {
      return NextResponse.json({ error: 'שיחה לא נמצאה' }, { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Conversation GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/ai/conversations/[id] - Delete conversation
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('lawra_ai_conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting conversation:', error)
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Conversation DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
