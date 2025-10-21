# Next Steps: Production Deployment
## Phase 6 Full + Phase 8 Full

**Current Status**: Admin deployment in progress (commit `3601da5`)  
**Next Phase**: Production validation and release

---

## 🚀 IMMEDIATE NEXT STEPS

### 1. Monitor Admin Build (Current)
- **Check**: Vercel dashboard for commit `3601da5`
- **Expected**: Successful build with all module resolution fixed
- **If Success**: Proceed to validation steps below
- **If Failure**: Debug remaining issues

### 2. Production Validation Checklist

#### A. Environment Verification
```bash
# Check both Vercel projects have correct env vars:
# - DATABASE_URL (pooled)
# - DIRECT_URL (direct) 
# - REVALIDATE_SECRET
# - PREVIEW_SECRET
# - SITE_URL
# - NEXT_PUBLIC_SITE_URL
```

#### B. Database Health
```bash
# Verify schema is applied
cd packages/db
pnpm db:push --accept-data-loss
pnpm db:seed
```

#### C. API Health Checks
```bash
# Site health
curl https://khaledaun.com/api/health

# Admin health  
curl https://admin.khaledaun.com/api/health

# Should return: {"ok": true, "commit": "abc1234"}
```

### 3. Feature Smoke Tests

#### A. Phase 6 Full (Bilingual CMS + RBAC)
1. **Admin Login**
   - Login as different roles (OWNER, ADMIN, EDITOR, AUTHOR)
   - Verify role-based UI differences

2. **Bilingual Post Creation**
   - Create post with EN content
   - Add AR translation
   - Test per-locale preview buttons
   - Publish and verify both locales work

3. **RBAC Testing**
   - AUTHOR: Can create, cannot publish
   - EDITOR: Can publish any post
   - OWNER: Full access

4. **Site Verification**
   - Visit `/en/blog/[slug]` - should show EN content
   - Visit `/ar/blog/[slug]` - should show AR content with RTL
   - Test ISR revalidation

#### B. Phase 8 Full (Social Embeds)
1. **Admin Social Management**
   - Go to `/social` in admin
   - Create new social embed
   - Test HTML sanitization (try `<script>` tags)
   - Enable/disable embeds

2. **Site Social Display**
   - Check LinkedIn section appears when enabled
   - Verify it hides when disabled
   - Test 5-minute cache behavior

### 4. Security Validation

#### A. API Security
```bash
# Revalidation without secret (should 401)
curl -X POST https://khaledaun.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"slug":"test"}'

# Revalidation with secret (should 200)
curl -X POST https://khaledaun.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-reval-secret: YOUR_SECRET" \
  -d '{"locale":"en","slug":"test-post"}'

# Preview without token (should 401)
curl "https://khaledaun.com/api/preview?id=123&locale=en"

# Preview with valid token (should work)
curl "https://khaledaun.com/api/preview?id=123&locale=en&token=VALID_TOKEN"
```

#### B. XSS Protection
- Test social embed HTML sanitization
- Verify no script tags are executed
- Check iframe content is properly sandboxed

### 5. Performance Checks
- **Page Load Times**: < 3s for both site and admin
- **API Response Times**: < 500ms for health endpoints
- **Database Queries**: Monitor for N+1 issues
- **Cache Behavior**: Verify ISR and social embed caching

---

## 🏷️ RELEASE PROCESS

### 1. Tag Creation
```bash
# Tag Phase 6 Full
git tag -a v0.6.1-full -m "Phase 6 Full: Bilingual CMS + RBAC
- Bilingual content management (EN/AR)
- 6-role RBAC system
- Per-locale preview and ISR
- Ownership-based permissions
- E2E test coverage"

# Tag Phase 8 Full  
git tag -a v0.8.0-social-admin -m "Phase 8 Full: Social Embed Admin
- Database-driven social embeds
- HTML sanitization for security
- 5-minute caching for performance
- Admin CRUD interface
- E2E test coverage"

# Push tags
git push origin v0.6.1-full
git push origin v0.8.0-social-admin
```

### 2. GitHub Releases
Create releases with:
- **Feature highlights**
- **Breaking changes** (if any)
- **Migration notes**
- **Known issues**
- **Next steps**

### 3. Documentation Updates
- Update `DEPLOYMENT-PROGRESS-SUMMARY.md` with final status
- Create `PRODUCTION-DEPLOYMENT-REPORT.md`
- Update any README files with new features

---

## 🐛 TROUBLESHOOTING

### If Admin Build Still Fails:
1. **Check build logs** for specific error
2. **Verify all dependencies** are in root `package.json`
3. **Test locally** with `npm install && npm run build`
4. **Check Vercel settings** for correct root directory

### If Features Don't Work:
1. **Check environment variables** in Vercel
2. **Verify database connectivity**
3. **Test API endpoints** individually
4. **Check browser console** for errors

### If Performance Issues:
1. **Monitor Vercel Analytics**
2. **Check database query performance**
3. **Verify caching is working**
4. **Test on different networks**

---

## 📊 SUCCESS CRITERIA

### ✅ Phase 6 Full Complete When:
- [ ] Admin builds and deploys successfully
- [ ] Bilingual post creation works
- [ ] Per-locale preview works
- [ ] RBAC permissions enforced
- [ ] Site shows both EN/AR content
- [ ] ISR revalidation works
- [ ] E2E tests pass

### ✅ Phase 8 Full Complete When:
- [ ] Social embed CRUD works in admin
- [ ] HTML sanitization prevents XSS
- [ ] Site displays social embeds correctly
- [ ] 5-minute caching works
- [ ] Enable/disable functionality works
- [ ] E2E tests pass

### ✅ Deployment Complete When:
- [ ] Both site and admin are live
- [ ] All health checks pass
- [ ] Security tests pass
- [ ] Performance is acceptable
- [ ] Tags are created and pushed
- [ ] Documentation is updated

---

## 🎯 READY FOR NEXT PHASE

Once deployment is complete, we'll be ready for:
- **Phase 6.5**: Supabase Storage integration
- **Phase 7**: Automation scaffolding  
- **Phase 9**: Social generator + email
- **Observability**: Enhanced monitoring and analytics

**Current Priority**: Complete admin deployment and validate all features! 🚀



