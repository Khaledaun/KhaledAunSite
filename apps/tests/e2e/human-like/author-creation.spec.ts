/**
 * Human-Like Test: Author (Ahmed) Content Creation with SEO
 * 
 * Persona: Ahmed Mostafa (AUTHOR)
 * Goals: Draft content, use AI tools, submit for review, improve SEO
 * Device: Laptop, Firefox
 * Duration: ~15 minutes
 * Complexity: Medium
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

test.describe('👤 Ahmed (Author) - Content Creation with AI', () => {
  let tracker: BehaviorTracker;

  test.beforeEach(async () => {
    tracker = new BehaviorTracker();
    await setupHumanTestData(prisma);
  });

  test('Ahmed uses AI to research and create content for review', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes
    
    logStep('👤 Ahmed starts content creation');

    await loginAsHuman(page, 'ahmed@localhost.test');
    tracker.logEvent('Login successful', 'smooth');

    // ========== RESEARCH TOPIC ==========
    logStep('📚 Step 1: Research topic from queue');
    await humanClick(page, 'a[href="/topics"]');
    await page.waitForTimeout(randomReadingPause());
    
    // Select a ready topic
    const topicRow = page.locator('tr:has-text("LinkedIn SEO Best Practices")');
    if (await topicRow.isVisible({ timeout: 5000 })) {
      await humanClick(page, topicRow.locator('a').first());
      tracker.logEvent('Selected topic for content creation');
      
      // Read topic details
      await page.waitForTimeout(randomReadingPause());
      logStep('  👀 Reading topic description...');
    }

    // ========== AI OUTLINE GENERATION ==========
    logStep('🤖 Step 2: Generate AI outline');
    await humanClick(page, 'button:has-text("Generate Outline")');
    tracker.logEvent('Requested AI outline');
    
    // Wait for AI (simulate human doing other things while waiting)
    await page.waitForTimeout(10000);
    logStep('  ⏳ Waiting for AI... (checking social media)');
    await page.waitForTimeout(8000);
    
    // Review outline
    const outlineModal = page.locator('[role="dialog"]');
    if (await outlineModal.isVisible({ timeout: 30000 })) {
      await page.waitForTimeout(randomReadingPause());
      logStep('  👀 Reviewing AI-generated outline');
      tracker.logEvent('AI outline generated', 'smooth');
      
      await humanClick(page, outlineModal.locator('button:has-text("Use This Outline")'));
    }

    // ========== CREATE CONTENT ==========
    logStep('✍️ Step 3: Write content');
    await humanClick(page, 'a:has-text("Create Content")');
    await humanType(page, '[name="title"]', 'LinkedIn SEO: 10 Proven Strategies to Boost Visibility', { mistakes: true });
    
    // Select type
    await humanClick(page, '[name="type"]');
    await humanClick(page, 'option[value="blog"]');
    tracker.logEvent('Started content creation');

    // Write content (simulated)
    const content = `
      <h2>Why LinkedIn SEO Matters</h2>
      <p>LinkedIn is the world's largest professional network...</p>
      <h2>10 Strategies for LinkedIn SEO</h2>
      <h3>1. Optimize Your Profile Headline</h3>
      <p>Your headline is one of the most important ranking factors...</p>
      <h3>2. Use Keywords Strategically</h3>
      <p>Research and include relevant keywords throughout your profile...</p>
    `.trim();

    await page.fill('[role="textbox"]', content);
    await page.waitForTimeout(120000); // 2 minutes "writing"
    tracker.logEvent('Wrote content draft', 'smooth');

    // ========== CHECK SEO SCORE ==========
    logStep('🔍 Step 4: Check SEO score');
    await humanScrollTo(page, 'text=SEO Analysis');
    await humanClick(page, 'text=SEO Analysis');
    await page.waitForTimeout(randomShortPause());
    
    const seoScore = page.locator('[data-testid="seo-score"]');
    if (await seoScore.isVisible({ timeout: 5000 })) {
      const score = parseInt(await seoScore.textContent() || '0');
      logStep(`  📊 Initial SEO score: ${score}`);
      
      if (score < 70) {
        tracker.logEvent(`SEO score too low (${score}), improving...`, 'minor-confusion');
        
        // Add keywords to improve score
        await humanType(page, '[name="keywords"]', 'LinkedIn, SEO, professional network, optimization');
        await humanType(page, '[name="seoTitle"]', 'LinkedIn SEO Guide: 10 Strategies | Expert Tips');
        
        // Re-check score
        await page.waitForTimeout(2000);
        const newScore = parseInt(await seoScore.textContent() || '0');
        logStep(`  📊 Improved SEO score: ${newScore}`);
        tracker.logEvent(`SEO score improved to ${newScore}`, 'smooth');
      }
    }

    // ========== SAVE AND SUBMIT ==========
    logStep('💾 Step 5: Save and submit for review');
    await humanScrollTo(page, 'button:has-text("Save Draft")');
    await humanClick(page, 'button:has-text("Save Draft")');
    await waitForToast(page, /saved/i, 'success');
    
    // Submit for review (authors cannot publish directly)
    await humanClick(page, 'button:has-text("Submit for Review")');
    await waitForToast(page, /submitted/i, 'success');
    tracker.logEvent('Submitted content for review', 'smooth');

    // Verify status changed
    const statusBadge = page.locator('.status-badge');
    await expect(statusBadge).toHaveText(/review/i);
    logStep('  ✓ Status changed to "Review"');

    // ========== TEST SUMMARY ==========
    logStep('\n📊 Test Summary:');
    const summary = tracker.getSummary();
    logStep(`  ✅ Smooth: ${summary.smooth}`);
    expect(summary.smooth).toBeGreaterThan(4);
  });
});

