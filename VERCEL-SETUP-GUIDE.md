# ⚡ VERCEL ENVIRONMENT VARIABLES SETUP GUIDE

**Purpose:** Set all required environment variables in Vercel for 100% system readiness
**Time Required:** ~10 minutes (8 variables to add)
**Projects:** Admin App + Site App (if needed)

---

## 📋 OVERVIEW

You need to add **8 environment variables** to your **Admin** Vercel project:

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Database connection (pooled) | ✅ Critical |
| `DIRECT_URL` | Database connection (direct for migrations) | ✅ Critical |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Critical |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public/anon key | ✅ Critical |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | ✅ Critical |
| `CRON_SECRET` | Protects cron job endpoint | ✅ Critical |
| `NEXTAUTH_SECRET` | Authentication security | ✅ Critical |
| `OPENAI_API_KEY` | AI analysis for algorithm updates | ✅ Critical |

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### **PART 1: Access Vercel Project Settings**

1. **Go to Vercel Dashboard:**
   - Open https://vercel.com/dashboard
   - Sign in to your account

2. **Select Admin Project:**
   - Look for your admin project (likely named `khaled-aun-admin` or similar)
   - Click on the project card

3. **Open Environment Variables:**
   - Click **"Settings"** tab at the top
   - Click **"Environment Variables"** in the left sidebar
   - You should see the environment variables page

---

### **PART 2: Add Each Variable**

For **each variable below**, follow these steps:

1. Click **"Add Variable"** button (or "Add New" if you already have some variables)
2. In the **"Key"** field, enter the variable name exactly as shown
3. In the **"Value"** field, paste the value from below
4. Check **ALL THREE** environments:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Click **"Save"**

Repeat for all 8 variables:

---

#### **Variable 1: DATABASE_URL**

```
Key: DATABASE_URL
Value: [See COMPLETE-ENV-SETUP.md for actual value]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Purpose:** Pooled database connection for all runtime queries
**Format:** `postgresql://postgres.[ref]:[password]@aws-[region].pooler.supabase.com:6543/postgres`

---

#### **Variable 2: DIRECT_URL**

```
Key: DIRECT_URL
Value: [See COMPLETE-ENV-SETUP.md for actual value]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Purpose:** Direct database connection for migrations and schema changes
**Format:** `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres?sslmode=require`
**Important:** Must end with `?sslmode=require`

---

#### **Variable 3: NEXT_PUBLIC_SUPABASE_URL**

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: [See COMPLETE-ENV-SETUP.md for actual value]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Purpose:** Your Supabase project URL (public, client-side)
**Format:** `https://[your-project-ref].supabase.co`

---

#### **Variable 4: NEXT_PUBLIC_SUPABASE_ANON_KEY**

```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [See COMPLETE-ENV-SETUP.md for actual value]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Purpose:** Supabase public/anonymous key (safe for client-side)
**Format:** Long JWT token starting with `eyJhbGciOi...`
**Get from:** Supabase Dashboard → Settings → API → anon/public key

---

#### **Variable 5: SUPABASE_SERVICE_ROLE_KEY**

```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [See COMPLETE-ENV-SETUP.md for actual value]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Purpose:** Supabase admin key (server-side only, bypasses RLS)
**Format:** Long JWT token starting with `eyJhbGciOi...`
**Get from:** Supabase Dashboard → Settings → API → service_role key

⚠️ **Security:** This is a secret key - never expose in client-side code!

---

#### **Variable 6: CRON_SECRET**

```
Key: CRON_SECRET
Value: [See COMPLETE-ENV-SETUP.md for actual value]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Purpose:** Secures the weekly algorithm update cron job endpoint
**Generate:** `openssl rand -base64 32` or https://generate-secret.vercel.app/32

**Used by:** `/api/cron/algorithm-updates` (runs every Monday 9 AM UTC)

---

#### **Variable 7: NEXTAUTH_SECRET**

```
Key: NEXTAUTH_SECRET
Value: [See COMPLETE-ENV-SETUP.md for actual value]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Purpose:** NextAuth.js session encryption and CSRF protection
**Generate:** Same as CRON_SECRET (can reuse or generate separate)

⚠️ **Note:** Using same value as CRON_SECRET is fine, or generate a separate one for extra security

---

#### **Variable 8: OPENAI_API_KEY**

