# ⚡ **QUICK START: Environment Variables Setup**

**Time Required:** 10-15 minutes  
**Priority:** 🔴 CRITICAL - Required for apps to function

---

## 🎯 **What You Need**

Before starting, gather these from **Supabase Dashboard**:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**

**Copy these values:**
- ✅ Project URL (e.g., `https://xxxxx.supabase.co`)
- ✅ `anon` / `public` key (starts with `eyJhbGc...`)
- ✅ `service_role` key (starts with `eyJhbGc...`)

4. Go to **Settings** → **Database**

**Copy these values:**
- ✅ Connection string (URI format)
- ✅ Direct connection (for migrations)

---

## 🔧 **Step 1: Configure Site Project** (5 min)

### **In Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Select **khaledaun-site** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below:

### **Variables to Add:**

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres.xxx:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true` | Production, Preview, Development |
| `DIRECT_URL` | `postgresql://postgres.xxx:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (your anon key) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (your service_role key) | Production, Preview, Development |

### **How to Add Each Variable:**

```
1. Click "Add Variable"
2. Enter Variable Name (exact spelling, case-sensitive)
3. Paste Value
4. Check all three environments: ✅ Production ✅ Preview ✅ Development
5. Click "Save"
6. Repeat for each variable
```

### **After Adding All Variables:**

```
7. Go to Deployments tab
8. Find latest deployment
9. Click "..." → "Redeploy"
10. Wait ~30 seconds
```

---

## 🔧 **Step 2: Configure Admin Project** (5 min)

### **In Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Select **khaledaun-admin** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below:

### **Variables to Add:**

**Same as Site PLUS additional:**

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | (same as site) | Production, Preview, Development |
| `DIRECT_URL` | (same as site) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | (same as site) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (same as site) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | (same as site) | Production, Preview, Development |
| `NEXTAUTH_SECRET` | **Generate below** ⬇️ | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://admin.khaledaun.com` | Production |
| `NEXTAUTH_URL` | (your preview URL) | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `OPENAI_API_KEY` | `sk-...` (optional for now) | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | `sk-ant-...` (optional for now) | Production, Preview, Development |

### **Generate `NEXTAUTH_SECRET`:**

**Option A: PowerShell (Windows)**
```powershell
# Run this in PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Option B: Online Generator**
- Visit https://generate-secret.vercel.app/32
- Copy the generated string

**Option C: Command Line (Mac/Linux)**
```bash
openssl rand -base64 32
```

### **After Adding All Variables:**

```
7. Go to Deployments tab
8. Find latest deployment
9. Click "..." → "Redeploy"
10. Wait ~50 seconds
```

---

## 🗄️ **Step 3: Run Database Migration** (2 min)

### **Option A: Using Vercel CLI** (Recommended)

**In PowerShell:**

```powershell
# 1. Set DATABASE_URL temporarily (replace with your actual URL)
$env:DATABASE_URL="postgresql://postgres.xxx:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# 2. Run migration
npx prisma db push --schema packages/db/prisma/schema.prisma --accept-data-loss

# 3. Verify
npx prisma studio --schema packages/db/prisma/schema.prisma
# This opens a web UI to browse your database
```

### **Option B: Using Supabase SQL Editor**

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Paste the migration SQL:

```sql
-- Run each migration file from packages/db/sql/
-- 1. phase6.5-storage-setup.sql
-- 2. Any other migration files

-- Or use the Prisma-generated SQL:
-- (You can get this by running: npx prisma migrate dev --create-only)
```

### **Option C: Using Database URL Directly**

```powershell
# Install Prisma globally if not installed
npm install -g prisma

# Run push
prisma db push --schema packages/db/prisma/schema.prisma
```

---

## 👤 **Step 4: Create First Admin User** (3 min)

### **In Supabase Dashboard:**

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@khaledaun.com`
   - Password: `[choose-secure-password]`
   - ✅ Auto Confirm User: **Yes**
4. Click **Create user**

### **Set User Role:**

