# 🔐 **Vercel Environment Variables Checklist**

**Quick Answer:** Yes, you can copy most variables from Site to Admin, but Admin needs **4 additional variables**.

---

## ✅ **SHARED VARIABLES** (Copy from Site → Admin)

These **5 core variables** should be **IDENTICAL** in both projects:

| Variable Name | Same Value? | Notes |
|--------------|-------------|-------|
| `DATABASE_URL` | ✅ **YES - EXACT COPY** | Both connect to same database |
| `DIRECT_URL` | ✅ **YES - EXACT COPY** | Direct connection (if you set it) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ **YES - EXACT COPY** | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ **YES - EXACT COPY** | Public/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ **YES - EXACT COPY** | Admin key (secret) |

**Action:** Copy these 5 variables from Site → Admin **as-is**.

---

## 🆕 **ADMIN-ONLY VARIABLES** (Add to Admin)

Admin needs **4 additional variables** that Site doesn't need:

### **1. NEXTAUTH_SECRET** (REQUIRED)
- **What:** Secret key for authentication
- **Value:** Generate a random 32-byte string
- **How to Generate:**

**PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Example:** `K7vN9xQ2mP4wR8tY5uZ3aB6cD1eF0gH2iJ4kL7mN9oP=`

---

### **2. NEXTAUTH_URL** (REQUIRED)
- **What:** Your admin dashboard URL
- **Environment-Specific:**

| Environment | Value |
|------------|-------|
| **Production** | `https://admin.khaledaun.com` |
| **Preview** | Leave blank (Vercel auto-detects) OR use your preview domain |
| **Development** | `http://localhost:3000` |

**Important:** Set different values for each environment!

---

