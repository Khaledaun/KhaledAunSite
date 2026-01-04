# LaWra AI - Claude Code Implementation Guide

## 🎯 Project Overview

**LaWra AI** is a legal practice management system built for Israeli law firms. It's being added to an existing monorepo (`KhaledAunSite`) that already has:
- `apps/admin` - Marketing dashboard
- `apps/site` - Public website (khaledaun.com)
- `packages/db` - Prisma + Supabase
- `packages/auth` - Supabase Auth

We are adding `apps/lawra` - the main legal practice management app.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: Supabase Auth (already configured)
- **AI**: Anthropic Claude API (already installed: `@ai-sdk/anthropic`)
- **UI**: Tailwind CSS + Radix UI primitives
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: dnd-kit
- **Rich Text**: TipTap
- **Documents**: docx library for Word generation

### Language & RTL
- Primary language: **Hebrew** (RTL)
- Secondary: English
- Root HTML has `dir="rtl"` and `lang="he"`
- Use Heebo font for Hebrew text
- Use logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`)
- Numbers, emails, case numbers remain LTR

---

## 📁 Project Structure

```
apps/lawra/
├── app/
│   ├── (auth)/                    # Public auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/               # Protected app pages
│   │   ├── layout.tsx             # Sidebar + Header
│   │   ├── dashboard/page.tsx     # Home dashboard
│   │   ├── cases/                 # תיקים
│   │   │   ├── page.tsx           # List all cases
│   │   │   ├── new/page.tsx       # Create case
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Case detail
│   │   │       ├── documents/page.tsx
│   │   │       ├── tasks/page.tsx
│   │   │       └── timeline/page.tsx
│   │   ├── clients/               # לקוחות (CRM)
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── tasks/                 # ניהול משימות
│   │   │   └── page.tsx           # Kanban board
│   │   ├── documents/             # מפעל מסמכים
│   │   │   ├── page.tsx           # Document factory
│   │   │   └── templates/page.tsx
│   │   ├── legal-mind/            # AI Assistant
│   │   │   └── page.tsx           # Chat interface
│   │   ├── finance/               # כספים וחיובים
│   │   │   ├── page.tsx
│   │   │   ├── time-entries/page.tsx
│   │   │   └── invoices/page.tsx
│   │   ├── knowledge/             # מאגר ידע
│   │   │   └── page.tsx
│   │   ├── court-system/          # נט המשפט
│   │   │   └── page.tsx
│   │   ├── marketing/             # שיווק (migrated from admin)
│   │   │   └── page.tsx
│   │   ├── settings/page.tsx
│   │   └── team/page.tsx
│   ├── api/
│   │   ├── clients/route.ts
│   │   ├── cases/route.ts
│   │   ├── tasks/route.ts
│   │   ├── documents/
│   │   │   ├── route.ts
│   │   │   ├── generate/route.ts  # AI document generation
│   │   │   └── upload/route.ts
│   │   ├── ai/
│   │   │   ├── chat/route.ts      # Legal Mind chat
│   │   │   ├── summarize/route.ts
│   │   │   └── agents/[clientId]/route.ts
│   │   ├── time-entries/route.ts
│   │   ├── invoices/route.ts
│   │   └── calendar/
│   │       ├── route.ts
│   │       └── sync/route.ts      # Outlook/Google sync
│   └── layout.tsx
├── components/
│   ├── ui/                        # Base UI (shadcn-style)
│   ├── layout/                    # Sidebar, Header
│   ├── dashboard/                 # Dashboard widgets
│   ├── cases/                     # Case-specific components
│   ├── clients/                   # Client components
│   ├── tasks/                     # Task board components
│   ├── documents/                 # Document components
│   ├── ai/                        # AI chat components
│   └── shared/                    # Reusable components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── ai/
│   │   ├── claude.ts              # Claude client setup
│   │   ├── agents/                # Per-client AI agents
│   │   │   ├── index.ts
│   │   │   └── client-agent.ts
│   │   └── prompts/               # System prompts
│   │       ├── legal-assistant.ts
│   │       ├── document-generator.ts
│   │       └── summarizer.ts
│   ├── documents/
│   │   ├── templates/             # DOCX templates
│   │   └── generator.ts           # Document generation logic
│   ├── hooks/                     # Custom React hooks
│   ├── stores/                    # Zustand stores
│   └── utils.ts
└── public/
    └── templates/                 # Downloadable templates
