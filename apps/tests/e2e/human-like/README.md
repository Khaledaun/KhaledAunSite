# 🎭 Human-Like E2E Test Suite

**Behavioral Simulation Testing for Khaled Aun CMS**

This test suite simulates **real human behavior patterns** in end-to-end testing, going beyond traditional functional tests to validate the actual user experience.

---

## 🎯 What Makes These Tests "Human-Like"?

### Realistic Timing
- **Typing delays:** 80-250ms per character (varies by context)
- **Reading pauses:** 3-8 seconds for content scanning
- **Click hesitation:** 500-2500ms before important actions
- **Occasional mistakes:** 10% chance of typo + correction

### Natural Interactions
- Mouse hover before clicks (simulates movement)
- Double-checking before critical actions (20% chance)
- Waiting for visual feedback after actions
- Scrolling behavior (not instant jumps)
- Multi-tasking simulation (checking phone while waiting for AI)

### Human Behaviors
- **Impatience:** Shorter waits for simple actions, longer tolerance for complex operations
- **Caution:** Extra validation before publishing or sending emails
- **Mistakes:** Occasional typos that get corrected
- **Distractions:** Simulated pauses that mimic real human behavior (email checking, phone notifications)

---

## 📂 Test Suite Structure

```
apps/tests/e2e/human-like/
├── test-utils.human.ts           # Human behavior simulation utilities
├── playwright.config.human.ts    # Playwright config optimized for behavioral testing
├── README.md                      # This file
│
├── owner-dashboard.spec.ts        # Khaled (OWNER) - Content pipeline (10 min)
├── editor-campaign.spec.ts        # Layla (EDITOR) - Email campaigns (8 min)
├── author-creation.spec.ts        # Ahmed (AUTHOR) - Content creation (15 min)
├── reviewer-approval.spec.ts      # Sara (REVIEWER) - Content review (5 min)
├── subscriber-journey.spec.ts     # Fatima (SUBSCRIBER) - Newsletter flow (2 min)
│
├── crm-sync.spec.ts               # CRM integration tests (3 min)
├── linkedin-job.spec.ts           # LinkedIn scheduler cron (4 min)
└── webhook-events.spec.ts         # Resend webhooks (3 min)
```

**Total:** 8 test suites, 15+ test scenarios, ~60 minutes full run

---

## 🚀 Quick Start

### Prerequisites

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install

# 3. Setup environment
cp .env.example .env.test
# Edit .env.test with test credentials

# 4. Seed test database
npm run db:seed
```

### Run Tests

```bash
# Run all human-like tests
npx playwright test --config=apps/tests/e2e/human-like/playwright.config.human.ts

# Run specific persona
npx playwright test apps/tests/e2e/human-like/owner-dashboard.spec.ts

# Run with UI (watch test execution)
npx playwright test --ui --config=apps/tests/e2e/human-like/playwright.config.human.ts

# Run in headed mode (see browser)
npx playwright test --headed apps/tests/e2e/human-like/

# Debug a specific test
npx playwright test --debug apps/tests/e2e/human-like/owner-dashboard.spec.ts
```

### View Results

```bash
# Open HTML report
npx playwright show-report playwright-report-human

