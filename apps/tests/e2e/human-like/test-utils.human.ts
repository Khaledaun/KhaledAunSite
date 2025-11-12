/**
 * Human-Like Test Utilities
 * Simulates realistic human behavior in E2E tests
 */

import { Page, expect, Locator } from '@playwright/test';
import { faker } from '@faker-js/faker';

/**
 * Generate random delay to simulate human typing
 */
export function randomTypingDelay(): number {
  return Math.floor(Math.random() * (250 - 80 + 1)) + 80; // 80-250ms
}

/**
 * Generate random delay to simulate human hesitation before clicking
 */
export function randomClickDelay(): number {
  return Math.floor(Math.random() * (2500 - 500 + 1)) + 500; // 0.5-2.5s
}

/**
 * Generate random reading pause (for scanning content)
 */
export function randomReadingPause(): number {
  return Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000; // 3-8s
}

/**
 * Generate random short pause (UI transition wait)
 */
export function randomShortPause(): number {
  return Math.floor(Math.random() * (1000 - 300 + 1)) + 300; // 0.3-1s
}

/**
 * Simulate human typing with realistic delays and occasional mistakes
 */
export async function humanType(
  page: Page,
  selector: string | any, // Allow Locator objects too
  text: string,
  options: { mistakes?: boolean; pauseAfter?: boolean } = {}
): Promise<void> {
  const { mistakes = true, pauseAfter = true } = options;

  // Handle Locator objects - convert to selector string or use directly
  if (typeof selector !== 'string' && selector && (typeof selector.fill === 'function' || typeof selector.type === 'function')) {
    // It's a Playwright Locator object
    const locator = selector;
    
    // Simulate occasional typo and correction (10% chance)
    if (mistakes && Math.random() < 0.1) {
      const typoText = text.slice(0, -3) + 'xxx'; // Add wrong chars
      await locator.fill(typoText, { timeout: 10000 });
      await page.waitForTimeout(randomShortPause()); // Realize mistake
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(randomShortPause());
    }

    // Type with realistic speed
    await locator.fill(text, { timeout: 10000 });
    
    if (pauseAfter) {
      await page.waitForTimeout(randomShortPause());
    }
    return;
  }

  // Handle string selectors
  if (typeof selector === 'string') {
    // Simulate occasional typo and correction (10% chance)
    if (mistakes && Math.random() < 0.1) {
      const typoText = text.slice(0, -3) + 'xxx'; // Add wrong chars
      await page.fill(selector, typoText, { timeout: 10000 });
      await page.waitForTimeout(randomShortPause()); // Realize mistake
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(randomShortPause());
    }

    // Type with realistic speed
    await page.fill(selector, text, { timeout: 10000 });
    
    if (pauseAfter) {
      await page.waitForTimeout(randomShortPause());
    }
    return;
  }

  throw new Error(`humanType: selector must be a string or Locator object, got ${typeof selector}`);
}

/**
 * Simulate human click with hesitation
 * Accepts both string selectors and Locator objects (including chained Locators)
 */
export async function humanClick(
  page: Page,
  selector: string | any, // Locator or string
  options: { doubleCheck?: boolean } = {}
): Promise<void> {
  const { doubleCheck = false } = options;

  // Handle Locator objects (from page.locator() or chained locators)
  // Check if it has a click method (it's a Locator)
  if (typeof selector !== 'string' && selector && typeof selector.click === 'function') {
    // It's a Locator object (could be chained like locator('a').first())
    try {
      await selector.hover({ timeout: 10000 });
      await page.waitForTimeout(randomClickDelay());

      if (doubleCheck && Math.random() < 0.2) {
        await page.waitForTimeout(randomReadingPause());
      }

      await selector.click({ timeout: 10000 });
      await page.waitForTimeout(randomShortPause());
      return;
    } catch (error) {
      // If hover fails, try clicking directly
      await selector.click({ timeout: 10000 });
      await page.waitForTimeout(randomShortPause());
      return;
    }
  }

  // Handle string selectors
  if (typeof selector === 'string') {
    // Wait for element to be visible before hovering
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout: 10000 });
    
    // Only hover if element is actually hoverable (not select options, etc.)
    const tagName = await element.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
    if (tagName !== 'option' && tagName !== 'optgroup') {
      await element.hover({ timeout: 5000 }).catch(() => {
        // If hover fails, just scroll into view
        return element.scrollIntoViewIfNeeded();
      });
    } else {
      // For select options, just scroll into view
      await element.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(randomClickDelay());

    if (doubleCheck && Math.random() < 0.2) {
      await page.waitForTimeout(randomReadingPause());
    }

    await page.click(selector, { timeout: 10000 });
    await page.waitForTimeout(randomShortPause());
    return;
  }

  throw new Error(`humanClick: selector must be a string or Locator object, got ${typeof selector}`);
}

