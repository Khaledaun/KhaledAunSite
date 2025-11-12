# Quality & Observability
**Performance, Testing, Logging, and Monitoring**

> **Generated:** December 2024  
> **Purpose:** Quality assurance and system monitoring documentation

---

## Table of Contents
1. [Testing Coverage](#testing-coverage)
2. [Performance Optimization](#performance-optimization)
3. [Logging & Monitoring](#logging--monitoring)
4. [Error Handling](#error-handling)
5. [Edge Cases & Known Issues](#edge-cases--known-issues)

---

## Testing Coverage

### Test Framework: Playwright

**Configuration:** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './apps/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
```

### E2E Test Suites

| Test Suite | File | Coverage | Status |
|------------|------|----------|--------|
| **API Smoke Tests** | `api-smoke.spec.ts` | Health check, basic API routes | ✅ Passing |
| **Auth & Authorization** | `auth-rls.spec.ts` | Login, roles, RLS policies | ✅ Passing |
| **Content Happy Path** | `content-happy-path.spec.ts` | Create → Edit → Publish workflow | ✅ Passing |
| **AI Features** | `ai-features.spec.ts` | AI generation, fact extraction, outline | ✅ Passing |
| **Media Management** | `media-management.spec.ts` | Upload, organize, delete media | ✅ Passing |
| **Lead Capture** | `lead-capture-happy-path.spec.ts` | Contact form → CRM sync | ✅ Passing |
| **Social Embeds** | `social-embed-admin.spec.ts` | Manage social media embeds | ✅ Passing |
| **SEO Guardrails** | `seo-guardrails.spec.ts` | SEO validation, scoring | ✅ Passing |
| **CMS Lite** | `cms-lite-workflow.spec.ts` | Hero, experiences, credentials | ✅ Passing |
| **RBAC & i18n** | `cms-rbac-i18n.spec.ts` | Role-based access, translations | ✅ Passing |
| **Error Handling** | `workflows/error-handling-workflow.spec.ts` | Error states, validation | ✅ Passing |
| **HITL Workflows** | `workflows/hitl-workflow.spec.ts` | Human-in-loop approval | ✅ Passing |
| **Production Validation** | `production-validation.spec.ts` | Production smoke tests | ✅ Passing |

### Test Coverage Statistics

| Area | Coverage | Notes |
|------|----------|-------|
| **API Routes** | ~80% | Core CRUD operations covered |
| **UI Workflows** | ~70% | Major user journeys covered |
| **Auth & RBAC** | ~90% | Comprehensive role/permission tests |
| **Integrations** | ~50% | Basic integration tests (mocked) |
| **Edge Cases** | ~40% | Partial coverage, needs expansion |

### Example Test: Content Creation

```typescript
test('Author can create and submit content for review', async ({ page }) => {
  // Login as AUTHOR
  await loginAs(page, 'author@example.com', 'password');
  
  // Navigate to new content
  await page.goto('/content/new');
  
  // Fill form
  await page.fill('[name="title"]', 'Test Article');
  await page.fill('[role="textbox"]', '<p>Test content...</p>');
  await page.selectOption('[name="type"]', 'blog');
  
  // Save draft
  await page.click('button:has-text("Save Draft")');
  await expect(page.locator('.toast-success')).toBeVisible();
  
  // Submit for review
  await page.click('button:has-text("Submit for Review")');
  await expect(page.locator('.status-badge')).toHaveText('Review');
  
  // Verify AUTHOR cannot publish
  await expect(page.locator('button:has-text("Publish")')).not.toBeVisible();
});
```

### Test Data Management

**Strategy:** Isolated test database per run

```typescript
// test-utils.ts
export async function setupTestData() {
  // Create test users with roles
  await prisma.user.create({
    data: {
      email: 'author@test.com',
      roles: { create: { role: 'AUTHOR' } },
    },
  });
  
  // Create test content
  await prisma.contentLibrary.create({
    data: {
      title: 'Test Article',
      content: '<p>Content...</p>',
      status: 'draft',
      type: 'blog',
    },
  });
}

export async function cleanupTestData() {
  await prisma.$transaction([
    prisma.contentLibrary.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
```

---

## Performance Optimization

### Response Time Targets

| Endpoint Type | Target | Actual (P95) | Status |
|---------------|--------|--------------|--------|
| **Static Pages** | < 500ms | ~350ms | ✅ |
| **API (Simple)** | < 200ms | ~150ms | ✅ |
| **API (Complex)** | < 1000ms | ~800ms | ✅ |
| **AI Generation** | < 15s | ~12s | ✅ |
| **Image Upload** | < 3s | ~2.5s | ✅ |
| **LinkedIn Post** | < 5s | ~4s | ✅ |
| **Email Send (batch)** | < 10s | ~8s | ✅ |

### Optimization Techniques

#### 1. Database Optimization

**Indexes:**
```prisma
model ContentLibrary {
  // ...fields
  
  @@index([status])
  @@index([type])
  @@index([publishedAt])
  @@index([authorId])
  @@index([createdAt])
}
```

**Query Optimization:**
```typescript
// ❌ Bad: N+1 query
const contents = await prisma.contentLibrary.findMany();
for (const content of contents) {
  const topic = await prisma.topic.findUnique({ where: { id: content.topicId } });
}

// ✅ Good: Eager loading
const contents = await prisma.contentLibrary.findMany({
  include: { topic: true },
});
```

**Connection Pooling:**
- PgBouncer enabled on Supabase
- Pool size: 20 connections
- Transaction pooler for migrations
- Session pooler for queries

#### 2. Caching

**Strategy:** No client-side caching (admin real-time data)

```typescript
// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Disable Next.js cache
export const revalidate = 0;
```

#### 3. Image Optimization

**Sharp Processing:**
```typescript
import sharp from 'sharp';

// Resize & optimize on upload
const optimized = await sharp(buffer)
  .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85, progressive: true })
  .toBuffer();

// Generate thumbnail
const thumbnail = await sharp(buffer)
  .resize(300, 300, { fit: 'cover' })
  .jpeg({ quality: 75 })
  .toBuffer();
```

#### 4. Bundle Size

**Admin App:**
- First Load JS: 87.5 kB (shared)
- Average Page: ~90-100 kB
- Largest Page: ~200 kB (content editor with TipTap)

**Optimization:**
- Tree-shaking enabled
- Code splitting by route
- Dynamic imports for heavy components

```typescript
// Dynamic import for heavy editor
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <div>Loading editor...</div>,
  ssr: false,
});
```

---

## Logging & Monitoring

### Logging Stack

**Library:** Pino (structured logging)

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true },
  } : undefined,
});
```

### Log Levels & Usage

| Level | Usage | Example |
|-------|-------|---------|
| **error** | Failures, exceptions | API errors, integration failures |
| **warn** | Unexpected but handled | Missing optional fields, deprecated usage |
| **info** | Normal operations | User actions, successful operations |
| **debug** | Development details | Request/response data, timings |

### Log Structure

```json
{
  "level": "info",
  "time": 1701432000000,
  "msg": "Content published",
  "context": {
    "userId": "user-uuid",
    "contentId": "content-uuid",
    "type": "blog",
    "duration": 1250
  }
}
```

### Key Logging Points

```typescript
// API request start
logger.info('API request', {
  method: request.method,
  path: request.nextUrl.pathname,
  userId: user?.id,
});

// Database operations
logger.debug('Database query', {
  model: 'ContentLibrary',
  operation: 'create',
  duration: Date.now() - startTime,
});

// External API calls
logger.info('LinkedIn post created', {
  contentId,
  platform: 'linkedin',
  permalink,
  duration: Date.now() - startTime,
});

// Errors
logger.error('Failed to publish content', {
  contentId,
  error: error.message,
  stack: error.stack,
});
```

### Monitoring: Sentry

**Configuration:** `sentry.server.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
    }
    return event;
  },
});
```

**Tracked Events:**
- Unhandled exceptions
- API route errors
- Failed database queries
- Integration failures (LinkedIn, HubSpot, Resend)
- Performance anomalies (>5s response time)

**Custom Error Tracking:**
```typescript
try {
  await publishToLinkedIn(content);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'linkedin_posting',
      contentType: content.type,
    },
    extra: {
      contentId: content.id,
      accountId: socialAccount.id,
    },
  });
  throw error;
}
```

---

## Error Handling

### Error Classification

| Class | HTTP Code | User Action | Example |
|-------|-----------|-------------|---------|
| **Validation Error** | 400 | Fix input | Invalid email format |
| **Authentication Error** | 401 | Login | Session expired |
| **Authorization Error** | 403 | Contact admin | Insufficient permissions |
| **Not Found** | 404 | Check URL | Content doesn't exist |
| **Conflict** | 409 | Resolve conflict | Email already registered |
| **Rate Limit** | 429 | Wait & retry | Too many requests |
| **Server Error** | 500 | Retry or contact support | Database connection failed |
| **Integration Error** | 502/503 | Retry later | LinkedIn API down |

### Error Response Format

```typescript
interface ErrorResponse {
  error: string; // Human-readable message
  code?: string; // Machine-readable code
  details?: unknown; // Additional context
  timestamp: string;
  requestId?: string; // For support tracking
}
```

**Example:**
```json
{
  "error": "Content cannot be published",
  "code": "VALIDATION_FAILED",
  "details": {
    "issues": [
      { "field": "title", "message": "Title is required" },
      { "field": "content", "message": "Content is too short (min 100 chars)" }
    ]
  },
  "timestamp": "2024-12-01T10:00:00Z",
  "requestId": "req_abc123"
}
```

### Client-Side Error Handling

```typescript
async function publishContent(contentId: string) {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`/api/content-library/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'published' }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to publish');
    }
    
    const data = await response.json();
    toast.success('Content published successfully!');
    return data;
    
  } catch (error) {
    const message = error.message || 'An unexpected error occurred';
    toast.error(message);
    logger.error('Publish failed', { contentId, error });
    throw error;
    
  } finally {
    setLoading(false);
  }
}
```

### Retry Logic

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delays: number[] = [1000, 5000, 15000]
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error; // Final attempt failed
      }
      
      const delay = delays[attempt];
      logger.warn('Retrying after failure', { attempt, delay });
      await sleep(delay);
    }
  }
  throw new Error('Unreachable');
}
```

