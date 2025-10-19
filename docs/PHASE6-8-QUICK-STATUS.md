# Phase 6–8 Quick Status & Action Plan
**Date:** October 16, 2024  
**Site:** ✅ LIVE on Vercel  
**CMS:** 🔴 OFFLINE (database not connected)

---

## 🎯 WHERE WE ARE TODAY

```
Phase 6 Lite:  ████████████████████ 100% ✅ (LIVE, single-language only)
Phase 6 Full:  ███░░░░░░░░░░░░░░░░░  15% 🔴 (needs i18n schema + UI)
Phase 8 Full:  █░░░░░░░░░░░░░░░░░░░   5% 🔴 (LinkedIn hardcoded, no admin)
```

**Bottom Line:** Site is live but CMS is broken. Need to fix 2 blockers before development can continue.

---

## 🚨 CRITICAL BLOCKERS (Fix First!)

### ⚠️ Blocker 1: Database Not Connected to Vercel
**Why it matters:** Admin CMS returns 500 errors, can't create/publish posts

**Fix (15 min):**
1. Go to Supabase → Settings → Database
2. Copy these connection strings:
   - **Pooling connection:** `postgresql://postgres.[PASSWORD]@[PROJECT].supabase.co:6543/postgres?pgbouncer=true`
   - **Direct connection:** `postgresql://postgres.[PASSWORD]@[PROJECT].supabase.co:5432/postgres`

3. In Vercel → Settings → Environment Variables (for **both** apps/admin AND apps/site):
   ```
   DATABASE_URL=<pooling connection from step 2>
   DIRECT_URL=<direct connection from step 2>
   PREVIEW_SECRET=<generate random 32-char string>
   REVALIDATE_SECRET=<generate random 32-char string>
   NEXT_PUBLIC_SITE_URL=https://khaledaun.vercel.app
   ```

4. Redeploy both apps

---

### ⚠️ Blocker 2: Schema Not Pushed to Supabase
**Why it matters:** Database tables don't exist yet

**Fix (10 min):**
```bash
# 1. Set env vars locally (use values from Blocker 1)
export DATABASE_URL="<pooling connection>"
export DIRECT_URL="<direct connection>"

# 2. Push schema
cd packages/db
pnpm db:push

# 3. Seed initial data
pnpm db:seed

# 4. Verify (should see tables: users, posts, audits, hero_titles, etc.)
# Check in Supabase SQL Editor:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

**Expected output:** Tables created, 1 admin user + 1 sample post inserted

---

## 📋 VERIFICATION CHECKLIST

After fixing blockers, verify:

- [ ] Visit `https://admin.khaledaun.com/api/health` → Should return `{ ok: true, commit: "d174313" }`
- [ ] Visit `https://khaledaun.vercel.app/api/health` → Should return `{ ok: true }`
- [ ] Login to admin → Should see dashboard
- [ ] Go to `/posts` → Should see "Welcome to Phase 6 Lite CMS" post
- [ ] Create new post → Should save successfully
- [ ] Publish post → Should appear on site

---

## 🛠️ PHASE 6 FULL — WORK REQUIRED

### What's Missing for Bilingual CMS?

| Component | Status | Work Needed |
|-----------|--------|-------------|
| **Schema** | 🔴 Missing | Add `Locale` enum, `PostTranslation` model, expand `Role` enum |
| **RBAC** | 🔴 Missing | Create `permissions.ts`, update middleware for granular checks |
| **Admin UI** | 🔴 Missing | EN/AR tabs, per-locale preview, AR requirement toggle |
| **Site** | 🔴 Partial | Per-locale preview, flexible revalidation |
| **Tests** | 🔴 Missing | E2E tests for RBAC + i18n workflows |
| **Docs** | 🔴 Missing | Migration guide, readiness docs |

### PR Sequence (2-3 days total)

1. **PR #1: Schema Refactor** (4-5 hours)
   - Add `enum Locale { en, ar }`
   - Add `PostTranslation` model
   - Expand `Role` enum: `AUTHOR | REVIEWER | EDITOR | OWNER | ADMIN`
   - Create backfill script
   - Drop legacy Post columns

2. **PR #2: RBAC & Permissions** (3-4 hours)
   - Create `packages/auth/permissions.ts`
   - Add ACL: `createPost`, `editPost`, `approve`, `publish`, `deletePost`
   - Update admin middleware for granular checks
   - Seed all role examples

