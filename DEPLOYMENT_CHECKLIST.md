# ✅ Production Deployment Checklist

Use this checklist to deploy Phase 6 Lite to production.

---

## Pre-Deployment

- [ ] **Database Created**
  - [ ] Supabase/Railway/Neon PostgreSQL instance ready
  - [ ] Connection string copied
  - [ ] Database accessible from Vercel

- [ ] **Secrets Generated**
  - [ ] `REVALIDATE_SECRET` generated (32+ chars)
  - [ ] Secrets stored securely (password manager)

- [ ] **Repository Ready**
  - [ ] All changes committed
  - [ ] Branch `ops/prod-deploy-phase6-lite` pushed to GitHub
  - [ ] GitHub Actions enabled

---

## Deploy Site App

- [ ] **Vercel Project Created**
  - [ ] Import GitHub repo
  - [ ] Root directory: `apps/site`
  - [ ] Framework: Next.js

- [ ] **Environment Variables Added**
  - [ ] `DATABASE_URL`
  - [ ] `REVALIDATE_SECRET`
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `NEXT_PUBLIC_CALENDLY_URL`
  - [ ] `NEXT_PUBLIC_LINKEDIN_PROFILE_URL`

- [ ] **First Deploy Successful**
  - [ ] Build completes without errors
  - [ ] Site URL: ___________________________

- [ ] **Database Migrated**
  - [ ] Run: `DATABASE_URL="..." npx prisma migrate deploy`
  - [ ] Run: `DATABASE_URL="..." npx tsx packages/db/seed.ts`
  - [ ] Admin user created (admin@khaledaun.com)

---

## Deploy Admin App

- [ ] **Vercel Project Created**
  - [ ] Import same GitHub repo
  - [ ] Root directory: `apps/admin`
  - [ ] Framework: Next.js

- [ ] **Environment Variables Added**
  - [ ] `DATABASE_URL` (same as site)
  - [ ] `REVALIDATE_SECRET` (same as site)
  - [ ] `NEXT_PUBLIC_SITE_URL` (site URL from above)
  - [ ] `SITE_URL` (site URL from above)

- [ ] **First Deploy Successful**
  - [ ] Build completes without errors
  - [ ] Admin URL: ___________________________

---

## Post-Deployment Verification

- [ ] **Health Checks Pass**
  - [ ] `curl https://site-url/api/health` returns `{"ok":true}`
  - [ ] `curl https://admin-url/api/health` returns `{"ok":true}`

- [ ] **Site Functions**
  - [ ] Home page loads
  - [ ] Blog page (`/en/blog`) loads
  - [ ] Navigation works
  - [ ] Consultation modal works

- [ ] **Admin Functions**
  - [ ] `/posts` page loads
  - [ ] Can view existing posts
  - [ ] Seed post visible

- [ ] **Security Verified**
  - [ ] Revalidation without secret returns 401
  - [ ] Preview without token blocked in production
  - [ ] Admin routes protected

---

## Full Workflow Test

- [ ] **Create Post**
  - [ ] Log into admin (manual session cookie for Phase 6 Lite)
  - [ ] Navigate to `/posts/new`
  - [ ] Fill in title, slug, content
  - [ ] Save as draft

- [ ] **Preview Post**
  - [ ] Click "Preview Draft" button
  - [ ] Signed URL generates
  - [ ] Preview opens in new window
  - [ ] Draft content visible with "Preview Mode" banner

- [ ] **Publish Post**
  - [ ] Click "Publish" button
  - [ ] Confirmation appears
  - [ ] Status changes to "PUBLISHED"

- [ ] **Verify Public**
  - [ ] Visit `/en/blog`
  - [ ] Published post appears in list
  - [ ] Click post
  - [ ] Full post loads at `/en/blog/[slug]`
  - [ ] Content is correct

---

## GitHub Actions CI

- [ ] **Workflow Runs**
  - [ ] Push to main triggers workflow
  - [ ] Tests run automatically
  - [ ] Workflow passes

- [ ] **Branch Protection** (Optional)
  - [ ] Main branch protected
  - [ ] Require CI to pass before merge
  - [ ] Require pull request reviews

---

## Optional Enhancements

- [ ] **Custom Domain**
  - [ ] Domain added in Vercel
  - [ ] DNS configured
  - [ ] SSL certificate active
  - [ ] Update `NEXT_PUBLIC_SITE_URL`

- [ ] **Monitoring**
  - [ ] UptimeRobot or similar configured
  - [ ] Health endpoint monitored
  - [ ] Alerts configured

- [ ] **Analytics**
  - [ ] Vercel Analytics enabled
  - [ ] Google Analytics added (optional)

---

## 🎉 Launch Complete!

When all boxes are checked:

**Phase 6 Lite is LIVE in PRODUCTION!** 🚀

---

## Quick Reference

**Site URL**: ___________________________  
**Admin URL**: ___________________________  
**Database**: ___________________________  
**Deployed**: ___________________________  

**Admin Credentials** (Phase 6 Lite seed):
- Email: `admin@khaledaun.com`
- Session: Manual cookie setup (see PRODUCTION_DEPLOYMENT.md)

---

## Support Documents

- `PRODUCTION_DEPLOYMENT.md` - Full deployment guide
- `PHASE6_LITE_SUCCESS.md` - Feature overview
- `docs/phase6-lite-env-vars.md` - Environment variables reference