```

---

## 🎨 Design System

### Color Palette
```css
/* Primary - LaWra Blue */
--primary: #3b82f6;
--primary-hover: #2563eb;

/* Status Colors */
--status-active: #22c55e;    /* Green */
--status-pending: #f59e0b;   /* Amber */
--status-urgent: #ef4444;    /* Red */
--status-completed: #6b7280; /* Gray */

/* Calendar Event Colors */
--calendar-meeting: #22c55e;   /* Green */
--calendar-hearing: #ef4444;   /* Red */
--calendar-deadline: #f97316;  /* Orange */
--calendar-internal: #3b82f6;  /* Blue */
--calendar-marketing: #ec4899; /* Pink */
```

### Typography
- **Hebrew**: Heebo (Google Font)
- **English/Numbers**: Inter
- Use `font-medium` for labels, `font-semibold` for headings

### Component Patterns
- **Cards**: `rounded-2xl border shadow-sm p-4`
- **Sidebar items**: Active state uses primary bg with white text
- **Avatars**: Circular with colored backgrounds and white initials
- **Tables**: Clean with hover states, no heavy borders
- **Forms**: Labels above inputs, validation below

### Responsive Breakpoints
- Mobile: < 768px (sidebar collapses to hamburger)
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 📊 Database Schema

The Prisma schema is in `packages/db/prisma/lawra-schema.prisma`. Key models:

### Core Models
| Model | Hebrew | Description |
|-------|--------|-------------|
| `Client` | לקוח | Individual or company |
| `Case` | תיק | Legal matter/case |
| `Task` | משימה | Action item |
| `Document` | מסמך | Files and generated docs |
| `TimeEntry` | רישום זמן | Billable time tracking |
| `CalendarEvent` | אירוע | Appointments, hearings |
| `Invoice` | חשבונית | Billing |
| `KnowledgeItem` | מאגר ידע | Legal reference material |
| `AIConversation` | שיחת AI | Chat history per client |
| `TeamMember` | חבר צוות | User roles |

### Key Relationships
```
Client 1:N Cases
Case 1:N Tasks
Case 1:N Documents
Case 1:N TimeEntries
Case 1:N CalendarEvents
Client 1:N AIConversations (per-client AI memory)
```

---

## 🔄 Detailed Workflows

### Workflow 1: Adding a New Client (הוספת לקוח)

**UI Flow:**
1. User clicks "לקוח חדש" button in Clients page header
2. Modal/drawer opens with form
3. Form fields:
   - שם לקוח (Client Name) - required
   - סוג (Type): יחיד/חברה/ממשלתי (Individual/Company/Government)
   - ת.ז/ח.פ (ID Number) - optional
   - טלפון (Phone) - LTR input
   - אימייל (Email) - LTR input
   - כתובת (Address)
   - תעריף שעתי (Hourly Rate) - number, LTR
   - תנאי תשלום (Payment Terms) - dropdown: 30/60/90 days
   - הערות (Notes)
4. On submit: validate with Zod, POST to `/api/clients`
5. Success: toast notification, redirect to client detail page
6. Client detail page shows:
   - Client info card
   - Cases list (empty initially)
   - Activity timeline
   - Quick actions: "פתח תיק חדש", "הוסף משימה"

**API Route (`/api/clients/route.ts`):**
```typescript
// POST - Create client
// GET - List clients with filters (status, type, search)
// Uses Prisma through shared db package
```

**Component Structure:**
```
components/clients/
├── client-form.tsx          # Reusable form (create/edit)
├── client-card.tsx          # Summary card
├── client-list.tsx          # Table with filters
├── client-detail.tsx        # Full detail view
└── client-activity.tsx      # Timeline component
```

---

### Workflow 2: Opening a New Case (פתיחת תיק)

**UI Flow:**
1. From client page OR cases page, click "תיק חדש"
2. If from cases page, first select client (searchable dropdown)
3. Case creation form:
   - כותרת (Title) - required
   - מספר תיק (Case Number) - auto-generated or manual
   - סוג תיק (Case Type): ליטיגציה/בוררות/ייעוץ/עסקה
   - תחום משפטי (Practice Area): dropdown
   - בית משפט (Court) - optional
   - שופט (Judge) - optional
   - צד שכנגד (Opposing Party)
   - ב"כ צד שכנגד (Opposing Counsel)
   - סוג שכ"ט (Fee Type): שעתי/גלובלי/אחוזים
   - סכום (Amount)
   - מועד יעד (Deadline) - date picker
   - תיאור (Description) - rich text
   - תגיות (Tags) - multi-select
4. On save: create case, redirect to case detail

**Case Detail Page Tabs:**
- סקירה (Overview): Status, key dates, progress bar
- מסמכים (Documents): File list + upload
- משימות (Tasks): Mini task board
- זמנים (Time): Time entries for this case
- לוח זמנים (Timeline): All activity

**Case Number Format:**
- Israeli court: `CC: 12345-10-25` (Court type: case#-month-year)
- Internal: `INT-2025-0001`

---

### Workflow 3: Task Management (ניהול משימות)

**Kanban Board Structure:**
```
Columns (TaskStatus enum):
├── תיבת דואר (INBOX)      # New/unsorted
├── לביצוע (TODO)          # Planned
├── בעבודה (IN_PROGRESS)   # Active
├── לבדיקה (REVIEW)        # Needs review
└── הושלם (DONE)           # Completed
```

**UI Features:**
1. Drag-and-drop between columns (dnd-kit)
2. Each card shows:
   - Task title
   - Due date (color-coded if overdue)
   - Assignee avatar(s)
   - Case/client badge
   - Priority indicator
3. Quick add: Text input at top of each column
4. Click card → Side drawer with full details
5. Filters: By case, by assignee, by date range
6. Views: Kanban (default), List, Calendar

**Task Detail Drawer:**
- Title (editable inline)
- Description (TipTap editor)
- Due date + time
- Assignees (multi-select team members)
- Related case (link)
- Time estimate
- Subtasks/checklist
- Comments/activity

**Recurring Tasks:**
- Support RRULE format
- Common presets: Daily, Weekly, Monthly, Before court date

---

### Workflow 4: Document Factory (מפעל מסמכים)

**Template Library:**
```
templates/
├── litigation/              # ליטיגציה
│   ├── claim.docx          # כתב תביעה
│   ├── defense.docx        # כתב הגנה
│   ├── reply.docx          # כתב תשובה
│   ├── motion.docx         # בקשה
│   └── affidavit.docx      # תצהיר
├── contracts/              # חוזים
│   ├── retainer.docx       # הסכם שכ"ט
│   ├── nda.docx            # הסכם סודיות
│   └── general.docx        # חוזה כללי
├── letters/                # מכתבים
│   ├── demand.docx         # מכתב התראה
│   └── opinion.docx        # חוות דעת
└── court/                  # בית משפט
    └── power-of-attorney.docx # ייפוי כוח
