# Post-Deployment Actions - Quick Guide

**Run these commands AFTER Vercel deployment completes**

---

## 🗄️ **STEP 1: DATABASE MIGRATION** (2 minutes)

### **Run this command:**
```bash
npx prisma db push --schema packages/db/prisma/schema.prisma
```

### **Expected output:**
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

### **Verify in Prisma Studio:**
```bash
npx prisma studio --schema packages/db/prisma/schema.prisma
```

Check for these new tables:
- ✅ `AIGeneration`
- ✅ `URLExtraction`

Check these tables have new columns:
- ✅ `MediaAsset` → `originalName`, `thumbnailUrl`, `width`, `height`, `status`
- ✅ `Post` → `featuredImageId`
- ✅ `User` → `uploadedMedia` relation

---

## 🪣 **STEP 2: SUPABASE STORAGE SETUP** (1 minute)

### **1. Go to Supabase Dashboard:**
https://app.supabase.com/project/your-project-id/sql/new

### **2. Copy SQL from file:**
```bash
# View the SQL file
cat packages/db/sql/phase6.5-storage-setup.sql
```

### **3. Paste and execute in Supabase SQL Editor**

### **4. Verify bucket created:**
Go to: Storage → Buckets → Should see `media` bucket

---

## ✅ **STEP 3: VERIFY DEPLOYMENT** (5 minutes)

### **Admin App Check:**

Visit: https://admin.khaledaun.com

**Test 1: Media Library**
1. Go to `/media` (you might need to type the URL directly for now)
2. Drag & drop an image
3. Should upload and show thumbnail
4. Click image → see details modal
5. Go to Supabase → Storage → media → verify file is there

**Test 2: AI Content Generation**
1. Go to `/posts/new`
2. Look for AI Assistant component (should be visible)
3. Enter topic: "Benefits of TypeScript"
4. Click "Generate Content"
5. Should see generated content in ~10-15 seconds

**Test 3: Translation**
1. In AI Assistant, go to "Translate" tab
2. Enter: "Hello World"
3. Select EN → AR
4. Click "Translate"
5. Should see: "مرحبا بالعالم"

**Test 4: URL Import**
1. In AI Assistant, go to "Import URL" tab
2. Paste any blog post URL (e.g., from Medium)
3. Click "Import"
4. Should extract and show content

**Test 5: Rich Text Editor**
1. In post editor, try formatting:
   - Bold, italic, headings
   - Create list
   - Add link
2. Try inserting image from media library

---

## 🐛 **IF SOMETHING FAILS:**

### **Media upload fails:**
```bash
# Check Supabase Storage setup
# Re-run the SQL setup script
```

### **AI generation fails:**
```bash
# Check Vercel logs
# Verify OPENAI_API_KEY is set in Vercel env vars
```

### **Database errors:**
```bash
# Re-run migration
npx prisma db push --schema packages/db/prisma/schema.prisma --force-reset
```

---

## 📊 **CHECK THESE LOGS:**

### **Vercel Function Logs:**
https://vercel.com/your-project/logs

Look for:
- API calls to `/api/admin/media/upload`
- API calls to `/api/admin/ai/generate`
- Any 500 errors

### **Supabase Logs:**
https://app.supabase.com/project/your-project/logs

Look for:
- Storage uploads
- Database queries
- Any auth errors

---

## 🎉 **SUCCESS CHECKLIST:**

- [ ] Database migration successful
- [ ] Supabase Storage bucket created
- [ ] Can upload images
- [ ] Images are optimized (smaller file size)
- [ ] AI generation works
- [ ] Translation works
- [ ] URL import works
- [ ] Rich text editor works
- [ ] No errors in Vercel logs

---

## 📞 **NEXT STEPS:**

Once all checks pass:

1. **Create a test blog post** with:
   - AI-generated content
   - Uploaded images
   - Formatted text
   - Publish it!

2. **Check public site:**
   - Visit https://khaledaun.com/blog
   - See if new post appears
   - Check if images load
   - Verify layout looks good

3. **Start Phase 1 Strategic UX:**
   - I'll begin building the full UX overhaul
   - Sidebar navigation
   - AI Configuration UI
   - Leads module
   - Case Studies
   - Profile & Presence

---

**Ready?** Let me know when Vercel deployment completes! 🚀