3. **PR #3: Bilingual Post Editor UI** (6-8 hours)
   - Add EN/AR tabs to `/posts/[id]/page.tsx`
   - Per-locale fields: title, slug, excerpt, content
   - "Preview EN" and "Preview AR" buttons
   - Publish disabled if AR missing (when `REQUIRE_AR_FOR_PUBLISH=true`)
   - Posts list shows EN/AR status indicators

4. **PR #4: Per-Locale Preview & Revalidation** (2-3 hours)
   - Update preview route to accept `&locale=en|ar`
   - Update revalidation API to support:
     - `{ path: '/en/blog/my-post' }`
     - `{ locale: 'en', slug: 'my-post' }`
     - `{ slug: 'my-post' }` (both locales)
   - Publish revalidates each translation separately

5. **PR #5: E2E Tests & Docs** (3-4 hours)
   - Create `apps/tests/e2e/cms-rbac-i18n.spec.ts`
   - Test AUTHOR can't publish, EDITOR can
   - Test per-locale preview
   - Test AR requirement enforcement
   - Write `docs/phase6-full-readiness.md`
   - Write `packages/db/MIGRATION_GUIDE.md`
   - Tag `v0.6.1-full`

**Total Estimated Effort:** 18-24 hours (2-3 days)

---

## 🛠️ PHASE 8 FULL — WORK REQUIRED

### What's Missing for Social Embeds Admin?

| Component | Status | Work Needed |
|-----------|--------|-------------|
| **Schema** | 🔴 Missing | Add `SocialEmbed` model |
| **Admin UI** | 🔴 Missing | CRUD page for managing embeds |
| **Sanitization** | 🔴 Missing | Add `sanitize-html` package, server-side sanitization |
| **Site** | 🔴 Hardcoded | Fetch from DB instead of env vars |
| **Tests** | 🔴 Missing | E2E tests for CRUD + XSS prevention |

### PR Sequence (1 day total)

6. **PR #6: SocialEmbed Schema** (1 hour)
   - Add `model SocialEmbed` to schema
   - Fields: `key` (unique), `html`, `enabled`, `updatedBy`
   - Run migration

7. **PR #7: Social Embeds Admin UI** (4-5 hours)
   - Create `/apps/admin/app/(dashboard)/social/page.tsx`
   - CRUD form: key, HTML textarea, enabled checkbox
   - Add `sanitize-html` package
   - Create `packages/utils/sanitize.ts`
   - Sanitize HTML before saving
   - Create API routes: `/api/admin/social` (GET/POST/DELETE)

8. **PR #8: Dynamic Social Embeds on Site** (2-3 hours)
   - Create `/apps/site/src/app/api/social-embed/[key]/route.ts`
   - 5-min cache
   - Update `LinkedInSection.js` to fetch from API instead of env vars
   - Show/hide based on `enabled` flag

9. **PR #9: Social E2E Tests & Tag** (2-3 hours)
   - Create `apps/tests/e2e/social-embed-admin.spec.ts`
   - Test admin can set/update/delete embeds
   - Test site shows/hides based on enabled
   - Test XSS prevention (script tags stripped)
   - Tag `v0.8.0-social-admin`

**Total Estimated Effort:** 9-12 hours (1 day)

---

## 📊 FILE-BY-FILE EVIDENCE SUMMARY

### ✅ What's Working (Phase 6 Lite)

| File | Status | Notes |
|------|--------|-------|
| `packages/db/prisma/schema.prisma` | ✅ Lite | Post model exists (single-language) |
| `packages/auth/index.ts` | ✅ Done | `requireAdmin()`, `getSessionUser()` |
| `apps/admin/middleware.ts` | ✅ Basic | Cookie-based admin check |
| `apps/admin/app/(dashboard)/posts/page.tsx` | ✅ Done | List posts, publish, delete |
| `apps/admin/app/(dashboard)/posts/[id]/page.tsx` | ✅ Done | Edit form (single-language) |
| `apps/admin/app/api/admin/posts/[id]/publish/route.ts` | ✅ Done | Publishes + creates audit + revalidates |
| `apps/site/src/app/api/preview/route.ts` | ✅ Done | Signed preview tokens |
| `apps/site/src/app/api/revalidate/route.ts` | ✅ Done | Secret-protected revalidation |
| `apps/site/src/app/api/health/route.ts` | ✅ Done | Includes commit hash |
| `apps/admin/app/api/health/route.ts` | ✅ Done | Includes commit hash |
| `packages/db/seed.ts` | ✅ Done | Seeds admin user + sample post |

