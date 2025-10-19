# Follow-Up Issues for Future Sprints
**Created:** October 16, 2024  
**Post-Deployment:** Phase 6 Full + Phase 8 Full

---

## 📋 Issue #1: Phase 6.5 — Rich Media & Publishing Enhancements

**Title:** Phase 6.5: Supabase Storage Integration + Rich Media Management

**Labels:** `enhancement`, `phase-6.5`, `media`, `high-priority`

**Description:**

### **Overview**
Enhance the CMS with rich media management, better content editing, and pre-publish validation.

### **Features**

#### **1. Supabase Storage Integration**
- [ ] Set up Supabase Storage bucket for media assets
- [ ] Implement upload API endpoint (`/api/admin/upload`)
- [ ] Add file type validation (images, videos, PDFs)
- [ ] Implement automatic image optimization (resize, compress)
- [ ] Add CDN URL generation
- [ ] Support both public and private buckets

#### **2. Media Management UI**
- [ ] Create `/admin/media` page
- [ ] Implement drag-and-drop upload
- [ ] Show media library (grid view)
- [ ] Add search and filter (by type, date, author)
- [ ] Implement media insertion into post editor
- [ ] Support bulk operations (delete, organize)

#### **3. Rich Text Editor**
- [ ] Integrate TipTap or similar WYSIWYG editor
- [ ] Support markdown + visual editing modes
- [ ] Add toolbar (bold, italic, headings, lists, links)
- [ ] Implement media embedding from library
- [ ] Add code block syntax highlighting
- [ ] Support tables and blockquotes

#### **4. Pre-Publish Validator**
- [ ] Check for broken links
- [ ] Validate image alt text presence
- [ ] Check SEO metadata completeness
- [ ] Verify translation completeness
- [ ] Word count and readability score
- [ ] Show validation results before publish

#### **5. E2E Tests**
- [ ] Upload media tests
- [ ] Media library CRUD tests
- [ ] Rich text editor functionality
- [ ] Pre-publish validation tests

### **Technical Details**

**Supabase Storage Setup:**
```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true);

-- Set policies
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');
```

**Upload API Example:**
```typescript
// POST /api/admin/upload
const response = await fetch('/api/admin/upload', {
  method: 'POST',
  body: formData, // File + metadata
});
```

### **Acceptance Criteria**
- [ ] Can upload images/videos to Supabase Storage
- [ ] Media library shows all uploaded files
- [ ] Can insert media into post editor
- [ ] Pre-publish validator runs before publish
- [ ] RBAC enforced (AUTHOR+ can upload)

### **Estimated Effort**
- Development: 40-60 hours
- Testing: 10-15 hours
- Documentation: 5-10 hours

### **Dependencies**
- Phase 6 Full (complete)
- Supabase Storage enabled

