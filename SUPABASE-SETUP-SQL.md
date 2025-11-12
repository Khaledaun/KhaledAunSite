# 🗄️ SUPABASE COMPLETE SETUP SQL

**Purpose:** Complete database and storage setup for 100% system readiness
**Run in:** Supabase Dashboard → SQL Editor
**Time:** ~30 seconds to execute

---

## 📋 WHAT THIS SCRIPT DOES

1. ✅ Creates `AlgorithmUpdate` table for tracking SEO/AIO/LinkedIn updates
2. ✅ Creates required enums (`AlgorithmSource`, `UpdateImpact`)
3. ✅ Creates `media` storage bucket for file uploads
4. ✅ Sets up RLS policies for storage access
5. ✅ Adds indexes for performance

---

## 🚀 COMPLETE SQL SCRIPT

**Copy everything below and paste into Supabase SQL Editor, then click "Run":**

```sql
-- ============================================
-- PART 1: ALGORITHM UPDATE SYSTEM
-- ============================================

-- Create enums for algorithm updates
DO $$ BEGIN
    CREATE TYPE "AlgorithmSource" AS ENUM ('SEO', 'AIO', 'LINKEDIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UpdateImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create algorithm_updates table
CREATE TABLE IF NOT EXISTS "algorithm_updates" (
    "id" TEXT NOT NULL,
    "source" "AlgorithmSource" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT[],
    "impact" "UpdateImpact" NOT NULL,
    "platform" TEXT,
    "analyzed" BOOLEAN NOT NULL DEFAULT false,
    "insights" JSONB,
    "promptUpdates" TEXT,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "appliedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "algorithm_updates_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "algorithm_updates_source_publishedAt_idx"
ON "algorithm_updates"("source", "publishedAt");

CREATE INDEX IF NOT EXISTS "algorithm_updates_applied_analyzed_idx"
ON "algorithm_updates"("applied", "analyzed");

CREATE UNIQUE INDEX IF NOT EXISTS "algorithm_updates_url_key"
ON "algorithm_updates"("url");

-- Add update trigger for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_algorithm_updates_updated_at ON "algorithm_updates";
CREATE TRIGGER update_algorithm_updates_updated_at
    BEFORE UPDATE ON "algorithm_updates"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 2: SUPABASE STORAGE BUCKET
-- ============================================

-- Create media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true, -- Public bucket for easy access
  52428800, -- 50MB limit (50 * 1024 * 1024)
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 3: STORAGE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media, admins can delete any" ON storage.objects;

-- Policy: Authenticated users can upload media to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Public can view all media
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Users can update their own media
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete own media, Admins can delete any
CREATE POLICY "Users can delete own media, admins can delete any"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (
    -- User can delete own files
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Admin/Owner can delete any files
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role IN ('ADMIN', 'OWNER')
    )
  )
);

-- ============================================
-- PART 4: VERIFICATION QUERIES
-- ============================================

-- Check algorithm_updates table exists
SELECT
    'algorithm_updates table' as check_item,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'algorithm_updates'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check enums exist
SELECT
    'AlgorithmSource enum' as check_item,
    CASE WHEN EXISTS (
        SELECT FROM pg_type
        WHERE typname = 'AlgorithmSource'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
    'UpdateImpact enum' as check_item,
    CASE WHEN EXISTS (
        SELECT FROM pg_type
        WHERE typname = 'UpdateImpact'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check storage bucket exists
SELECT
    'media bucket' as check_item,
    CASE WHEN EXISTS (
        SELECT FROM storage.buckets WHERE id = 'media'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check storage policies
SELECT
    COUNT(*) as policy_count,
    'Storage policies' as check_item,
    CASE WHEN COUNT(*) >= 4
        THEN '✅ ALL POLICIES CREATED'
        ELSE '⚠️ SOME POLICIES MISSING'
    END as status
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';

-- Show bucket details
SELECT
    id,
    name,
    public as is_public,
    file_size_limit / 1024 / 1024 as max_size_mb,
    array_length(allowed_mime_types, 1) as allowed_types_count
FROM storage.buckets
WHERE id = 'media';
```