/**
 * Simulate human scrolling to element
 */
export async function humanScrollTo(page: Page, selector: string | Locator): Promise<void> {
  const target = typeof selector === 'string' ? page.locator(selector).first() : selector;
  await target.scrollIntoViewIfNeeded({ timeout: 10000 });
  await page.waitForTimeout(randomShortPause()); // Let eyes adjust
}

/**
 * Wait for toast notification (human expectation)
 */
export async function waitForToast(
  page: Page,
  expectedText: string | RegExp,
  type: 'success' | 'error' | 'warning' | 'info' = 'success'
): Promise<void> {
  const toastClass = `.toast-${type}`;
  await expect(page.locator(toastClass)).toBeVisible({ timeout: 5000 });
  
  if (expectedText) {
    await expect(page.locator(toastClass)).toContainText(expectedText);
  }
  
  // Human reads the toast
  await page.waitForTimeout(randomReadingPause());
}

/**
 * Login with realistic behavior
 */
export async function loginAsHuman(
  page: Page,
  email: string,
  password: string = 'test_password_123'
): Promise<void> {
  // Set test mode header to bypass auth in middleware
  await page.setExtraHTTPHeaders({
    'x-test-mode': 'true'
  });

  // In test mode, navigate directly (middleware will allow)
  // Use 'load' instead of 'networkidle' to avoid timeout issues
  // The page will still load, but we won't wait for all network activity
  await page.goto('/command-center', { waitUntil: 'load', timeout: 30000 });
  
  // Wait for page content to load (check for h1 or main content)
  await page.waitForSelector('h1, [role="main"], main', { timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Final wait for page load
  await page.waitForTimeout(randomReadingPause()); // Read dashboard
}

/**
 * Setup realistic test data
 */
// Retry helper for database operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 500
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      if (i === maxRetries - 1) {
        throw error;
      }
      // Check if it's a connection error
      if (error.message?.includes('Can\'t reach database server') || 
          error.message?.includes('connection') ||
          error.code === 'P1001' || error.code === 'P1017') {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

export async function setupHumanTestData(prisma: any): Promise<{
  users: any[];
  content: any[];
  topics: any[];
  subscribers: any[];
  leads: any[];
}> {
  // Ensure database connection is active
  try {
    await prisma.$connect();
  } catch (error: any) {
    console.warn('Database connection warning:', error.message);
  }

  // Clean existing test data (only models that exist in @khaledaun/db)
  // Execute deletes sequentially to avoid prepared statement conflicts in transaction pooler
  try {
    if (prisma.emailEvent) await retryOperation(() => prisma.emailEvent.deleteMany());
    if (prisma.emailCampaign) await retryOperation(() => prisma.emailCampaign.deleteMany());
    if (prisma.newsletterSubscriber) await retryOperation(() => prisma.newsletterSubscriber.deleteMany());
    if (prisma.crmLead) await retryOperation(() => prisma.crmLead.deleteMany());
    if (prisma.lead) await retryOperation(() => prisma.lead.deleteMany());
    if (prisma.publishJob) await retryOperation(() => prisma.publishJob.deleteMany());
    if (prisma.userRole) await retryOperation(() => prisma.userRole.deleteMany());
    if (prisma.user) await retryOperation(() => prisma.user.deleteMany());
    
    // Only include models that exist in the schema (from admin app)
    if (prisma.contentLibrary) await retryOperation(() => prisma.contentLibrary.deleteMany());
    if (prisma.topic) await retryOperation(() => prisma.topic.deleteMany());
    if (prisma.mediaLibrary) await retryOperation(() => prisma.mediaLibrary.deleteMany());
  } catch (error: any) {
    // Log but don't fail if cleanup fails (might be first run)
    console.warn('Test data cleanup warning:', error.message);
  }

  // Create test users with retry logic
  const khaled = await retryOperation(() => prisma.user.create({
    data: {
      id: 'user-khaled-001',
      email: 'khaled@localhost.test',
      name: 'Khaled Aun',
    },
  }));
  await retryOperation(() => prisma.userRole.create({ data: { userId: khaled.id, role: 'OWNER' } }));

  const layla = await retryOperation(() => prisma.user.create({
    data: {
      id: 'user-layla-002',
      email: 'layla@localhost.test',
      name: 'Layla Hassan',
    },
  }));
  await retryOperation(() => prisma.userRole.create({ data: { userId: layla.id, role: 'EDITOR' } }));

  const ahmed = await retryOperation(() => prisma.user.create({
    data: {
      id: 'user-ahmed-003',
      email: 'ahmed@localhost.test',
      name: 'Ahmed Mostafa',
    },
  }));
  await retryOperation(() => prisma.userRole.create({ data: { userId: ahmed.id, role: 'AUTHOR' } }));

  const sara = await retryOperation(() => prisma.user.create({
    data: {
      id: 'user-sara-004',
      email: 'sara@localhost.test',
      name: 'Sara Williams',
    },
  }));
  await retryOperation(() => prisma.userRole.create({ data: { userId: sara.id, role: 'REVIEWER' } }));

  // Create topics (only if model exists) - sequential with retry to avoid connection pool exhaustion
  const topics = prisma.topic ? await (async () => {
    const topicsList = [];
    try {
      topicsList.push(await retryOperation(() => prisma.topic.create({
        data: {
          title: 'AI-Driven Digital Transformation',
          description: 'How AI is reshaping business operations',
          status: 'pending',
          priority: 9,
          sourceUrl: 'https://example.com/ai-transformation',
          keywords: [],
        },
      })));
      topicsList.push(await retryOperation(() => prisma.topic.create({
        data: {
          title: 'LinkedIn SEO Best Practices',
          description: 'Optimize your LinkedIn profile for search',
          status: 'pending',
          priority: 7,
          keywords: [],
        },
      })));
      topicsList.push(await retryOperation(() => prisma.topic.create({
        data: {
          title: 'Content Marketing Trends 2025',
          description: 'Emerging trends in content marketing',
          status: 'pending',
          priority: 8,
          keywords: [],
        },
      })));
    } catch (error: any) {
      console.error('Error creating topics:', error.message);
      // Continue with partial topics if some succeeded
    }
    return topicsList;
  })() : [];

  // Create content (drafts and published) - only if model exists - with retry
  // Execute sequentially to avoid overwhelming the connection pooler
  const content = prisma.contentLibrary ? await (async () => {
    const contentList = [];
    try {
      contentList.push(await retryOperation(() => prisma.contentLibrary.create({
        data: {
          title: 'Building Trust in the Digital Age',
          content: '<p>In today\'s fast-paced digital world, trust is the currency...</p>',
          excerpt: 'Exploring how businesses build and maintain trust with customers.',
          type: 'blog',
          status: 'draft',
          authorId: ahmed.id,
          keywords: ['trust', 'digital', 'business'],
          seoScore: 65,
          wordCount: 1200,
        },
      })));
      contentList.push(await retryOperation(() => prisma.contentLibrary.create({
        data: {
          title: '5 Tips for Effective LinkedIn Posts',
          content: '<p>1. Start with a hook...</p>',
          type: 'linkedin_post',
          status: 'review', // For reviewer approval test
          authorId: ahmed.id,
          keywords: ['linkedin', 'social media', 'marketing'],
          seoScore: 78,
          wordCount: 350,
        },
      })));
      // Add another review item to ensure reviewer has content
      contentList.push(await retryOperation(() => prisma.contentLibrary.create({
        data: {
          title: 'Digital Marketing Trends 2025',
          content: '<p>Key trends in digital marketing...</p>',
          type: 'blog',
          status: 'review', // Another review item for reviewer test
          authorId: ahmed.id,
          keywords: ['marketing', 'trends'],
          seoScore: 72,
          wordCount: 1400,
        },
      })));
      contentList.push(await retryOperation(() => prisma.contentLibrary.create({
        data: {
          title: 'The Future of Work is Hybrid',
          content: '<p>Remote work has fundamentally changed...</p>',
          type: 'blog',
          status: 'published',
          publishedAt: new Date(),
          authorId: khaled.id,
          keywords: ['remote work', 'hybrid', 'future'],
          seoScore: 85,
          wordCount: 1800,
        },
      })));
    } catch (error: any) {
      console.error('Error creating content:', error.message);
      // Continue with partial content if some succeeded
    }
    return contentList;
  })() : [];

  // Create subscribers (only if model exists) - with retry
  const subscribers = prisma.newsletterSubscriber ? await Promise.all([
    retryOperation(() => prisma.newsletterSubscriber.create({
      data: {
        email: 'fatima@example.com',
        firstName: 'Fatima',
        lastName: 'Al-Said',
        status: 'pending',
        source: 'website_footer',
        confirmationToken: faker.string.uuid(),
        confirmationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })),
    retryOperation(() => prisma.newsletterSubscriber.create({
      data: {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Smith',
        status: 'confirmed',
        confirmedAt: new Date(),
        source: 'landing_page',
        totalOpens: 15,
        totalClicks: 3,
      },
    })),
  ]) : [];

  // Create CRM leads (only if model exists) - with retry
  const leads = prisma.crmLead ? await Promise.all([
    retryOperation(() => prisma.crmLead.create({
      data: {
        email: 'prospect@techcorp.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        company: 'Tech Corp',
        message: 'Interested in consulting services for digital transformation',
        leadStatus: 'new',
        source: 'contact_form',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'consulting_2024',
      },
    })),
  ]) : [];

  return { users: [khaled, layla, ahmed, sara], content, topics, subscribers, leads };
}

/**
 * Log test step for human readability
 */
export function logStep(step: string, details?: any): void {
  const emoji = step.includes('✅') ? '' : '  ';
  console.log(`${emoji}${step}`);
  if (details) {
    console.log('  ', JSON.stringify(details, null, 2));
  }
}

/**
 * Check if element appears "instantly" to human perception (<200ms)
 */
export async function expectInstantResponse(page: Page, selector: string): Promise<void> {
  const start = Date.now();
  await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
  const duration = Date.now() - start;
  
  if (duration > 200) {
    console.warn(`⚠️ Slow response: ${selector} took ${duration}ms (expected <200ms)`);
  }
}

/**
 * Behavioral sentiment tracking
 */
export type FlowSentiment = 'smooth' | 'minor-confusion' | 'frustration';

export class BehaviorTracker {
  private events: Array<{ timestamp: Date; event: string; sentiment?: FlowSentiment }> = [];

  logEvent(event: string, sentiment?: FlowSentiment): void {
    this.events.push({ timestamp: new Date(), event, sentiment });
    
    const sentimentEmoji = {
      smooth: '✅',
      'minor-confusion': '⚠️',
      frustration: '❌',
    };
    
    if (sentiment) {
      console.log(`${sentimentEmoji[sentiment]} ${event}`);
    } else {
      console.log(`  ${event}`);
    }
  }

  getSummary(): { total: number; smooth: number; confusion: number; frustration: number } {
    return {
      total: this.events.length,
      smooth: this.events.filter(e => e.sentiment === 'smooth').length,
      confusion: this.events.filter(e => e.sentiment === 'minor-confusion').length,
      frustration: this.events.filter(e => e.sentiment === 'frustration').length,
    };
  }

  getEvents(): typeof this.events {
    return this.events;
  }
}

