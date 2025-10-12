# Phase 6 Readiness - CMS + RBAC + Preview + Publish & Revalidate

**Date**: October 12, 2025  
**Phase**: Phase 6 - Content Management System with Role-Based Access Control  
**Status**: 🟡 **PARTIALLY READY** (30% complete)

---

## Overview

Phase 6 aims to implement:
1. **CMS**: Content management for posts with translations
2. **RBAC**: Role-based access control (OWNER/EDITOR/REVIEWER/AUTHOR)
3. **Preview**: Draft preview before publishing
4. **Publish + Revalidate**: Publish workflow with ISR revalidation

---

## 1. CMS Tables & Schema

### ✅ FOUND: Basic Post Model

**File**: `packages/db/prisma/schema.prisma:73-85`
```prisma
model Post {
  id          String      @id @default(cuid())
  title       String
  content     String?
  status      String      @default("DRAFT") // DRAFT, PUBLISHED, ARCHIVED, READY
  riskLevel   String      @default("LOW") // LOW, MEDIUM, HIGH
  authorId    String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  PostMedia   PostMedia[]

  @@map("posts")
}
```

**✅ Present**: Basic post structure with status and risk level

---

### ❌ MISSING: Post Translations Table

**Required Schema** (not present):
```prisma
model PostTranslation {
  id          String   @id @default(cuid())
  postId      String
  locale      String   // 'en' or 'ar'
  title       String
  slug        String
  content     String?  // Rich text JSON
  excerpt     String?
  seoTitle    String?
  seoDescription String?
  status      String   @default("DRAFT")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([postId, locale])
  @@unique([slug, locale])
  @@map("post_translations")
}
```

**Impact**: HIGH - Cannot support bilingual content without this

---

### ❌ MISSING: Audit Log Table

**Required Schema** (not present):
```prisma
model Audit {
  id          String   @id @default(cuid())
  entityType  String   // "post", "media", etc.
  entityId    String
  action      String   // "created", "updated", "published", "deleted"
  userId      String
  userRole    String
  before      Json?
  after       Json?
  createdAt   DateTime @default(now())

  @@map("audits")
}
```

**Impact**: MEDIUM - Required for RBAC compliance and tracking

---

### ✅ FOUND: Media Asset Model

**File**: `packages/db/prisma/schema.prisma:27-41`
```prisma
model MediaAsset {
  id          String      @id @default(cuid())
  filename    String
  url         String
  mimeType    String
  size        Int
  alt         String?
  caption     String?
  status      String      @default("ACTIVE")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  PostMedia   PostMedia[]

  @@map("media_assets")
}
```

**✅ Present**: Media model with ALT text support

---

### ✅ FOUND: Post-Media Relationship

**File**: `packages/db/prisma/schema.prisma:43-54`
```prisma
model PostMedia {
  id           String     @id @default(cuid())
  postId       String
  mediaAssetId String
  order        Int        @default(0)
  createdAt    DateTime   @default(now())
  post         Post       @relation(fields: [postId], references: [id], onDelete: Cascade)
  mediaAsset   MediaAsset @relation(fields: [mediaAssetId], references: [id], onDelete: Cascade)

  @@unique([postId, mediaAssetId])
  @@map("post_media")
}
```

**✅ Present**: Junction table for post-media relationships

---

## 2. RBAC (Role-Based Access Control)

### ⚠️ PARTIAL: RLS Policies

**File**: `packages/db/sql/rls-policies.sql:19-26`
```sql
-- Policy: Editors can create and update posts, but not delete
CREATE POLICY "Editors can create and update posts" ON posts
FOR ALL
TO authenticated
USING (
    (auth.jwt() ->> 'role') = 'editor'
    OR (auth.jwt() ->> 'app_metadata')::json ->> 'role' = 'editor'
    OR (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'editor'
```

**✅ Present**: Row-level security policies exist  
**❌ Incomplete**: Only covers "editor" role

---

### ❌ MISSING: Complete Role Definitions

