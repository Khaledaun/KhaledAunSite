# Phase 7 Readiness - Automation Skeleton (ICC/DIAC → Drafts)

**Date**: October 12, 2025  
**Phase**: Phase 7 - Content Automation from ICC/DIAC Sources  
**Status**: 🔴 **NOT READY** (0% complete)

---

## Overview

Phase 7 implements automated content ingestion from:
- **ICC** (International Chamber of Commerce) - Legal/arbitration news
- **DIAC** (Dubai International Arbitration Centre) - Case updates
- **Admin UI** - Automation tab with job monitoring
- **Cron Jobs** - Scheduled ingestion (disabled by default)
- **Feature Flag** - `FF_AUTOMATION` to enable/disable

---

## 1. Ingestor Implementation

### ❌ MISSING: All Ingestors

**Expected Files** (not found):
```
packages/ingestors/
├── icc/
│   ├── scraper.ts        # ICC website scraper
│   ├── parser.ts         # Extract articles
│   └── transformer.ts    # Convert to draft format
├── diac/
│   ├── scraper.ts        # DIAC RSS/API
│   ├── parser.ts         # Extract case updates
│   └── transformer.ts    # Convert to draft format
└── shared/
    ├── types.ts          # Common interfaces
    └── utils.ts          # Shared utilities
```

**Impact**: HIGH - No automation possible

---

## 2. Database Support

### ⚠️ PARTIAL: JobRun Model Exists

**File**: `packages/db/prisma/schema.prisma:100-112`
```prisma
model JobRun {
  id          String   @id @default(cuid())
  type        String   // "content_generation", "seo_analysis", etc.
  status      String   @default("PENDING") // PENDING, RUNNING, COMPLETED, FAILED
  input       Json?
  output      Json?
  error       String?
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("job_runs")
}
```

**✅ Present**: Job tracking model exists  
**❌ Missing**: Specific automation-related job types

---

### ❌ MISSING: Source Configuration Table

**Required Schema** (not present):
```prisma
model AutomationSource {
  id          String   @id @default(cuid())
  name        String   // "ICC", "DIAC"
  type        String   // "scraper", "rss", "api"
  url         String
  schedule    String   // Cron expression
  enabled     Boolean  @default(false)
  lastRun     DateTime?
  config      Json?    // Source-specific config
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("automation_sources")
}
```

**Impact**: HIGH - Cannot configure sources dynamically

---

### ❌ MISSING: Prompt Templates Table

**Required Schema** (not present):
```prisma
model PromptTemplate {
  id          String   @id @default(cuid())
  name        String   // "ICC Article to Draft", "DIAC Case to Draft"
  sourceType  String   // "icc", "diac"
  template    String   // Prompt template with {{variables}}
  model       String   @default("gpt-4")
  temperature Float    @default(0.7)
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("prompt_templates")
}
```

**Impact**: MEDIUM - Hard-coded prompts instead of configurable

---

## 3. Admin Automation Tab

### ❌ MISSING: Automation UI Pages

**Expected Path** (not found): `apps/admin/app/(dashboard)/automation/`

**Required Files**:
```
apps/admin/app/(dashboard)/automation/
├── page.tsx              # Overview dashboard
├── sources/
│   ├── page.tsx          # Manage sources
│   └── [id]/
│       └── page.tsx      # Edit source config
├── jobs/
│   ├── page.tsx          # Job queue/history
│   └── [id]/
│       └── page.tsx      # Job details/logs
└── prompts/
    ├── page.tsx          # Manage prompt templates
    └── [id]/
        └── page.tsx      # Edit prompt
```

**Impact**: HIGH - Cannot monitor or manage automation

---

## 4. Secure /api/ingest Route

### ❌ MISSING: Ingest API Endpoint

**Expected File** (not found): `apps/admin/app/api/ingest/route.ts`

**Required Implementation**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@khaledaun/auth';

