-- Fix database dependencies before Prisma db push
-- This script drops views/constraints that block schema changes

-- Drop the dashboard_stats view that depends on aio_score
DROP VIEW IF EXISTS dashboard_stats CASCADE;

-- Drop the problematic constraint
ALTER TABLE content_library DROP CONSTRAINT IF EXISTS unique_content_slug;

-- Now Prisma db push should work
-- Run: npx prisma db push




