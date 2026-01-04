# Legal Research Skill

> Best practices for implementing legal research features and Israeli law knowledge base.

---

## Overview

LaWra AI provides legal research capabilities through:
1. Local knowledge base with searchable content
2. AI-powered semantic search
3. Citation management
4. Integration points for external sources (Nevo, Takdin, Net-Hamishpat)

---

## Knowledge Base Schema

```prisma
model KnowledgeItem {
  id              String              @id @default(cuid())
  userId          String              @map("user_id")
  
  // Content
  title           String
  content         String?             // Full text content
  filePath        String?             @map("file_path")
  
  // Classification
  category        KnowledgeCategory   @default(OTHER)
  practiceArea    PracticeArea?       @map("practice_area")
  
  // Search
  tags            String[]            @default([])
  embedding       Float[]?            // Vector for semantic search
  
  // Source
  sourceType      KnowledgeSourceType @default(INTERNAL)
  sourceUrl       String?             @map("source_url")
  citation        String?             // Formatted citation
  
  // Timestamps
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

enum KnowledgeCategory {
  ARTICLE          // מאמר
  COURT_DECISION   // פסק דין
  LEGISLATION      // חקיקה
  TEMPLATE         // תבנית
  INTERNAL_MEMO    // מזכר פנימי
  BOOK             // ספר
  TRAINING         // הדרכה
  PROCEDURE        // נוהל
  OTHER            // אחר
}

enum KnowledgeSourceType {
  INTERNAL         // פנימי
  TAKDIN           // תקדין
  NEVO             // נבו
  NET_HAMISHPAT    // נט המשפט
  ACADEMIC         // אקדמי
  WEB              // אינטרנט
}
```

---

## Israeli Legal Sources

### Court System Hierarchy

```typescript
// lib/legal/courts.ts
export const ISRAELI_COURTS = {
  supreme: {
    he: 'בית המשפט העליון',
    en: 'Supreme Court',
    prefix: 'בג"ץ', // Constitutional matters
    prefixCivil: 'ע"א', // Civil appeals
    prefixCriminal: 'ע"פ', // Criminal appeals
  },
  district: {
    he: 'בית המשפט המחוזי',
    en: 'District Court',
    locations: ['תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'נצרת', 'מרכז'],
    prefix: 'ת"א', // Civil
    prefixCriminal: 'ת"פ',
  },
  magistrate: {
    he: 'בית משפט השלום',
    en: 'Magistrate Court',
    prefix: 'ת"א',
  },
  family: {
    he: 'בית המשפט לענייני משפחה',
    en: 'Family Court',
    prefix: 'תמ"ש',
  },
  labor: {
    he: 'בית הדין לעבודה',
    en: 'Labor Court',
    prefixNational: 'ע"ע', // National appeals
    prefixRegional: 'ס"ע', // Regional
  },
}
```

### Case Citation Format

```typescript
// lib/legal/citations.ts
interface CaseCitation {
  caseNumber: string      // e.g., "1234/20"
  courtPrefix: string     // e.g., "ע"א"
  year: number
  parties?: string        // e.g., "פלוני נ' אלמוני"
  date?: Date
  volume?: string         // פד"י volume
  page?: number
}

export function formatCitation(citation: CaseCitation): string {
  // Standard format: ע"א 1234/20 פלוני נ' אלמוני
  let result = `${citation.courtPrefix} ${citation.caseNumber}`
  
  if (citation.parties) {
    result += ` ${citation.parties}`
  }
  
  if (citation.volume && citation.page) {
    result += `, פ"ד ${citation.volume} ${citation.page}`
  }
  
  return result
}

