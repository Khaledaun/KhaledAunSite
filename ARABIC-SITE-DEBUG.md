# 🐛 Arabic Site Debug Guide

## Issue: Arabic Site Showing English Content

**URL:** `www.khaledaun.com/ar`  
**Expected:** Arabic content  
**Actual:** English content (except name "خالد عون")

---

## ✅ What IS Working:

1. **i18n Plugin:** `withNextIntl` is configured in `next.config.js`
2. **Middleware:** `next-intl/middleware` is set up with `['en', 'ar']` locales
3. **Messages:** Both `en.json` and `ar.json` exist with complete translations (197 lines each)
4. **Components:** Using `useTranslations()` hook correctly
5. **Layout:** Sets `dir={locale === 'ar' ? 'rtl' : 'ltr'}` correctly

---

## 🔍 Potential Issues:

### 1. **Middleware Matcher Too Restrictive**

**Current:**
```javascript
matcher: ['/', '/(ar|en)/:path*']
```

**This might not catch:**
- `/ar` (without trailing slash)
- Nested routes like `/ar/about`

**Should be:**
```javascript
matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
```

### 2. **Client Component Hydration Issue**

Components like `AboutDennis`, `ServicesDennis`, etc. are `'use client'` but don't receive `locale` prop. They rely on `useTranslations()` hook getting locale from context.

**If context isn't properly set, they default to English.**

### 3. **Build-Time Static Generation**

The site might be pre-rendering pages at build time with English locale as default, and not properly regenerating for `/ar` routes at runtime.

---

## 🔧 Fixes to Apply:

### Fix 1: Update Middleware Matcher

**File:** `apps/site/middleware.js`

**Change from:**
```javascript
export const config = {
  matcher: ['/', '/(ar|en)/:path*']
};
```

**Change to:**
```javascript
export const config = {
  // Match all routes except API, Next.js internals, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### Fix 2: Verify Locale Provider

**File:** `apps/site/src/app/[locale]/layout.js`

Ensure `NextIntlClientProvider` is receiving messages correctly:

```javascript
<NextIntlClientProvider messages={messages}>
  {children}
</NextIntlClientProvider>
```

### Fix 3: Add Locale to All Client Components

Even though they shouldn't need it, explicitly passing locale can help debug:

**File:** `apps/site/src/app/[locale]/(site)/page.js`

**Change:**
```javascript
<AboutDennis />
<ServicesDennis />
<ExperienceTimelineDennis />
```

**To:**
```javascript
<AboutDennis locale={locale} />
<ServicesDennis locale={locale} />
<ExperienceTimelineDennis locale={locale} />
```

---

## 🧪 Testing Steps:

### 1. Check Browser Console

1. Visit: `www.khaledaun.com/ar`
2. Press `F12` to open Developer Tools
3. Click **Console** tab
4. Look for errors like:
   - "MISSING_MESSAGE"
   - "Locale not found"
   - Any i18n-related warnings

### 2. Check Locale in Component

Add this temporarily to `AboutDennis.js`:

```javascript
export default function AboutDennis() {
  const t = useTranslations('About');
  const locale = useLocale(); // Add this import from 'next-intl'
  
  console.log('AboutDennis locale:', locale); // Debug log
  console.log('Translation for title:', t('title')); // Debug log
  
  // ... rest of component
}
```

### 3. Check Network Tab

1. Open DevTools → **Network** tab
2. Reload `/ar` page
3. Look for requests loading translation files
4. Check if `ar.json` is being fetched

### 4. Check HTML Source

1. Visit `/ar` page
2. Right-click → **View Page Source**
3. Search for `<html lang="ar"` or `<html dir="rtl"`
4. If you see `lang="en"`, the locale isn't being set correctly

---

## 📊 Diagnostic Checklist:

- [ ] Middleware is running for `/ar` routes
- [ ] `ar.json` is being loaded (check Network tab)
- [ ] `NextIntlClientProvider` has correct messages
- [ ] Components are receiving translations (check console logs)
- [ ] HTML has `lang="ar"` and `dir="rtl"` attributes
- [ ] No console errors about missing messages or locales

---

## 🚀 Quick Fix (Most Likely to Work):

The middleware matcher is probably the culprit. Apply Fix 1 above, then test.

**After changing middleware:**
1. Rebuild locally: `npm run build`
2. Test locally: `npm start`
3. Visit `localhost:3000/ar`
4. Check if content is in Arabic
5. If YES → Push to Vercel
6. If NO → Continue with other fixes

---

## 📞 If Still Not Working:

Provide these details:
1. Screenshot of browser console on `/ar` page
2. Screenshot of Network tab showing translation file requests
3. Screenshot of page source showing `<html>` tag attributes
4. Any error messages from Vercel deployment logs

---

Generated: October 23, 2025
Issue: Arabic site displaying English content despite complete translations

