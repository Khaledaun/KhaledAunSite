# Phase 6 Full Migration Guide
**From:** Phase 6 Lite (Single-language CMS)  
**To:** Phase 6 Full (Bilingual CMS with RBAC)  
**Database:** Supabase Postgres

---

## 📊 **SCHEMA CHANGES OVERVIEW**

### **New Enums:**
```prisma
enum Locale {
  en
  ar
}

enum Role {
  USER
  AUTHOR    // New
  REVIEWER  // New
  EDITOR    // New
  OWNER     // New
  ADMIN
}
```

### **New Model:**
```prisma
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
  
  @@unique([postId, locale])    // One translation per locale per post
  @@unique([locale, slug])       // Unique slugs per locale
  @@map("post_translations")
}
```

### **Updated Model:**
```prisma
model Post {
  id          String      @id @default(cuid())
  // Legacy fields (kept for backward compat during migration):
  title       String      // TODO: Remove after backfill
  slug        String      @unique // TODO: Remove after backfill
  excerpt     String?     // TODO: Remove after backfill
  content     String      // TODO: Remove after backfill
  
  status      PostStatus  @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  authorId    String
  
  author       User               @relation("UserPosts", fields: [authorId], references: [id])
  translations PostTranslation[]  // NEW: i18n support
  PostMedia    PostMedia[]        // Preserved
  
  @@map("posts")
}
```

---

## 🔧 **STEP-BY-STEP MIGRATION**

### **Step 1: Backup Database**

**⚠️ CRITICAL: Always backup before schema changes!**

```bash
# Option 1: Supabase dashboard
# Go to Settings → Backups → Create backup

# Option 2: pg_dump
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

### **Step 2: Set Environment Variables**

```bash
# Get these from Supabase → Settings → Database

export DATABASE_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

export DIRECT_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require"
```

**Verify:**
```bash
echo $DATABASE_URL
echo $DIRECT_URL
```

---

### **Step 3: Generate Prisma Client**

```bash
cd packages/db
pnpm db:generate
```

**Expected:**
```
✔ Generated Prisma Client (5.17.0) to ./node_modules/@prisma/client
```

---

### **Step 4: Push Schema Changes**

```bash
pnpm db:push
```

**What Happens:**
1. Creates `Locale` enum (values: 'en', 'ar')
2. Updates `Role` enum (adds: AUTHOR, REVIEWER, EDITOR, OWNER)
3. Creates `post_translations` table
4. Adds `translations` relation to Post model

**Expected Output:**
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"

The following migration(s) have been created and applied:

migrations/
  └─ 20241016_phase6_full_schema/
      └─ migration.sql

✔ Generated Prisma Client (5.17.0)
```

**Verification:**
```sql
-- Run in Supabase SQL Editor
\dt public.*

-- Should show:
-- post_translations (NEW)
-- posts (updated)
-- users (updated with new roles)
-- [... other tables]
```

---

### **Step 5: Verify Schema**

```bash
pnpm exec prisma validate
```

**Expected:**
```
✔ The schema is valid
```

---

### **Step 6: Run Backfill Script**

This migrates existing posts to the new translation model:

```bash
pnpm tsx scripts/backfill-phase6-full.ts
```

**What It Does:**
1. Fetches all posts from `posts` table
2. For each post:
   - Creates English (en) translation in `post_translations`
   - Copies: title, slug, excerpt, content
   - Preserves: createdAt, updatedAt timestamps
3. Skips posts that already have translations (idempotent)

**Example Output:**
```
🚀 Starting Phase 6 Full backfill migration...

📊 Found 5 posts to migrate

✅ Migrated post "Getting Started" (slug: getting-started)
✅ Migrated post "About Us" (slug: about-us)
✅ Migrated post "Contact" (slug: contact)
✅ Migrated post "Services" (slug: services)
✅ Migrated post "Blog Post 1" (slug: blog-post-1)

============================================================
📊 Backfill Migration Summary:
============================================================
✅ Successfully migrated: 5 posts
⏭️  Skipped (already migrated): 0 posts
❌ Errors: 0 posts
============================================================

🎉 Backfill migration completed successfully!
```

