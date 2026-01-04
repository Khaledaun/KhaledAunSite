# CLAUDE.md - LaWra AI Master Project Guide

> **IMPORTANT**: This file is your primary reference. Read it completely before starting any work.

---

## 🚀 Quick Start for Claude Code

You are building **LaWra AI** - a comprehensive legal practice management system for Israeli law firms. The founder, Adv. Khaled Aun, has provided extensive documentation in this repository.

### First Steps (Do This Now)
1. Read this entire file
2. Read `docs/BUSINESS_PLAN.md` for product vision
3. Read the relevant skill file before implementing any feature
4. Check existing code in `apps/lawra/` to understand patterns

### What's Already Built
- ✅ Next.js 14 app structure
- ✅ Dashboard layout (Sidebar + Header)
- ✅ RTL/Hebrew configuration
- ✅ Basic UI components (Button, Input, Avatar, etc.)
- ✅ Prisma schema with all models
- ✅ Supabase integration setup

### What Needs To Be Built (In Order)
1. **Authentication** - Login, register, protected routes
2. **Clients Module** - CRUD for clients (לקוחות)
3. **Cases Module** - CRUD for cases (תיקים)
4. **Tasks Kanban** - Drag-and-drop task board
5. **Document Factory** - Templates + generation
6. **Legal Mind AI** - Chat interface with Claude
7. **Time & Billing** - Time tracking + invoices

---

## 🎯 Project: LaWra AI

**LaWra AI** is a Hebrew-first, RTL legal practice management system for Israeli law firms. This is a new app (`apps/lawra`) being added to the existing `KhaledAunSite` monorepo.

### The Vision (4-Brain Architecture)
From the business plan, LaWra uses a conceptual "4-Brain" AI architecture:
1. **General Brain (Master)** - Orchestrates all AI systems
2. **Domestic Brain** - Israeli law knowledge, local precedents
3. **Academic Brain** - University partnerships, scholarly research
4. **End User Brain** - Per-client memory and personalization

This translates to: context-aware AI that knows Israeli law, remembers client history, and provides personalized assistance.

---

## 📚 Essential Reading Order

Before starting any work, read these documents:

1. **`docs/BUSINESS_PLAN.md`** - Product vision, 4-brain architecture, market context
2. **`docs/IMPLEMENTATION_GUIDE.md`** - Complete technical specification
3. **`docs/DESIGN_SYSTEM.md`** - UI patterns, colors, Hebrew/RTL guidelines
4. **`docs/API_REFERENCE.md`** - All API routes and patterns
5. **`docs/WORKFLOWS.md`** - User flows for each feature

---

## 🛠 Skills Reference

Domain-specific best practices are in the `skills/` folder:

| Skill | Purpose |
|-------|---------|
| `skills/legal-documents/SKILL.md` | DOCX generation, templates, Hebrew formatting |
| `skills/ai-agents/SKILL.md` | Claude integration, per-client memory, prompts |
| `skills/hebrew-rtl/SKILL.md` | RTL patterns, bidirectional text, fonts |
| `skills/legal-research/SKILL.md` | Knowledge base, citations, Israeli law |
| `skills/billing/SKILL.md` | Time tracking, invoices, Israeli tax |

**Always read the relevant SKILL.md before implementing a feature.**

---

## 🏗 Project Structure

```
KhaledAunSite/                    # Existing monorepo
├── apps/
│   ├── admin/                    # Existing marketing dashboard
│   ├── site/                     # Existing public website
│   └── lawra/                    # NEW - LaWra AI app
│       ├── app/                  # Next.js App Router
│       ├── components/           # React components
│       ├── lib/                  # Utilities, AI, Supabase
│       └── public/               # Static assets
├── packages/
│   ├── auth/                     # Shared Supabase auth
│   ├── db/                       # Shared Prisma + schema
│   ├── schemas/                  # Shared Zod schemas
│   └── utils/                    # Shared utilities
├── docs/                         # Project documentation
├── skills/                       # Claude Code skills
└── .claude/                      # Claude Code config
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth |
| AI | Anthropic Claude (`@ai-sdk/anthropic`) |
| UI | Tailwind CSS + Radix UI |
| State | React Query + Zustand |
| Forms | React Hook Form + Zod |
| Drag & Drop | dnd-kit |
| Rich Text | TipTap |
| Documents | docx library |

---

## 🌐 Language & RTL Requirements

**This is a Hebrew-first application.** Critical requirements:

1. **HTML**: `<html lang="he" dir="rtl">`
2. **Font**: Heebo for Hebrew, Inter for English
3. **CSS**: Use logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`)
4. **Inputs**: Numbers, emails, URLs get `dir="ltr"`
5. **Icons**: Directional icons need `rtl-flip` class
6. **UI Text**: All labels in Hebrew (see `docs/TRANSLATIONS.md`)

