import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { documentTemplates, templateCategories, templateCategoryLabels } from '@/lib/schemas/document'

// GET /api/documents/templates - Get available templates
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    let templates = documentTemplates

    // Filter by category if specified
    if (category && templateCategories.includes(category as any)) {
      templates = templates.filter(t => t.category === category)
    }

    // Group by category
    const grouped = templateCategories.reduce((acc, cat) => {
      const categoryTemplates = templates.filter(t => t.category === cat)
      if (categoryTemplates.length > 0) {
        acc.push({
          id: cat,
          name: templateCategoryLabels[cat],
          templates: categoryTemplates,
        })
      }
      return acc
    }, [] as { id: string; name: string; templates: typeof documentTemplates }[])

    return NextResponse.json({
      templates,
      categories: grouped,
    })
  } catch (error) {
    console.error('Templates GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
