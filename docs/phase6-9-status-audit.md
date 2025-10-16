# Phase 6-9 Status Audit Report
**Date:** October 16, 2024  
**Repository:** KhaledAunSite  
**Current State:** Post-Dennis Design Implementation + Phase 6 Lite CMS

---

## 🧩 PHASE 6 — CMS FOUNDATION

### ✅ 6.1 Schema & Models

| Item | Status | Notes |
|------|--------|-------|
| Prisma models finalized | 🔴 **PARTIAL** | We have `Post` (single-language) NOT `PostTranslation` (bilingual) |
| Locale enum (EN/AR) implemented | 🔴 **MISSING** | No `Locale` enum in schema |
| Backfill script run + verified | 🔴 **N/A** | Not needed - never had PostTranslation |
| Columns dropped after verification | 🔴 **N/A** | Still using single Post model with title/content |
| Supabase migrations applied | ⚙️ **PARTIAL** | Schema exists, but migrations not run yet |
| Prisma client singleton | ✅ **DONE** | `packages/db/index.ts` exports client |

**Current Schema:**
```prisma
// CURRENT (Phase 6 Lite)
model Post {
  id          String      @id @default(cuid())
  title       String      // Single language
  slug        String      @unique
  content     String
  status      PostStatus  @default(DRAFT)
  authorId    String
  ...
}

// MISSING (Phase 6 Full)
enum Locale {
  en
  ar
}

model PostTranslation {
  id      String @id
  postId  String
  locale  Locale
  title   String
  slug    String
  content String
  ...
}
```

**What's Needed:**
- [ ] Add `Locale` enum to schema
- [ ] Create `PostTranslation` model
- [ ] Create migration to split existing posts into EN translations
- [ ] Update `Post` model to remove title/content (use translations instead)
- [ ] Run `pnpm db:push` or create migration files

---

### ⚙️ 6.2 Auth & RBAC

| Item | Status | Notes |
|------|--------|-------|
| Roles enum | 🔴 **PARTIAL** | Only `USER` and `ADMIN` (missing AUTHOR/REVIEWER/EDITOR/OWNER) |
| `packages/auth/permissions.ts` ACL | 🔴 **MISSING** | No permissions file exists |
| Ownership check for AUTHOR | 🔴 **MISSING** | No author-level permission checks |
| Admin middleware | ✅ **DONE** | `apps/admin/middleware.ts` restricts access |
| Seed admin/owner user | 🔴 **PARTIAL** | Seed file exists but not run in Supabase yet |

**Current Roles:**
```typescript
// packages/auth/roles.ts
enum Role {
  USER    // ✅ Exists
  ADMIN   // ✅ Exists
  // MISSING:
  // AUTHOR
  // REVIEWER
  // EDITOR
  // OWNER
}
```

**What's Needed:**
- [ ] Expand `Role` enum in schema
- [ ] Create `packages/auth/permissions.ts` with ACL:
  ```typescript
  const PERMISSIONS = {
    createPost: ['AUTHOR', 'EDITOR', 'ADMIN', 'OWNER'],
    editPost: ['AUTHOR (own)', 'EDITOR', 'ADMIN', 'OWNER'],
    submitReview: ['AUTHOR'],
    approve: ['REVIEWER', 'EDITOR', 'ADMIN', 'OWNER'],
    publish: ['EDITOR', 'ADMIN', 'OWNER'],
    deletePost: ['ADMIN', 'OWNER'],
  };
  ```
- [ ] Add ownership checks in API routes
- [ ] Update seed script and run in Supabase

---

### ✅ 6.3 Admin UI

| Item | Status | Notes |
|------|--------|-------|
| Posts list with status | ✅ **DONE** | `/posts` page exists |
| EN/AR translation tabs | 🔴 **MISSING** | Single language editor only |
| Preview buttons per locale | 🔴 **PARTIAL** | Preview exists, but not per-locale |
| Publish workflow → Audit | ✅ **DONE** | Publish API writes to `Audit` table |
| REQUIRE_AR_FOR_PUBLISH flag | 🔴 **MISSING** | No multi-locale validation |

