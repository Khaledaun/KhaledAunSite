# Quick Deployment Reference

**Phase 6 Full + Phase 8 Full - Command Cheat Sheet**

---

## 🚦 Pre-Flight

```bash
# Run validation
./scripts/pre-flight-check.sh        # macOS/Linux/WSL
.\scripts\pre-flight-check.ps1       # Windows PowerShell
```

---

## 📋 Environment Setup

```bash
# Create .env in packages/db/
DATABASE_URL="postgresql://user:pass@host.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://user:pass@host.supabase.co:5432/postgres?sslmode=require"
REVALIDATE_SECRET="your-64-char-secret"
PREVIEW_SECRET="your-64-char-secret"
SITE_URL="https://your-site.com"
```

**Or export:**

```bash
# Bash
export DATABASE_URL="postgresql://..."
export DIRECT_URL="postgresql://..."

# PowerShell
$env:DATABASE_URL="postgresql://..."
$env:DIRECT_URL="postgresql://..."
```

---

## 🗄️ Database Migration

```bash
cd packages/db

# 1. Push schema
pnpm db:push

# 2. Seed users & data
pnpm db:seed

# 3. Backfill translations
pnpm tsx scripts/backfill-phase6-full.ts

# 4. Verify
pnpm tsx scripts/verify-post-translations.ts
```

**Expected output:**
```
✅ Schema pushed (PostTranslation, SocialEmbed, expanded Role)
✅ 5 users seeded (OWNER, ADMIN, EDITOR, AUTHOR, REVIEWER)
✅ N posts backfilled → EN translations
✅ All posts have EN translation
```

---

## 🚀 Deploy to Vercel

```bash
# Push to GitHub (triggers Vercel)
git push origin main

# Or deploy manually
pnpm vercel --prod  # site
pnpm vercel --prod  # admin (run in apps/admin)
```

**Check deployments:**
- https://vercel.com/your-team/your-site
- https://vercel.com/your-team/your-admin

---

## 🧪 Smoke Tests

### 1. Bilingual Post (Admin)

```bash
# Login to admin
open https://admin.your-site.com/login

# Create post
1. Posts → New Post
2. EN tab: fill title, slug, content
3. AR tab: fill title, slug, content
4. Click "Preview EN" → verify content
5. Click "Preview AR" → verify content (RTL)
6. Click "Publish" → confirm success
```

### 2. Site Verification

```bash
# Check EN post
open https://your-site.com/en/blog/your-en-slug

# Check AR post
open https://your-site.com/ar/blog/your-ar-slug

# Verify AR is RTL
```

### 3. Social Embed (Admin)

```bash
# Login to admin
open https://admin.your-site.com/social

# Create embed
1. Key: LINKEDIN_WALL
2. HTML: <iframe src="https://linkedin.com/..."></iframe>
3. Enabled: ✓
4. Save

# Verify on site (wait 5 min for cache or clear)
open https://your-site.com/#linkedin-section

# Should show embed. Toggle "Enabled" off → should hide.
```

---

## 🔒 Security Checks

```bash
# Set your values
SITE_URL="https://your-site.com"
REVAL_SECRET="your-revalidate-secret"

# 1. Revalidate without secret (should 401)
curl -X POST $SITE_URL/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"slug":"test"}'
# Expected: {"error":"Unauthorized"} or 401

# 2. Revalidate with secret (should 200)
curl -X POST $SITE_URL/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-reval-secret: $REVAL_SECRET" \
  -d '{"locale":"en","slug":"test-post"}'
# Expected: {"revalidated":true,"paths":[...]}

# 3. Preview without token (should 401)
curl "$SITE_URL/api/preview?id=test-id&locale=en"
# Expected: 401 or error
```

---

## 💚 Health Check

```bash
# Site health
curl https://your-site.com/api/health
# Expected: {"ok":true,"timestamp":"...","commit":"abc1234"}

# Admin health
curl https://admin.your-site.com/api/health
# Expected: {"ok":true,"timestamp":"...","commit":"abc1234"}
```

---

## 🏷️ Tagging

```bash
# Phase 6 Full
git tag -a v0.6.1-full -m "Phase 6 Full: Bilingual CMS + RBAC"
git push origin v0.6.1-full

# Phase 8 Full
git tag -a v0.8.0-social-admin -m "Phase 8 Full: Social Embeds"
git push origin v0.8.0-social-admin
```

**Create releases:**
- https://github.com/your-user/your-repo/releases/new
- Use `RELEASE_NOTES_0.6.1_0.8.0.md` for description

---

## 📝 Vercel Environment Variables

**For BOTH `site` and `admin` projects:**

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://...?pgbouncer=true&connection_limit=1&sslmode=require` | Pooled URL |
| `REVALIDATE_SECRET` | `your-64-char-secret` | For ISR |
| `PREVIEW_SECRET` | `your-64-char-secret` | For preview mode |
| `SITE_URL` | `https://your-site.com` | Production URL |
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.com` | Public URL |
| `REQUIRE_AR_FOR_PUBLISH` | `true` (optional) | Block publish without AR |

**How to set in Vercel:**
1. Go to project → Settings → Environment Variables
2. Add each variable for Production, Preview, Development
3. Redeploy after changes

---

## 🆘 Emergency Rollback

```bash
# 1. Revert deployment in Vercel UI
# Go to Deployments → find previous working build → Promote to Production

# 2. Revert database (if needed)
cd packages/db
# You'll need to manually drop PostTranslation/SocialEmbed tables
# and restore from backup. This is destructive - only if critical!

# 3. Revert code
git revert <bad-commit-sha>
git push origin main
```

---

## 📚 Full Documentation

- **Step-by-step deployment**: `DEPLOYMENT-RUNBOOK.md`
- **Release notes**: `RELEASE_NOTES_0.6.1_0.8.0.md`
- **Migration guide**: `packages/db/MIGRATION_GUIDE.md`
- **Readiness checklist**: `docs/phase6-full-readiness.md`
- **Follow-up work**: `FOLLOW-UP-ISSUES.md`

---

## 🐛 Common Issues

### "Prisma Client validation failed"
```bash
cd packages/db
pnpm exec prisma generate
```

### "Connection pool timeout"
```bash
# Check Supabase connection limit
# Use DIRECT_URL for migrations, DATABASE_URL for app
```

### "Slug collision"
```bash
# EN and AR slugs must be unique PER locale
# Two posts can have same slug IF different locales
```

### "Preview not working"
```bash
# Check PREVIEW_SECRET matches in:
# - Vercel env vars (both apps)
# - packages/utils/preview.ts
# - Admin "Generate Preview URL" API
```

### "ISR not revalidating"
```bash
# Check REVALIDATE_SECRET matches
# Verify publish API calls /api/revalidate
# Check Vercel function logs
```

---

**💡 Pro Tip:** Keep this reference open during deployment!

