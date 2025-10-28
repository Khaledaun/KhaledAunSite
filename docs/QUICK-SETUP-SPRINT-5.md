# Sprint 5: Email Marketing + CRM - Quick Setup Guide

**Status**: ✅ Complete (All Phases)  
**Last Updated**: October 28, 2025

---

## 📋 Overview

Sprint 5 adds comprehensive email marketing and CRM capabilities:
- ✅ **Resend** integration for transactional & marketing emails
- ✅ **HubSpot** CRM integration for lead management
- ✅ Newsletter subscription with double opt-in
- ✅ Email campaigns with analytics (opens, clicks, bounces)
- ✅ Automated email workflows
- ✅ Marketing dashboard with KPIs
- ✅ Subscriber & campaign management UI

---

## 🗄️ Database Migration

### Step 1: Run the Sprint 5 Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- Located in: sprint5-migration.sql
-- Creates:
--   - newsletter_subscribers (with RLS)
--   - email_campaigns (with RLS)
--   - email_events (with RLS)
--   - crm_leads (with RLS)
--   - email_templates (with RLS)
--   - Indexes for performance
```

**Verification**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('newsletter_subscribers', 'email_campaigns', 'email_events', 'crm_leads', 'email_templates');
```

### Step 2: Regenerate Prisma Client

```bash
cd apps/admin
npx prisma generate
```

---

## 🔑 Environment Variables

### Required Variables

Add these to your Vercel environment variables (Production & Preview):

#### **Resend (Email Service)**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_NAME="Khaled Aun"
EMAIL_FROM_ADDRESS=hello@khaledaun.com
EMAIL_REPLY_TO=khaled@khaledaun.com
EMAIL_FOOTER_ADDRESS_LINE="123 Business St, City, Country"
```

#### **HubSpot CRM**
```env
HUBSPOT_API_KEY=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_PORTAL_ID=12345678
HUBSPOT_PIPELINE_ID=default
HUBSPOT_DEALSTAGE_DISCOVERY_ID=appointmentscheduled
HUBSPOT_DEALSTAGE_PROPOSAL_ID=qualifiedtobuy
HUBSPOT_DEALSTAGE_WON_ID=closedwon
HUBSPOT_DEALSTAGE_LOST_ID=closedlost
```

#### **Webhook Secrets**
```env
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CRON_SECRET=your-random-secret-string-here
```

---

## 📧 Resend Setup

### 1. Create Resend Account
- Go to [resend.com](https://resend.com)
- Sign up and verify your email
- Add your domain (`khaledaun.com`)

### 2. Configure DNS Records

Add these DNS records to your domain provider:

#### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

#### DKIM Records (Resend will provide these)
```
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend]
```

#### DMARC Record (Optional but recommended)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@khaledaun.com
```

### 3. Verify Domain in Resend
- In Resend dashboard: Settings → Domains
- Click "Verify Domain"
- Wait for DNS propagation (can take 24-48 hours)
- Status should show "Verified"

### 4. Create API Key
- Go to Settings → API Keys
- Click "Create API Key"
- Name it "Production" or "KhaledAunSite"
- Copy the key (starts with `re_`)
- Add to Vercel env vars as `RESEND_API_KEY`

### 5. Configure Webhook
- Go to Settings → Webhooks
- Click "Add Webhook"
- **Endpoint**: `https://admin.khaledaun.com/api/webhooks/resend`
- **Events**: Select all (sent, delivered, opened, clicked, bounced, complained)
- **Secret**: Copy and add to Vercel as `RESEND_WEBHOOK_SECRET`
- Click "Create Webhook"

---

## 🔗 HubSpot Setup

