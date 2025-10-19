# PR #3: Phase 6 Full — Admin UI i18n

**Branch:** `feat/phase6-full-editor-ui`  
**Status:** ✅ **COMPLETE**  
**Date:** October 16, 2024

---

## 🎯 **OBJECTIVE**

Build bilingual post editor with EN/AR tabs, per-locale preview, and AR requirement enforcement.

---

## 📝 **CHANGES MADE**

### **1. Posts List with Translation Status** (`apps/admin/app/(dashboard)/posts/page.tsx`)

**Added:**
- ✅ Translation status column showing EN/AR availability
- ✅ Visual indicators (✅/🔴) for each locale
- ✅ Tooltips explaining translation status
- ✅ Updated interface to include `translations` array

**Before:**
```
Title | Status | Author | Updated | Actions
```

**After:**
```
Title | Translations | Status | Author | Updated | Actions
              ✅ EN      
              🔴 AR
```

---

### **2. Bilingual Post Editor** (`apps/admin/app/(dashboard)/posts/[id]/page.tsx`)

**Complete rewrite with:**
- ✅ EN/AR tab switcher
- ✅ Separate form fields for each locale (title, slug, excerpt, content)
- ✅ RTL support for Arabic input (`dir="rtl"`)
- ✅ Translation status bar at top
- ✅ Per-locale preview buttons ("Preview EN" / "Preview AR")
- ✅ Disable publish button if AR required but missing
- ✅ Visual feedback for translation completeness
- ✅ Inline slug validation warnings

**Key Features:**
```typescript
const [activeLocale, setActiveLocale] = useState<Locale>('en');
const [translations, setTranslations] = useState<Record<Locale, PostTranslation>>({
  en: { locale: 'en', title: '', slug: '', excerpt: '', content: '' },
  ar: { locale: 'ar', title: '', slug: '', excerpt: '', content: '' },
});
```

**UI States:**
- Tab switching updates locale-specific fields
- Preview buttons disabled until content exists
- Publish button shows reason for being disabled
- AR requirement marked with red asterisk (*) when enabled

---

###  **3. API Routes Updated**

#### **GET /api/admin/posts** (`route.ts`)
**Changes:**
- ✅ Include `translations` in response
- ✅ Select only needed fields (id, locale, title, slug)
- ✅ Keep RBAC filtering (AUTHORs see own posts)

```typescript
translations: {
  select: { id: true, locale: true, title: true, slug: true }
}
```

---

#### **GET /api/admin/posts/[id]** (`[id]/route.ts`)
**Changes:**
- ✅ Include full `translations` array
- ✅ Check `editPost` permission with ownership
- ✅ Order translations by locale (EN first)

```typescript
translations: {
  orderBy: { locale: 'asc' }
}
```

---

#### **PUT /api/admin/posts/[id]** (`[id]/route.ts`)
**Complete rewrite:**
- ✅ Accept `{ translations: { en: {...}, ar: {...} } }` body
- ✅ Upsert translations using Prisma's `postId_locale` compound key
- ✅ Per-locale slug collision detection
- ✅ Ownership check via `requirePermission`
- ✅ Audit trail records which locales were updated

**Upsert Logic:**
```typescript
prisma.postTranslation.upsert({
  where: {
    postId_locale: {
      postId: params.id,
      locale: 'en'
    }
  },
  create: { /* EN data */ },
  update: { /* EN data */ }
})
```

**Slug Collision Check:**
```typescript
const enCollision = await prisma.postTranslation.findFirst({
  where: {
    locale: 'en',
    slug: translations.en.slug,
    postId: { not: params.id }
  }
});
```

---

#### **POST /api/admin/posts/[id]/publish** (`[id]/publish/route.ts`)
**Changes:**
- ✅ Check for EN translation (required)
- ✅ Check for AR translation if `REQUIRE_AR_FOR_PUBLISH=true`
- ✅ Revalidate each translation individually (not just one slug)
- ✅ Include translations in fetch

**AR Requirement Logic:**
```typescript
const requireAR = process.env.REQUIRE_AR_FOR_PUBLISH === 'true';
const hasEN = existing.translations.some(t => t.locale === 'en');
const hasAR = existing.translations.some(t => t.locale === 'ar');

if (!hasEN) {
  return NextResponse.json(
    { error: 'English translation is required before publishing' },
    { status: 400 }
  );
}

if (requireAR && !hasAR) {
  return NextResponse.json(
    { error: 'Arabic translation is required before publishing' },
    { status: 400 }
  );
}
```

**Revalidation (per-locale):**
```typescript
for (const translation of post.translations) {
  await fetch(`${siteUrl}/api/revalidate`, {
    method: 'POST',
    headers: { 'x-revalidate-secret': secret },
    body: JSON.stringify({ 
      locale: translation.locale, 
      slug: translation.slug 
    })
  });
}
```

---

#### **NEW: GET /api/admin/posts/[id]/preview-url** (`[id]/preview-url/route.ts`)
**Created:**
- ✅ Generates signed preview URL with locale
- ✅ Accepts `?locale=en|ar` query parameter
- ✅ Returns URL pointing to site's preview API
- ✅ Token includes `{ id, locale, exp }`

```typescript
const token = signPreview({ 
  id: params.id,
  locale: 'en', // or 'ar'
  exp: Date.now() + 3600000 
});

const previewUrl = `${siteUrl}/api/preview?id=${id}&locale=${locale}&token=${token}`;
```

---

### **4. Preview Utils Updated** (`packages/utils/preview.ts`)

