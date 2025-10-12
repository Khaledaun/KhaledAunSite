# Phase 6.5 Readiness - Media Library + Rich Blocks + Publish Guards

**Date**: October 12, 2025  
**Phase**: Phase 6.5 - Advanced Media Management & Content Blocks  
**Status**: 🔴 **NOT READY** (10% complete)

---

## Overview

Phase 6.5 extends Phase 6 with:
1. **Media Library**: Admin UI for media management
2. **Rich Content Blocks**: Image/gallery/embed blocks in posts
3. **Per-Locale ALT Text**: Bilingual image alt text
4. **Publish Guards**: Pre-publish validation (ALT text, broken images, size/ratio)

---

## 1. Media Library - Admin UI

### ❌ MISSING: Media Management Pages

**Expected Path** (not found): `apps/admin/app/(dashboard)/media/`

**Required Files**:
```
apps/admin/app/(dashboard)/media/
├── page.tsx              # Media library grid
├── upload/
│   └── page.tsx          # Bulk upload interface
└── [id]/
    └── page.tsx          # Edit media metadata
```

**Impact**: HIGH - Cannot manage media assets via UI

---

### ❌ MISSING: Supabase Storage Integration

**Expected File** (not found): `packages/utils/storage.ts`

**Required**:
```typescript
// packages/utils/storage.ts
import { createClient } from '@supabase/supabase-js';

export async function uploadMedia(
  file: File,
  bucket: string = 'media'
): Promise<{ url: string; path: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const filename = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);
  
  return { url: publicUrl, path: filename };
}
```

**Impact**: HIGH - Cannot upload/store media

---

### ❌ MISSING: Media API Endpoints

**Expected Files** (not found):
- `apps/admin/app/api/media/route.ts` - List/upload media
- `apps/admin/app/api/media/[id]/route.ts` - Update/delete media

**Impact**: HIGH - No backend for media operations

---

## 2. Media Metadata Tables

### ⚠️ PARTIAL: MediaAsset Model Exists

**File**: `packages/db/prisma/schema.prisma:27-41`
```prisma
model MediaAsset {
  id          String      @id @default(cuid())
  filename    String
  url         String
  mimeType    String
  size        Int
  alt         String?      // ⚠️ Single locale only
  caption     String?      // ⚠️ Single locale only
  status      String      @default("ACTIVE")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  PostMedia   PostMedia[]

  @@map("media_assets")
}
```

**✅ Present**: Basic media model  
**❌ Missing**: Per-locale ALT text support

---

### ❌ MISSING: Media i18n Table

**Required Schema** (not present):
```prisma
model MediaTranslation {
  id          String      @id @default(cuid())
  mediaId     String
  locale      String      // 'en' or 'ar'
  alt         String
  caption     String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  media       MediaAsset  @relation(fields: [mediaId], references: [id], onDelete: Cascade)

  @@unique([mediaId, locale])
  @@map("media_translations")
}
```

**Impact**: HIGH - Cannot enforce bilingual ALT text

---

### ❌ MISSING: Media Usage Tracking

**Required Schema** (not present):
```prisma
model MediaUsage {
  id          String      @id @default(cuid())
  mediaId     String
  entityType  String      // "post", "page", etc.
  entityId    String
  createdAt   DateTime    @default(now())
  
  media       MediaAsset  @relation(fields: [mediaId], references: [id])

  @@unique([mediaId, entityType, entityId])
  @@map("media_usage")
}
```

**Impact**: MEDIUM - Cannot track where media is used (prevents accidental deletion)

---

## 3. Rich Content Blocks

### ❌ MISSING: Content Block Schema

**Expected in PostTranslation.content** (not implemented):
```typescript
// Content structure (JSON)
{
  "blocks": [
    {
      "id": "uuid",
      "type": "paragraph",
      "content": "Text content..."
    },
    {
      "id": "uuid",
      "type": "image",
      "mediaId": "media-uuid",
      "caption": "Image caption",
      "alignment": "center"
    },
    {
      "id": "uuid",
      "type": "gallery",
      "images": ["media-uuid-1", "media-uuid-2"],
      "layout": "grid"
    },
    {
      "id": "uuid",
      "type": "embed",
      "provider": "youtube",
      "url": "https://youtube.com/watch?v=..."
    }
  ]
}
```

**Impact**: HIGH - Cannot support rich content in posts

---

### ❌ MISSING: Block Editor Component

**Expected File** (not found): `apps/admin/components/BlockEditor.tsx`

**Required Features**:
- Drag-and-drop block reordering
- Image block with media picker
- Gallery block with multi-select
- Embed block with URL validation
- Block-level toolbar

**Impact**: HIGH - No UI for structured content

---

### ❌ MISSING: Block Renderer (Site)

