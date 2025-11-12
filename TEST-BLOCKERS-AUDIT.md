# Comprehensive Test Blockers Audit

## Critical Issues Found

### 1. ✅ FIXED: Missing Columns in `content_library` Table
- **Status**: SQL script created (`apps/admin/fix-content-library-schema.sql`)
- **Missing Columns**: 
  - `publish_targets`, `publish_status`, `published_links`, `last_publish_error`, `publish_attempts`, `last_publish_attempt` (Sprint 4)
  - `email_notification_sent`, `email_notification_sent_at`, `email_notification_campaign_id` (Sprint 5)
- **Action Required**: Run the SQL script in Supabase SQL Editor

### 2. ✅ FIXED: Missing Columns in `crm_leads` Table
- **Status**: SQL script created (`apps/admin/fix-crm-leads-schema.sql`)
- **Missing Columns**: 
  - `hubspot_sync_error`, `referrer`, `assigned_to`, `notes`, `last_contacted_at`, `next_follow_up_at`
- **Action Required**: Already created, verify it was run

### 3. ✅ FIXED: Missing Models in `packages/db/prisma/schema.prisma`
- **Status**: Added `ContentLibrary`, `Topic`, and `MediaLibrary` models to shared schema
- **Location**: `packages/db/prisma/schema.prisma` lines 764-878
- **Impact**: Tests can now access `prisma.contentLibrary`, `prisma.topic`, and `prisma.mediaLibrary`
- **Action Required**: Regenerate Prisma Client: `cd packages/db && npx prisma generate`

### 4. ⚠️ MODEL MISMATCH: API Routes vs Test Schema
- **Issue**: Admin API routes use `prisma.post`, `prisma.audit`, `prisma.lead` but tests use `prisma.contentLibrary`
- **Files Affected**:
  - `apps/admin/app/api/admin/posts/route.ts` → uses `prisma.post`
  - `apps/admin/app/api/admin/audit/route.ts` → uses `prisma.audit`
  - `apps/admin/app/api/admin/leads/route.ts` → uses `prisma.lead`
- **Test Files**:
  - `apps/tests/e2e/human-like/test-utils.human.ts` → uses `prisma.contentLibrary`, `prisma.topic`
- **Impact**: Tests may be testing different models than what the API actually uses
- **Action Required**: Verify test coverage matches actual API usage

### 5. ⚠️ AUTHENTICATION BYPASS: Test Mode Middleware
- **Issue**: Tests use `x-test-mode: true` header to bypass auth
- **Location**: `apps/admin/middleware.ts` line 69
- **Risk**: If middleware logic changes, tests may break silently
- **Action Required**: 
  - Ensure test mode is only active in test environment
  - Consider using proper mock auth tokens instead

### 6. ⚠️ MISSING ENVIRONMENT VARIABLES
- **Potential Issue**: Tests may require env vars that aren't set
- **Required Variables** (from Playwright config):
  - `BASE_URL` (defaults to `http://localhost:3000`)
  - `DATABASE_URL` and `DIRECT_URL` (for Prisma)
  - `NODE_ENV=test` (for middleware bypass)
- **Action Required**: Verify `.env.test` exists with all required vars

### 7. ⚠️ MISSING FOREIGN KEY CONSTRAINTS
- **Potential Issue**: `publish_jobs.content_id` references `content_library.id` but foreign key may not exist
- **Location**: `packages/db/prisma/schema.prisma` line 667
- **Note**: Comment says "References ContentLibrary in admin, but stored as string here"
- **Impact**: Referential integrity not enforced, could cause orphaned records
- **Action Required**: Consider adding foreign key if both tables are in same schema

### 8. ⚠️ INDEX MISSING: Content Library
- **Issue**: `content_library` table may be missing indexes
- **Expected Indexes** (from Prisma schema):
  - `status`, `type`, `topicId`, `publishedAt`, `scheduledFor`, `publishStatus`
- **Action Required**: Verify indexes exist in database

### 9. ✅ VERIFIED: Playwright Web Server Configuration
- **Status**: `npm run dev:admin` exists in root `package.json` (line 6)
- **Script**: `pnpm --filter @khaledaun/admin dev`
- **Action Required**: None - configuration is correct

### 10. ⚠️ TEST DATA CLEANUP
- **Issue**: `setupHumanTestData` conditionally cleans models that may not exist
- **Location**: `apps/tests/e2e/human-like/test-utils.human.ts` lines 150-238
- **Risk**: If model doesn't exist in Prisma Client, cleanup silently fails
- **Action Required**: Ensure all models exist in `@khaledaun/db` schema OR handle gracefully

### 11. ⚠️ MODEL NAME MISMATCHES
- **Issue**: Admin schema uses `Lead` but shared schema might not
- **Files**: 
  - Admin API: `apps/admin/app/api/admin/leads/route.ts` uses `prisma.lead`
  - Shared schema: Check if `Lead` exists in `packages/db/prisma/schema.prisma`
- **Action Required**: Verify consistency across schemas

### 12. ⚠️ MISSING RELATIONS
- **Issue**: `ContentLibrary.emailCampaign` relation requires `EmailCampaign` model
- **Location**: `apps/admin/prisma/schema.prisma` line 712
- **Action Required**: Ensure foreign key constraint exists in database

## Recommended Actions (Priority Order)

### Immediate (Before Running Tests)
1. ✅ Run `fix-content-library-schema.sql` in Supabase
2. ✅ Verify `fix-crm-leads-schema.sql` was run
3. ⚠️ **NEW**: Add `ContentLibrary` and `Topic` models to `packages/db/prisma/schema.prisma`
4. ⚠️ **NEW**: Regenerate Prisma Client: `cd packages/db && npx prisma generate`
5. ⚠️ **NEW**: Verify `npm run dev:admin` script exists or update Playwright config

### Short Term (This Week)
6. Review and align test models with API route models
7. Add missing indexes to database
8. Create `.env.test` file with required variables
9. Verify foreign key constraints exist

### Medium Term (Next Sprint)
10. Refactor to use single source of truth for Prisma schema
11. Improve test mode authentication (use proper mocks)
12. Add database migration checks to test setup

## Files to Review

- `packages/db/prisma/schema.prisma` - Missing ContentLibrary/Topic models
- `apps/admin/prisma/schema.prisma` - Has ContentLibrary/Topic but different from shared
- `apps/tests/e2e/human-like/test-utils.human.ts` - Uses models that may not exist
- `apps/admin/middleware.ts` - Test mode bypass logic
- `apps/tests/e2e/human-like/playwright.config.human.ts` - Web server config
- Root `package.json` - Verify `dev:admin` script exists

## SQL Scripts Created

1. ✅ `apps/admin/fix-content-library-schema.sql` - Adds Sprint 4/5 columns
2. ✅ `apps/admin/fix-crm-leads-schema.sql` - Adds missing CRM columns
3. ✅ `apps/admin/create-sprint5-tables.sql` - Creates Sprint 5 tables

## Next Steps

1. Run the SQL scripts in Supabase (if not already done)
2. Add missing models to shared Prisma schema
3. Regenerate Prisma Client
4. Run a smoke test to verify schema issues are resolved
5. Review and fix any remaining blockers