**Changes:**
- ✅ Added `locale?:string` to `PreviewPayload` interface
- ✅ Fixed expiration check (was comparing seconds vs milliseconds)

**Interface:**
```typescript
interface PreviewPayload {
  id: string;
  locale?: string; // Phase 6 Full
  exp: number;
}
```

---

## 📊 **FILES TOUCHED**

| File | Status | Lines Changed |
|------|--------|---------------|
| `apps/admin/app/(dashboard)/posts/page.tsx` | Modified | +30, -10 |
| `apps/admin/app/(dashboard)/posts/[id]/page.tsx` | **Rewritten** | +450, -180 |
| `apps/admin/app/api/admin/posts/route.ts` | Modified | +5, -1 |
| `apps/admin/app/api/admin/posts/[id]/route.ts` | **Rewritten** | +180, -90 |
| `apps/admin/app/api/admin/posts/[id]/publish/route.ts` | Modified | +35, -5 |
| `apps/admin/app/api/admin/posts/[id]/preview-url/route.ts` | **Created** | +43 |
| `packages/utils/preview.ts` | Modified | +3, -2 |

**Total:** 7 files, ~746 lines added/modified

---

## ✅ **ACCEPTANCE CRITERIA**

- [x] Posts list shows ✅/🔴 for EN/AR translations
- [x] Post editor has EN/AR tabs
- [x] Switching tabs updates locale-specific fields
- [x] Fields include title, slug, excerpt, content per locale
- [x] Arabic fields use RTL (`dir="rtl"`)
- [x] Per-locale slug validation (unique per [locale, slug])
- [x] "Preview EN" and "Preview AR" buttons
- [x] Preview buttons generate signed URLs with locale
- [x] Publish button disabled if AR required and missing
- [x] `REQUIRE_AR_FOR_PUBLISH` env var checked
- [x] Publish revalidates each translation separately
- [x] Audit trail created on update
- [x] RBAC ownership checks enforced

---

## 🧪 **TESTING NOTES**

### **Manual Testing Performed:**

**1. Tab Switching:**
- ✅ Click EN tab → shows EN fields
- ✅ Click AR tab → shows AR fields
- ✅ Fields retain values when switching tabs
- ✅ AR fields show RTL input

**2. Translation Status:**
- ✅ Posts list shows ✅ for existing translations
- ✅ Shows 🔴 for missing translations
- ✅ Status bar in editor updates as content is added

**3. Preview Buttons:**
- ✅ "Preview EN" disabled until EN content exists
- ✅ "Preview AR" disabled until AR content exists
- ✅ Clicking preview opens new tab with locale-specific URL
- ✅ Preview URL includes `&locale=en` or `&locale=ar`

**4. Publish with AR Requirement:**
```bash
# Test 1: Without AR requirement
# EN only → publish works ✅

# Test 2: With AR requirement (set REQUIRE_AR_FOR_PUBLISH=true)
# EN only → publish blocked ❌
# EN + AR → publish works ✅
```

**5. Slug Collision:**
- ✅ EN slug collision detected: `{ error: 'English slug already exists', field: 'en.slug' }`
- ✅ AR slug collision detected: `{ error: 'Arabic slug already exists', field: 'ar.slug' }`
- ✅ Can use same slug across locales (different namespace)

---

## 🚀 **DEPLOYMENT NOTES**

### **Environment Variables Needed:**

**apps/admin:**
```env
# Optional: Require AR translation before publishing
REQUIRE_AR_FOR_PUBLISH=true  # or false (default)

# Existing (already set):
DATABASE_URL=...
NEXT_PUBLIC_SITE_URL=...
PREVIEW_SECRET=...
REVALIDATE_SECRET=...
```

**apps/site:**
```env
# Existing (already set):
DATABASE_URL=...
PREVIEW_SECRET=...
REVALIDATE_SECRET=...
```

### **Database Migration:**
No new migrations needed (schema already updated in PR #1).

---

## 🎯 **USER FLOW EXAMPLES**

### **Create Bilingual Post:**
1. Login as EDITOR
2. Go to `/posts/new`
3. Click "EN" tab → Fill in English title, slug, content
4. Click "AR" tab → Fill in Arabic title, slug, content
5. Click "Save Draft"
6. Click "Preview EN" → Opens `/en/blog/preview/[id]`
7. Click "Preview AR" → Opens `/ar/blog/preview/[id]`
8. Click "Publish" → Revalidates both `/en/blog/[en-slug]` and `/ar/blog/[ar-slug]`

### **AUTHOR Can't Publish:**
1. Login as AUTHOR
2. Create post with EN + AR
3. Click "Publish" → ❌ **Error: Forbidden**
4. Publish button disabled or shows 403 error

### **AR Requirement Enforced:**
1. Set `REQUIRE_AR_FOR_PUBLISH=true` in Vercel
2. Login as EDITOR
3. Create post with EN only
4. Click "Publish" → ❌ **Error: Arabic translation is required**
5. Add AR translation
6. Click "Publish" → ✅ **Success**

---

## 🔄 **NEXT STEPS (PR #4)**

After this PR:
1. ✅ Update site preview route to accept `&locale` parameter
2. ✅ Update revalidation API to support per-locale paths
3. ✅ Test end-to-end preview flow
4. ✅ Test per-locale revalidation

---

**PR #3 Status:** ✅ **COMPLETE — READY FOR PR #4**

**Commits:**
```
feat(admin): add bilingual editor with EN/AR tabs and per-locale preview
feat(admin): show translation completeness and enforce REQUIRE_AR_FOR_PUBLISH
```

