# Phase 6.5 & 7 Deployment Guide

**Date**: October 21, 2024  
**Phases**: 6.5 (Rich Media) + 7 (AI Automation)  
**Status**: Ready for Deployment 🚀

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **Step 1: Install Dependencies**

```bash
# Root dependencies
npm install

# Admin app dependencies
cd apps/admin
npm install

# Verify installations
npm list @tiptap/react
npm list openai
npm list sharp
npm list cheerio
```

**Expected new packages**:
- `@tiptap/*` (Rich text editor)
- `openai` (AI content generation)
- `sharp` (Image optimization)
- `cheerio` (URL extraction)
- `react-dropzone` (File upload)

---

### **Step 2: Database Migration**

```bash
# Generate Prisma client with new models
npx prisma generate --schema packages/db/prisma/schema.prisma

# Push schema changes to database
npx prisma db push --schema packages/db/prisma/schema.prisma

# Verify new tables exist
npx prisma studio --schema packages/db/prisma/schema.prisma
```

**New tables to verify**:
- `ai_generations`
- `url_extractions`
- Updated `media_assets` (new fields)
- Updated `users` (new relations)
- Updated `posts` (featuredImageId)

---

### **Step 3: Supabase Storage Setup**

Run this SQL in **Supabase SQL Editor**:

```sql
-- Execute: packages/db/sql/phase6.5-storage-setup.sql

-- Quick verify:
SELECT * FROM storage.buckets WHERE id = 'media';
```

**What this does**:
- Creates `media` bucket
- Sets up RLS policies
- Configures file size limits (50MB)
- Allows public read access

---

### **Step 4: Environment Variables**

**Add to Vercel** (Production):
1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add these variables:

```env
# Phase 7: AI
OPENAI_API_KEY=sk-proj-...

# Existing (verify they're set)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
DIRECT_URL=...
```

**Add to local `.env`** (apps/admin/.env):
```env
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
DIRECT_URL=...
```

---

### **Step 5: Local Testing**

```bash
# Start dev server
cd apps/admin
npm run dev

# Open in browser
# http://localhost:3000
```

**Test Checklist**:
- [ ] **Media Library** (`/media`)
  - [ ] Upload image (drag & drop)
  - [ ] View media grid
  - [ ] Click media item → detail modal
  - [ ] Edit alt text
  - [ ] Copy URL
  - [ ] Delete media
  
- [ ] **Rich Text Editor** (`/posts/new`)
  - [ ] Bold, italic, formatting works
  - [ ] Insert image from media library
  - [ ] Add links
  - [ ] Create lists
  
- [ ] **AI Assistant** (`/posts/new`)
  - [ ] Generate content tab visible
  - [ ] Enter topic → click generate (requires API key)
  - [ ] Translate tab visible
  - [ ] Import URL tab visible
  - [ ] Improve tab visible
  
- [ ] **Pre-Publish Validator**
  - [ ] Create short post → see warnings
  - [ ] View validation score

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 6: Commit Changes**

```bash
# Check what's changed
git status

# Add all Phase 6.5 & 7 files
git add .

# Commit with descriptive message
git commit -m "feat: Phase 6.5 & 7 - Rich Media + AI Content Automation

Phase 6.5:
- Media library with drag & drop upload
- Image optimization with Sharp
- Rich text editor (TipTap)
- Media picker integration
- Pre-publish content validator

Phase 7:
- AI content generation with GPT-4
- Auto-translation (EN ↔ AR)
- URL content extraction
- Content improvement with AI
- SEO metadata generation
- AI assistant UI component

Database:
- Enhanced MediaAsset model
- AIGeneration tracking model
- URLExtraction model
- New relations and indexes

Dependencies:
- @tiptap/* packages
- openai
- sharp
- cheerio
- react-dropzone

Testing:
- 60+ E2E tests for media features
- 70+ E2E tests for AI features

Docs:
- PHASE-6.5-COMPLETE.md
- PHASE-7-COMPLETE.md
- Comprehensive API documentation
"

# Push to main
git push origin main
```

---

### **Step 7: Deploy to Vercel**

**Option A: Automatic Deployment**
- Vercel will auto-deploy when you push to `main`
- Monitor: https://vercel.com/your-project/deployments

**Option B: Manual Deployment**
```bash
vercel --prod
```

**Deployment will**:
1. Install dependencies
2. Generate Prisma client
3. Build Next.js app
4. Deploy to production

**Watch for**:
- Build time: ~5-10 minutes
- Check build logs for errors

---

### **Step 8: Post-Deployment Migration**

**After Vercel deployment succeeds**:

1. **Run database migration** (production):
   ```bash
   # Option A: Use Vercel CLI
   vercel env pull .env.production
   npx prisma db push --schema packages/db/prisma/schema.prisma
   
   # Option B: Use Supabase dashboard
   # Go to SQL Editor and run migration SQL
   ```

