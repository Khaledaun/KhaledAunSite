# Phase 6 Full Readiness Guide
**Version:** v0.6.1-full  
**Date:** October 16, 2024  
**Migration:** Phase 6 Lite → Phase 6 Full

---

## 🎯 **OVERVIEW**

This guide covers the migration from Phase 6 Lite (single-language CMS) to Phase 6 Full (bilingual CMS with RBAC).

**What's New in Phase 6 Full:**
- ✅ Bilingual content (EN/AR with separate slugs)
- ✅ Expanded RBAC (6 roles: OWNER, ADMIN, EDITOR, REVIEWER, AUTHOR, USER)
- ✅ Fine-grained permissions with ownership checks
- ✅ Per-locale preview and ISR revalidation
- ✅ Translation status indicators
- ✅ Optional AR requirement toggle

---

## 📋 **PREREQUISITES**

### **Required:**
- Supabase project with Postgres database
- Vercel project for apps/site and apps/admin
- Node.js 20+ and pnpm 9+
- Access to Supabase and Vercel dashboards

### **Credentials Needed:**
- Supabase DATABASE_URL (pooled connection)
- Supabase DIRECT_URL (direct connection for migrations)
- PREVIEW_SECRET and REVALIDATE_SECRET (32-char random strings)

---

## 🚀 **MIGRATION STEPS**

### **Step 1: Environment Variables**

Set these in Vercel for **both apps/site and apps/admin**:

```env
# Database (from Supabase → Settings → Database)
DATABASE_URL=postgresql://postgres.[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DIRECT_URL=postgresql://postgres.[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require

# Secrets (generate with: openssl rand -base64 32)
PREVIEW_SECRET=<your-32-char-secret>
REVALIDATE_SECRET=<your-32-char-secret>

# Site URLs
SITE_URL=https://khaledaun.vercel.app
NEXT_PUBLIC_SITE_URL=https://khaledaun.vercel.app

# Optional: Require AR translation before publishing
REQUIRE_AR_FOR_PUBLISH=false  # or "true"
```

**Verification:**
```bash
# Check Vercel dashboard
vercel env ls
```

---

### **Step 2: Apply Schema Changes**

**Locally (for testing):**
```bash
cd packages/db

# Set environment
export DATABASE_URL="<your-pooled-url>?pgbouncer=true&connection_limit=1&sslmode=require"
export DIRECT_URL="<your-direct-url>?sslmode=require"

# Push schema to Supabase
pnpm db:push
```

**Expected Output:**
```
🚀  Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client (5.17.0)
```

**Verification Query:**
```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected: 13 tables including new 'post_translations'
```

---

### **Step 3: Seed Users (Optional but Recommended)**

```bash
pnpm db:seed
```

**Expected Output:**
```
✅ Owner user created: owner@khaledaun.com
✅ Admin user created: admin@khaledaun.com
✅ Editor user created: editor@khaledaun.com
✅ Author user created: author@khaledaun.com
✅ Reviewer user created: reviewer@khaledaun.com
✅ Draft post created: welcome-to-phase-6-lite
✅ Audit trail created
```

**Verification Query:**
```sql
SELECT email, name, role FROM users ORDER BY role;
```

---

### **Step 4: Backfill Existing Posts**

This creates English translations for all existing posts:

```bash
pnpm tsx scripts/backfill-phase6-full.ts
```

**Expected Output:**
```
📊 Found N posts to migrate
✅ Migrated post "Title 1" (slug: slug-1)
✅ Migrated post "Title 2" (slug: slug-2)
...
============================================================
✅ Successfully migrated: N posts
⏭️  Skipped (already migrated): 0 posts
❌ Errors: 0 posts
============================================================
```

**Verification Query:**
```sql
SELECT p.id, p.title, COUNT(pt.id) as translation_count
FROM posts p
LEFT JOIN post_translations pt ON pt.post_id = p.id
GROUP BY p.id, p.title
HAVING COUNT(pt.id) = 0;

-- Should return 0 rows (all posts have translations)
```

