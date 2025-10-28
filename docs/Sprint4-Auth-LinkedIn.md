# Sprint 4: Auth + LinkedIn Integration

**Start Date**: October 28, 2024  
**Status**: 🚧 **IN PROGRESS**  
**Complexity**: HIGH (14 tasks)

---

## 📋 **Overview**

Sprint 4 delivers production-ready security and LinkedIn integration:
1. **Supabase Auth + RBAC** - Lock admin panel with role-based access
2. **LinkedIn Integration** - OAuth + posting (immediate & scheduled)
3. **Security Hardening** - noindex, logging, health checks
4. **Scheduler** - Queue with retry logic
5. **Observability** - Pino logging, enhanced health checks

---

## 🗄️ **Database Migration**

### **Run This First**
Execute `sprint4-migration.sql` in Supabase SQL Editor

### **New Tables**:
1. **social_accounts** - OAuth tokens (LinkedIn, Instagram, etc.)
2. **publish_jobs** - Scheduled posts queue
3. **user_roles** - RBAC (admin, editor, viewer)
4. **newsletter_subscribers** - Email list (stretch goal)

### **Updated Tables**:
- **content_library** - Added publishing fields:
  - `scheduled_for` - When to publish
  - `publish_targets` - Platforms array
  - `publish_status` - draft|queued|posting|posted|failed
  - `published_links` - JSON of platform URLs
  - `last_publish_error` - Error messages
  - `publish_attempts` - Retry counter

---

## 🔐 **Authentication Setup**

### **Supabase Auth Configuration**

1. **Enable Email Auth** in Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable Email provider
   - Set site URL: `https://admin.khaledaun.com`
   - Set redirect URLs: `https://admin.khaledaun.com/auth/callback`

2. **Create First Admin User**:
   ```sql
   -- In Supabase SQL Editor
   -- Get user ID from Authentication > Users
   INSERT INTO user_roles (user_id, role)
   VALUES ('YOUR_USER_UUID', 'admin');
   ```

3. **Environment Variables**:
   ```env
   # Already set (verify in Vercel)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## 🔗 **LinkedIn App Setup**

### **Step 1: Create LinkedIn App**

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in details:
   - **App name**: KhaledAun Admin
   - **LinkedIn Page**: Your company page
   - **App logo**: Upload logo
   - **Legal agreement**: Accept

### **Step 2: Configure OAuth**

1. Go to **Auth** tab
2. Add Redirect URLs:
   ```
   https://admin.khaledaun.com/api/auth/linkedin/callback
   http://localhost:3000/api/auth/linkedin/callback (for testing)
   ```
3. Request Products:
   - **Sign In with LinkedIn**
   - **Share on LinkedIn** (for posting)

### **Step 3: Get Credentials**

1. Go to **Auth** tab
2. Copy **Client ID** and **Client Secret**
3. Note the **OAuth 2.0 scopes**:
   - `r_liteprofile` - Basic profile info
   - `w_member_social` - Post to LinkedIn

### **Step 4: Add to Environment Variables**

```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=https://admin.khaledaun.com/api/auth/linkedin/callback
LINKEDIN_SCOPES=r_liteprofile,w_member_social

# Optional: For token refresh
LINKEDIN_REFRESH_SECRET=random_32_char_secret_for_encryption
```

---

## 🔧 **Required Environment Variables**

### **Add to Vercel**

```bash
# Supabase (already set, verify)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# LinkedIn OAuth (NEW)
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=https://admin.khaledaun.com/api/auth/linkedin/callback
LINKEDIN_SCOPES=r_liteprofile,w_member_social
LINKEDIN_REFRESH_SECRET=... # Generate: openssl rand -hex 32

# Encryption (NEW - for token storage)
ENCRYPTION_KEY=... # Generate: openssl rand -hex 32