// Parse citation from text
export function parseCitation(text: string): CaseCitation | null {
  // Match patterns like: ע"א 1234/20, בג"ץ 5678/19
  const pattern = /([א-ת"]+)\s+(\d+\/\d+)/
  const match = text.match(pattern)
  
  if (!match) return null
  
  const [, courtPrefix, caseNumber] = match
  const [num, yearShort] = caseNumber.split('/')
  const year = parseInt(yearShort) + (parseInt(yearShort) > 50 ? 1900 : 2000)
  
  return { courtPrefix, caseNumber, year }
}
```

### Legislation References

```typescript
// lib/legal/legislation.ts
export const MAJOR_LAWS = {
  contracts: {
    he: 'חוק החוזים (חלק כללי), התשל"ג-1973',
    shortHe: 'חוק החוזים',
    en: 'Contracts Law (General Part)',
  },
  torts: {
    he: 'פקודת הנזיקין [נוסח חדש]',
    shortHe: 'פקודת הנזיקין',
    en: 'Civil Wrongs Ordinance',
  },
  companies: {
    he: 'חוק החברות, התשנ"ט-1999',
    shortHe: 'חוק החברות',
    en: 'Companies Law',
  },
  land: {
    he: 'חוק המקרקעין, התשכ"ט-1969',
    shortHe: 'חוק המקרקעין',
    en: 'Land Law',
  },
  labor: {
    he: 'חוק הגנת השכר, התשי"ח-1958',
    shortHe: 'חוק הגנת השכר',
    en: 'Wage Protection Law',
  },
  // ... more laws
}

export function formatLawReference(
  lawKey: string, 
  section?: number,
  subsection?: string
): string {
  const law = MAJOR_LAWS[lawKey]
  if (!law) return ''
  
  let ref = law.shortHe
  if (section) {
    ref += `, סעיף ${section}`
    if (subsection) {
      ref += `(${subsection})`
    }
  }
  
  return ref
}
// Output: "חוק החוזים, סעיף 12(א)"
```

---

## Search Implementation

### Full-Text Search

```typescript
// app/api/knowledge/search/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const category = searchParams.get('category')
  const practiceArea = searchParams.get('practiceArea')
  
  // Using Prisma full-text search (PostgreSQL)
  const results = await prisma.knowledgeItem.findMany({
    where: {
      AND: [
        // Full-text search on title and content
        {
          OR: [
            { title: { search: query } },
            { content: { search: query } },
          ],
        },
        // Filters
        category ? { category } : {},
        practiceArea ? { practiceArea } : {},
      ],
    },
    orderBy: {
      _relevance: {
        fields: ['title', 'content'],
        search: query,
        sort: 'desc',
      },
    },
    take: 20,
  })
  
  return NextResponse.json(results)
}
```

### Semantic Search with Embeddings

```typescript
// lib/knowledge/semantic-search.ts
import { anthropic } from '@ai-sdk/anthropic'
import { embed } from 'ai'

export async function semanticSearch(
  query: string,
  options: { limit?: number; threshold?: number } = {}
): Promise<KnowledgeItem[]> {
  const { limit = 10, threshold = 0.7 } = options
  
  // Generate embedding for query
  const { embedding: queryEmbedding } = await embed({
    model: anthropic.embedding('claude-3-haiku-20240307'), // Use embedding model
    value: query,
  })
  
  // Search in Supabase using vector similarity
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('match_knowledge_items', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
  })
  
  if (error) throw error
  return data
}

// Supabase function (run once to create)
/*
CREATE OR REPLACE FUNCTION match_knowledge_items(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id text,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ki.id,
    ki.title,
    ki.content,
    1 - (ki.embedding <=> query_embedding) as similarity
  FROM lawra_knowledge_items ki
  WHERE 1 - (ki.embedding <=> query_embedding) > match_threshold
  ORDER BY ki.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
*/
```

### Generate Embeddings on Upload

```typescript
// lib/knowledge/embeddings.ts
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: anthropic.embedding('claude-3-haiku-20240307'),
    value: text,
  })
  return embedding
}

