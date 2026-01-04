# Legal Documents Skill

> Best practices for generating, editing, and managing legal documents in LaWra AI.

---

## Overview

LaWra AI generates professional legal documents in Hebrew using the `docx` library. Documents are created from templates with placeholder replacement and optional AI enhancement.

---

## Template Structure

### Template Location
```
public/templates/
├── litigation/
│   ├── claim.docx           # כתב תביעה
│   ├── defense.docx         # כתב הגנה
│   ├── reply.docx           # כתב תשובה
│   ├── motion.docx          # בקשה
│   ├── urgent-motion.docx   # בקשה דחופה
│   └── affidavit.docx       # תצהיר
├── contracts/
│   ├── retainer.docx        # הסכם שכר טרחה
│   ├── nda.docx             # הסכם סודיות
│   └── general.docx         # חוזה כללי
├── letters/
│   ├── demand.docx          # מכתב התראה
│   └── opinion.docx         # חוות דעת
└── court/
    └── power-of-attorney.docx # ייפוי כוח
```

### Placeholder Format

Use double curly braces for variables:

```
{{client.name}}
{{client.idNumber}}
{{case.number}}
{{case.court}}
{{case.judge}}
{{opposingParty.name}}
{{today}}
{{user.name}}
{{user.licenseNumber}}
```

---

## Implementation

### Document Generator

```typescript
// lib/documents/generator.ts
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx'

interface DocumentData {
  client: {
    name: string
    idNumber?: string
    address?: string
  }
  case?: {
    number: string
    court: string
    judge?: string
    title: string
  }
  opposingParty?: {
    name: string
    counsel?: string
  }
  user: {
    name: string
    licenseNumber: string
    firmName: string
    firmAddress: string
  }
  customFields?: Record<string, string>
}

export async function generateDocument(
  templateId: string,
  data: DocumentData
): Promise<Buffer> {
  // 1. Load template content
  const template = await loadTemplate(templateId)
  
  // 2. Replace placeholders
  const content = replacePlaceholders(template, data)
  
  // 3. Build document
  const doc = buildDocument(content, templateId)
  
  // 4. Generate buffer
  return await Packer.toBuffer(doc)
}

function replacePlaceholders(
  content: string,
  data: DocumentData
): string {
  const placeholders: Record<string, string> = {
    'client.name': data.client.name,
    'client.idNumber': data.client.idNumber || '',
    'client.address': data.client.address || '',
    'case.number': data.case?.number || '',
    'case.court': data.case?.court || '',
    'case.judge': data.case?.judge || '',
    'case.title': data.case?.title || '',
    'opposingParty.name': data.opposingParty?.name || '',
    'opposingParty.counsel': data.opposingParty?.counsel || '',
    'user.name': data.user.name,
    'user.licenseNumber': data.user.licenseNumber,
    'user.firmName': data.user.firmName,
    'user.firmAddress': data.user.firmAddress,
    'today': formatHebrewDate(new Date()),
    ...data.customFields,
  }
  
  let result = content
  for (const [key, value] of Object.entries(placeholders)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  
  return result
}
```

### Hebrew Formatting

```typescript
// Hebrew date formatting
function formatHebrewDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Example: "5 בינואר 2025"

// Document with RTL
function buildDocument(content: string, templateId: string): Document {
  return new Document({
    sections: [{
      properties: {
        // RTL document
        bidi: true,
      },
      children: [
        // Header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          children: [
            new TextRun({
              text: getDocumentTitle(templateId),
              bold: true,
              size: 32,
              font: 'David',
            }),
          ],
        }),
        // Content paragraphs...
      ],
    }],
  })
}
```

---

## Court Document Standards

### Israeli Court Requirements

1. **Paper Size**: A4
2. **Margins**: 2.5cm all sides
3. **Font**: David or Arial, 12pt
4. **Line Spacing**: 1.5
5. **Numbering**: Continuous paragraph numbering
6. **Header**: Case number and parties on every page
7. **Footer**: Page numbers

### Case Number Format

```typescript
// Israeli court case number
// Format: CC: {number}-{month}-{year}
// Example: CC: 12345-10-25

function formatCaseNumber(
  number: string,
  month: number,
  year: number
): string {
  const monthStr = month.toString().padStart(2, '0')
  const yearStr = (year % 100).toString().padStart(2, '0')
  return `CC: ${number}-${monthStr}-${yearStr}`
}
```