export async function POST(request: NextRequest) {
  // Security: Verify API key or cron secret
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.INGEST_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { sourceId } = await request.json();
  
  // Check feature flag
  if (process.env.FF_AUTOMATION !== 'true') {
    return NextResponse.json({ error: 'Automation disabled' }, { status: 403 });
  }
  
  // Queue ingestion job
  const job = await createJob({
    type: 'ingest',
    sourceId,
    status: 'PENDING'
  });
  
  // Trigger worker (background)
  await triggerIngestWorker(job.id);
  
  return NextResponse.json({ jobId: job.id });
}
```

**Impact**: HIGH - Cannot trigger ingestion

---

### ❌ MISSING: Worker Process

**Expected File** (not found): `packages/workers/ingest-worker.ts`

**Required**:
```typescript
export async function processIngestJob(jobId: string) {
  const job = await getJob(jobId);
  const source = await getSource(job.sourceId);
  
  try {
    // Update job status
    await updateJob(jobId, { status: 'RUNNING' });
    
    // Run ingestor
    const articles = await runIngestor(source);
    
    // For each article, create draft
    for (const article of articles) {
      const prompt = await getPromptTemplate(source.type);
      const content = await generateContent(article, prompt);
      
      await createPost({
        title: article.title,
        content,
        status: 'DRAFT',
        riskLevel: 'MEDIUM', // Auto-generated = medium risk
        authorId: 'system',
        metadata: {
          source: source.name,
          originalUrl: article.url,
          ingestedAt: new Date()
        }
      });
    }
    
    // Mark job complete
    await updateJob(jobId, {
      status: 'COMPLETED',
      output: { articlesProcessed: articles.length }
    });
  } catch (error) {
    await updateJob(jobId, {
      status: 'FAILED',
      error: error.message
    });
  }
}
```

**Impact**: HIGH - Cannot process ingestion jobs

---

## 5. Cron Configuration

### ❌ MISSING: Cron Setup

**Expected File** (not found): `vercel.json` cron configuration

**Required**:
```json
{
  "crons": [
    {
      "path": "/api/cron/ingest",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Status**: Commented out by default (as specified)

---

### ❌ MISSING: Cron Endpoint

**Expected File** (not found): `apps/admin/app/api/cron/ingest/route.ts`

**Required**:
```typescript
export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check feature flag
  if (process.env.FF_AUTOMATION !== 'true') {
    return NextResponse.json({ message: 'Automation disabled' });
  }
  
  // Get enabled sources
  const sources = await getEnabledSources();
  
  // Queue jobs for each source
  const jobs = await Promise.all(
    sources.map(source =>
      fetch(`${process.env.ADMIN_URL}/api/ingest`, {
        method: 'POST',
        headers: { 'x-api-key': process.env.INGEST_API_KEY! },
        body: JSON.stringify({ sourceId: source.id })
      })
    )
  );
  
  return NextResponse.json({ jobsQueued: jobs.length });
}
```

**Impact**: MEDIUM - Manual triggering still possible

---

## 6. Feature Flag

### ❌ MISSING: Feature Flag Implementation

**Expected in Environment**:
```bash
# env.production.example
FF_AUTOMATION=false  # Disabled by default
INGEST_API_KEY=...
CRON_SECRET=...
```

**Expected Check**:
```typescript
// packages/utils/features.ts
export function isAutomationEnabled(): boolean {
  return process.env.FF_AUTOMATION === 'true';
}
```

**Impact**: LOW - Easy to add

---

## Phase 7 Readiness Summary

### Found (0%)
- Nothing automation-specific implemented yet

### Missing (100%)
| Component | Priority | Status |
|-----------|----------|--------|
| ICC ingestor | 🔴 HIGH | ❌ Not present |
| DIAC ingestor | 🔴 HIGH | ❌ Not present |
| AutomationSource model | 🔴 HIGH | ❌ Not present |
| PromptTemplate model | 🟡 MEDIUM | ❌ Not present |
| Automation admin UI | 🔴 HIGH | ❌ Not present |
| /api/ingest endpoint | 🔴 HIGH | ❌ Not present |
| Ingest worker | 🔴 HIGH | ❌ Not present |
| Cron configuration | 🟡 MEDIUM | ❌ Not present |
| Cron endpoint | 🟡 MEDIUM | ❌ Not present |
| Feature flag | 🟢 LOW | ❌ Not present |

---

## Concrete Next PR: `feat/phase7-automation-skeleton-icc-diac-to-draft`

### Dependencies
- ⚠️ **BLOCKED by Phase 6** - Requires Post model and admin UI

### Estimated Effort
- **Total**: ~120 hours (~15 working days)
- Ingestors: 40h
- Database + APIs: 32h
- Admin UI: 32h
- Worker process: 16h

---

## Go/No-Go Recommendation

**Status**: 🔴 **NO-GO** - Completely blocked by Phase 6

**Blockers**:
1. 🔴 Phase 6 not complete - Cannot create draft posts
2. 🔴 No admin UI foundation - Cannot build automation dashboard
3. 🔴 No AI integration - Cannot generate content from sources

**Recommendation**: 
1. Complete Phase 6 + 6.5 first
2. Consider Phase 7 as **optional** - manual content creation may be sufficient initially
3. If automation is critical, start with single source (ICC only) to reduce scope

**Alternative**: "Manual Automation" - Admin can paste URLs, system extracts/drafts (no cron, no scraping)

