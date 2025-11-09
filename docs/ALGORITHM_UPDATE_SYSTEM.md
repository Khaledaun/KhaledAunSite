# Algorithm Update Tracking System

## Overview

This system automatically tracks algorithm updates from SEO, AI Optimization (AIO), and LinkedIn sources, analyzes them using LLM, and updates content generation prompts to stay current with the latest ranking factors and best practices.

## Features

- **Automated Weekly Fetching**: Cron job runs every Monday at 9:00 AM to fetch latest updates
- **Multi-Source Tracking**:
  - **SEO**: Google Search Central, Search Engine Journal, Moz
  - **AIO**: OpenAI Blog, Perplexity, Google AI Blog (SGE)
  - **LinkedIn**: LinkedIn Engineering Blog, LinkedIn Official Blog
- **LLM-Powered Analysis**: Uses GPT-4 to extract actionable insights
- **Prompt Auto-Update**: Automatically or manually update content generation prompts
- **Impact Classification**: LOW, MEDIUM, HIGH, CRITICAL
- **Notification System**: Alerts for important updates

## Architecture

```
┌─────────────────┐
│  Cron Job       │  Runs weekly (Monday 9 AM)
│  (Vercel Cron)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Updates  │  Search blogs/RSS feeds
│  (Web Search)   │  Last 7 days
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to DB     │  AlgorithmUpdate model
│  (Deduplicate)  │  Classify impact
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LLM Analysis   │  Extract insights
│  (GPT-4)        │  Generate recommendations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update Prompts │  Auto or manual
│  (AIPromptTemp) │  Version control
└─────────────────┘
```

## Database Schema

### AlgorithmUpdate Model

```prisma
model AlgorithmUpdate {
  id          String   @id @default(cuid())

  // Source Info
  source      AlgorithmSource  // SEO, AIO, LINKEDIN
  title       String
  description String?
  url         String
  publishedAt DateTime

  // Classification
  category    String[]         // ["ranking", "content-quality", "technical-seo"]
  impact      UpdateImpact     // LOW, MEDIUM, HIGH, CRITICAL
  platform    String?          // "google", "chatgpt", "perplexity", "linkedin"

  // Analysis
  analyzed    Boolean          @default(false)
  insights    Json?            // LLM-extracted actionable insights
  promptUpdates String?        // Recommended prompt changes

  // Status
  applied     Boolean          @default(false)
  appliedAt   DateTime?
  appliedBy   String?

  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```

## API Endpoints

### 1. List Algorithm Updates

```bash
GET /api/admin/algorithm-updates?source=SEO&analyzed=true&limit=20
```

**Response:**
```json
{
  "updates": [...],
  "stats": {
    "total": 15,
    "bySource": { "SEO": 10, "AIO": 3, "LINKEDIN": 2 },
    "byImpact": { "CRITICAL": 1, "HIGH": 4, "MEDIUM": 10 }
  }
}
```

### 2. Fetch New Updates

```bash
POST /api/admin/algorithm-updates/fetch
Content-Type: application/json

{
  "daysBack": 7
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "fetched": 25,
    "saved": 12,
    "skipped": 13,
    "errors": 0
  }
}
```

### 3. Analyze Updates

```bash
POST /api/admin/algorithm-updates/analyze
Content-Type: application/json

{
  "updateIds": ["update_1", "update_2"],
  "batchMode": true
}
```

**Response:**
```json
{
  "success": true,
  "analyzedCount": 2,
  "result": {
    "consolidatedInsights": "...",
    "priorityUpdates": [
      {
        "section": "Content generation system prompt",
        "currentApproach": "Focus on keyword density",
        "suggestedChange": "Focus on E-E-A-T and topical authority",
        "reasoning": "Google's helpful content update prioritizes expertise"
      }
    ]
  }
}
```

### 4. Apply Updates to Prompts

```bash
POST /api/admin/algorithm-updates/apply
Content-Type: application/json

{
  "updateIds": ["update_1", "update_2"],
  "templateIds": ["template_seo", "template_content"],
  "autoApply": false
}
```

**Response (Preview Mode):**
```json
{
  "success": true,
  "updatedTemplates": [
    {
      "templateId": "template_seo",
      "templateName": "SEO Blog Post Generator",
      "currentPrompt": "...",
      "newPrompt": "...",
      "diff": {
        "additions": ["Focus on E-E-A-T signals"],
        "removals": ["Keyword stuffing"],
        "modifications": [...]
      },
      "applied": false
    }
  ]
}
```

**Auto-Apply Mode:**
```json
{
  "autoApply": true
}
```

### 5. Cron Job (Automatic)

```bash
GET /api/cron/algorithm-updates
Authorization: Bearer <CRON_SECRET>
```

Runs automatically every Monday at 9:00 AM via Vercel Cron.

## Usage Workflows

### Workflow 1: Manual Weekly Review

