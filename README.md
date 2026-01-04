# LaWra AI - Complete Development Package

> Everything Claude Code needs to build the LaWra AI legal practice management system.

---

## 📁 Package Contents

```
lawra-complete/
├── CLAUDE.md                    # 🎯 Main instructions (auto-read by Claude Code)
├── README.md                    # This file
│
├── apps/lawra/                  # Next.js application
│   ├── app/                     # App Router pages
│   │   ├── (dashboard)/         # Protected routes
│   │   └── layout.tsx           # Root layout (RTL/Hebrew)
│   ├── components/              # React components
│   │   ├── ui/                  # Base UI components
│   │   ├── layout/              # Sidebar, Header
│   │   └── dashboard/           # Dashboard widgets
│   ├── lib/                     # Utilities
│   └── package.json             # Dependencies
│
├── packages/db/prisma/          # Database schema
│   └── lawra-schema.prisma      # All models defined
│
├── docs/                        # Documentation
│   ├── BUSINESS_PLAN.md         # Vision, 4-brain architecture
│   ├── IMPLEMENTATION_GUIDE.md  # Technical specification
│   ├── DESIGN_SYSTEM.md         # UI/UX guidelines
│   ├── API_REFERENCE.md         # All API routes
│   ├── WORKFLOWS.md             # User flows
│   └── TRANSLATIONS.md          # Hebrew text reference
│
├── skills/                      # Domain-specific best practices
│   ├── legal-documents/         # DOCX generation
│   ├── ai-agents/               # Claude integration
│   ├── hebrew-rtl/              # RTL patterns
│   ├── legal-research/          # Knowledge base
│   └── billing/                 # Time & invoicing
│
└── .claude/
    └── settings.json            # Claude Code settings
```

---

## 🚀 Quick Start

### 1. Add to Your Monorepo

```bash
# Copy apps/lawra to your monorepo
cp -r apps/lawra /path/to/your-repo/apps/

# Copy Prisma schema (or merge with existing)
cp packages/db/prisma/lawra-schema.prisma /path/to/your-repo/packages/db/prisma/

# Copy docs and skills to repo root
cp -r docs /path/to/your-repo/
cp -r skills /path/to/your-repo/

# Copy CLAUDE.md to repo root
cp CLAUDE.md /path/to/your-repo/
```

### 2. Install Dependencies

```bash
cd /path/to/your-repo
pnpm install
```

### 3. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
npx prisma db push
```

### 4. Run Development Server

```bash
pnpm dev:lawra
# Opens at http://localhost:3002
```

---

## 🤖 Using with Claude Code

Claude Code automatically reads `CLAUDE.md` from your repo root. It contains:

- Project overview and tech stack
- File structure explanation
- Reading order for documentation
- Skills reference
- Implementation phases checklist
- Coding standards
- Common commands

### Starting a Session

Just open Claude Code in your repo and say:

> "Continue building LaWra AI. What's the next priority?"

Claude Code will read `CLAUDE.md` and know exactly where to pick up.

### Building a Specific Feature

> "Build the Clients module following the workflow in docs/WORKFLOWS.md"

> "Implement the Legal Mind AI chat using skills/ai-agents/SKILL.md"

---

## 📚 Documentation Summary

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | Main Claude Code instructions (auto-read) |
| `docs/BUSINESS_PLAN.md` | Product vision, 4-brain AI architecture |
| `docs/IMPLEMENTATION_GUIDE.md` | Complete technical spec, database, workflows |
| `docs/DESIGN_SYSTEM.md` | Colors, typography, component patterns |
| `docs/API_REFERENCE.md` | All API endpoints with examples |
| `docs/WORKFLOWS.md` | Step-by-step user flows |
| `docs/TRANSLATIONS.md` | Hebrew UI text reference |

---

## 🛠 Skills Reference

| Skill | When to Use |
|-------|-------------|
| `skills/legal-documents/SKILL.md` | Generating DOCX files, templates |
| `skills/ai-agents/SKILL.md` | Claude integration, per-client memory |
| `skills/hebrew-rtl/SKILL.md` | RTL layout, Hebrew formatting |
| `skills/legal-research/SKILL.md` | Knowledge base, Israeli law |
| `skills/billing/SKILL.md` | Time tracking, invoices, VAT |

---

## ✅ What's Already Built

- [x] Project structure
- [x] Dashboard layout (Sidebar + Header)
- [x] 4 dashboard widgets
- [x] RTL/Hebrew configuration
- [x] Base UI components (Button, Input, Avatar, etc.)
- [x] Prisma schema with all models
- [x] Supabase client setup

## 🔲 What Needs to Be Built

- [ ] Authentication (Login, Register, Middleware)
- [ ] Clients module (CRUD)
- [ ] Cases module (CRUD + tabs)
- [ ] Tasks Kanban board
- [ ] Document factory
- [ ] Legal Mind AI chat
- [ ] Time tracking
- [ ] Invoicing
- [ ] Calendar
- [ ] Knowledge base

---

## 📖 Reference PDFs

The original business documents are:
- `__תקציר_מנהלים_.pdf` - Hebrew executive summary
- `lawra_ai_comprehensive_business_booklet_2.pdf` - Full business plan

These contain the complete vision, market analysis, and feature specifications.

---

## 🔑 Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# AI
ANTHROPIC_API_KEY=your_key

# Optional
MICROSOFT_CLIENT_ID=for_outlook
MICROSOFT_CLIENT_SECRET=for_outlook
```

---

## 📞 Support

This package was created based on the LaWra AI business plan and technical requirements. For questions about the product vision, refer to the founder's documents.

---

*Built with ❤️ for Israeli law firms*
