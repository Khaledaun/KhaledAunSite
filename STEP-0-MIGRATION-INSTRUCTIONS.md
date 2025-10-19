# Step 0: Database Migration & Seed Instructions
**Generated:** October 16, 2024  
**For:** KhaledAunSite Supabase Database

---

## 🎯 **OBJECTIVE**

Push the current Prisma schema to Supabase and seed initial data.

---

## ⚙️ **PREREQUISITES**

1. ✅ Vercel environment variables set (see `VERCEL-ENV-SETUP.md`)
2. ✅ Supabase project created
3. ✅ Connection strings obtained from Supabase dashboard

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Set Local Environment Variables**

Create a `.env` file in the project root (or export these in your terminal):

```bash
# Get these from Supabase → Settings → Database
DATABASE_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require"
```

**On Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
$env:DIRECT_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require"
```

**On Linux/Mac (Bash):**
```bash
export DATABASE_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
export DIRECT_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require"
```

---

### **Step 2: Generate Prisma Client**

```bash
cd packages/db
pnpm db:generate
```

**Expected Output:**
```
✔ Generated Prisma Client (5.17.0) to ./node_modules/@prisma/client
```

---

### **Step 3: Push Schema to Supabase**

```bash
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

**⚠️ If you see warnings about data loss:**
- This is normal for the first push (tables don't exist yet)
- Confirm with `y` when prompted

---

### **Step 4: Verify Tables Created**

Run this SQL query in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Tables:**
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
- `posts`
- `seo_entries`
- `users`

**Total:** 13 tables

---

### **Step 5: Seed Initial Data**

```bash
pnpm db:seed
```

**Expected Output:**
```
🌱 Seeding database for Phase 6 Lite...
✅ Admin user created: admin@khaledaun.com
✅ Draft post created: welcome-to-phase-6-lite
✅ Audit trail created for draft post
🎉 Seeding completed successfully!
```

---

### **Step 6: Verify Seed Data**

Run these queries in Supabase SQL Editor:

**Check users:**
```sql
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at;
```

**Expected Result:**
| email | role | name |
|-------|------|------|
| admin@khaledaun.com | ADMIN | Admin User |

**Check posts:**
```sql
SELECT id, title, slug, status, author_id, created_at 
FROM posts 
ORDER BY created_at;
```

**Expected Result:**
| title | slug | status |
|-------|------|--------|
| Welcome to Phase 6 Lite CMS | welcome-to-phase-6-lite | DRAFT |

**Check audits:**
```sql
SELECT entity, action, actor_id, created_at 
FROM audits 
ORDER BY created_at;
```

**Expected Result:**
| entity | action |
|--------|--------|
| Post | CREATE |

---

### **Step 7: Test Connection from Apps**

**Test Admin Health:**
```bash
curl https://your-admin.vercel.app/api/health
```

**Expected Response:**
```json
{
  "ok": true,
  "service": "admin",
  "status": "healthy",
  "commit": "d174313",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "configured"
    }
  }
}
```

**Test Site Health:**
```bash
curl https://your-site.vercel.app/api/health
```

**Expected Response:**
```json
{
  "ok": true,
  "service": "site",
  "version": "1.0.0",
  "commit": "d174313"
}
```

---

## ✅ **SUCCESS CRITERIA**

- [x] 13 tables created in Supabase
- [x] 1 admin user seeded
- [x] 1 draft post seeded
- [x] 1 audit record created
- [x] Both health endpoints return `ok: true`
- [x] No connection errors in Vercel logs

---

## 🚨 **TROUBLESHOOTING**

### **Error: "DATABASE_URL resolved to an empty string"**
**Fix:** Make sure `DATABASE_URL` is set in your environment. Check with:
```bash
echo $DATABASE_URL   # Linux/Mac
echo $env:DATABASE_URL  # Windows PowerShell
```

### **Error: "Can't reach database server"**
**Fix:** 
1. Check your IP is allowed in Supabase → Settings → Database → Connection Pooling
2. Verify the connection string is correct (copy-paste from Supabase dashboard)
3. Ensure `?sslmode=require` is in the connection string

### **Error: "P1001: Can't connect to database"**
**Fix:** 
- Use `DIRECT_URL` for `db:push` (not the pooled URL)
- Temporarily export: `export DATABASE_URL=$DIRECT_URL`

### **Error: "relation 'users' already exists"**
**Fix:** Tables already exist. If you want to reset:
```sql
-- ⚠️ WARNING: This deletes ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Then re-run `pnpm db:push`

---

## 📊 **STEP 0 COMPLETION LOG**

After completing all steps, you should have:

```
✅ Environment Variables Set
   - DATABASE_URL (pooled, with pgbouncer params)
   - DIRECT_URL (direct, for migrations)
   - PREVIEW_SECRET (32-char random)
   - REVALIDATE_SECRET (32-char random)
   - SITE_URL / NEXT_PUBLIC_SITE_URL

✅ Database Schema Applied
   - 13 tables created
   - Prisma Client generated

✅ Seed Data Created
   - 1 admin user: admin@khaledaun.com
   - 1 draft post: welcome-to-phase-6-lite
   - 1 audit record

✅ Verification Passed
   - Health endpoints return 200
   - Database queries work
   - No connection errors
```

---

**Next Step:** Proceed to PR #1 (Schema Refactor for Phase 6 Full)

