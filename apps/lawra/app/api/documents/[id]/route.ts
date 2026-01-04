import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateDocumentSchema } from '@/lib/schemas/document'

// GET /api/documents/[id] - Get single document
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

    const { data: document, error } = await supabase
      .from('lawra_documents')
      .select(`
        *,
        case:lawra_cases(id, title, case_number)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !document) {
      return NextResponse.json({ error: 'מסמך לא נמצא' }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Document GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/documents/[id] - Update document
export async function PATCH(
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

    const body = await req.json()
    const validationResult = updateDocumentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Check document exists and belongs to user
    const { data: existing } = await supabase
      .from('lawra_documents')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'מסמך לא נמצא' }, { status: 404 })
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (validationResult.data.documentType !== undefined) {
      updateData.document_type = validationResult.data.documentType
    }
    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description
    }
    if (validationResult.data.tags !== undefined) {
      updateData.tags = validationResult.data.tags
    }

    const { data: document, error } = await supabase
      .from('lawra_documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'שגיאה בעדכון המסמך' }, { status: 500 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Document PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/documents/[id] - Delete document
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

    // Get document to delete from storage
    const { data: document, error: fetchError } = await supabase
      .from('lawra_documents')
      .select('storage_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'מסמך לא נמצא' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .remove([document.storage_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue with DB delete even if storage fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('lawra_documents')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'שגיאה במחיקת המסמך' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Document DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
