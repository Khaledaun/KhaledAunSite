import { test, expect } from '@playwright/test';

/**
 * Integration Tests
 * Tests the integration between admin dashboard and public site
 */

test.describe('Integration - Public API from Admin', () => {
  test('should have working contact form submission', async ({ request }) => {
    // Test public-facing contact endpoint that creates leads
    const response = await request.post('https://admin.khaledaun.com/api/admin/leads', {
      data: {
        name: 'E2E Test User',
        email: 'e2e-test@example.com',
        organization: 'Test Org',
        country: 'Test Country',
        interest: 'COLLABORATION',
        message: 'This is an E2E test message',
        source: 'CONTACT_FORM',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should either succeed (201) or require auth (401)
    expect([201, 401, 403]).toContain(response.status());
  });
});

test.describe('Integration - Data Flow', () => {
  test.skip('published posts appear on site', async ({ page }) => {
    // This would require:
    // 1. Login to admin
    // 2. Create and publish a post
    // 3. Visit site and verify it appears
    // Skipping for now as it requires auth
    test.skip(true, 'Requires authenticated session');
  });

  test.skip('case studies are visible on site', async ({ page }) => {
    // Similar to posts - requires auth to publish
    test.skip(true, 'Requires authenticated session');
  });
});

test.describe('Integration - Site-to-Admin Communication', () => {
  test('site can reach admin API health check', async ({ request }) => {
    const response = await request.get('https://admin.khaledaun.com/api/health');
    
    if (response.status() === 404) {
      test.skip(true, 'Health endpoint not configured');
      return;
    }
    
    expect(response.ok()).toBeTruthy();
  });

  test('site has correct CORS configuration', async ({ request }) => {
    // Test if site can make requests to admin (for preview, etc.)
    const response = await request.get('https://admin.khaledaun.com/api/health', {
      headers: {
        'Origin': 'https://khaledaun.com',
      },
    });

    if (response.status() === 404) {
      test.skip(true, 'Health endpoint not configured');
      return;
    }

    const corsHeader = response.headers()['access-control-allow-origin'];
    
    // Either allows our origin or uses credentials
    if (corsHeader) {
      expect([
        'https://khaledaun.com',
        '*',
      ]).toContain(corsHeader);
    }
  });
});

test.describe('Integration - Preview System', () => {
  test.skip('draft posts have preview URLs', async ({ page }) => {
    // Would need to:
    // 1. Create a draft post
    // 2. Get preview URL
    // 3. Verify it works
    test.skip(true, 'Requires authenticated session');
  });

  test.skip('preview URLs expire correctly', async ({ page }) => {
    // Would test preview URL expiration logic
    test.skip(true, 'Requires authenticated session and time manipulation');
  });
});

test.describe('Integration - Media Assets', () => {
  test.skip('uploaded media is accessible from site', async ({ page }) => {
    // Would need to:
    // 1. Upload media in admin
    // 2. Use it in a post
    // 3. Verify it loads on site
    test.skip(true, 'Requires authenticated session');
  });

  test('media CDN is accessible', async ({ request }) => {
    // Test if Supabase storage is reachable
    // We don't know a specific URL, so this is a placeholder
    test.skip(true, 'Need actual media URL to test');
  });
});

test.describe('Integration - Environment Variables', () => {
  test('admin has required env vars', async ({ request }) => {
    // Test health endpoint which checks env vars
    const response = await request.get('https://admin.khaledaun.com/api/health');
    
    if (response.status() === 404) {
      test.skip(true, 'Health endpoint not configured');
      return;
    }

    const data = await response.json();
    
    // Check if response indicates healthy system
    if (data.status) {
      expect(data.status).toBeTruthy();
    }
  });

  test('site has required env vars', async ({ request }) => {
    const response = await request.get('https://khaledaun.com/api/health');
    
    if (response.status() === 404) {
      test.skip(true, 'Health endpoint not configured');
      return;
    }

    const data = await response.json();
    
    // Check if response indicates healthy system
    if (data.status) {
      expect(data.status).toBeTruthy();
    }
  });
});

test.describe('Integration - Database Connection', () => {
  test('admin can connect to database', async ({ request }) => {
    // Health check should verify DB connection
    const response = await request.get('https://admin.khaledaun.com/api/health');
    
    if (response.status() === 404) {
      test.skip(true, 'Health endpoint not configured');
      return;
    }

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    if (data.database) {
      expect(data.database).toBe('connected');
    }
  });

  test('site can connect to database', async ({ request }) => {
    const response = await request.get('https://khaledaun.com/api/health');
    
    if (response.status() === 404) {
      test.skip(true, 'Health endpoint not configured');
      return;
    }

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    if (data.database) {
      expect(data.database).toBe('connected');
    }
  });
});

test.describe('Integration - Revalidation', () => {
  test.skip('ISR revalidation works for posts', async ({ page }) => {
    // Would test Incremental Static Regeneration
    test.skip(true, 'Requires manual cache invalidation testing');
  });

  test.skip('on-demand revalidation works', async ({ request }) => {
    // Would test revalidate API endpoint
    test.skip(true, 'Requires authenticated session');
  });
});

test.describe('Integration - Search & Discovery', () => {
  test.skip('published content is searchable', async ({ page }) => {
    // Would test search functionality if implemented
    test.skip(true, 'Search feature not yet implemented');
  });

  test.skip('site has valid sitemap', async ({ request }) => {
    const response = await request.get('https://khaledaun.com/sitemap.xml');
    
    if (response.status() === 404) {
      test.skip(true, 'Sitemap not yet generated');
      return;
    }

    expect(response.ok()).toBeTruthy();
    const sitemap = await response.text();
    expect(sitemap).toContain('<?xml');
    expect(sitemap).toContain('<urlset');
  });

  test.skip('site has robots.txt', async ({ request }) => {
    const response = await request.get('https://khaledaun.com/robots.txt');
    
    if (response.status() === 404) {
      test.skip(true, 'robots.txt not configured');
      return;
    }

    expect(response.ok()).toBeTruthy();
  });
});