---

## Edge Cases & Known Issues

### Edge Cases Handled

✅ **Concurrent Editing**
- Topic locking prevents race conditions
- Last-write-wins for content updates
- Optimistic UI with conflict resolution

✅ **Token Expiry**
- LinkedIn tokens refreshed automatically
- Graceful fallback if refresh fails
- User prompted to reconnect account

✅ **Partial Email Send Failures**
- Individual send errors logged
- Campaign continues for remaining recipients
- Retry queue for failed sends

✅ **Webhook Idempotency**
- Duplicate events ignored via `providerEventId`
- Upsert operations for metrics
- Event replay safe

✅ **Large File Uploads**
- Client-side file size validation (max 10MB)
- Chunked upload (if needed)
- Server-side validation before storage

✅ **Malformed HTML**
- Sanitization on input (sanitize-html)
- XSS protection
- Safe rendering in editor

### Known Issues & Limitations

❌ **LinkedIn Carousel Posts**
- API support limited
- Complex upload flow
- **Workaround:** Single image or text-only

⚠️ **Email Template Variables**
- No preview before send
- **Improvement needed:** Add preview modal

⚠️ **Subscriber Segmentation**
- Basic tag-based filtering only
- **Future:** Advanced behavioral segmentation

⚠️ **Content Versioning**
- No version history
- **Future:** Implement content snapshots