```bash
# 1. Fetch latest updates
curl -X POST https://your-domain.com/api/admin/algorithm-updates/fetch \
  -H "Content-Type: application/json" \
  -d '{"daysBack": 7}'

# 2. Get unanalyzed updates
curl https://your-domain.com/api/admin/algorithm-updates/analyze/unanalyzed

# 3. Analyze updates
curl -X POST https://your-domain.com/api/admin/algorithm-updates/analyze \
  -H "Content-Type: application/json" \
  -d '{"updateIds": ["id1", "id2"], "batchMode": true}'

# 4. Preview prompt changes
curl -X POST https://your-domain.com/api/admin/algorithm-updates/apply \
  -H "Content-Type: application/json" \
  -d '{"updateIds": ["id1", "id2"], "autoApply": false}'

# 5. Manually approve and apply
curl -X POST https://your-domain.com/api/admin/algorithm-updates/apply \
  -H "Content-Type: application/json" \
  -d '{"updateIds": ["id1", "id2"], "autoApply": true}'
```

### Workflow 2: Fully Automated

The cron job handles everything automatically:

1. **Fetch** updates from sources
2. **Analyze** using LLM
3. **Notify** admins of critical updates
4. Admins **review** and **apply** via UI

### Workflow 3: Emergency Update

For critical algorithm updates that need immediate action:

```bash
# 1. Manually add update
curl -X POST https://your-domain.com/api/admin/algorithm-updates \
  -H "Content-Type: application/json" \
  -d '{
    "source": "SEO",
    "title": "Google March 2024 Core Update",
    "description": "Major ranking algorithm change",
    "url": "https://...",
    "publishedAt": "2024-03-15T10:00:00Z",
    "category": ["ranking", "content-quality"],
    "impact": "CRITICAL",
    "platform": "google"
  }'

# 2. Immediately analyze
curl -X POST https://your-domain.com/api/admin/algorithm-updates/analyze \
  -H "Content-Type: application/json" \
  -d '{"updateIds": ["new_id"], "batchMode": false}'

# 3. Auto-apply changes
curl -X POST https://your-domain.com/api/admin/algorithm-updates/apply \
  -H "Content-Type: application/json" \
  -d '{"updateIds": ["new_id"], "autoApply": true}'
```

## Configuration

### Environment Variables

```env
# Required for LLM analysis
OPENAI_API_KEY=sk-...

# Required for cron job authentication
CRON_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### Vercel Cron Configuration

File: `apps/admin/vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/algorithm-updates",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

**Cron Schedule:**
- `0 9 * * 1` = Every Monday at 9:00 AM UTC
- To change: Use [crontab.guru](https://crontab.guru/)

Examples:
- Daily at 9 AM: `0 9 * * *`
- Twice weekly (Mon, Thu): `0 9 * * 1,4`
- First day of month: `0 9 1 * *`

## Customization

### Add New Sources

Edit `packages/utils/algorithm-update-fetcher.ts`:

```typescript
const SOURCES = {
  SEO: [
    // Add new source
    {
      name: 'Your SEO Blog',
      url: 'https://yourblog.com/seo',
      keywords: ['algorithm', 'ranking'],
    },
  ],
};
```

### Customize Impact Classification

Edit classification rules:

```typescript
export function classifyImpact(title: string, description: string) {
  // Add custom keywords
  const criticalKeywords = [
    'core update',
    'your-custom-keyword',
  ];

  // Custom logic
  if (title.includes('breaking')) return 'CRITICAL';

  // ...
}
```

### Customize Prompt Analysis

Edit `packages/utils/prompt-update-analyzer.ts` to change the LLM prompts:

```typescript
const systemPrompt = `You are an expert SEO strategist...
[Customize this to match your specific needs]`;
```

## Monitoring

### Check System Health

```bash
# Get unanalyzed updates count
curl https://your-domain.com/api/admin/algorithm-updates/analyze/unanalyzed

# Get recent activity
curl https://your-domain.com/api/admin/algorithm-updates?limit=10
```

### Review Cron Job Logs

Vercel Dashboard > Deployments > Functions > `/api/cron/algorithm-updates`

## Best Practices

1. **Review Before Auto-Apply**: Use preview mode first
2. **Monitor Impact**: Prioritize HIGH/CRITICAL updates
3. **Version Control**: Keep old prompts for rollback
4. **Test Changes**: A/B test prompt updates
5. **Weekly Review**: Check dashboard every Monday after cron
6. **Backup Prompts**: Export templates regularly

## Troubleshooting

### Cron Not Running

1. Check Vercel Cron configuration
2. Verify `CRON_SECRET` environment variable
3. Check function logs in Vercel dashboard

### Analysis Failing

1. Verify `OPENAI_API_KEY` is set
2. Check API rate limits
3. Review error logs

### No Updates Found

1. Verify web search is working
2. Check source URLs are accessible
3. Adjust `daysBack` parameter

## Future Enhancements

- [ ] Web scraping implementation for sources
- [ ] Email/Slack notifications
- [ ] A/B testing framework for prompts
- [ ] Historical prompt version comparison
- [ ] Custom source RSS feed support
- [ ] Multi-LLM analysis (GPT-4, Claude, Gemini)
- [ ] Auto-rollback on performance degradation

## Support

For issues or questions:
- Check logs: `/api/admin/algorithm-updates`
- Review documentation: This file
- Contact: [Your contact info]