5. Go to **Table Editor** → Select `User` table
6. Find the user you just created
7. Click **Edit**
8. Set `role` field to: `OWNER`
9. Click **Save**

### **Verify:**

10. Go back to **Authentication** → **Users**
11. You should see your user with ✅ confirmed status

---

## ✅ **Step 5: Test Everything** (5 min)

### **Test Site:**

1. **Visit:** https://www.khaledaun.com
2. **Expected:** Homepage loads with no console errors
3. **Test Contact Form:**
   - Fill out form
   - Submit
   - Check Supabase → Table Editor → `leads` table
   - Should see new entry

### **Test Admin:**

1. **Visit:** https://admin.khaledaun.com
2. **Expected:** Redirects to `/auth/login`
3. **Test Login:**
   - Enter admin email/password
   - Click **Sign in**
   - Should redirect to `/command-center`
4. **Test Navigation:**
   - Click **Leads** → Should show leads table
   - Click **Case Studies** → Should show empty list
   - Click **AI Config** → Should show configuration page

### **Check for Errors:**

**Browser Console (F12):**
- ❌ Should NOT see: "Supabase client not configured"
- ❌ Should NOT see: "Failed to fetch"
- ✅ Should see: Clean console or minor warnings only

---

## 🚨 **Troubleshooting**

### **Issue: "Supabase client not configured"**

**Solution:**
1. Verify all env vars are set correctly
2. Check for typos in variable names
3. Ensure you selected all 3 environments
4. Redeploy after adding variables

### **Issue: Login fails with "Failed to verify user permissions"**

**Solution:**
1. Check user exists in Supabase Auth
2. Verify user has `role` set to `OWNER` in User table
3. Check DATABASE_URL is correct
4. Ensure migration ran successfully

### **Issue: Contact form says "Failed to submit"**

**Solution:**
1. Check browser console for errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Check DATABASE_URL is correct
4. Ensure `Lead` table exists (run migration)

### **Issue: "Too many redirects" on admin**

**Solution:**
1. Check `NEXTAUTH_URL` matches your domain exactly
2. Verify middleware is not blocking auth routes
3. Clear browser cookies
4. Try incognito mode

---

## 📋 **Quick Checklist**

- [ ] Supabase credentials gathered
- [ ] Site env vars configured
- [ ] Site redeployed
- [ ] Admin env vars configured
- [ ] Admin redeployed
- [ ] Database migration run
- [ ] First admin user created
- [ ] User role set to OWNER
- [ ] Site tested (homepage loads)
- [ ] Contact form tested
- [ ] Admin login tested
- [ ] Dashboard accessible

---

## ⏱️ **Timeline**

| Task | Time | Status |
|------|------|--------|
| Gather Supabase credentials | 2 min | ⏳ |
| Configure site env vars | 3 min | ⏳ |
| Configure admin env vars | 4 min | ⏳ |
| Redeploy both projects | 2 min | ⏳ |
| Run database migration | 2 min | ⏳ |
| Create admin user | 3 min | ⏳ |
| Test site | 2 min | ⏳ |
| Test admin | 3 min | ⏳ |
| **TOTAL** | **~20 min** | ⏳ |

---

## 🎯 **After Setup Complete**

Once everything is working:

1. **Document Your Credentials:**
   - Save admin email/password securely
   - Save NEXTAUTH_SECRET for reference
   - Keep Supabase credentials accessible

2. **Optional: Add AI Keys:**
   - Get OpenAI API key: https://platform.openai.com/api-keys
   - Get Anthropic API key: https://console.anthropic.com/
   - Add to admin env vars
   - Redeploy

3. **Start Using:**
   - Create blog posts
   - Add case studies
   - Manage leads
   - Configure AI templates

---

## 📞 **Need Help?**

**Common Resources:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs

**Project Docs:**
- `VERCEL-ENV-COMPLETE.md` - Full env var reference
- `scripts/migrate-production.md` - Database migration guide
- `DEPLOYMENT-SUCCESS-FINAL.md` - Deployment overview

---

**Status:** Ready to configure! 🚀  
**Next:** Gather Supabase credentials and start Step 1

