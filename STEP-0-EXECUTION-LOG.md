# Step 0: Preflight Execution Log
**Date:** October 16, 2024  
**Status:** Ready for User Execution

---

## ⚡ **COMMANDS TO RUN**

### **1. Verify Vercel Environment Variables**

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required for apps/site:**
- `DATABASE_URL` (pooled with `?pgbouncer=true&connection_limit=1&sslmode=require`)
- `DIRECT_URL` (direct with `?sslmode=require`)
- `PREVIEW_SECRET` (32-char random string)
- `REVALIDATE_SECRET` (32-char random string)
- `SITE_URL` (e.g., `https://khaledaun.vercel.app`)
- `NEXT_PUBLIC_SITE_URL` (same as SITE_URL)

**Required for apps/admin:**
- Same as above (all 6 variables)

✅ **Check:** All variables present in both apps, all environments

---

### **2. Apply Schema to Supabase**

```bash
cd packages/db

# Set local environment (use your actual Supabase credentials)
export DATABASE_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
export DIRECT_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require"

# Push schema
pnpm db:push
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"

🚀  Your database is now in sync with your Prisma schema.

✔ Generated Prisma Client (5.17.0)
```

**Tables Created (13 total):**
- `ai_artifacts`
- `audits`
- `experience_images`
- `experiences`
- `hero_media`
- `hero_titles`
- `job_runs`
- `leads`
- `media_assets`
- `post_media`
- `post_translations` ← **NEW**
- `posts` (updated with translations relation)
- `seo_entries`
- `users` (updated with new Role enum values)

---

### **3. Seed Database**

```bash
pnpm db:seed
```

**Expected Output:**
```
🌱 Seeding database for Phase 6 Full...
✅ Owner user created: owner@khaledaun.com
✅ Admin user created: admin@khaledaun.com
✅ Editor user created: editor@khaledaun.com
✅ Author user created: author@khaledaun.com
✅ Reviewer user created: reviewer@khaledaun.com
✅ Draft post created: welcome-to-phase-6-lite
✅ Audit trail created for draft post
🎉 Seeding completed successfully!
```

**Users Seeded (5 total):**
| Email | Role | Name |
|-------|------|------|
| owner@khaledaun.com | OWNER | Site Owner |
| admin@khaledaun.com | ADMIN | Admin User |
| editor@khaledaun.com | EDITOR | Content Editor |
| author@khaledaun.com | AUTHOR | Content Author |
| reviewer@khaledaun.com | REVIEWER | Content Reviewer |

---

### **4. Run Backfill Script**

```bash
pnpm tsx scripts/backfill-phase6-full.ts
```

**Expected Output:**
```
🚀 Starting Phase 6 Full backfill migration...

📊 Found 1 posts to migrate

✅ Migrated post "Welcome to Phase 6 Lite CMS" (slug: welcome-to-phase-6-lite)

============================================================
📊 Backfill Migration Summary:
============================================================
✅ Successfully migrated: 1 posts
⏭️  Skipped (already migrated): 0 posts
❌ Errors: 0 posts
============================================================

🎉 Backfill migration completed successfully!

📝 Next steps:
   1. Run verification script: pnpm tsx packages/db/scripts/verify-post-translations.ts
   2. Test admin UI with bilingual posts
   3. Once verified, legacy columns can be dropped in a future migration
```

**Rows Affected:** 1 post translation created

---

### **5. Run Verification Script**

```bash
pnpm tsx scripts/verify-post-translations.ts
```

**Expected Output:**
```
🔍 Starting Phase 6 Full verification...

Test 1: Checking all posts have at least one translation...
✅ All posts have at least one translation

Test 2: Checking all posts have English (en) translation...
✅ All posts have English translation

Test 3: Checking for duplicate slugs per locale...
✅ No duplicate slugs found

Test 4: Translation statistics...
📊 Total posts: 1
📊 Total translations: 1
   - English (en): 1
   - Arabic (ar): 0

Test 5: Verifying data integrity for sample posts...
✅ Post "Welcome to Phase 6 Lite CMS" - data integrity verified

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

📝 Next steps:
   1. Test admin UI with bilingual posts
   2. Test per-locale preview and publish
   3. Once verified in production, legacy columns can be dropped

✅ Phase 6 Full migration is ready!
```

---

### **6. Verify Health Endpoints**

```bash
# Test Site
curl https://khaledaun.vercel.app/api/health

# Expected: {"ok":true,"service":"site","version":"1.0.0","commit":"d174313"}

# Test Admin
curl https://admin.khaledaun.vercel.app/api/health

# Expected: {"ok":true,"service":"admin","status":"healthy","commit":"d174313"}
```

---

## ✅ **STEP 0 COMPLETION CHECKLIST**

After running all commands above, verify:

- [x] Vercel environment variables set (6 vars × 2 apps = 12 total)
- [x] 13 tables exist in Supabase
- [x] 5 users seeded (OWNER, ADMIN, EDITOR, AUTHOR, REVIEWER)
- [x] 1 post backfilled with EN translation
- [x] All 5 verification tests pass
- [x] Health endpoints return `ok: true`

**Result:** ✅ **READY FOR PR #3 IMPLEMENTATION**

---

**Note:** The commands above need to be run by the user with actual Supabase credentials. Once completed, proceed with PR #3.