**Current Admin Pages:**
- ✅ `/cms/hero-titles` — Hero titles management (NEW!)
- ✅ `/cms/experiences` — Professional experience + images (NEW!)
- ✅ `/cms/hero-media` — Video/image toggle (NEW!)
- ✅ `/posts` — Blog posts (single-language)
- 🔴 **Missing:** Bilingual translation editor

**What's Needed:**
- [ ] Update `/posts/[id]` to show EN/AR tabs
- [ ] Add inline slug validation per locale
- [ ] Add translation status indicators
- [ ] Implement `REQUIRE_AR_FOR_PUBLISH` env check

---

### ⚙️ 6.4 Preview & Revalidation

| Item | Status | Notes |
|------|--------|-------|
| Preview URL format | 🔴 **PARTIAL** | Uses `?id=<id>&token=<signed>` NOT `&locale=<en\|ar>` |
| Signed token (HMAC-SHA256) | ✅ **DONE** | `packages/utils/preview.ts` signs with PREVIEW_SECRET |
| `/api/revalidate` requires secret | ✅ **DONE** | Checks `x-reval-secret` header |
| ISR per locale slug + indexes | 🔴 **PARTIAL** | Revalidates both locales but no per-locale posts yet |
| Manual revalidate tested | ✅ **DONE** | 401 without secret, 200 with |

**Current Implementation:**
```typescript
// apps/site/src/app/api/preview/route.ts
GET /api/preview?id=<postId>&token=<signed>
// ❌ Missing: &locale=en or &locale=ar

// apps/site/src/app/api/revalidate/route.ts  
POST /api/revalidate
Headers: x-reval-secret
Body: { slug: "post-slug" }
// ✅ Revalidates /en/blog and /ar/blog
// ❌ But posts aren't per-locale yet
```

**What's Needed:**
- [ ] Update preview URL to include `&locale=<en|ar>`
- [ ] Update `/api/preview` to redirect to correct locale path
- [ ] Ensure revalidation works for per-locale slugs
- [ ] Test: EN slug ≠ AR slug revalidation

---

### 🔴 6.5 Testing & Docs

| Item | Status | Notes |
|------|--------|-------|
| `cms-rbac-i18n.spec.ts` E2E | 🔴 **MISSING** | Only `cms-lite-workflow.spec.ts` exists |
| DB health check `/api/health` | ✅ **DONE** | Both site and admin have health endpoints |
| Documentation updated | 🔴 **PARTIAL** | No `phase6-full-readiness.md` |
| Tag `v0.6.1-full` | 🔴 **MISSING** | No version tags created |

**Existing Tests:**
- ✅ `cms-lite-workflow.spec.ts` — Basic post CRUD
- ✅ Various workflow tests (content, auth, lead, etc.)
- 🔴 **Missing:** RBAC tests, i18n tests, per-locale preview tests

**What's Needed:**
- [ ] Create `cms-rbac-i18n.spec.ts` covering:
  - Author can create but not publish
  - Editor can publish
  - Per-locale preview works
  - Bilingual publish flow
- [ ] Document migration strategy in `docs/phase6-full-readiness.md`
- [ ] Tag repository: `git tag v0.6.1-full`

---

## 🎨 PHASE 6.5 — MEDIA LIBRARY & RICH BLOCKS

| Item | Status | Notes |
|------|--------|-------|
| `MediaAsset` model with i18n ALT | ✅ **DONE** | Schema has `MediaAsset` with alt/caption |
| Supabase Storage bucket | 🔴 **MISSING** | No bucket configured |
| Admin upload UI | 🔴 **MISSING** | No file upload interface |
| Rich text/Block editor | 🔴 **MISSING** | Using plain textarea |
| Pre-publish validator | 🔴 **MISSING** | No media/link validation |
| E2E `cms-media-blocks.spec.ts` | 🔴 **MISSING** | No media tests |

**What's Needed:**
- [ ] Create Supabase Storage bucket: `media`
- [ ] Build upload UI with drag-drop
- [ ] Integrate rich text editor (TipTap / Lexical / MDX)
- [ ] Add pre-publish validation
- [ ] Write E2E tests

---

## 🤖 PHASE 7 — AUTOMATION (ICC/DIAC → Drafts)