export async function indexKnowledgeItem(item: KnowledgeItem): Promise<void> {
  // Combine title and content for embedding
  const textToEmbed = `${item.title}\n\n${item.content || ''}`
  
  // Truncate if too long (model limit)
  const truncated = textToEmbed.slice(0, 8000)
  
  const embedding = await generateEmbedding(truncated)
  
  await prisma.knowledgeItem.update({
    where: { id: item.id },
    data: { embedding },
  })
}
```

---

## AI Research Assistant

### Research Query Handler

```typescript
// lib/ai/research.ts
export async function handleResearchQuery(
  query: string,
  context?: { caseId?: string; practiceArea?: string }
): Promise<ResearchResult> {
  // 1. Search knowledge base
  const knowledgeResults = await semanticSearch(query, { limit: 5 })
  
  // 2. Format context for AI
  const knowledgeContext = knowledgeResults
    .map(item => `
### ${item.title}
${item.content?.slice(0, 500)}...
מקור: ${item.citation || item.sourceType}
    `)
    .join('\n\n')
  
  // 3. Generate response with citations
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: `
אתה עוזר מחקר משפטי. השתמש במידע שסופק כדי לענות על השאלה.
תמיד ציין את המקורות שאתה משתמש בהם.
אם אין מספיק מידע, אמור זאת.

מידע זמין:
${knowledgeContext}
    `,
    messages: [{ role: 'user', content: query }],
  })
  
  return {
    answer: text,
    sources: knowledgeResults.map(r => ({
      id: r.id,
      title: r.title,
      citation: r.citation,
    })),
  }
}
```

### Citation Extraction

```typescript
// lib/ai/extract-citations.ts
export async function extractCitations(
  text: string
): Promise<ExtractedCitation[]> {
  const { text: result } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: `
חלץ את כל האזכורים המשפטיים מהטקסט.
החזר JSON עם מערך של אזכורים:
[
  {
    "type": "case" | "law" | "regulation",
    "text": "הטקסט המלא של האזכור",
    "courtPrefix": "ע"א" (אם רלוונטי),
    "caseNumber": "1234/20" (אם רלוונטי),
    "lawName": "שם החוק" (אם רלוונטי),
    "section": "מספר סעיף" (אם רלוונטי)
  }
]
    `,
    messages: [{ role: 'user', content: text }],
  })
  
  return JSON.parse(result)
}
```

---

## External Source Integration (Future)

### Nevo Integration Point

```typescript
// lib/external/nevo.ts (placeholder)
interface NevoSearchParams {
  query: string
  courtType?: string
  dateFrom?: Date
  dateTo?: Date
  practiceArea?: string
}

export async function searchNevo(params: NevoSearchParams) {
  // Future: Implement Nevo API integration
  // This would require partnership/API access
  throw new Error('Nevo integration not yet implemented')
}
```

### Takdin Integration Point

```typescript
// lib/external/takdin.ts (placeholder)
export async function searchTakdin(query: string) {
  // Future: Implement Takdin API integration
  throw new Error('Takdin integration not yet implemented')
}
```

### Net-Hamishpat Integration

```typescript
// lib/external/net-hamishpat.ts (placeholder)
// Net-Hamishpat is the Israeli court system portal
// Future: Browser extension or API integration

export async function fetchCaseFromNetHamishpat(caseNumber: string) {
  // This would require either:
  // 1. Official API access
  // 2. Browser extension that communicates with the app
  throw new Error('Net-Hamishpat integration not yet implemented')
}
```

---

## Practice Areas

```typescript
// lib/legal/practice-areas.ts
export const PRACTICE_AREAS = {
  CIVIL: { he: 'אזרחי', en: 'Civil' },
  COMMERCIAL: { he: 'מסחרי', en: 'Commercial' },
  REAL_ESTATE: { he: 'מקרקעין', en: 'Real Estate' },
  FAMILY: { he: 'משפחה', en: 'Family' },
  CRIMINAL: { he: 'פלילי', en: 'Criminal' },
  EMPLOYMENT: { he: 'עבודה', en: 'Employment' },
  TORT: { he: 'נזיקין', en: 'Tort' },
  ADMINISTRATIVE: { he: 'מנהלי', en: 'Administrative' },
  CORPORATE: { he: 'תאגידים', en: 'Corporate' },
  IP: { he: 'קניין רוחני', en: 'Intellectual Property' },
  TAX: { he: 'מיסים', en: 'Tax' },
  BANKRUPTCY: { he: 'פשיטת רגל', en: 'Bankruptcy' },
}
```

---

## Best Practices

1. **Always cite sources** - Never make legal claims without attribution
2. **Date awareness** - Laws change; always note the date of information
3. **Jurisdiction clarity** - Israeli law only; flag if user asks about other jurisdictions
4. **Disclaimer** - AI research is a starting point, not legal advice
5. **Version control** - Track changes to knowledge base items

---

*Legal research features should be reviewed by a licensed attorney before deployment.*
