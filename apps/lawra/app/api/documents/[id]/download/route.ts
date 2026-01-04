import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/documents/[id]/download - Download document
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

    // Get document info
    const { data: document, error: fetchError } = await supabase
      .from('lawra_documents')
      .select('filename, storage_path, mime_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'מסמך לא נמצא' }, { status: 404 })
    }

    // Download from storage
    const { data, error: downloadError } = await supabase
      .storage
      .from('documents')
      .download(document.storage_path)

    if (downloadError || !data) {
      console.error('Download error:', downloadError)
      return NextResponse.json({ error: 'שגיאה בהורדת הקובץ' }, { status: 500 })
    }

    // Return file as download
    return new Response(data, {
      headers: {
        'Content-Type': document.mime_type,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(document.filename)}"`,
      },
    })
  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