### **Resources**
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [TipTap Editor](https://tiptap.dev/)

---

## 📋 Issue #2: Phase 7 — AI Content Automation

**Title:** Phase 7: AI Content Generation & Workflow Automation

**Labels:** `enhancement`, `phase-7`, `ai`, `automation`

**Description:**

### **Overview**
Integrate AI-powered content generation and automation workflows.

### **Features**

#### **1. Database Schema**
- [ ] Add `AIModel` enum (GPT4, CLAUDE, GEMINI)
- [ ] Create `ContentGeneration` model
  - id, prompt, model, status, output, metadata
- [ ] Create `AutomationRun` model
  - id, type, trigger, status, results

#### **2. Ingest API**
- [ ] POST `/api/admin/ai/ingest`
  - Accept URL or text input
  - Extract content using Cheerio/Readability
  - Return structured data
- [ ] POST `/api/admin/ai/generate`
  - Accept prompt + parameters
  - Call OpenAI/Anthropic API
  - Return generated content
- [ ] POST `/api/admin/ai/translate`
  - Auto-translate EN → AR
  - Maintain formatting
  - Return translated text

#### **3. Admin UI**
- [ ] Create `/admin/ai` page
- [ ] Add "AI Assistant" panel to post editor
- [ ] Implement prompt templates
- [ ] Show generation history
- [ ] Add feedback mechanism (thumbs up/down)

#### **4. Automation Workflows**
- [ ] Auto-generate SEO metadata
- [ ] Auto-create social media posts
- [ ] Schedule publishing
- [ ] Auto-translate posts
- [ ] Content enhancement suggestions

#### **5. Feature Flags**
- [ ] `NEXT_PUBLIC_FF_AI_ENABLED`
- [ ] `NEXT_PUBLIC_AI_MODEL` (default: GPT-4)
- [ ] `AI_MAX_TOKENS` (rate limiting)

### **Technical Details**

**AI Integration:**
```typescript
// Use Vercel AI SDK
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });
  
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

### **Acceptance Criteria**
- [ ] Can generate content from prompts
- [ ] Can ingest URLs and extract content
- [ ] Auto-translation works for EN → AR
- [ ] SEO metadata auto-generated
- [ ] RBAC enforced (EDITOR+ can use AI)

### **Estimated Effort**
- Development: 50-70 hours
- Testing: 15-20 hours
- Documentation: 10 hours

### **Dependencies**
- Phase 6 Full (complete)
- OpenAI API key or Anthropic API key

### **Cost Considerations**
- OpenAI API costs (~$0.01-0.03 per 1k tokens)
- Rate limiting required
- User quotas recommended

---

## 📋 Issue #3: Phase 9 — Social Generator + Email Integration

**Title:** Phase 9: Social Media Post Generator & Email Campaigns

**Labels:** `enhancement`, `phase-9`, `social`, `email`

**Description:**

### **Overview**
Generate social media content from blog posts and send email campaigns.

### **Features**

#### **1. Social Post Generator**
- [ ] Database schema:
  - `SocialPost` model (platform, content, scheduledFor, status)
- [ ] Generate Twitter/X thread from blog post
- [ ] Generate LinkedIn post with preview
- [ ] Generate Facebook post
- [ ] Support images and hashtags
- [ ] Schedule posts for optimal times

#### **2. Email Campaign System**
- [ ] Database schema:
  - `EmailCampaign` model
  - `EmailSubscriber` model (GDPR compliant)
- [ ] Newsletter composer
- [ ] Template system
- [ ] Subscriber management
- [ ] Send via Resend/SendGrid
- [ ] Track opens and clicks

#### **3. Admin UI**
- [ ] `/admin/social-generator` page
- [ ] `/admin/email` page
- [ ] Preview before posting/sending
- [ ] Schedule management
- [ ] Analytics dashboard

#### **4. Compliance**
- [ ] GDPR consent tracking
- [ ] Unsubscribe mechanism
- [ ] Data export functionality
- [ ] Privacy policy integration
- [ ] Email validation (SPF, DKIM, DMARC)

### **Technical Details**

**Email Provider Integration:**
```typescript
// Using Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'newsletter@khaledaun.com',
  to: subscribers,
  subject: 'New Blog Post',
  html: emailTemplate,
});
```

**Social Post Example:**
```typescript
// Generate LinkedIn post from blog
const linkedInPost = await generateSocialPost({
  platform: 'linkedin',
  sourcePost: blogPost,
  maxLength: 3000,
  includeThumbnail: true,
});
```

### **Acceptance Criteria**
- [ ] Can generate social posts from blog content
- [ ] Can schedule social posts
- [ ] Can send email campaigns
- [ ] GDPR compliant (consent, unsubscribe)
- [ ] Analytics tracking works

### **Estimated Effort**
- Development: 60-80 hours
- Testing: 20-25 hours
- Documentation: 10-15 hours
- Compliance review: 10 hours

### **Dependencies**
- Phase 6 Full (complete)
- Phase 8 Full (complete)
- Email service (Resend/SendGrid)
- Social media API access (optional)

### **Legal Considerations**
- GDPR compliance required
- CAN-SPAM Act compliance (US)
- Terms of service for social APIs

---

## 📋 Issue #4: Observability & Monitoring

**Title:** Production Observability: Analytics, Monitoring, and Uptime

**Labels:** `ops`, `monitoring`, `analytics`, `infrastructure`

**Description:**

### **Overview**
Ensure production stability with comprehensive monitoring and analytics.

### **Features**

#### **1. Vercel Analytics**
- [ ] Enable Vercel Web Analytics
- [ ] Configure custom events
- [ ] Set up conversion tracking
- [ ] Dashboard for key metrics
- [ ] Alerts for traffic anomalies

#### **2. Sentry Setup**
- [ ] Complete Sentry configuration
- [ ] Error boundary components
- [ ] User feedback widget
- [ ] Performance monitoring
- [ ] Release tracking
- [ ] Source maps upload

#### **3. Uptime Monitoring**
- [ ] Add health check endpoint monitoring
- [ ] Set up UptimeRobot or similar
- [ ] Configure alerts (email, Slack)
- [ ] Monitor both site and admin
- [ ] Check every 5 minutes

#### **4. Database Monitoring**
- [ ] Supabase dashboard metrics
- [ ] Query performance tracking
- [ ] Connection pool monitoring
- [ ] Slow query alerts
- [ ] Storage usage tracking

#### **5. Custom Metrics**
- [ ] Log key user actions (publish, upload, etc.)
- [ ] Track API response times
- [ ] Monitor cache hit rates
- [ ] Content creation metrics
- [ ] User engagement analytics

### **Technical Details**

**Sentry Configuration:**
```typescript
// apps/site/src/app/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