```
Key: OPENAI_API_KEY
Value: [See COMPLETE-ENV-SETUP.md for actual value]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Purpose:** GPT-4 access for algorithm update analysis
**Format:** Starts with `sk-proj-...`
**Get from:** https://platform.openai.com/api-keys

**Used by:**
- `/api/admin/algorithm-updates/analyze` - Analyzes updates
- `/api/cron/algorithm-updates` - Weekly auto-analysis

---

## ✅ VERIFICATION CHECKLIST

After adding all variables, verify in Vercel:

### **Check Environment Variables Page:**

- [ ] Total of **8 variables** visible
- [ ] All variables show **"3 environments"** badge
- [ ] No variables show **"⚠️ Sensitive"** warning unchecked
- [ ] Variable names match exactly (case-sensitive)

### **Check Each Variable:**

Click "Edit" on each variable to verify:

- [ ] **DATABASE_URL** - Starts with `postgresql://postgres.fnmvs...`
- [ ] **DIRECT_URL** - Starts with `postgresql://postgres:Pn3R...` and ends with `?sslmode=require`
- [ ] **NEXT_PUBLIC_SUPABASE_URL** - Equals `https://fnmvswjxemsoudgxnvfu.supabase.co`
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Long JWT token (starts with `eyJhbGciOi...`)
- [ ] **SUPABASE_SERVICE_ROLE_KEY** - Long JWT token (starts with `eyJhbGciOi...`)
- [ ] **CRON_SECRET** - Equals `c3b1bb3180f14aea3113e4d522aa2b13`
- [ ] **NEXTAUTH_SECRET** - Equals `c3b1bb3180f14aea3113e4d522aa2b13`
- [ ] **OPENAI_API_KEY** - Starts with `sk-proj-...`

---

## 🚀 PART 3: REDEPLOY APPLICATION

**CRITICAL:** Environment variables don't take effect until you redeploy!

### **Redeploy Admin Project:**

1. **Stay in your Admin project on Vercel**
2. Click **"Deployments"** tab at the top
3. Find the **latest deployment** (topmost in the list)
4. Click the **"..."** (three dots) menu on the right
5. Click **"Redeploy"**
6. **DON'T** check "Use existing build cache" (we want fresh build with new env vars)
7. Click **"Redeploy"** button to confirm
8. **Wait ~60 seconds** for deployment to complete
9. ✅ Verify deployment shows **"Ready"** status with green checkmark

### **Monitor Deployment:**

While deploying, you can:
- Watch the build logs (click on the deployment)
- Check for any errors in **"Building"** or **"Runtime Logs"**
- Verify environment variables loaded (look for logs mentioning connections)

---

## 🔍 VERIFICATION AFTER DEPLOYMENT

### **Test 1: Homepage Loads**
```
Visit: https://[your-admin-domain].vercel.app
Expected: Admin dashboard loads without errors
```

### **Test 2: Database Connection**
```
Visit: https://[your-admin-domain].vercel.app/api/health
Expected: JSON response with { "status": "ok", "database": "connected" }
```

### **Test 3: Supabase Connection**
```
Check browser console (F12) on admin homepage
Expected: No Supabase connection errors
```

### **Test 4: Algorithm Updates Page**
```
Visit: https://[your-admin-domain].vercel.app/admin/algorithm-updates
Expected: Page loads with empty table or existing updates
```

---

## 🚨 TROUBLESHOOTING

### **Issue: Variable Not Taking Effect**

**Symptoms:**
- App still can't connect to database
- Supabase errors in console
- Environment variable shows as undefined in logs

**Solution:**
1. Verify variable is saved in Vercel Settings → Environment Variables
2. Check variable is enabled for **all 3 environments**
3. **Redeploy** the application (variables only load on new deployments)
4. Check deployment logs for the variable (search for the variable name)

---

### **Issue: Build Fails After Adding Variables**

**Symptoms:**
- Deployment shows red "Failed" status
- Build logs show errors

**Solution:**
1. Check build logs for specific error message
2. Most common issues:
   - **TypeScript errors:** Already fixed in latest commits
   - **Prisma connection errors:** Check `DIRECT_URL` ends with `?sslmode=require`
   - **Missing variable:** Double-check all 8 variables are added
3. Try redeploying with existing build cache unchecked

---

### **Issue: Database Connection Fails**

**Symptoms:**
- Runtime logs show `ECONNREFUSED`
- "Unable to connect to database" errors

**Solution:**
1. Verify `DATABASE_URL` is correct (pooled connection, port 6543)
2. Verify `DIRECT_URL` is correct (direct connection, port 5432, with `?sslmode=require`)
3. Check Supabase Dashboard → Settings → Database → Connection pooler is enabled
4. Test connection locally:
   ```bash
   psql "postgresql://postgres.fnmvswjxemsoudgxnvfu:Pn3RdJHpkMn7rn3S@aws-1-eu-central-2.pooler.supabase.com:6543/postgres"
   ```