**Required** (not present):
```typescript
// packages/auth/roles.ts
export enum Role {
  OWNER = 'owner',       // Full system access
  EDITOR = 'editor',     // Can publish posts
  REVIEWER = 'reviewer', // Can approve/reject drafts
  AUTHOR = 'author'      // Can create drafts only
}

export const RolePermissions = {
  [Role.OWNER]: ['*'],
  [Role.EDITOR]: ['post:create', 'post:update', 'post:publish', 'post:delete'],
  [Role.REVIEWER]: ['post:review', 'post:approve', 'post:reject'],
  [Role.AUTHOR]: ['post:create', 'post:update:own']
};
```

**Impact**: HIGH - Cannot enforce RBAC without role definitions

---

### ✅ FOUND: Auth Package

**File**: `packages/auth/index.ts`
```typescript
export async function requireAdmin(authHeader: string | null) {
  if (!authHeader) {
    throw new Error('UNAUTHORIZED');
  }
  
  // JWT verification logic present
  // Role checking present but incomplete
}
```

**✅ Present**: Auth utilities exist  
**⚠️ Needs Extension**: Add role hierarchy and permission checks

---

## 3. Admin Posts UI

### ✅ FOUND: Posts API Endpoints

**Files**:
- `apps/admin/app/api/admin/posts/route.ts` ✅
- `apps/admin/app/api/admin/posts/[id]/route.ts` ✅

**File**: `apps/admin/app/api/admin/posts/route.ts:4-14`
```typescript
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAdmin(authHeader);
    
    // In a real implementation, this would fetch posts from the database
    return NextResponse.json({
      message: 'Posts retrieved successfully',
      user: user,
      posts: [] // placeholder
    });
```

**✅ Present**: API structure exists  
**❌ Incomplete**: Uses placeholder data, not connected to Prisma

---

### ❌ MISSING: Admin Posts UI Pages

**Expected Path** (not found): `apps/admin/app/(dashboard)/posts/`

**Required Files**:
```
apps/admin/app/(dashboard)/posts/
├── page.tsx              # List all posts
├── new/
│   └── page.tsx          # Create new post
├── [id]/
│   ├── page.tsx          # Edit post
│   └── translations/
│       └── [locale]/
│           └── page.tsx  # Edit translation
```

**Impact**: HIGH - No UI to manage content

---

## 4. Preview Route

### ❌ MISSING: Preview Route

**Expected Path** (not found): `apps/site/src/app/preview/route.ts`

**Required Implementation**:
```typescript
// apps/site/src/app/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const postId = searchParams.get('postId');
  const locale = searchParams.get('locale') || 'en';
  
  // Verify secret
  if (secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
  
  // Enable draft mode
  draftMode().enable();
  
  // Redirect to post
  return NextResponse.redirect(new URL(`/${locale}/blog/${postId}`, request.url));
}
```

**Impact**: HIGH - Cannot preview drafts before publishing

---

### ❌ MISSING: Draft Mode Data Fetching

**Expected in Post Pages** (not found):
```typescript
import { draftMode } from 'next/headers';

export default async function BlogPost({ params }) {
  const { isEnabled } = draftMode();
  const post = await getPost(params.slug, isEnabled);
  // ...
}
```

**Impact**: HIGH - Preview mode not functional without this

---

## 5. Publish + Revalidate

### ❌ MISSING: Publish Workflow

**Expected API** (not found): `apps/admin/app/api/admin/posts/[id]/publish/route.ts`