**Expected File** (not found): `apps/site/src/components/blocks/`

**Required Components**:
```
apps/site/src/components/blocks/
├── BlockRenderer.tsx      # Main renderer
├── ParagraphBlock.tsx
├── ImageBlock.tsx
├── GalleryBlock.tsx
└── EmbedBlock.tsx
```

**Impact**: HIGH - Cannot display rich content on site

---

## 4. Per-Locale ALT Text Enforcement

### ❌ MISSING: ALT Text Validation

**Expected in Editor** (not implemented):
```typescript
// Validation on image block insertion
function validateImageBlock(block: ImageBlock, locale: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const media = await getMediaWithTranslations(block.mediaId);
  const translation = media.translations.find(t => t.locale === locale);
  
  if (!translation || !translation.alt) {
    errors.push({
      type: 'missing_alt_text',
      blockId: block.id,
      message: `Missing ALT text for ${locale} locale`
    });
  }
  
  return errors;
}
```

**Impact**: MEDIUM - Cannot enforce accessibility

---

### ❌ MISSING: Media Translation UI

**Expected in Media Library** (not found):
```typescript
// Edit media dialog with locale tabs
<MediaEditDialog>
  <Tabs>
    <Tab value="en">English</Tab>
    <Tab value="ar">العربية</Tab>
  </Tabs>
  <TabPanel value="en">
    <Input label="ALT Text" name="alt_en" required />
    <Textarea label="Caption" name="caption_en" />
  </TabPanel>
  <TabPanel value="ar">
    <Input label="نص بديل" name="alt_ar" required dir="rtl" />
    <Textarea label="التسمية" name="caption_ar" dir="rtl" />
  </TabPanel>
</MediaEditDialog>
```

**Impact**: HIGH - Cannot add bilingual ALT text

---

## 5. Publish Guards

### ❌ MISSING: Pre-Publish Validation

**Expected API** (not found): `apps/admin/app/api/admin/posts/[id]/validate/route.ts`

**Required Checks**:
```typescript
export async function POST(request: NextRequest, { params }) {
  const post = await getPostWithTranslations(params.id);
  const errors: ValidationError[] = [];
  
  // Check 1: All locales have content
  for (const locale of ['en', 'ar']) {
    const translation = post.translations.find(t => t.locale === locale);
    if (!translation || !translation.content) {
      errors.push({
        type: 'missing_translation',
        locale,
        message: `Missing ${locale} translation`
      });
    }
  }
  
  // Check 2: All images have ALT text
  const blocks = extractBlocks(post.translations);
  const imageBlocks = blocks.filter(b => b.type === 'image');
  
  for (const block of imageBlocks) {
    const media = await getMediaWithTranslations(block.mediaId);
    for (const locale of ['en', 'ar']) {
      const translation = media.translations.find(t => t.locale === locale);
      if (!translation || !translation.alt) {
        errors.push({
          type: 'missing_alt_text',
          blockId: block.id,
          mediaId: block.mediaId,
          locale,
          message: `Image missing ALT text for ${locale}`
        });
      }
    }
  }
  
  // Check 3: Broken image URLs
  for (const block of imageBlocks) {
    const media = await getMedia(block.mediaId);
    const isAccessible = await checkImageUrl(media.url);
    if (!isAccessible) {
      errors.push({
        type: 'broken_image',
        blockId: block.id,
        mediaId: block.mediaId,
        message: 'Image URL not accessible'
      });
    }
  }
  
  // Check 4: Image size/ratio validation
  for (const block of imageBlocks) {
    const media = await getMedia(block.mediaId);
    if (media.size > 5 * 1024 * 1024) { // 5MB
      errors.push({
        type: 'image_too_large',
        blockId: block.id,
        mediaId: block.mediaId,
        message: `Image exceeds 5MB (${formatBytes(media.size)})`
      });
    }
  }
  
  return NextResponse.json({
    valid: errors.length === 0,
    errors
  });
}
```

**Impact**: HIGH - Cannot prevent publishing incomplete content

---

### ❌ MISSING: Publish Guard UI

**Expected in PublishModal** (not found):
```typescript
// apps/admin/components/PublishModal.tsx
function PublishModal({ postId }: { postId: string }) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  
  useEffect(() => {
    fetch(`/api/admin/posts/${postId}/validate`)
      .then(r => r.json())
      .then(setValidation);
  }, [postId]);
  
  if (!validation?.valid) {
    return (
      <Dialog>
        <Title>Cannot Publish</Title>
        <ErrorList errors={validation.errors} />
        <Button onClick={onClose}>Fix Issues</Button>
      </Dialog>
    );
  }
  
  return (
    <Dialog>
      <Title>Ready to Publish</Title>
      <Button onClick={handlePublish}>Publish Now</Button>
    </Dialog>
  );
}
```

