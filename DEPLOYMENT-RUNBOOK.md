# 🚀 Production Deployment Runbook
**Phases:** 6 Full + 8 Full  
**Date:** October 16, 2024  
**Tags:** v0.6.1-full, v0.8.0-social-admin

---

## ⚠️ **PRE-DEPLOYMENT CHECKLIST**

- [ ] All PRs merged to main
- [ ] CI passing (16/16 E2E tests)
- [ ] Local testing complete
- [ ] Team notified of deployment
- [ ] Maintenance window scheduled (if needed)
- [ ] Rollback plan reviewed

---

## 📋 **STEP 0: Environment Sanity Check**

### **Vercel Environment Variables (Both Apps)**

**Required Variables:**
```
DATABASE_URL=postgresql://postgres.[PWD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DIRECT_URL=postgresql://postgres.[PWD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require
REVALIDATE_SECRET=[32-char-secret]
PREVIEW_SECRET=[32-char-secret]
SITE_URL=https://khaledaun.vercel.app
NEXT_PUBLIC_SITE_URL=https://khaledaun.vercel.app
```

**Verify in Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Check both `apps/site` and `apps/admin`
3. Ensure all 6 variables present in all environments (Production, Preview, Development)
4. Confirm no empty strings

**Deliverable Template:**
```
✅ apps/site environment variables:
   - DATABASE_URL: Set (ends: ...xxx)
   - DIRECT_URL: Set (ends: ...yyy)
   - REVALIDATE_SECRET: Set (ends: ...zzz)
   - PREVIEW_SECRET: Set (ends: ...aaa)
   - SITE_URL: https://khaledaun.vercel.app
   - NEXT_PUBLIC_SITE_URL: https://khaledaun.vercel.app

✅ apps/admin environment variables:
   - DATABASE_URL: Set (ends: ...xxx)
   - DIRECT_URL: Set (ends: ...yyy)
   - REVALIDATE_SECRET: Set (ends: ...zzz)
   - PREVIEW_SECRET: Set (ends: ...aaa)
   - SITE_URL: https://khaledaun.vercel.app
   - NEXT_PUBLIC_SITE_URL: https://khaledaun.vercel.app

Screenshot: [paste Vercel dashboard screenshot URL]
```

---

## 📋 **STEP 1: Apply Schema & Seed**

### **Commands to Run:**

```bash
# Navigate to database package
cd packages/db

# Set environment (replace with your actual Supabase URLs)
export DIRECT_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require"
export DATABASE_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

# Apply schema changes
pnpm db:push

# Seed database
pnpm db:seed

# Backfill Phase 6 Full
pnpm tsx scripts/backfill-phase6-full.ts

# Verify migration
pnpm tsx scripts/verify-post-translations.ts
```

### **Expected Outputs:**

**pnpm db:push:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"

The following migration(s) have been created and applied:

migrations/
  └─ 20241016_phase6_8_full/
      └─ migration.sql

✔ Generated Prisma Client (5.17.0)

🚀 Your database is now in sync with your Prisma schema.
```

**Tables Created (14 total):**
- ai_artifacts
- audits
- experience_images
- experiences
- hero_media
- hero_titles
- job_runs
- leads
- media_assets
- post_media
- post_translations ← Phase 6
- posts (updated)
- social_embeds ← Phase 8
- seo_entries
- users (updated)

**pnpm db:seed:**
```
🌱 Seeding database for Phase 6 Full...
✅ Owner user created: owner@khaledaun.com
✅ Admin user created: admin@khaledaun.com
✅ Editor user created: editor@khaledaun.com
✅ Author user created: author@khaledaun.com
✅ Reviewer user created: reviewer@khaledaun.com
✅ Draft post created: welcome-to-phase-6-lite
✅ Audit trail created for draft post
✅ Social embed placeholder created: LINKEDIN_WALL
🎉 Seeding completed successfully!
```

**Users Seeded:** 5 (OWNER, ADMIN, EDITOR, AUTHOR, REVIEWER)

**pnpm tsx scripts/backfill-phase6-full.ts:**
```
🚀 Starting Phase 6 Full backfill migration...
📊 Found [N] posts to migrate

