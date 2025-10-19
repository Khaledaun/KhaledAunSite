# Phase 8 Full Readiness Guide
**Version:** v0.8.0-social-admin  
**Date:** October 16, 2024  
**Feature:** Database-Driven Social Media Embeds

---

## 🎯 **OVERVIEW**

Phase 8 Full adds database-driven social media embeds with admin CRUD, server-side HTML sanitization, RBAC enforcement, and cached site rendering.

**What's New:**
- ✅ Social embed admin UI (create, edit, delete, enable/disable)
- ✅ Server-side HTML sanitization (XSS protection)
- ✅ RBAC enforcement (EDITOR+ create/edit, ADMIN+ delete)
- ✅ 5-minute ISR caching on site
- ✅ Conditional rendering (hide when disabled)

---

## 📋 **PREREQUISITES**

### **Required:**
- Phase 6 Full deployed (bilingual CMS + RBAC)
- Supabase Postgres database connected
- Vercel deployment for apps/site and apps/admin
- Environment variables from Phase 6 still set

### **New Dependencies:**
- `sanitize-html` package (automatically installed)

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Apply Schema Changes**

```bash
cd packages/db

# Push schema (adds social_embeds table)
pnpm db:push

# Run seed (creates disabled LINKEDIN_WALL placeholder)
pnpm db:seed
```

**Expected Output:**
```
✅ Social embed placeholder created: LINKEDIN_WALL
```

**Verification:**
```sql
SELECT * FROM social_embeds;

-- Should show:
-- LINKEDIN_WALL | <!-- Placeholder... --> | false
```

---

### **Step 2: Deploy Applications**

```bash
# Deploy both apps
git push origin main

# Or deploy manually
vercel --prod
```

**Monitor:**
- Check Vercel deployment logs
- Verify no build errors
- Ensure `sanitize-html` installed successfully

---

### **Step 3: Test Admin Interface**

**Login as EDITOR:**
```
1. Go to /social
2. Click "New Embed"
3. Create test embed:
   Key: TEST_LINKEDIN
   HTML: <iframe src="..." />
   Enabled: ✓
4. Click "Save"
✅ Embed appears in list
```

**Test Edit:**
```
1. Click existing embed
2. Modify HTML
3. Toggle enabled
4. Save
✅ Changes persisted
```

**Test Delete (as ADMIN):**
```
1. Login as ADMIN
2. Select embed
3. Click "Delete"
4. Confirm
✅ Embed removed
```

---

### **Step 4: Test Site Rendering**

**With Enabled Embed:**
```
1. Admin: Enable LINKEDIN_WALL
2. Site: Visit home page
3. Scroll to LinkedIn section
✅ Section visible with embed
```

**With Disabled Embed:**
```
1. Admin: Disable LINKEDIN_WALL
2. Site: Wait 5+ minutes (cache expiry)
3. Refresh home page
✅ LinkedIn section hidden
```

---

## 🔒 **SECURITY FEATURES**

### **HTML Sanitization**

**Allowed Tags:**
- `iframe` - For embeds
- `div`, `span`, `p` - For structure
- `a` - For links
- `blockquote`, `section`, `article` - For content

**Blocked Tags:**
- `<script>` - Completely removed
- `<style>` - Removed
- `<object>`, `<embed>` - Removed
- All event handlers (`onclick`, `onerror`, etc.)

**Example:**
```html
Input (from admin):
<script>alert('XSS')</script>
<iframe src="https://linkedin.com/embed"></iframe>
<img onerror="alert('XSS')">

Output (after sanitization):
<iframe src="https://linkedin.com/embed"></iframe>
<!-- scripts and img removed -->
```

---

### **RBAC Matrix**

| Action | AUTHOR | EDITOR | ADMIN | OWNER |
|--------|--------|--------|-------|-------|
| View   | ❌     | ✅     | ✅    | ✅    |
| Create | ❌     | ✅     | ✅    | ✅    |
| Edit   | ❌     | ✅     | ✅    | ✅    |
| Delete | ❌     | ❌     | ✅    | ✅    |

**API Enforcement:**
- All routes check session user
- Returns 401 if not logged in
- Returns 403 if insufficient role
- Audit trail created for all operations

---

## 📊 **TROUBLESHOOTING**

### **Issue: "sanitize-html not found"**
**Fix:**
```bash
# Install manually if needed
pnpm add sanitize-html
pnpm add -D @types/sanitize-html

# Rebuild
pnpm build
```

### **Issue: "Embed not showing on site"**
**Check:**
1. Is embed enabled? (Admin UI shows "Enabled")
2. Has cache expired? (Wait 5+ min or manual revalidate)
3. Check browser console for fetch errors
4. Verify `/api/social-embed/LINKEDIN_WALL` returns data

**Manual Cache Clear:**
```bash
curl -X POST https://site.com/api/revalidate \
  -H "x-reval-secret: YOUR_SECRET" \
  -d '{"path": "/api/social-embed/LINKEDIN_WALL"}'
```

### **Issue: "LinkedIn section always hidden"**
**Causes:**
1. LINKEDIN_WALL doesn't exist → Create in admin
2. LINKEDIN_WALL disabled → Enable in admin
3. Cache not expired → Wait 5 min
4. API route error → Check server logs

**Debug:**
```bash
# Test API directly
curl https://site.com/api/social-embed/LINKEDIN_WALL

# Should return:
{"embed": {"html": "...", "key": "LINKEDIN_WALL"}}

# Or if disabled:
{"embed": null}
```

### **Issue: "Permission denied (403)"**
**Causes:**
1. Not logged in → Login first
2. Insufficient role → Need EDITOR+ for create/edit, ADMIN+ for delete
3. Session expired → Login again