---

## 📊 Database Models

The Prisma schema is at `packages/db/prisma/lawra-schema.prisma`.

**Core Models:**
- `Client` (לקוח) - Individuals or companies
- `Case` (תיק) - Legal matters
- `Task` (משימה) - Action items
- `Document` (מסמך) - Files and generated docs
- `TimeEntry` (רישום זמן) - Billable time
- `CalendarEvent` (אירוע) - Appointments, hearings
- `Invoice` (חשבונית) - Billing
- `KnowledgeItem` (מאגר ידע) - Legal references
- `AIConversation` (שיחת AI) - Per-client AI memory
- `TeamMember` (חבר צוות) - User roles

---

## 🚀 Implementation Phases

### Phase 1: Foundation ✅
- [x] Project structure
- [x] Dashboard layout
- [x] RTL/Hebrew setup
- [x] Database schema

### Phase 2: Authentication
- [ ] Login page (`/login`)
- [ ] Register page (`/register`)
- [ ] Middleware protection
- [ ] User profile

### Phase 3: Core CRUD
- [ ] Clients module (list, create, detail)
- [ ] Cases module (list, create, detail, tabs)
- [ ] Client ↔ Case relationships

### Phase 4: Tasks
- [ ] Kanban board with dnd-kit
- [ ] Task cards with assignments
- [ ] Quick add functionality
- [ ] Due date tracking

### Phase 5: Documents
- [ ] File upload to Supabase Storage
- [ ] Template library
- [ ] DOCX generation
- [ ] AI document enhancement

### Phase 6: Legal Mind AI
- [ ] Chat interface
- [ ] Claude streaming integration
- [ ] Per-client agents (memory)
- [ ] Document summarization

### Phase 7: Time & Billing
- [ ] Time entry forms
- [ ] Timer component
- [ ] Invoice generation
- [ ] PDF export

### Phase 8: Calendar & Integrations
- [ ] Calendar views
- [ ] Event management
- [ ] Outlook sync (future)

---

## 🎨 UI Patterns

**Follow these patterns consistently:**

### Cards
```tsx
<div className="rounded-2xl border bg-card p-4 shadow-sm">
```

### Forms
```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">שם</Label>
    <Input id="name" {...register('name')} />
    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
  </div>
</form>
```

### Tables
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>שם</TableHead>
      <TableHead>סטטוס</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell><Badge>{item.status}</Badge></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 📝 Coding Standards

### File Naming
- Components: `PascalCase.tsx` → `ClientForm.tsx`
- Pages: `page.tsx` (Next.js convention)
- Utilities: `camelCase.ts` → `formatDate.ts`
- Styles: Component-scoped with Tailwind

### Component Structure
```tsx
'use client' // Only if needed

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  clientId: string
}

export function ClientDetail({ clientId }: Props) {
  // Hooks first
  const [isEditing, setIsEditing] = useState(false)
  
  // Queries
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => fetchClient(clientId),
  })
  
  // Early returns
  if (isLoading) return <Skeleton />
  if (!client) return <NotFound />
  
  // Render
  return (
    <div className="space-y-4">
      {/* ... */}
    </div>
  )
}
```

### API Routes
```typescript
// app/api/clients/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/schemas'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // ... fetch and return data
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()
  
  // Validate
  const result = clientSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  
  // ... create and return
}
```

---

## 🧪 Testing

- Unit tests: Vitest for utilities
- E2E tests: Playwright (existing in `apps/tests`)
- Run: `pnpm test` from root

---

## 📦 Commands

```bash
# Development
pnpm dev:lawra          # Run LaWra on port 3002

# Database
pnpm db:generate        # Generate Prisma client
npx prisma db push      # Push schema to database
npx prisma studio       # Open Prisma Studio

# Build
pnpm build:lawra        # Production build

# Lint/Format
pnpm lint              # ESLint
pnpm format            # Prettier
```

---

## ⚠️ Important Notes

1. **Never expose API keys** in client-side code
2. **Always validate** user input with Zod
3. **Check authentication** in every API route
4. **Use Hebrew** for all user-facing text
5. **Test RTL** layout in both Chrome and Safari
6. **Preserve existing code** in other apps (admin, site)

---

## 🆘 When Stuck

1. Check the relevant `skills/*/SKILL.md` file
2. Reference `docs/WORKFLOWS.md` for user flows
3. Look at existing patterns in `apps/admin`
4. Ask for clarification with specific context

---

*Last updated: January 2025*