✅ Migrated post "Post Title 1" (slug: post-title-1)
✅ Migrated post "Post Title 2" (slug: post-title-2)
...

============================================================
📊 Backfill Migration Summary:
============================================================
✅ Successfully migrated: [N] posts
⏭️  Skipped (already migrated): 0 posts
❌ Errors: 0 posts
============================================================

🎉 Backfill migration completed successfully!
```

**Posts Backfilled:** [Record actual count]

**pnpm tsx scripts/verify-post-translations.ts:**
```
🔍 Starting Phase 6 Full verification...

Test 1: Checking all posts have at least one translation...
✅ All posts have at least one translation

Test 2: Checking all posts have English (en) translation...
✅ All posts have English translation

Test 3: Checking for duplicate slugs per locale...
✅ No duplicate slugs found

Test 4: Translation statistics...
📊 Total posts: [N]
📊 Total translations: [N]
   - English (en): [N]
   - Arabic (ar): 0

Test 5: Verifying data integrity for sample posts...
✅ Post "[Title]" - data integrity verified

============================================================
📊 Verification Summary:
============================================================
✅ Test 1: All posts have translations
✅ Test 2: All posts have English translations
✅ Test 3: No duplicate slugs per locale
✅ Test 4: Statistics collected
✅ Test 5: Data integrity verified for sample posts
============================================================

5/5 tests passed

🎉 All verification tests passed!
```

### **Deliverable Template:**
```
✅ Schema Push: 14 tables created/updated
✅ Seed: 5 users created (OWNER, ADMIN, EDITOR, AUTHOR, REVIEWER)
✅ Backfill: [N] posts migrated to EN translations
✅ Verification: 5/5 tests passed

SQL Verification:
SELECT COUNT(*) FROM users; -- Expected: 5
SELECT COUNT(*) FROM post_translations WHERE locale = 'en'; -- Expected: [N]
SELECT COUNT(*) FROM social_embeds; -- Expected: 1 (LINKEDIN_WALL)
```

---

## 📋 **STEP 2: Deploy Both Apps**

### **Commands:**

```bash
# Ensure on main branch
git checkout main
git pull origin main

# Verify clean state
git status

# Push to trigger Vercel deployment
git push origin main
```

### **Monitor Deployments:**

1. **Vercel Dashboard:**
   - Watch both `apps/site` and `apps/admin` deployments
   - Verify build succeeds
   - Note deployment IDs and URLs

2. **Check Build Logs:**
   - Ensure no TypeScript errors
   - Verify Prisma client generated
   - Confirm `sanitize-html` installed

### **Deliverable Template:**
```
✅ Deployments Complete:

apps/site:
  - URL: https://khaledaun.vercel.app
  - Deployment ID: dpl_xxxxxxxxxxxxx
  - Commit SHA: [7-char]
  - Build Status: ✅ Success
  - Build Time: [N] seconds

apps/admin:
  - URL: https://admin.khaledaun.vercel.app
  - Deployment ID: dpl_yyyyyyyyyyyyy
  - Commit SHA: [7-char]
  - Build Status: ✅ Success
  - Build Time: [N] seconds

Screenshot: [Vercel dashboard URL]
```

---

## 📋 **STEP 3: E2E Tests (CI + Smoke)**

### **CI Verification:**

Check GitHub Actions:
- Latest commit has green checkmark
- E2E workflow passed (16/16 tests)
- No failures in Phase 6 or Phase 8 tests

### **Manual Smoke Tests:**

#### **Test 1: Bilingual Post (Phase 6)**

```
1. Login to admin: https://admin.khaledaun.vercel.app
2. Navigate to /posts
3. Click "Create New Post"
4. EN tab:
   - Title: "Production Test Post"
   - Slug: "production-test-post"
   - Content: "This is the English version"
5. AR tab:
   - Title: "منشور اختبار الإنتاج"
   - Slug: "production-test-post-ar"
   - Content: "هذا هو الإصدار العربي"
