-- Phase 6 Lite: Create missing tables for CMS
-- Run this in Supabase SQL Editor

-- 1. Create Role enum type
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create PostStatus enum type
DO $$ BEGIN
    CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- 4. Create audits table
CREATE TABLE IF NOT EXISTS "audits" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- 5. Create job_runs table
CREATE TABLE IF NOT EXISTS "job_runs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

-- 6. Update posts table to add missing columns if needed
DO $$ BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='status') THEN
        ALTER TABLE "posts" ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'DRAFT';
    END IF;
    
    -- Add authorId column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='authorId') THEN
        ALTER TABLE "posts" ADD COLUMN "authorId" TEXT;
    END IF;
    
    -- Add publishedAt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='publishedAt') THEN
        ALTER TABLE "posts" ADD COLUMN "publishedAt" TIMESTAMP(3);
    END IF;
END $$;

-- 7. Add foreign key constraints
DO $$ BEGIN
    -- Add FK from posts to users
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_authorId_fkey') THEN
        ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" 
        FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Add FK from audits to users
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audits_actorId_fkey') THEN
        ALTER TABLE "audits" ADD CONSTRAINT "audits_actorId_fkey" 
        FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Success message
SELECT 'Database schema updated successfully!' as message;