2. **Set up Supabase Storage** (if not done):
   - Go to Supabase dashboard → Storage
   - Execute `packages/db/sql/phase6.5-storage-setup.sql` in SQL Editor

3. **Verify tables**:
   - Go to Supabase → Table Editor
   - Check for new tables: `ai_generations`, `url_extractions`
   - Check `media_assets` has new columns

---

### **Step 9: Production Verification**

Test on **production URL** (https://admin.khaledaun.com):

- [ ] **Media Library**
  - [ ] Upload test image
  - [ ] Verify thumbnail generation
  - [ ] Check image optimization (file size reduced)
  - [ ] Verify Supabase Storage bucket
  
- [ ] **Rich Text Editor**
  - [ ] Create new post
  - [ ] Format text
  - [ ] Insert image
  - [ ] Verify content saves
  
- [ ] **AI Features** (requires API key)
  - [ ] Generate content from topic
  - [ ] Translate sample text
  - [ ] Import from URL
  - [ ] Check generation history
  
- [ ] **Validation**
  - [ ] Create minimal post
  - [ ] See validation warnings
  - [ ] View score

---

## 🔍 **TROUBLESHOOTING**

### **Build Fails**

**Error**: `Module not found: openai`
```bash
# Solution: Install dependencies
cd apps/admin
npm install
git add package-lock.json
git commit -m "chore: update lockfile"
git push
```

**Error**: `Prisma client not generated`
```bash
# Solution: Verify build command
# In package.json:
"build": "prisma generate --schema ../../packages/db/prisma/schema.prisma && next build"
```

---

### **Runtime Errors**

**Error**: `OpenAI API key missing`
- Solution: Add `OPENAI_API_KEY` to Vercel environment variables
- Redeploy after adding

**Error**: `Media upload fails`
- Solution: Verify Supabase Storage bucket created
- Run `packages/db/sql/phase6.5-storage-setup.sql`

**Error**: `Image optimization timeout`
- Solution: Check Vercel function timeout limits
- Sharp may need serverless optimization

---

### **Database Issues**

**Error**: `Table 'ai_generations' does not exist`
```bash
# Solution: Run migration
npx prisma db push --schema packages/db/prisma/schema.prisma
```

**Error**: `Column 'featuredImageId' does not exist`
```bash
# Solution: Schema not pushed
npx prisma db push --schema packages/db/prisma/schema.prisma
```

---

## 📊 **POST-DEPLOYMENT MONITORING**

### **Week 1 Checklist**

- [ ] Monitor Vercel analytics
- [ ] Check error rates in Sentry (if configured)
- [ ] Monitor OpenAI API usage
- [ ] Check Supabase storage usage
- [ ] Review AI generation costs

### **Metrics to Track**

1. **Media Library**:
   - Files uploaded per day
   - Storage usage (GB)
   - Average file size
   - Thumbnail generation success rate

2. **AI Features**:
   - Generations per day
   - Average cost per generation
   - Token usage
   - Error rate
   - Most used feature

3. **Performance**:
   - Page load times
   - API response times
   - Build times
   - Function execution times

---

## 💰 **COST TRACKING**

### **Expected Monthly Costs**

**Supabase**:
- Storage: Free up to 1GB, then $0.021/GB
- Database: Included in your plan

**OpenAI** (moderate use):
- 50 articles: ~$2-4
- 50 translations: ~$1-2
- 50 improvements: ~$1-3
- **Total**: ~$4-9/month

**Vercel**:
- Included in your plan
- Watch function execution time

---

## ✅ **SUCCESS CRITERIA**

Deployment is successful when:

- [x] All builds pass on Vercel
- [x] Database migrations complete
- [x] Supabase Storage configured
- [x] Can upload media in production
- [x] Can generate AI content in production
- [x] No critical errors in logs
- [x] All environment variables set
- [x] Local and production match functionality

---

## 🎉 **DEPLOYMENT COMPLETE!**

When all checks pass:

1. **Tag the release**:
   ```bash
   git tag -a v0.7.0-media-ai -m "Phase 6.5 & 7: Rich Media + AI Automation"
   git push origin v0.7.0-media-ai
   ```

2. **Create GitHub release**:
   - Go to GitHub → Releases → New Release
   - Tag: `v0.7.0-media-ai`
   - Title: "v0.7.0: Rich Media Management + AI Content Automation"
   - Description: Copy from `PHASE-6.5-COMPLETE.md` and `PHASE-7-COMPLETE.md`

3. **Update README**:
   - Add Phase 6.5 & 7 to feature list
   - Update production URLs
   - Add AI features to highlights

---

## 📞 **NEED HELP?**

If you encounter issues:

1. Check build logs in Vercel
2. Review error messages
3. Verify environment variables
4. Check database connection
5. Test locally first

**Remember**: We can always rollback if needed!

---

**Ready to deploy?** Let's go! 🚀

