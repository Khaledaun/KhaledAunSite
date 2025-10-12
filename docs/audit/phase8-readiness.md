# Phase 8 Readiness - LinkedIn Embeds (Curated or Wall Provider)

**Date**: October 12, 2025  
**Phase**: Phase 8 - Social Media Integration (LinkedIn)  
**Status**: 🟡 **PARTIALLY READY** (20% complete)

---

## Overview

Phase 8 adds LinkedIn integration:
1. **Curated Embeds**: Manually selected LinkedIn posts
2. **Social Wall Provider**: Third-party embed (Taggbox, Walls.io)
3. **Admin Social Page**: Manage LinkedIn embeds
4. **Feature Flags**: `FF_SOCIAL_LINKEDIN`, `FF_SOCIAL_WALL`

---

## 1. Site Integration

### ✅ FOUND: LinkedInSection Component

**File**: `apps/site/src/components/site/LinkedInSection.js` ✅

**✅ Present**: Component exists and renders on homepage  
**⚠️ Unknown**: Check if it supports dynamic embeds or uses hardcoded posts

---

### ❌ MISSING: Dynamic Embed Configuration

**Expected**: Database-driven or config-based embeds

**Required Schema**:
```prisma
model SocialEmbed {
  id          String   @id @default(cuid())
  platform    String   // "linkedin"
  type        String   // "post", "wall"
  embedCode   String   // HTML embed code
  url         String?  // Original URL
  order       Int      @default(0)
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("social_embeds")
}
```

**Impact**: MEDIUM - Currently likely using hardcoded posts

---

### ❌ MISSING: Feature Flag Implementation

**Expected in Site**:
```typescript
// apps/site/src/app/[locale]/(site)/page.js
export default function Home() {
  const showLinkedIn = process.env.NEXT_PUBLIC_FF_SOCIAL_LINKEDIN === 'true';
  const showWall = process.env.NEXT_PUBLIC_FF_SOCIAL_WALL === 'true';
  
  return (
    <>
      {/* ... */}
      {showLinkedIn && <LinkedInSection />}
      {/* ... */}
    </>
  );
}
```

**Impact**: LOW - Easy to add

---

## 2. Admin Social Page

### ❌ MISSING: Social Management UI

**Expected Path** (not found): `apps/admin/app/(dashboard)/social/`

**Required Files**:
```
apps/admin/app/(dashboard)/social/
├── page.tsx              # Overview (LinkedIn, Twitter, etc.)
├── linkedin/
│   ├── page.tsx          # Manage LinkedIn embeds
│   ├── curated/
│   │   └── page.tsx      # Add/edit curated posts
│   └── wall/
│       └── page.tsx      # Configure social wall
```

**Impact**: HIGH - Cannot manage embeds without this

---

## 3. Social Wall Configuration

### ❌ MISSING: Wall Embed Storage

**Expected Options**:

**Option A: Environment Variable**
```bash
# apps/site/.env.local
NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML='<iframe src="https://walls.io/...">'
```

**Option B: Database Config**
```prisma
model SiteConfig {
  key         String   @id
  value       String
  description String?
  updatedAt   DateTime @updatedAt

  @@map("site_config")
}

// INSERT: key='linkedin_wall_embed', value='<iframe...>'
```

**Option C: Supabase Storage JSON**
```json
// bucket: config
// file: site.json
{
  "social": {
    "linkedin": {
      "enabled": true,
      "wallEmbedHtml": "<iframe src='https://walls.io/...'>",
      "curatedPosts": []
    }
  }
}
```

**Impact**: MEDIUM - Need to decide on configuration strategy

---

## 4. Curated Embed Config

### ❌ MISSING: Curated Posts Management

**Expected API**:
```
POST /api/admin/social/linkedin/posts
```

**Expected Workflow**:
1. Admin pastes LinkedIn post URL
2. System fetches oEmbed data (or uses LinkedIn API)
3. Stores embed code in database
4. Renders on site via LinkedInSection

**Impact**: MEDIUM - Currently no way to add new posts dynamically

---

## Phase 8 Readiness Summary

### Found (20%)
| Component | Status | Notes |
|-----------|--------|-------|
| LinkedInSection component | ✅ Present | On homepage |
| LinkedIn in messages | ✅ Present | Translation keys exist |

### Missing (80%)
| Component | Priority | Status |
|-----------|----------|--------|
| SocialEmbed model | 🟡 MEDIUM | ❌ Not present |
| Admin social UI | 🔴 HIGH | ❌ Not present |
| Social API endpoints | 🔴 HIGH | ❌ Not present |
| Wall embed configuration | 🟡 MEDIUM | ❌ Not present |
| Curated posts management | 🟡 MEDIUM | ❌ Not present |
| Feature flags | 🟢 LOW | ❌ Not present |
| Dynamic embed rendering | 🟡 MEDIUM | ❌ Not present |

---

## Concrete Next PR: `feat/phase8-social-linkedin-embeds`

### Dependencies
- ⚠️ **BLOCKED by Phase 6** - Needs admin UI foundation

### File Changes Required

#### 1. Database (if using DB config)
- [ ] Add `SocialEmbed` model or `SiteConfig` model
- [ ] Create migration

#### 2. Admin UI
- [ ] `apps/admin/app/(dashboard)/social/page.tsx`
- [ ] `apps/admin/app/(dashboard)/social/linkedin/page.tsx`
- [ ] `apps/admin/components/LinkedInEmbedForm.tsx`

#### 3. API
- [ ] `apps/admin/app/api/social/linkedin/posts/route.ts` - CRUD
- [ ] `apps/admin/app/api/social/linkedin/wall/route.ts` - Wall config

#### 4. Site Integration
- [ ] Update `LinkedInSection.js` to fetch dynamic embeds
- [ ] Add feature flag checks
- [ ] Support both curated and wall modes

#### 5. Configuration
- [ ] Add `FF_SOCIAL_LINKEDIN` and `FF_SOCIAL_WALL` to env

---

## Estimated Effort
- **Total**: ~40 hours (~5 working days)
- Database + API: 8h
- Admin UI: 16h
- Site integration: 12h
- Testing: 4h

---

## Go/No-Go Recommendation

**Status**: 🟡 **PARTIAL GO** - Can implement with manual workaround

**Current State**: LinkedIn section exists but likely hardcoded

**Quick Win**: Use environment variable for wall embed
```bash
# apps/site/.env.local
NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML='<iframe>...</iframe>'
```

Update `LinkedInSection.js`:
```javascript
const wallHtml = process.env.NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML;
if (wallHtml) {
  return <div dangerouslySetInnerHTML={{ __html: wallHtml }} />;
}
```

**Full Implementation**: Wait for Phase 6 admin UI to build proper management interface

**Recommendation**: 
- ✅ **GO** for manual configuration (env var)
- 🔴 **NO-GO** for admin UI (wait for Phase 6)