### **3. OPENAI_API_KEY** (OPTIONAL - for AI features)
- **What:** OpenAI API key for AI content generation
- **Value:** `sk-proj-...` (from https://platform.openai.com/api-keys)
- **When Needed:** For AI Writer, content generation, translation
- **Can Skip:** Yes - admin works without it, AI features just won't work

---

### **4. ANTHROPIC_API_KEY** (OPTIONAL - for AI features)
- **What:** Anthropic Claude API key as alternative to OpenAI
- **Value:** `sk-ant-...` (from https://console.anthropic.com/)
- **When Needed:** If using Claude instead of GPT
- **Can Skip:** Yes - only needed if you want Claude option

---

## 📋 **COMPLETE ADMIN PROJECT CHECKLIST**

### **Required Variables (9 total):**
- [ ] `DATABASE_URL` (copy from site)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (copy from site)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (copy from site)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (copy from site)
- [ ] `NEXTAUTH_SECRET` (generate new)
- [ ] `NEXTAUTH_URL` (environment-specific)

### **Optional But Recommended:**
- [ ] `DIRECT_URL` (copy from site - if you set it)

### **Optional for AI Features:**
- [ ] `OPENAI_API_KEY` (get from OpenAI)
- [ ] `ANTHROPIC_API_KEY` (get from Anthropic)

---

## ⚠️ **IMPORTANT: What NOT to Copy**

These variables should **NOT** be the same in both projects:

| Variable | Site Value | Admin Value | Why Different? |
|----------|-----------|-------------|----------------|
| `NEXTAUTH_URL` | `https://www.khaledaun.com` | `https://admin.khaledaun.com` | Different domains |

---

## 🎯 **STEP-BY-STEP: Copy from Site to Admin**

### **Step 1: Copy Shared Variables** (5 variables)

1. Open **Site** project in Vercel
2. Go to Settings → Environment Variables
3. **Copy these 5 values** to your clipboard/notepad:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DIRECT_URL` (if you set it)

4. Open **Admin** project in Vercel
5. Go to Settings → Environment Variables
6. **Paste each one:**
   - Click "Add Variable"
   - Name: (exact same name)
   - Value: (paste copied value)
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

### **Step 2: Generate NEXTAUTH_SECRET**

**In PowerShell:**
```powershell
# Run this command:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Copy the output
```

**In Admin Vercel:**
- Name: `NEXTAUTH_SECRET`
- Value: (paste generated string)
- Environments: ✅ Production ✅ Preview ✅ Development
- Click "Save"

### **Step 3: Set NEXTAUTH_URL**

**For Production environment:**
- Name: `NEXTAUTH_URL`
- Value: `https://admin.khaledaun.com`
- Environments: ✅ Production only
- Click "Save"

**For Development environment:**
- Name: `NEXTAUTH_URL`
- Value: `http://localhost:3000`
- Environments: ✅ Development only
- Click "Save"

**For Preview (optional):**
- You can skip this - Vercel auto-detects preview URLs
- Or set to your specific preview domain if needed

### **Step 4: Add AI Keys (Optional)**

**Only if you want AI features now:**

**OpenAI:**
- Get key from: https://platform.openai.com/api-keys
- Name: `OPENAI_API_KEY`
- Value: `sk-proj-...`
- Environments: ✅ All
- Click "Save"

**Anthropic:**
- Get key from: https://console.anthropic.com/
- Name: `ANTHROPIC_API_KEY`
- Value: `sk-ant-...`
- Environments: ✅ All
- Click "Save"

---

## 🔍 **VERIFY: What Should Site Have?**

**Site project should have these 5-6 variables:**

```
✅ DATABASE_URL
✅ DIRECT_URL (optional but recommended)
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
❌ NEXTAUTH_SECRET (NOT needed in site)
❌ NEXTAUTH_URL (NOT needed in site)
❌ OPENAI_API_KEY (NOT needed in site)
```

**Site does NOT need:**
- Auth variables (no admin login on public site)
- AI variables (AI features only in admin)

---

## 🔍 **VERIFY: What Should Admin Have?**

**Admin project should have these 9-11 variables:**

**Required (6):**
```
✅ DATABASE_URL (from site)
✅ NEXT_PUBLIC_SUPABASE_URL (from site)
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY (from site)
✅ SUPABASE_SERVICE_ROLE_KEY (from site)
✅ NEXTAUTH_SECRET (generate new)
✅ NEXTAUTH_URL (admin domain)
```

**Optional but recommended (1):**
```
✅ DIRECT_URL (from site)
```

**Optional for AI (2):**
```
⚪ OPENAI_API_KEY (for AI features)
⚪ ANTHROPIC_API_KEY (for AI features)
```

---

## 🚨 **Common Mistakes to Avoid**

### ❌ **MISTAKE 1:** Using site URL for admin
```
Wrong: NEXTAUTH_URL=https://www.khaledaun.com
Right: NEXTAUTH_URL=https://admin.khaledaun.com
```

### ❌ **MISTAKE 2:** Different database URLs
```
Wrong: Site and Admin point to different databases
Right: Both use EXACT same DATABASE_URL
```

### ❌ **MISTAKE 3:** Forgetting to select all environments
```
Wrong: Only setting Production
Right: Check ✅ Production ✅ Preview ✅ Development
```

### ❌ **MISTAKE 4:** Using same NEXTAUTH_SECRET across projects
```
Not wrong, but not ideal: Reusing secrets
Better: Generate unique secret for admin
```

---

## ✅ **VALIDATION CHECKLIST**

After adding all variables:

### **In Site Project:**
- [ ] Has 5-6 environment variables
- [ ] DATABASE_URL starts with `postgresql://`
- [ ] NEXT_PUBLIC_SUPABASE_URL starts with `https://`
- [ ] All keys are long strings (100+ characters)
- [ ] All variables set for all 3 environments

### **In Admin Project:**
- [ ] Has 6-11 environment variables
- [ ] All 5 Site variables copied exactly
- [ ] NEXTAUTH_SECRET is long random string
- [ ] NEXTAUTH_URL matches admin domain
- [ ] All variables set for appropriate environments

---

## 🔄 **After Adding Variables**

**DON'T FORGET TO REDEPLOY!**

1. **Site Project:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait ~30 seconds

2. **Admin Project:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait ~50 seconds

**Why:** Vercel doesn't automatically redeploy when env vars change. You must manually trigger redeploy.

---

## 🎯 **TL;DR - Quick Action Plan**

**For Admin Project:**

1. ✅ **Copy these 5 from Site** (exact same values):
   - DATABASE_URL
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - DIRECT_URL (if site has it)

2. ✅ **Generate and add these 2 NEW**:
   - NEXTAUTH_SECRET (random 32-byte string)
   - NEXTAUTH_URL (https://admin.khaledaun.com for Production)

3. ⚪ **Optional - Add AI keys** (can skip for now):
   - OPENAI_API_KEY
   - ANTHROPIC_API_KEY

4. ✅ **Redeploy Admin project**

**Total Required:** 6-7 variables (5 from site + 2 new)  
**Total with AI:** 8-9 variables (5 from site + 2 new + 2 AI)

---

**Ready?** Copy the 5 shared variables, generate NEXTAUTH_SECRET, set NEXTAUTH_URL, then redeploy! 🚀

