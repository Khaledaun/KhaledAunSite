# Production Database Migration Guide

## 🎯 **Goal**
Push the latest schema changes to your production Supabase database.

---

## ⚠️ **Prerequisites**

1. ✅ Supabase project created
2. ✅ `DATABASE_URL` environment variable configured
3. ✅ Prisma CLI installed (`npm install`)

---

## 📋 **Migration Steps**

### **Option 1: Using Vercel Environment Variables** (Recommended)

```powershell
# 1. Get your production DATABASE_URL from Vercel
# Vercel Dashboard → Admin Project → Settings → Environment Variables
# Copy the DATABASE_URL value

# 2. Set it temporarily in your terminal
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.PROJECT.supabase.co:5432/postgres"

# 3. Run migration from packages/db
cd packages/db
npx prisma db push --schema ./prisma/schema.prisma

# 4. Verify tables were created
npx prisma studio --schema ./prisma/schema.prisma
```

---

### **Option 2: Using Local .env File**

```powershell
# 1. Create .env file in packages/db/
cd packages/db
New-Item -Path .env -ItemType File -Force

# 2. Add your production DATABASE_URL
# Edit .env and add:
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.PROJECT.supabase.co:5432/postgres"

# 3. Run migration
npx prisma db push --schema ./prisma/schema.prisma

# 4. IMPORTANT: Delete .env file after migration
Remove-Item .env
```

---

### **Option 3: Directly in Supabase** (Backup method)

If Prisma migration fails, you can run SQL directly:

```sql
-- In Supabase Dashboard → SQL Editor

-- 1. Create Lead table
CREATE TABLE IF NOT EXISTS "leads" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "organization" TEXT,
  "country" TEXT,
  "interest" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "nextActionAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "leads_status_createdAt_idx" ON "leads"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "leads_email_idx" ON "leads"("email");

-- 2. Create CaseStudy table
CREATE TABLE IF NOT EXISTS "case_studies" (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "confidential" BOOLEAN NOT NULL DEFAULT FALSE,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "problem" TEXT NOT NULL,
  "strategy" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "practiceArea" TEXT,
  "year" INTEGER,
  "jurisdiction" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT FALSE,
  "publishedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "authorId" TEXT NOT NULL,
  "featuredImageId" TEXT,
  FOREIGN KEY ("authorId") REFERENCES "User"("id"),
  FOREIGN KEY ("featuredImageId") REFERENCES "media_assets"("id")
);

CREATE INDEX IF NOT EXISTS "case_studies_type_published_idx" ON "case_studies"("type", "published");
CREATE INDEX IF NOT EXISTS "case_studies_slug_idx" ON "case_studies"("slug");

-- 3. Create AIConfig table
CREATE TABLE IF NOT EXISTS "ai_configs" (
  "id" TEXT PRIMARY KEY,
  "provider" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "apiKey" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "useCases" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "systemPrompt" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ai_configs_provider_active_idx" ON "ai_configs"("provider", "active");

-- 4. Create AIPromptTemplate table
CREATE TABLE IF NOT EXISTS "ai_prompt_templates" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "useCase" TEXT NOT NULL,
  "tone" TEXT,
  "language" TEXT,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ai_prompt_templates_category_idx" ON "ai_prompt_templates"("category");

-- 5. Create Subscriber table
CREATE TABLE IF NOT EXISTS "subscribers" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'newsletter_signup',
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "subscribers_email_idx" ON "subscribers"("email");
```

---

## ✅ **Verification**

After migration, verify tables exist:

```powershell
# Open Prisma Studio
cd packages/db
npx prisma studio --schema ./prisma/schema.prisma

# Or check in Supabase Dashboard → Table Editor
# You should see:
# ✓ leads
# ✓ case_studies
# ✓ ai_configs
# ✓ ai_prompt_templates
# ✓ subscribers
# ✓ User (should already exist)
# ✓ Post (should already exist)
# ✓ media_assets (should already exist)
```

---

## 🔧 **Troubleshooting**

### **Error: "Can't reach database server"**

**Cause:** Incorrect DATABASE_URL or firewall  
**Fix:**
1. Verify DATABASE_URL format
2. Check Supabase project is active
3. Ensure no VPN/firewall blocking connection

---

### **Error: "Table already exists"**

**Cause:** Migration already run  
**Fix:** This is fine! Schema is up-to-date.

---

### **Error: "Authentication failed"**

**Cause:** Wrong password in DATABASE_URL  
**Fix:**
1. Go to Supabase → Settings → Database
2. Reset database password
3. Update DATABASE_URL with new password

---

## 📝 **Next Steps**

After successful migration:

1. ✅ Create admin user (see DEPLOYMENT-FIXES-COMPLETE.md Step 4)
2. ✅ Deploy applications to Vercel
3. ✅ Test contact form
4. ✅ Test admin dashboard

---

**Estimated Time:** 2-3 minutes  
**Status:** Ready to run

