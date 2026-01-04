# LaWra AI - Implementation Plan

> **Created**: January 2025
> **Goal**: Build a fully functional Hebrew-first legal practice management system

---

## Executive Summary

LaWra AI is a legal practice management system for Israeli law firms featuring:
- **4-Brain AI Architecture**: General, Domestic (Israeli law), Academic, End-User brains
- **Hebrew-First RTL Interface**: All UI in Hebrew with proper RTL support
- **Core Features**: Clients, Cases, Tasks (Kanban), Documents, AI Chat, Time/Billing, Calendar

---

## Implementation Phases

### Phase 2: Authentication (Priority: HIGH)

**Goal**: Secure the application with Supabase Auth

| Task | Description | Files |
|------|-------------|-------|
| 2.1 | Enhance middleware to protect all `/` routes | `apps/lawra/middleware.ts` |
| 2.2 | Create login page with Hebrew UI | `apps/lawra/app/login/page.tsx` |
| 2.3 | Create register page | `apps/lawra/app/register/page.tsx` |
| 2.4 | Create user profile page | `apps/lawra/app/settings/profile/page.tsx` |
| 2.5 | Add auth context provider | `apps/lawra/components/providers/auth-provider.tsx` |
| 2.6 | Create logout functionality | Sidebar logout button |

**Acceptance Criteria**:
- [ ] Unauthenticated users redirected to `/login`
- [ ] Login/Register forms validate input with Zod
- [ ] User session persists across page refreshes
- [ ] Profile page shows user info and allows updates

---

### Phase 3: Core CRUD - Clients & Cases (Priority: HIGH)

**Goal**: Full client and case management with relationships

#### 3.1 Clients Module (לקוחות)

| Task | Description | Files |
|------|-------------|-------|
| 3.1.1 | Client list page with DataTable | `app/(dashboard)/clients/page.tsx` |
| 3.1.2 | Client create form (modal or page) | `app/(dashboard)/clients/new/page.tsx` |
| 3.1.3 | Client detail page with tabs | `app/(dashboard)/clients/[id]/page.tsx` |
| 3.1.4 | Client edit functionality | `app/(dashboard)/clients/[id]/edit/page.tsx` |
| 3.1.5 | Client API routes | `app/api/clients/route.ts`, `[id]/route.ts` |
| 3.1.6 | Client Zod schema | `lib/schemas/client.ts` |

**Client Fields**:
- name (שם), type (סוג: יחיד/חברה/ממשלתי)
- email, phone, address
- billingRate (תעריף לשעה), paymentTerms (תנאי תשלום)
- status (פעיל/לא פעיל), notes

**List Features**:
- Search by name/email
- Filter by type, status
- Sort by name, createdAt
- Pagination (20 per page)

#### 3.2 Cases Module (תיקים)

| Task | Description | Files |
|------|-------------|-------|
| 3.2.1 | Case list page with filters | `app/(dashboard)/cases/page.tsx` |
| 3.2.2 | Case create form (multi-step) | `app/(dashboard)/cases/new/page.tsx` |
| 3.2.3 | Case detail page with 5 tabs | `app/(dashboard)/cases/[id]/page.tsx` |
| 3.2.4 | Case edit functionality | Built into detail page |
| 3.2.5 | Case API routes | `app/api/cases/route.ts`, `[id]/route.ts` |
| 3.2.6 | Case Zod schema | `lib/schemas/case.ts` |

