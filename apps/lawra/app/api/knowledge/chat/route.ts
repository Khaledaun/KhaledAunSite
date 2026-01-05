import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  knowledgeTypeLabels,
  practiceAreaLabels,
  type KnowledgeType,
  type PracticeArea,
} from '@/lib/schemas/knowledge'

const KNOWLEDGE_AGENT_PROMPT = `אתה סוכן AI מתקדם לניהול מאגר ידע משפטי בעברית.

## יכולות
1. **מענה על שאלות** - חפש מידע משפטי רלוונטי ותן תשובות מדויקות
2. **ניתוח מסמכים** - קרא מסמכים שהועלו וזהה את סוגם ותוכנם
3. **סיווג אוטומטי** - סווג מסמכים לקטגוריה המתאימה במאגר
4. **בקשת הקשר** - אם חסר מידע, בקש מהמשתמש הסבר נוסף

## סוגי מסמכים במאגר
${Object.entries(knowledgeTypeLabels).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## תחומי משפט
${Object.entries(practiceAreaLabels).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## פורמט תשובה
תמיד החזר JSON בפורמט הבא:
{
  "message": "התשובה שלך למשתמש בעברית",
  "needsContext": true/false,
  "contextQuestion": "שאלה ספציפית אם צריך מידע נוסף",
  "suggestedCategory": {
    "type": "סוג המסמך מהרשימה",
    "practiceArea": "תחום המשפט או null",
    "tags": ["תגיות", "רלוונטיות"]
  },
  "documentData": null או {
    "title": "כותרת",
    "type": "סוג",
    "practiceArea": "תחום או null",
    "content": "תוכן",
    "summary": "תקציר",
    "citation": "ציטוט משפטי או null",
    "tags": ["תגיות"]
  },
  "saveDocument": true/false
}

## הנחיות
- אם הועלה מסמך, נתח אותו והציע סיווג
- אם המשתמש מאשר את הסיווג, סמן saveDocument: true
- אם חסר מידע קריטי (כמו מה המסמך מייצג), בקש הקשר
- תן תשובות ממוקדות וברורות בעברית
- השתמש בידע שלך בדין הישראלי`

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { message, files, conversationHistory, pendingContextResponse } = body

    // Build the conversation context
    let contextMessages: { role: 'user' | 'assistant'; content: string }[] = []

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      contextMessages = conversationHistory.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
    }

    // Build current message with file contents
    let currentMessage = message || ''

    if (files && files.length > 0) {
      currentMessage += '\n\n--- מסמכים שהועלו ---\n'
      for (const file of files) {
        currentMessage += `\n📄 ${file.name} (${file.type}):\n`
        if (file.content) {
          // Handle base64 encoded content
          if (file.content.startsWith('data:')) {
            currentMessage += '[מסמך בינארי - נא לבקש מהמשתמש תיאור]'
          } else {
            // Text content - limit to first 5000 chars
            currentMessage += file.content.slice(0, 5000)
            if (file.content.length > 5000) {
              currentMessage += '\n... (קוצר)'
            }
          }
        }
      }
    }

    // If this is a context response, add that info
    if (pendingContextResponse) {
      currentMessage = `[תשובה להקשר המבוקש]: ${currentMessage}`
    }

    // Add current message
    contextMessages.push({
      role: 'user',
      content: currentMessage,
    })

    // Call Claude
    const result = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: KNOWLEDGE_AGENT_PROMPT,
      messages: contextMessages,
      maxTokens: 2000,
    })

    // Parse the response
    let responseData
    try {
      // Extract JSON from response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        responseData = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON, create a simple response
        responseData = {
          message: result.text,
          needsContext: false,
          saveDocument: false,
        }
      }
    } catch {
      responseData = {
        message: result.text,
        needsContext: false,
        saveDocument: false,
      }
    }

    // Save document if requested
    let saved = false
    if (responseData.saveDocument && responseData.documentData) {
      try {
        await prisma.knowledgeItem.create({
          data: {
            userId: user.id,
            title: responseData.documentData.title,
            type: responseData.documentData.type as KnowledgeType,
            practiceArea: responseData.documentData.practiceArea as PracticeArea | null,
            content: responseData.documentData.content,
            summary: responseData.documentData.summary || null,
            citation: responseData.documentData.citation || null,
            tags: responseData.documentData.tags || [],
            isPublic: false,
          },
        })
        saved = true
        responseData.message += '\n\n✅ המסמך נשמר במאגר הידע בהצלחה!'
      } catch (error) {
        console.error('Failed to save document:', error)
        responseData.message += '\n\n❌ שגיאה בשמירת המסמך. אנא נסה שוב.'
      }
    }

    return NextResponse.json({
      message: responseData.message,
      needsContext: responseData.needsContext || false,
      contextQuestion: responseData.contextQuestion,
      suggestedCategory: responseData.suggestedCategory,
      saved,
    })
  } catch (error) {
    console.error('Knowledge chat error:', error)
    return NextResponse.json(
      { error: 'שגיאה בעיבוד הבקשה' },
      { status: 500 }
    )
  }
}
