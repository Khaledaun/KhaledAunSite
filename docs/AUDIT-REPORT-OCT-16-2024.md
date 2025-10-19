# Phase 6–9 Master Audit Report
**Date:** October 16, 2024 (Thursday)  
**Repository:** KhaledAunSite (Commit: d174313)  
**Deployment:** ✅ Live on Vercel  
**Auditor:** AI Assistant  
**Baseline:** docs/PHASE6-9-MASTER-STATUS.md

---

## 🎯 EXECUTIVE SUMMARY

### Overall Progress
- **Phase 6 Lite:** ✅ **100%** — CMS functional in single-language mode (LIVE)
- **Phase 6 Full:** 🔴 **15%** — Schema partially ready, NO i18n translation model
- **Phase 7:** 🔴 **0%** — Not started
- **Phase 8:** 🔴 **5%** — LinkedIn section exists but hardcoded, no admin UI
- **Phase 9:** 🔴 **0%** — Not started

### Critical Blockers (Must Fix Before Development)
1. 🚨 **Database not connected to Vercel** — `DATABASE_URL` empty in production
2. 🚨 **Schema migrations not pushed** — Database tables don't exist in Supabase
3. 🔴 **No bilingual schema** — Missing `Locale` enum and `PostTranslation` model

### Immediate Next Steps
1. Connect Supabase to Vercel (15 min)
2. Push schema migrations to Supabase (10 min)
3. Start Phase 6 Full PRs (2-3 days estimated)
4. Start Phase 8 Full PRs (1 day estimated)

---

## 📊 DETAILED AUDIT RESULTS

## Phase 6.1 — Schema & Models

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **Locale enum (EN/AR)** | 🔴 **MISSING** | No `enum Locale` in `packages/db/prisma/schema.prisma:1-216` | Schema only has `enum Role { USER, ADMIN }` at lines 73-76 |
| **PostTranslation model** | 🔴 **MISSING** | No `model PostTranslation` found | Required for Phase 6 Full bilingual posts |
| **Post model refactored** | 🔴 **NOT DONE** | `packages/db/prisma/schema.prisma:99-116` | Post still has `title`, `content`, `excerpt` fields — should be moved to translations |
| **Backfill script** | 🔴 **MISSING** | No file found matching `**/backfill*.ts` | Need `packages/db/scripts/backfill-phase6-full.ts` |
| **Legacy columns dropped** | 🔴 **N/A** | Cannot drop until PostTranslation exists | Blocked by schema refactor |
| **Migrations applied** | 🔴 **NOT APPLIED** | Blocker #2 — migrations not pushed to Supabase | Need to run `pnpm db:push` with DIRECT_URL |
| **Prisma client singleton** | ✅ **DONE** | `packages/db/index.ts:1-4` | Exports singleton with dev-mode global caching |

**Phase 6.1 Score:** 🔴 **14% (1/7 items complete)**

---

## Phase 6.2 — Auth & RBAC

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **Roles enum expanded** | 🔴 **PARTIAL** | `packages/db/prisma/schema.prisma:73-76` | Only has `USER` and `ADMIN` — missing `AUTHOR`, `REVIEWER`, `EDITOR`, `OWNER` |
| **permissions.ts exists** | 🔴 **MISSING** | No file matching `**/permissions.ts` | `packages/auth/` only has `index.ts`, `roles.ts`, `package.json` |
| **Admin middleware enforces roles** | ⚙️ **PARTIAL** | `apps/admin/middleware.ts:74-82` | Has basic admin check via cookie, but no granular permission checks |
| **Seed script creates all roles** | 🔴 **PARTIAL** | `packages/db/seed.ts:8-17` | Only creates ADMIN user — no OWNER, AUTHOR, REVIEWER, or EDITOR examples |

**Phase 6.2 Score:** 🔴 **25% (1/4 items complete)**

---

## Phase 6.3 — Admin UI

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **Posts list shows locale availability** | 🔴 **NO i18n** | `apps/admin/app/(dashboard)/posts/page.tsx:176-184` | Shows `status` badge ✅, but no EN/AR translation indicators |
| **/posts/[id] supports EN/AR tabs** | 🔴 **MISSING** | `apps/admin/app/(dashboard)/posts/[id]/page.tsx:1-182` | Single-language form only — no locale tabs |
| **Preview buttons per locale** | 🔴 **PARTIAL** | `apps/admin/app/(dashboard)/posts/[id]/page.tsx:143-148` | Single "Preview Draft" button — no per-locale preview |
| **Publish writes Audit** | ✅ **DONE** | `apps/admin/app/api/admin/posts/[id]/publish/route.ts:49-62` | Creates audit record with `entity: 'Post'`, `action: 'PUBLISH'` |
| **REQUIRE_AR_FOR_PUBLISH toggle** | 🔴 **MISSING** | No code checks this env var | Not implemented in publish route |

