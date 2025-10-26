# Sprint 1 - Prisma Integration Fix

## 🔴 Current Problem

The Sprint 1 API endpoints are returning `500` errors with the message:
```
permission denied for schema public
```

**Root Cause**: The Sprint 1 tables were created directly in Supabase, but the admin app uses **Prisma** for all database access, not direct Supabase queries. The Supabase client connection is failing with `401 Unauthorized`.

## ✅ Solution: Use Prisma Instead of Supabase Client

All existing API routes in the admin app use Prisma (see `/api/admin/posts/route.ts` as an example). We need to do the same for Sprint 1.

### Step 1: Add Models to Prisma Schema ✅

I've already added the Sprint 1 models to `apps/admin/prisma/schema.prisma`:
- `Topic` (maps to `topics` table)
- `ContentLibrary` (maps to `content_library` table)
- `MediaLibrary` (maps to `media_library` table)

### Step 2: Generate Prisma Client

Run this command to generate the Prisma client with the new models:

```bash
cd apps/admin
npx prisma generate
```

### Step 3: Update API Routes to Use Prisma

I've started updating the routes. You need to:

1. Replace all Supabase queries with Prisma queries
2. Use `prisma.topic.findMany()` instead of `supabase.from('topics').select()`
3. Follow the pattern used in `/api/admin/posts/route.ts`

### Example: Topics GET Route

**Before (Supabase - NOT WORKING):**
```typescript
const supabase = getSupabaseClient();
const { data: topics, error } = await supabase
  .from('topics')
  .select('*')
  .order('created_at', { ascending: false });
```

**After (Prisma - WORKING):**
```typescript
const topics = await prisma.topic.findMany({
  orderBy: { createdAt: 'desc' }
});
```

## 📋 Files That Need Updating

All Sprint 1 API routes need to be converted from Supabase to Prisma:

1. ✅ `apps/admin/app/api/topics/route.ts` - Started
2. ⏳ `apps/admin/app/api/topics/[id]/route.ts` - TODO
3. ⏳ `apps/admin/app/api/topics/[id]/lock/route.ts` - TODO
4. ⏳ `apps/admin/app/api/content-library/route.ts` - TODO
5. ⏳ `apps/admin/app/api/content-library/[id]/route.ts` - TODO
6. ⏳ `apps/admin/app/api/media-library/route.ts` - TODO
7. ⏳ `apps/admin/app/api/media-library/[id]/route.ts` - TODO
8. ⏳ `apps/admin/app/api/media-library/upload/route.ts` - TODO

## 🚀 Quick Fix Commands

```bash
# 1. Navigate to admin app
cd apps/admin

# 2. Generate Prisma client
npx prisma generate

# 3. Test locally
npm run dev

# 4. Test the API
curl http://localhost:3000/api/topics

# 5. If it works, commit and push
git add -A
git commit -m "fix: Convert Sprint 1 API routes to use Prisma"
git push origin main
```

## 📝 Prisma Query Cheat Sheet

### Find Many
```typescript
const topics = await prisma.topic.findMany({
  where: { status: 'pending' },
  orderBy: { createdAt: 'desc' },
  skip: 0,
  take: 30,
});
```

### Find One
```typescript
const topic = await prisma.topic.findUnique({
  where: { id: topicId },
});
```

### Create
```typescript
const topic = await prisma.topic.create({
  data: {
    title: 'New Topic',
    description: 'Description',
    status: 'pending',
  },
});
```

### Update
```typescript
const topic = await prisma.topic.update({
  where: { id: topicId },
  data: {
    status: 'completed',
  },
});
```

### Delete
```typescript
await prisma.topic.delete({
  where: { id: topicId },
});
```

### Count
```typescript
const count = await prisma.topic.count({
  where: { status: 'pending' },
});
```

## ⚠️ Important Notes

1. **Column Names**: Prisma uses camelCase (`createdAt`), but the database uses snake_case (`created_at`). Prisma handles the conversion automatically via the `@@map()` directive.

2. **Relations**: The models have relations defined:
   - `Topic` has many `ContentLibrary` items
   - `ContentLibrary` has many `MediaLibrary` items
   
3. **No More Supabase Client**: Remove all `getSupabaseClient()` calls from Sprint 1 routes. Only use `prisma`.

4. **Keep checkAuth**: The `checkAuth()` helper for permissions is still needed and works fine.

## 🎯 Why This Fixes the Issue

- Prisma uses the `DATABASE_URL` environment variable which is already configured
- Prisma doesn't need the service role key
- Prisma is what all other routes use successfully
- No more "permission denied" errors

## 📚 Reference

See these working examples in the codebase:
- `apps/admin/app/api/admin/posts/route.ts` - Full CRUD with Prisma
- `apps/admin/app/api/admin/case-studies/route.ts` - Another example

---

**Status**: Prisma schema updated ✅, API routes need conversion ⏳