---

### **Issue: Supabase Auth Not Working**

**Symptoms:**
- Login page shows errors
- "Invalid API key" errors

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` matches your Supabase project URL
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon key**, not service role key
3. Check Supabase Dashboard → Settings → API for correct keys
4. Make sure variables start with `NEXT_PUBLIC_` for client-side access

---

### **Issue: Cron Job Not Running**

**Symptoms:**
- Algorithm updates not fetching automatically
- No cron execution logs

**Solution:**
1. Verify `CRON_SECRET` is set
2. Check `apps/admin/vercel.json` has cron configuration:
   ```json
   {
     "crons": [{
       "path": "/api/cron/algorithm-updates",
       "schedule": "0 9 * * 1"
     }]
   }
   ```
3. Verify Vercel plan supports cron (Pro or higher)
4. Check Vercel → Project → Functions → See cron execution history

---

### **Issue: AI Analysis Fails**

**Symptoms:**
- "Algorithm Update Analysis" shows errors
- "OpenAI API error" in logs

**Solution:**
1. Verify `OPENAI_API_KEY` is correct (starts with `sk-proj-`)
2. Check OpenAI account has credits: https://platform.openai.com/usage
3. Verify API key hasn't expired or been revoked
4. Test key locally:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer sk-proj-YOUR-KEY"
   ```

---

## 📊 ENVIRONMENT VARIABLES SUMMARY

### **What You Added (8 total):**

| # | Variable | Length | Starts With | Critical? |
|---|----------|--------|-------------|-----------|
| 1 | DATABASE_URL | ~150 | postgresql:// | ✅ Yes |
| 2 | DIRECT_URL | ~150 | postgresql:// | ✅ Yes |
| 3 | NEXT_PUBLIC_SUPABASE_URL | ~50 | https:// | ✅ Yes |
| 4 | NEXT_PUBLIC_SUPABASE_ANON_KEY | ~250 | eyJhbGciOi... | ✅ Yes |
| 5 | SUPABASE_SERVICE_ROLE_KEY | ~250 | eyJhbGciOi... | ✅ Yes |
| 6 | CRON_SECRET | ~32 | c3b1bb31... | ✅ Yes |
| 7 | NEXTAUTH_SECRET | ~32 | c3b1bb31... | ✅ Yes |
| 8 | OPENAI_API_KEY | ~164 | sk-proj-... | ✅ Yes |

### **What's Already Set (should verify exists):**

- `SITE_URL`
- `PREVIEW_SECRET`
- `REVALIDATE_SECRET`

---

## 🎯 SUCCESS CRITERIA

You're done with Vercel setup when:

- ✅ All 8 variables added to Admin project
- ✅ Each variable set for all 3 environments
- ✅ Application redeployed successfully
- ✅ Deployment shows "Ready" status
- ✅ Homepage loads without errors
- ✅ No environment variable errors in logs
- ✅ Database connection working
- ✅ Supabase authentication working

---

## 🔐 SECURITY BEST PRACTICES

✅ **Good Practices:**
- All sensitive keys stored in Vercel (not in code)
- Service role key only used server-side
- NEXT_PUBLIC_ prefix only on safe-to-expose variables
- Secrets are long random strings

⚠️ **Never Do:**
- Commit `.env` files with real values to git
- Expose service role key in client-side code
- Share OPENAI_API_KEY publicly
- Use same NEXTAUTH_SECRET across different projects

🔄 **Regular Maintenance:**
- Rotate secrets every 90 days
- Monitor OpenAI API usage and costs
- Review Vercel logs for suspicious activity
- Update OPENAI_API_KEY if compromised

---

## 📞 NEED HELP?

If you're stuck:

1. **Check Vercel deployment logs:**
   - Project → Deployments → Latest → View Function Logs
   - Look for errors mentioning environment variables

2. **Check Supabase logs:**
   - Dashboard → Logs → Postgres Logs
   - Look for connection attempts and errors

3. **Test locally first:**
   - Create `.env.local` with all variables
   - Run `npm run dev` in admin app
   - Verify everything works locally before deploying

4. **Common commands:**
   ```bash
   # Test database connection
   npx prisma db pull

   # Generate Prisma client
   npx prisma generate

   # Check Supabase connection
   curl https://fnmvswjxemsoudgxnvfu.supabase.co/rest/v1/
   ```

---

**Ready to proceed?** Follow PART 1 → PART 2 (add all 8 variables) → PART 3 (redeploy) → Verification! 🚀

**Next Step:** After Vercel setup is complete, proceed to running the Supabase SQL script.
