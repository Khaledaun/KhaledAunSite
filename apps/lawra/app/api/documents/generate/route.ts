import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDocumentSchema, documentTemplates } from '@/lib/schemas/document'
import { generateDocument, getDocumentFilename } from '@/lib/documents/generator'

// POST /api/documents/generate - Generate a document from template
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const validationResult = generateDocumentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Find template
    const template = documentTemplates.find(t => t.id === data.templateId)
    if (!template) {
      return NextResponse.json({ error: 'תבנית לא נמצאה' }, { status: 404 })
    }

    // Generate document
    const buffer = await generateDocument(data.templateId, data)

    // Generate filename
    const filename = getDocumentFilename(data.templateId, data.client.name)

    // Option 1: Return as download
    if (body.download) {
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      })
    }

    // Option 2: Save to storage and create record
    const timestamp = Date.now()
    const storagePath = data.caseId
      ? `${user.id}/${data.caseId}/${timestamp}_${filename}`
      : `${user.id}/generated/${timestamp}_${filename}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'שגיאה בשמירת המסמך' }, { status: 500 })
    }

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from('lawra_documents')
      .insert({
        user_id: user.id,
        case_id: data.caseId || null,
        filename,
        storage_path: uploadData.path,
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: buffer.length,
        document_type: template.documentType,
        description: `נוצר מתבנית: ${template.name}`,
        tags: ['generated', data.templateId],
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'שגיאה ביצירת רשומת המסמך' }, { status: 500 })
    }

    return NextResponse.json({
      document,
      message: 'המסמך נוצר בהצלחה',
    }, { status: 201 })
  } catch (error) {
    console.error('Document generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