**Required Implementation**:
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('authorization');
  const user = await requireAdmin(authHeader);
  
  // Check permissions
  if (!hasPermission(user, 'post:publish')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Update post status
  await prisma.post.update({
    where: { id: params.id },
    data: { status: 'PUBLISHED', publishedAt: new Date() }
  });
  
  // Revalidate static pages
  await revalidatePath(`/en/blog/${postSlug}`);
  await revalidatePath(`/ar/blog/${postSlug}`);
  await revalidatePath('/en/blog');
  await revalidatePath('/ar/blog');
  
  return NextResponse.json({ success: true });
}
```

**Impact**: HIGH - Cannot publish content or trigger ISR

---

### ❌ MISSING: Revalidation Hooks

**Expected Utilities** (not found):
```typescript
// packages/utils/revalidate.ts
export async function revalidatePost(postSlug: string, locales: string[]) {
  for (const locale of locales) {
    await fetch(`${process.env.SITE_URL}/api/revalidate`, {
      method: 'POST',
      body: JSON.stringify({
        secret: process.env.REVALIDATE_SECRET,
        paths: [
          `/${locale}/blog/${postSlug}`,
          `/${locale}/blog`
        ]
      })
    });
  }
}
```

**Impact**: MEDIUM - Manual revalidation workarounds possible

---

## 6. Shared Contracts (Zod Schemas)

### ❌ MISSING: Validation Schemas

**Expected Package** (not found): `packages/schemas/`

**Required Schemas**:
```typescript
// packages/schemas/post.ts
import { z } from 'zod';

export const PostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string(),
  status: z.enum(['DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED']),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  authorId: z.string().cuid()
});

