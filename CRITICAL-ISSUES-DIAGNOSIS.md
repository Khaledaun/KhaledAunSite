# 🚨 CRITICAL ISSUES DIAGNOSIS

## Current Status: Both Issues Still Failing

### Issue 1: Social Media Icons Invisible ❌
- Environment variables ARE set in Vercel
- Code has correct inline styles
- **But icons still not rendering**

### Issue 2: Arabic Site in English ❌
- URL shows `/ar` correctly
- i18n middleware updated
- Messages exist in `ar.json`
- **But content still in English**

---

## 🔍 ROOT CAUSE ANALYSIS

### Problem: Static Site Generation (SSG) Issue

**What's Happening:**
1. Next.js is pre-rendering pages at BUILD TIME
2. Environment variables might not be available during build
3. Locale is hardcoded to 'en' during static generation
4. Pages are cached with English content

**Evidence:**
- `unstable_setRequestLocale()` is deprecated
- `generateStaticParams()` generates both locales at build time
- Components use `'use client'` but rely on server context

---

## 🔧 COMPREHENSIVE FIX REQUIRED

### Fix 1: Force Dynamic Rendering for All Pages

**File:** `apps/site/src/app/[locale]/(site)/page.js`

Add at the top:
```javascript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### Fix 2: Remove Unstable API

**File:** Same as above

Remove:
```javascript
unstable_setRequestLocale(locale);
```

### Fix 3: Make Header Dynamic

**File:** `apps/site/src/components/site/Header.js`

The issue is `process.env.NEXT_PUBLIC_*` vars are evaluated at BUILD time for client components.

Change from:
```javascript
{process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
```

To:
```javascript
{typeof window !== 'undefined' && process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
```

OR better - pass env vars from server component.

### Fix 4: Update Next.js i18n Config

**File:** `apps/site/next.config.js`

The config might need routing updates.

---

## 🎯 IMMEDIATE ACTION REQUIRED

The fastest fix is to make EVERYTHING dynamic (no static generation) for now:

1. Add `export const dynamic = 'force-dynamic'` to all page files
2. Remove `unstable_setRequestLocale()` calls
3. Ensure env vars are loaded at runtime, not build time

---

## 📝 WHY THIS IS HAPPENING

**Static Site Generation (SSG):**
- Next.js builds pages once at build time
- Environment variables from Vercel aren't available during build
- Locale defaults to 'en' during static generation
- Cached pages serve same content regardless of URL

**Solution:**
- Force dynamic rendering
- Load env vars at runtime
- Ensure locale is determined from URL path at runtime

---

Generated: October 23, 2025
Status: CRITICAL - Need to switch from SSG to SSR/Dynamic