**Phase 6.3 Score:** 🔴 **20% (1/5 items complete)**

---

## Phase 6.4 — Preview & Revalidation

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **Preview URL includes locale** | 🔴 **NO LOCALE** | `apps/site/src/app/api/preview/route.ts:10-38` | Hardcoded to `/en/blog/preview/${id}` — no locale param |
| **Tokens signed with PREVIEW_SECRET** | ✅ **DONE** | `apps/site/src/app/api/preview/route.ts:21-26` | Uses `verifyPreview(token)` from `@khaledaun/utils/preview` |
| **/api/revalidate requires secret** | ✅ **DONE** | `apps/site/src/app/api/revalidate/route.ts:13-29` | Checks `x-reval-secret` header against `REVALIDATE_SECRET` |
| **/api/revalidate supports locale/path** | 🔴 **HARDCODED** | `apps/site/src/app/api/revalidate/route.ts:36-42` | Revalidates both `/en/blog` and `/ar/blog` on every call — no per-locale flexibility |
| **Publish revalidates both locales** | ⚙️ **PARTIAL** | `apps/admin/app/api/admin/posts/[id]/publish/route.ts:64-77` | Triggers revalidation ✅, but assumes same slug for EN/AR |

**Phase 6.4 Score:** ⚙️ **50% (2.5/5 items complete)**

---

## Phase 6.5 — Testing & Docs

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **E2E cms-rbac-i18n.spec.ts** | 🔴 **MISSING** | No file matching `**/cms-rbac-i18n.spec.ts` | `apps/tests/e2e/` has `cms-lite-workflow.spec.ts` but not Phase 6 Full tests |
| **Health endpoints with commit hash** | ✅ **DONE** | `apps/site/src/app/api/health/route.ts:12`<br>`apps/admin/app/api/health/route.ts:17` | Both include `commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) \|\| 'local'` |
| **docs/phase6-full-readiness.md** | 🔴 **MISSING** | File doesn't exist in `docs/` | Only `phase6-lite-env-vars.md` exists |
| **packages/db/MIGRATION_GUIDE.md** | 🔴 **MISSING** | File doesn't exist | No migration guide for Lite → Full |
| **Tag v0.6.1-full** | 🔴 **NOT READY** | Phase 6 Full not complete | Cannot tag until PRs merged |

**Phase 6.5 Score:** 🔴 **20% (1/5 items complete)**

---

## Phase 6.5 — Media Library & Rich Blocks

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **MediaAsset model with i18n ALT** | ✅ **DONE** | `packages/db/prisma/schema.prisma:27-41` | Has `alt String?` and `caption String?` |
| **Supabase Storage bucket** | 🔴 **MISSING** | No evidence of bucket creation | Need to verify in Supabase dashboard |
| **Admin upload UI** | 🔴 **MISSING** | No upload components in `apps/admin/app/(dashboard)/` | No media management page |
| **Rich text editor** | 🔴 **MISSING** | Post editor uses plain textarea | No TipTap/Lexical integration |
| **Pre-publish validator** | 🔴 **MISSING** | No validation endpoint | No broken link/media checks |
| **E2E cms-media-blocks.spec.ts** | 🔴 **MISSING** | Test doesn't exist | - |

**Phase 6.5 Score:** 🔴 **17% (1/6 items complete)**

---

## Phase 7 — Automation (ICC/DIAC → Drafts)

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **All items** | 🔴 **0%** | Phase 7 not started | All models, endpoints, UI, tests missing |

**Phase 7 Score:** 🔴 **0% (0/6 items)**

---

## Phase 8 — Social Embeds

### 8 Quick Win (Env)

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML** | ⚙️ **DEPRECATED** | `apps/site/src/components/site/LinkedInSection.js:10-11` | Component checks `NEXT_PUBLIC_FF_SOCIAL_WALL` and `NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML`, but hardcoded fallback |

