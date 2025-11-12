# 🚀 ENVIRONMENT SETUP TEMPLATE

**Purpose:** Template for environment variable configuration
**Time to Complete:** ~10 minutes
**Note:** Replace all `[YOUR_VALUE_HERE]` placeholders with actual values

---

## 📋 ENVIRONMENT VARIABLES - TEMPLATE

### **Core Database & Supabase Variables (7 total)**

```bash
# Database Connections
DATABASE_URL="[YOUR_DATABASE_URL_FROM_SUPABASE]"
DIRECT_URL="[YOUR_DIRECT_URL_FROM_SUPABASE]?sslmode=require"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY_FROM_SUPABASE_DASHBOARD]"

# Security Secrets
CRON_SECRET="[GENERATE_32_CHAR_RANDOM_STRING]"
NEXTAUTH_SECRET="[GENERATE_32_CHAR_RANDOM_STRING]"
```

### **AI Services (1 required for algorithm updates)**

```bash
# OpenAI API (REQUIRED for algorithm update analysis)
OPENAI_API_KEY="sk-proj-[YOUR_OPENAI_API_KEY]"
```

---

## 🔑 HOW TO GET EACH VALUE

### **1. DATABASE_URL**
**Source:** Supabase Dashboard → Settings → Database → Connection String
- Select **"Transaction Pooler"** (port 6543)
- Copy the full connection string
- **Format:** `postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:6543/postgres`

### **2. DIRECT_URL**
**Source:** Supabase Dashboard → Settings → Database → Connection String
- Select **"Session Pooler"** or **"Direct connection"** (port 5432)
- Copy the connection string
- **IMPORTANT:** Add `?sslmode=require` at the end
- **Format:** `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?sslmode=require`

### **3. NEXT_PUBLIC_SUPABASE_URL**
**Source:** Supabase Dashboard → Settings → API → Project URL
- **Format:** `https://[your-project-ref].supabase.co`

### **4. NEXT_PUBLIC_SUPABASE_ANON_KEY**
**Source:** Supabase Dashboard → Settings → API → Project API keys → anon/public
- Long JWT token (starts with `eyJhbGciOi...`)
- This is the **public** key, safe for client-side use

### **5. SUPABASE_SERVICE_ROLE_KEY**
**Source:** Supabase Dashboard → Settings → API → Project API keys → service_role
- Long JWT token (starts with `eyJhbGciOi...`)
- **CRITICAL:** This is a secret key - never expose in client-side code!
- Bypasses Row Level Security - use server-side only

### **6. CRON_SECRET**
**Generate new random string:**

**Option A - Online:**
```
Visit: https://generate-secret.vercel.app/32
Copy the generated secret
```

**Option B - PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Option C - Bash/Terminal:**
```bash
openssl rand -base64 32
```

### **7. NEXTAUTH_SECRET**
**Generate same as CRON_SECRET above**
- Can use same value as CRON_SECRET or generate separate one
- Must be long random string (32+ characters)

### **8. OPENAI_API_KEY**
**Source:** https://platform.openai.com/api-keys
1. Sign in to OpenAI account
2. Click **"Create new secret key"**
3. Give it a name (e.g., "KhaledAun Site")
4. Copy the key (starts with `sk-proj-...`)
5. **Save immediately** - you won't see it again!

**Check account has credits:** https://platform.openai.com/usage

---

## 📝 VERCEL SETUP INSTRUCTIONS

### **For Admin Project:**

Go to Vercel Dashboard → Your Admin Project → Settings → Environment Variables

Add each variable with these settings:
- **Environments:** ✅ Production ✅ Preview ✅ Development
- **Value:** From the sources above

### **For Site Project:**

Add these 5 variables:
1. DATABASE_URL
2. DIRECT_URL
3. NEXT_PUBLIC_SUPABASE_URL
4. NEXT_PUBLIC_SUPABASE_ANON_KEY
5. SUPABASE_SERVICE_ROLE_KEY

(Site doesn't need CRON_SECRET, NEXTAUTH_SECRET, or OPENAI_API_KEY)

---

## ✅ VERIFICATION

After adding all variables:

1. **Check Variable Count:**
   - Admin project: 8 variables
   - Site project: 5 variables

2. **Check All Show "3 environments":**
   - Each variable should have badge showing "Production, Preview, Development"

3. **Verify Format:**
   - DATABASE_URL starts with `postgresql://`
   - DIRECT_URL ends with `?sslmode=require`
   - NEXT_PUBLIC_SUPABASE_URL starts with `https://`
   - Both Supabase keys start with `eyJhbGciOi...`
   - OPENAI_API_KEY starts with `sk-proj-`

4. **Redeploy:**
   - Vercel → Deployments → Latest → "..." → Redeploy
   - Wait for "Ready" status

---

## 🔒 SECURITY BEST PRACTICES

✅ **Do:**
- Store secrets only in Vercel Environment Variables
- Use different secrets for different projects
- Rotate secrets every 90 days
- Monitor OpenAI API usage

❌ **Don't:**
- Commit secrets to git
- Share SUPABASE_SERVICE_ROLE_KEY publicly
- Expose OPENAI_API_KEY in client code
- Reuse the same NEXTAUTH_SECRET across projects

---

## 📚 NEXT STEPS

After setting all environment variables:

1. ✅ Run Supabase setup SQL (see `SUPABASE-SETUP-SQL.md`)
2. ✅ Redeploy both applications on Vercel
3. ✅ Verify deployments succeed
4. ✅ Test algorithm updates functionality
5. ✅ Follow `100-PERCENT-COMPLETION-CHECKLIST.md` for final verification

---

**Note:** For the complete setup guide with actual values already filled in, see `COMPLETE-ENV-SETUP.md` (local file only, not in git)
