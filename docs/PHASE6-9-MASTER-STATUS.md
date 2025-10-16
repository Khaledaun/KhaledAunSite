# Phase 6–9 Master Status Checkpoint
**Date:** October 16, 2024  
**Repository:** KhaledAunSite (Commit: d174313)  
**Deployment:** ✅ Live on Vercel  
**Database:** Supabase Postgres (not yet connected to Vercel)

---

## 📊 MASTER STATUS TABLE

### Phase 6.1 — Schema & Models

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| `Locale` enum (EN/AR) in schema | 🔴 **MISSING** | `packages/db/prisma/schema.prisma:73-76` shows only `enum Role { USER, ADMIN }` — no `Locale` enum exists | **PR: Add Locale enum and PostTranslation model**<br>• `packages/db/prisma/schema.prisma` — Add `enum Locale { en, ar }`<br>• Add `PostTranslation` model with `@@unique([postId, locale])` and `@@unique([locale, slug])`<br>• Modify `Post` model to remove `title`, `content`, `excerpt` |
| `PostTranslation` model with unique constraints | 🔴 **MISSING** | No `PostTranslation` model in schema | Same as above |
| Post model refactored (no direct content) | 🔴 **NOT DONE** | `packages/db/prisma/schema.prisma:99-116`<br>```prisma<br>model Post {<br>  title String  // ❌ Still here<br>  content String  // ❌ Still here<br>  excerpt String? // ❌ Still here<br>}``` | Same as above |
| Backfill script exists | 🔴 **MISSING** | No file `packages/db/scripts/backfill-phase6-full.ts` exists | **PR: Create data migration scripts**<br>• `packages/db/scripts/backfill-phase6-full.ts` — Script to move existing posts to EN translations<br>• `packages/db/scripts/verify-migration.ts` — Verify no posts missing EN translation |
| Backfill script run | 🔴 **N/A** | Script doesn't exist yet | Run after PR above is merged |
| Legacy columns dropped | 🔴 **N/A** | Can't drop until PostTranslation exists | **PR: Drop legacy Post columns**<br>• `packages/db/prisma/migrations/YYYYMMDD_drop_post_content_columns/migration.sql`<br>• `packages/db/prisma/schema.prisma` — Remove `title`, `content`, `excerpt` from Post |
| Migrations applied via DIRECT_URL | ⚙️ **PARTIAL** | Schema exists but migrations not pushed to Supabase yet.<br>Evidence: Build logs show `DATABASE_URL resolved to an empty string` | **Manual Step:** Run `cd packages/db && pnpm db:push` with DIRECT_URL |
| Prisma client singleton | ✅ **DONE** | `packages/db/index.ts:1-4`<br>```ts<br>import { PrismaClient } from '@prisma/client';<br>export const prisma = globalThis.prismaGlobal ?? new PrismaClient();<br>if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;``` | ✅ No action needed |

---