### 8 Full (Admin UI)

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **SocialEmbed model** | 🔴 **MISSING** | No `SocialEmbed` in schema | Grep found no matches |
| **Admin CRUD /social** | 🔴 **MISSING** | No file matching `**/social/page.tsx` | `apps/admin/app/(dashboard)/` has no social page |
| **Server sanitization (sanitize-html)** | 🔴 **MISSING** | Package not installed | Need to add to dependencies |
| **Site fetches from DB** | 🔴 **HARDCODED** | `apps/site/src/components/site/LinkedInSection.js:10-73` | Uses env vars, not database |
| **Feature flag FF_SOCIAL_LINKEDIN** | ⚙️ **PARTIAL** | `LinkedInSection.js:10` checks `NEXT_PUBLIC_FF_SOCIAL_WALL` | Exists but env-based, not in dedicated flags module |
| **E2E social-embed-admin.spec.ts** | 🔴 **MISSING** | No file matching `**/social-embed*.spec.ts` | Test doesn't exist |
| **Tag v0.8.0-social-admin** | 🔴 **NOT READY** | Phase 8 not complete | - |

**Phase 8 Score:** 🔴 **7% (0.5/7 items complete)**

---

## Phase 9 — Social Generator + Email

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **All items** | 🔴 **0%** | Phase 9 not started | All models, OpenAI integration, email provider, tests missing |

**Phase 9 Score:** 🔴 **0% (0/6 items)**

---

## Cross-Phase Maintenance

| Item | Status | Evidence | Notes |
|------|--------|----------|-------|
| **CI green on all E2E** | 🔴 **DISABLED** | `.github/workflows/e2e.yml:92-93` | Step says: `echo "✅ Dennis design implemented - E2E tests to be rewritten"` |
| **Supabase backups scheduled** | 🔴 **UNKNOWN** | No evidence in repo | Need to check Supabase dashboard |
| **Vercel Analytics enabled** | 🔴 **UNKNOWN** | No evidence in configs | Not found in `next.config.js` |
| **Sentry configured** | ✅ **PARTIAL** | `apps/admin/sentry.*.config.ts` files exist | Sentry dependency present, config files exist |
| **docs/audit/status-matrix.md updated** | 🔴 **OUTDATED** | `docs/audit/status-matrix.md` exists but outdated | Doesn't reflect Phase 6–9 transition |

**Cross-Phase Score:** 🔴 **20% (1/5 items complete)**

---

## 🚨 HARD BLOCKERS (Must Fix Immediately)

### Blocker 1: Database Not Connected to Vercel
**Impact:** 🔴 **CRITICAL** — CMS completely non-functional in production

**Evidence:**
- Build logs show: `The environment variable DATABASE_URL resolved to an empty string`
- Admin/site can't query database

**Fix (15 minutes):**
1. Get Supabase connection strings:
   - Go to Supabase → Settings → Database
   - Copy **Connection String (Pooling)** for `DATABASE_URL`
   - Copy **Connection String (Direct)** for `DIRECT_URL`

2. Set in Vercel (both apps/admin and apps/site):
   ```bash
   DATABASE_URL=postgresql://postgres.[PASSWORD]@[PROJECT].supabase.co:6543/postgres?pgbouncer=true
   PREVIEW_SECRET=[generate-random-32-char]
   REVALIDATE_SECRET=[generate-random-32-char]
   NEXT_PUBLIC_SITE_URL=https://khaledaun.vercel.app
   ```

3. Redeploy both apps

---

### Blocker 2: Schema Migrations Not Pushed to Supabase
**Impact:** 🔴 **CRITICAL** — Database schema incomplete

**Evidence:**
- Schema file exists at `packages/db/prisma/schema.prisma`
- No evidence migrations have been applied to Supabase