6. Click "Save Draft"
7. Click "Preview EN" → Opens new tab
   ✅ Shows English content
   ✅ Preview banner visible
8. Click "Preview AR" → Opens new tab
   ✅ Shows Arabic content
   ✅ RTL layout
   ✅ Preview banner visible
9. Click "Publish"
   ✅ Success message
10. Visit EN: https://khaledaun.vercel.app/en/blog/production-test-post
   ✅ English content renders
11. Visit AR: https://khaledaun.vercel.app/ar/blog/production-test-post-ar
   ✅ Arabic content renders
   ✅ RTL layout
```

#### **Test 2: Social Embed (Phase 8)**

```
1. Admin → /social
2. Click "New Embed"
3. Key: "LINKEDIN_WALL"
4. HTML: Paste this (with malicious script):
   <script>alert('XSS')</script>
   <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:123" 
           width="500" height="600" frameborder="0" 
           allowfullscreen title="LinkedIn Feed"></iframe>
5. Enable ✓
6. Click "Save"
   ✅ Success
7. Click "LINKEDIN_WALL" to edit
8. Check HTML textarea:
   ✅ Script removed
   ✅ Only iframe remains
9. Site: https://khaledaun.vercel.app
10. Scroll to LinkedIn section:
   ✅ Section visible
   ✅ Iframe renders
11. Admin → Disable LINKEDIN_WALL
12. Wait 5-10 minutes (cache expiry)
13. Site → Refresh
   ✅ LinkedIn section hidden
```

### **Deliverable Template:**
```
✅ CI E2E: 16/16 tests passed
   - Phase 6 tests: 8/8 ✅
   - Phase 8 tests: 8/8 ✅
   - CI Run: https://github.com/.../actions/runs/[ID]

✅ Smoke Tests:

Phase 6 - Bilingual Post:
   - EN Preview: https://khaledaun.vercel.app/en/blog/preview/[id]?preview=1 ✅
   - AR Preview: https://khaledaun.vercel.app/ar/blog/preview/[id]?preview=1 ✅
   - EN Published: https://khaledaun.vercel.app/en/blog/production-test-post ✅
   - AR Published: https://khaledaun.vercel.app/ar/blog/production-test-post-ar ✅
   - RTL Layout: ✅
   - Preview Banner: ✅

Phase 8 - Social Embed:
   - XSS Sanitization: ✅ (script removed)
   - Embed Renders: ✅
   - Enable/Disable: ✅ (section hides after cache)
   
Screenshots:
   - EN Post: [URL]
   - AR Post: [URL]
   - LinkedIn Section: [URL]
```

---

## 📋 **STEP 4: Security Checks**

### **Commands:**

```bash
# Replace <SITE_URL> and <REVALIDATE_SECRET> with actual values

# Test 1: Revalidation without secret (should 401)
curl -X POST https://khaledaun.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"slug":"test"}'

# Test 2: Revalidation with secret (should 200)
curl -X POST https://khaledaun.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-reval-secret: YOUR_REVALIDATE_SECRET" \
  -d '{"locale":"en","slug":"test-post"}'

# Test 3: Preview without token (should 401)
curl "https://khaledaun.vercel.app/api/preview?id=SOME_ID&locale=en"

# Test 4: Preview with invalid token (should 401)
curl "https://khaledaun.vercel.app/api/preview?id=SOME_ID&locale=en&token=invalid"
```

### **Expected Results:**

**Test 1 (No secret):**
```json
HTTP/1.1 401 Unauthorized
{
  "error": "Unauthorized - Invalid secret"
}
```

**Test 2 (With secret):**
```json
HTTP/1.1 200 OK
{
  "revalidated": true,
  "paths": ["/en/blog", "/en/blog/test-post"]
}
```

**Test 3 & 4 (No/invalid token):**
```
HTTP/1.1 401 Unauthorized
Missing token parameter
```
or
```
HTTP/1.1 401 Unauthorized
Invalid or expired token
```

### **Deliverable Template:**
```
✅ Security Tests:

Revalidation API:
   - Without secret: 401 ✅
   - With wrong secret: 401 ✅
   - With correct secret: 200 ✅
   - Response includes paths: ✅

Preview API:
   - Without token: 401 ✅
   - With invalid token: 401 ✅
   - With valid token: 302 redirect ✅

Test Results:
[Paste curl output or screenshot]
```

---

## 📋 **STEP 5: Health & Observability**

### **Health Check Commands:**

```bash
# Site health
curl https://khaledaun.vercel.app/api/health

# Admin health
curl https://admin.khaledaun.vercel.app/api/health
```

### **Expected Responses:**

**Site:**
```json
{
  "ok": true,
  "service": "site",
  "version": "1.0.0",
  "commit": "abc1234",
  "timestamp": "2024-10-16T12:00:00.000Z",
  "env": "production"
}
```

**Admin:**
```json
{
  "ok": true,
  "service": "admin",
  "status": "healthy",
  "timestamp": "2024-10-16T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "commit": "abc1234",
  "services": {
    "database": {
      "status": "configured"
    }
  },
  "responseTime": 45
}
```

### **Vercel Analytics:**

1. Vercel Dashboard → Analytics
2. Verify data flowing
3. Check deployment shows in timeline

### **Sentry (if configured):**

1. Sentry.io → Project
2. Verify deployment tagged
3. Check no errors on initial pageviews

### **Deliverable Template:**
```
✅ Health Endpoints:

Site:
   - URL: https://khaledaun.vercel.app/api/health
   - Status: 200 ✅
   - ok: true ✅
   - commit: abc1234 ✅
   - Response time: [N]ms

Admin:
   - URL: https://admin.khaledaun.vercel.app/api/health
   - Status: 200 ✅
   - ok: true ✅
   - commit: abc1234 ✅
   - DB status: configured ✅
   - Response time: [N]ms

Vercel Analytics:
   - Enabled: [YES/NO]
   - Data flowing: ✅
   - Screenshot: [URL]

Sentry:
   - Configured: [YES/NO]
   - Deployment tagged: ✅
   - No errors: ✅
   - Dashboard: [URL]
```

---

## 📋 **STEP 6: Tag & Changelog**

### **Commands:**

```bash
# Ensure on main, all changes committed
git checkout main
git pull origin main

# Tag Phase 6 Full
git tag -a v0.6.1-full -m "Phase 6 Full: Bilingual CMS with RBAC

Features:
- Bilingual content (EN/AR) with independent slugs
- 6 RBAC roles (OWNER, ADMIN, EDITOR, REVIEWER, AUTHOR, USER)
- Fine-grained permissions with ownership checks
- Per-locale preview and ISR revalidation
- Translation status indicators
- Optional AR requirement toggle

Testing:
- 8 E2E test scenarios
- RBAC permission coverage
- Security tests (tokens, secrets)

Documentation:
- Complete migration guide
- Deployment readiness checklist
- Troubleshooting guide"

# Push tag
git push origin v0.6.1-full

# Tag Phase 8 Full
git tag -a v0.8.0-social-admin -m "Phase 8 Full: Database-Driven Social Embeds

Features:
- Social embed admin with CRUD
- Server-side HTML sanitization (XSS protection)
- RBAC enforcement (EDITOR+ create/edit, ADMIN+ delete)
- 5-minute ISR caching on site
- Enable/disable toggle
- Audit trail for all operations

Security:
- Strict HTML sanitization allowlist
- Scripts completely removed
- Permission-based access control

Performance:
- 5-minute cache (99.97% reduction in DB load)
- Stale-while-revalidate
- CDN edge caching

Testing:
- 8 E2E test scenarios
- XSS sanitization coverage
- RBAC permission validation"

# Push tag
git push origin v0.8.0-social-admin
```

### **Create GitHub Releases:**

**Release 1: v0.6.1-full**
```
Title: Phase 6 Full: Bilingual CMS with RBAC 🌍