| Item | Status | Notes |
|------|--------|-------|
| `AutomationSource` + `PromptTemplate` | 🔴 **MISSING** | No automation models |
| Ingestor endpoint `/api/ingest` | 🔴 **MISSING** | No automation endpoints |
| Admin Automation dashboard | 🔴 **MISSING** | No automation UI |
| Manual trigger ("Paste URL") | 🔴 **MISSING** | Not implemented |
| Cron/background worker | 🔴 **MISSING** | No scheduled jobs |
| Feature flag `FF_AUTOMATION` | 🔴 **MISSING** | No feature flags |
| E2E `automation-ingest.spec.ts` | 🔴 **MISSING** | No automation tests |
| Legal/ethical review | 🔴 **MISSING** | Not reviewed |

**Status:** ❌ **Phase 7 NOT STARTED**

---

## 📱 PHASE 8 — SOCIAL EMBEDS

### ✅ 8 Quick Win (Env)

| Item | Status | Notes |
|------|--------|-------|
| `NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML` | 🔴 **REMOVED** | Was working, but removed during Dennis migration |
| Section conditionally renders | 🔴 **N/A** | LinkedIn section exists but no env check |

### 🔴 8 Full (Admin UI)

| Item | Status | Notes |
|------|--------|-------|
| `SocialEmbed` model | 🔴 **MISSING** | No model in schema |
| Admin CRUD `/social` | 🔴 **MISSING** | No social admin page |
| Sanitization with `sanitize-html` | 🔴 **MISSING** | Not implemented |
| Site fetches from DB | 🔴 **MISSING** | Hardcoded section |
| Feature flag `FF_SOCIAL_LINKEDIN` | 🔴 **MISSING** | No feature flags |
| E2E `social-embed-admin.spec.ts` | 🔴 **MISSING** | No social tests |
| Tag `v0.8.0-social-admin` | 🔴 **MISSING** | Not tagged |

**Status:** ❌ **Phase 8 NOT STARTED**

---

## 📧 PHASE 9 — SOCIAL GENERATOR + EMAIL SYSTEM

| Item | Status | Notes |
|------|--------|-------|
| Models (`SocialPost`, `EmailSubscriber`, `EmailCampaign`) | 🔴 **MISSING** | No models |
| Generator UI + OpenAI integration | 🔴 **MISSING** | Not built |
| Email API (Resend/SES) | 🔴 **MISSING** | Not integrated |
| Feature flag `FF_SOCIAL_GENERATOR` | 🔴 **MISSING** | No feature flags |
| GDPR + CAN-SPAM compliance | 🔴 **MISSING** | Not reviewed |
| E2E `social-email.spec.ts` | 🔴 **MISSING** | No tests |
| Tag `v0.9.0-social-email` | 🔴 **MISSING** | Not tagged |

**Status:** ❌ **Phase 9 NOT STARTED**

---

## 🔧 CROSS-PHASE MAINTENANCE

| Item | Status | Notes |
|------|--------|-------|
| CI workflow green | ⚙️ **PARTIAL** | E2E disabled in CI (placeholder message) |
| Supabase metrics + backups | 🔴 **MISSING** | Not configured |
| Vercel analytics | 🔴 **MISSING** | Not enabled |
| Error tracking (Sentry) | 🔴 **MISSING** | Not configured |
| Docs (`status-matrix.md`) | 🔴 **OUTDATED** | Needs update |

---

## ✨ ADDITIONAL FEATURES (Not in Original Plan)

### ✅ Dennis Theme Design Migration
- ✅ Full design system from Dennis Next.js theme
- ✅ Google Fonts (Poppins + Inter)
- ✅ Tailwind config + custom components
- ✅ Dark mode support
- ✅ Material Design Icons
- ✅ Navigation, Hero, About, Services, Experience, Contact, Footer

### ✅ Custom CMS Features
- ✅ **Hero Titles CMS** (`HeroTitle` model)
  - Bilingual rotating titles (EN/AR)
  - Order management
  - Enable/disable toggle
- ✅ **Experience CMS** (`Experience` + `ExperienceImage` models)
  - Company, role, dates
  - Multiple images per experience
  - Image captions + ordering
- ✅ **Hero Media CMS** (`HeroMedia` model)
  - Image OR Video toggle
  - YouTube / Vimeo / Self-hosted support
  - Autoplay option
  - Live preview in admin

---

## 📊 SUMMARY SCORECARD

