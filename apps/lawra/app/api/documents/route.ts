import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadDocumentSchema, documentTypes } from '@/lib/schemas/document'

// GET /api/documents - List documents
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const caseId = searchParams.get('caseId')
    const documentType = searchParams.get('documentType')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('lawra_documents')
      .select(`
        *,
        case:lawra_cases(id, title, case_number)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`filename.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (caseId) {
      query = query.eq('case_id', caseId)
    }

    if (documentType && documentTypes.includes(documentType as any)) {
      query = query.eq('document_type', documentType)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: documents, error, count } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json({
      documents,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Documents GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/documents - Upload a document
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const caseId = formData.get('caseId') as string | null
    const documentType = formData.get('documentType') as string | null
    const description = formData.get('description') as string | null
    const tagsRaw = formData.get('tags') as string | null

    if (!file) {
      return NextResponse.json({ error: 'קובץ נדרש' }, { status: 400 })
    }

    // Validate input
    const validationResult = uploadDocumentSchema.safeParse({
      caseId: caseId || undefined,
      documentType: documentType || undefined,
      description: description || undefined,
      tags: tagsRaw ? JSON.parse(tagsRaw) : undefined,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^א-תa-zA-Z0-9._-]/g, '_')
    const storagePath = caseId
      ? `${user.id}/${caseId}/${timestamp}_${sanitizedFilename}`
      : `${user.id}/general/${timestamp}_${sanitizedFilename}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'שגיאה בהעלאת הקובץ' }, { status: 500 })
    }

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from('lawra_documents')
      .insert({
        user_id: user.id,
        case_id: caseId || null,
        filename: file.name,
        storage_path: uploadData.path,
        mime_type: file.type,
        size: file.size,
        document_type: documentType || null,
        description: description || null,
        tags: validationResult.data.tags || [],
      })
      .select()
      .single()

    if (dbError) {
      // Clean up uploaded file on DB error
      await supabase.storage.from('documents').remove([uploadData.path])
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'שגיאה ביצירת רשומת המסמך' }, { status: 500 })
    }

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Documents POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
