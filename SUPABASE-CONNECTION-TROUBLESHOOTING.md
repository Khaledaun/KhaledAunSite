# Supabase Connection Troubleshooting Guide

## Current Issue
Prisma cannot connect to Supabase database from Vercel deployment.

**Error**: `Can't reach database server at db.fnmvswjxemsoudgxnvfu.supabase.co:5432`

## What We've Tried

### ✅ 1. Fixed Connection String Format
- Added `?pgbouncer=true` parameter for pooler
- Used correct username format with `postgres.` prefix
- Switched to direct connection URL

### ✅ 2. Verified Environment Variables
- `DATABASE_URL` is correctly set in Vercel
- `DIRECT_URL` is correctly set in Vercel
- Both are using the correct password

### ✅ 3. Cleared Build Cache
- Performed fresh deployment without cache
- Prisma client regenerated during build

### ❌ 4. Still Failing
- ALL Prisma-based APIs are returning 500 errors
- Both Sprint 1 APIs AND existing APIs (like `/api/admin/posts`) are failing
- This indicates a fundamental connection issue

## Possible Causes

### 1. Supabase Connection Pooling Disabled
**Check**: Supabase Dashboard → Database → Connection Pooling
- Ensure connection pooling is **enabled**
- Verify the pooler is running

### 2. Supabase Firewall/IP Restrictions
**Check**: Supabase Dashboard → Database → Network
- Ensure Vercel IP addresses are not blocked
- Check if there are any IP allowlist restrictions
- Supabase should allow all IPs by default, but verify

### 3. Supabase Database Paused/Inactive
**Check**: Supabase Dashboard → Project Status
- Ensure the database is **active** and not paused
- Free tier projects pause after inactivity

### 4. Connection Limit Reached
**Check**: Supabase Dashboard → Database → Connection Pooling
- Verify current connection count
- Free tier has limited connections (60 direct, 200 pooled)

### 5. SSL/TLS Configuration
**Check**: Connection string parameters
- Try adding `?sslmode=require` to the connection string
- Or try `?sslmode=prefer`

### 6. DNS Resolution Issue
**Check**: From Vercel deployment
- Supabase hostname might not be resolving correctly
- This is rare but possible

## Recommended Next Steps

### Step 1: Verify Supabase Project Status
1. Go to Supabase Dashboard
2. Check project status (top right)
3. Ensure it's **Active** (not paused)
4. If paused, unpause it

### Step 2: Check Connection Pooling
1. Go to **Database** → **Connection Pooling**
2. Ensure it's **enabled**
3. Note the pooler URL and port

### Step 3: Test Direct Connection with SSL Mode
Update `DATABASE_URL` in Vercel to:
```
postgresql://postgres:Pn3RdJHpkMn7rn3S@db.fnmvswjxemsoudgxnvfu.supabase.co:5432/postgres?sslmode=require
```

### Step 4: Try IPv6 Connection String
Some Supabase projects use IPv6. Try:
```
postgresql://postgres:Pn3RdJHpkMn7rn3S@db.fnmvswjxemsoudgxnvfu.supabase.co:6543/postgres?sslmode=require
```
(Note the different port: 6543 instead of 5432)

### Step 5: Check Supabase Service Status
Visit: https://status.supabase.com/
- Check if there are any ongoing incidents
- Verify your region (eu-central-2) is operational

### Step 6: Contact Supabase Support
If none of the above work, this might be a Supabase-specific issue:
1. Go to Supabase Dashboard
2. Click **Support** (bottom left)
3. Report connection issues from Vercel
4. Provide error message and connection string (without password)

## Alternative: Use Supabase Client Instead of Prisma

As a temporary workaround, we could switch Sprint 1 APIs back to using the Supabase client directly instead of Prisma. This would:
- Bypass the Prisma connection issue
- Use Supabase's REST API instead of direct database connection
- Work immediately

However, this is not ideal because:
- Inconsistent with other APIs
- Less type-safe
- More manual query writing

## Debug Information

### Current Environment Variables (Vercel)
```
DATABASE_URL=postgresql://postgres:***@db.fnmvswjxemsoudgxnvfu.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:***@db.fnmvswjxemsoudgxnvfu.supabase.co:5432/postgres
```

### Supabase Project Details
- Project ID: fnmvswjxemsoudgxnvfu
- Region: eu-central-2 (AWS Frankfurt)
- Database Host: db.fnmvswjxemsoudgxnvfu.supabase.co
- Pooler Host: aws-1-eu-central-2.pooler.supabase.com

### Working APIs (Non-Prisma)
- UI pages: ✅ All working
- Health check: ✅ Working

### Failing APIs (Prisma-based)
- `/api/topics`: ❌ 500 error
- `/api/content-library`: ❌ 500 error
- `/api/media-library`: ❌ 500 error
- `/api/admin/posts`: ❌ 500 error (existing API)

This confirms the issue is with Prisma → Supabase connection, not with Sprint 1 code specifically.

## Next Actions

Please check your Supabase dashboard and report:
1. Project status (Active/Paused?)
2. Connection pooling status (Enabled/Disabled?)
3. Current connection count
4. Any IP restrictions or firewall rules
5. Database region and version

Once we have this information, we can determine the exact fix needed.

