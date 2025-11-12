-- Fix Content Library table to match Prisma schema
-- Add all missing Sprint 4 & 5 columns

-- Add missing publishing columns (Sprint 4)
ALTER TABLE content_library 
ADD COLUMN IF NOT EXISTS publish_targets TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS publish_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS published_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_publish_error TEXT,
ADD COLUMN IF NOT EXISTS publish_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_publish_attempt TIMESTAMP;

-- Add missing email notification columns (Sprint 5)
ALTER TABLE content_library 
ADD COLUMN IF NOT EXISTS email_notification_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_notification_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_notification_campaign_id TEXT;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_content_library_publish_status ON content_library(publish_status);

-- Verify columns exist
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'content_library' 
  AND column_name IN (
    'publish_targets', 
    'publish_status', 
    'published_links',
    'last_publish_error',
    'publish_attempts',
    'last_publish_attempt',
    'email_notification_sent',
    'email_notification_sent_at',
    'email_notification_campaign_id'
  )
ORDER BY column_name;

-- Success message
SELECT 'Content Library table fixed! All columns added.' AS result;