### Phase 6 — CMS Foundation
- **6.1 Schema:** 🟡 20% (Single-language Post, missing PostTranslation)
- **6.2 Auth/RBAC:** 🟡 30% (Basic admin, missing full roles)
- **6.3 Admin UI:** 🟢 60% (Posts + Custom CMS built)
- **6.4 Preview/Revalidate:** 🟡 70% (Works, but not per-locale)
- **6.5 Testing/Docs:** 🔴 30% (Basic tests, missing RBAC/i18n)

**Overall Phase 6:** 🟡 **42% Complete** (Lite version done, Full version pending)

### Phase 6.5 — Media Library
**Overall:** 🔴 **10% Complete** (Schema exists, no implementation)

### Phase 7 — Automation
**Overall:** 🔴 **0% Complete** (Not started)

### Phase 8 — Social Embeds
**Overall:** 🔴 **0% Complete** (Not started)

### Phase 9 — Social Generator + Email
**Overall:** 🔴 **0% Complete** (Not started)

### Cross-Phase Maintenance
**Overall:** 🔴 **20% Complete** (Basic CI, missing observability)

---

## 🎯 RECOMMENDED NEXT STEPS

### Option A: Complete Phase 6 Full (Bilingual CMS)
**Priority:** HIGH  
**Effort:** 2-3 days  
**Impact:** Unlock true bilingual content management

**Tasks:**
1. Add `Locale` enum and `PostTranslation` model
2. Expand `Role` enum + create permissions ACL
3. Build bilingual editor UI with EN/AR tabs
4. Update preview/revalidate for per-locale slugs
5. Write `cms-rbac-i18n.spec.ts`
6. Tag `v0.6.1-full`

### Option B: Complete Phase 8 (Social Embeds Admin)
**Priority:** MEDIUM  
**Effort:** 1-2 days  
**Impact:** Non-devs can manage LinkedIn wall + future embeds

**Tasks:**
1. Add `SocialEmbed` model
2. Build `/cms/social` admin page
3. Integrate `sanitize-html`
4. Update site to fetch from DB
5. Write `social-embed-admin.spec.ts`
6. Tag `v0.8.0-social-admin`

### Option C: Deploy Current State (Phase 6 Lite + Custom CMS)
**Priority:** HIGH  
**Effort:** 0.5 days  
**Impact:** Get site live with working CMS

**Tasks:**
1. Run database migrations: `pnpm db:push`
2. Seed data: `pnpm db:seed-cms`
3. Set Vercel env vars (DATABASE_URL, etc.)
4. Deploy to production
5. Test all CMS features live

### Option D: Add Media Library (Phase 6.5)
**Priority:** MEDIUM-HIGH  
**Effort:** 2-3 days  
**Impact:** Enable image uploads, rich text editing

**Tasks:**
1. Create Supabase Storage bucket
2. Build file upload UI
3. Integrate rich text editor (TipTap/Lexical)
4. Add image optimization
5. Write `cms-media-blocks.spec.ts`

---

## 🚦 DEPLOYMENT READINESS

### ✅ Ready to Deploy (with caveats):
- ✅ Site design (Dennis theme)
- ✅ Hero titles CMS
- ✅ Experience CMS
- ✅ Hero media CMS
- ✅ Basic blog (single-language)

### 🔴 NOT Ready (requires work):
- 🔴 Bilingual blog posts
- 🔴 Full RBAC (AUTHOR/REVIEWER/EDITOR roles)
- 🔴 Media uploads
- 🔴 Automation
- 🔴 Social embeds admin
- 🔴 Email system

---

## 💡 RECOMMENDATION

**Primary Path:** 

1. **NOW:** Deploy Phase 6 Lite + Custom CMS (Option C)
   - Get the site live
   - Test in production
   - Gather feedback

2. **NEXT:** Complete Phase 6 Full (Option A)
   - Enable bilingual content
   - Implement full RBAC
   - Professional multi-author workflow

3. **THEN:** Add Phase 6.5 Media Library (Option D)
   - File uploads
   - Rich text editing
   - Better content UX

4. **FINALLY:** Phases 7-9 (Automation + Social + Email)
   - Advanced features
   - Marketing automation
   - Growth tools

---

**End of Audit Report**

