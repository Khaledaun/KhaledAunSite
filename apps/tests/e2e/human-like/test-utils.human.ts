/**
 * Human-Like Test Utilities
 * Simulates realistic human behavior in E2E tests
 */

import { Page, expect } from '@playwright/test';
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
  selector: string,
  text: string,
  options: { mistakes?: boolean; pauseAfter?: boolean } = {}
): Promise<void> {
  const { mistakes = true, pauseAfter = true } = options;

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
}

/**
 * Simulate human click with hesitation
 */
export async function humanClick(
  page: Page,
  selector: string,
  options: { doubleCheck?: boolean } = {}
): Promise<void> {
  const { doubleCheck = false } = options;

  // Hover first (mouse movement)
  await page.hover(selector, { timeout: 10000 });
  await page.waitForTimeout(randomClickDelay());

  // Occasional double-check (20% chance)
  if (doubleCheck && Math.random() < 0.2) {
    await page.waitForTimeout(randomReadingPause()); // Re-read before clicking
  }

  await page.click(selector, { timeout: 10000 });
  await page.waitForTimeout(randomShortPause()); // Wait for visual feedback
}

/**
 * Simulate human scrolling to element
 */
export async function humanScrollTo(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded({ timeout: 10000 });
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
  await page.goto('/auth/login');
  await page.waitForTimeout(randomShortPause()); // Load and scan page

  // Fill email
  await humanType(page, '[name="email"]', email);
  
  // Fill password (faster, no mistakes)
  await humanType(page, '[name="password"]', password, { mistakes: false });
  
  // Hesitate before login
  await page.waitForTimeout(randomClickDelay());
  
  // Click login
  await humanClick(page, 'button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL('**/command-center', { timeout: 10000 });
  await page.waitForTimeout(randomReadingPause()); // Read dashboard
}

/**
 * Setup realistic test data
 */
export async function setupHumanTestData(prisma: any): Promise<{
  users: any[];
  content: any[];
  topics: any[];
  subscribers: any[];
  leads: any[];
}> {
  // Clean existing test data
  await prisma.$transaction([
    prisma.emailEvent.deleteMany(),
    prisma.emailCampaign.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.crmLead.deleteMany(),
    prisma.publishJob.deleteMany(),
    prisma.contentLibrary.deleteMany(),
    prisma.topic.deleteMany(),
    prisma.mediaLibrary.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create test users
  const khaled = await prisma.user.create({
    data: {
      id: 'user-khaled-001',
      email: 'khaled@localhost.test',
      name: 'Khaled Aun',
    },
  });
  await prisma.userRole.create({ data: { userId: khaled.id, role: 'OWNER' } });

  const layla = await prisma.user.create({
    data: {
      id: 'user-layla-002',
      email: 'layla@localhost.test',
      name: 'Layla Hassan',
    },
  });
  await prisma.userRole.create({ data: { userId: layla.id, role: 'EDITOR' } });

  const ahmed = await prisma.user.create({
    data: {
      id: 'user-ahmed-003',
      email: 'ahmed@localhost.test',
      name: 'Ahmed Mostafa',
    },
  });
  await prisma.userRole.create({ data: { userId: ahmed.id, role: 'AUTHOR' } });

  const sara = await prisma.user.create({
    data: {
      id: 'user-sara-004',
      email: 'sara@localhost.test',
      name: 'Sara Williams',
    },
  });
  await prisma.userRole.create({ data: { userId: sara.id, role: 'REVIEWER' } });

  // Create topics
  const topics = await Promise.all([
    prisma.topic.create({
      data: {
        title: 'AI-Driven Digital Transformation',
        description: 'How AI is reshaping business operations',
        status: 'ready',
        priority: 9,
        sourceUrl: 'https://example.com/ai-transformation',
      },
    }),
    prisma.topic.create({
      data: {
        title: 'LinkedIn SEO Best Practices',
        description: 'Optimize your LinkedIn profile for search',
        status: 'researching',
        priority: 7,
      },
    }),
    prisma.topic.create({
      data: {
        title: 'Content Marketing Trends 2025',
        description: 'Emerging trends in content marketing',
        status: 'ready',
        priority: 8,
      },
    }),
  ]);

  // Create content (drafts and published)
  const content = await Promise.all([
    prisma.contentLibrary.create({
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
    }),
    prisma.contentLibrary.create({
      data: {
        title: '5 Tips for Effective LinkedIn Posts',
        content: '<p>1. Start with a hook...</p>',
        type: 'linkedin_post',
        status: 'review',
        authorId: ahmed.id,
        keywords: ['linkedin', 'social media', 'marketing'],
        seoScore: 78,
        wordCount: 350,
      },
    }),
    prisma.contentLibrary.create({
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
    }),
  ]);

  // Create subscribers
  const subscribers = await Promise.all([
    prisma.newsletterSubscriber.create({
      data: {
        email: 'fatima@example.com',
        firstName: 'Fatima',
        lastName: 'Al-Said',
        status: 'pending',
        source: 'website_footer',
        confirmationToken: faker.string.uuid(),
        confirmationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }),
    prisma.newsletterSubscriber.create({
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
    }),
  ]);

  // Create CRM leads
  const leads = await Promise.all([
    prisma.crmLead.create({
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
    }),
  ]);

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

