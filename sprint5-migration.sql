-- =====================================================
-- Sprint 5: Email Marketing + CRM Integration
-- Database Migration
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Newsletter Subscribers Table
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed', 'bounced', 'complained')),
  
  -- Personal info (optional)
  first_name TEXT,
  last_name TEXT,
  
  -- Subscription management
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  
  -- Double opt-in
  confirmation_token TEXT UNIQUE,
  confirmation_token_expires_at TIMESTAMPTZ,
  
  -- Preferences
  preferences JSONB DEFAULT '{"blog": true, "newsletter": true, "product_updates": false}'::jsonb,
  
  -- Source tracking
  source TEXT, -- 'website', 'linkedin', 'manual', 'import'
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Engagement metrics
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  last_opened_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,
  
  -- CRM sync
  hubspot_contact_id TEXT,
  hubspot_synced_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for newsletter_subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_confirmation_token ON newsletter_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_hubspot_id ON newsletter_subscribers(hubspot_contact_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON newsletter_subscribers(created_at DESC);

-- =====================================================
-- 2. Email Campaigns Table
-- =====================================================

CREATE TABLE IF NOT EXISTS email_campaigns (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  
  -- Campaign details
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  from_name TEXT DEFAULT 'Khaled Aun',
  from_email TEXT DEFAULT 'hello@khaledaun.com',
  reply_to TEXT DEFAULT 'hello@khaledaun.com',
  
  -- Content
  content_html TEXT NOT NULL,
  content_text TEXT,
  
  -- Scheduling
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Targeting
  target_status TEXT[] DEFAULT ARRAY['confirmed'], -- Which subscriber statuses to send to
  target_tags TEXT[], -- Only send to subscribers with these tags
  exclude_tags TEXT[], -- Exclude subscribers with these tags
  
  -- Email provider
  provider TEXT DEFAULT 'resend' CHECK (provider IN ('resend', 'manual')),
  provider_campaign_id TEXT,
  provider_response JSONB,
  
  -- Analytics
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_bounces INTEGER DEFAULT 0,
  total_complaints INTEGER DEFAULT 0,
  total_unsubscribes INTEGER DEFAULT 0,
  
  -- Metadata
  created_by TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email_campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_for ON email_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at DESC);

-- =====================================================
-- 3. Email Events Table (Analytics)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_events (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  
  -- Relationships
  campaign_id TEXT REFERENCES email_campaigns(id) ON DELETE CASCADE,
  subscriber_id TEXT REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  
  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  
  -- Click tracking
  link_url TEXT, -- For click events
  link_text TEXT,
  
  -- Bounce/complaint details
  bounce_type TEXT, -- 'hard', 'soft'
  bounce_reason TEXT,
  complaint_feedback_type TEXT,
  
  -- Provider details
  provider TEXT DEFAULT 'resend',
  provider_message_id TEXT,
  provider_event_id TEXT,
  
  -- Context
  ip_address TEXT,
  user_agent TEXT,
  location JSONB, -- {country, city, region}
  
  -- Timestamps
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email_events
CREATE INDEX IF NOT EXISTS idx_email_events_campaign_id ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_subscriber_id ON email_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_events(email);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_event_timestamp ON email_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_provider_message_id ON email_events(provider_message_id);

-- =====================================================
-- 4. CRM Leads Table (HubSpot)
-- =====================================================

CREATE TABLE IF NOT EXISTS crm_leads (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  
  -- Contact info
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  job_title TEXT,
  phone TEXT,
  website TEXT,
  
  -- Lead details
  source TEXT NOT NULL, -- 'contact_form', 'newsletter', 'linkedin', 'manual'
  source_url TEXT,
  message TEXT,
  lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  
  -- UTM tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- HubSpot sync
  hubspot_contact_id TEXT UNIQUE,
  hubspot_deal_id TEXT,
  hubspot_synced_at TIMESTAMPTZ,
  hubspot_sync_status TEXT DEFAULT 'pending' CHECK (hubspot_sync_status IN ('pending', 'synced', 'failed')),
  hubspot_sync_error TEXT,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  
  -- Follow-up
  assigned_to TEXT,
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for crm_leads
CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email);
CREATE INDEX IF NOT EXISTS idx_crm_leads_lead_status ON crm_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm_leads(source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_hubspot_contact_id ON crm_leads(hubspot_contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_hubspot_sync_status ON crm_leads(hubspot_sync_status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON crm_leads(created_at DESC);

-- =====================================================
-- 5. Email Templates Table
-- =====================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  
  -- Template details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'newsletter', 'transactional', 'marketing', 'automated'
  
  -- Content
  subject TEXT NOT NULL,
  preview_text TEXT,
  content_html TEXT NOT NULL,
  content_text TEXT,
  
  -- Variables
  variables JSONB DEFAULT '[]'::jsonb, -- [{name: 'first_name', required: true, default: ''}]
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email_templates
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

-- =====================================================
-- 6. Update content_library for post notifications
-- =====================================================

ALTER TABLE content_library 
  ADD COLUMN IF NOT EXISTS email_notification_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_notification_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_notification_campaign_id TEXT REFERENCES email_campaigns(id);

-- =====================================================
-- 7. Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role has full access to newsletter_subscribers"
  ON newsletter_subscribers FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to email_campaigns"
  ON email_campaigns FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to email_events"
  ON email_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to crm_leads"
  ON crm_leads FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to email_templates"
  ON email_templates FOR ALL
  USING (auth.role() = 'service_role');

-- Public can subscribe (anonymous users)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Public can confirm subscription
CREATE POLICY "Anyone can update with valid token"
  ON newsletter_subscribers FOR UPDATE
  USING (confirmation_token IS NOT NULL);

-- Public can unsubscribe
CREATE POLICY "Anyone can unsubscribe"
  ON newsletter_subscribers FOR UPDATE
  USING (true)
  WITH CHECK (status = 'unsubscribed');

-- =====================================================
-- 8. Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_leads_updated_at BEFORE UPDATE ON crm_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate confirmation token
CREATE OR REPLACE FUNCTION generate_confirmation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. Sample Data (Optional)
-- =====================================================

-- Insert default email template
INSERT INTO email_templates (name, description, category, subject, content_html, content_text, variables)
VALUES (
  'New Blog Post Notification',
  'Template for notifying subscribers about new blog posts',
  'automated',
  'New Post: {{title}}',
  '<html><body><h1>{{title}}</h1><p>{{excerpt}}</p><a href="{{url}}">Read More</a></body></html>',
  '{{title}}\n\n{{excerpt}}\n\nRead more: {{url}}',
  '[{"name":"title","required":true},{"name":"excerpt","required":true},{"name":"url","required":true}]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Migration Complete
-- =====================================================

SELECT 'Sprint 5 migration completed successfully!' AS status;

