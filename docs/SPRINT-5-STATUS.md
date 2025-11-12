# Sprint 5: Email Marketing + CRM Integration - Status

**Phase**: 1 (Basics) - IN PROGRESS  
**Branch**: `feat/sprint5-email-crm-basics`  
**Completion**: ~30%

---

## ✅ **Completed (Phase 1)**

### **1. Database Migration** (`sprint5-migration.sql`)
Created 5 new tables with full analytics and RLS:

- **`newsletter_subscribers`** - Complete subscriber management
  - Double opt-in with token expiry
  - Engagement metrics (opens, clicks)
  - HubSpot sync fields
  - UTM tracking
  - Preferences (JSON)
  - Status: pending → confirmed → unsubscribed/bounced/complained

- **`email_campaigns`** - Campaign management
  - Subject, content (HTML + text)
  - Scheduling
  - Targeting (status, tags, exclude)
  - Provider integration (Resend)
  - Analytics (sent, delivered, opens, clicks, bounces, complaints, unsubscribes)

- **`email_events`** - Analytics tracking
  - Event types: sent, delivered, opened, clicked, bounced, complained, unsubscribed
  - Click tracking (URL + text)
  - Bounce details (hard/soft, reason)
  - Provider message IDs
  - Location data

- **`crm_leads`** - HubSpot lead management
  - Contact details
  - Lead source tracking
  - UTM parameters (5 fields)
  - HubSpot sync status
  - Follow-up tracking

- **`email_templates`** - Reusable templates
  - HTML + text versions
  - Variable replacement
  - Categories
  - Usage tracking

**Updated `content_library`**:
- `email_notification_sent` (boolean)
- `email_notification_sent_at` (timestamp)
- `email_notification_campaign_id` (FK)

---

### **2. Prisma Schema Updates**
All 5 models added with:
- Full field mappings (snake_case DB ↔ camelCase TypeScript)
- Proper indexes for performance
- Foreign key relationships
- Default values

---

### **3. Resend Email Client** (`lib/email/resend-client.ts`)

**Core Functions**:
- `sendEmail()` - Single email
- `sendBulkEmails()` - Batch API (up to 100 emails)
- `sendTemplateEmail()` - Variable replacement
- `sendConfirmationEmail()` - Beautiful double opt-in
- `sendUnsubscribeConfirmation()` - Unsubscribe confirmation

**Features**:
- Beautiful HTML emails with gradients
- Plain text fallbacks
- Mobile-responsive
- Branded (Khaled Aun theme)
- Footer with links

---

### **4. HubSpot CRM Client** (`lib/crm/hubspot-client.ts`)

**Core Functions**:
- `upsertContact()` - Create or update contact
- `createDeal()` - Create deal and associate with contact
- `syncSubscriberToHubSpot()` - Newsletter → HubSpot
- `syncLeadToHubSpot()` - Form → HubSpot
- `searchContactByEmail()` - Find existing
- `addContactToList()` - List management
- `testConnection()` - API health check

**Features**:
- Automatic deduplication by email
- Lifecycle stage tracking
- Lead status management
- UTM parameter mapping
- Custom property support

---

### **5. Subscribe API** (`app/api/newsletter/subscribe/route.ts`)

**POST `/api/newsletter/subscribe`**

**Features**:
- Double opt-in flow
- Email validation
- Duplicate handling (already confirmed, pending, unsubscribed)
- Token generation (24-hour expiry)
- Confirmation email sending
- IP + User-Agent capture
- UTM tracking
- Source tracking
- Preference management

**Request**:
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "source": "website",
  "sourceUrl": "https://khaledaun.com/blog/post-1",
  "utmSource": "linkedin",
  "utmMedium": "social",
  "utmCampaign": "launch",
  "preferences": {
    "blog": true,
    "newsletter": true,
    "productUpdates": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Almost there! Please check your email to confirm your subscription.",
  "subscriberId": "uuid"
}
```

---

## 🔜 **TODO (Phase 2)**

### **A. Email Lifecycle (Finish)**
- [ ] Confirmation endpoint
- [ ] Unsubscribe endpoint
- [ ] Campaign creation API
- [ ] Manual send trigger
- [ ] Resend webhooks handler
- [ ] Email templates (Welcome, New Post, Digest)
- [ ] UTM tagging helper

### **B. Newsletter Capture UI**
- [ ] Public NewsletterForm component
- [ ] Confirmation page
- [ ] Unsubscribed page
- [ ] Honeypot anti-bot

### **C. Campaign Engine**
- [ ] Auto-campaign on publish
- [ ] Campaign management UI
- [ ] Preview + test email
- [ ] Rate limiting
- [ ] Exponential backoff

### **D. HubSpot Integration (Finish)**
- [ ] Contact form → HubSpot
- [ ] Deal creation
- [ ] GDPR consent mapping
- [ ] Nightly sync endpoint

### **E. Admin Dashboard**
- [ ] Marketing dashboard UI
- [ ] KPI cards
- [ ] Time series charts
- [ ] Recent lists
- [ ] DKIM/SPF status

### **F. Settings**
- [ ] Email settings page
- [ ] CRM settings page
- [ ] Test email button

### **G. Legal & Compliance**
- [ ] Consent tracking
- [ ] One-click unsubscribe
- [ ] Legal footer
- [ ] DSR form stub

### **H. Cron Jobs**
- [ ] Email scheduler (every minute)
- [ ] Metrics sync (hourly)
- [ ] CRM sync (nightly)
- [ ] Idempotency

---

## 📊 **Database Schema Overview**

### **Subscriber Lifecycle**
```
NEW → pending (confirmation email sent)
    ↓ (user clicks confirm link)
    → confirmed (can receive emails)
    ↓ (user clicks unsubscribe)
    → unsubscribed (no more emails)
    
    OR
    → bounced (hard/soft bounce)
    → complained (spam complaint)
