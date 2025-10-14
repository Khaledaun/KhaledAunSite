# 🚀 Production Deployment Guide - Phase 6 Lite

**Branch**: `ops/prod-deploy-phase6-lite`  
**Status**: ✅ Ready for Production  
**Date**: October 14, 2025

---

## 🎯 What's Ready for Production

### ✅ All Production Guardrails Implemented

1. **Signed Preview Tokens** - HMAC-SHA256 signed URLs with expiration
2. **Secured Revalidation** - Secret-protected ISR triggers
3. **Health Endpoints** - Monitoring endpoints for both apps
4. **GitHub Actions CI** - Automated E2E testing on PRs
5. **Vercel Build Scripts** - Graceful Prisma generation
6. **Admin Preview API** - Signed URL generation for drafts
7. **Updated E2E Tests** - Tests use signed preview URLs

---

## 📋 Pre-Deployment Checklist

### 1️⃣ Database Setup (REQUIRED)

**Option A: Supabase (Recommended)**

1. Create project at https://supabase.com
2. Get connection string from Settings > Database > Connection String
3. Note down the URL (you'll add to Vercel)

**Option B: Railway/Render/Neon**

1. Create PostgreSQL instance
2. Get connection string
3. Ensure it accepts external connections

### 2️⃣ Generate Secrets

Run these commands to generate strong secrets:

```bash
# Generate REVALIDATE_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"

# Generate PREVIEW_SECRET (optional, will use REVALIDATE_SECRET if not set)
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**Save these securely!** You'll need them for Vercel environment variables.

---

## 🔧 Deployment Steps

### Step 1: Deploy Site App (Public)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Configure Project:**
   - **Root Directory**: `apps/site`
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm vercel-build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

4. **Add Environment Variables:**
   ```bash
   # Required
   DATABASE_URL=postgresql://user:pass@host:5432/db
   REVALIDATE_SECRET=<your-generated-secret>
   
   # Public
   NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
   NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/yourusername
   NEXT_PUBLIC_LINKEDIN_PROFILE_URL=https://linkedin.com/in/khaledaun
   
   # Optional - LinkedIn Wall
   NEXT_PUBLIC_FF_SOCIAL_WALL=false
   NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML=
   ```

5. Click **Deploy**

6. **After First Deploy - Run Migration:**
   ```bash
   # In Vercel CLI or dashboard terminal
   cd packages/db
   npx prisma migrate deploy
   npx tsx seed.ts
   ```

   Or run locally with production DATABASE_URL:
   ```bash
   DATABASE_URL="your-prod-db-url" npx prisma migrate deploy
   DATABASE_URL="your-prod-db-url" npx tsx packages/db/seed.ts
   ```

### Step 2: Deploy Admin App (Protected)

1. Go to https://vercel.com/new
2. Import your GitHub repository (same repo)
3. **Configure Project:**
   - **Root Directory**: `apps/admin`
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm vercel-build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

4. **Add Environment Variables:**
   ```bash
   # Required - Same as Site
   DATABASE_URL=postgresql://user:pass@host:5432/db
   REVALIDATE_SECRET=<same-secret-as-site>
   
   # Public
   NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
   
   # Optional
   PREVIEW_SECRET=<your-preview-secret>
   SITE_URL=https://your-site.vercel.app
   ```

5. Click **Deploy**

### Step 3: Update Site Environment Variables

After admin is deployed, update site app environment variables:

```bash
# Add these to Site app in Vercel
ADMIN_URL=https://your-admin.vercel.app
```

Redeploy site app after adding this.

### Step 4: Enable GitHub Actions

1. Your repository now has `.github/workflows/e2e.yml`
2. GitHub Actions will run automatically on:
   - Push to main
   - Pull requests to main
   - Push to feat/** and ops/** branches

3. **Configure Branch Protection** (Recommended):
   - Go to GitHub > Settings > Branches
   - Add rule for `main`
   - Enable "Require status checks to pass before merging"
   - Select "E2E Tests"

### Step 5: Test the Deployment

1. **Test Site Health:**
   ```bash
   curl https://your-site.vercel.app/api/health
   # Should return: {"ok":true,"service":"site",...}
   ```

2. **Test Admin Health:**
   ```bash
   curl https://your-admin.vercel.app/api/health
   # Should return: {"ok":true,"service":"admin",...}
   ```

3. **Test Blog Page:**
   - Visit: https://your-site.vercel.app/en/blog
   - Should see empty blog or seed post

4. **Test Admin Access:**
   - Visit: https://your-admin.vercel.app/posts
   - Should see posts list (or redirect if not authenticated)

5. **Test Full Workflow:**
   - Create a post in admin
   - Click "Preview Draft" → Should open signed preview URL
   - Publish the post
   - Check https://your-site.vercel.app/en/blog/[slug]
   - Post should appear!

---

## 🔒 Security Verification

### ✅ Verify These Security Features

1. **Revalidation Protected:**
   ```bash
   # Should fail without secret
   curl -X POST https://your-site.vercel.app/api/revalidate \
     -H "Content-Type: application/json" \
     -d '{"slug":"test"}'
   # Returns 401 Unauthorized ✅
   
   # Should succeed with secret
   curl -X POST https://your-site.vercel.app/api/revalidate \
     -H "Content-Type: application/json" \
     -H "x-reval-secret: YOUR_SECRET" \
     -d '{"slug":"test"}'
   # Returns 200 ✅
   ```

2. **Preview Tokens Signed:**
   - Draft posts should NOT be accessible without token
   - Preview URLs expire after 60 minutes
   - Tokens are HMAC-signed and tamper-proof

3. **Admin Gate:**
   - Admin routes redirect unauthorized users
   - API routes return 401 for unauthorized requests

---

## 🔑 Environment Variables Reference

### Required for Both Apps

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string |
| `REVALIDATE_SECRET` | `base64-random-32-chars` | Secret for ISR revalidation |

### Site App Only

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.vercel.app` | Public site URL |
| `NEXT_PUBLIC_CALENDLY_URL` | `https://calendly.com/user` | Calendly booking link |
| `NEXT_PUBLIC_LINKEDIN_PROFILE_URL` | `https://linkedin.com/in/khaledaun` | LinkedIn profile |

### Admin App Only

| Variable | Example | Description |
|----------|---------|-------------|
| `SITE_URL` | `https://your-site.vercel.app` | Used for revalidation calls |
| `PREVIEW_SECRET` | `base64-random-32-chars` | Optional, uses REVALIDATE_SECRET if not set |

### Optional (Both Apps)

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_FF_SOCIAL_WALL` | `true` | Enable LinkedIn wall |
| `NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML` | `<iframe...>` | Walls.io embed |

---

## 🧪 GitHub Actions CI

### What Gets Tested

- ✅ Site app builds successfully
- ✅ Public Phase 5 pages render
- ✅ CMS Lite workflow (create → preview → publish)
- ✅ Blog pages load
- ✅ Preview system works

### Viewing Test Results

1. Go to Actions tab in GitHub
2. Click on latest workflow run
3. View "Run E2E tests" step
4. Download artifacts if tests fail

---

## 📊 Monitoring & Maintenance

### Health Checks

**Site:**
- URL: `https://your-site.vercel.app/api/health`
- Returns: `{ok, service, version, commit, timestamp, env}`

**Admin:**
- URL: `https://your-admin.vercel.app/api/health`
- Returns: `{ok, service, status, uptime, version, commit, db}`

### Recommended Monitoring

Set up uptime monitoring (e.g., UptimeRobot, Vercel Analytics):
- Monitor `/api/health` endpoints
- Alert if response time > 2s
- Alert if status !== 200

### Database Migrations

**For future schema changes:**

```bash
# Local development
cd packages/db
npx prisma migrate dev --name description

# Production
DATABASE_URL="prod-url" npx prisma migrate deploy
```

---

## 🎯 Post-Deployment Tasks

### 1. Test Admin Workflow

1. Log in to admin (setup session cookie manually for Phase 6 Lite)
2. Create a new post
3. Preview the draft (should generate signed URL)
4. Publish the post
5. Verify it appears on public blog
6. Verify ISR revalidation worked

### 2. Update DNS (If Using Custom Domain)

1. Add custom domain in Vercel project settings
2. Update `NEXT_PUBLIC_SITE_URL` to custom domain
3. Redeploy both apps

### 3. Enable Analytics (Optional)

- Vercel Analytics
- Google Analytics
- Sentry error tracking (already configured)

---

## 🚨 Troubleshooting

### Issue: "Database not available" during build

**Solution:** This is expected! The build handles this gracefully. Actual database queries only happen at runtime.

### Issue: Preview links don't work

**Check:**
1. `REVALIDATE_SECRET` is set in both apps
2. `PREVIEW_SECRET` is set (or REVALIDATE_SECRET is used)
3. Token hasn't expired (60 min TTL)

### Issue: ISR revalidation fails

**Check:**
1. `REVALIDATE_SECRET` matches in admin and site
2. `SITE_URL` is set correctly in admin app
3. Check admin logs for revalidation errors

### Issue: Admin redirects to public site

**Expected:** Phase 6 Lite uses simple session cookies. For full auth:
1. Set session cookie manually in browser DevTools
2. Or integrate Supabase Auth in Phase 6 Full

---

## ✅ Definition of Done

- [ ] Site deployed on Vercel
- [ ] Admin deployed on Vercel
- [ ] Database connected and migrated
- [ ] Seed data loaded (admin user created)
- [ ] Health endpoints return 200
- [ ] Preview links generate signed URLs
- [ ] Revalidation requires secret
- [ ] GitHub Actions CI passes
- [ ] Can create → preview → publish a post
- [ ] Published post visible on public blog

---

## 🎉 Success Criteria Met

Once all items above are checked, you have:

✅ **Production-grade CMS** with security guardrails  
✅ **Automated testing** via GitHub Actions  
✅ **Monitoring** via health endpoints  
✅ **Signed previews** with expiration  
✅ **Secured ISR** with secret authentication  

**Phase 6 Lite is LIVE!** 🚀

---

## 📚 Next Steps

### Phase 6 Full (Optional Enhancement)
- Bilingual content (EN/AR)
- Full RBAC (Editor, Author, Reviewer roles)
- Enhanced authentication (Supabase Auth/NextAuth)
- Soft delete and archiving

### Phase 6.5 (Media & Rich Editor)
- Media library with upload
- Rich text editor (Tiptap/Lexical)
- Image optimization
- Block-based content

### Phase 7 (Automation)
- ICC/DIAC content ingestors
- Automated draft generation
- Queue management UI

---

*Deployed with ❤️ using Next.js 14, Prisma, PostgreSQL, Vercel, and GitHub Actions*

