# 🔍 Arabic Translation Debugging Guide

## ✅ **What's Already Done:**

1. ✅ Cairo font added for Arabic pages
2. ✅ Font switches automatically based on locale
3. ✅ Arabic translation files exist and are complete
4. ✅ Middleware configured correctly
5. ✅ Layout sets `dir="rtl"` for Arabic
6. ✅ All components use `useTranslations()` hook

---

## 🎯 **Testing Steps:**

### Step 1: After Deployment Completes (~5 min)

**Visit English Page:**
```
URL: www.khaledaun.com/en
OR: www.khaledaun.com (defaults to English)
Expected: Poppins font, English text, LTR direction
```

**Visit Arabic Page:**
```
URL: www.khaledaun.com/ar
Expected: Cairo font, Arabic text, RTL direction
```

---

## 🔍 **Diagnostic Checks:**

### Check 1: Inspect HTML Element
```
1. Visit: www.khaledaun.com/ar
2. Right-click → Inspect
3. Look at <html> tag
4. Should see: dir="rtl" lang="ar"
```

### Check 2: Check Body Font
```
1. Visit: www.khaledaun.com/ar
2. Right-click → Inspect
3. Look at <body> tag
4. Should see: class="font-cairo ..."
```

### Check 3: Check Text Content
```
1. Visit: www.khaledaun.com/ar
2. Look at "About Khaled Aun" section
3. Should say: "حول خالد عون"
4. If it says "About Khaled Aun", locale not being passed correctly
```

---

## 🐛 **Possible Issues & Solutions:**

### Issue 1: Still Shows English on /ar
**Symptom:** `/ar` URL shows English content  
**Cause:** Client components not receiving locale from context  
**Solution:** Check browser console for errors, verify `NextIntlClientProvider` is wrapping components

### Issue 2: Font Doesn't Change
**Symptom:** Both `/en` and `/ar` use same font  
**Cause:** Tailwind not recognizing `font-cairo` class  
**Solution:** Verify build completed successfully, clear browser cache

### Issue 3: Some Components English, Some Arabic
**Symptom:** Mixed content on `/ar` page  
**Cause:** Some components not using `useTranslations()` hook  
**Solution:** Check specific component implementation

---

## 🔧 **Manual Verification:**

### Check Translation File Loading:
```javascript
// In browser console on /ar page:
// This won't work directly, but check Network tab for:
// - Request to /ar or similar
// - Should return Arabic locale data
```

### Check Locale in DevTools:
```
1. Open DevTools → Console
2. Type: document.documentElement.lang
3. Should return: "ar" on Arabic page
4. Should return: "en" on English page
```

---

## 📝 **Expected Results After Deployment:**

| Page | URL | Font | Direction | Language |
|------|-----|------|-----------|----------|
| English | `/en` or `/` | Poppins | LTR | English |
| Arabic | `/ar` | Cairo | RTL | Arabic |

---

## ⚠️ **If Arabic Still Shows English:**

This likely means the static generation is creating the same HTML for both locales. The fix would be to:

1. **Option A:** Force dynamic rendering for Arabic pages
2. **Option B:** Use `localePrefix: 'always'` instead of `'as-needed'`
3. **Option C:** Add `unstable_setRequestLocale()` back to all pages

Let me know what you observe and I'll apply the appropriate fix!

---

Generated: October 23, 2025  
Status: Cairo font deployed, waiting for Arabic content verification