**Case Fields**:
- title (שם התיק), caseNumber (מספר תיק)
- clientId (לקוח), caseType (סוג: ליטיגציה/בוררות/ייעוץ)
- practiceArea (תחום: אזרחי/מסחרי/נדל"ן/משפחה)
- status (סטטוס: טיוטה/פעיל/ממתין/סגור)
- courtName, courtFileNumber
- deadline (מועד סיום), description

**Detail Page Tabs**:
1. **סקירה** (Overview): Status card, key dates, financials
2. **מסמכים** (Documents): File list with upload
3. **משימות** (Tasks): Mini Kanban for this case
4. **זמנים** (Time): Time entries table
5. **לוח זמנים** (Timeline): Activity log

**Acceptance Criteria**:
- [ ] Client-Case relationship works (select client when creating case)
- [ ] Case number auto-generates if not provided (INT-2025-0001)
- [ ] Case detail shows all related documents, tasks, time entries
- [ ] Quick status change from case card
- [ ] Filter cases by client, status, practice area

---

### Phase 4: Tasks Kanban (Priority: HIGH)

**Goal**: Drag-and-drop task management board

| Task | Description | Files |
|------|-------------|-------|
| 4.1 | Kanban board component | `components/tasks/kanban-board.tsx` |
| 4.2 | Kanban column component | `components/tasks/kanban-column.tsx` |
| 4.3 | Task card component | `components/tasks/task-card.tsx` |
| 4.4 | dnd-kit integration | Install + configure |
| 4.5 | Task create/edit drawer | `components/tasks/task-drawer.tsx` |
| 4.6 | Quick add in column | Inline input at bottom of column |
| 4.7 | Task API routes | `app/api/tasks/route.ts`, `reorder/route.ts` |
| 4.8 | Task filters | By case, assignee, due date |

**Kanban Columns** (Hebrew):
1. תיבת דואר (INBOX) - gray
2. לביצוע (TODO) - blue
3. בעבודה (IN_PROGRESS) - yellow
4. לבדיקה (REVIEW) - purple
5. הושלם (DONE) - green

**Task Card Shows**:
- Title, due date (color-coded: red if overdue, orange if today)
- Case badge (if linked), priority indicator
- Assignee avatars

**Drag-Drop Logic**:
- Optimistic UI update
- PATCH `/api/tasks/reorder` on drop
- Handles cross-column moves

**Acceptance Criteria**:
- [ ] Smooth drag-and-drop between columns
- [ ] Tasks persist after drag
- [ ] Quick add creates task in column
- [ ] Filter reduces visible cards
- [ ] Link task to case works

---

### Phase 5: Documents (Priority: MEDIUM)

**Goal**: Upload files and generate documents from templates

| Task | Description | Files |
|------|-------------|-------|
| 5.1 | Document list page | `app/(dashboard)/documents/page.tsx` |
| 5.2 | File upload component | `components/documents/file-upload.tsx` |
| 5.3 | Supabase Storage integration | `lib/supabase/storage.ts` |
| 5.4 | Template library page | `app/(dashboard)/documents/templates/page.tsx` |
| 5.5 | Document generator | `app/(dashboard)/documents/generate/page.tsx` |
| 5.6 | DOCX generation service | `lib/documents/generator.ts` |
| 5.7 | Document API routes | `app/api/documents/route.ts`, `generate/route.ts` |

**Template Categories**:
- ליטיגציה: כתב תביעה, כתב הגנה, בקשה, תצהיר
- חוזים: הסכם שכ"ט, הסכם סודיות, הסכם כללי
- מכתבים: מכתב התראה, חוות דעת, מכתב ללקוח

**Upload Flow**:
1. Drag-drop or click to upload
2. Validate file type (PDF, DOCX, images)
3. Upload to Supabase Storage
4. Save metadata to database
5. Optional: Link to case

**Generate Flow**:
1. Select template category → specific template
2. Select case (auto-fills client, case info)
3. Fill remaining variables in form
4. Preview in modal
5. Download DOCX or save to case

**Acceptance Criteria**:
- [ ] Files upload to Supabase Storage successfully
- [ ] Documents linked to cases appear in case detail
- [ ] Template generation produces valid DOCX
- [ ] Hebrew text renders correctly in generated docs

---

### Phase 6: Legal Mind AI (Priority: MEDIUM)

**Goal**: Chat interface with Claude, context-aware legal AI

| Task | Description | Files |
|------|-------------|-------|
| 6.1 | Chat page layout | `app/(dashboard)/ai/page.tsx` |
| 6.2 | Chat message component | `components/ai/chat-message.tsx` |
| 6.3 | Chat input component | `components/ai/chat-input.tsx` |
| 6.4 | Streaming API route | `app/api/ai/chat/route.ts` |
| 6.5 | Claude integration | `lib/ai/claude.ts` |
| 6.6 | System prompt (Hebrew) | `lib/ai/prompts.ts` |
| 6.7 | Per-client context | `app/api/ai/agents/[clientId]/route.ts` |
| 6.8 | Document summarization | `app/api/ai/summarize/route.ts` |

**System Prompt** (Hebrew):
```
אתה עוזר משפטי מומחה בשם "לורה" (LaWra).
אתה מסייע לעורכי דין ישראליים בעבודתם היומיומית.
אתה מבין את המשפט הישראלי, פסיקה, ונהלים של בתי המשפט.
ענה תמיד בעברית, אלא אם המשתמש מבקש אחרת.
```

**Features**:
- Streaming responses (SSE)
- Context from current case (if accessed from case page)
- Conversation history (stored in AIConversation model)
- Quick actions: `/summarize`, `/draft`, `/research`

**Acceptance Criteria**:
- [ ] Messages stream in real-time
- [ ] AI responds in Hebrew by default
- [ ] Conversation persists across sessions
- [ ] Can reference case context

---

### Phase 7: Time & Billing (Priority: MEDIUM)

**Goal**: Track billable time, generate invoices

| Task | Description | Files |
|------|-------------|-------|
| 7.1 | Time entry form | `components/time/time-entry-form.tsx` |
| 7.2 | Timer widget | `components/time/timer-widget.tsx` |
| 7.3 | Time entries list | `app/(dashboard)/time/page.tsx` |
| 7.4 | Invoice list page | `app/(dashboard)/invoices/page.tsx` |
| 7.5 | Invoice create page | `app/(dashboard)/invoices/new/page.tsx` |
| 7.6 | Invoice detail/PDF | `app/(dashboard)/invoices/[id]/page.tsx` |
| 7.7 | Time API routes | `app/api/time-entries/route.ts` |
| 7.8 | Invoice API routes | `app/api/invoices/route.ts` |

**Time Entry Fields**:
- date, durationMinutes (or start/end time)
- caseId, activityType (מחקר/ניסוח/דיון/פגישה)
- description, billable (boolean)
- hourlyRate (from client or override)

**Timer Widget**:
- Floating in corner, minimizable
- Start/Stop/Pause buttons
- Select case while running
- Auto-creates time entry on stop

**Invoice Generation**:
1. Select client
2. Select unbilled time entries (checkboxes)
3. Auto-calculate: Subtotal, VAT (17%), Total
4. Invoice number auto-generated: INV-2025-0001
5. Export as PDF

**Acceptance Criteria**:
- [ ] Timer persists across page navigation
- [ ] Time entries link to cases correctly
- [ ] Invoice calculates VAT at 17%
- [ ] PDF generates with Hebrew text

---

### Phase 8: Calendar (Priority: LOW)

**Goal**: Event management with calendar views

| Task | Description | Files |
|------|-------------|-------|
| 8.1 | Calendar page layout | `app/(dashboard)/calendar/page.tsx` |
| 8.2 | Month view component | `components/calendar/month-view.tsx` |
| 8.3 | Week view component | `components/calendar/week-view.tsx` |
| 8.4 | Event create/edit modal | `components/calendar/event-modal.tsx` |
| 8.5 | Calendar API routes | `app/api/calendar/route.ts` |
| 8.6 | Court date auto-tasks | Create prep tasks for hearings |

**Event Types** (with colors):
- דיון (HEARING) - Red 🔴
- פגישה (MEETING) - Green 🟢
- מועד אחרון (DEADLINE) - Orange 🟠
- פנימי (INTERNAL) - Blue 🔵

**Acceptance Criteria**:
- [ ] Month view shows event dots
- [ ] Week view shows time blocks
- [ ] Events link to cases
- [ ] Court dates auto-create reminder tasks

---

## Technical Standards

### RTL/Hebrew Rules
```tsx
// Always use logical properties
className="ms-4 me-2 ps-3 pe-1"  // ✅ Correct
className="ml-4 mr-2 pl-3 pr-1"  // ❌ Wrong

// Numbers/emails always LTR
<input dir="ltr" className="text-left" />

// Directional icons flip
<ChevronLeft className="rtl-flip" />
```

### API Route Pattern
```typescript
// app/api/[resource]/route.ts
import { createClient } from '@/lib/supabase/server'
import { resourceSchema } from '@/lib/schemas'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... fetch data with Prisma
}

export async function POST(req: Request) {
  // Validate with Zod
  const result = resourceSchema.safeParse(await req.json())
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  // ... create with Prisma
}
```

### Component Pattern
```tsx
'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function ClientForm({ clientId }: Props) {
  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', type: 'INDIVIDUAL' }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => fetch('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { /* invalidate queries, redirect */ }
  })

  return (
    <form onSubmit={form.handleSubmit(mutate)} className="space-y-4">
      {/* Form fields */}
    </form>
  )
}
```

---

## Database Commands

```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Push schema to database (development)
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Run LaWra in development
pnpm dev:lawra
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Research time reduction | 80% (17h → 3.5h) |
| Billable hour capture | 95%+ |
| AI accuracy on legal queries | 90%+ |
| Deadline compliance | 100% |
| Document generation time | 80% faster |

---

## Ready to Start?

**Recommended order**:
1. Phase 3.1: Clients CRUD (foundation for everything)
2. Phase 3.2: Cases CRUD (depends on clients)
3. Phase 4: Kanban (high user value)
4. Phase 6: Legal Mind AI (differentiator)
5. Phase 5: Documents
6. Phase 7: Time & Billing
7. Phase 8: Calendar

Let's build this! 🚀
