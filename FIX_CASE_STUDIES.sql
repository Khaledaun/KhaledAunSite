-- Fix case_studies table specifically
-- Run this before the main migration

DO $$
DECLARE
    first_user_id TEXT;
BEGIN
    -- Check if case_studies table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'case_studies') THEN
        
        -- Add author_id if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'case_studies' AND column_name = 'author_id') THEN
            -- Get first user ID
            SELECT id INTO first_user_id FROM public.users LIMIT 1;
            
            IF first_user_id IS NOT NULL THEN
                -- Add column with default value
                EXECUTE format('ALTER TABLE public.case_studies ADD COLUMN author_id TEXT NOT NULL DEFAULT %L', first_user_id);
                RAISE NOTICE 'Added author_id to case_studies with default user: %', first_user_id;
            ELSE
                -- No users exist, add as nullable for now
                ALTER TABLE public.case_studies ADD COLUMN author_id TEXT;
                RAISE NOTICE 'Added author_id to case_studies as nullable (no users found)';
            END IF;
        END IF;
        
        -- Add featured_image_id if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'case_studies' AND column_name = 'featured_image_id') THEN
            ALTER TABLE public.case_studies ADD COLUMN featured_image_id TEXT;
            RAISE NOTICE 'Added featured_image_id to case_studies';
        END IF;
        
        -- Add timestamps if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'case_studies' AND column_name = 'created_at') THEN
            ALTER TABLE public.case_studies ADD COLUMN created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added created_at to case_studies';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'case_studies' AND column_name = 'updated_at') THEN
            ALTER TABLE public.case_studies ADD COLUMN updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added updated_at to case_studies';
        END IF;
        
    END IF;
END $$;

-- Success
SELECT '✅ case_studies table fixed!' as status;