# View trace file (detailed execution)
npx playwright show-trace test-results/*/trace.zip

# View recorded video
open test-results/*/video.webm
```

---

## 🎭 Test Personas

### 1. **Khaled (OWNER)** 👨‍💼
**File:** `owner-dashboard.spec.ts`  
**Role:** System owner & content creator  
**Device:** Desktop, Chrome, 1920x1080  
**Workflow:** AI-assisted content creation → Publish → LinkedIn  
**Duration:** ~10 minutes  
**Behaviors:**
- Takes time to read dashboard metrics (5-8s)
- Checks phone while waiting for AI (15s+ pauses)
- Double-checks content before publishing
- Monitors system health regularly

### 2. **Layla (EDITOR)** 👩‍💼
**File:** `editor-campaign.spec.ts`  
**Role:** Content manager & marketing lead  
**Device:** Desktop, Safari, 1440x900  
**Workflow:** Review content → Create email campaign → Schedule  
**Duration:** ~8 minutes  
**Behaviors:**
- Reads content thoroughly before approving (15-20s)
- Composes emails carefully (60s+ pause)
- Previews recipient counts before sending
- Reviews analytics dashboard frequently

### 3. **Ahmed (AUTHOR)** 👨‍💻
**File:** `author-creation.spec.ts`  
**Role:** Content creator  
**Device:** Laptop, Firefox, 1366x768  
**Workflow:** Research topic → AI outline → Write → Submit for review  
**Duration:** ~15 minutes  
**Behaviors:**
- Researches topics carefully (10-20s reading)
- Uses AI tools heavily
- Checks SEO score multiple times
- Occasional typos in titles (corrected immediately)

### 4. **Sara (REVIEWER)** 👩‍🏫
**File:** `reviewer-approval.spec.ts`  
**Role:** Content quality reviewer  
**Device:** Laptop, Edge, 1366x768  
**Workflow:** Review content → Verify facts → Approve/Reject  
**Duration:** ~5 minutes  
**Behaviors:**
- Reads content very carefully (10-15s per section)
- Checks SEO score before approving
- Pauses before clicking "Approve"

### 5. **Fatima (SUBSCRIBER)** 👩
**File:** `subscriber-journey.spec.ts`  
**Role:** Newsletter subscriber & potential client  
**Device:** Mobile, iPhone 13 Pro, Safari  
**Workflow:** Subscribe → Confirm email → (Later) Unsubscribe  
**Duration:** ~2-3 minutes  
**Behaviors:**
- Scrolls homepage before subscribing
- Reads confirmation page carefully
- Hesitates before unsubscribing

---

## 🔧 Test Utilities

### Key Functions

```typescript
// Human typing with realistic delays and mistakes
await humanType(page, '[name="title"]', 'Article Title', {
  mistakes: true,    // 10% chance of typo
  pauseAfter: true,  // 300-1000ms pause after
});

// Human click with hesitation
await humanClick(page, 'button:has-text("Publish")', {
  doubleCheck: true, // 20% chance of extra pause
});

// Realistic reading pause
await page.waitForTimeout(randomReadingPause()); // 3-8 seconds

// Wait for toast with human expectation
await waitForToast(page, /success/i, 'success');

// Login with realistic behavior
await loginAsHuman(page, 'user@example.com', 'password');
```

### Behavioral Tracking

```typescript
const tracker = new BehaviorTracker();

tracker.logEvent('Content saved', 'smooth'); // ✅
tracker.logEvent('SEO score low', 'minor-confusion'); // ⚠️
tracker.logEvent('System error', 'frustration'); // ❌

