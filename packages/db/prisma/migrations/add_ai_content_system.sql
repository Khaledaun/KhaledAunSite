-- AI Content System Migration
-- This adds comprehensive topic research, content generation, and media management

-- Topics table for daily topic research
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  source_type TEXT CHECK (source_type IN ('ai_search', 'web_crawl', 'manual', 'rss')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
  locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  priority INTEGER DEFAULT 0,
  keywords TEXT[],
  relevance_score FLOAT, -- AI-calculated relevance
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  user_notes TEXT,
  metadata JSONB -- flexible field for additional data
);

CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_locked ON topics(locked);
CREATE INDEX IF NOT EXISTS idx_topics_priority ON topics(priority DESC);

-- Content library (unified for blog & LinkedIn)
CREATE TABLE IF NOT EXISTS content_library (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('blog', 'linkedin_post', 'linkedin_article', 'linkedin_carousel')),
  format TEXT, -- 'how-to', 'case-study', 'opinion', 'news', 'tutorial'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- for LinkedIn or meta description
  excerpt TEXT,
  keywords TEXT[],
  seo_score INTEGER,
  word_count INTEGER,
  reading_time_minutes INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  published_to TEXT[], -- ['blog', 'linkedin']
  linkedin_post_id TEXT,
  linkedin_url TEXT,
  blog_post_id TEXT REFERENCES posts(id) ON DELETE SET NULL,
  blog_slug TEXT,
  media_ids TEXT[],
  featured_image_id TEXT,
  tags TEXT[],
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_by TEXT,
  last_edited_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  author_id TEXT,
  metadata JSONB -- AI generation settings, LinkedIn specific data, etc.
);

CREATE INDEX IF NOT EXISTS idx_content_library_status ON content_library(status);
CREATE INDEX IF NOT EXISTS idx_content_library_type ON content_library(type);
CREATE INDEX IF NOT EXISTS idx_content_library_published_at ON content_library(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_library_topic_id ON content_library(topic_id);

-- Media library
CREATE TABLE IF NOT EXISTS media_library (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  filename TEXT NOT NULL,
  original_filename TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'document', 'audio')),
  size_bytes INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER, -- for video/audio
  alt_text TEXT,
  caption TEXT,
  tags TEXT[],
  folder TEXT DEFAULT 'uncategorized',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT,
  used_in_content TEXT[], -- content_library IDs
  metadata JSONB -- EXIF data, processing info, etc.
);

CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(type);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING GIN(tags);

-- Topic sources (websites/RSS feeds to monitor)
CREATE TABLE IF NOT EXISTS topic_sources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  type TEXT CHECK (type IN ('rss', 'website', 'news_api', 'twitter', 'reddit')),
  description TEXT,
  keywords TEXT[], -- filter by these keywords
  exclude_keywords TEXT[],
  enabled BOOLEAN DEFAULT true,
  crawl_frequency_hours INTEGER DEFAULT 24,
  last_crawled_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  topics_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB -- API keys, auth, custom settings
);

CREATE INDEX IF NOT EXISTS idx_topic_sources_enabled ON topic_sources(enabled);
CREATE INDEX IF NOT EXISTS idx_topic_sources_last_crawled ON topic_sources(last_crawled_at);

-- Topic preferences (user's content strategy settings)
CREATE TABLE IF NOT EXISTS topic_preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL, -- AI prompt for topic generation
  description TEXT,
  keywords TEXT[], -- must include
  exclude_keywords TEXT[],
  sources TEXT[], -- URLs or domain patterns
  content_types TEXT[], -- 'blog', 'linkedin', etc.
  daily_count INTEGER DEFAULT 5,
  min_relevance_score FLOAT DEFAULT 0.7,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_topic_preferences_enabled ON topic_preferences(enabled);

-- Topic generation jobs (for tracking daily runs)
CREATE TABLE IF NOT EXISTS topic_generation_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  topics_generated INTEGER DEFAULT 0,
  topics_approved INTEGER DEFAULT 0,
  error_message TEXT,
  sources_crawled TEXT[],
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_topic_generation_jobs_started_at ON topic_generation_jobs(started_at DESC);

-- Add trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_library_updated_at BEFORE UPDATE ON content_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON media_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_sources_updated_at BEFORE UPDATE ON topic_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_preferences_updated_at BEFORE UPDATE ON topic_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE topics IS 'Daily AI-generated topic suggestions for content creation';
COMMENT ON TABLE content_library IS 'Unified content library for blog posts and LinkedIn content';
COMMENT ON TABLE media_library IS 'Media assets (images, videos) for content';
COMMENT ON TABLE topic_sources IS 'External sources to crawl for topic ideas';
COMMENT ON TABLE topic_preferences IS 'User-defined preferences for topic generation';
COMMENT ON TABLE topic_generation_jobs IS 'History of daily topic generation runs';