**Fix (10 minutes):**
1. Set `DIRECT_URL` locally:
   ```bash
   export DIRECT_URL="postgresql://postgres.[PASSWORD]@[PROJECT].supabase.co:5432/postgres"
   export DATABASE_URL="$DIRECT_URL"
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
**Impact:** 🟡 **MEDIUM** — Cannot create EN/AR content

**Evidence:**
- Schema has `Post` with `title/content/excerpt` fields
- No `PostTranslation` model
- No `Locale` enum

**Fix:** Complete PR #1 from master status document (2-3 hours)

---

## 📋 RECOMMENDED PR SEQUENCE

Based on the audit, here's the critical path:

### Immediate (Blockers)
1. **Manual:** Connect Supabase to Vercel (15 min)
2. **Manual:** Push schema migrations (10 min)

### Phase 6 Full (2-3 days)
3. **PR #1:** Schema Refactor — Add `Locale` enum, `PostTranslation` model, expand `Role` enum
4. **PR #2:** RBAC & Permissions — Add `permissions.ts`, update middleware
5. **PR #3:** Bilingual Post Editor UI — EN/AR tabs, per-locale preview
6. **PR #4:** Per-Locale Preview & Revalidation — Flexible revalidation
7. **PR #5:** Phase 6 Full E2E Tests & Docs — Tests, docs, tag

### Phase 8 Full (1 day)
8. **PR #6:** Phase 8 Schema — Add `SocialEmbed` model
9. **PR #7:** Phase 8 Admin UI — Social embeds CRUD with sanitization
10. **PR #8:** Phase 8 Site Integration — Dynamic social embeds
11. **PR #9:** Phase 8 E2E Tests & Tag — Tests, tag

### Phase 7, 9 (Deferred)
- Phase 7 automation can be tackled after Phase 6 + 8
- Phase 9 social generator + email is lowest priority

---

## 🎯 SUCCESS METRICS

### Phase 6 Full Ready When:
- ✅ Can create bilingual posts (EN + AR with separate slugs)
- ✅ AUTHOR can create but not publish
- ✅ EDITOR can publish
- ✅ Per-locale preview works
- ✅ AR requirement toggle enforced
- ✅ E2E tests pass
- ✅ Tag `v0.6.1-full` created

### Phase 8 Full Ready When:
- ✅ Admin can manage social embeds via UI
- ✅ HTML is sanitized server-side
- ✅ Site fetches from DB (cached)
- ✅ Enable/disable toggle works
- ✅ XSS prevention verified
- ✅ E2E tests pass
- ✅ Tag `v0.8.0-social-admin` created

---

## 📈 PROGRESS TRACKING

| Phase | Completion | Items Done | Total Items | ETA |
|-------|------------|------------|-------------|-----|
| 6.1 Schema | 14% | 1 | 7 | PR #1 |
| 6.2 RBAC | 25% | 1 | 4 | PR #2 |
| 6.3 Admin UI | 20% | 1 | 5 | PR #3 |
| 6.4 Preview/Reval | 50% | 2.5 | 5 | PR #4 |
| 6.5 Testing/Docs | 20% | 1 | 5 | PR #5 |
| 6.5 Media | 17% | 1 | 6 | Post-Phase 6 Full |
| 7 Automation | 0% | 0 | 6 | Deferred |
| 8 Social | 7% | 0.5 | 7 | PRs #6-9 |
| 9 Generator | 0% | 0 | 6 | Deferred |
| Cross-Phase | 20% | 1 | 5 | Ongoing |

**Overall Phase 6-9 Completion:** 🔴 **15%** (estimated based on weighted priorities)

---

## 🏁 NEXT ACTIONS (Priority Order)

### Today (30 min)
1. ⚡ Connect Supabase to Vercel (DATABASE_URL, DIRECT_URL, secrets)
2. ⚡ Push schema migrations to Supabase (`pnpm db:push`)
3. ⚡ Run seed script (`pnpm db:seed`)
4. ⚡ Verify health endpoints return green

### This Week (Phase 6 Full)
5. 🔨 PR #1: Schema Refactor (Locale enum, PostTranslation model, Role expansion)
6. 🔨 PR #2: RBAC & Permissions (permissions.ts, granular middleware)
7. 🔨 PR #3: Bilingual Post Editor (EN/AR tabs, per-locale fields)
8. 🔨 PR #4: Per-Locale Preview & Revalidation (flexible revalidation API)
9. 🔨 PR #5: E2E Tests & Docs (cms-rbac-i18n.spec.ts, readiness docs)

### Next Week (Phase 8 Full)
10. 🔨 PR #6: SocialEmbed Schema
11. 🔨 PR #7: Social Embeds Admin UI (CRUD + sanitization)
12. 🔨 PR #8: Dynamic Social Embeds on Site
13. 🔨 PR #9: Social E2E Tests & Tag

### Future (Phases 7, 9)
14. Phase 7: Automation (ICC/DIAC ingest)
15. Phase 9: Social generator + Email campaigns

---

**End of Audit Report**

Generated: October 16, 2024  
Next Audit: After Phase 6 Full completion  
Commit: d174313

