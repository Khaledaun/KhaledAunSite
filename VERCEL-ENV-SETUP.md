# Vercel Environment Variables Setup Guide
**Generated:** October 16, 2024  
**For:** KhaledAunSite (apps/site + apps/admin)

---

## 🎯 CRITICAL: Set These Variables in Vercel NOW

### **Where to Set:**
1. Go to https://vercel.com/dashboard
2. Select your project: **KhaledAunSite**
3. Go to **Settings → Environment Variables**
4. Add variables for **ALL ENVIRONMENTS** (Production, Preview, Development)

---

## 📋 **REQUIRED VARIABLES FOR `apps/site`**

### **Database**
```bash
# Get from Supabase → Settings → Database → Connection String
DATABASE_URL=postgresql://postgres.[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require

# Direct connection (for migrations only, not used in site runtime)
DIRECT_URL=postgresql://postgres.[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

### **Preview & Revalidation Secrets**
```bash
# Generate random 32-character strings (one command: openssl rand -base64 32)
PREVIEW_SECRET=<generate-random-32-char-string>
REVALIDATE_SECRET=<generate-random-32-char-string>
```

### **Site URLs**
```bash
# Your production site URL (update if different)
NEXT_PUBLIC_SITE_URL=https://khaledaun.vercel.app
SITE_URL=https://khaledaun.vercel.app
```

### **Supabase (if using Supabase Auth/Storage)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-supabase>
```

---

## 📋 **REQUIRED VARIABLES FOR `apps/admin`**

### **Database** (Same as site)
```bash
DATABASE_URL=postgresql://postgres.[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require

DIRECT_URL=postgresql://postgres.[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

### **Secrets** (Same as site - MUST match!)
```bash
PREVIEW_SECRET=<same-as-site>
REVALIDATE_SECRET=<same-as-site>
```

### **Site URLs**
```bash
NEXT_PUBLIC_SITE_URL=https://khaledaun.vercel.app
SITE_URL=https://khaledaun.vercel.app
```

### **Supabase** (Same as site)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-supabase>
```

---

## 🔐 **HOW TO GET SUPABASE CREDENTIALS**

### **Database Connection Strings:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings → Database**
4. Copy **Connection String (Pooled)** → use for `DATABASE_URL`
5. Copy **Connection String (Direct)** → use for `DIRECT_URL`
6. **IMPORTANT:** Add these query parameters:
   - Pooled: `?pgbouncer=true&connection_limit=1&sslmode=require`
   - Direct: `?sslmode=require`

### **Supabase Keys:**
1. Go to **Settings → API**
2. Copy **Project URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role** key → use for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ KEEP SECRET!)

### **Secrets Generation:**
```bash
# Run these commands to generate secure random strings:
openssl rand -base64 32  # for PREVIEW_SECRET
openssl rand -base64 32  # for REVALIDATE_SECRET
```

---

## ✅ **VERIFICATION CHECKLIST**

After setting variables in Vercel:

- [ ] Both apps (site + admin) have all variables set
- [ ] `DATABASE_URL` includes `?pgbouncer=true&connection_limit=1&sslmode=require`
- [ ] `DIRECT_URL` includes `?sslmode=require`
- [ ] `PREVIEW_SECRET` and `REVALIDATE_SECRET` are identical in both apps
- [ ] `SITE_URL` matches your actual production URL
- [ ] Redeploy both apps after setting variables
- [ ] Visit `https://your-admin.vercel.app/api/health` → should return `{ ok: true }`
- [ ] Visit `https://your-site.vercel.app/api/health` → should return `{ ok: true }`

---

## 🚨 **COMMON ISSUES**

### **Issue: "DATABASE_URL resolved to an empty string"**
**Fix:** Make sure you set the variable for **all environments** and redeployed

### **Issue: Connection pool exhausted**
**Fix:** Add `?connection_limit=1` to DATABASE_URL

### **Issue: SSL connection failed**
**Fix:** Add `?sslmode=require` to both DATABASE_URL and DIRECT_URL

### **Issue: Preview/Revalidation returns 401**
**Fix:** Ensure PREVIEW_SECRET and REVALIDATE_SECRET match in both apps

---

## 📝 **QUICK COPY-PASTE TEMPLATE**

Replace placeholders and paste into Vercel:

```bash
# Database (get from Supabase)
DATABASE_URL=postgresql://postgres.PASSWORD@db.PROJECT_REF.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DIRECT_URL=postgresql://postgres.PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require

# Supabase (get from Supabase API settings)
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Secrets (generate with: openssl rand -base64 32)
PREVIEW_SECRET=YOUR_GENERATED_SECRET_1
REVALIDATE_SECRET=YOUR_GENERATED_SECRET_2

# Site URLs (update if different)
NEXT_PUBLIC_SITE_URL=https://khaledaun.vercel.app
SITE_URL=https://khaledaun.vercel.app
```

---

**Next Step:** After setting these in Vercel, proceed to run database migrations locally.