### Document Types (סוגי מסמכים)

| Hebrew | English | Document Code |
|--------|---------|---------------|
| כתב תביעה | Claim | CLAIM |
| כתב הגנה | Defense | DEFENSE |
| כתב תשובה | Reply | REPLY |
| תביעה שכנגד | Counterclaim | COUNTERCLAIM |
| בקשה | Motion | MOTION |
| בקשה דחופה | Urgent Motion | URGENT_MOTION |
| בקשה במעמד צד אחד | Ex Parte | EX_PARTE |
| תצהיר | Affidavit | AFFIDAVIT |
| חוות דעת מומחה | Expert Opinion | EXPERT_OPINION |
| ראיה | Evidence | EVIDENCE |
| פסק דין | Judgment | JUDGMENT |
| החלטה | Decision | DECISION |
| צו | Order | ORDER |

---

## AI Enhancement

### Available Enhancements

```typescript
type EnhancementType = 
  | 'improve-language'    // שפר ניסוח
  | 'add-citations'       // הוסף אסמכתאות
  | 'shorten'            // קצר
  | 'expand'             // הרחב
  | 'translate'          // תרגם לאנגלית

async function enhanceDocument(
  content: string,
  enhancementType: EnhancementType,
  context?: { caseType?: string; practiceArea?: string }
): Promise<string> {
  const prompts: Record<EnhancementType, string> = {
    'improve-language': `
      שפר את הניסוח המשפטי של הטקסט הבא.
      שמור על התוכן המקורי אך הפוך את השפה ליותר מקצועית ומדויקת.
      השתמש בשפה משפטית מקובלת בישראל.
    `,
    'add-citations': `
      הוסף אסמכתאות משפטיות רלוונטיות לטקסט הבא.
      התמקד בפסיקה ישראלית עדכנית.
      הוסף הפניות לחוקים רלוונטיים.
    `,
    // ... other prompts
  }
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: prompts[enhancementType],
    messages: [{ role: 'user', content }],
  })
  
  return response.content[0].text
}
```

---

## File Handling

### Upload Flow

```typescript
// API route: POST /api/documents/upload
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const formData = await req.formData()
  
  const file = formData.get('file') as File
  const caseId = formData.get('caseId') as string
  const documentType = formData.get('documentType') as string
  
  // 1. Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('documents')
    .upload(`${caseId}/${file.name}`, file)
  
  if (uploadError) throw uploadError
  
  // 2. Extract text if PDF
  let extractedText = null
  if (file.type === 'application/pdf') {
    extractedText = await extractPdfText(file)
  }
  
  // 3. Create document record
  const document = await prisma.document.create({
    data: {
      userId: user.id,
      caseId,
      filename: file.name,
      storagePath: uploadData.path,
      mimeType: file.type,
      size: file.size,
      documentType,
      extractedText,
    },
  })
  
  return NextResponse.json(document)
}
```

### Download Flow

```typescript
// API route: GET /api/documents/[id]/download
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const document = await prisma.document.findUnique({
    where: { id: params.id },
  })
  
  if (!document) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .storage
    .from('documents')
    .download(document.storagePath)
  
  if (error) throw error
  
  return new Response(data, {
    headers: {
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.filename}"`,
    },
  })
}
```

---

## Best Practices

### 1. Template Maintenance

- Keep templates in version control
- Review templates quarterly for legal updates
- Test with sample data before deployment

### 2. Error Handling

```typescript
try {
  const buffer = await generateDocument(templateId, data)
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}.docx"`,
    },
  })
} catch (error) {
  if (error instanceof TemplateNotFoundError) {
    return NextResponse.json({ error: 'תבנית לא נמצאה' }, { status: 404 })
  }
  if (error instanceof MissingDataError) {
    return NextResponse.json({ error: 'חסרים נתונים נדרשים', details: error.fields }, { status: 400 })
  }
  throw error
}
```

### 3. Security

- Validate all input data
- Sanitize user-provided content
- Check user permissions before generation
- Log all document generations for audit

### 4. Performance

- Cache compiled templates
- Generate documents asynchronously for large files
- Use streaming for downloads

---

## Dependencies

```json
{
  "docx": "^8.5.0",
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.6.0"
}
```

---

*Always test generated documents in Microsoft Word and LibreOffice for compatibility.*