### Phase 6.2 — Auth & RBAC

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| Roles enum expanded (AUTHOR/REVIEWER/EDITOR/OWNER/ADMIN) | 🔴 **PARTIAL** | `packages/db/prisma/schema.prisma:73-76`<br>```prisma<br>enum Role {<br>  USER  // ✅<br>  ADMIN // ✅<br>  // ❌ Missing: AUTHOR, REVIEWER, EDITOR, OWNER<br>}``` | **PR: Expand RBAC roles**<br>• `packages/db/prisma/schema.prisma` — Add `AUTHOR \| REVIEWER \| EDITOR \| OWNER` to Role enum<br>• Create migration for role expansion |
| `packages/auth/permissions.ts` exists | 🔴 **MISSING** | Directory `packages/auth/` contains only `index.ts`, `roles.ts`, `package.json` — no `permissions.ts` | **PR: Add permissions ACL**<br>• `packages/auth/permissions.ts` — Create ACL mapping:<br>  ```ts<br>  const PERMISSIONS = {<br>    createPost: ['AUTHOR', 'EDITOR', 'ADMIN', 'OWNER'],<br>    editPost: (userId, post) => post.authorId === userId \|\| ...,<br>    submitReview: ['AUTHOR'],<br>    approve: ['REVIEWER', 'EDITOR', 'ADMIN', 'OWNER'],<br>    publish: ['EDITOR', 'ADMIN', 'OWNER'],<br>    deletePost: ['ADMIN', 'OWNER']<br>  }<br>  export function hasPermission(user, action, resource?) { ... }```<br>• Export helper functions |
| Admin middleware enforces roles | ⚙️ **PARTIAL** | `apps/admin/middleware.ts:8-26` has basic admin check:<br>```ts<br>if (!user) return NextResponse.redirect(new URL('/auth/signin', request.url));<br>if (!isAdmin(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });```<br>✅ Works for admin-only<br>🔴 No granular permission checks | **PR: Add permission middleware**<br>• `packages/auth/middleware.ts` — Create `requirePermission(action)` middleware<br>• Update admin routes to use granular checks |
| Seed script creates OWNER/ADMIN | ⚙️ **PARTIAL** | `packages/db/seed.ts:7-14` creates admin user:<br>```ts<br>const admin = await prisma.user.upsert({<br>  where: { email: 'admin@khaledaun.com' },<br>  create: { email: '...', name: 'Admin User', role: 'ADMIN' }<br>})```<br>✅ ADMIN seeded<br>🔴 No OWNER role yet (doesn't exist in enum) | **PR: Update seed for all roles**<br>• `packages/db/seed.ts` — Add OWNER user seed<br>• Add AUTHOR/REVIEWER examples<br>• Run `pnpm db:seed` on Supabase |

---

### Phase 6.3 — Admin UI

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| Posts list shows status + locale availability | 🔴 **PARTIAL** | `apps/admin/app/(dashboard)/posts/page.tsx:72-86`<br>Shows status ✅:<br>```tsx<br><span className={post.status === 'PUBLISHED' ? 'bg-green-100' : 'bg-yellow-100'}><br>  {post.status}<br></span>```<br>🔴 No locale availability (no translations yet) | **PR: Add i18n post list UI**<br>• `apps/admin/app/(dashboard)/posts/page.tsx` — Add columns for EN/AR status<br>• Show translation completeness indicators<br>• Filter by locale |
| `/posts/[id]` supports EN/AR tabs | 🔴 **MISSING** | `apps/admin/app/(dashboard)/posts/[id]/page.tsx:45-90`<br>Single textarea for content:<br>```tsx<br><textarea name="content" value={formData.content} ... /><br>// ❌ No locale tabs```| **PR: Bilingual post editor**<br>• `apps/admin/app/(dashboard)/posts/[id]/page.tsx` — Add tab UI for EN/AR<br>• Per-locale fields: title, slug, excerpt, content<br>• Inline slug validation per locale<br>• Translation status indicators |
| Preview buttons per locale | 🔴 **PARTIAL** | `apps/admin/app/(dashboard)/posts/[id]/page.tsx:132-142`<br>Single preview button ✅:<br>```tsx<br>onClick={handlePreview}```<br>🔴 No per-locale preview | **PR: Per-locale preview**<br>• Add "Preview EN" and "Preview AR" buttons<br>• Update preview URL to include `&locale=en\|ar` |
| Publish writes Audit | ✅ **DONE** | `apps/admin/app/api/admin/posts/[id]/publish/route.ts:26-32`<br>```ts<br>await prisma.audit.create({<br>  data: {<br>    entity: 'Post', entityId: id, action: 'PUBLISH',<br>    actorId: user.id, payload: { slug: post.slug }<br>  }<br>})``` | ✅ No action needed |
| `REQUIRE_AR_FOR_PUBLISH` env toggle | 🔴 **MISSING** | No code checks for this env var | **PR: Add AR requirement toggle**<br>• `apps/admin/app/api/admin/posts/[id]/publish/route.ts` — Check `if (process.env.REQUIRE_AR_FOR_PUBLISH === 'true' && !post.translations.find(t => t.locale === 'ar')) throw new Error('AR translation required')`<br>• `apps/admin/app/(dashboard)/posts/[id]/page.tsx` — Disable publish button if AR missing and flag is true |

---

### Phase 6.4 — Preview & Revalidation

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| Preview URL format includes locale | 🔴 **PARTIAL** | `apps/site/src/app/api/preview/route.ts:10-37`<br>Current format: `?id=<postId>&token=<signed>`<br>```ts<br>const id = searchParams.get('id');<br>const token = searchParams.get('token');<br>// ❌ No locale parameter```| **PR: Add locale to preview**<br>• `apps/site/src/app/api/preview/route.ts` — Add `const locale = searchParams.get('locale') \|\| 'en'`<br>• Redirect to `/${locale}/blog/preview/${id}`<br>• `packages/utils/preview.ts` — Sign payload with `{ id, locale, exp }` |
| Tokens signed with PREVIEW_SECRET | ✅ **DONE** | `packages/utils/preview.ts:11-22`<br>```ts<br>export function signPreview(payload) {<br>  const secret = process.env.PREVIEW_SECRET;<br>  const data = JSON.stringify({ ...payload, exp: Date.now() + 3600000 });<br>  return CryptoJS.HmacSHA256(data, secret).toString();<br>}``` | ✅ No action needed |
| `/api/revalidate` requires secret | ✅ **DONE** | `apps/site/src/app/api/revalidate/route.ts:10-30`<br>```ts<br>const secret = request.headers.get('x-reval-secret');<br>const expectedSecret = process.env.REVALIDATE_SECRET;<br>if (secret !== expectedSecret) {<br>  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });<br>}``` | ✅ No action needed |
| `/api/revalidate` supports locale/path | ⚙️ **PARTIAL** | `apps/site/src/app/api/revalidate/route.ts:32-50`<br>Hardcoded revalidation ✅:<br>```ts<br>revalidatePath('/en/blog');<br>revalidatePath('/ar/blog');<br>if (slug) {<br>  revalidatePath(`/en/blog/${slug}`);<br>  revalidatePath(`/ar/blog/${slug}`);<br>}```<br>🔴 Doesn't support separate EN/AR slugs<br>🔴 No `{ path }` or `{ locale, slug }` body options | **PR: Flexible revalidation**<br>• `apps/site/src/app/api/revalidate/route.ts` — Support body formats:<br>  ```ts<br>  { path: '/en/blog/my-post' } // specific path<br>  { locale: 'en', slug: 'my-post' } // per-locale slug<br>  { slug: 'my-post' } // both locales (current behavior)``` |
| Publish revalidates both locales | ⚙️ **PARTIAL** | `apps/admin/app/api/admin/posts/[id]/publish/route.ts:34-40`<br>```ts<br>await fetch(`${process.env.SITE_URL}/api/revalidate`, {<br>  method: 'POST',<br>  headers: { 'x-reval-secret': process.env.REVALIDATE_SECRET! },<br>  body: JSON.stringify({ slug: post.slug })<br>})```<br>✅ Triggers revalidation<br>🔴 Assumes same slug for both locales | **PR: Per-locale revalidation in publish**<br>• Update publish API to revalidate each translation's slug separately |

---

### Phase 6.5 — Testing & Docs

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| E2E `cms-rbac-i18n.spec.ts` | 🔴 **MISSING** | `apps/tests/e2e/` contains `cms-lite-workflow.spec.ts` but not `cms-rbac-i18n.spec.ts` | **PR: Add RBAC i18n E2E tests**<br>• `apps/tests/e2e/cms-rbac-i18n.spec.ts` — Test:<br>  - AUTHOR can create but not publish<br>  - EDITOR can publish<br>  - Per-locale preview works<br>  - Bilingual publish flow<br>  - AR requirement toggle |
| Health endpoints with commit hash | ⚙️ **PARTIAL** | `apps/site/src/app/api/health/route.ts:3-8`<br>```ts<br>export async function GET() {<br>  return NextResponse.json({<br>    ok: true,<br>    version: process.env.npm_package_version \|\| '1.0.0'<br>    // ❌ No commit hash<br>  });<br>}``` | **PR: Add commit hash to health**<br>• `apps/site/src/app/api/health/route.ts`<br>• `apps/admin/app/api/health/route.ts`<br>• Add `commit: process.env.VERCEL_GIT_COMMIT_SHA \|\| 'dev'` |
| `docs/phase6-full-readiness.md` | 🔴 **MISSING** | File doesn't exist (only `phase6-9-status-audit.md` exists) | **PR: Add Phase 6 Full docs**<br>• `docs/phase6-full-readiness.md` — Document migration strategy, env vars, rollback plan |
| `packages/db/MIGRATION_GUIDE.md` | 🔴 **MISSING** | File doesn't exist | Same as above<br>• `packages/db/MIGRATION_GUIDE.md` — Step-by-step migration from Lite to Full |
| Tag `v0.6.1-full` | 🔴 **NOT READY** | No version tags exist in repo yet | **After Phase 6 Full complete:** `git tag v0.6.1-full && git push --tags` |

---

## Phase 6.5 — Media Library & Rich Blocks

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| `MediaAsset` model with i18n ALT | ✅ **DONE** | `packages/db/prisma/schema.prisma:27-41`<br>```prisma<br>model MediaAsset {<br>  id String @id<br>  alt String? // ✅ Present<br>  caption String?<br>}``` | ✅ Schema ready |
| Supabase Storage bucket configured | 🔴 **MISSING** | No evidence of bucket creation in code/infra | **PR: Set up Supabase Storage**<br>• Create bucket `media` in Supabase dashboard<br>• `packages/utils/upload.ts` — Helper for signed uploads<br>• RLS policies for admin-only write, public read |
| Admin upload UI | 🔴 **MISSING** | No upload components in `apps/admin` | **PR: Build upload UI**<br>• `apps/admin/components/MediaUploader.tsx` — Drag-drop component<br>• `apps/admin/app/api/admin/media/upload/route.ts` — Upload endpoint<br>• Size/ratio validation (max 5MB, min 800x600) |
| Rich text editor | 🔴 **MISSING** | Post editor uses plain textarea | **PR: Integrate rich text editor**<br>• Add TipTap or Lexical<br>• `apps/admin/components/RichTextEditor.tsx`<br>• Update post form to use it |
| Pre-publish validator | 🔴 **MISSING** | No validation for broken links/media | **PR: Add pre-publish checks**<br>• `apps/admin/app/api/admin/posts/[id]/validate/route.ts` — Check for:<br>  - Broken image URLs<br>  - Dead links<br>  - Missing required fields |
| E2E `cms-media-blocks.spec.ts` | 🔴 **MISSING** | Test doesn't exist | **PR: Add media E2E tests**<br>• `apps/tests/e2e/cms-media-blocks.spec.ts` |

---

## Phase 7 — Automation (ICC/DIAC → Drafts)

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| Models: `AutomationSource`, `PromptTemplate` | 🔴 **MISSING** | Not in `packages/db/prisma/schema.prisma` | **Phase 7 NOT STARTED** — All items missing |
| Endpoint `/api/ingest` | 🔴 **MISSING** | No ingest endpoint | (defer to Phase 7 work) |
| Admin automation dashboard | 🔴 **MISSING** | No automation UI | (defer to Phase 7 work) |
| Manual trigger | 🔴 **MISSING** | No manual trigger | (defer to Phase 7 work) |
| Feature flag `FF_AUTOMATION` | 🔴 **MISSING** | No feature flags system | (defer to Phase 7 work) |
| E2E `automation-ingest.spec.ts` | 🔴 **MISSING** | No test | (defer to Phase 7 work) |
| Legal/ethical notes | 🔴 **MISSING** | No docs | (defer to Phase 7 work) |

---

## Phase 8 — Social Embeds

### 8 Quick Win (Env)

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| `NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML` rendering | 🔴 **DEPRECATED** | Was removed during Dennis design migration.<br>`apps/site/src/components/site/LinkedInSection.js` doesn't check env var | **Decision:** Use Phase 8 Full (admin UI) instead of env var approach |

### 8 Full (Admin UI)

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| `SocialEmbed` model | 🔴 **MISSING** | Not in `packages/db/prisma/schema.prisma` | **PR: Add SocialEmbed schema**<br>• `packages/db/prisma/schema.prisma` — Add:<br>  ```prisma<br>  model SocialEmbed {<br>    id String @id<br>    key String @unique // 'LINKEDIN_WALL'<br>    html String // sanitized embed code<br>    enabled Boolean @default(true)<br>    updatedBy String<br>    updatedAt DateTime @updatedAt<br>  }```<br>• Create migration |
| Admin CRUD `/social` | 🔴 **MISSING** | No `/social` page in `apps/admin/app/(dashboard)/` | **PR: Build social embeds admin**<br>• `apps/admin/app/(dashboard)/social/page.tsx` — CRUD UI<br>• `apps/admin/app/api/admin/social/route.ts` — GET/POST endpoints<br>• `apps/admin/app/api/admin/social/[key]/route.ts` — PUT/DELETE |
| Server sanitization with `sanitize-html` | 🔴 **MISSING** | Package not installed | **PR: Add HTML sanitization**<br>• `pnpm add sanitize-html @types/sanitize-html`<br>• `packages/utils/sanitize.ts` — Wrapper:<br>  ```ts<br>  import sanitizeHtml from 'sanitize-html';<br>  export function sanitizeEmbed(html: string) {<br>    return sanitizeHtml(html, {<br>      allowedTags: ['iframe', 'div', 'a', 'p', 'span'],<br>      allowedAttributes: { iframe: ['src', 'width', 'height'], ... }<br>    });<br>  }```<br>• Use in social API before saving |
| Site fetches from DB (cached) | 🔴 **MISSING** | LinkedIn section is hardcoded | **PR: Dynamic social embeds on site**<br>• `apps/site/src/app/api/social-embed/[key]/route.ts` — Fetch with 5min cache<br>• Update `LinkedInSection.js` to fetch from API |
| Feature flag `FF_SOCIAL_LINKEDIN` | 🔴 **MISSING** | No feature flag system | **PR: Add feature flags**<br>• `packages/env/feature-flags.ts` — Simple env-based flags<br>• Check `FF_SOCIAL_LINKEDIN` before rendering |
| E2E `social-embed-admin.spec.ts` | 🔴 **MISSING** | Test doesn't exist | **PR: Social embed E2E**<br>• `apps/tests/e2e/social-embed-admin.spec.ts` — Test:<br>  - Admin sets embed<br>  - Site shows/hides based on enabled<br>  - Sanitizer blocks XSS |
| Tag `v0.8.0-social-admin` | 🔴 **NOT READY** | Phase 8 not complete | **After Phase 8 complete:** `git tag v0.8.0-social-admin && git push --tags` |

---

## Phase 9 — Social Generator + Email

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| Models: `SocialPost`, `EmailSubscriber`, `EmailCampaign` | 🔴 **MISSING** | Not in schema | **Phase 9 NOT STARTED** |
| Generator UI + OpenAI integration | 🔴 **MISSING** | No generator | (defer to Phase 9 work) |
| Email provider (Resend/SES) | 🔴 **MISSING** | No email integration | (defer to Phase 9 work) |
| Feature flag `FF_SOCIAL_GENERATOR` | 🔴 **MISSING** | No flags | (defer to Phase 9 work) |
| GDPR/CAN-SPAM checklist | 🔴 **MISSING** | No compliance docs | (defer to Phase 9 work) |
| E2E `social-email.spec.ts` | 🔴 **MISSING** | No test | (defer to Phase 9 work) |
| Tag `v0.9.0-social-email` | 🔴 **NOT READY** | Phase 9 not started | (defer to Phase 9 work) |

---

## Cross-Phase Maintenance

| Item | Status | Evidence | Next PR |
|------|--------|----------|---------|
| CI green on all E2E | ⚙️ **DISABLED** | `.github/workflows/e2e.yml:94-95`<br>```yaml<br>- name: Run E2E tests<br>  run: echo "✅ Dennis design implemented - E2E tests to be rewritten"```<br>E2E disabled pending design rewrite | **PR: Re-enable E2E in CI**<br>• Update E2E tests for Dennis design<br>• Remove placeholder echo |
| Supabase backups scheduled | 🔴 **UNKNOWN** | No evidence in repo | **Manual:** Check Supabase dashboard → Settings → Backups<br>Enable PITR (Point-in-Time Recovery) |
| Vercel Analytics enabled | 🔴 **UNKNOWN** | No evidence in `next.config.js` | **PR: Enable Vercel Analytics**<br>• `apps/site/package.json` — Add `@vercel/analytics`<br>• `apps/site/src/app/[locale]/layout.js` — Add `<Analytics />` |
| Sentry configured | 🔴 **MISSING** | No Sentry integration | **PR: Add error tracking**<br>• Add `@sentry/nextjs`<br>• `sentry.client.config.ts`, `sentry.server.config.ts` |
| `docs/audit/status-matrix.md` updated | ⚙️ **OUTDATED** | File exists but not updated for Phase 6–9 | **PR: Update status matrix**<br>• Reflect Phase 6 Lite → Full transition<br>• Add Phase 7–9 sections |

---

## 🚨 HARD BLOCKERS

### Blocker 1: Database Not Connected to Vercel
**Impact:** HIGH — CMS features inactive in production

**Evidence:** Vercel build logs show:
```
error: Error validating datasource `db`: You must provide a nonempty URL.
The environment variable `DATABASE_URL` resolved to an empty string.
```

**Fix (15 minutes):**
1. Get Supabase connection string:
   - Go to Supabase project → Settings → Database
   - Copy `Connection String (Pooling)` for `DATABASE_URL`
   - Copy `Connection String (Direct)` for `DIRECT_URL` (migrations only)

2. Set Vercel environment variables:
   ```bash
   # In Vercel dashboard for apps/site:
   DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres?pgbouncer=true
   PREVIEW_SECRET=[generate-random-32-char-string]
   REVALIDATE_SECRET=[generate-random-32-char-string]
   SITE_URL=https://khaledaun.vercel.app
   
   # Repeat for apps/admin
   ```

3. Redeploy site and admin

---

### Blocker 2: Schema Migrations Not Pushed to Supabase
**Impact:** HIGH — Database schema incomplete

**Evidence:** `packages/db/prisma/schema.prisma` exists but migrations not applied

**Fix (10 minutes):**
1. Set DIRECT_URL locally:
   ```bash
   export DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
   ```

2. Push schema:
   ```bash
   cd packages/db
   pnpm db:push
   ```

3. Verify in Supabase SQL Editor:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   -- Should show: users, posts, audits, hero_titles, experiences, etc.
   ```

4. Seed data:
   ```bash
   pnpm db:seed
   ```

---

### Blocker 3: No Bilingual Post Model (Phase 6 Full Incomplete)
**Impact:** MEDIUM — Can't create EN/AR content

**Evidence:** Schema has `Post` with `title/content` but no `PostTranslation` model

**Fix:** Complete PR #1 below (2-3 hours)

---

## 📋 PR PLAN TO COMPLETE PHASE 6 FULL + PHASE 8 FULL

### PR #1: Schema Refactor — Bilingual Posts (Phase 6 Full: Schema)
**Branch:** `feat/phase6-full-schema`  
**Scope:** Add `Locale` enum, `PostTranslation` model, expand `Role` enum

**Files:**
- `packages/db/prisma/schema.prisma`:
  ```prisma
  enum Locale {
    en
    ar
  }
  
  enum Role {
    USER
    AUTHOR      // ← New
    REVIEWER    // ← New
    EDITOR      // ← New
    OWNER       // ← New
    ADMIN
  }
  
  model PostTranslation {
    id        String   @id @default(cuid())
    postId    String
    locale    Locale
    title     String
    slug      String
    excerpt   String?
    content   String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    
    post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
    
    @@unique([postId, locale])
    @@unique([locale, slug])
    @@map("post_translations")
  }
  
  model Post {
    id            String             @id @default(cuid())
    status        PostStatus         @default(DRAFT)
    publishedAt   DateTime?
    authorId      String
    createdAt     DateTime           @default(now())
    updatedAt     DateTime           @updatedAt
    
    // Remove: title, slug, excerpt, content
    
    author        User               @relation("UserPosts", fields: [authorId], references: [id])
    translations  PostTranslation[]  // ← New relation
    PostMedia     PostMedia[]
    
    @@map("posts")
  }
  ```

- `packages/db/scripts/backfill-phase6-full.ts`:
  ```ts
  // Move existing posts to EN translations
  const posts = await prisma.post.findMany();
  for (const post of posts) {
    await prisma.postTranslation.create({
      data: {
        postId: post.id,
        locale: 'en',
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
      }
    });
  }
  ```

- `packages/db/MIGRATION_GUIDE.md`:
  - Document step-by-step migration
  - Rollback plan

**Acceptance Criteria:**
- ✅ `pnpm db:push` succeeds
- ✅ Backfill script runs without errors
- ✅ All existing posts have EN translations
- ✅ Schema validation passes
- ✅ Tag intermediate commit as `v0.6.1-full-schema`

---

### PR #2: RBAC & Permissions (Phase 6 Full: Auth)
**Branch:** `feat/phase6-full-rbac`  
**Scope:** Add permissions ACL, update admin middleware

**Files:**
- `packages/auth/permissions.ts`:
  ```ts
  import { Role } from './roles';
  
  export type Permission = 
    | 'createPost'
    | 'editPost'
    | 'submitReview'
    | 'approve'
    | 'publish'
    | 'deletePost';
  
  export const ACL: Record<Permission, Role[]> = {
    createPost: ['AUTHOR', 'EDITOR', 'ADMIN', 'OWNER'],
    editPost: ['AUTHOR', 'EDITOR', 'ADMIN', 'OWNER'], // + ownership check
    submitReview: ['AUTHOR'],
    approve: ['REVIEWER', 'EDITOR', 'ADMIN', 'OWNER'],
    publish: ['EDITOR', 'ADMIN', 'OWNER'],
    deletePost: ['ADMIN', 'OWNER'],
  };
  
  export function hasPermission(
    user: { role: Role; id: string },
    permission: Permission,
    resource?: { authorId?: string }
  ): boolean {
    if (ACL[permission].includes(user.role)) {
      // Ownership check for editPost
      if (permission === 'editPost' && resource?.authorId) {
        return user.role !== 'AUTHOR' || resource.authorId === user.id;
      }
      return true;
    }
    return false;
  }
  
  export function requirePermission(permission: Permission) {
    return async (user: User, resource?: any) => {
      if (!hasPermission(user, permission, resource)) {
        throw new Error('FORBIDDEN');
      }
    };
  }
  ```

- `packages/auth/index.ts`:
  ```ts
  export * from './permissions';
  ```

- `apps/admin/app/api/admin/posts/route.ts`:
  ```ts
  import { requireAdmin, hasPermission } from '@khaledaun/auth';
  
  export async function POST(request: Request) {
    const user = await requireAdmin();
    
    if (!hasPermission(user, 'createPost')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // ... rest of handler
  }
  ```

- `packages/db/seed.ts`:
  ```ts
  // Add OWNER user
  await prisma.user.create({
    data: {
      email: 'owner@khaledaun.com',
      name: 'Site Owner',
      role: 'OWNER'
    }
  });
  
  // Add example AUTHOR
  await prisma.user.create({
    data: {
      email: 'author@khaledaun.com',
      name: 'Content Author',
      role: 'AUTHOR'
    }
  });
  ```

**Acceptance Criteria:**
- ✅ Permission checks pass unit tests
- ✅ AUTHOR can create but not publish
- ✅ EDITOR can publish
- ✅ Ownership enforced for AUTHOR editing own posts
- ✅ Seed creates all role examples

---

### PR #3: Bilingual Post Editor UI (Phase 6 Full: Admin)
**Branch:** `feat/phase6-full-editor-ui`  
**Scope:** EN/AR tabs, per-locale preview, AR requirement toggle

**Files:**
- `apps/admin/app/(dashboard)/posts/[id]/page.tsx`:
  ```tsx
  'use client';
  import { useState } from 'react';
  
  export default function EditPost({ params }) {
    const [activeLocale, setActiveLocale] = useState<'en' | 'ar'>('en');
    const [translations, setTranslations] = useState({
      en: { title: '', slug: '', excerpt: '', content: '' },
      ar: { title: '', slug: '', excerpt: '', content: '' }
    });
    
    const handlePreview = (locale: 'en' | 'ar') => {
      // Generate signed preview URL with locale
    };
    
    return (
      <div>
        {/* Locale tabs */}
        <div className="border-b">
          <button onClick={() => setActiveLocale('en')}>English</button>
          <button onClick={() => setActiveLocale('ar')}>العربية</button>
        </div>
        
        {/* Fields for active locale */}
        <input
          value={translations[activeLocale].title}
          onChange={(e) => setTranslations({
            ...translations,
            [activeLocale]: { ...translations[activeLocale], title: e.target.value }
          })}
        />
        
        {/* Per-locale preview */}
        <button onClick={() => handlePreview('en')}>Preview EN</button>
        <button onClick={() => handlePreview('ar')}>Preview AR</button>
        
        {/* Publish button with AR check */}
        <button
          disabled={requireAR && !translations.ar.title}
          onClick={handlePublish}
        >
          Publish
        </button>
      </div>
    );
  }
  ```

- `apps/admin/app/(dashboard)/posts/page.tsx`:
  ```tsx
  {/* Add locale columns */}
  <td>
    {post.translations.find(t => t.locale === 'en') ? '✅' : '🔴'} EN
  </td>
  <td>
    {post.translations.find(t => t.locale === 'ar') ? '✅' : '🔴'} AR
  </td>
  ```

- `apps/admin/app/api/admin/posts/[id]/route.ts`:
  ```ts
  // Update to handle translations
  export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const body = await request.json();
    const { translations } = body; // { en: {...}, ar: {...} }
    
    await prisma.post.update({
      where: { id: params.id },
      data: {
        translations: {
          upsert: [
            {
              where: { postId_locale: { postId: params.id, locale: 'en' } },
              create: { locale: 'en', ...translations.en },
              update: translations.en
            },
            {
              where: { postId_locale: { postId: params.id, locale: 'ar' } },
              create: { locale: 'ar', ...translations.ar },
              update: translations.ar
            }
          ]
        }
      }
    });
  }
  ```

- `apps/admin/app/api/admin/posts/[id]/publish/route.ts`:
  ```ts
  // Add AR requirement check
  const requireAR = process.env.REQUIRE_AR_FOR_PUBLISH === 'true';
  const hasAR = post.translations.some(t => t.locale === 'ar');
  
  if (requireAR && !hasAR) {
    return NextResponse.json(
      { error: 'Arabic translation required before publishing' },
      { status: 400 }
    );
  }
  ```

**Acceptance Criteria:**
- ✅ EN/AR tabs switch correctly
- ✅ Each locale has separate title/slug/content
- ✅ Preview buttons open correct locale preview
- ✅ Publish disabled if AR missing and `REQUIRE_AR_FOR_PUBLISH=true`
- ✅ Post list shows EN/AR status indicators

---

### PR #4: Per-Locale Preview & Revalidation (Phase 6 Full: Site)
**Branch:** `feat/phase6-full-preview-reval`  
**Scope:** Locale-aware preview, flexible revalidation

**Files:**
- `apps/site/src/app/api/preview/route.ts`:
  ```ts
  export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const locale = searchParams.get('locale') || 'en'; // ← Add locale
    const token = searchParams.get('token');
    
    if (!id || !token) {
      return new NextResponse('Missing parameters', { status: 400 });
    }
    
    // Verify token includes locale
    const payload = verifyPreview(token);
    if (!payload || payload.id !== id || payload.locale !== locale) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    draftMode().enable();
    
    // Redirect to correct locale
    return NextResponse.redirect(new URL(`/${locale}/blog/preview/${id}`, request.url));
  }
  ```

- `apps/site/src/app/[locale]/(site)/blog/[slug]/page.js`:
  ```ts
  // Update to fetch by locale + slug
  async function getPost(slug: string, locale: string, showDrafts = false) {
    const post = await prisma.post.findFirst({
      where: {
        translations: {
          some: {
            slug,
            locale: locale as Locale
          }
        }
      },
      include: {
        translations: {
          where: { locale: locale as Locale }
        },
        author: true
      }
    });
    
    if (!showDrafts && post?.status === 'DRAFT') return null;
    return post;
  }
  ```

- `apps/site/src/app/api/revalidate/route.ts`:
  ```ts
  export async function POST(request: NextRequest) {
    const secret = request.headers.get('x-reval-secret');
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Support multiple formats
    if (body.path) {
      // Specific path
      revalidatePath(body.path);
    } else if (body.locale && body.slug) {
      // Per-locale slug
      revalidatePath(`/${body.locale}/blog`);
      revalidatePath(`/${body.locale}/blog/${body.slug}`);
    } else if (body.slug) {
      // Both locales (backward compat)
      revalidatePath('/en/blog');
      revalidatePath('/ar/blog');
      revalidatePath(`/en/blog/${body.slug}`);
      revalidatePath(`/ar/blog/${body.slug}`);
    }
    
    return NextResponse.json({ revalidated: true });
  }
  ```

- `apps/admin/app/api/admin/posts/[id]/publish/route.ts`:
  ```ts
  // Revalidate each translation's slug
  for (const translation of post.translations) {
    await fetch(`${process.env.SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-reval-secret': process.env.REVALIDATE_SECRET! },
      body: JSON.stringify({ locale: translation.locale, slug: translation.slug })
    });
  }
  ```

**Acceptance Criteria:**
- ✅ Preview URL includes `&locale=en|ar`
- ✅ Preview redirects to correct locale path
- ✅ Revalidation supports `{ path }`, `{ locale, slug }`, `{ slug }` formats
- ✅ Publish revalidates each translation separately
- ✅ Different EN/AR slugs both revalidate correctly

---

### PR #5: Phase 6 Full E2E Tests & Docs
**Branch:** `feat/phase6-full-e2e-docs`  
**Scope:** RBAC i18n tests, documentation, tagging

**Files:**
- `apps/tests/e2e/cms-rbac-i18n.spec.ts`:
  ```ts
  import { test, expect } from '@playwright/test';
  
  test.describe('CMS RBAC & i18n', () => {
    test('AUTHOR can create but not publish', async ({ page }) => {
      // Login as AUTHOR
      // Create post
      // Verify publish button disabled
    });
    
    test('EDITOR can publish bilingual post', async ({ page }) => {
      // Login as EDITOR
      // Fill EN translation
      // Fill AR translation
      // Click publish
      // Verify both locales revalidated
    });
    
    test('Per-locale preview works', async ({ page }) => {
      // Create draft with EN + AR
      // Click "Preview EN"
      // Verify EN content shown
      // Click "Preview AR"
      // Verify AR content shown
    });
    
    test('AR requirement enforced', async ({ page, context }) => {
      // Set REQUIRE_AR_FOR_PUBLISH=true
      // Create post with only EN
      // Verify publish disabled
      // Add AR translation
      // Verify publish enabled
    });
  });
  ```

- `docs/phase6-full-readiness.md`:
  ```md
  # Phase 6 Full Readiness
  
  ## Migration Path
  1. Run backfill script
  2. Verify all posts have EN translations
  3. Drop legacy columns
  4. Update admin UI
  5. Test per-locale preview
  6. Deploy
  
  ## Environment Variables
  - `REQUIRE_AR_FOR_PUBLISH` (optional, default: false)
  - `DATABASE_URL`, `PREVIEW_SECRET`, `REVALIDATE_SECRET`
  
  ## Rollback Plan
  If issues arise:
  1. Revert Vercel deployment to previous version
  2. Git revert schema changes
  3. Re-run migrations
  ```

- `packages/db/MIGRATION_GUIDE.md`:
  - Step-by-step instructions
  - SQL verification queries
  - Common issues + fixes

**Acceptance Criteria:**
- ✅ All E2E tests pass
- ✅ Documentation complete
- ✅ `git tag v0.6.1-full && git push --tags`

---

### PR #6: Phase 8 Schema — Social Embeds (Phase 8 Full: Schema)
**Branch:** `feat/phase8-social-schema`  
**Scope:** Add `SocialEmbed` model

**Files:**
- `packages/db/prisma/schema.prisma`:
  ```prisma
  model SocialEmbed {
    id        String   @id @default(cuid())
    key       String   @unique // 'LINKEDIN_WALL', 'TWITTER_FEED', etc.
    html      String   // Sanitized embed code
    enabled   Boolean  @default(true)
    updatedBy String
    updatedAt DateTime @updatedAt
    createdAt DateTime @default(now())
    
    @@map("social_embeds")
  }
  ```

- Run:
  ```bash
  cd packages/db
  pnpm db:push
  ```

**Acceptance Criteria:**
- ✅ Schema migration succeeds
- ✅ Can create/read `SocialEmbed` records

---

### PR #7: Phase 8 Admin UI — Social Embeds CRUD (Phase 8 Full: Admin)
**Branch:** `feat/phase8-social-admin`  
**Scope:** Admin page for managing social embeds

**Files:**
- `pnpm add sanitize-html @types/sanitize-html` (in `apps/admin`)

- `packages/utils/sanitize.ts`:
  ```ts
  import sanitizeHtml from 'sanitize-html';
  
  export function sanitizeSocialEmbed(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: ['iframe', 'div', 'a', 'p', 'span', 'script'],
      allowedAttributes: {
        iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
        div: ['class', 'id', 'data-*'],
        a: ['href', 'target', 'rel'],
        script: ['src', 'async', 'defer']
      },
      allowedSchemes: ['http', 'https'],
      disallowedTagsMode: 'discard'
    });
  }
  ```

- `apps/admin/app/(dashboard)/social/page.tsx`:
  ```tsx
  'use client';
  import { useState, useEffect } from 'react';
  
  export default function SocialEmbedsPage() {
    const [embeds, setEmbeds] = useState([]);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ key: '', html: '', enabled: true });
    
    const handleSave = async () => {
      await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchEmbeds();
    };
    
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Social Embeds</h1>
        
        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <input
            placeholder="Key (e.g., LINKEDIN_WALL)"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          />
          <textarea
            placeholder="Embed HTML code"
            value={formData.html}
            onChange={(e) => setFormData({ ...formData, html: e.target.value })}
            rows={10}
          />
          <label>
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            />
            Enabled
          </label>
          <button onClick={handleSave}>Save</button>
        </div>
        
        {/* List */}
        <div>
          {embeds.map(embed => (
            <div key={embed.id} className="bg-white p-4 mb-4 rounded-lg">
              <h3>{embed.key}</h3>
              <span>{embed.enabled ? '✅ Enabled' : '🔴 Disabled'}</span>
              <button onClick={() => handleEdit(embed)}>Edit</button>
              <button onClick={() => handleDelete(embed.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  ```

- `apps/admin/app/api/admin/social/route.ts`:
  ```ts
  import { NextResponse } from 'next/server';
  import { requireAdmin } from '@khaledaun/auth';
  import { prisma } from '@khaledaun/db';
  import { sanitizeSocialEmbed } from '@khaledaun/utils/sanitize';
  
  export async function GET() {
    const embeds = await prisma.socialEmbed.findMany();
    return NextResponse.json({ embeds });
  }
  
  export async function POST(request: Request) {
    const user = await requireAdmin();
    const body = await request.json();
    
    // Sanitize HTML
    const sanitized = sanitizeSocialEmbed(body.html);
    
    const embed = await prisma.socialEmbed.upsert({
      where: { key: body.key },
      create: {
        key: body.key,
        html: sanitized,
        enabled: body.enabled,
        updatedBy: user.id
      },
      update: {
        html: sanitized,
        enabled: body.enabled,
        updatedBy: user.id
      }
    });
    
    return NextResponse.json({ embed });
  }
  ```

- `apps/admin/app/api/admin/social/[key]/route.ts`:
  ```ts
  // DELETE endpoint
  export async function DELETE(request: Request, { params }) {
    await requireAdmin();
    await prisma.socialEmbed.delete({ where: { key: params.key } });
    return NextResponse.json({ success: true });
  }
  ```

- Update `apps/admin/app/(dashboard)/layout.tsx`:
  ```tsx
  <Link href="/social">Social Embeds</Link>
  ```

**Acceptance Criteria:**
- ✅ Admin can create/edit/delete embeds
- ✅ HTML sanitized on save
- ✅ Enable/disable toggle works

---

### PR #8: Phase 8 Site Integration — Dynamic Social Embeds (Phase 8 Full: Site)
**Branch:** `feat/phase8-social-site`  
**Scope:** Fetch embeds from DB, render on site

**Files:**
- `apps/site/src/app/api/social-embed/[key]/route.ts`:
  ```ts
  import { NextRequest, NextResponse } from 'next/server';
  import { prisma } from '@khaledaun/db';
  
  export const revalidate = 300; // 5 minutes
  
  export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
    try {
      const embed = await prisma.socialEmbed.findUnique({
        where: { key: params.key, enabled: true }
      });
      
      return NextResponse.json({ embed });
    } catch (error) {
      return NextResponse.json({ embed: null });
    }
  }
  ```

- `apps/site/src/components/site/LinkedInSection.js`:
  ```jsx
  'use client';
  import { useEffect, useState } from 'react';
  
  export default function LinkedInSection() {
    const [embedHtml, setEmbedHtml] = useState(null);
    
    useEffect(() => {
      fetch('/api/social-embed/LINKEDIN_WALL')
        .then(res => res.json())
        .then(data => {
          if (data.embed?.html) {
            setEmbedHtml(data.embed.html);
          }
        });
    }, []);
    
    if (!embedHtml) return null;
    
    return (
      <section className="py-16">
        <div className="container">
          <h2>Connect on LinkedIn</h2>
          <div dangerouslySetInnerHTML={{ __html: embedHtml }} />
        </div>
      </section>
    );
  }
  ```

**Acceptance Criteria:**
- ✅ Site fetches embed from DB (cached 5min)
- ✅ Section hidden if embed disabled or not found
- ✅ HTML renders correctly

---

### PR #9: Phase 8 E2E Tests & Tag (Phase 8 Full: Testing)
**Branch:** `feat/phase8-social-e2e`  
**Scope:** E2E tests, documentation, tagging

**Files:**
- `apps/tests/e2e/social-embed-admin.spec.ts`:
  ```ts
  test.describe('Social Embed Admin', () => {
    test('Admin can set LinkedIn embed', async ({ page }) => {
      // Login as admin
      // Go to /social
      // Create LINKEDIN_WALL embed
      // Verify saved
    });
    
    test('Site shows embed when enabled', async ({ page }) => {
      // Set embed enabled=true
      // Visit site
      // Verify embed visible
    });
    
    test('Site hides embed when disabled', async ({ page }) => {
      // Set embed enabled=false
      // Visit site
      // Verify embed not visible
    });
    
    test('Sanitizer blocks XSS', async ({ page }) => {
      // Attempt to save embed with <script>alert('xss')</script>
      // Verify script tag stripped
    });
  });
  ```

- Tag:
  ```bash
  git tag v0.8.0-social-admin
  git push --tags
  ```

**Acceptance Criteria:**
- ✅ All E2E tests pass
- ✅ XSS prevention verified
- ✅ Tag created

---

## 🧪 SMOKE TEST SCRIPTS

### Test A: Per-Locale Preview & Publish (Phase 6 Full)

**Prerequisites:**
- Phase 6 Full PRs #1-5 merged
- Database migrated
- Admin & site deployed

**Browser Steps:**
1. **Login to Admin**
   - Go to `https://admin.khaledaun.com` (or localhost:3000)
   - Login as EDITOR user

2. **Create Bilingual Post**
   - Click "Posts" → "New Post"
   - Switch to "English" tab:
     - Title: "Test Post EN"
     - Slug: "test-post-en"
     - Content: "This is English content"
   - Switch to "العربية" tab:
     - Title: "منشور تجريبي"
     - Slug: "test-post-ar"
     - Content: "هذا محتوى عربي"
   - Click "Save Draft"

3. **Test Per-Locale Preview**
   - Click "Preview EN"
   - **Expected:** New tab opens to `https://site.com/en/blog/preview/[id]?preview=1`
   - **Verify:** English title and content displayed
   - **Verify:** Yellow banner "Preview Mode: Draft"
   - Close tab
   - Click "Preview AR"
   - **Expected:** New tab opens to `https://site.com/ar/blog/preview/[id]?preview=1`
   - **Verify:** Arabic title and content displayed (RTL layout)
   - **Verify:** Yellow banner shown
   - Close tab

4. **Test Publish & Revalidation**
   - Click "Publish" in admin
   - **Expected:** Success message
   - Open new incognito tab
   - Go to `https://site.com/en/blog`
   - **Verify:** Post appears in list with EN title
   - Go to `https://site.com/ar/blog`
   - **Verify:** Post appears in list with AR title
   - Click AR post
   - **Verify:** Correct Arabic content shown
   - **Verify:** No preview banner

5. **Test RBAC (Optional if AUTHOR user available)**
   - Logout
   - Login as AUTHOR
   - Go to "Posts" → "New Post"
   - Fill in post
   - **Expected:** "Publish" button disabled or hidden
   - **Verify:** "Save Draft" works
   - **Verify:** "Submit for Review" button visible

**cURL Validation:**
```bash
# 1. Test revalidation requires secret
curl -X POST https://site.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"slug": "test-post-en"}'
# Expected: 401 Unauthorized

# 2. Test revalidation with secret (per-locale)
curl -X POST https://site.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-reval-secret: YOUR_SECRET" \
  -d '{"locale": "en", "slug": "test-post-en"}'
# Expected: 200 { "revalidated": true }

# 3. Test preview requires signed token
curl "https://site.com/api/preview?id=POST_ID&locale=en"
# Expected: 401 Unauthorized (no token)

# 4. Test health endpoint
curl https://site.com/api/health
# Expected: 200 { "ok": true, "commit": "d174313...", "version": "1.0.0" }

# 5. Verify Post has translations
curl https://site.com/api/posts/POST_ID
# Expected: { "post": { "translations": [{ "locale": "en", ... }, { "locale": "ar", ... }] } }
```

---

### Test B: Social Embed Admin (Phase 8 Full)

**Prerequisites:**
- Phase 8 PRs #6-9 merged
- `SocialEmbed` table exists
- Admin & site deployed

**Browser Steps:**
1. **Login to Admin**
   - Go to admin dashboard
   - Click "Social Embeds" in nav

2. **Create LinkedIn Wall Embed**
   - Key: `LINKEDIN_WALL`
   - HTML: 
     ```html
     <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:123456789" 
             height="500" width="100%" frameborder="0" 
             allowfullscreen="" title="LinkedIn Embed"></iframe>
     ```
   - Enabled: ✅
   - Click "Save"
   - **Expected:** Success message
   - **Verify:** Embed appears in list

3. **Test XSS Sanitization**
   - Edit the embed
   - Add malicious code:
     ```html
     <iframe src="..."></iframe>
     <script>alert('XSS')</script>
     ```
   - Click "Save"
   - Click "Edit" again
   - **Verify:** `<script>` tag is gone, only `<iframe>` remains

4. **View on Site**
   - Open new tab to `https://site.com/en`
   - Scroll to LinkedIn section
   - **Expected:** LinkedIn iframe visible
   - **Verify:** Embed renders correctly

5. **Test Disable**
   - Go back to admin
   - Uncheck "Enabled" for LINKEDIN_WALL
   - Click "Save"
   - Refresh site tab
   - **Expected:** LinkedIn section hidden (or shows fallback message)

6. **Re-enable**
   - Check "Enabled" again
   - Save
   - Refresh site
   - **Expected:** LinkedIn section visible again

**cURL Validation:**
```bash
# 1. Fetch social embed (public)
curl https://site.com/api/social-embed/LINKEDIN_WALL
# Expected: 200 { "embed": { "key": "LINKEDIN_WALL", "html": "...", "enabled": true } }

# 2. Try to create embed without auth (should fail)
curl -X POST https://admin.com/api/admin/social \
  -H "Content-Type: application/json" \
  -d '{"key": "TEST", "html": "<div>test</div>", "enabled": true}'
# Expected: 401 or 403 Unauthorized

# 3. Verify sanitization (as admin - after auth)
curl -X POST https://admin.com/api/admin/social \
  -H "Content-Type: application/json" \
  -H "Cookie: session-user-id=ADMIN_ID" \
  -d '{"key": "XSS_TEST", "html": "<iframe src=\"test\"></iframe><script>alert(1)</script>", "enabled": true}'
# Expected: 200 { "embed": { "html": "<iframe src=\"test\"></iframe>" } }
# (script tag should be stripped)

# 4. Verify disabled embed not returned
# (disable LINKEDIN_WALL in admin first)
curl https://site.com/api/social-embed/LINKEDIN_WALL
# Expected: 200 { "embed": null }
```

---

## 📌 SUMMARY

### Current Status
- ✅ **Phase 6 Lite** — Basic CMS functional (single-language)
- 🔴 **Phase 6 Full** — 0% (needs schema + UI + tests)
- 🔴 **Phase 7** — 0% (not started)
- 🔴 **Phase 8** — 0% (needs schema + admin + site)
- 🔴 **Phase 9** — 0% (not started)

### Critical Path to Phase 6 Full + Phase 8 Full
1. **Fix Blocker #1** — Connect database to Vercel (15 min)
2. **Fix Blocker #2** — Push schema to Supabase (10 min)
3. **PR #1-5** — Phase 6 Full (4-6 hours total)
4. **PR #6-9** — Phase 8 Full (3-4 hours total)

### Total Effort Estimate
- **Database setup:** 25 minutes
- **Phase 6 Full:** 1-2 days
- **Phase 8 Full:** 1 day
- **Total:** 2-3 days to complete both phases

---

**End of Master Status Report**