---

## ✅ EXPECTED OUTPUT

After running the script, you should see verification output like:

```
check_item                  | status
---------------------------+------------
algorithm_updates table     | ✅ EXISTS
AlgorithmSource enum        | ✅ EXISTS
UpdateImpact enum           | ✅ EXISTS
media bucket                | ✅ EXISTS

policy_count | check_item       | status
------------+------------------+-------------------------
4            | Storage policies | ✅ ALL POLICIES CREATED

Bucket Details:
id    | name  | is_public | max_size_mb | allowed_types_count
------+-------+-----------+-------------+--------------------
media | media | true      | 50          | 8
```

---

## 🔍 MANUAL VERIFICATION

### **Check Table:**
1. Go to Supabase Dashboard → Table Editor
2. You should see `algorithm_updates` table in the list
3. Click on it - should show 0 rows (empty initially)

### **Check Storage:**
1. Go to Supabase Dashboard → Storage
2. You should see `media` bucket
3. Click on it - should be empty initially
4. Badge should show "Public"

### **Check Policies:**
1. Go to Supabase Dashboard → Authentication → Policies
2. Select `storage.objects` table
3. Should see 4 policies:
   - Users can upload to own folder
   - Public can view media
   - Users can update own media
   - Users can delete own media, admins can delete any

---

## 🚨 TROUBLESHOOTING

### **Error: "relation already exists"**
✅ **This is OK!** It means the table/enum already exists. The script uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING` to handle this gracefully.

### **Error: "permission denied for schema storage"**
⚠️ **Solution:** Make sure you're running this as a Supabase admin (which you are by default in SQL Editor)

### **Error: "duplicate key value violates unique constraint"**
✅ **This is OK!** It means the bucket already exists. The script handles this with `ON CONFLICT DO NOTHING`.

### **No verification output shown**
Try running just the verification section (Part 4) separately.

---

## 🎯 NEXT STEPS AFTER RUNNING THIS

1. ✅ Verify all checks show "✅ EXISTS"
2. ✅ Check Table Editor for `algorithm_updates` table
3. ✅ Check Storage for `media` bucket
4. ✅ Proceed to run Prisma migration (or skip if this SQL already created the table)
5. ✅ Redeploy your applications on Vercel

---

## 📝 ALTERNATIVE: USE PRISMA INSTEAD

If you prefer to use Prisma for the database schema (recommended):

```bash
# Set environment variables
export DATABASE_URL="postgresql://postgres.fnmvswjxemsoudgxnvfu:Pn3RdJHpkMn7rn3S@aws-1-eu-central-2.pooler.supabase.com:6543/postgres"
export DIRECT_URL="postgresql://postgres:Pn3RdJHpkMn7rn3S@db.fnmvswjxemsoudgxnvfu.supabase.co:5432/postgres?sslmode=require"

# Navigate to packages/db
cd packages/db

# Push schema (creates AlgorithmUpdate table)
npx prisma db push

# Then run ONLY Parts 2 & 3 of the SQL above (Storage setup)
```

**Benefits of Prisma approach:**
- Schema stays in sync with your code
- Automatic type generation
- Easier to modify later

**Benefits of SQL approach:**
- One-step setup
- No local environment needed
- Works even if Prisma connection fails

**Recommendation:** Use Prisma (`npx prisma db push`) + SQL for storage (Parts 2 & 3 only)

---

## 🔒 SECURITY NOTES

- ✅ Storage policies enforce user-specific folders
- ✅ Only authenticated users can upload
- ✅ Public read access for published media
- ✅ Admins can delete any media, users only their own
- ✅ File size limited to 50MB
- ✅ MIME types restricted to safe formats

---

**Ready to run?** Copy the complete SQL script, paste into Supabase SQL Editor, and click "Run"! ⚡