# Logging (NEW)
LOG_LEVEL=info # production: info, development: debug
```

### **Local Development (.env.local)**

```env
# Copy from Vercel, but use localhost URLs
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
LINKEDIN_SCOPES=r_liteprofile,w_member_social
LINKEDIN_REFRESH_SECRET=...
ENCRYPTION_KEY=...
LOG_LEVEL=debug
```

---

## 🚀 **Usage Guide**

### **1. Connecting LinkedIn Account**

1. Log in to admin panel
2. Go to `/social`
3. Click "Connect LinkedIn"
4. Authorize the app
5. You'll be redirected back with account connected

### **2. Posting to LinkedIn Now**

1. Create or edit content at `/content/[id]`
2. Ensure content has:
   - Title
   - Content (text)
   - Optional: Featured image
3. Click "Post to LinkedIn Now"
4. Status updates in real-time
5. Permalink stored when successful

### **3. Scheduling LinkedIn Posts**

1. In content editor `/content/[id]`
2. Set "Schedule on LinkedIn" datetime picker
3. Click "Schedule"
4. Post will publish automatically at scheduled time
5. Check status in publish log panel

### **4. Managing Roles**

Admin users can assign roles:

```sql
-- Make someone an editor
INSERT INTO user_roles (user_id, role)
VALUES ('user_uuid_here', 'editor');

-- Make someone a viewer
INSERT INTO user_roles (user_id, role)
VALUES ('user_uuid_here', 'viewer');

