-- Sprint 2: Add SEO and AIO tracking fields
-- Run this in Supabase SQL Editor
-- Date: October 28, 2024

-- 1. Add SEO/AIO fields to content_library
ALTER TABLE content_library 
ADD COLUMN IF NOT EXISTS seo_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS aio_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS readability_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS schema_markup JSONB,
ADD COLUMN IF NOT EXISTS last_seo_check TIMESTAMP,
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS seo_description VARCHAR(200),
ADD COLUMN IF NOT EXISTS slug VARCHAR(200);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_seo_score ON content_library(seo_score);
CREATE INDEX IF NOT EXISTS idx_content_aio_score ON content_library(aio_score);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content_library(slug);

-- 3. Add unique constraint on slug (for URL uniqueness)
ALTER TABLE content_library 
ADD CONSTRAINT unique_content_slug UNIQUE (slug);

-- 4. Add SEO fields to media_library
ALTER TABLE media_library
ADD COLUMN IF NOT EXISTS alt_text_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS file_size_optimal BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS format_recommended VARCHAR(20);

-- 5. Create analytics table for tracking
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_library(id) ON DELETE CASCADE,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  avg_time_on_page INT DEFAULT 0,
  bounce_rate FLOAT DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_content ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON content_analytics(date);

-- 6. Create SEO issues table for tracking problems
CREATE TABLE IF NOT EXISTS seo_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_library(id) ON DELETE CASCADE,
  issue_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  fix_suggestion TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_issues_content ON seo_issues(content_id);
CREATE INDEX IF NOT EXISTS idx_seo_issues_resolved ON seo_issues(resolved);

-- 7. Add dashboard stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM topics) as total_topics,
  (SELECT COUNT(*) FROM topics WHERE status = 'pending') as pending_topics,
  (SELECT COUNT(*) FROM content_library) as total_content,
  (SELECT COUNT(*) FROM content_library WHERE status = 'draft') as draft_content,
  (SELECT COUNT(*) FROM content_library WHERE status = 'published') as published_content,
  (SELECT COUNT(*) FROM media_library) as total_media,
  (SELECT ROUND(AVG(seo_score)) FROM content_library WHERE seo_score > 0) as avg_seo_score,
  (SELECT ROUND(AVG(aio_score)) FROM content_library WHERE aio_score > 0) as avg_aio_score,
  (SELECT COUNT(*) FROM seo_issues WHERE NOT resolved) as open_seo_issues;

-- Grant permissions
GRANT SELECT ON dashboard_stats TO authenticated;

-- 8. Verify migration
SELECT 'Migration completed successfully!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content_library' 
AND column_name IN ('seo_score', 'aio_score', 'schema_markup', 'slug');