**Verify:**
```bash
# Check user role
SELECT email, role FROM users WHERE email = 'your@email.com';
```

---

## 🎯 **SMOKE TEST CHECKLIST**

After deployment, verify:

### **Admin UI:**
- [ ] Can access `/social` page (EDITOR+)
- [ ] Can create new embed
- [ ] Can edit existing embed
- [ ] Can toggle enabled/disabled
- [ ] Can delete embed (ADMIN+ only)
- [ ] Security notice displayed
- [ ] Form validates key format

### **Sanitization:**
- [ ] Scripts removed from HTML
- [ ] Event handlers removed
- [ ] Safe tags preserved
- [ ] Dangerous schemes blocked

### **API:**
- [ ] GET `/api/admin/social` returns list
- [ ] POST `/api/admin/social` creates embed
- [ ] PUT `/api/admin/social/[key]` updates
- [ ] DELETE `/api/admin/social/[key]` deletes (ADMIN+)
- [ ] GET `/api/social-embed/[key]` returns HTML
- [ ] Disabled embeds return null
- [ ] Cache headers present

### **Site:**
- [ ] LinkedIn section shows when enabled
- [ ] LinkedIn section hides when disabled
- [ ] Embed renders correctly
- [ ] No console errors
- [ ] Cache working (5-minute TTL)

---

## 📚 **USE CASES**

### **Use Case 1: LinkedIn Company Feed**

**Setup:**
```
1. Get embed code from LinkedIn
2. Admin → /social → New Embed
3. Key: LINKEDIN_WALL
4. Paste: <iframe src="https://linkedin.com/embed/feed/..." />
5. Enable
6. Save
7. Wait 5 min → Site shows feed
```

### **Use Case 2: Temporarily Disable**

**Scenario:** LinkedIn API down, want to hide broken embed

```
1. Admin → /social → Click LINKEDIN_WALL
2. Uncheck "Enabled"
3. Save
4. After 5 min, section hidden on site
5. No code deploy needed
```

### **Use Case 3: Update Embed Code**

**Scenario:** LinkedIn changed embed format

```
1. Admin → /social → Click LINKEDIN_WALL
2. Update HTML with new code
3. Save
4. After 5 min, site shows new embed
```

### **Use Case 4: Add Twitter Feed** (Future)

```
1. Admin → /social → New Embed
2. Key: TWITTER_FEED
3. Paste Twitter embed code
4. Enable
5. Save
6. Update site component to fetch TWITTER_FEED
```

---

## 🔄 **MIGRATION FROM ENV VARS**

**If you used environment variables before:**

### **Old Approach:**
```env
NEXT_PUBLIC_FF_SOCIAL_WALL=true
NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML=<iframe ...>
```

**Migrate:**
```
1. Copy iframe from NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML
2. Admin → /social → New Embed
3. Key: LINKEDIN_WALL
4. Paste iframe
5. Enable
6. Save
7. Remove env vars from Vercel
8. Redeploy apps/site (to use new API fetch)
```

**Benefits:**
- ✅ Update without deploy
- ✅ Enable/disable toggle
- ✅ Audit trail
- ✅ RBAC enforcement

---

## 📈 **PERFORMANCE**

### **Caching Strategy:**
- **First request:** DB fetch (~50ms)
- **Next 5 min:** Served from CDN cache (~5ms)
- **After 5 min:** Revalidate in background
- **Stale-while-revalidate:** Up to 10 min stale if needed

### **Database Load:**
- **Without cache:** ~1,000 requests/min (if 1k users/min)
- **With cache:** ~1 request per 5 min

### **Bandwidth:**
- Embed HTML typically 1-5 KB
- Cached at CDN edge
- Minimal server egress

---

## 🎉 **SUCCESS CRITERIA**

Phase 8 Full is ready when:

✅ **Functionality:**
- Can create, edit, delete, enable/disable embeds
- HTML sanitized on save
- Site fetches from API
- Cache working (5-min TTL)

✅ **Security:**
- XSS attempts blocked
- RBAC enforced
- Audit trail created
- Only ADMIN+ can delete

✅ **Quality:**
- E2E tests pass
- No console errors
- Performance acceptable

✅ **Documentation:**
- Readiness guide complete
- RBAC matrix documented
- Troubleshooting guide

---

## 📞 **SUPPORT**

**If you encounter issues:**
1. Check this readiness guide
2. Review `docs/PR-6-SOCIAL-SCHEMA-SUMMARY.md` through `PR-9`
3. Check Vercel logs for errors
4. Test API endpoints with curl

**Common Resources:**
- Admin UI: `https://admin.khaledaun.com/social`
- Site API: `https://khaledaun.com/api/social-embed/[key]`
- Supabase: Check `social_embeds` table

---

## 🔖 **RELEASE NOTES (v0.8.0-social-admin)**

**Features:**
- Database-driven social media embeds
- Admin CRUD interface with sanitization
- RBAC enforcement (EDITOR+ create, ADMIN+ delete)
- 5-minute ISR caching
- Enable/disable toggle
- Audit trail for all operations

**Security:**
- Server-side HTML sanitization
- XSS protection via allowlisting
- Permission-based access control

**Performance:**
- 5-minute cache (minimal DB load)
- Stale-while-revalidate (never blocking)
- CDN edge caching

**Documentation:**
- Complete readiness guide
- RBAC permission matrix
- Troubleshooting guide
- Migration from env vars

---

**Migration Guide Version:** 1.0  
**Last Updated:** October 16, 2024  
**Compatible with:** Phase 8 Full (v0.8.0-social-admin)

