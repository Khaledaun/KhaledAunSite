# LaWra AI - Legal Practice Management System

מערכת ניהול משרד עורכי דין מבוססת בינה מלאכותית

## Quick Start

### 1. Add to Your Monorepo

Copy the `apps/lawra` folder to your existing monorepo:

```bash
cp -r apps/lawra /path/to/KhaledAunSite/apps/
```

### 2. Update Root package.json

Add these scripts to your root `package.json`:

```json
{
  "scripts": {
    "dev:lawra": "pnpm --filter @khaledaun/lawra dev",
    "build:lawra": "pnpm --filter @khaledaun/lawra build",
    "start:lawra": "pnpm --filter @khaledaun/lawra start"
  }
}
```

### 3. Update Prisma Schema

Add the models from `packages/db/prisma/lawra-schema.prisma` to your existing schema file at `packages/db/prisma/schema.prisma`.

Then run:

```bash
pnpm db:generate
npx prisma db push
```

### 4. Environment Variables

Add these to your `.env` file:

```env
# LaWra specific (add to existing)
ANTHROPIC_API_KEY=your_claude_api_key
GOOGLE_DRIVE_CLIENT_ID=your_google_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_client_secret
```

### 5. Install Dependencies

```bash
pnpm install
```

### 6. Run Development Server

```bash
pnpm dev:lawra
```

The app will be available at `http://localhost:3002`

---

## Vercel Deployment

### Configure Subdomain

1. Go to your Vercel project settings
2. Add domain: `app.khaledaun.com`
3. Configure the root directory to `apps/lawra`

Or create a new Vercel project:

```bash
cd apps/lawra
vercel --prod
```

### vercel.json (if needed)

```json
{
  "buildCommand": "pnpm build:lawra",
  "outputDirectory": "apps/lawra/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

---

## Project Structure

```
apps/lawra/
├── app/
│   ├── (auth)/           # Login, Register pages
│   ├── (dashboard)/      # Main app pages
│   │   ├── dashboard/    # Home dashboard
│   │   ├── cases/        # Case management
│   │   ├── clients/      # CRM
│   │   ├── tasks/        # Task management
│   │   ├── documents/    # Document factory
│   │   ├── legal-mind/   # AI assistant
│   │   ├── finance/      # Billing & invoices
│   │   ├── knowledge/    # Knowledge base
│   │   ├── marketing/    # Marketing module
│   │   └── settings/     # User settings
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout (RTL)
│   └── providers.tsx     # React Query, Theme
├── components/
│   ├── ui/               # Base UI components
│   ├── layout/           # Sidebar, Header
│   └── dashboard/        # Dashboard widgets
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── ai/               # Claude integration
│   └── utils.ts          # Utilities
└── public/
```

---

## Features Roadmap

### Phase 1: Foundation ✅
- [x] Project structure
- [x] Dashboard layout (matching mockup)
- [x] Hebrew RTL support
- [x] Database schema

### Phase 2: Core Features (Next)
- [ ] Case management CRUD
- [ ] Client CRM
- [ ] Task board (Kanban)
- [ ] Authentication flows

### Phase 3: Document Factory
- [ ] Template library
- [ ] AI-powered generation
- [ ] DOCX export

### Phase 4: Legal Mind AI
- [ ] Chat interface
- [ ] Per-client agents
- [ ] Knowledge base search

### Phase 5: Integrations
- [ ] Outlook calendar sync
- [ ] Net-Hamishpat browser extension
- [ ] Marketing dashboard migration

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Supabase + Prisma
- **Auth**: Supabase Auth
- **AI**: Anthropic Claude API
- **UI**: Tailwind CSS + Radix UI
- **State**: React Query + Zustand
- **Drag & Drop**: dnd-kit

---

## Hebrew/RTL Notes

- Root `<html>` has `dir="rtl"` and `lang="he"`
- Uses Heebo font for Hebrew text
- Logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`)
- Numbers and emails remain LTR with `dir="ltr"`
- Use `rtl-flip` class for icons that need mirroring

---

## Support

For questions or issues, contact the development team.

---

© 2025 LaWra AI - Legal Intelligence Platform
