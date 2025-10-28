# ⚡ Quick Setup: Sprint 4 LinkedIn Integration

**Total Time**: ~45 minutes  
**Difficulty**: Medium

---

## 🎯 **What You're Setting Up**

After this setup, you'll be able to:
- Post to LinkedIn instantly from admin panel
- Schedule LinkedIn posts for future publishing
- Track publishing status and errors
- Automatic retries if posting fails

---

## 📋 **Setup Steps**

### **Step 1: Create LinkedIn App** (~15 minutes)

1. **Go to** [LinkedIn Developers](https://www.linkedin.com/developers/)
2. **Click** "Create app"
3. **Fill in**:
   - App name: "Khaled Aun CMS"
   - LinkedIn Page: (Select your company page or create one)
   - Privacy policy URL: `https://khaledaun.com/privacy`
   - App logo: (Upload any image)
4. **Click** "Create app"
5. **Go to** "Auth" tab
6. **Copy** Client ID and Client Secret
7. **Add redirect URL**: `https://admin.khaledaun.com/api/auth/linkedin/callback`
8. **Request** "Sign In with LinkedIn" product (should be auto-approved)
9. **Request** "Share on LinkedIn" product
   - Click "Request access"
   - Fill form (say you're building a CMS to publish content)
   - Wait for approval (usually instant, max 24 hours)

✅ **You now have**: Client ID, Client Secret

---

### **Step 2: Generate Encryption Key** (~2 minutes)

**Option A: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option C: Online** (not recommended for production)
- Visit https://generate-random.org/encryption-key-generator
- Select "256-bit" key

✅ **Copy the key** - You'll need it in the next step

---

### **Step 3: Add Environment Variables to Vercel** (~5 minutes)

1. **Go to** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Select** your admin project
3. **Go to** Settings → Environment Variables
4. **Add these variables** (one at a time):

```env
LINKEDIN_CLIENT_ID=your_client_id_from_step_1
LINKEDIN_CLIENT_SECRET=your_client_secret_from_step_1
LINKEDIN_REDIRECT_URI=https://admin.khaledaun.com/api/auth/linkedin/callback
LINKEDIN_SCOPES=w_member_social
LINKEDIN_ENCRYPTION_KEY=your_generated_key_from_step_2
CRON_SECRET=any_random_string_you_want
```

5. **Apply to** all environments (Production, Preview, Development)
6. **Click** "Save"

✅ **Environment configured**

---

### **Step 4: Run Database Migration** (~5 minutes)

1. **Open** `sprint4-migration.sql` in your editor
2. **Copy** the entire file contents
3. **Go to** [Supabase Dashboard](https://supabase.com/dashboard)
4. **Select** your project
5. **Click** SQL Editor (left sidebar)
6. **Paste** the migration SQL
7. **Click** "Run"
8. **Verify** you see: `"Sprint 4 migration completed successfully!"`

**What this creates**:
- `social_accounts` table
- `publish_jobs` table
- `user_roles` table
- `newsletter_subscribers` table
- Updates to `content_library`
- RLS policies

✅ **Database ready**

---

### **Step 5: Create Admin User** (~5 minutes)

**If you haven't already from Phase 4A**:

1. **Go to** Supabase Dashboard → Authentication → Users
2. **Click** "Add user"
3. **Enter**:
   - Email: your email
   - Password: secure password
4. **Click** "Create user"
5. **Copy** the User ID (UUID)

6. **Go to** SQL Editor
7. **Run**:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('your-uuid-here', 'admin');
```

✅ **You're an admin**

---

### **Step 6: Redeploy Admin App** (~3 minutes)

Vercel might have already auto-deployed after you pushed. Check:

1. **Go to** Vercel Dashboard → Deployments
2. **If** latest deployment is before your push → Click "Redeploy"
3. **Wait** for build to complete (~2 minutes)

✅ **Deployed with new code**

---

### **Step 7: Test Auth** (~5 minutes)

1. **Visit** https://admin.khaledaun.com
2. Should redirect to `/auth/login`
3. **Login** with your credentials from Step 5
4. Should redirect to Command Center
5. **Success!** ✅

---

### **Step 8: Connect LinkedIn** (~5 minutes)

1. **Visit** https://admin.khaledaun.com/social
2. **Click** "Connect LinkedIn Account"
3. **Approve** on LinkedIn
4. Should redirect back to `/social` with success message
5. **Verify** account shows as "Connected"

✅ **LinkedIn connected**

---

### **Step 9: Test Posting** (~5 minutes)

1. **Go to** Content Library
2. **Create or edit** a content item
3. Add title and some content
4. **Look for** "Post to LinkedIn Now" button (or you can add the components to the editor)
5. **Click** the button
6. **Wait** for response
7. **Check** your LinkedIn profile - post should appear!
8. **Verify** permalink is captured

✅ **Posting works!**

---

### **Step 10: Test Scheduling** (~5 minutes)

1. **In** content editor
2. **Click** "Schedule on LinkedIn"
3. **Pick** a time 2-3 minutes from now
4. **Click** "Schedule"
5. **Wait** for the scheduled time
6. **Refresh** page - status should update to "posted"
7. **Check** LinkedIn - post should appear

✅ **Scheduling works!**

---

## ✅ **Final Checklist**

- [ ] LinkedIn app created
- [ ] Encryption key generated
- [ ] Environment variables added to Vercel
- [ ] Database migration run
- [ ] Admin user created
- [ ] Can login to admin panel
- [ ] LinkedIn account connected
- [ ] Test post successful
- [ ] Scheduled post successful

**All done?** 🎉 **You're ready to use Sprint 4!**

---

## 🐛 **Common Issues**

### **"LinkedIn app not approved"**
- Check LinkedIn developer dashboard
- "Share on LinkedIn" product must be approved
- Usually takes seconds, max 24 hours

### **"Invalid client credentials"**
- Double-check CLIENT_ID and CLIENT_SECRET
- Make sure no extra spaces
- Verify in LinkedIn app settings

### **"Invalid redirect URI"**
- Must exactly match: `https://admin.khaledaun.com/api/auth/linkedin/callback`
- Check for trailing slash (don't include it)
- Verify in both LinkedIn app AND Vercel env vars

### **"Token expired"**
- Click "Reconnect LinkedIn" on `/social` page
- Tokens expire after 60 days
- Refresh happens automatically, but might need manual trigger first time

### **"Encryption error"**
- Make sure LINKEDIN_ENCRYPTION_KEY is exactly 64 hex characters
- Regenerate if needed
- Don't include quotes in env var

### **"Cron not running"**
- Check Vercel Dashboard → Cron Jobs
- Verify cron is active
- Manual trigger: `curl https://admin.khaledaun.com/api/scheduler/run`

---

## 📊 **Verify Everything Works**

Run these checks:

### **1. Health Check**
```bash
curl https://admin.khaledaun.com/api/health
```
Should return:
```json
{
  "status": "healthy",
  "checks": {
    "db": true,
    "storage": true,
    "adminAuth": true
  }
}
```

### **2. LinkedIn Status**
Visit: https://admin.khaledaun.com/social

Should show:
- ✅ Connected
- Account name
- Expiry date
- Active status

### **3. Cron Job**
Visit Vercel Dashboard → Cron Jobs

Should show:
- Path: `/api/scheduler/run`
- Schedule: `* * * * *` (every minute)
- Status: Active

---

## 🎉 **Success!**

You now have:
- 🔐 Secure admin panel
- 🔗 LinkedIn OAuth connected
- 📝 One-click posting
- 📅 Scheduled publishing
- 🔄 Automatic retries
- 📊 Status tracking

**Ready to post to LinkedIn automatically!** 🚀

---

## 🔜 **What's Next?**

Now that Sprint 4 is set up, you can:
1. **Create content** in the CMS
2. **Post to LinkedIn** with one click
3. **Schedule posts** for optimal times
4. **Track** publishing status

**Or** start working on:
- Sprint 5A: Instagram integration
- Sprint 5B: Email newsletter
- Sprint 5C: Analytics dashboard

---

**Need help?** Check `SPRINT-4-COMPLETE.md` for full documentation.

**Found a bug?** Check the troubleshooting section above.

**Ready to continue?** Let me know what feature you want next!

