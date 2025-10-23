# 📊 Database Migration Instructions

**File to Run:** `RUN-THIS-IN-SUPABASE.sql`  
**Location:** Project root  
**Estimated Time:** 1-2 minutes

---

## 🎯 **What This Migration Does**

Creates 6 new tables for the AI Content System:

| Table | Purpose | Records |
|-------|---------|---------|
| `topics` | Daily AI-generated topic suggestions | 20-30 active |
| `content_library` | Unified storage for blog & LinkedIn content | Unlimited |
| `media_library` | Media assets with metadata | Unlimited |
| `topic_sources` | External sources to monitor | 5-10 |
| `topic_preferences` | User content strategy settings | 1-5 |
| `topic_generation_jobs` | History of daily topic generation runs | Growing |

---

## 📝 **Step-by-Step Instructions**

### **Method 1: Supabase Dashboard (Recommended)**

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Select Your Project**
   - Click on your project

3. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

4. **Copy Migration Script**
   - Open `RUN-THIS-IN-SUPABASE.sql` from project root
   - Copy ALL contents (Ctrl+A, Ctrl+C)

5. **Paste & Run**
   - Paste into SQL Editor (Ctrl+V)
   - Click "Run" button or press `Ctrl+Enter`

6. **Verify Success**
   - You should see: ✅ "AI Content System tables created successfully!"
   - If you see errors, read them carefully and fix

7. **Check Tables**
   - Go to "Table Editor" in left sidebar
   - Confirm these tables exist:
     - `topics`
     - `content_library`
     - `media_library`
     - `topic_sources`
     - `topic_preferences`
     - `topic_generation_jobs`

---

### **Method 2: Local Prisma (Alternative)**

If you prefer to use Prisma:

1. **Update Prisma Schema** (not included in Sprint 1 - coming later)
2. **Run Migration:**
   ```bash
   cd packages/db
   npx prisma db push
   ```

---

## ✅ **Verification Checklist**

After running the migration:

- [ ] All 6 tables exist in Supabase
- [ ] Triggers are created (check "Database" → "Triggers")
- [ ] Indexes are created (check table details)
- [ ] Default topic preference is inserted
- [ ] No error messages in SQL Editor

---

## 🔍 **What Gets Created**

### **Tables:**
```sql
topics                      -- 15 columns
content_library            -- 25 columns
media_library             -- 16 columns
topic_sources             -- 12 columns
topic_preferences         -- 13 columns
topic_generation_jobs     -- 8 columns
```

### **Triggers:**
```sql
update_topics_updated_at
update_content_library_updated_at
update_media_library_updated_at
update_topic_sources_updated_at
update_topic_preferences_updated_at
```

### **Indexes:**
```sql
idx_topics_status
idx_topics_created_at
idx_topics_locked
idx_topics_priority
idx_content_library_status
idx_content_library_type
idx_content_library_published_at
idx_content_library_topic_id
idx_media_library_type
idx_media_library_folder
idx_media_library_created_at
idx_media_library_tags (GIN)
idx_topic_sources_enabled
idx_topic_sources_last_crawled
idx_topic_preferences_enabled
idx_topic_generation_jobs_started_at
```

### **Initial Data:**
```sql
1 record in topic_preferences:
  - Name: "Legal & Business Strategy Topics"
  - Prompt: AI generation prompt
  - Keywords: international law, business strategy, etc.
  - Daily count: 5
```

---

## 🐛 **Troubleshooting**

### **Error: "relation already exists"**
**Meaning:** Table already exists  
**Solution:** 
- Either drop the existing tables first (⚠️ THIS DELETES DATA):
  ```sql
  DROP TABLE IF EXISTS topic_generation_jobs CASCADE;
  DROP TABLE IF EXISTS topic_preferences CASCADE;
  DROP TABLE IF EXISTS topic_sources CASCADE;
  DROP TABLE IF EXISTS media_library CASCADE;
  DROP TABLE IF EXISTS content_library CASCADE;
  DROP TABLE IF EXISTS topics CASCADE;
  DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
  ```
- Or skip this migration if tables are already correct

### **Error: "column does not exist"**
**Meaning:** Your database schema is out of sync  
**Solution:** 
- Check if you're running the latest version
- Drop and recreate tables (see above)

### **Error: "syntax error"**
**Meaning:** SQL syntax issue  
**Solution:**
- Copy the ENTIRE file, don't copy/paste parts
- Make sure you're using PostgreSQL (Supabase uses PostgreSQL)

### **Error: "permission denied"**
**Meaning:** Insufficient privileges  
**Solution:**
- Make sure you're the project owner
- Check you're connected to the correct database

---

## 🔐 **Row Level Security (RLS)**

The migration creates tables without RLS enabled by default. You should add RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust as needed)
CREATE POLICY "Allow authenticated users full access to topics"
ON topics FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to content_library"
ON content_library FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to media_library"
ON media_library FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to topic_sources"
ON topic_sources FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to topic_preferences"
ON topic_preferences FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to topic_generation_jobs"
ON topic_generation_jobs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

---

## 📊 **Table Relationships**

```
topics
  ↓ (1:many)
content_library → posts (blog_post_id)
  ↓ (many:many via media_ids array)
media_library

topic_sources → topics (via crawling)
topic_preferences → topics (via AI generation)
topic_generation_jobs → topics (via daily runs)
```

---

## 🎉 **After Successful Migration**

1. Go to `/admin/topics` - should load without errors
2. Go to `/admin/content/library` - should load without errors
3. Go to `/admin/media` - should load without errors
4. Try creating a test topic
5. Try uploading a test image

**Everything working? Sprint 1 is complete! 🚀**


