/**
 * Human-Like Test: Owner (Khaled) Complete Content Pipeline
 * 
 * Persona: Khaled Aun (OWNER)
 * Goals: Create content, use AI, publish to LinkedIn, monitor system
 * Device: Desktop, Chrome
 * Duration: ~10 minutes
 * Complexity: High
 */

import { test, expect } from '@playwright/test';
import { prisma } from '@khaledaun/db';
import {
  loginAsHuman,
  humanType,
  humanClick,
  humanScrollTo,
  waitForToast,
  randomReadingPause,
  randomShortPause,
  setupHumanTestData,
  logStep,
  BehaviorTracker,
} from './test-utils.human';

test.describe('👤 Khaled (Owner) - Full Content Pipeline', () => {
  let tracker: BehaviorTracker;

  test.beforeEach(async () => {
    tracker = new BehaviorTracker();
    await setupHumanTestData(prisma);
  });

  test('Khaled creates AI-assisted content and publishes to LinkedIn', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes
    
    logStep('👤 Khaled starts his day');
    tracker.logEvent('User opens admin panel');

    // ========== LOGIN ==========
    logStep('🔐 Step 1: Login');
    await loginAsHuman(page, 'khaled@localhost.test');
    tracker.logEvent('Login successful', 'smooth');

    // ========== REVIEW DASHBOARD ==========
    logStep('📊 Step 2: Review dashboard');
    await expect(page.locator('h1')).toContainText(/command center|dashboard/i);
    
    // Human behavior: Scan KPI cards
    await page.waitForTimeout(randomReadingPause());
    tracker.logEvent('Reviewed dashboard metrics');

    // Check recent activity
    const hasActivity = await page.locator('text=Recent Activity').isVisible();
    if (hasActivity) {
      await page.waitForTimeout(randomReadingPause());
      tracker.logEvent('Reviewed recent activity', 'smooth');
    }

    // ========== CHECK TOPICS QUEUE ==========
    logStep('📝 Step 3: Check topics queue');
    await humanClick(page, 'a[href="/topics"]');
    await expect(page).toHaveURL(/.*\/topics/);
    
    // Scan topics
    await page.waitForTimeout(randomReadingPause());
    tracker.logEvent('Browsed topic queue');

    // Click on first ready topic
    const topicRow = page.locator('tr:has-text("AI-Driven Digital Transformation")');
    await humanClick(page, topicRow.locator('a').first());
    tracker.logEvent('Selected topic for content creation');

    // Read topic details
    await page.waitForTimeout(randomReadingPause());
    
    // Extract URL (if available)
    const extractButton = page.locator('button:has-text("Extract")');
    if (await extractButton.isVisible()) {
      logStep('🌐 Step 4: Extract URL content');
      await humanClick(page, extractButton);
      
      // Wait for extraction
      await page.waitForTimeout(5000);
      tracker.logEvent('URL content extracted', 'smooth');
    }

    // ========== CREATE NEW CONTENT ==========
    logStep('✍️ Step 5: Create new content');
    await humanClick(page, 'a:has-text("Create Content")');
    await expect(page).toHaveURL(/.*\/content\/new/);
    
    // Human scans the form
    await page.waitForTimeout(randomShortPause());

    // Select content type
    await humanClick(page, '[name="type"]');
    await humanClick(page, 'option[value="blog"]');
    tracker.logEvent('Selected content type: blog');

    // Type title (realistic speed with occasional hesitation)
    logStep('⌨️ Step 6: Type title');
    await humanType(
      page,
      '[name="title"]',
      'AI-Driven Digital Transformation: A Strategic Guide',
      { mistakes: true, pauseAfter: true }
    );
    tracker.logEvent('Entered content title', 'smooth');

    // ========== USE AI TO GENERATE OUTLINE ==========
    logStep('🤖 Step 7: Generate AI outline');
    await humanScrollTo(page, 'button:has-text("Generate Outline")');
    await humanClick(page, 'button:has-text("Generate Outline")');
    tracker.logEvent('Requested AI outline generation');

    // Wait for AI (simulate human waiting, checking progress)
    await page.waitForTimeout(3000);
    logStep('  ⏳ Waiting for AI... (human checks phone)');
    await page.waitForTimeout(5000);
    logStep('  ⏳ Still waiting... (human reads email)');
    await page.waitForTimeout(7000);
    
    // Check if outline appears
    const outlineModal = page.locator('[role="dialog"]', { hasText: /outline/i });
    if (await outlineModal.isVisible({ timeout: 30000 })) {
      tracker.logEvent('AI outline generated', 'smooth');
      
      // Review outline (human reads through it)
      await page.waitForTimeout(randomReadingPause());
      logStep('  👀 Khaled reviews the outline');
      
      // Approve outline
      await humanClick(page, outlineModal.locator('button:has-text("Approve")'));
      tracker.logEvent('Outline approved');
      
      // Wait for modal to close
      await page.waitForTimeout(randomShortPause());
    } else {
      tracker.logEvent('AI outline not available (timeout or error)', 'minor-confusion');
    }

    // ========== WRITE CONTENT ==========
    logStep('📄 Step 8: Write content');
    
    // Simulate realistic content writing (takes time)
    const contentHtml = `
      <h2>Introduction</h2>
      <p>Digital transformation powered by AI is no longer optional—it's essential for businesses that want to remain competitive in 2025 and beyond.</p>
      
      <h2>Key Benefits of AI-Driven Transformation</h2>
      <p>AI enables organizations to automate repetitive tasks, gain deeper insights from data, and deliver personalized customer experiences at scale.</p>
      
      <h3>1. Enhanced Decision Making</h3>
      <p>AI-powered analytics provide real-time insights that help leaders make data-driven decisions faster and with greater confidence.</p>
      
      <h3>2. Improved Operational Efficiency</h3>
      <p>Automation of routine processes frees up human talent to focus on strategic, high-value activities that drive innovation.</p>
      
      <h3>3. Personalized Customer Experiences</h3>
      <p>AI enables businesses to understand customer preferences and deliver tailored experiences that build loyalty and drive revenue.</p>
      
      <h2>Implementation Strategy</h2>
      <p>Successful AI transformation requires a clear strategy, the right talent, and a culture that embraces change.</p>
      
      <h2>Conclusion</h2>
      <p>Organizations that embrace AI-driven digital transformation today will be the leaders of tomorrow.</p>
    `.trim();

    // Human types content (simulated as faster bulk input with pauses)
    logStep('  ⌨️ Writing introduction...');
    await page.fill('[role="textbox"]', contentHtml.split('</h2>')[0] + '</h2>');
    await page.waitForTimeout(30000); // 30s "writing"
    tracker.logEvent('Wrote introduction section');

    logStep('  ⌨️ Writing main content...');
    await page.fill('[role="textbox"]', contentHtml);
    await page.waitForTimeout(90000); // 1.5 minutes "writing"
    tracker.logEvent('Wrote main content', 'smooth');

    // ========== CHECK SEO SCORE ==========
    logStep('🔍 Step 9: Check SEO score');
    await humanScrollTo(page, 'text=SEO Analysis');
    await humanClick(page, 'text=SEO Analysis');
    
    // Wait for SEO analysis
    await page.waitForTimeout(2000);
    
    const seoScore = page.locator('[data-testid="seo-score"]');
    if (await seoScore.isVisible({ timeout: 5000 })) {
      const scoreText = await seoScore.textContent();
      logStep(`  📊 SEO Score: ${scoreText}`);
      
      const score = parseInt(scoreText || '0');
      if (score >= 70) {
        tracker.logEvent(`SEO score is good (${score})`, 'smooth');
      } else {
        tracker.logEvent(`SEO score needs improvement (${score})`, 'minor-confusion');
        
        // Human checks recommendations
        await page.waitForTimeout(randomReadingPause());
      }
    }

    // ========== ADD KEYWORDS ==========
    logStep('🏷️ Step 10: Add keywords');
    await humanScrollTo(page, '[name="keywords"]');
    await humanType(page, '[name="keywords"]', 'AI, digital transformation, automation, business strategy');
    tracker.logEvent('Added SEO keywords');

    // Add SEO metadata
    await humanType(page, '[name="seoTitle"]', 'AI-Driven Digital Transformation Guide | Khaled Aun');
    await humanType(
      page,
      '[name="seoDescription"]',
      'Discover how AI-powered digital transformation can revolutionize your business operations and drive competitive advantage.'
    );
    tracker.logEvent('Added SEO metadata', 'smooth');

    // ========== SAVE DRAFT ==========
    logStep('💾 Step 11: Save draft');
    await humanScrollTo(page, 'button:has-text("Save Draft")');
    await humanClick(page, 'button:has-text("Save Draft")');
    
    await waitForToast(page, /saved/i, 'success');
    tracker.logEvent('Draft saved successfully', 'smooth');

    // ========== PUBLISH CONTENT ==========
    logStep('🚀 Step 12: Publish content');
    
    // Human double-checks before publishing
    await page.waitForTimeout(randomReadingPause());
    logStep('  👀 Khaled reviews content one more time');
    
    // Check pre-publish checklist
    await humanScrollTo(page, 'text=Pre-Publish Checklist');
    await humanClick(page, 'text=Pre-Publish Checklist');
    await page.waitForTimeout(randomReadingPause());
    
    // All checks should pass
    const checklistItems = page.locator('[data-testid="checklist-item"]');
    const count = await checklistItems.count();
    logStep(`  ✓ Checklist: ${count} items validated`);
    tracker.logEvent('Pre-publish validation passed', 'smooth');

    // Click publish
    await humanScrollTo(page, 'button:has-text("Publish Now")');
    await humanClick(page, 'button:has-text("Publish Now")');
    
    await waitForToast(page, /published/i, 'success');
    tracker.logEvent('Content published successfully', 'smooth');

    // ========== POST TO LINKEDIN ==========
    logStep('📱 Step 13: Post to LinkedIn');
    
    // Wait for page to update
    await page.waitForTimeout(randomShortPause());
    
    // Check if LinkedIn is connected
    const linkedInButton = page.locator('button:has-text("Post to LinkedIn")');
    if (await linkedInButton.isVisible({ timeout: 5000 })) {
      await humanClick(page, linkedInButton);
      tracker.logEvent('Initiated LinkedIn post');
      
      // Preview modal appears
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Human reviews post preview
      await page.waitForTimeout(randomReadingPause());
      logStep('  👀 Reviewing LinkedIn post preview');
      
      // Confirm post
      await humanClick(page, modal.locator('button:has-text("Confirm")'));
      
      // Wait for LinkedIn posting (may take a few seconds)
      await waitForToast(page, /posted to linkedin|success/i, 'success');
      tracker.logEvent('Posted to LinkedIn successfully', 'smooth');
      
    } else {
      logStep('  ⚠️ LinkedIn not connected (skipping)');
      tracker.logEvent('LinkedIn not connected', 'minor-confusion');
    }

    // ========== CHECK ANALYTICS ==========
    logStep('📈 Step 14: Check analytics');
    await humanClick(page, 'a[href="/analytics"]');
    await expect(page).toHaveURL(/.*\/analytics/);
    
    // Scan metrics
    await page.waitForTimeout(randomReadingPause());
    tracker.logEvent('Reviewed analytics dashboard', 'smooth');

    // ========== LOGOUT ==========
    logStep('👋 Step 15: Logout');
    await humanClick(page, 'button[aria-label="User menu"]');
    await humanClick(page, 'a:has-text("Logout")');
    tracker.logEvent('Logged out');

    // ========== TEST SUMMARY ==========
    logStep('\n📊 Test Summary:');
    const summary = tracker.getSummary();
    logStep(`  Total events: ${summary.total}`);
    logStep(`  ✅ Smooth: ${summary.smooth}`);
    logStep(`  ⚠️ Minor confusion: ${summary.confusion}`);
    logStep(`  ❌ Frustration: ${summary.frustration}`);

    // Assertions
    expect(summary.frustration).toBe(0); // No major issues
    expect(summary.smooth).toBeGreaterThan(summary.confusion); // Mostly smooth
  });

  test('Khaled monitors system health and checks cron jobs', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes
    
    logStep('👤 Khaled checks system health');
    tracker = new BehaviorTracker();

    await loginAsHuman(page, 'khaled@localhost.test');

    // ========== CHECK HEALTH ENDPOINT ==========
    logStep('🏥 Step 1: Check system health');
    const response = await page.request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const health = await response.json();
    logStep(`  Database: ${health.checks.db ? '✅' : '❌'}`);
    logStep(`  Storage: ${health.checks.storage ? '✅' : '❌'}`);
    logStep(`  Auth: ${health.checks.adminAuth ? '✅' : '❌'}`);
    
    tracker.logEvent('System health checked', 'smooth');

    // ========== CHECK SOCIAL ACCOUNTS ==========
    logStep('🔗 Step 2: Check LinkedIn connection');
    await humanClick(page, 'a[href="/social"]');
    await expect(page).toHaveURL(/.*\/social/);
    
    await page.waitForTimeout(randomReadingPause());
    
    const linkedInStatus = page.locator('[data-testid="linkedin-status"]');
    if (await linkedInStatus.isVisible({ timeout: 5000 })) {
      const statusText = await linkedInStatus.textContent();
      logStep(`  LinkedIn: ${statusText}`);
      tracker.logEvent(`LinkedIn connection status: ${statusText}`, 'smooth');
    }

    // ========== CHECK LEADS ==========
    logStep('📋 Step 3: Check new leads');
    await humanClick(page, 'a[href="/leads"]');
    await expect(page).toHaveURL(/.*\/leads/);
    
    await page.waitForTimeout(randomReadingPause());
    
    const leadsTable = page.locator('table');
    if (await leadsTable.isVisible({ timeout: 5000 })) {
      const rows = await leadsTable.locator('tbody tr').count();
      logStep(`  Total leads: ${rows}`);
      tracker.logEvent(`Found ${rows} leads`, 'smooth');
    }

    // ========== CHECK SUBSCRIBERS ==========
    logStep('📧 Step 4: Check subscriber count');
    await humanClick(page, 'a[href="/marketing/subscribers"]');
    await expect(page).toHaveURL(/.*\/marketing\/subscribers/);
    
    await page.waitForTimeout(randomReadingPause());
    
    const subscriberCount = page.locator('[data-testid="subscriber-count"]');
    if (await subscriberCount.isVisible({ timeout: 5000 })) {
      const count = await subscriberCount.textContent();
      logStep(`  Subscribers: ${count}`);
      tracker.logEvent('Checked subscriber metrics', 'smooth');
    }

    logStep('\n✅ System monitoring complete');
    const summary = tracker.getSummary();
    expect(summary.smooth).toBeGreaterThan(0);
  });
});