### 1. Create HubSpot Account
- Go to [hubspot.com](https://www.hubspot.com)
- Sign up for free account
- Complete onboarding

### 2. Create Private App
- Go to Settings → Integrations → Private Apps
- Click "Create private app"
- Name: "KhaledAunSite Integration"
- **Scopes needed**:
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
  - `crm.objects.deals.read`
  - `crm.objects.deals.write`
  - `crm.lists.read` (optional, for list management)
- Click "Create app"
- Copy the access token (starts with `pat-`)
- Add to Vercel as `HUBSPOT_API_KEY`

### 3. Get Portal ID
- Settings → Account Setup → Account Defaults
- Copy "Hub ID" (8-digit number)
- Add to Vercel as `HUBSPOT_PORTAL_ID`

### 4. Get Pipeline & Deal Stage IDs

```bash
# Test API connection
curl -H "Authorization: Bearer YOUR_HUBSPOT_API_KEY" \
  "https://api.hubapi.com/crm/v3/pipelines/deals"
```

Find your pipeline and stage IDs in the response:
- `HUBSPOT_PIPELINE_ID` (usually "default")
- `HUBSPOT_DEALSTAGE_DISCOVERY_ID`
- `HUBSPOT_DEALSTAGE_PROPOSAL_ID`
- `HUBSPOT_DEALSTAGE_WON_ID`
- `HUBSPOT_DEALSTAGE_LOST_ID`

### 5. Test Integration

```bash
# Test contact creation
curl -X POST "https://admin.khaledaun.com/api/crm/test" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## ⏰ Vercel Cron Jobs

The `vercel.json` already includes these cron configurations:

```json
{
  "crons": [
    {
      "path": "/api/email/scheduler/run",
      "schedule": "* * * * *",
      "description": "Email campaign scheduler - runs every minute"
    },
    {
      "path": "/api/email/metrics/sync",
      "schedule": "0 * * * *",
      "description": "Email metrics sync - runs hourly"
    },
    {
      "path": "/api/crm/sync",
      "schedule": "0 2 * * *",
      "description": "HubSpot CRM sync - runs daily at 2 AM"
    }
  ]
}
```

**Verification**:
- Deploy to Vercel
- Go to Project Settings → Cron Jobs
- All three jobs should be listed and active

**Secure Cron Endpoints** (Recommended):
Add this header to cron requests:
```
Authorization: Bearer YOUR_CRON_SECRET
```

Update each cron route to check:
```typescript
const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
if (cronSecret !== process.env.CRON_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 🧪 Testing the Integration

### 1. Test Newsletter Subscription

```bash
# Subscribe
curl -X POST "https://admin.khaledaun.com/api/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "source": "website"
  }'

# Expected: 200 OK with message about confirmation email
```

### 2. Check Confirmation Email
- Check inbox for confirmation email
- Click confirmation link
- Should redirect to `/newsletter/confirm?token=...`
- Verify subscriber status changed to "confirmed" in database

### 3. Test Campaign Creation

Via Admin UI:
1. Go to `/marketing/campaigns/new`
2. Create a test campaign
3. Set subject, content, from name/email
4. Select "Send test email" and enter your email
5. Verify test email arrives

### 4. Test Campaign Send

```bash
# Send campaign
curl -X POST "https://admin.khaledaun.com/api/email/campaigns/CAMPAIGN_ID/send" \
  -H "Content-Type: application/json" \
  -d '{
    "testMode": false,
    "force": false
  }'
```

### 5. Test Webhooks

Send a test email and check:
- Email sent → Event logged in `email_events`
- Email opened → Open count incremented
- Link clicked → Click count incremented
- Email bounced → Bounce recorded

Query to check events:
```sql
SELECT event_type, COUNT(*) 
FROM email_events 
GROUP BY event_type;
```

### 6. Test HubSpot Sync

Submit contact form:
```bash
curl -X POST "https://admin.khaledaun.com/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lead@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Test Corp",
    "message": "Interested in services"
  }'
```

Check HubSpot:
- Contact should appear in Contacts
- Deal should be created in "Discovery" stage
- `crm_leads` table should have record with `hubspotContactId` and `hubspotDealId`

---

## 📊 Admin UI Routes

### Marketing Dashboard
- **URL**: `/marketing`
- **Features**: KPIs, recent subscribers, campaigns, leads
- **Metrics**: Subscriber count, open rate, click rate, bounce rate

### Subscribers
- **URL**: `/marketing/subscribers`
- **Features**: List, filter, search, pagination
- **Filters**: All, Confirmed, Pending, Unsubscribed
- **Actions**: View details, export CSV

### Campaigns
- **URL**: `/marketing/campaigns`
- **Features**: List campaigns, view metrics
- **Create**: `/marketing/campaigns/new`
- **View**: `/marketing/campaigns/[id]`
- **Edit**: `/marketing/campaigns/[id]/edit`

### Settings (Future)
- **Email Settings**: `/admin/settings/email`
- **CRM Settings**: `/admin/settings/crm`

---

## 🚨 Troubleshooting

### Emails Not Sending

**Check**:
1. Resend API key is correct
2. Domain is verified in Resend
3. DNS records are properly configured
4. Check Resend logs: resend.com → Logs

**Test**:
```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hello@khaledaun.com",
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

### Webhooks Not Working

**Check**:
1. Webhook endpoint is publicly accessible
2. Webhook secret matches env var
3. Check Vercel logs for errors
4. Verify webhook is active in Resend dashboard

**Test**:
```bash
# Resend sends a test event when webhook is created
# Check: Apps Admin → Logs → Functions
# Filter for /api/webhooks/resend
```

### HubSpot Sync Failing

**Check**:
1. API key has correct scopes
2. Portal ID is correct
3. Pipeline and stage IDs exist
4. Check `crm_leads` table for `hubspotSyncError` messages

**Test**:
```bash
curl -X GET "https://api.hubapi.com/crm/v3/objects/contacts" \
  -H "Authorization: Bearer YOUR_HUBSPOT_API_KEY"
```

### Cron Jobs Not Running

**Check**:
1. Vercel Pro plan (required for cron jobs)
2. Crons are listed in Vercel dashboard
3. Check execution logs in Vercel
4. Verify `vercel.json` cron configuration

**Manual Trigger**:
```bash
curl "https://admin.khaledaun.com/api/email/scheduler/run"
curl "https://admin.khaledaun.com/api/crm/sync"
```

### Database Errors

**Check**:
1. Migration ran successfully
2. Prisma client regenerated after migration
3. RLS policies allow necessary operations
4. Check Supabase logs for errors

**Verify Tables**:
```sql
\dt newsletter_subscribers
\dt email_campaigns
\dt email_events
\dt crm_leads
\dt email_templates
```

---

## 🎯 Next Steps

### Production Deployment Checklist

- [ ] All environment variables set in Vercel (Production)
- [ ] DNS records configured and verified
- [ ] Resend domain verified
- [ ] HubSpot API key tested
- [ ] Cron jobs active and running
- [ ] Webhooks configured and tested
- [ ] Test subscriber flow end-to-end
- [ ] Test campaign creation and send
- [ ] Test HubSpot contact/deal creation
- [ ] Monitor logs for first 24 hours

### Optional Enhancements

- [ ] Add email templates UI for creating reusable templates
- [ ] Add segment-based campaigns (target specific subscriber groups)
- [ ] Add A/B testing for subject lines
- [ ] Add advanced analytics dashboard (charts, trends)
- [ ] Add subscriber preferences center
- [ ] Add automated drip campaigns
- [ ] Add SMS notifications (Twilio integration)
- [ ] Add Slack notifications for new leads

---

## 📚 API Reference

### Newsletter Endpoints

#### Subscribe
```
POST /api/newsletter/subscribe
Body: { email, firstName?, lastName?, source, utmSource?, ... }
Response: { message, subscriber }
```

#### Confirm
```
POST /api/newsletter/confirm
Body: { token }
Response: { message, subscriber }
```

#### Unsubscribe
```
GET /api/newsletter/unsubscribe?email=...
POST /api/newsletter/unsubscribe
Body: { email }
Response: { message }
```

### Campaign Endpoints

#### List Campaigns
```
GET /api/email/campaigns
Response: { campaigns }
```

#### Create Campaign
```
POST /api/email/campaigns
Body: { name, subject, contentHtml, contentText, fromName, fromEmail, ... }
Response: { campaign }
```

#### Send Campaign
```
POST /api/email/campaigns/[id]/send
Body: { testMode?, testEmail?, force? }
Response: { message, stats }
```

### CRM Endpoints

#### Sync to HubSpot
```
POST /api/crm/sync
Response: { synced, failed, errors }
```

### Webhook Endpoints

#### Resend Webhook
```
POST /api/webhooks/resend
Body: Resend event payload
Response: { received: true }
```

---

## 🔐 Security Notes

1. **API Keys**: Store securely in Vercel environment variables, never commit to git
2. **Webhook Secrets**: Verify signature on all webhook requests
3. **Cron Endpoints**: Secure with `CRON_SECRET` header
4. **RLS Policies**: Ensure database policies prevent unauthorized access
5. **Email Content**: Sanitize user input to prevent XSS in emails
6. **Unsubscribe Links**: Always include and honor immediately
7. **GDPR Compliance**: Store consent timestamps and provide data export/deletion

---

## 📞 Support

**Issues?** Check:
- Vercel deployment logs
- Supabase database logs
- Resend logs (resend.com → Logs)
- HubSpot API logs (Settings → Integrations → Private Apps)

**Need Help?**
- Review `docs/SPRINT-5-COMPLETE.md` for detailed implementation notes
- Check `docs/SPRINT-5-STATUS.md` for endpoint documentation
- Contact: khaled@khaledaun.com

---

**Sprint 5 Complete!** 🎉  
Your email marketing and CRM system is ready for production.

