# 🔍 Arabic Translation - Root Cause Analysis

## ✅ **What's Fixed:**

1. ✅ Cairo font now applies to **ALL elements** on `/ar` pages (not just navbar)
2. ✅ RTL direction works
3. ✅ HTML lang attribute set correctly

---

## ❌ **The Real Problem:**

**SYMPTOM:** Arabic page shows English content  
**ROOT CAUSE:** `useTranslations()` hook is not receiving the Arabic locale context

---

## 🔍 **Why This Happens:**

### The Setup:
```javascript
// Layout wraps everything with NextIntlClientProvider
<NextIntlClientProvider messages={messages}>
  {children}
</NextIntlClientProvider>

// Components use useTranslations
const t = useTranslations('Hero');
t('greeting') // Should return Arabic on /ar, English on /en
```

### The Problem:
When pages are **statically generated** at build time:
1. Both `/en` and `/ar` are generated
2. The same React components are rendered
3. But `useTranslations()` might be using the **default locale** (English) for both

### Static Generation Flow:
```
Build Time:
├─ Generate /en  → uses messages from en.json ✅
└─ Generate /ar  → SHOULD use messages from ar.json ❌ (but uses en.json)

Runtime:
└─ Browser loads /ar
   └─ Hydrates with English messages (from static HTML)
   └─ Doesn't re-fetch Arabic messages
```

---

## 🎯 **The Solution:**

We need to tell `next-intl` to **properly use the locale** during static generation.

### Option A: Add `getStaticProps`-style locale handling (RECOMMENDED)
Update each page to properly set the locale before rendering.

### Option B: Force dynamic rendering for localized pages
Make `/ar` pages render at request time, not build time.

### Option C: Change `localePrefix` strategy
Use `localePrefix: 'always'` to force `/en` prefix for English too.

---

## 🔧 **Quick Test to Confirm:**

### Test in Browser Console:
```javascript
// On /ar page, open DevTools Console:
document.documentElement.lang  // Should return "ar"
document.documentElement.dir   // Should return "rtl"
```

### Check Network Tab:
1. Go to Network tab
2. Reload `/ar` page
3. Look for request to `/ar` or similar
4. Check if it returns Arabic content or English

---

## 📝 **Most Likely Fix:**

The issue is that `unstable_setRequestLocale(locale)` is called in the page component, but **client components** (like `HeroDennis`, `AboutDennis`, etc.) don't see the locale change because they're already hydrated with English content from the static HTML.

### Solution:
Add this to EVERY client component that uses translations:

```javascript
'use client'
import { useLocale, useTranslations } from 'next-intl';

export default function AboutDennis() {
  const locale = useLocale(); // Get current locale from context
  const t = useTranslations('About');
  
  // Rest of component...
}
```

The `useLocale()` hook forces the component to re-render when locale changes.

---

## ⚡ **Let's Test:**

After the next deployment (~ 5 min):

1. Visit: `www.khaledaun.com/ar`
2. Check if Cairo font appears **everywhere** (not just navbar)
3. Check if content is still English

If content is STILL English, I'll apply the fix above to force proper locale detection.

---

Generated: October 23, 2025  
Status: Cairo font globally applied, awaiting Arabic content fix

