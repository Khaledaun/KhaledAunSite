-- Update posts table to match Phase 6 Lite schema
-- Run this in Supabase SQL Editor

-- Add missing columns to posts table
DO $$ BEGIN
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='title') THEN
        ALTER TABLE "posts" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Untitled';
    END IF;
    
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='slug') THEN
        ALTER TABLE "posts" ADD COLUMN "slug" TEXT;
        -- Create unique index
        CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_key" ON "posts"("slug");
    END IF;
    
    -- Add excerpt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='excerpt') THEN
        ALTER TABLE "posts" ADD COLUMN "excerpt" TEXT;
    END IF;
    
    -- Add content column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='content') THEN
        ALTER TABLE "posts" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';
    END IF;
    
    -- Add createdAt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='createdAt') THEN
        ALTER TABLE "posts" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Add updatedAt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='updatedAt') THEN
        ALTER TABLE "posts" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Success message
SELECT 'Posts table updated successfully!' as message;