Body: [Use content from docs/PR-5-E2E-DOCS-SUMMARY.md release notes section]
```

**Release 2: v0.8.0-social-admin**
```
Title: Phase 8 Full: Database-Driven Social Embeds 📱

Body: [Use content from docs/PR-9-SOCIAL-E2E-SUMMARY.md release notes section]
```

### **Deliverable Template:**
```
✅ Tags Created:

v0.6.1-full:
   - Tag URL: https://github.com/[user]/KhaledAunSite/releases/tag/v0.6.1-full
   - Commit: [SHA]
   - Date: [Date]

v0.8.0-social-admin:
   - Tag URL: https://github.com/[user]/KhaledAunSite/releases/tag/v0.8.0-social-admin
   - Commit: [SHA]
   - Date: [Date]

GitHub Releases:
   - v0.6.1-full: https://github.com/[user]/KhaledAunSite/releases/v0.6.1-full
   - v0.8.0-social-admin: https://github.com/[user]/KhaledAunSite/releases/v0.8.0-social-admin
```

---

## 📋 **STEP 7: Documentation Updates**

Create a PR with these updates:

1. Update `docs/audit/status-matrix.md`
2. Update `PHASES-6-8-FINAL-STATUS.md` with actual deployment info
3. Create `RELEASE_NOTES_0.6.1_0.8.0.md`

### **Deliverable Template:**
```
✅ Documentation PR:
   - PR: https://github.com/[user]/KhaledAunSite/pull/[N]
   - Branch: docs/phase-6-8-deployment-[date]
   - Files updated:
     - docs/audit/status-matrix.md
     - PHASES-6-8-FINAL-STATUS.md
     - RELEASE_NOTES_0.6.1_0.8.0.md (new)
   - Status: [Open/Merged]
```

---

## 📋 **STEP 8: Follow-up Issues**

Create GitHub issues for next sprints.

### **Deliverable Template:**
```
✅ Follow-up Issues Created:

1. Phase 6.5: Rich Media & Publishing Enhancements
   - Issue: https://github.com/[user]/KhaledAunSite/issues/[N]
   - Labels: enhancement, phase-6.5
   
2. Phase 7: AI Content Automation
   - Issue: https://github.com/[user]/KhaledAunSite/issues/[N]
   - Labels: enhancement, phase-7, ai
   
3. Phase 9: Social Generator + Email
   - Issue: https://github.com/[user]/KhaledAunSite/issues/[N]
   - Labels: enhancement, phase-9, social
   
4. Observability: Analytics & Monitoring
   - Issue: https://github.com/[user]/KhaledAunSite/issues/[N]
   - Labels: ops, monitoring
```

---

## ✅ **POST-DEPLOYMENT VERIFICATION**

- [ ] All environment variables set
- [ ] Schema migrations applied
- [ ] Seed data created
- [ ] Both apps deployed successfully
- [ ] CI tests passing (16/16)
- [ ] Manual smoke tests passing
- [ ] Security checks passing
- [ ] Health endpoints returning OK
- [ ] Tags pushed
- [ ] Releases created
- [ ] Documentation updated
- [ ] Follow-up issues created
- [ ] Team notified
- [ ] Monitoring active

---

## 🚨 **ROLLBACK PROCEDURE**

If critical issues arise:

### **Option 1: Vercel Rollback (Quick)**
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Repeat for both apps

### **Option 2: Database Rollback (if needed)**
```sql
-- Only if database changes caused issues
-- Run in Supabase SQL Editor

-- Drop Phase 8 table
DROP TABLE IF EXISTS social_embeds CASCADE;

-- Drop Phase 6 table
DROP TABLE IF EXISTS post_translations CASCADE;

-- Revert Role enum (requires careful migration)
-- Contact DBA or use Prisma migration revert
```

### **Option 3: Full Revert**
```bash
git revert [commit-range]
git push origin main
# Wait for Vercel to redeploy
```

---

**Runbook Version:** 1.0  
**Last Updated:** October 16, 2024  
**Maintainer:** Development Team