```

**Document Generation Flow:**
1. User selects template category
2. Selects specific template
3. System auto-populates fields from:
   - Selected case data
   - Client data
   - Logged-in user data
4. User reviews/edits in rich text editor
5. Options:
   - Download as DOCX
   - Save to case documents
   - Send via email
   - AI enhancement (improve language, add citations)

**AI Document Enhancement:**
- "שפר ניסוח" (Improve wording)
- "הוסף אסמכתאות" (Add citations)
- "קצר" / "הרחב" (Shorten/Expand)
- "תרגם לאנגלית" (Translate to English)

**Implementation:**
```typescript
// lib/documents/generator.ts
import { Document, Packer, Paragraph } from 'docx'

export async function generateDocument(
  templateId: string,
  data: DocumentData,
  options?: GenerationOptions
): Promise<Buffer> {
  // 1. Load template
  // 2. Replace placeholders: {{client.name}}, {{case.number}}, etc.
  // 3. Apply formatting
  // 4. Return DOCX buffer
}
```

---

### Workflow 5: Legal Mind AI (בינה מלאכותית)

**Chat Interface Features:**
1. Full-page chat UI similar to Claude.ai
2. Message history persisted per conversation
3. Context awareness:
   - Can reference current case if viewing from case page
   - Can search knowledge base
   - Remembers client context (per-client agent)

**System Prompts:**

```typescript
// lib/ai/prompts/legal-assistant.ts
export const LEGAL_ASSISTANT_PROMPT = `
אתה עוזר משפטי מומחה בשם "לורה" (LaWra).
אתה מסייע לעורכי דין ישראליים בעבודתם היומיומית.

יכולות:
- מענה על שאלות משפטיות בדין הישראלי
- סיכום מסמכים משפטיים
- הצעת טיעונים וטקטיקות
- חיפוש במאגר הידע של המשרד
- עזרה בניסוח מסמכים

הנחיות:
- תמיד ציין שאתה AI ולא תחליף לייעוץ משפטי
- אם אינך בטוח, אמור זאת
- השתמש בשפה משפטית מקצועית אך ברורה
- הפנה לפסיקה רלוונטית כשאפשר
`
```

**Per-Client AI Agent (Memory):**
```typescript
// Each client gets their own conversation context
interface ClientAgent {
  clientId: string
  context: {
    clientSummary: string      // Auto-generated from client data
    caseHistory: string[]      // Summaries of client's cases
    preferences: string[]      // Communication preferences
    importantDates: Date[]     // Key dates to remember
  }
  conversations: AIConversation[]
}
```

**AI Actions:**
- `/summarize [document]` - Summarize uploaded document
- `/draft [type]` - Start document draft
- `/research [topic]` - Search knowledge base
- `/timeline [case]` - Generate case timeline
- `/remind` - Set reminder based on conversation

**Implementation:**
```typescript
// app/api/ai/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { messages, clientId, caseId } = await req.json()
  
  // Build context from client/case data
  const context = await buildContext(clientId, caseId)
  
  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: LEGAL_ASSISTANT_PROMPT + context,
    messages,
  })
  
  return result.toDataStreamResponse()
}
```

---

### Workflow 6: Time Tracking & Billing (רישום זמנים וחיובים)

**Time Entry Methods:**
1. **Manual entry**: Form with date, duration, description, activity type
2. **Timer**: Start/stop timer while working
3. **AI capture**: "רשום שעה על מחקר בתיק כהן" via Legal Mind

**Time Entry Form:**
- תאריך (Date) - default today
- משך (Duration) - hours:minutes or timer
- תיק (Case) - searchable dropdown
- סוג פעילות (Activity Type): מחקר/ניסוח/דיון/פגישה/etc.
- תיאור (Description) - required for billing
- לחיוב? (Billable) - checkbox, default true

**Invoice Generation:**
1. Select client
2. Select date range
3. System pulls all unbilled time entries
4. Auto-calculates:
   - Hours × Rate per activity
   - Subtotal
   - VAT (17% in Israel)
   - Total
5. Generate invoice number: `INV-2025-0001`
6. Export options: PDF, send email, mark as sent

**Dashboard Metrics:**
- שעות השבוע (Hours this week)
- שעות לא מחויבות (Unbilled hours)
- הכנסות החודש (Revenue this month)
- יעד חודשי (Monthly target) - progress bar

---

### Workflow 7: Calendar & Court Dates (יומן ודיונים)

**Event Types:**
| Type | Hebrew | Color | Auto-reminder |
|------|--------|-------|---------------|
| HEARING | דיון | Red | 1 week, 1 day |
| MEETING | פגישה | Green | 1 day |
| DEADLINE | מועד אחרון | Orange | 3 days, 1 day |
| INTERNAL | פנימי | Blue | None |

**Calendar Views:**
- Month view (default)
- Week view
- Day view
- Agenda list

**Integration:**
1. **Outlook Sync** (Microsoft Graph API):
   - Two-way sync
   - Map event types
   - Handle conflicts
2. **Google Calendar** (optional):
   - OAuth2 flow
   - Similar mapping

**Court Date Workflow:**
1. Create event type "דיון"
2. Link to case
3. System auto-creates preparation tasks:
   - "הכן לדיון" - 3 days before
   - "בדוק מסמכים" - 1 day before
4. Send reminder emails to client

---

### Workflow 8: Knowledge Base (מאגר ידע)

**Content Types:**
- מאמרים (Articles)
- פסקי דין (Court decisions)
- תבניות (Templates)
- מזכרים פנימיים (Internal memos)
- נהלים (Procedures)

**Features:**
1. Full-text search (Hebrew + English)
2. Category filtering
3. Tag-based organization
4. AI-powered semantic search (embeddings)
5. Citation linking

**Sources:**
- Internal uploads
- Takdin integration (future)
- Nevo integration (future)
- Net-Hamishpat (future)

**AI Integration:**
- Auto-summarize uploaded PDFs
- Extract key points and citations
- Generate embeddings for semantic search
- Answer questions based on knowledge base

---

### Workflow 9: Marketing Dashboard (שיווק)

**Migrate from `apps/admin`:**
- Lead tracking
- Campaign management
- Website analytics
- Content calendar
- Social media scheduling

**New Features:**
- Client acquisition funnel
- ROI per marketing channel
- Referral tracking
- Newsletter management

---

## 🔐 Authentication & Authorization

**Auth Flow (Supabase):**
1. Email/password login
2. Google OAuth option
3. Magic link option
4. Session stored in cookies

**Role-Based Access:**
```typescript
enum TeamRole {
  ADMIN      // Full access
  PARTNER    // Full access, billing
  ASSOCIATE  // Case access, no billing settings
  PARALEGAL  // Limited case access
  SECRETARY  // Calendar, basic tasks
}
```

**Row-Level Security:**
- Users see only their firm's data
- Implement via Supabase RLS policies
- `userId` on every table

---

## 📱 Mobile Responsiveness

**Sidebar Behavior:**
- Desktop: Always visible, 256px width
- Tablet: Collapsible, overlay
- Mobile: Bottom navigation bar instead

**Priority Mobile Views:**
1. Dashboard (simplified widgets)
2. Tasks (swipeable cards)
3. Calendar (agenda view default)
4. Legal Mind chat

---

## 🚀 Implementation Order

### Phase 1: Foundation (Week 1)
1. ✅ Project setup in monorepo
2. ✅ Layout (Sidebar, Header)
3. ✅ Dashboard page with widgets
4. [ ] Authentication pages
5. [ ] Database migrations

### Phase 2: Core CRUD (Week 2-3)
1. [ ] Clients module (list, create, detail)
2. [ ] Cases module (list, create, detail)
3. [ ] Link clients ↔ cases
4. [ ] Basic task list (no Kanban yet)

### Phase 3: Documents (Week 4)
1. [ ] File upload to Supabase Storage
2. [ ] Document list per case
3. [ ] Template library
4. [ ] DOCX generation with docx library

### Phase 4: Tasks & Calendar (Week 5)
1. [ ] Kanban board with dnd-kit
2. [ ] Calendar view
3. [ ] Event creation
4. [ ] Recurring tasks

### Phase 5: Legal Mind AI (Week 6)
1. [ ] Chat interface
2. [ ] Claude integration
3. [ ] Document summarization
4. [ ] Per-client agents
5. [ ] Knowledge base search

### Phase 6: Billing (Week 7)
1. [ ] Time entry forms
2. [ ] Timer component
3. [ ] Invoice generation
4. [ ] PDF export

### Phase 7: Integrations (Week 8)
1. [ ] Outlook calendar sync
2. [ ] Email integration
3. [ ] Marketing module migration

### Phase 8: Polish (Week 9-10)
1. [ ] Mobile optimization
2. [ ] Performance tuning
3. [ ] Error handling
4. [ ] Testing
5. [ ] Documentation

---

## 📋 Component Checklist

### UI Components (shadcn-style)
- [x] Button
- [x] Input
- [x] Avatar
- [x] Checkbox
- [x] Dropdown Menu
- [x] Toast/Toaster
- [x] Skeleton
- [ ] Dialog/Modal
- [ ] Sheet (side drawer)
- [ ] Select
- [ ] Tabs
- [ ] Table
- [ ] Badge
- [ ] Card
- [ ] Calendar (date picker)
- [ ] Popover
- [ ] Command (search)
- [ ] Form components
- [ ] Data table with sorting/filtering

### Feature Components
- [x] Sidebar
- [x] Header
- [x] Dashboard widgets (4)
- [ ] Client form
- [ ] Client list/table
- [ ] Case form
- [ ] Case detail tabs
- [ ] Task card
- [ ] Kanban board
- [ ] Document uploader
- [ ] Document generator
- [ ] Chat message
- [ ] Chat input
- [ ] Time entry form
- [ ] Timer widget
- [ ] Invoice preview
- [ ] Calendar month view
- [ ] Event form

---

## 🔧 Environment Variables

Add to `.env`:
```env
# Existing (from your setup)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# LaWra specific
ANTHROPIC_API_KEY=your_claude_api_key