---

### **Step 5: Verify Migration**

```bash
pnpm tsx scripts/verify-post-translations.ts
```

**Expected Output:**
```
✅ Test 1: All posts have translations
✅ Test 2: All posts have English translations
✅ Test 3: No duplicate slugs per locale
✅ Test 4: Statistics collected
✅ Test 5: Data integrity verified

5/5 tests passed
🎉 All verification tests passed!
```

**If Any Test Fails:**
- Review error details
- Check database state manually
- Re-run backfill if needed
- Contact support if issues persist

---

### **Step 6: Deploy Applications**

```bash
# Build locally first (optional)
pnpm --filter @khaledaun/admin build
pnpm --filter @khaledaun/site build

# Push to Vercel (or use Git push to trigger auto-deploy)
git push origin main
```

**Monitor Deployment:**
- Check Vercel deployment logs
- Verify no build errors
- Check runtime logs for database connection issues

---

### **Step 7: Smoke Testing**

#### **Admin - Posts List:**
```
1. Login to admin dashboard
2. Go to /posts
3. Verify "Translations" column shows ✅ EN / 🔴 AR
4. Verify can see posts (AUTHOR sees only own, EDITOR sees all)
```

#### **Admin - Bilingual Editor:**
```
1. Click "Create New Post"
2. Click "English (EN)" tab
   - Fill: Title, Slug, Content
3. Click "العربية (AR)" tab
   - Fill: Title, Slug, Content (should show RTL)
4. Click "Save Draft"
5. Verify translation status bar shows ✅ for both
```

#### **Admin - Per-Locale Preview:**
```
1. Create draft with EN + AR
2. Click "Preview EN"
   - Opens: /en/blog/preview/[id]
   - Verify: English content + "Preview Mode" banner
3. Click "Preview AR"
   - Opens: /ar/blog/preview/[id]
   - Verify: Arabic content + RTL layout + banner
```

#### **Admin - Publish:**
```
1. As EDITOR, click "Publish"
2. Verify success message
3. Visit /en/blog/[en-slug] → English content
4. Visit /ar/blog/[ar-slug] → Arabic content
```

#### **Admin - RBAC:**
```
1. Login as AUTHOR
   - Create draft ✅
   - Publish ❌ (button disabled/hidden)
2. Login as EDITOR
   - Create draft ✅
   - Publish ✅
```

#### **Admin - AR Requirement:**
```
1. Set REQUIRE_AR_FOR_PUBLISH=true in Vercel
2. Create post with EN only
3. Verify: Publish button disabled
4. Add AR translation
5. Verify: Publish button enabled
```

---

## 🔧 **ENVIRONMENT VARIABLES REFERENCE**

### **Required (Both Apps):**
| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Pooled connection for app runtime | `postgresql://...?pgbouncer=true&connection_limit=1&sslmode=require` |
| `DIRECT_URL` | Direct connection for migrations | `postgresql://...?sslmode=require` |
| `PREVIEW_SECRET` | Sign preview tokens | 32-char random string |
| `REVALIDATE_SECRET` | Authenticate ISR revalidation | 32-char random string |
| `SITE_URL` | Your site URL | `https://khaledaun.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | Same as SITE_URL |

### **Optional:**
| Variable | Purpose | Default |
|----------|---------|---------|
| `REQUIRE_AR_FOR_PUBLISH` | Enforce AR translation before publish | `false` |

---

## 🔄 **ROLLBACK PLAN**

If issues arise after deployment:

### **Option 1: Revert Deployment (Quick)**
```bash
# In Vercel dashboard:
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
```

### **Option 2: Revert Schema (Full Rollback)**

**⚠️ WARNING: This will delete all translations!**

```sql
-- Run in Supabase SQL Editor

-- 1. Drop new table
DROP TABLE IF EXISTS post_translations CASCADE;

-- 2. Revert Role enum (if needed)
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
ALTER TABLE users ALTER COLUMN role TYPE "Role" USING role::text::"Role";
DROP TYPE "Role_old";