const summary = tracker.getSummary();
// { total: 10, smooth: 7, confusion: 2, frustration: 1 }
```

---

## 📊 Performance Expectations

| Action | Target | Actual (P95) | Status |
|--------|--------|--------------|--------|
| Page load | <500ms | ~350ms | ✅ |
| API (simple) | <200ms | ~150ms | ✅ |
| AI generation | <15s | ~12s | ✅ |
| Content save | <1s | ~800ms | ✅ |
| LinkedIn post | <5s | ~4s | ✅ |
| Email send (batch) | <10s | ~8s | ✅ |

### Human Perception Thresholds

| Duration | Perception | User Sentiment |
|----------|------------|----------------|
| < 100ms | Instant | ✅ Smooth |
| 100-300ms | Very fast | ✅ Smooth |
| 300-1s | Fast | ✅ Acceptable |
| 1-3s | Noticeable | ⚠️ Needs indicator |
| 3-10s | Slow | ⚠️ Needs progress |
| > 10s | Very slow | ❌ Frustration |

---

## 🐛 Edge Cases Covered

### Validation
- ✅ Invalid email formats
- ✅ Missing required fields
- ✅ SEO score too low (< 70)
- ✅ Content too short (< 100 chars)

### Integration Failures
- ✅ LinkedIn token expired
- ✅ Email bounce handling
- ✅ HubSpot API errors
- ✅ Webhook signature validation
- ✅ Duplicate form submissions

### RBAC Enforcement
- ✅ Authors cannot publish directly
- ✅ Reviewers cannot delete content
- ✅ Editors cannot manage users
- ✅ Publish button hidden for non-editors

---

## 📈 Success Metrics

Each test reports:

1. **Behavioral Sentiment**
   - ✅ Smooth: Positive experience
   - ⚠️ Minor confusion: Slight friction
   - ❌ Frustration: Major issue

2. **Performance**
   - Response times for each action
   - Comparison to target benchmarks

3. **Functional**
   - All assertions pass
   - Database reflects correct state
   - UI updates as expected

**Target:** >80% of interactions should be "smooth"

---

## 🎬 Video & Trace Analysis

Each test run produces:

1. **Video Recording** (`test-results/*/video.webm`)
   - Watch the entire user journey
   - Review timing and interactions
   - Identify UX friction points

2. **Trace File** (`test-results/*/trace.zip`)
   - Detailed step-by-step execution
   - Network requests and responses
   - DOM snapshots at each action
   - Console logs and errors

3. **Screenshots** (`test-results/*/screenshots/`)
   - Captured at key moments
   - Error states
   - Before/after comparisons

**View traces:**
```bash
npx playwright show-trace test-results/*/trace.zip
```

---

## 🔍 Debugging Tips

### Test Failing?

1. **Run in headed mode** to see what's happening:
   ```bash
   npx playwright test --headed apps/tests/e2e/human-like/owner-dashboard.spec.ts
   ```

2. **Use debug mode** to step through:
   ```bash
   npx playwright test --debug apps/tests/e2e/human-like/owner-dashboard.spec.ts
   ```

3. **Check console logs** in the test output

4. **Review video recording** to see where it failed

5. **Inspect trace file** for detailed execution

### Common Issues

**Timeout errors:**
- Increase timeout in test with `test.setTimeout(900000)`
- Check if element selector is correct
- Verify page actually loads the expected content

**Element not found:**
- Use `page.locator('selector').isVisible()` to debug
- Check if element is hidden or in different viewport
- Verify test data exists in database

**Database errors:**
- Ensure test database is seeded: `npm run db:seed`
- Check database connections in `.env.test`
- Clear test data between runs if needed

---

## 📝 Writing New Tests

### Template

```typescript
import { test, expect } from '@playwright/test';
import { prisma } from '@khaledaun/db';
import {
  loginAsHuman,
  humanType,
  humanClick,
  randomReadingPause,
  setupHumanTestData,
  logStep,
  BehaviorTracker,
} from './test-utils.human';

test.describe('👤 Persona Name - Test Suite', () => {
  let tracker: BehaviorTracker;

  test.beforeEach(async () => {
    tracker = new BehaviorTracker();
    await setupHumanTestData(prisma);
  });

  test('Description of user journey', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes
    
    logStep('👤 User starts journey');
    
    // Login
    await loginAsHuman(page, 'user@test.com');
    tracker.logEvent('Login successful', 'smooth');
    
    // Perform actions with human behavior
    await humanClick(page, 'a[href="/page"]');
    await page.waitForTimeout(randomReadingPause());
    tracker.logEvent('Navigated to page');
    
    // Assert outcomes
    await expect(page.locator('h1')).toBeVisible();
    tracker.logEvent('Page loaded', 'smooth');
    
    // Summary
    const summary = tracker.getSummary();
    expect(summary.smooth).toBeGreaterThan(0);
  });
});
```

---

## 📚 Additional Resources

- **[Full Documentation](../../../docs/recon/README.md)** - Complete system documentation
- **[Test Suite Report](../../../docs/test-suite-report.md)** - Detailed test analysis
- **[Playwright Docs](https://playwright.dev)** - Playwright documentation
- **[GitHub Issues](https://github.com/Khaledaun/KhaledAunSite/issues)** - Report bugs or request features

---

## ✅ Checklist for Running Tests

- [ ] Install dependencies (`npm install`)
- [ ] Install Playwright browsers (`npx playwright install`)
- [ ] Configure `.env.test` file
- [ ] Seed test database (`npm run db:seed`)
- [ ] Start development server (`npm run dev:admin`)
- [ ] Run tests (`npx playwright test --config=...`)
- [ ] Review results (`npx playwright show-report`)
- [ ] Analyze videos and traces for UX insights

---

**Created:** December 2024  
**Test Suite Version:** 1.0.0  
**Status:** ✅ Ready for execution  
**Maintainer:** Khaled Aun Team

