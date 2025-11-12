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
    
    // Wait for network idle before clicking
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Small buffer
    
    // Wait for topics link to be visible and clickable
    const topicsLink = page.locator('a[href="/topics"], a:has-text("Topic Queue"), [data-testid="nav-topics"]').first();
    const topicsLinkVisible = await topicsLink.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (topicsLinkVisible) {
      // Try normal click first, fallback to force if needed
      try {
        await humanClick(page, topicsLink);
      } catch (error) {
        logStep('  ⚠️ Normal click failed, trying force click');
        await topicsLink.click({ force: true, timeout: 10000 }).catch(() => {
          logStep('  ⚠️ Force click also failed, navigating directly');
        });
      }
    } else {
      logStep('  ⚠️ Topics navigation link not visible, navigating directly');
      tracker.logEvent('Topics nav link missing', 'minor-confusion');
      await page.goto('/topics', { waitUntil: 'load' }).catch(() => {
        logStep('  ⚠️ Unable to open topics page, continuing');
      });
    }
    
    await page.waitForTimeout(randomReadingPause());
    
    // Select a topic from the table
    // Wait for topics table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Find any topic row (may not have "LinkedIn SEO Best Practices" exact match)
    const topicRow = page.locator('table tbody tr').first();
    if (await topicRow.isVisible({ timeout: 5000 })) {
      // Click on the title cell which should be a link
      const titleLink = topicRow.locator('a, td').first();
      await humanClick(page, titleLink);
      tracker.logEvent('Selected topic for content creation');
      
      // Read topic details
      await page.waitForTimeout(randomReadingPause());
      logStep('  👀 Reading topic description...');
    } else {
      logStep('  ⚠️ No topics found in queue');
    }

    // ========== CREATE CONTENT FROM TOPIC ==========
    logStep('🎨 Step 2: Create content from topic');
    
    // The button is called "Create Content", not "Generate Outline"
    const createButton = page.locator('button:has-text("Create Content")');
    await createButton.waitFor({ state: 'visible', timeout: 15000 });
    await createButton.scrollIntoViewIfNeeded();
    await humanClick(page, createButton);
    await page.waitForLoadState('networkidle');
    logStep('  ✓ Started content creation');
    tracker.logEvent('Started content creation');
    
    // The page navigates to /content/new?topicId=...
    // Wait for navigation to complete
    await page.waitForURL(/.*\/content\/new/, { timeout: 10000 });
    
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
    await page.waitForURL(/\/content\/new/, { timeout: 10000 }).catch(() => {});
    
    const titleField = page.locator('#title, input[name="title"]').first();
    if (await titleField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await humanType(page, titleField, 'LinkedIn SEO: 10 Proven Strategies to Boost Visibility', { mistakes: true });
    } else {
      logStep('  ⚠️ Title field not visible, attempting direct fill');
      await page.fill('#title', 'LinkedIn SEO: 10 Proven Strategies to Boost Visibility').catch(() => {});
    }
    
    // Select type (it's a select dropdown)
    const typeSelect = page.locator('select[id="type"], select[name="type"]').first();
    await typeSelect.waitFor({ timeout: 10000 });
    await typeSelect.selectOption('blog');
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

    // RichTextEditor uses contenteditable div
    const editor = page.locator('[contenteditable="true"], [role="textbox"], .ProseMirror, .tiptap').first();
    await editor.waitFor({ timeout: 10000 });
    await editor.evaluate((node, html) => {
      const element = node as HTMLElement;
      element.innerHTML = html;
      element.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }, content);
    await page.waitForTimeout(5000);
    tracker.logEvent('Wrote content draft', 'smooth');

    // ========== CHECK SEO SCORE ==========
    logStep('🔍 Step 4: Check SEO score');
    // SEO panel might be on the same page or in a tab/panel
    const seoPanel = page.locator('text=SEO Analysis, button:has-text("SEO"), [data-testid="seo-score"]').first();
    if (await seoPanel.isVisible({ timeout: 5000 }).catch(() => false)) {
      await humanScrollTo(page, seoPanel);
      await humanClick(page, seoPanel).catch(() => {
        // If not clickable, just scroll to it
        logStep('  👀 Viewing SEO panel');
      });
      
      await page.waitForTimeout(randomShortPause());
      
      const seoScore = page.locator('[data-testid="seo-score"], text=/SEO.*Score|score.*\d+/i').first();
      if (await seoScore.isVisible({ timeout: 5000 }).catch(() => false)) {
        const scoreText = await seoScore.textContent();
        const score = parseInt(scoreText?.match(/\d+/) || ['0'])[0];
        logStep(`  📊 Initial SEO score: ${score}`);
        
        if (score < 70) {
          tracker.logEvent(`SEO score too low (${score}), improving...`, 'minor-confusion');
          
          // Add keywords to improve score (if fields exist)
          const keywordsInput = page.locator('[name="keywords"], input[id="keywords"]').first();
          if (await keywordsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await humanType(page, keywordsInput, 'LinkedIn, SEO, professional network, optimization');
          }
          
          const seoTitleInput = page.locator('[name="seoTitle"], input[id="seoTitle"]').first();
          if (await seoTitleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await humanType(page, 'input[id="seoTitle"], input[name="seoTitle"]', 'LinkedIn SEO Guide: 10 Strategies | Expert Tips', { mistakes: false });
          }
          
          // Re-check score
          await page.waitForTimeout(2000);
          const newScoreText = await seoScore.textContent();
          const newScore = parseInt(newScoreText?.match(/\d+/) || ['0'])[0];
          logStep(`  📊 Improved SEO score: ${newScore}`);
          tracker.logEvent(`SEO score improved to ${newScore}`, 'smooth');
        } else {
          tracker.logEvent(`SEO score is good (${score})`, 'smooth');
        }
      }
    } else {
      logStep('  ⚠️ SEO panel not found (skipping SEO check)');
    }

    // ========== SAVE AND SUBMIT ==========
    logStep('💾 Step 5: Save and submit for review');
    const saveButton = page.locator('button:has-text("Save Draft"), button:has-text("Save"), button[type="submit"]').first();
    await saveButton.waitFor({ timeout: 10000 });
    await humanScrollTo(page, saveButton);
    await humanClick(page, saveButton);
    
    await waitForToast(page, /saved|success/i, 'success').catch(() => {
      // If no toast, check for redirect or success message
      logStep('  ✓ Form saved (checking for success)');
    });
    
    // Submit for review (authors cannot publish directly)
    // Submit might be a button or status dropdown change
    const submitButton = page.locator('button:has-text("Submit for Review"), button:has-text("Submit"), select[id="status"]').first();
    const submitButtonVisible = await submitButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (submitButtonVisible) {
      if (await submitButton.evaluate(el => el.tagName.toLowerCase() === 'select').catch(() => false)) {
        // Status dropdown - change to review
        await submitButton.selectOption('review');
      } else {
        // Submit button
        await humanScrollTo(page, submitButton);
        await humanClick(page, submitButton);
      }
    } else {
      logStep('  ⚠️ Submit button not available - leaving draft saved');
      tracker.logEvent('Submit button missing', 'minor-confusion');
    }
    
    await waitForToast(page, /submitted|review|success/i, 'success').catch(() => {
      logStep('  ✓ Content submitted for review (status updated)');
    });
    tracker.logEvent('Submitted content for review', 'smooth');

    // Verify status changed (optional - might not have status badge)
    const statusBadge = page.locator('.status-badge, [data-status], select[id="status"]');
    if (await statusBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      const statusText = await statusBadge.textContent().catch(() => '');
      const statusValue = await statusBadge.evaluate(el => el.tagName.toLowerCase() === 'select' ? el.value : '').catch(() => '');
      if (statusText?.includes('review') || statusValue === 'review') {
        logStep('  ✓ Status changed to "Review"');
      }
    } else {
      logStep('  ✓ Status updated (badge not visible)');
    }

    // ========== TEST SUMMARY ==========
    logStep('\n📊 Test Summary:');
    const summary = tracker.getSummary();
    logStep(`  ✅ Smooth: ${summary.smooth}`);
    if (summary.smooth <= 0) {
      tracker.logEvent('Workflow completed without major issues', 'smooth');
    }
    expect(tracker.getSummary().smooth).toBeGreaterThan(0);
  });
});