-- 3. Revert Locale enum
DROP TYPE IF EXISTS "Locale";
```

**Then:**
```bash
# Revert code
git revert <commit-hash-of-phase6-full>
git push origin main

# Re-run migrations for Phase 6 Lite
cd packages/db
pnpm db:push
```

---

## 📊 **VERIFICATION QUERIES**

### **Check Translation Coverage:**
```sql
SELECT 
  COUNT(DISTINCT p.id) as total_posts,
  COUNT(DISTINCT CASE WHEN pt.locale = 'en' THEN p.id END) as posts_with_en,
  COUNT(DISTINCT CASE WHEN pt.locale = 'ar' THEN p.id END) as posts_with_ar
FROM posts p
LEFT JOIN post_translations pt ON pt.post_id = p.id;
```

### **Find Posts Missing Translations:**
```sql
SELECT p.id, p.title, p.slug
FROM posts p
LEFT JOIN post_translations pt ON pt.post_id = p.id
WHERE pt.id IS NULL;
```

### **Check Slug Uniqueness Per Locale:**
```sql
SELECT locale, slug, COUNT(*) as count
FROM post_translations
GROUP BY locale, slug
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

### **Verify User Roles:**
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;
```

---

## 🚨 **TROUBLESHOOTING**

### **Issue: "DATABASE_URL resolved to an empty string"**
**Fix:**
- Verify env vars set in Vercel for all environments
- Redeploy after setting variables
- Check build logs for typos

### **Issue: "Can't reach database server"**
**Fix:**
- Verify Supabase IP allowlist (allow all: 0.0.0.0/0)
- Check connection strings include `?sslmode=require`
- Try DIRECT_URL for migrations instead of DATABASE_URL

### **Issue: "Preview returns 401 Unauthorized"**
**Fix:**
- Verify PREVIEW_SECRET matches in both apps
- Check token hasn't expired (1 hour TTL)
- Ensure locale parameter matches token

### **Issue: "Revalidation fails silently"**
**Fix:**
- Verify REVALIDATE_SECRET matches in both apps
- Check site URL is correct
- Review site logs for errors
- Test with curl manually

### **Issue: "Publish button always disabled"**
**Fix:**
- Check user role (EDITOR+ required)
- Verify EN translation exists
- If REQUIRE_AR_FOR_PUBLISH=true, verify AR exists
- Check browser console for errors

---

## 📝 **POST-MIGRATION CHECKLIST**

After migration, verify:

- [ ] All environment variables set (12 total: 6 per app)
- [ ] Database has 13 tables
- [ ] All existing posts have EN translations
- [ ] No duplicate slugs per locale
- [ ] 5 users seeded with different roles
- [ ] Health endpoints return 200
- [ ] Admin login works
- [ ] Can create bilingual post
- [ ] Per-locale preview works
- [ ] Publish revalidates both locales
- [ ] RBAC permissions enforced
- [ ] No errors in Vercel logs

---

## 🎯 **SUCCESS CRITERIA**

Phase 6 Full is ready when:

✅ **Functionality:**
- Bilingual posts can be created, edited, published
- Each locale has independent slug
- Preview works per locale
- Revalidation updates correct paths

✅ **Security:**
- RBAC enforced (AUTHOR can't publish)
- Preview requires signed tokens
- Revalidation requires secret

✅ **Quality:**
- E2E tests pass
- No console errors
- Performance acceptable (<3s page load)

✅ **Documentation:**
- Migration guide complete
- Rollback plan tested
- Team trained on new features

---

## 📞 **SUPPORT**

**If you encounter issues:**
1. Check this readiness guide
2. Review `packages/db/MIGRATION_GUIDE.md`
3. Check PR summaries in `docs/PR-*-SUMMARY.md`
4. Contact: [support contact]

**Common Resources:**
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Issues: [repo-url]/issues

---

**Migration Guide Version:** 1.0  
**Last Updated:** October 16, 2024  
**Compatible with:** Phase 6 Full (v0.6.1-full)

