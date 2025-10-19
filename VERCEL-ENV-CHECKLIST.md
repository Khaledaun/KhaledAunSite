# Vercel Environment Variables Checklist

**IMPORTANT:** Both `apps/site` and `apps/admin` need the SAME environment variables!

## 📋 **REQUIRED ENVIRONMENT VARIABLES**

### **For BOTH Projects (site + admin):**

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://postgres.fnmvswjxemsoudgxnvfu:Pn3RdJHpkMn7rn3S@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1` | From `.env` |
| `REVALIDATE_SECRET` | `UWaDmHIGg9thcCMeP1i6BnOlz2JYdXS3fNrL4AbZjs5Kw7FRupxoykVEQ8qT0v` | From `.env` |
| `PREVIEW_SECRET` | `fS3o75ByiYCK0FwOu6jETncQZb9sDdeGl4NAJPUV1qg8RzXxIaHLp2WmrkhvtM` | From `.env` |
| `SITE_URL` | `https://khaledaun.com` | Your production URL |
| `NEXT_PUBLIC_SITE_URL` | `https://khaledaun.com` | Your production URL |

---

## 🔧 **HOW TO SET IN VERCEL**

### **For Site Project:**
1. Go to: https://vercel.com/your-team/khaledaun-site/settings/environment-variables
2. Click "Add New"
3. For each variable:
   - **Key:** Variable name (e.g., `DATABASE_URL`)
   - **Value:** Paste the value from table above
   - **Environments:** Check all 3 boxes (Production, Preview, Development)
4. Click "Save"
5. **Redeploy** if builds already completed

### **For Admin Project:**
1. Go to: https://vercel.com/your-team/khaledaun-admin/settings/environment-variables
2. Repeat same steps as site project
3. **Use EXACT SAME VALUES** as site project

---

## ⚠️ **CRITICAL NOTES**

- **Same secrets for both:** Site and admin MUST share the same `REVALIDATE_SECRET` and `PREVIEW_SECRET`
- **Same database:** Both use the same `DATABASE_URL`
- **Redeploy required:** After adding/changing env vars, trigger a redeploy

---

## ✅ **VERIFICATION**

After setting env vars, check that deployments succeed:

1. Trigger manual redeploy (if needed)
2. Check build logs for errors
3. Verify both apps can connect to database

---

## 🔗 **QUICK LINKS**

- Site env vars: `https://vercel.com/[your-team]/[site-project]/settings/environment-variables`
- Admin env vars: `https://vercel.com/[your-team]/[admin-project]/settings/environment-variables`
- Site deployments: `https://vercel.com/[your-team]/[site-project]`
- Admin deployments: `https://vercel.com/[your-team]/[admin-project]`

---

**Created:** Oct 19, 2024  
**Status:** Ready for verification