```

### **Campaign Lifecycle**
```
draft → scheduled → sending → sent
                         ↓
                      failed
```

### **Email Events**
```
sent → delivered → opened → clicked
                ↓
              bounced (hard/soft)
                ↓
              complained
                ↓
              unsubscribed
```

---

## 🔐 **Environment Variables (Phase 1)**

```env
# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@khaledaun.com
RESEND_FROM_NAME=Khaled Aun

# HubSpot
HUBSPOT_API_KEY=...
HUBSPOT_PORTAL_ID=...
```

---

## 🧪 **Testing Phase 1**

### **1. Subscribe Flow**
```bash
# Subscribe
curl -X POST https://admin.khaledaun.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "utmSource": "test"
  }'

# Check Resend dashboard for email delivery
# Check database for subscriber record (status=pending)
```

### **2. HubSpot Connection**
```bash
# Test connection (when authenticated)
curl https://admin.khaledaun.com/api/crm/test

# Should return: { "connected": true }
```

---

## 📈 **Metrics to Track**

### **Subscribers**
- Total subscribers
- Confirmed subscribers
- Pending confirmations
- Unsubscribed
- Bounced
- Complained

### **Campaigns**
- Total campaigns sent
- Total emails delivered
- Open rate (opens / delivered)
- Click rate (clicks / delivered)
- Bounce rate (bounces / sent)
- Complaint rate (complaints / delivered)
- Unsubscribe rate (unsubscribes / delivered)

### **Leads (HubSpot)**
- Total leads synced
- New leads (7d)
- Sync success rate
- Deal conversion rate

---

## 🏗️ **Architecture**

### **Email Flow**
```
User → Subscribe API
    ↓
Database (pending) + Confirmation Token
    ↓
Resend API (send confirmation email)
    ↓
User clicks link → Confirm API
    ↓
Database (confirmed) + HubSpot Sync
    ↓
User can receive campaigns
```

### **Campaign Flow**
```
Admin → Create Campaign
    ↓
Database (draft/scheduled)
    ↓
Cron Job (scheduler) → Check due campaigns
    ↓
Fetch confirmed subscribers
    ↓
Resend Batch API (send emails)
    ↓
Resend Webhooks → Email Events
    ↓
Database (analytics updated)
    ↓
Dashboard (KPIs updated)
```

### **HubSpot Flow**
```
Form Submit → CRM Lead API
    ↓
Database (crm_leads, status=pending)
    ↓
HubSpot API (upsert contact + create deal)
    ↓
Database (hubspot_contact_id, status=synced)
    ↓
Admin Dashboard (lead visible)
```

---

## 🔧 **Technical Details**

### **Double Opt-In Token**
- 64-character hex string (32 random bytes)
- Expires after 24 hours
- Stored in `confirmation_token` field
- Single-use (cleared after confirmation)

### **Email Analytics**
- Tracked via Resend webhooks
- Events stored in `email_events` table
- Aggregated to campaign totals
- Real-time updates

### **Rate Limiting**
- Resend free tier: 100 emails/day, 3,000/month
- Batch API: max 100 emails per request
- Implement exponential backoff on failures

### **GDPR Compliance**
- Consent tracking (`consentAt`, `lawfulBasis`)
- One-click unsubscribe
- Data deletion on request
- Privacy policy links
- Unsubscribe in every email

---

## 📝 **API Endpoints (Phase 1)**

### **Public**
- `POST /api/newsletter/subscribe` ✅ - Subscribe with double opt-in

### **Admin (Phase 2)**
- `POST /api/newsletter/confirm` 🔜 - Confirm subscription
- `POST /api/newsletter/unsubscribe` 🔜 - Unsubscribe
- `POST /api/email/campaigns` 🔜 - Create campaign
- `POST /api/email/campaigns/[id]/send` 🔜 - Send campaign
- `POST /api/webhooks/resend` 🔜 - Resend webhooks
- `POST /api/crm/sync` 🔜 - HubSpot sync
- `GET /api/crm/test` 🔜 - Test HubSpot connection

---

## 🚀 **Next Steps**

1. **Merge Phase 1 PR** - Get basics deployed
2. **Start Phase 2** - Complete email lifecycle
3. **Build Dashboard** - Marketing UI
4. **Test End-to-End** - Full subscriber journey
5. **Deploy & Document** - QUICK-SETUP-SPRINT-5.md

---

**Phase 1 Status**: ✅ **READY FOR PR**

**Estimated Time for Phase 2**: ~4-6 hours

**Total Sprint 5 Progress**: 30% complete

