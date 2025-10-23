-- Fix existing tables by adding missing columns
-- Run this FIRST before the full migration

-- Check and add missing columns to leads table if it exists
DO $$
BEGIN
    -- Add created_at if missing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'created_at') THEN
            ALTER TABLE public.leads ADD COLUMN created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added created_at to leads table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'updated_at') THEN
            ALTER TABLE public.leads ADD COLUMN updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added updated_at to leads table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'expires_at') THEN
            ALTER TABLE public.leads ADD COLUMN expires_at TIMESTAMP(3);
            RAISE NOTICE 'Added expires_at to leads table';
        END IF;
    END IF;
    
    -- Similarly for other tables that might exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'case_studies') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'case_studies' AND column_name = 'author_id') THEN
            -- Get a valid user ID or use a placeholder
            DECLARE
                first_user_id TEXT;
            BEGIN
                SELECT id INTO first_user_id FROM public.users LIMIT 1;
                IF first_user_id IS NOT NULL THEN
                    EXECUTE format('ALTER TABLE public.case_studies ADD COLUMN author_id TEXT NOT NULL DEFAULT %L', first_user_id);
                    RAISE NOTICE 'Added author_id to case_studies table';
                ELSE
                    RAISE NOTICE 'No users found - skipping author_id for case_studies';
                END IF;
            END;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'case_studies' AND column_name = 'featured_image_id') THEN
            ALTER TABLE public.case_studies ADD COLUMN featured_image_id TEXT;
            RAISE NOTICE 'Added featured_image_id to case_studies table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'case_studies' AND column_name = 'created_at') THEN
            ALTER TABLE public.case_studies ADD COLUMN created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added created_at to case_studies table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'case_studies' AND column_name = 'updated_at') THEN
            ALTER TABLE public.case_studies ADD COLUMN updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added updated_at to case_studies table';
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_configs') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ai_configs' AND column_name = 'created_at') THEN
            ALTER TABLE public.ai_configs ADD COLUMN created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added created_at to ai_configs table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ai_configs' AND column_name = 'updated_at') THEN
            ALTER TABLE public.ai_configs ADD COLUMN updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added updated_at to ai_configs table';
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_prompt_templates') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ai_prompt_templates' AND column_name = 'created_at') THEN
            ALTER TABLE public.ai_prompt_templates ADD COLUMN created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added created_at to ai_prompt_templates table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ai_prompt_templates' AND column_name = 'updated_at') THEN
            ALTER TABLE public.ai_prompt_templates ADD COLUMN updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added updated_at to ai_prompt_templates table';
        END IF;
    END IF;
END $$;

-- Now create indexes safely
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'leads' AND indexname = 'idx_leads_status_created') THEN
            CREATE INDEX idx_leads_status_created ON public.leads(status, created_at);
            RAISE NOTICE 'Created index idx_leads_status_created';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'leads' AND indexname = 'idx_leads_email') THEN
            CREATE INDEX idx_leads_email ON public.leads(email);
            RAISE NOTICE 'Created index idx_leads_email';
        END IF;
    END IF;
END $$;

-- Success
DO $$
BEGIN
    RAISE NOTICE '✅ Fixed existing tables successfully!';
END $$;