-- Remove role
DELETE FROM user_roles 
WHERE user_id = 'user_uuid_here' AND role = 'editor';
```

**Permissions**:
- **admin**: Full access, can manage users and settings
- **editor**: Can create/edit content, cannot access settings
- **viewer**: Read-only access

---

## 🔍 **Testing**

### **Auth Testing**

1. **Anonymous Access**:
   - Visit `/admin/posts` (not logged in)
   - Should redirect to `/login`

2. **Role Restrictions**:
   - Log in as `editor`
   - Try to access `/admin/settings`
   - Should see "Forbidden" error

3. **Login Flow**:
   - Go to `/login`
   - Enter email/password
   - Should redirect to `/command-center`

### **LinkedIn Testing**

1. **Connect Account**:
   - Go to `/social`
   - Click "Connect LinkedIn"
   - Complete OAuth flow
   - Verify account appears in social_accounts table

2. **Post Now**:
   - Create content with text
   - Click "Post to LinkedIn Now"
   - Wait for status update
   - Verify post appears on LinkedIn
   - Check `published_links` has LinkedIn URL

3. **Schedule Post**:
   - Create content
   - Set schedule for 5 minutes from now
   - Wait for scheduled time
   - Verify post publishes automatically
   - Check `publish_status` changes to `posted`

4. **Retry Logic**:
   - Revoke LinkedIn token (LinkedIn settings)
   - Try to post
   - Verify job retries 3 times
   - Check `last_publish_error` has error message

### **Health Check**:

```bash
curl https://admin.khaledaun.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-10-28T...",
  "checks": {
    "db": true,
    "storage": true,
    "adminAuth": true
  }
}
```

---

## 🛡️ **Security**

### **Implemented**:
- ✅ RLS policies on all tables
- ✅ Encrypted token storage (AES-256-GCM)
- ✅ Role-based access control
- ✅ noindex headers on `/admin/**`
- ✅ robots.txt disallows `/admin`
- ✅ Server-side session validation
- ✅ CSRF protection (Next.js built-in)

### **Token Encryption**:

Tokens are encrypted before storage:
```typescript
// Encryption uses AES-256-GCM
const encrypted = encrypt(token, process.env.ENCRYPTION_KEY)
// Stored in database as encrypted text
```

### **Access Control**:

```typescript
// Middleware checks:
1. Is user authenticated? → No: redirect to /login
2. Does route require role? → Check user_roles table
3. Does user have required role? → No: return 403
```

---

## 📊 **Monitoring**

### **Logs**

All logs are structured JSON (Pino):

```json
{
  "level": "info",
  "time": 1698505200000,
  "msg": "LinkedIn post published",
  "contentId": "abc-123",
  "platform": "linkedin",
  "permalink": "https://linkedin.com/feed/update/...",
  "attempts": 1
}
```

**Log Levels**:
- `error`: Critical failures
- `warn`: Recoverable issues
- `info`: Important events (posts, auth)
- `debug`: Detailed debugging (dev only)

### **Health Checks**

`GET /api/health` checks:
- Database connectivity
- Supabase Storage connectivity
- Auth system operational

**Use for**:
- Vercel monitoring
- Uptime checks
- Alerting

---

## 🔄 **Scheduler**

### **How It Works**:

1. **Vercel Cron** calls `/api/scheduler/run` every minute
2. Finds pending jobs where `scheduled_for <= NOW()`
3. Processes each job:
   - Change status to `processing`
   - Call platform API (LinkedIn)
   - If success: Update content with permalink, status = `posted`
   - If failure: Increment attempts, retry with backoff

### **Retry Logic**:

```
Attempt 1: Immediate
Attempt 2: Wait 2 minutes
Attempt 3: Wait 4 minutes
After 3 failures: Mark as `failed`
```

### **Cron Configuration** (`vercel.json`):

```json
{
  "crons": [{
    "path": "/api/scheduler/run",
    "schedule": "* * * * *"
  }]
}
```

---

## 🚨 **Rollback Steps**

### **If Issues Occur**:

1. **Disable Cron**:
   ```bash
   # Comment out in vercel.json
   # "crons": [...]
   # Redeploy
   ```

2. **Revert Migration**:
   ```sql
   -- In Supabase SQL Editor
   DROP TABLE IF EXISTS publish_jobs CASCADE;
   DROP TABLE IF EXISTS social_accounts CASCADE;
   DROP TABLE IF EXISTS user_roles CASCADE;
   DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
   
   ALTER TABLE content_library 
   DROP COLUMN IF EXISTS publish_targets,
   DROP COLUMN IF EXISTS publish_status,
   DROP COLUMN IF EXISTS published_links,
   DROP COLUMN IF EXISTS last_publish_error,
   DROP COLUMN IF EXISTS publish_attempts,
   DROP COLUMN IF EXISTS last_publish_attempt;
   ```

3. **Remove Auth**:
   - Remove middleware file
   - Delete login/logout pages
   - Redeploy

---

## 📝 **API Reference**

### **LinkedIn Posting**

```typescript
POST /api/linkedin/post
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "contentId": "abc-123",
  "text": "Post content here",
  "imageUrl": "https://...", // Optional
  "linkUrl": "https://...",   // Optional
  "scheduled": false          // true for queue, false for immediate
}

Response:
{
  "success": true,
  "permalink": "https://linkedin.com/feed/update/urn:...",
  "jobId": "job-uuid" // If scheduled
}
```

### **Social Accounts**

```typescript
GET /api/social/accounts
// Returns connected accounts

POST /api/social/revoke/:provider
// Revokes connection

GET /api/auth/linkedin
// Starts OAuth flow
```

---

## 🎯 **Success Criteria**

Sprint 4 is successful when:

- [ ] Anonymous users cannot access `/admin/**`
- [ ] Editor cannot access `/admin/settings`
- [ ] Admin can access everything
- [ ] LinkedIn OAuth flow completes
- [ ] "Post Now" publishes immediately
- [ ] Scheduled posts publish on time
- [ ] Failed posts retry 3 times
- [ ] `/api/health` returns all checks passing
- [ ] robots.txt disallows `/admin`
- [ ] `/admin/**` has noindex headers
- [ ] Logs are structured and useful
- [ ] All tests pass

---

## 📦 **Deliverables**

1. **Code**:
   - Auth middleware
   - Login/logout pages
   - LinkedIn OAuth
   - Posting API
   - Scheduler
   - Logging
   - Health checks

2. **Database**:
   - Migration SQL
   - Updated Prisma schema
   - RLS policies

3. **Configuration**:
   - vercel.json with cron
   - Environment variables documented
   - robots.txt updated

4. **Documentation**:
   - This guide
   - API reference
   - Testing steps
   - Rollback procedure

---

## 🚀 **Deployment**

1. Run migration in Supabase
2. Set environment variables in Vercel
3. Deploy to preview
4. Test all features
5. Promote to production

---

**Sprint 4 Status**: 🚧 **IN PROGRESS**  
**Estimated Completion**: 8-10 hours of focused work  
**Complexity**: HIGH (Auth + OAuth + Scheduler + Security)

---

*Building a production-ready system! 💪*