**If Re-run:**
```
📊 Found 5 posts to migrate
⏭️  Skipping post "Getting Started" - EN translation already exists
⏭️  Skipping post "About Us" - EN translation already exists
...
✅ Successfully migrated: 0 posts
⏭️  Skipped (already migrated): 5 posts
```

---

### **Step 7: Verify Migration**

```bash
pnpm tsx scripts/verify-post-translations.ts
```

**What It Checks:**
1. All posts have at least one translation
2. All posts have English translation
3. No duplicate slugs per locale
4. Translation count statistics
5. Data integrity (legacy fields match translations)

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
📊 Total posts: 5
📊 Total translations: 5
   - English (en): 5
   - Arabic (ar): 0

Test 5: Verifying data integrity for sample posts...
✅ Post "Getting Started" - data integrity verified
✅ Post "About Us" - data integrity verified
✅ Post "Contact" - data integrity verified

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

**If Any Test Fails:**
```
❌ Test 2: 2 posts missing English translation

# Shows which posts:
   - "Untranslated Post 1" (id: abc123)
   - "Untranslated Post 2" (id: def456)

# Fix: Re-run backfill or manually create translations
```

---

### **Step 8: Seed New Roles (Optional)**

```bash
pnpm db:seed
```

**What It Does:**
- Creates users for new roles: OWNER, EDITOR, AUTHOR, REVIEWER
- Preserves existing ADMIN user
- Creates sample posts for testing

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

---

## 📊 **DATA MAPPING**

### **Before (Phase 6 Lite):**
```
Post:
  id: "abc123"
  title: "Getting Started"
  slug: "getting-started"
  excerpt: "Learn the basics"
  content: "Full content here..."
  status: "DRAFT"
  authorId: "user1"
```

### **After (Phase 6 Full):**
```
Post:
  id: "abc123"
  title: "Getting Started"      // Legacy (kept for compat)
  slug: "getting-started"        // Legacy (kept for compat)
  excerpt: "Learn the basics"    // Legacy (kept for compat)
  content: "Full content here..."// Legacy (kept for compat)
  status: "DRAFT"
  authorId: "user1"
  
  translations: [
    {
      id: "trans1"
      postId: "abc123"
      locale: "en"
      title: "Getting Started"
      slug: "getting-started"
      excerpt: "Learn the basics"
      content: "Full content here..."
    }
  ]
```

---

## 🔍 **VERIFICATION QUERIES**

### **Check All Posts Have Translations:**
```sql
SELECT p.id, p.title, COUNT(pt.id) as translation_count
FROM posts p
LEFT JOIN post_translations pt ON pt.post_id = p.id
GROUP BY p.id, p.title;

-- All posts should have count >= 1
```

### **Find Posts Missing EN Translation:**
```sql
SELECT p.id, p.title
FROM posts p
LEFT JOIN post_translations pt ON pt.post_id = p.id AND pt.locale = 'en'
WHERE pt.id IS NULL;

-- Should return 0 rows
```

### **Check Slug Uniqueness:**
```sql
SELECT locale, slug, COUNT(*) as duplicate_count
FROM post_translations
GROUP BY locale, slug
HAVING COUNT(*) > 1;

-- Should return 0 rows
```

### **Translation Statistics:**
```sql
SELECT 
  locale,
  COUNT(*) as translation_count,
  COUNT(DISTINCT post_id) as unique_posts
FROM post_translations
GROUP BY locale;

-- Example output:
-- locale | translation_count | unique_posts
-- -------+-------------------+-------------
-- en     |                 5 |            5
-- ar     |                 0 |            0
```

---

## 🔄 **ROLLBACK PROCEDURE**

### **Option 1: Rollback Schema Only**

**⚠️ This will DELETE all translations!**

```sql
-- 1. Drop post_translations table
DROP TABLE IF EXISTS post_translations CASCADE;

-- 2. Remove Locale enum
DROP TYPE IF EXISTS "Locale";

-- 3. Revert Role enum
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
ALTER TABLE users ALTER COLUMN role TYPE "Role" USING role::text::"Role";
DROP TYPE "Role_old";

-- 4. Verify
\dt public.*
```