### 🔴 What's Missing (Phase 6 Full)

| File | Status | Action |
|------|--------|--------|
| `packages/db/prisma/schema.prisma` | 🔴 No i18n | Add `Locale` enum, `PostTranslation` model, expand `Role` enum |
| `packages/auth/permissions.ts` | 🔴 Missing | Create ACL + `hasPermission()` |
| `packages/db/scripts/backfill-phase6-full.ts` | 🔴 Missing | Create backfill script |
| `apps/admin/app/(dashboard)/posts/[id]/page.tsx` | 🔴 No tabs | Add EN/AR tabs, per-locale fields |
| `apps/admin/app/(dashboard)/posts/page.tsx` | 🔴 No i18n | Add EN/AR status indicators |
| `apps/site/src/app/api/preview/route.ts` | 🔴 No locale | Add `&locale=en|ar` support |
| `apps/site/src/app/api/revalidate/route.ts` | 🔴 Hardcoded | Support flexible path/locale options |
| `apps/tests/e2e/cms-rbac-i18n.spec.ts` | 🔴 Missing | Create E2E tests |
| `docs/phase6-full-readiness.md` | 🔴 Missing | Write readiness docs |
| `packages/db/MIGRATION_GUIDE.md` | 🔴 Missing | Write migration guide |

### 🔴 What's Missing (Phase 8 Full)

| File | Status | Action |
|------|--------|--------|
| `packages/db/prisma/schema.prisma` | 🔴 No model | Add `SocialEmbed` model |
| `apps/admin/app/(dashboard)/social/page.tsx` | 🔴 Missing | Create CRUD page |
| `apps/admin/app/api/admin/social/route.ts` | 🔴 Missing | Create GET/POST endpoints |
| `apps/admin/app/api/admin/social/[key]/route.ts` | 🔴 Missing | Create DELETE endpoint |
| `packages/utils/sanitize.ts` | 🔴 Missing | Create sanitization helper |
| `apps/site/src/app/api/social-embed/[key]/route.ts` | 🔴 Missing | Create fetch endpoint |
| `apps/site/src/components/site/LinkedInSection.js` | 🔴 Hardcoded | Update to fetch from API |
| `apps/tests/e2e/social-embed-admin.spec.ts` | 🔴 Missing | Create E2E tests |

---

## 🏁 IMMEDIATE NEXT STEPS

### Step 1: Fix Blockers (30 min)
1. Connect Supabase to Vercel
2. Push schema migrations
3. Run seed script
4. Verify health endpoints

### Step 2: Phase 6 Full (2-3 days)
5. PR #1: Schema Refactor
6. PR #2: RBAC & Permissions
7. PR #3: Bilingual Post Editor UI
8. PR #4: Per-Locale Preview & Revalidation
9. PR #5: E2E Tests & Docs

### Step 3: Phase 8 Full (1 day)
10. PR #6: SocialEmbed Schema
11. PR #7: Social Embeds Admin UI
12. PR #8: Dynamic Social Embeds on Site
13. PR #9: Social E2E Tests & Tag

### Step 4: Phase 7 & 9 (Future)
- Phase 7: Automation (ICC/DIAC ingest)
- Phase 9: Social generator + email campaigns

---

## 📌 TAG RECOMMENDATIONS

Based on current state and planned work:

| Tag | When | Criteria |
|-----|------|----------|
| `v0.6.0-lite` | ✅ **Now** | Mark current Phase 6 Lite state (already live) |
| `v0.6.1-full` | After PR #5 | Phase 6 Full complete (bilingual CMS + RBAC) |
| `v0.8.0-social-admin` | After PR #9 | Phase 8 Full complete (social embeds admin) |
| `v0.7.0-automation` | Future | Phase 7 complete |
| `v0.9.0-generator` | Future | Phase 9 complete |

**Recommended immediate action:** Tag current state as `v0.6.0-lite` to mark the baseline.

---

**End of Quick Status**

Generated: October 16, 2024  
Full audit: `docs/AUDIT-REPORT-OCT-16-2024.md`  
Master plan: `docs/PHASE6-9-MASTER-STATUS.md`

