# Database Migration Guide - Production

## 🎯 Purpose
Update the production database schema to include all Phase 1 Strategic UX tables.

---

## 📋 New Tables Being Added

1. **`linkedin_posts`** - LinkedIn content management
2. **`site_logos`** - Site logo upload and management
3. **`leads`** - Contact form submissions and lead tracking
4. **`case_studies`** - Portfolio case studies
5. **`ai_configs`** - AI provider configuration
6. **`ai_prompt_templates`** - Reusable AI prompts
7. **`subscribers`** - Newsletter subscribers

---

## ⚠️ Important Notes

- **Existing data is safe**: This migration only *adds* new tables
- **No data will be lost**: Existing tables (posts, users, etc.) are unchanged
- **Reversible**: Can be rolled back if needed (Prisma tracks migrations)

---

## 🚀 Option 1: Quick Push (Recommended for Development)

**Use this if**: You're comfortable with Prisma's automatic schema sync.

### Steps:

1. **Get your production DATABASE_URL** from Vercel:
   ```bash
   # On Vercel dashboard, go to your project > Settings > Environment Variables
   # Copy the DATABASE_URL value
   ```

2. **Run from the `packages/db` directory**:
   ```bash
   cd packages/db
   
   # Set the environment variable (Windows PowerShell)
   $env:DATABASE_URL="your-production-database-url-here"
   
   # Push schema
   npx prisma db push
   ```

3. **Verify tables created**:
   ```bash
   npx prisma studio
   # Or check in Supabase dashboard
   ```

---

## 🔒 Option 2: Proper Migration (Recommended for Production)

**Use this if**: You want version-controlled, trackable migrations.

### Steps:

1. **Create migration from current schema**:
   ```bash
   cd packages/db
   
   # Create migration file
   npx prisma migrate dev --name phase1_strategic_ux_tables
   ```

2. **Deploy to production**:
   ```bash
   # Set production DATABASE_URL
   $env:DATABASE_URL="your-production-database-url-here"
   
   # Deploy migration
   npx prisma migrate deploy
   ```

3. **Commit migration files**:
   ```bash
   git add packages/db/prisma/migrations
   git commit -m "feat: add Phase 1 Strategic UX database tables"
   git push origin main
   ```

---

## 🔍 Verification Checklist

After migration, verify each table exists:

### Using Prisma Studio:
```bash
cd packages/db
$env:DATABASE_URL="your-production-url"
npx prisma studio
```

### Using SQL (Supabase):
```sql
-- Check all new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'linkedin_posts',
    'site_logos',
    'leads',
    'case_studies',
    'ai_configs',
    'ai_prompt_templates',
    'subscribers'
  );
```

Expected result: 7 rows returned.

---

## 🧪 Post-Migration Testing

### 1. Test LinkedIn Posts API
```bash
# Should return 200 with empty array (not 500 error)
curl https://www.khaledaun.com/api/social-embed/LINKEDIN_POSTS
```

### 2. Test Site Logo API
```bash
# Should return 200 with null (not 500 error)
curl https://www.khaledaun.com/api/site-logo
```

### 3. Test Leads API (Admin)
```bash
# Should return 200 with empty array
curl https://admin.khaledaun.com/api/admin/leads
```

### 4. Test Case Studies API (Admin)
```bash
# Should return 200 with empty array
curl https://admin.khaledaun.com/api/admin/case-studies
```

### 5. Test AI Config API (Admin)
```bash
# Should return 200 with empty array
curl https://admin.khaledaun.com/api/admin/ai-config
```

---

## 🐛 Troubleshooting

### Issue: "The table does not exist in the current database"
**Solution**: Run the migration again. Prisma might have failed silently.

### Issue: "Migration failed: relation already exists"
**Solution**: One or more tables already exist. Use `--skip-seed` flag:
```bash
npx prisma migrate deploy --skip-seed
```

### Issue: "Cannot connect to database"
**Solution**: Check your DATABASE_URL:
- Ensure it starts with `postgresql://`
- Verify username/password are correct
- Check that connection pooling is enabled (Supabase: use `?pgbouncer=true`)

### Issue: "Prisma Client is out of sync"
**Solution**: Regenerate Prisma Client:
```bash
npx prisma generate
```

---

## 🎯 Quick Commands Reference

### Windows PowerShell:
```powershell
# Navigate to db package
cd packages/db

# Set production URL
$env:DATABASE_URL="your-production-url-here"

# Quick push (no migration files)
npx prisma db push

# Or proper migration
npx prisma migrate deploy

# Verify
npx prisma studio
```

### Bash/Linux/Mac:
```bash
# Navigate to db package
cd packages/db

# Set production URL
export DATABASE_URL="your-production-url-here"

# Quick push (no migration files)
npx prisma db push

# Or proper migration
npx prisma migrate deploy

# Verify
npx prisma studio
```

---

## 📊 Expected Migration Output

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database

🚀  Your database is now in sync with your Prisma schema. Done in 2.50s

✔ Generated Prisma Client (5.22.0)
```

---

## ⏭️ After Migration

1. **Reload both deployed apps** to ensure they pick up new schema
2. **Test each feature** using the admin dashboard
3. **Create sample data** for testing:
   - Add a LinkedIn post
   - Upload a site logo
   - Submit a contact form
   - Create a case study
   - Configure an AI provider

---

## 🆘 Need Help?

If migration fails or you encounter issues:
1. Check Vercel build logs for detailed errors
2. Verify DATABASE_URL is correct (copy directly from Vercel)
3. Try `npx prisma migrate reset` in development to test migration locally first
4. Check Supabase logs for connection issues

---

**Ready to proceed?** Choose Option 1 (Quick Push) or Option 2 (Proper Migration) and follow the steps above.

