-- Fix database and create Sprint 5 tables manually
-- This script resolves all blocking issues and creates missing tables

-- Step 1: Drop blocking views/constraints
DROP VIEW IF EXISTS dashboard_stats CASCADE;
ALTER TABLE content_library DROP CONSTRAINT IF EXISTS unique_content_slug;

-- Step 2: Create Sprint 5 Email Marketing & CRM Tables

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    first_name TEXT,
    last_name TEXT,
    subscribed_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    confirmation_token TEXT UNIQUE,
    confirmation_token_expires_at TIMESTAMP,
    preferences JSONB DEFAULT '{"blog": true, "newsletter": true, "product_updates": false}',
    source TEXT,
    source_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    total_opens INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    last_opened_at TIMESTAMP,
    last_clicked_at TIMESTAMP,
    hubspot_contact_id TEXT,
    hubspot_synced_at TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_token ON newsletter_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created ON newsletter_subscribers(created_at DESC);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview_text TEXT,
    from_name TEXT DEFAULT 'Khaled Aun',
    from_email TEXT DEFAULT 'hello@khaledaun.com',
    reply_to TEXT DEFAULT 'hello@khaledaun.com',
    content_html TEXT NOT NULL,
    content_text TEXT,
    status TEXT DEFAULT 'draft',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    target_status TEXT[] DEFAULT ARRAY['confirmed'],
    target_tags TEXT[] DEFAULT '{}',
    exclude_tags TEXT[] DEFAULT '{}',
    provider TEXT DEFAULT 'resend',
    provider_campaign_id TEXT,
    provider_response JSONB,
    total_recipients INT DEFAULT 0,
    total_sent INT DEFAULT 0,
    total_delivered INT DEFAULT 0,
    total_opens INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    total_bounces INT DEFAULT 0,
    total_complaints INT DEFAULT 0,
    total_unsubscribes INT DEFAULT 0,
    created_by TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent ON email_campaigns(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created ON email_campaigns(created_at DESC);

-- Email Events
CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    event_type TEXT NOT NULL,
    link_url TEXT,
    link_text TEXT,
    bounce_type TEXT,
    bounce_reason TEXT,
    complaint_feedback_type TEXT,
    provider TEXT DEFAULT 'resend',
    provider_message_id TEXT,
    provider_event_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    location JSONB,
    event_timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_subscriber ON email_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_events(email);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_message_id ON email_events(provider_message_id);

-- CRM Leads
CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    job_title TEXT,
    phone TEXT,
    website TEXT,
    source TEXT NOT NULL,
    source_url TEXT,
    message TEXT,
    lead_status TEXT DEFAULT 'new',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    hubspot_contact_id TEXT,
    hubspot_deal_id TEXT,
    hubspot_sync_status TEXT,
    hubspot_synced_at TIMESTAMP,
    hubspot_error TEXT,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm_leads(source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created ON crm_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_hubspot ON crm_leads(hubspot_contact_id);

-- Publish Jobs (LinkedIn Scheduler)
CREATE TABLE IF NOT EXISTS publish_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    scheduled_for TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'pending',
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    last_attempt TIMESTAMP,
    last_error TEXT,
    result JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publish_jobs_content ON publish_jobs(content_id);
CREATE INDEX IF NOT EXISTS idx_publish_jobs_status ON publish_jobs(status);
CREATE INDEX IF NOT EXISTS idx_publish_jobs_scheduled ON publish_jobs(scheduled_for, status);

-- Social Accounts (if missing)
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    account_id TEXT NOT NULL,
    account_name TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    scopes TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, provider, account_id)
);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_provider ON social_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON social_accounts(is_active);

-- User Roles (if missing)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT,
    UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Success message
SELECT 'Sprint 5 tables created successfully!' AS result;