# Optional integrations
MICROSOFT_CLIENT_ID=for_outlook_sync
MICROSOFT_CLIENT_SECRET=for_outlook_sync
GOOGLE_CLIENT_ID=for_google_calendar
GOOGLE_CLIENT_SECRET=for_google_calendar
```

---

## 🧪 Testing Strategy

**Unit Tests:**
- Utility functions
- Form validation
- API route handlers

**Integration Tests:**
- Database operations
- Auth flows
- AI chat

**E2E Tests (Playwright):**
- Client creation flow
- Case management flow
- Document generation

---

## 📚 Reference Documents

The following PDF documents contain the complete business plan and feature specifications:

1. `__תקציר_מנהלים_.pdf` - Executive summary in Hebrew
2. `lawra_ai_comprehensive_business_booklet_2.pdf` - Full business booklet

Key sections to reference:
- 4-Brain Architecture (General, Domestic, Academic, End User)
- Privacy-first local processing
- University partnership model
- Market analysis and competitive positioning

---

## 💡 Key Design Decisions

1. **Hebrew-first**: All UI text in Hebrew, code/comments in English
2. **RTL-native**: Use logical properties, not physical (left/right)
3. **Offline-capable**: Cache critical data for court use
4. **AI-augmented, not AI-replaced**: Lawyers remain in control
5. **Privacy by design**: Sensitive data stays local when possible
6. **Incremental adoption**: Each module works standalone

---

## 🎯 Success Metrics

1. **User Efficiency**: Reduce document creation time by 80%
2. **Billing Accuracy**: Capture 95%+ of billable time
3. **Deadline Compliance**: Zero missed court dates
4. **Client Satisfaction**: Easy communication and updates
5. **AI Trust**: 90%+ accuracy on legal research

---

## Commands to Get Started

```bash
# 1. Navigate to project
cd /path/to/KhaledAunSite

# 2. Extract LaWra app (if using zip)
unzip lawra-starter.zip

# 3. Install dependencies
pnpm install

# 4. Generate Prisma client
pnpm db:generate

# 5. Push schema to database
npx prisma db push

# 6. Run development server
pnpm dev:lawra

# Open http://localhost:3002
```

---

## Questions to Ask Before Starting

1. What Supabase project URL should I use?
2. Should I create new database tables or use existing?
3. What's the Claude API key?
4. Do you want me to implement auth first or use existing?
5. Should marketing module be migrated now or later?

---

*This document serves as the single source of truth for LaWra AI development. Update it as decisions are made.*