⚠️ **Media Library Search**
- Basic text search only
- **Improvement needed:** Visual similarity search, AI tagging

⚠️ **Rate Limiting**
- No rate limiting on admin APIs
- **Risk:** Potential abuse if credentials leaked
- **Mitigation:** Supabase RLS + strong auth

⚠️ **Audit Trail Gaps**
- Not all actions logged
- **Future:** Comprehensive audit log

❌ **Multi-tenancy**
- Single-tenant system (personal brand)
- **Not planned:** Multi-user/multi-brand support

### Performance Bottlenecks

⚠️ **AI Generation**
- Can take 10-15 seconds
- **Impact:** User waiting
- **Mitigation:** Loading states, allow cancellation

⚠️ **Batch Email Sending**
- 50 emails per batch, sequential batches
- **Impact:** Large campaigns (1000+) take minutes
- **Mitigation:** Background job, status updates

⚠️ **Image Processing**
- Sharp processing can be slow for large images
- **Impact:** Upload takes 2-3 seconds
- **Mitigation:** Client-side resizing (future)

---

## Health Check Endpoint

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-01T10:00:00Z",
  "uptime": 86400,
  "environment": "production",
  "version": "1.0.0",
  "commit": "abc1234",
  "checks": {
    "db": true,
    "storage": true,
    "adminAuth": true
  },
  "responseTime": 45
}
```

**Status Values:**
- `healthy` - All checks passing
- `degraded` - Some non-critical checks failing
- `unhealthy` - Critical checks failing

**Use Cases:**
- Load balancer health checks
- Monitoring service (UptimeRobot, Pingdom)
- Deploy verification
- Status page

---

**Document Status:** ✅ Complete  
**Last Updated:** December 2024  
**Next Document:** [Dev & Test Setup](./dev-and-test-setup.md)

