# System Overview
**Khaled Aun Personal Brand & Content Management System**

> **Generated:** December 2024  
> **Purpose:** Complete technical and functional documentation for AI-assisted testing

---

## Table of Contents
1. [Architecture](#architecture)
2. [Technology Stack](#technology-stack)
3. [System Modules](#system-modules)
4. [Environment Configuration](#environment-configuration)
5. [Third-Party Integrations](#third-party-integrations)

---

## Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        PublicSite[Public Site - Next.js SSR]
        AdminPanel[Admin Panel - Next.js App Router]
    end
    
    subgraph "API & Business Logic"
        AdminAPI[Admin API Routes]
        PublicAPI[Public API Routes]
        Middleware[Auth Middleware]
        BGJobs[Background Jobs/Cron]
    end
    
    subgraph "Data Layer"
        Prisma[Prisma ORM]
        Supabase[(Supabase PostgreSQL)]
        Storage[Supabase Storage]
    end
    
    subgraph "External Services"
        LinkedIn[LinkedIn API]
        Resend[Resend Email]
        HubSpot[HubSpot CRM]
        AI[AI Services: OpenAI/Anthropic]
    end
    
    PublicSite --> PublicAPI
    AdminPanel --> AdminAPI
    AdminPanel --> Middleware
    AdminAPI --> Prisma
    PublicAPI --> Prisma
    BGJobs --> Prisma
    Prisma --> Supabase
    AdminAPI --> Storage
    
    BGJobs --> LinkedIn
    BGJobs --> Resend
    BGJobs --> HubSpot
    AdminAPI --> AI
```

### Architecture Patterns

- **Frontend:** React 18 with Next.js 14 App Router
- **Backend:** Serverless API routes (Vercel Edge Functions)
- **Database:** PostgreSQL via Supabase with Prisma ORM
- **Authentication:** Supabase Auth with SSR support
- **Authorization:** RBAC + RLS (Row Level Security)
- **Storage:** Supabase Storage for media assets
- **Jobs:** Vercel Cron (scheduled tasks)
- **Monitoring:** Sentry error tracking

---

## Technology Stack

### Core Frameworks

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.33 | Full-stack React framework |
| **React** | 18.2 | UI library |
| **TypeScript** | 5.0+ | Type-safe JavaScript |
| **Prisma** | 5.22.0 | ORM & database client |
| **PostgreSQL** | Latest | Primary database |
| **Node.js** | 18+ | Runtime |

### Frontend Libraries

| Library | Purpose |
|---------|---------|
| **TailwindCSS** | Utility-first CSS framework |
| **Headless UI** | Accessible UI components |
| **Heroicons / Lucide** | Icon libraries |
| **TipTap** | Rich text editor |
| **TanStack Table** | Data tables |
| **React Hook Form** | Form management |
| **Zod** | Schema validation |
| **React Dropzone** | File uploads |
| **Recharts** | Data visualization |
| **date-fns** | Date utilities |
| **next-intl** | Internationalization (i18n) |

### Backend & Services

| Service | Purpose |
|---------|---------|
| **Supabase** | Auth, Database, Storage |
| **@supabase/ssr** | Server-side auth |
| **Pino** | Structured logging |
| **Sharp** | Image processing |
| **Sanitize-HTML** | Content sanitization |
| **Cheerio** | HTML parsing |

### AI & Content

| Service | Purpose |
|---------|---------|
| **Vercel AI SDK** | AI abstraction layer |
| **@ai-sdk/openai** | OpenAI integration |
| **@ai-sdk/anthropic** | Claude integration |
| **OpenAI SDK** | Direct OpenAI access |

### Testing & Quality

| Tool | Purpose |
|------|---------|
| **Playwright** | E2E testing |
| **Vitest** | Unit testing |
| **ESLint** | Linting |
| **Prettier** | Code formatting |

---

## System Modules

### `/apps/admin` - Content Management System (CMS)

Primary admin dashboard for content creators and marketers.

#### Feature Modules

| Module | Path | Purpose |
|--------|------|---------|
| **Command Center** | `/command-center` | Dashboard overview & quick actions |
| **Content Management** | `/content/*` | Create, edit, publish content (blogs, LinkedIn posts) |
| **Topics Queue** | `/topics/*` | Topic ideas, research, content planning |
| **Media Library** | `/media` | Upload, organize, manage media assets |
| **AI Assistance** | `/ai/*` | AI content generation, templates, config |
| **HITL Workflows** | `/hitl/*` | Human-in-the-loop content review (outlines, facts) |
| **Marketing** | `/marketing/*` | Email campaigns, subscribers, analytics |
| **Social Media** | `/social` | LinkedIn integration & posting |
| **CRM & Leads** | `/leads` | Lead capture & HubSpot sync |
| **Case Studies** | `/case-studies/*` | Portfolio management |
| **Profile/CMS** | `/profile/*`, `/cms/*` | Hero section, credentials, experiences |
| **Posts** | `/posts/*` | Blog post management (legacy/alternative) |
| **Analytics** | `/analytics` | Content performance metrics |
| **SEO Checks** | `/seo-checks` | SEO validation & scoring |

#### API Routes (`/apps/admin/app/api`)

| Category | Endpoints | Purpose |
|----------|-----------|---------|
| **Admin** | `/api/admin/*` | Admin-level CRUD for all entities |
| **Auth** | `/api/auth/*` | LinkedIn OAuth, login, logout, callback |
| **Content** | `/api/content-library/*` | Content CRUD |
| **Topics** | `/api/topics/*` | Topic CRUD & locking |
| **Media** | `/api/media-library/*` | Media CRUD & upload |
| **AI** | `/api/ai/*` | AI generation (facts, outline, ideas, translate) |
| **LinkedIn** | `/api/linkedin/*` | Post now, schedule |
| **Email** | `/api/email/*` | Campaign creation & scheduler |
| **Newsletter** | `/api/newsletter/*` | Subscribe, confirm, unsubscribe |
| **CRM** | `/api/crm/*` | HubSpot sync |
| **Webhooks** | `/api/webhooks/*` | Resend event handling |
| **Scheduler** | `/api/scheduler/*` | LinkedIn post queue processor |
| **Health** | `/api/health` | System health check |
| **Contact** | `/api/contact` | Contact form submission |
| **Debug** | `/api/debug/*` | Development/debugging endpoints |

### `/apps/site` - Public Website

Public-facing personal brand website (bilingual: English & Arabic).

| Feature | Path | Purpose |
|---------|------|---------|
| **Homepage** | `/` | Hero, about, ventures, credentials, experience |
| **Contact Form** | `/contact`, `/[locale]/contact` | Lead capture |
| **Newsletter** | `/newsletter/*` | Subscription, confirmation, unsubscribe |
| **Localization** | `/[locale]/*` | Dynamic locale routing |
| **API** | `/api/*` | Public APIs (contact, hero data, social icons) |

### `/packages` - Shared Libraries

Monorepo shared packages:

| Package | Purpose |
|---------|---------|
| **@khaledaun/auth** | RBAC roles, permissions, ACL |
| **@khaledaun/db** | Prisma schema, migrations, seeds |
| **@khaledaun/schemas** | Zod validation schemas |
| **@khaledaun/utils** | Shared utilities (AI, SEO, AIO, logging, encryption) |
| **@khaledaun/env** | Environment variable validation |

### `/apps/tests` - End-to-End Testing

| Test Suite | Files | Purpose |
|------------|-------|---------|
| **E2E** | `e2e/*.spec.ts` | Comprehensive workflow tests |
| **Workflows** | `e2e/workflows/*.spec.ts` | Specific user journey tests |
| **Production** | `e2e-production/*.spec.ts` | Production smoke tests |

---

## Environment Configuration

### Core Environment Variables

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| **Database** ||||
| `DATABASE_URL` | ✅ | Prisma connection string (pooled) | `postgresql://user:pass@host/db?pgbouncer=true` |
| `DIRECT_URL` | ✅ | Direct DB connection (migrations) | `postgresql://user:pass@host/db` |
| **Supabase** ||||
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon public key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service key (admin bypass RLS) | `eyJ...` |
| **Authentication** ||||
| `NEXTAUTH_SECRET` | ⚠️ | NextAuth secret (if using NextAuth) | - |
| `NEXTAUTH_URL` | ⚠️ | Auth callback URL | `https://admin.khaledaun.com` |
| **LinkedIn Integration** ||||
| `LINKEDIN_CLIENT_ID` | ✅ | LinkedIn OAuth app client ID | `77xxx` |
| `LINKEDIN_CLIENT_SECRET` | ✅ | LinkedIn OAuth app secret | `xxx` |
| `LINKEDIN_REDIRECT_URI` | ✅ | OAuth callback URL | `https://admin.khaledaun.com/api/auth/linkedin/callback` |
| `LINKEDIN_SCOPES` | ⚠️ | OAuth scopes (default: `w_member_social`) | `w_member_social,r_liteprofile` |
| `LINKEDIN_ENCRYPTION_KEY` | ✅ | AES-256-GCM key for token encryption | 32-byte hex string |
| `LINKEDIN_REFRESH_SECRET` | ⚠️ | Refresh token encryption salt | - |
| **Email (Resend)** ||||
| `RESEND_API_KEY` | ✅ | Resend API key | `re_xxx` |
| `RESEND_FROM_EMAIL` | ⚠️ | Default sender email | `hello@khaledaun.com` |
| `RESEND_FROM_NAME` | ⚠️ | Default sender name | `Khaled Aun` |
| `EMAIL_FROM_ADDRESS` | ⚠️ | Alternative sender email | - |
| `EMAIL_FROM_NAME` | ⚠️ | Alternative sender name | - |
| `EMAIL_REPLY_TO` | ⚠️ | Reply-to address | - |
| `EMAIL_FOOTER_ADDRESS_LINE` | ⚠️ | Legal footer address | - |
| `RESEND_WEBHOOK_SECRET` | ✅ | Webhook signature verification | `whsec_xxx` |
| **CRM (HubSpot)** ||||
| `HUBSPOT_API_KEY` | ✅ | HubSpot private app key | `pat-na1-xxx` |
| `HUBSPOT_PORTAL_ID` | ⚠️ | HubSpot account portal ID | `12345678` |
| `HUBSPOT_PIPELINE_ID` | ⚠️ | Deal pipeline ID | - |
| `HUBSPOT_DEALSTAGE_DISCOVERY_ID` | ⚠️ | Deal stage: Discovery | - |
| `HUBSPOT_DEALSTAGE_PROPOSAL_ID` | ⚠️ | Deal stage: Proposal | - |
| `HUBSPOT_DEALSTAGE_WON_ID` | ⚠️ | Deal stage: Won | - |
| `HUBSPOT_DEALSTAGE_LOST_ID` | ⚠️ | Deal stage: Lost | - |
| **AI Services** ||||
| `OPENAI_API_KEY` | ✅ | OpenAI API key | `sk-proj-xxx` |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic (Claude) API key | `sk-ant-xxx` |
| `AI_DEFAULT_MODEL` | ⚠️ | Default AI model | `gpt-4-turbo`, `claude-3-sonnet` |
| **Monitoring** ||||
| `SENTRY_DSN` | ⚠️ | Sentry error tracking DSN | `https://xxx@sentry.io/xxx` |
| `SENTRY_AUTH_TOKEN` | ⚠️ | Sentry auth token | - |
| **Cron Security** ||||
| `CRON_SECRET` | ✅ | Shared secret for cron authentication | Random string |
| **Feature Flags** ||||
| `ENABLE_AI_GENERATION` | ⚠️ | Enable AI features | `true`/`false` |
| `ENABLE_LINKEDIN_POSTING` | ⚠️ | Enable LinkedIn integration | `true`/`false` |
| `ENABLE_EMAIL_CAMPAIGNS` | ⚠️ | Enable email marketing | `true`/`false` |

> **Legend:**  
> ✅ = Required for production  
> ⚠️ = Optional or has defaults

---

## Third-Party Integrations

### Integration Summary

```mermaid
graph LR
    Admin[Admin Panel] --> LinkedIn[LinkedIn API]
    Admin --> Resend[Resend Email API]
    Admin --> HubSpot[HubSpot CRM API]
    Admin --> OpenAI[OpenAI API]
    Admin --> Anthropic[Anthropic API]
    Admin --> Supabase[Supabase Services]
    Admin --> Sentry[Sentry Monitoring]
    
    PublicSite[Public Site] --> Resend
    PublicSite --> Supabase
    
    Supabase --> PostgreSQL[(PostgreSQL)]
    Supabase --> Storage[Object Storage]
    Supabase --> Auth[Authentication]
```

### Detailed Integration Table

| Service | SDK/Library | Purpose | Auth Method | Key Features |
|---------|-------------|---------|-------------|--------------|
| **Supabase** | `@supabase/supabase-js`, `@supabase/ssr` | Database, Auth, Storage | API keys (anon + service) | PostgreSQL, RLS, OAuth, file storage |
| **LinkedIn** | Custom REST client | Social media posting | OAuth 2.0 | Post text/images, schedule, UGC posts |
| **Resend** | Custom REST client | Transactional & marketing emails | API key | Templates, campaigns, webhooks, analytics |
| **HubSpot** | Custom REST client | CRM contact & deal management | API key (Private App) | Contact sync, deal creation, deduplication |
| **OpenAI** | `@ai-sdk/openai`, `openai` | AI content generation | API key | GPT-4 Turbo, GPT-4, embeddings |
| **Anthropic** | `@ai-sdk/anthropic` | AI content generation | API key | Claude 3 (Opus, Sonnet, Haiku) |
| **Sentry** | `@sentry/nextjs` | Error tracking & monitoring | DSN + auth token | Error tracking, performance monitoring, releases |
| **Vercel** | Native platform | Hosting, cron, edge functions | - | Serverless functions, cron jobs, deployments |

### Integration Data Flow

#### LinkedIn Posting Flow
```mermaid
sequenceDiagram
    participant User
    participant Admin
    participant Queue
    participant LinkedIn
    participant DB
    
    User->>Admin: Create post
    Admin->>DB: Save with publishTargets=['linkedin']
    Admin->>Queue: Schedule job
    Queue->>LinkedIn: POST /ugcPosts
    LinkedIn-->>Queue: Response + permalink
    Queue->>DB: Update publishStatus='posted', publishedLinks
    Queue-->>Admin: Show success
```

#### Email Campaign Flow
```mermaid
sequenceDiagram
    participant User
    participant Admin
    participant Scheduler
    participant Resend
    participant Subscriber
    
    User->>Admin: Create campaign
    Admin->>Scheduler: Queue for scheduledFor time
    Scheduler->>Resend: Send batch
    Resend->>Subscriber: Deliver email
    Resend-->>Scheduler: Webhook (opened/clicked)
    Scheduler->>Admin: Update analytics
```

#### CRM Sync Flow
```mermaid
sequenceDiagram
    participant Site
    participant API
    participant HubSpot
    participant DB
    
    Site->>API: Contact form submit
    API->>DB: Create CrmLead
    API->>HubSpot: Create/Update Contact
    API->>HubSpot: Create Deal (Discovery stage)
    HubSpot-->>API: Contact & Deal IDs
    API->>DB: Update hubspotContactId, hubspotDealId
```

---

## Deployment Architecture

### Production Setup

| Component | Platform | Configuration |
|-----------|----------|---------------|
| **Admin App** | Vercel | Next.js deployment, cron jobs |
| **Public Site** | Vercel | Next.js deployment, static pages |
| **Database** | Supabase | PostgreSQL 15+, connection pooling (PgBouncer) |
| **Storage** | Supabase Storage | Public bucket for media |
| **DNS** | ❓ | Domain configuration |
| **CDN** | Vercel Edge Network | Global CDN |

### Cron Jobs (Vercel)

| Job | Path | Schedule | Purpose |
|-----|------|----------|---------|
| **LinkedIn Scheduler** | `/api/scheduler/run` | Every minute (`* * * * *`) | Process queued LinkedIn posts |
| **Email Scheduler** | `/api/email/scheduler/run` | Every minute (`* * * * *`) | Send scheduled email campaigns |
| **CRM Sync** | `/api/crm/sync` | Daily at 2 AM (`0 2 * * *`) | Sync subscribers & leads to HubSpot |

---

## System Capabilities Summary

### Content Management
✅ Multi-format content (blog, LinkedIn post, LinkedIn article, carousel)  
✅ Rich text editing (TipTap with images, links, formatting)  
✅ Media library with upload, thumbnails, tagging  
✅ Topic ideation & research queue  
✅ SEO analysis & scoring  
✅ AI optimization (AIO) for AI search engines  
✅ Draft → Review → Published workflow  
✅ Scheduling for future publication  

### AI & Automation
✅ AI content generation (GPT-4, Claude 3)  
✅ Configurable AI templates & prompts  
✅ Human-in-the-loop (HITL) workflows  
✅ Fact extraction & verification  
✅ Outline generation & approval  
✅ URL content extraction  
✅ Multilingual translation  

### Social Media
✅ LinkedIn OAuth integration  
✅ Post immediately or schedule  
✅ Text + image + carousel support  
✅ Link attachments (UGC posts)  
✅ Retry with exponential backoff  
✅ Status tracking & error reporting  

### Email Marketing
✅ Double opt-in subscriber management  
✅ Email campaign creation  
✅ Rich HTML templates with variables  
✅ Campaign scheduling  
✅ Analytics (opens, clicks, bounces, complaints)  
✅ Resend webhooks for real-time tracking  
✅ UTM tagging for campaigns  
✅ Unsubscribe management  

### CRM & Leads
✅ Contact form with validation  
✅ Automatic HubSpot contact creation  
✅ Deal creation in pipeline  
✅ Deduplication logic  
✅ GDPR consent tracking  
✅ Daily reconciliation sync  

### Security & Auth
✅ Supabase Auth (email/password, OAuth)  
✅ Role-based access control (admin, editor, viewer)  
✅ Row-level security (RLS)  
✅ Middleware-based route protection  
✅ AES-256-GCM token encryption  
✅ Session management (server-side)  
✅ Noindex/nofollow on admin routes  

### Observability
✅ Pino structured logging  
✅ Sentry error tracking  
✅ Health check endpoint  
✅ E2E test coverage (Playwright)  
✅ API smoke tests  

---

## Known Limitations & Technical Debt

❓ **Instagram integration** - Not yet implemented (planned)  
❓ **Advanced analytics** - Basic metrics only, no deep funnel analysis  
❓ **Multi-user collaboration** - Single-tenant admin (no team features yet)  
❓ **Content versioning** - No git-like version history  
❓ **A/B testing** - Not built  
❓ **Advanced segmentation** - Basic subscriber tagging only  
❓ **Webhook retry logic** - Basic, could be more robust  
❓ **Rate limiting** - Not enforced on admin APIs  
❓ **Audit logs** - Not comprehensive  

---

**Document Status:** ✅ Complete  
**Last Updated:** December 2024  
**Next Document:** [API & Logic Map](./api-and-logic-map.md)