**Impact**: HIGH - No user feedback for validation errors

---

## Phase 6.5 Readiness Summary

### Found (10%)
| Component | Status | Notes |
|-----------|--------|-------|
| MediaAsset model | ✅ Basic | Missing i18n support |
| PostMedia relation | ✅ Present | Links posts to media |

### Missing (90%)
| Component | Priority | Status |
|-----------|----------|--------|
| Media Library UI | 🔴 HIGH | ❌ Not present |
| Supabase Storage integration | 🔴 HIGH | ❌ Not present |
| Media API endpoints | 🔴 HIGH | ❌ Not present |
| MediaTranslation model | 🔴 HIGH | ❌ Not present |
| MediaUsage tracking | 🟡 MEDIUM | ❌ Not present |
| Block content schema | 🔴 HIGH | ❌ Not present |
| Block Editor component | 🔴 HIGH | ❌ Not present |
| Block Renderer (site) | 🔴 HIGH | ❌ Not present |
| ALT text validation | 🟡 MEDIUM | ❌ Not present |
| Pre-publish validation API | 🔴 HIGH | ❌ Not present |
| Publish guard UI | 🔴 HIGH | ❌ Not present |

---

## Concrete Next PR: `feat/phase6_5-media-library-and-rich-editor`

### Dependencies
- ⚠️ **BLOCKED by Phase 6** - Requires PostTranslation model and admin UI foundation

### File Changes Required

#### 1. Database Schema
- [ ] Add `MediaTranslation` model
- [ ] Add `MediaUsage` model
- [ ] Update `MediaAsset` (remove single alt/caption, add dimensions)
- [ ] Create migration: `003_media_i18n.sql`

#### 2. Supabase Storage
- [ ] Create `media` bucket in Supabase
- [ ] Set up RLS policies for storage
- [ ] Implement `packages/utils/storage.ts`

#### 3. Media Library UI
- [ ] `apps/admin/app/(dashboard)/media/page.tsx` - Grid view
- [ ] `apps/admin/app/(dashboard)/media/upload/page.tsx` - Upload interface
- [ ] `apps/admin/components/MediaGrid.tsx` - Media browser
- [ ] `apps/admin/components/MediaEditDialog.tsx` - Edit with locale tabs
- [ ] `apps/admin/components/MediaUploader.tsx` - Drag-drop uploader

#### 4. Media API
- [ ] `apps/admin/app/api/media/route.ts` - List, upload
- [ ] `apps/admin/app/api/media/[id]/route.ts` - CRUD
- [ ] `apps/admin/app/api/media/[id]/translations/route.ts` - i18n CRUD

#### 5. Block Editor
- [ ] `apps/admin/components/BlockEditor.tsx` - Main editor
- [ ] `apps/admin/components/blocks/ImageBlock.tsx` - Image editor
- [ ] `apps/admin/components/blocks/GalleryBlock.tsx` - Gallery editor
- [ ] `apps/admin/components/blocks/EmbedBlock.tsx` - Embed editor
- [ ] `apps/admin/components/MediaPicker.tsx` - Modal media picker

#### 6. Site Block Renderer
- [ ] `apps/site/src/components/blocks/BlockRenderer.tsx`
- [ ] `apps/site/src/components/blocks/ImageBlock.tsx`
- [ ] `apps/site/src/components/blocks/GalleryBlock.tsx`
- [ ] `apps/site/src/components/blocks/EmbedBlock.tsx`

#### 7. Validation System
- [ ] `apps/admin/app/api/admin/posts/[id]/validate/route.ts`
- [ ] `packages/utils/validation.ts` - Validation utilities
- [ ] `apps/admin/components/PublishModal.tsx` - Guard UI

---

## Estimated Effort

| Task | Complexity | Estimated Hours |
|------|------------|-----------------|
| Database schema + Supabase Storage | Medium | 8h |
| Media Library UI | High | 20h |
| Media API endpoints | Medium | 12h |
| Block Editor | High | 32h |
| Block Renderer (site) | Medium | 12h |
| Validation system | Medium | 12h |
| Testing | Medium | 12h |

**Total**: ~108 hours (~13.5 working days)

---

## Go/No-Go Recommendation

**Status**: 🔴 **NO-GO** - Cannot start without Phase 6 completion

**Blockers**:
1. 🔴 Phase 6 not complete - No PostTranslation model
2. 🔴 No admin UI foundation - Cannot build media library
3. 🔴 No Supabase Storage setup - Cannot store files

**Recommendation**: Complete Phase 6 first, then tackle Phase 6.5

**Note**: Phase 6.5 is optional - basic CMS can work with simple text content. Consider deferring until Phase 6 is stable.

