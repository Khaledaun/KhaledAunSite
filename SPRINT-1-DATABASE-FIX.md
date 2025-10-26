# Sprint 1: Database Connection Fix

## Problem
All Prisma queries are failing with:
```
Can't reach database server at `aws-1-eu-central-2.pooler.supabase.com:5432`
```

## Root Cause
The `DATABASE_URL` in Vercel is using Supabase's connection pooler, but it's missing the required `?pgbouncer=true` parameter that Prisma needs to work with PgBouncer.

## Solution
Update the `DATABASE_URL` environment variable in Vercel to include the `?pgbouncer=true` parameter.

### Current Setup (from debug endpoint)
- **DATABASE_URL**: `postgresql://***:***@aws-1-eu-central-2.pooler.supabase.com:5432/postgres`
- **DIRECT_URL**: `postgresql://***:***@db.fnmvswjxemsoudgxnvfu.supabase.co:5432/postgres`

### Required Fix
The `DATABASE_URL` needs to have `?pgbouncer=true` appended:

```
DATABASE_URL=postgresql://[user]:[password]@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?pgbouncer=true
```

## Steps to Fix

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find the `DATABASE_URL` variable
3. Edit it to add `?pgbouncer=true` at the end
4. The format should be:
   ```
   postgresql://[user]:[password]@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?pgbouncer=true
   ```
5. Save the changes
6. Redeploy the application

## Alternative: Use Direct Connection

If the pooler continues to have issues, you can swap the URLs:
- Set `DATABASE_URL` to the direct connection (currently in `DIRECT_URL`)
- This will work but may have connection limits in high-traffic scenarios

## Why This Happens

Supabase uses PgBouncer for connection pooling. Prisma needs to know it's connecting through PgBouncer so it can:
1. Use transaction pooling mode correctly
2. Avoid using prepared statements (which don't work with PgBouncer in transaction mode)
3. Handle connection lifecycle properly

## Verification

After fixing, test with:
```bash
curl https://admin.khaledaun.com/api/debug/test-topic-query
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

## References
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [PgBouncer with Prisma](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management/configure-pg-bouncer)