export const PostTranslationSchema = z.object({
  locale: z.enum(['en', 'ar']),
  title: z.string().min(1),
  slug: z.string(),
  content: z.string(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional()
});
```

**Impact**: MEDIUM - API validation and type safety

---

## 7. API Version Guards

### ❌ MISSING: API Versioning

**Expected Middleware** (not found): `apps/admin/middleware.ts` enhancement

**Required**:
```typescript
// API version header check
if (request.url.includes('/api/')) {
  const apiVersion = request.headers.get('X-API-Version');
  if (!apiVersion || !['v1', 'v2'].includes(apiVersion)) {
    return NextResponse.json(
      { error: 'API version required' },
      { status: 400 }
    );
  }
}
```

**Impact**: LOW - Nice to have for future compatibility

---

## Phase 6 Readiness Summary

### Found (30%)
| Component | Status | File Path |
|-----------|--------|-----------|
| Post model | ✅ Present | `packages/db/prisma/schema.prisma` |
| MediaAsset model | ✅ Present | `packages/db/prisma/schema.prisma` |
| PostMedia relation | ✅ Present | `packages/db/prisma/schema.prisma` |
| RLS policies (partial) | ⚠️ Incomplete | `packages/db/sql/rls-policies.sql` |
| Auth utilities | ⚠️ Needs extension | `packages/auth/index.ts` |
| Posts API skeleton | ⚠️ Placeholder | `apps/admin/app/api/admin/posts/` |

### Missing (70%)
| Component | Priority | Status |
|-----------|----------|--------|
| PostTranslation model | 🔴 HIGH | ❌ Not present |
| Audit log model | 🟡 MEDIUM | ❌ Not present |
| Role definitions | 🔴 HIGH | ❌ Not present |
| Permission system | 🔴 HIGH | ❌ Not present |
| Admin posts UI | 🔴 HIGH | ❌ Not present |
| Preview route | 🔴 HIGH | ❌ Not present |
| Draft mode integration | 🔴 HIGH | ❌ Not present |
| Publish API | 🔴 HIGH | ❌ Not present |
| Revalidation hooks | 🟡 MEDIUM | ❌ Not present |
| Zod schemas | 🟡 MEDIUM | ❌ Not present |
| API versioning | 🟢 LOW | ❌ Not present |

---

## Concrete Next PR: `feat/phase6-cms-rbac-preview-publish`

### File Changes Required

#### 1. Database Schema Updates
**File**: `packages/db/prisma/schema.prisma`
- [ ] Add `PostTranslation` model
- [ ] Add `Audit` model
- [ ] Add `User` model (if not exists)
- [ ] Update `Post` model (add publishedAt, publishedBy)
- [ ] Create migration: `002_post_translations_audit.sql`

#### 2. RBAC Implementation
**New Files**:
- [ ] `packages/auth/roles.ts` - Role definitions
- [ ] `packages/auth/permissions.ts` - Permission system
- [ ] `packages/auth/middleware.ts` - Role-based middleware

**Update Files**:
- [ ] `packages/auth/index.ts` - Add `requireRole()`, `hasPermission()`

#### 3. Admin Posts UI
**New Files**:
- [ ] `apps/admin/app/(dashboard)/posts/page.tsx` - List posts
- [ ] `apps/admin/app/(dashboard)/posts/new/page.tsx` - Create post
- [ ] `apps/admin/app/(dashboard)/posts/[id]/page.tsx` - Edit post
- [ ] `apps/admin/app/(dashboard)/posts/[id]/translations/[locale]/page.tsx` - Edit translation
- [ ] `apps/admin/components/PostEditor.tsx` - Rich text editor
- [ ] `apps/admin/components/PostList.tsx` - Post table
- [ ] `apps/admin/components/PublishModal.tsx` - Publish confirmation

#### 4. API Endpoints
**Update Files**:
- [ ] `apps/admin/app/api/admin/posts/route.ts` - Connect to Prisma
- [ ] `apps/admin/app/api/admin/posts/[id]/route.ts` - CRUD operations

**New Files**:
- [ ] `apps/admin/app/api/admin/posts/[id]/publish/route.ts` - Publish workflow
- [ ] `apps/admin/app/api/admin/posts/[id]/translations/route.ts` - Translation CRUD
- [ ] `apps/admin/app/api/audit/route.ts` - Audit log queries

#### 5. Preview System
**New Files**:
- [ ] `apps/site/src/app/preview/route.ts` - Preview mode enabler
- [ ] `apps/site/src/app/[locale]/blog/[slug]/page.tsx` - Blog post page (draft mode support)
- [ ] `apps/site/src/lib/posts.ts` - Post fetching with draft support

#### 6. Publish & Revalidate
**New Files**:
- [ ] `apps/site/src/app/api/revalidate/route.ts` - ISR revalidation endpoint
- [ ] `packages/utils/revalidate.ts` - Revalidation utilities

#### 7. Validation Schemas
**New Package**:
- [ ] `packages/schemas/package.json`
- [ ] `packages/schemas/post.ts` - Post schemas
- [ ] `packages/schemas/media.ts` - Media schemas
- [ ] `packages/schemas/audit.ts` - Audit schemas

#### 8. Environment Variables
**Update Files**:
- [ ] `env.production.example` - Add PREVIEW_SECRET, REVALIDATE_SECRET
- [ ] `apps/admin/.env.local.example` - Admin env vars
- [ ] `apps/site/.env.local.example` - Site env vars

---

## Estimated Effort

| Task | Complexity | Estimated Hours |
|------|------------|-----------------|
| Database schema + migrations | Medium | 8h |
| RBAC system | High | 16h |
| Admin posts UI | High | 24h |
| API endpoints | Medium | 12h |
| Preview system | Medium | 8h |
| Publish + revalidate | Medium | 8h |
| Validation schemas | Low | 4h |
| Testing | Medium | 12h |
| Documentation | Low | 4h |

**Total**: ~96 hours (~12 working days)

---

## Recommended Approach

### Sprint 1: Foundation (4 days)
1. Database schema updates
2. RBAC system implementation
3. API endpoint completion
4. Basic admin UI scaffolding

### Sprint 2: UI & Integration (4 days)
1. Complete admin posts UI
2. Preview system implementation
3. Rich text editor integration
4. Translation management

### Sprint 3: Publishing & Polish (4 days)
1. Publish workflow
2. Revalidation system
3. Validation schemas
4. E2E testing
5. Documentation

---

## Go/No-Go Recommendation

**Status**: 🟡 **NO-GO** - Not ready for Phase 6 without significant development

**Blockers**:
1. 🔴 Missing PostTranslation model - Cannot support bilingual content
2. 🔴 Missing RBAC implementation - Cannot enforce access control
3. 🔴 Missing admin UI - Cannot manage content
4. 🔴 Missing preview system - Cannot review before publish

**Recommendation**: Complete Phase 6 implementation before proceeding to Phase 6.5

**Alternative**: Consider simplified "Phase 6 Lite" with:
- Single-language posts only (defer translations)
- Admin-only access (defer RBAC)
- Manual revalidation (defer auto-revalidate)

This would reduce effort to ~48 hours (1 week) and allow faster iteration.

