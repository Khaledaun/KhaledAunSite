# Vercel Environment Variables - Complete Setup Guide

## 🔐 **Admin Dashboard** (`admin.khaledaun.com`)

### **Required Environment Variables**

Copy these to Vercel Dashboard → Admin Project → Settings → Environment Variables

```bash
# Supabase Configuration (CRITICAL for auth)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database (same Supabase project)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres

# NextAuth (for session management)
NEXTAUTH_URL=https://admin.khaledaun.com
NEXTAUTH_SECRET=generate_random_32_char_secret_here

# AI Services (for AI Assistant features)
OPENAI_API_KEY=sk-your_openai_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here

# Optional: Email (if using email features)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_FROM=noreply@khaledaun.com
```

### **How to Get These Values:**

#### **Supabase Keys:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

#### **Database URL:**
1. Same Supabase project
2. Settings → Database
3. Connection String → URI
4. Format: `postgresql://postgres:[PASSWORD]@db.PROJECT.supabase.co:5432/postgres`

#### **NextAuth Secret:**
```bash
# Generate a secure random secret:
openssl rand -base64 32
```

#### **AI API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

---

## 🌐 **Public Site** (`www.khaledaun.com`)

### **Required Environment Variables**

Copy these to Vercel Dashboard → Site Project → Settings → Environment Variables

```bash
# Supabase Configuration (for reading published content)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Database (for fetching published posts, case studies)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres

# Admin API (for contact form submission → leads)
NEXT_PUBLIC_ADMIN_API_URL=https://admin.khaledaun.com/api

# Optional: Preview/Revalidation
REVALIDATION_TOKEN=generate_random_token_here

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=auto
```

### **How to Get These Values:**

Same Supabase project as admin (shared database).

---

## 📋 **Environment Configuration Checklist**

### **Step 1: Configure Admin Project**

1. Go to Vercel Dashboard
2. Select **Admin Project** (khaled-aun-site-admin or similar)
3. Settings → Environment Variables
4. Add each variable with values for:
   - ✅ **Production**
   - ✅ **Preview** (optional, can use same values)
   - ✅ **Development** (optional)

**Critical Variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_URL`
- [ ] `NEXTAUTH_SECRET`

**Optional but Recommended:**
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY`

### **Step 2: Configure Site Project**

1. Go to Vercel Dashboard
2. Select **Site Project** (khaled-aun-site or similar)
3. Settings → Environment Variables
4. Add each variable

**Critical Variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_ADMIN_API_URL`

### **Step 3: Redeploy**

After adding environment variables:

```bash
# Trigger redeployment in Vercel Dashboard
# Deployments → Latest Deployment → ⋮ menu → Redeploy

# Or push a commit to trigger rebuild:
git commit --allow-empty -m "chore: trigger redeployment with env vars"
git push origin main
```

---

## 🔒 **Security Best Practices**

### **DO:**
✅ Use environment variables for ALL secrets  
✅ Use different values for Production vs Preview  
✅ Rotate keys regularly  
✅ Use service role key ONLY on server-side  
✅ Commit `.env.example` with placeholders  

### **DON'T:**
❌ Commit actual `.env` files to git  
❌ Expose service role keys in client-side code  
❌ Share API keys in public repositories  
❌ Use same secrets across multiple projects  

---

## 🧪 **Testing Environment Variables**

### **Admin Dashboard:**

```bash
# Test auth works:
curl https://admin.khaledaun.com/api/health

# Should return database status if DATABASE_URL is set
```

### **Public Site:**

```bash
# Test site loads:
curl https://www.khaledaun.com/en

# Test contact form submission:
curl -X POST https://admin.khaledaun.com/api/admin/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","interest":"GENERAL","message":"Test"}'
```

---

## 📝 **Local Development Setup**

### **Admin App:**

Create `apps/admin/.env.local`:

```bash
# Copy from .env.example
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-min-32-chars
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### **Site App:**

Create `apps/site/.env.local`:

```bash
# Copy from .env.example
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://...
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3000/api
```

---

## 🚀 **Quick Setup Script**

```bash
# 1. Copy environment template
cp .env.example apps/admin/.env.local
cp .env.example apps/site/.env.local

# 2. Edit files with your actual values
# Use your preferred editor

# 3. Test locally
cd apps/admin && npm run dev
# In another terminal:
cd apps/site && npm run dev

# 4. Add to Vercel (manual - use dashboard)
# Or use Vercel CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... etc for each variable
```

---

## ❓ **Troubleshooting**

### **Issue: Admin shows "Not authenticated" but won't redirect**

**Cause:** Missing or incorrect Supabase env vars  
**Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### **Issue: Database errors in logs**

**Cause:** Incorrect `DATABASE_URL`  
**Fix:** Check connection string format and password

### **Issue: AI features not working**

**Cause:** Missing API keys  
**Fix:** Add `OPENAI_API_KEY` and/or `ANTHROPIC_API_KEY`

### **Issue: Contact form submissions fail**

**Cause:** Site can't reach admin API  
**Fix:** Verify `NEXT_PUBLIC_ADMIN_API_URL` is set to `https://admin.khaledaun.com/api`

### **Issue: Changes not taking effect**

**Cause:** Env vars require redeployment  
**Fix:** Redeploy the project after adding/changing env vars

---

## 📞 **Next Steps After Configuration**

1. **Add all environment variables in Vercel**
2. **Redeploy both projects**
3. **Run database migration** (see below)
4. **Test authentication** on admin.khaledaun.com
5. **Test contact form** on www.khaledaun.com
6. **Re-run E2E tests** to verify

---

## 💾 **Database Migration**

After env vars are set, push schema changes:

```bash
# From project root:
cd packages/db

# Push schema to production database:
npx prisma db push --schema ./prisma/schema.prisma

# Seed initial data (optional):
npm run seed
```

This will create all tables including:
- `Lead` (for contact form submissions)
- `CaseStudy` (for portfolio)
- `AIConfig` (for AI settings)
- `AIPromptTemplate` (for AI templates)
- `MediaAsset` (enhanced)
- `AIGeneration` (tracking)
- `URLExtraction` (content extraction)

---

**Last Updated:** October 21, 2025  
**Status:** Ready for production configuration

