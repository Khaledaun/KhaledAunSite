# Database Migration Guide - Phase 6.5 & 7

## Overview

The production database needs to be updated with the Phase 6.5 & 7 schema changes:
- **Phase 6.5**: `MediaAsset` table, `featuredImageId` in `Post` table
- **Phase 7**: `AIGeneration` table, `URLExtraction` table, related enums

---

## Prerequisites

1. **Database URL**: You need the production `DATABASE_URL` from Supabase
2. **Prisma CLI**: Installed globally or via npx

---

## Option 1: Push Schema Changes (Recommended for First-Time)

This pushes the schema directly to the database without creating migration files.

### Step 1: Set Environment Variable

**Windows (PowerShell)**:
```powershell
$env:DATABASE_URL="postgresql://user:password@host:5432/database"
```

**macOS/Linux**:
```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Step 2: Push Schema to Production

From repository root:

```bash
cd packages/db
npx prisma db push
```

**What this does**:
- Reads `prisma/schema.prisma`
- Compares with production database
- Creates/modifies tables to match schema
- Does NOT create migration files (safe for one-time schema sync)

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "...", schema "public" at "..."

🚀  Your database is now in sync with your Prisma schema. Done in Xms

✔ Generated Prisma Client (v5.22.0) to ./../../node_modules/@prisma/client in Yms
```

### Step 3: Verify Schema

Check that new tables exist:

```bash
npx prisma studio
```

Or via SQL in Supabase dashboard:

```sql
-- Check MediaAsset table exists
SELECT * FROM "MediaAsset" LIMIT 1;

-- Check AIGeneration table exists
SELECT * FROM "AIGeneration" LIMIT 1;

-- Check URLExtraction table exists
SELECT * FROM "URLExtraction" LIMIT 1;

-- Check Post has featuredImageId
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Post' AND column_name = 'featuredImageId';
```

---

## Option 2: Create and Run Migration (Production-Grade)

This creates a migration file for versioning and rollback capability.

### Step 1: Create Migration

```bash
cd packages/db
npx prisma migrate dev --name phase-6-5-7-media-and-ai
```

This creates:
- `prisma/migrations/YYYYMMDDHHMMSS_phase-6-5-7-media-and-ai/migration.sql`
- Updates `_prisma_migrations` table

### Step 2: Deploy to Production

```bash
# Set production DATABASE_URL
$env:DATABASE_URL="postgresql://..."

# Deploy migration
npx prisma migrate deploy
```

**What this does**:
- Runs all pending migrations
- Updates `_prisma_migrations` table
- Safe for production (only runs migrations not yet applied)

---

## Troubleshooting

### Error: "Column already exists"

If you see errors like:
```
column "featuredImageId" of relation "Post" already exists
```

**Solution**: The schema is already partially applied. Use `db push` with `--accept-data-loss` flag (only if safe):

```bash
npx prisma db push --accept-data-loss
```

Or manually resolve conflicts in Supabase SQL editor.

### Error: "Environment variable not found: DATABASE_URL"

**Solution**: Make sure `DATABASE_URL` is set in your shell:

```powershell
# Check if set
echo $env:DATABASE_URL

# Set it
$env:DATABASE_URL="your-database-url"
```

### Error: "Cannot connect to database"

**Causes**:
1. Wrong `DATABASE_URL`
2. Database not accessible from your IP
3. SSL required but not configured

**Solution**: Check Supabase dashboard → Project Settings → Database → Connection string.

---

## What Gets Created

### New Tables

**MediaAsset**:
- `id`, `type`, `url`, `filename`, `originalName`, `size`, `mimeType`
- `thumbnailUrl`, `width`, `height`, `duration`
- `folder`, `tags`, `description`, `altText`
- `uploadedById`, `status`, `uploadedAt`, `updatedAt`

**AIGeneration**:
- `id`, `type`, `model`, `prompt`, `input`, `output`
- `tokensUsed`, `costEstimate`, `duration`
- `userId`, `postId`, `status`, `error`, `completedAt`, `createdAt`

**URLExtraction**:
- `id`, `url`, `title`, `author`, `publishedDate`
- `content`, `excerpt`, `imageUrl`, `siteName`, `language`, `wordCount`
- `userId`, `status`, `error`, `extractedAt`

### Modified Tables

**Post**:
- Added: `featuredImageId` (String?, optional)
- Added: `featuredImage` relation to `MediaAsset`
- Added: `aiGenerations` relation to `AIGeneration[]`

**User**:
- Added: `uploadedMedia` relation to `MediaAsset[]`
- Added: `aiGenerations` relation to `AIGeneration[]`
- Added: `urlExtractions` relation to `URLExtraction[]`

### New Enums

**AIModel**: `GPT_4`, `GPT_4_TURBO`, `GPT_3_5_TURBO`, `CLAUDE_3_OPUS`, `CLAUDE_3_SONNET`, `CLAUDE_3_HAIKU`

**AIGenerationType**: `CONTENT`, `OUTLINE`, `SEO`, `TRANSLATION`, `IMPROVEMENT`, `IDEAS`

---

## Post-Migration Verification

### 1. Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('MediaAsset', 'AIGeneration', 'URLExtraction');
```

Expected: 3 rows

### 2. Check Post.featuredImageId

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Post' AND column_name = 'featuredImageId';
```

Expected: 1 row

### 3. Check Relations Work

```sql
-- Test MediaAsset query with uploader relation
SELECT ma.id, ma.filename, u.email as uploader_email
FROM "MediaAsset" ma
LEFT JOIN "User" u ON ma."uploadedById" = u.id
LIMIT 5;
```

Should run without errors (may return 0 rows if no media uploaded yet).

---

## Next Steps After Migration

1. ✅ Verify all tables created
2. ✅ Restart Vercel deployments (to pick up new schema)
3. ✅ Test media upload in admin dashboard
4. ✅ Test AI features in admin dashboard
5. ✅ Set up Supabase Storage (see `packages/db/sql/phase6.5-storage-setup.sql`)

---

## Rollback (If Needed)

If you used `prisma migrate`:

```bash
# List migrations
npx prisma migrate status

# Rollback last migration (manual)
# Run the down migration SQL manually in Supabase SQL editor
```

If you used `prisma db push`:

```bash
# Manual rollback - drop tables and columns
DROP TABLE IF EXISTS "AIGeneration";
DROP TABLE IF EXISTS "URLExtraction";
DROP TABLE IF EXISTS "MediaAsset";
ALTER TABLE "Post" DROP COLUMN IF EXISTS "featuredImageId";
```

---

## Questions?

- Check Prisma docs: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Check schema file: `packages/db/prisma/schema.prisma`
- Check migration guide: `packages/db/MIGRATION_GUIDE.md`

