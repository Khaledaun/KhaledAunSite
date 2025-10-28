-- Sprint 4: Auth + LinkedIn Integration
-- Run this in Supabase SQL Editor
-- Date: October 28, 2024

-- ============================================
-- 1. SOCIAL ACCOUNTS TABLE (OAuth tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'linkedin', 'instagram', etc.
  account_id VARCHAR(255) NOT NULL, -- Provider's user ID
  account_name VARCHAR(255), -- Display name
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMP,
  scopes TEXT[], -- OAuth scopes granted
  metadata JSONB DEFAULT '{}', -- Additional provider data
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider, account_id)
);

CREATE INDEX idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_provider ON social_accounts(provider);
CREATE INDEX idx_social_accounts_active ON social_accounts(is_active);

-- ============================================
-- 2. UPDATE CONTENT_LIBRARY FOR PUBLISHING
-- ============================================
ALTER TABLE content_library 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP,
ADD COLUMN IF NOT EXISTS publish_targets TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS publish_status VARCHAR(50) DEFAULT 'draft', -- draft, queued, posting, posted, failed
ADD COLUMN IF NOT EXISTS published_links JSONB DEFAULT '{}', -- {"linkedin": "https://...", ...}
ADD COLUMN IF NOT EXISTS last_publish_error TEXT,
ADD COLUMN IF NOT EXISTS publish_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_publish_attempt TIMESTAMP;

-- Add check constraint for publish_status
ALTER TABLE content_library
DROP CONSTRAINT IF EXISTS content_library_publish_status_check;

ALTER TABLE content_library
ADD CONSTRAINT content_library_publish_status_check 
CHECK (publish_status IN ('draft', 'queued', 'posting', 'posted', 'failed'));

-- Indexes for scheduling
CREATE INDEX IF NOT EXISTS idx_content_scheduled ON content_library(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_publish_status ON content_library(publish_status);
CREATE INDEX IF NOT EXISTS idx_content_queued ON content_library(publish_status, scheduled_for) WHERE publish_status = 'queued';

-- ============================================
-- 3. PUBLISH JOBS TABLE (For scheduler)
-- ============================================
CREATE TABLE IF NOT EXISTS publish_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL REFERENCES content_library(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'linkedin', 'instagram', etc.
  scheduled_for TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  last_attempt TIMESTAMP,
  last_error TEXT,
  result JSONB, -- Success response from platform
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_publish_jobs_content ON publish_jobs(content_id);
CREATE INDEX idx_publish_jobs_status ON publish_jobs(status);
CREATE INDEX idx_publish_jobs_scheduled ON publish_jobs(scheduled_for, status) WHERE status IN ('pending', 'failed');

-- ============================================
-- 4. USER ROLES TABLE (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'admin', 'editor', 'viewer'
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- ============================================
-- 5. NEWSLETTER SUBSCRIBERS (Stretch goal)
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, unsubscribed
  confirmation_token VARCHAR(255),
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  source VARCHAR(100), -- 'website', 'manual', etc.
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_created ON newsletter_subscribers(created_at);

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Social accounts: Users can only see their own
CREATE POLICY social_accounts_select ON social_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY social_accounts_insert ON social_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY social_accounts_update ON social_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY social_accounts_delete ON social_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Publish jobs: Authenticated users can view
CREATE POLICY publish_jobs_select ON publish_jobs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can insert/update publish jobs
CREATE POLICY publish_jobs_insert ON publish_jobs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY publish_jobs_update ON publish_jobs
  FOR UPDATE USING (auth.role() = 'service_role');

-- User roles: Users can view their own roles
CREATE POLICY user_roles_select ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins can manage roles (checked in application logic)
CREATE POLICY user_roles_admin_all ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Newsletter: Public can subscribe, admins can manage
CREATE POLICY newsletter_insert ON newsletter_subscribers
  FOR INSERT WITH CHECK (true); -- Anyone can subscribe

CREATE POLICY newsletter_select ON newsletter_subscribers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'editor')
    )
  );

-- ============================================
-- 7. UPDATE EXISTING CONTENT POLICIES
-- ============================================

-- Content library: Restrict write to admin/editor
DROP POLICY IF EXISTS content_library_insert ON content_library;
DROP POLICY IF EXISTS content_library_update ON content_library;
DROP POLICY IF EXISTS content_library_delete ON content_library;

CREATE POLICY content_library_insert ON content_library
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'editor')
    )
  );

CREATE POLICY content_library_update ON content_library
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'editor')
    )
  );

CREATE POLICY content_library_delete ON content_library
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to check if user has role
CREATE OR REPLACE FUNCTION has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid AND role = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT role FROM user_roles 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================
GRANT SELECT, INSERT, UPDATE ON social_accounts TO authenticated;
GRANT SELECT ON publish_jobs TO authenticated;
GRANT SELECT ON user_roles TO authenticated;
GRANT INSERT ON newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON newsletter_subscribers TO authenticated;

-- ============================================
-- 10. VERIFY MIGRATION
-- ============================================
SELECT 'Sprint 4 migration completed successfully!' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('social_accounts', 'publish_jobs', 'user_roles', 'newsletter_subscribers');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content_library' 
AND column_name IN ('scheduled_for', 'publish_targets', 'publish_status', 'published_links');