**Health Check Monitoring:**
```bash
# UptimeRobot monitors
GET https://khaledaun.vercel.app/api/health
GET https://admin.khaledaun.vercel.app/api/health

# Expected: 200 OK with { ok: true }
# Alert if: 5xx errors or response time > 5s
```

**Custom Analytics Event:**
```typescript
// Track publish events
analytics.track('post_published', {
  locale: 'en',
  category: 'blog',
  author: user.id,
});
```

### **Acceptance Criteria**
- [ ] Vercel Analytics enabled and tracking
- [ ] Sentry capturing errors
- [ ] Uptime monitoring active
- [ ] Alerts configured (email + Slack)
- [ ] Dashboard accessible

### **Estimated Effort**
- Development: 20-30 hours
- Configuration: 10-15 hours
- Documentation: 5 hours

### **Dependencies**
- Production deployment
- Sentry account (free tier OK)
- UptimeRobot account (free tier OK)

### **Cost**
- Sentry: Free tier (5k events/month)
- UptimeRobot: Free tier (50 monitors)
- Vercel Analytics: Included with Pro plan

---

## 📝 **Creating These Issues**

### **Template for GitHub Issue:**

```markdown
<!-- Copy each issue above into GitHub -->

**Labels:** [as specified]

**Milestone:** [Q4 2024 / Q1 2025]

**Assignees:** [Team members]

**Related Issues:** 
- Depends on: #[phase-6-full], #[phase-8-full]
- Blocks: [future phases]

**Checklist:**
- [ ] Requirements gathering
- [ ] Technical design
- [ ] Implementation
- [ ] Testing
- [ ] Documentation
- [ ] Deployment

**Notes:**
[Add any additional context or questions]
```

---

## 🎯 **Priority Ranking**

**High Priority (Next Sprint):**
1. Issue #4 - Observability (production stability)
2. Issue #1 - Phase 6.5 (user-facing improvements)

**Medium Priority (Q4 2024):**
3. Issue #2 - Phase 7 (AI automation)

**Lower Priority (Q1 2025):**
4. Issue #3 - Phase 9 (social/email)

---

## 📊 **Effort Summary**

| Issue | Development | Testing | Docs | Total |
|-------|-------------|---------|------|-------|
| Phase 6.5 | 40-60h | 10-15h | 5-10h | 55-85h |
| Phase 7 | 50-70h | 15-20h | 10h | 75-100h |
| Phase 9 | 60-80h | 20-25h | 10-15h | 90-120h |
| Observability | 20-30h | 0h | 5h | 25-35h |
| **Total** | **170-240h** | **45-60h** | **30-40h** | **245-340h** |

---

**Document Version:** 1.0  
**Last Updated:** October 16, 2024  
**Maintainer:** Development Team

