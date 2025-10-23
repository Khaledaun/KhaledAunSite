-- Phase 1 Strategic UX: Create Missing Tables
-- Run this in Supabase SQL Editor

-- 1. Site Logo Management
CREATE TABLE IF NOT EXISTS public.site_logos (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    alt TEXT DEFAULT 'Khaled Aun',
    width INTEGER,
    height INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 2. LinkedIn Posts
CREATE TABLE IF NOT EXISTS public.linkedin_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    linkedin_url TEXT,
    published BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    author_id TEXT NOT NULL,
    ai_generated BOOLEAN DEFAULT false,
    ai_generation_id TEXT,
    source_post_id TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP(3),
    FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE,
    FOREIGN KEY (ai_generation_id) REFERENCES public.ai_generations(id) ON DELETE SET NULL,
    FOREIGN KEY (source_post_id) REFERENCES public.posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_linkedin_posts_published_pinned ON public.linkedin_posts(published, is_pinned);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_author ON public.linkedin_posts(author_id);

-- 3. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'newsletter_signup',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- 4. Leads & Collaborations
DO $$ BEGIN
    CREATE TYPE lead_interest AS ENUM ('COLLABORATION', 'SPEAKING', 'REFERRAL', 'PRESS', 'GENERAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_source AS ENUM ('CONTACT_FORM', 'LINKEDIN_EMBED', 'NEWSLETTER', 'MANUAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('NEW', 'REPLIED', 'SCHEDULED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization TEXT,
    country TEXT,
    interest lead_interest NOT NULL,
    message TEXT NOT NULL,
    source lead_source NOT NULL,
    status lead_status DEFAULT 'NEW',
    tags TEXT[] DEFAULT '{}',
    next_action_at TIMESTAMP(3),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS idx_leads_status_created ON public.leads(status, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- 5. Case Studies
DO $$ BEGIN
    CREATE TYPE case_study_type AS ENUM ('LITIGATION', 'ARBITRATION', 'ADVISORY', 'VENTURE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.case_studies (
    id TEXT PRIMARY KEY,
    type case_study_type NOT NULL,
    confidential BOOLEAN DEFAULT false,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    problem TEXT NOT NULL,
    strategy TEXT NOT NULL,
    outcome TEXT NOT NULL,
    categories TEXT[] DEFAULT '{}',
    practice_area TEXT,
    year INTEGER,
    jurisdiction TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP(3),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    author_id TEXT NOT NULL,
    featured_image_id TEXT,
    FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE,
    FOREIGN KEY (featured_image_id) REFERENCES public.media_assets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_case_studies_type_published ON public.case_studies(type, published);
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON public.case_studies(slug);

-- 6. AI Configuration
DO $$ BEGIN
    CREATE TYPE ai_provider AS ENUM ('OPENAI', 'ANTHROPIC', 'COHERE', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ai_use_case AS ENUM ('CONTENT_GENERATION', 'TRANSLATION', 'EMAIL_MARKETING', 'SEO_OPTIMIZATION', 'CONTENT_IMPROVEMENT', 'URL_EXTRACTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.ai_configs (
    id TEXT PRIMARY KEY,
    provider ai_provider NOT NULL,
    name TEXT NOT NULL,
    api_key TEXT NOT NULL,
    model TEXT NOT NULL,
    use_cases ai_use_case[] DEFAULT '{}',
    system_prompt TEXT,
    active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_configs_provider_active ON public.ai_configs(provider, active);

-- 7. AI Prompt Templates
CREATE TABLE IF NOT EXISTS public.ai_prompt_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    prompt TEXT NOT NULL,
    use_case ai_use_case NOT NULL,
    tone TEXT,
    language TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_category ON public.ai_prompt_templates(category);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'All Phase 1 tables created successfully!';
END $$;

