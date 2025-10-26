# Vercel Database Connection Fix Guide

## Current Error
```
FATAL: Tenant or user not found
```

This means the database credentials in `DATABASE_URL` are incorrect.

## Solution: Get the Correct Connection String from Supabase

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard/project/fnmvswjxemsoudgxnvfu
2. Click on **Settings** (gear icon in the left sidebar)
3. Click on **Database**

### Step 2: Get the Connection Strings

You'll see several connection strings. You need TWO of them:

#### For `DATABASE_URL` (Pooler - Transaction Mode):
Look for **Connection Pooling** section, then **Transaction** mode:
```
postgresql://postgres.fnmvswjxemsoudgxnvfu:[YOUR-PASSWORD]@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important Notes:**
- Use port **6543** (not 5432) for the pooler
- The format should be: `postgres.fnmvswjxemsoudgxnvfu` (with the dot)
- Must end with `?pgbouncer=true`

#### For `DIRECT_URL` (Direct Connection):
Look for **Connection String** section, **URI** format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.fnmvswjxemsoudgxnvfu.supabase.co:5432/postgres
```

**Important Notes:**
- Use port **5432** for direct connection
- The format should be: `db.fnmvswjxemsoudgxnvfu.supabase.co`
- No `?pgbouncer=true` needed

### Step 3: Update Vercel Environment Variables

1. Go to: https://vercel.com/khaledauns-projects/khaled-aun-site-admin/settings/environment-variables

2. Update `DATABASE_URL`:
   ```
   postgresql://postgres.fnmvswjxemsoudgxnvfu:[YOUR-PASSWORD]@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   
   **Key changes from current:**
   - Change username from `fnmvswjxemsoudgxnvfu` to `postgres.fnmvswjxemsoudgxnvfu`
   - Change port from `5432` to `6543`
   - Keep `?pgbouncer=true` at the end

3. Verify `DIRECT_URL` is correct:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.fnmvswjxemsoudgxnvfu.supabase.co:5432/postgres
   ```

### Step 4: Redeploy

After updating the environment variables, Vercel will automatically trigger a redeploy.

## Alternative: Use Direct Connection Only

If the pooler continues to have issues, you can use the direct connection for both:

1. Set `DATABASE_URL` to the direct connection (same as `DIRECT_URL`):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.fnmvswjxemsoudgxnvfu.supabase.co:5432/postgres
   ```

2. Keep `DIRECT_URL` the same

This will work but may hit connection limits under high traffic.

## Common Mistakes to Avoid

❌ **Wrong:** `postgresql://fnmvswjxemsoudgxnvfu:...@aws-1-eu-central-2.pooler.supabase.com:5432/...`
- Missing `postgres.` prefix
- Wrong port (5432 instead of 6543)

✅ **Correct:** `postgresql://postgres.fnmvswjxemsoudgxnvfu:...@aws-1-eu-central-2.pooler.supabase.com:6543/...?pgbouncer=true`
- Has `postgres.` prefix
- Correct port (6543)
- Has `?pgbouncer=true`

## Verification

After fixing, test with:
```powershell
curl https://admin.khaledaun.com/api/debug/test-topic-query | ConvertFrom-Json
```

Should return:
```json
{
  "success": true,
  "canConnect": true,
  "topicsCount": 0,
  "topics": [],
  "message": "Successfully queried topics table"
}
```

Then run the full smoke tests:
```powershell
node test-sprint-1.js
```

All tests should pass! ✅