### **Option 2: Full Rollback (Code + Schema)**

```bash
# 1. Restore from backup
psql "$DATABASE_URL" < backup_YYYYMMDD_HHMMSS.sql

# 2. Revert code
git revert <commit-hash>
git push

# 3. Re-run Phase 6 Lite migrations
cd packages/db
pnpm db:push
```

---

## 🎯 **GOTCHAS & TIPS**

### **Gotcha 1: PostMedia Relation Preserved**
✅ **No changes needed** for PostMedia  
- Post ↔ PostMedia relation unchanged
- Media attachments work as before

### **Gotcha 2: Compound Unique Constraints**
```prisma
@@unique([postId, locale])  // One translation per locale per post
@@unique([locale, slug])     // Slugs unique within locale
```

**Implication:**
- EN and AR can have the same slug (different namespace)
- Same post can't have two EN translations

**Example:**
```
✅ Valid:
  Post 1 → EN slug: "hello"
  Post 1 → AR slug: "hello" (different locale)
  
✅ Valid:
  Post 1 → EN slug: "hello"
  Post 2 → EN slug: "world"
  
❌ Invalid:
  Post 1 → EN slug: "hello"
  Post 2 → EN slug: "hello" (duplicate in same locale)
```

### **Gotcha 3: Legacy Fields Not Dropped**
**Why:** Backward compatibility during migration

**When to Drop:**
- After verifying all admin UI updated
- After testing in production for 1-2 weeks
- In a separate, careful migration

**How to Drop (Future):**
```sql
ALTER TABLE posts DROP COLUMN title;
ALTER TABLE posts DROP COLUMN slug;
ALTER TABLE posts DROP COLUMN excerpt;
ALTER TABLE posts DROP COLUMN content;
```

### **Gotcha 4: Seed is Idempotent**
```typescript
// Seed uses upsert
await prisma.user.upsert({
  where: { email: 'admin@khaledaun.com' },
  update: {},  // Don't change if exists
  create: { /* ... */ }
});
```

**Can run multiple times safely**

---

## 📝 **CHECKLIST**

Before migration:
- [ ] Database backed up
- [ ] Environment variables set
- [ ] Team notified of maintenance window
- [ ] Rollback plan reviewed

During migration:
- [ ] Schema pushed successfully
- [ ] Backfill completed (N posts migrated)
- [ ] Verification passed (5/5 tests)
- [ ] New users seeded (if needed)

After migration:
- [ ] Admin UI tested (create/edit/publish)
- [ ] Site tested (EN/AR posts render)
- [ ] RBAC tested (roles enforce correctly)
- [ ] No errors in logs

---

## 📞 **TROUBLESHOOTING**

### **Error: "Unique constraint violation"**
**Cause:** Duplicate slugs in same locale  
**Fix:**
```sql
-- Find duplicates
SELECT locale, slug, COUNT(*)
FROM post_translations
GROUP BY locale, slug
HAVING COUNT(*) > 1;

-- Rename duplicate slugs
UPDATE post_translations
SET slug = slug || '-2'
WHERE id = '<duplicate-id>';
```

### **Error: "Foreign key constraint violation"**
**Cause:** Post referenced in translation doesn't exist  
**Fix:**
```sql
-- Find orphaned translations
SELECT pt.*
FROM post_translations pt
LEFT JOIN posts p ON p.id = pt.post_id
WHERE p.id IS NULL;

-- Delete orphaned translations
DELETE FROM post_translations
WHERE post_id NOT IN (SELECT id FROM posts);
```

### **Error: "Backfill script fails mid-way"**
**Cause:** Database connection timeout or data issue  
**Fix:**
- Script is idempotent, just re-run it
- Check specific error message for post ID
- Manually inspect that post's data

---

**Migration Guide Version:** 1.0  
**Last Updated:** October 16, 2024  
**Tested On:** Supabase Postgres 15.x, Prisma 5.17.0

