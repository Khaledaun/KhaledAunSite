# PR #6: Phase 8 Full — Social Embed Schema

**Branch:** `feat/phase8-social-schema`  
**Status:** ✅ **COMPLETE**  
**Date:** October 16, 2024

---

## 🎯 **OBJECTIVE**

Add database-driven social media embeds with server-side storage and enable/disable toggle.

---

## 📝 **CHANGES MADE**

### **1. Schema Addition** (`packages/db/prisma/schema.prisma`)

**New Model:**
```prisma
// Phase 8 Full: Social Media Embeds
model SocialEmbed {
  id        String   @id @default(cuid())
  key       String   @unique            // e.g. "LINKEDIN_WALL"
  html      String                      // sanitized embed HTML
  enabled   Boolean  @default(true)
  updatedBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("social_embeds")
}
```

**Key Features:**
- ✅ `key` field with unique constraint (e.g., "LINKEDIN_WALL", "TWITTER_FEED")
- ✅ `html` field for sanitized embed code
- ✅ `enabled` boolean for show/hide toggle
- ✅ `updatedBy` to track last editor
- ✅ Timestamps for audit trail

---

### **2. Seed Update** (`packages/db/seed.ts`)

**Added placeholder seed:**
```typescript
const linkedinEmbed = await prisma.socialEmbed.upsert({
  where: { key: 'LINKEDIN_WALL' },
  update: {},
  create: {
    key: 'LINKEDIN_WALL',
    html: '<!-- Placeholder: Add LinkedIn embed code here -->',
    enabled: false,
    updatedBy: admin.id,
  },
});
```

**Purpose:**
- Creates disabled LINKEDIN_WALL placeholder for testing
- Idempotent (uses upsert)
- Safe to run multiple times

---

## 📊 **FILES TOUCHED**

| File | Status | Lines Changed |
|------|--------|---------------|
| `packages/db/prisma/schema.prisma` | Modified | +12 |
| `packages/db/seed.ts` | Modified | +13 |

**Total:** 2 files, 25 lines added

---

## ✅ **ACCEPTANCE CRITERIA**

- [x] SocialEmbed model added to schema
- [x] `key` field has unique constraint
- [x] `enabled` defaults to true
- [x] Timestamps included (createdAt, updatedAt)
- [x] Seed creates LINKEDIN_WALL placeholder
- [x] Prisma generates client successfully

---

## 🚀 **MIGRATION STEPS**

```bash
cd packages/db

# Push schema to database
pnpm db:push

# Expected output:
# ✔ Generated Prisma Client
# 🚀 Your database is now in sync

# Run seed (optional, creates placeholder)
pnpm db:seed

# Expected output:
# ✅ Social embed placeholder created: LINKEDIN_WALL
```

**Verification:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM social_embeds;

-- Should show:
-- LINKEDIN_WALL | <!-- Placeholder... --> | false
```

---

## 🎯 **USE CASES**

### **Use Case 1: LinkedIn Company Wall**
```typescript
{
  key: "LINKEDIN_WALL",
  html: "<iframe src='https://linkedin.com/embed/...' />",
  enabled: true
}
```

### **Use Case 2: Twitter/X Feed**
```typescript
{
  key: "TWITTER_FEED",
  html: "<a class='twitter-timeline' href='...' />",
  enabled: true
}
```

### **Use Case 3: Instagram Grid**
```typescript
{
  key: "INSTAGRAM_GRID",
  html: "<div id='curator-feed-...' />",
  enabled: false  // Temporarily disabled
}
```

---

## 📋 **NEXT STEPS (PR #7)**

- Create sanitization utility
- Build admin CRUD UI
- Implement RBAC (EDITOR+ create/edit, ADMIN+ delete)
- Add API routes for social embed management

---

**PR #6 Status:** ✅ **COMPLETE — READY FOR PR #7**

**Commits:**
```
feat(db): add SocialEmbed model for Phase 8 Full
```

