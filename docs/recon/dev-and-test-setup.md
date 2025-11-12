# Development & Test Setup
**Local Development Environment and Testing Guide**

> **Generated:** December 2024  
> **Purpose:** Complete setup instructions for developers and QA

---

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Running the Applications](#running-the-applications)
5. [Testing Setup](#testing-setup)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | 18.x or 20.x | Runtime |
| **npm** | 9.x+ | Package manager |
| **pnpm** | 8.x+ (optional) | Monorepo package manager |
| **PostgreSQL** | 15+ | Local database (optional, can use Supabase) |
| **Git** | Latest | Version control |

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/Khaledaun/KhaledAunSite.git
cd KhaledAunSite

# 2. Install dependencies
npm install

# 3. Install dependencies for workspaces
npm run install:all
# OR with pnpm
pnpm install

# 4. Generate Prisma client
cd apps/admin
npx prisma generate
cd ../..

# 5. Copy environment template
cp .env.example .env
cp apps/admin/.env.example apps/admin/.env
cp apps/site/.env.example apps/site/.env

# 6. Configure environment variables
# Edit .env files with your values

# 7. Run database migrations
cd apps/admin
npx prisma migrate deploy
# OR apply manually via Supabase SQL editor
cd ../..

# 8. Seed database (optional)
npm run db:seed
```

---

## Environment Configuration

### Root `.env`

```bash
# Shared configuration
NODE_ENV=development

# Database (Supabase or local PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?pgbouncer=true&connection_limit=10"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# Logging
LOG_LEVEL=debug
```

### Admin App `.env` (`apps/admin/.env`)

```bash
# ===== REQUIRED =====

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"

# ===== OPTIONAL (for full functionality) =====

# LinkedIn Integration
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
LINKEDIN_SCOPES=w_member_social,r_liteprofile
LINKEDIN_ENCRYPTION_KEY=generate-32-byte-hex-key # openssl rand -hex 32

# Email (Resend)
RESEND_API_KEY=re_your-api-key
RESEND_FROM_EMAIL=hello@localhost.test
RESEND_FROM_NAME="Khaled Aun (Dev)"
RESEND_WEBHOOK_SECRET=whsec_test_secret

# CRM (HubSpot)
HUBSPOT_API_KEY=pat-na1-your-private-app-key
HUBSPOT_PORTAL_ID=12345678

# AI Services
OPENAI_API_KEY=sk-proj-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-token

# Cron Security
CRON_SECRET=dev-cron-secret-change-in-production

# Feature Flags
ENABLE_AI_GENERATION=true
ENABLE_LINKEDIN_POSTING=false # Disable for local dev
ENABLE_EMAIL_CAMPAIGNS=false # Disable to avoid sending real emails
```

### Site App `.env` (`apps/site/.env`)

```bash
# Supabase (for contact form)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Newsletter API (points to admin app)
NEXT_PUBLIC_NEWSLETTER_API=http://localhost:3000/api/newsletter
```

### Environment Template (`.env.example`)

```bash
# ===== DATABASE =====
DATABASE_URL="postgresql://postgres:password@localhost:5432/khaledaun_dev?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@localhost:5432/khaledaun_dev"

# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ===== INTEGRATIONS (Optional for local dev) =====
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
LINKEDIN_ENCRYPTION_KEY=

RESEND_API_KEY=
HUBSPOT_API_KEY=

OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# ===== FEATURE FLAGS =====
ENABLE_AI_GENERATION=true
ENABLE_LINKEDIN_POSTING=false
ENABLE_EMAIL_CAMPAIGNS=false

# ===== SECURITY =====
CRON_SECRET=local-dev-secret
RESEND_WEBHOOK_SECRET=local-webhook-secret

# ===== MONITORING (Optional) =====
SENTRY_DSN=
LOG_LEVEL=debug
```

---

## Database Setup

### Option 1: Use Supabase (Recommended)

1. **Create Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note: URL, anon key, service role key

2. **Run Migrations:**
   ```bash
   # Copy migrations to Supabase SQL Editor
   # File: apps/admin/prisma/schema.prisma
   # OR run migration files:
   # - RUN-THIS-IN-SUPABASE.sql
   # - sprint4-migration.sql
   # - sprint5-migration.sql
   ```

3. **Generate Prisma Client:**
   ```bash
   cd apps/admin
   npx prisma generate
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL:**
   ```bash
   # macOS (Homebrew)
   brew install postgresql@15
   brew services start postgresql@15
   
   # Ubuntu/Debian
   sudo apt install postgresql-15
   sudo systemctl start postgresql
   
   # Windows
   # Download installer from postgresql.org
   ```

2. **Create Database:**
   ```sql
   CREATE DATABASE khaledaun_dev;
   CREATE USER khaledaun_user WITH PASSWORD 'dev_password';
   GRANT ALL PRIVILEGES ON DATABASE khaledaun_dev TO khaledaun_user;
   ```

3. **Run Migrations:**
   ```bash
   cd apps/admin
   npx prisma migrate deploy
   # OR
   npx prisma db push
   ```

4. **Seed Database:**
   ```bash
   npm run db:seed
   ```

### Database Seed Data

**File:** `packages/db/seed.ts`

```typescript
import { prisma } from './index';

async function seed() {
  // Create test users
  const owner = await prisma.user.create({
    data: {
      email: 'admin@localhost.test',
      name: 'Admin User',
    },
  });
  
  await prisma.userRole.create({
    data: {
      userId: owner.id,
      role: 'OWNER',
    },
  });
  
  const author = await prisma.user.create({
    data: {
      email: 'author@localhost.test',
      name: 'Author User',
    },
  });
  
  await prisma.userRole.create({
    data: {
      userId: author.id,
      role: 'AUTHOR',
    },
  });
  
  // Create sample content
  await prisma.contentLibrary.create({
    data: {
      title: 'Sample Blog Post',
      content: '<p>This is a sample blog post for testing.</p>',
      type: 'blog',
      status: 'draft',
      authorId: author.id,
      keywords: ['sample', 'test'],
    },
  });
  
  // Create sample topic
  await prisma.topic.create({
    data: {
      title: 'Content Marketing Strategies',
      description: 'Ideas for content marketing',
      status: 'ready',
      priority: 5,
    },
  });
  
  console.log('Seed data created successfully!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Running the Applications

### Development Servers

```bash
# Root directory

# Run admin app (port 3000)
npm run dev:admin

# Run public site (port 3001)
npm run dev:site

# Run both concurrently
npm run dev
```

### Build for Production

```bash
# Build admin app
npm run build
# OR
cd apps/admin && npm run build

# Build public site
npm run build:site
# OR
cd apps/site && npm run build
```

### Start Production Build

```bash
# Start admin app
npm start

# Start public site
npm run start:site
```

### Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev:admin` | `pnpm --filter @khaledaun/admin dev` | Run admin in dev mode |
| `dev:site` | `pnpm --filter @khaledaun/site dev` | Run site in dev mode |
| `build` | `pnpm --filter @khaledaun/admin build` | Build admin for production |
| `build:site` | `pnpm --filter @khaledaun/site build` | Build site for production |
| `start` | `pnpm --filter @khaledaun/admin start` | Start admin (prod mode) |
| `start:site` | `pnpm --filter @khaledaun/site start` | Start site (prod mode) |
| `test` | `playwright test` | Run E2E tests |
| `test:ui` | `playwright test --ui` | Run tests with UI |
| `db:seed` | `tsx packages/db/seed.ts` | Seed database |
| `lint` | `eslint .` | Lint all files |
| `lint:fix` | `eslint . --fix` | Fix lint issues |
| `format` | `prettier --write .` | Format code |
| `type-check` | `tsc --noEmit` | Check TypeScript types |

---

## Testing Setup

### Playwright Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev:admin',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Run specific test file
npx playwright test api-smoke.spec.ts

# Run tests matching pattern
npx playwright test --grep "content creation"

# Debug tests
npm run test:debug
```

### Test Environment Setup

**File:** `apps/tests/test-utils.ts`

```typescript
import { test as base, expect } from '@playwright/test';
import { prisma } from '@khaledaun/db';

// Extend base test with custom fixtures
export const test = base.extend({
  // Auto-login fixture
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'admin@localhost.test');
    await page.fill('[name="password"]', 'test_password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/command-center');
    await use(page);
  },
  
  // Clean database fixture
  cleanDatabase: async ({}, use) => {
    await prisma.contentLibrary.deleteMany();
    await prisma.topic.deleteMany();
    await use();
    // Cleanup after test
  },
});

export { expect };
```

### Mock Data for Testing

```typescript
// Test fixtures
export const TEST_USERS = {
  owner: { email: 'owner@test.com', password: 'test123', role: 'OWNER' },
  admin: { email: 'admin@test.com', password: 'test123', role: 'ADMIN' },
  editor: { email: 'editor@test.com', password: 'test123', role: 'EDITOR' },
  author: { email: 'author@test.com', password: 'test123', role: 'AUTHOR' },
};

export const TEST_CONTENT = {
  blog: {
    title: 'Test Blog Post',
    content: '<p>This is test content with more than 100 characters to pass validation rules.</p>',
    type: 'blog',
    keywords: ['test', 'automation'],
  },
  linkedinPost: {
    title: 'Test LinkedIn Post',
    content: 'Short LinkedIn post content',
    type: 'linkedin_post',
  },
};
```

### Mocking External Services

```typescript
// Mock Resend API
test.beforeEach(async ({ page }) => {
  await page.route('https://api.resend.com/**', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ id: 're_mock_123', success: true }),
    });
  });
});

// Mock LinkedIn API
test.beforeEach(async ({ page }) => {
  await page.route('https://api.linkedin.com/**', route => {
    route.fulfill({
      status: 201,
      body: JSON.stringify({ id: 'urn:li:ugcPost:mock123' }),
    });
  });
});

// Mock HubSpot API
test.beforeEach(async ({ page }) => {
  await page.route('https://api.hubapi.com/**', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ id: '12345', properties: {} }),
    });
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Symptoms:**
```
Error: Can't reach database server at localhost:5432
```

**Solutions:**
- Check PostgreSQL is running: `pg_ctl status` or `sudo systemctl status postgresql`
- Verify connection string in `.env`
- Check firewall/network settings
- For Supabase: Verify project is active and connection string is correct

---

#### 2. Prisma Client Not Generated

**Symptoms:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
cd apps/admin
npx prisma generate
```

---

#### 3. Port Already in Use

**Symptoms:**
```
Error: Port 3000 is already in use
```

**Solutions:**
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# OR use different port
PORT=3001 npm run dev:admin
```

---

#### 4. Missing Environment Variables

**Symptoms:**
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```

**Solution:**
- Copy `.env.example` to `.env`
- Fill in required variables
- Restart dev server

---

#### 5. Playwright Browser Installation Failed

**Symptoms:**
```
Executable doesn't exist at /path/to/browser
```

**Solution:**
```bash
npx playwright install
# OR for specific browser
npx playwright install chromium
```

---

#### 6. TypeScript Errors in Editor

**Symptoms:**
- Red squiggles everywhere
- "Cannot find module" errors

**Solution:**
```bash
# Restart TypeScript server in VS Code
# CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"

# OR regenerate types
npm run verify:types
```

---

### Development Tips

1. **Hot Reload Not Working:**
   - Check if `.next` cache is corrupted: `rm -rf apps/admin/.next`
   - Restart dev server

2. **Slow Builds:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Disable Sentry in development: Comment out `sentry.*.config.ts` imports

3. **Database Out of Sync:**
   - Reset database: `npx prisma migrate reset`
   - Re-run migrations: `npx prisma migrate deploy`
   - Re-seed: `npm run db:seed`

4. **Can't Login Locally:**
   - Create test user manually via SQL:
   ```sql
   INSERT INTO users (id, email) VALUES (gen_random_uuid(), 'admin@localhost.test');
   INSERT INTO user_roles (user_id, role) VALUES ((SELECT id FROM users WHERE email='admin@localhost.test'), 'OWNER');
   ```

---

**Document Status:** ✅ Complete  
**Last Updated:** December 2024  
**Next Document:** [Gaps & Recommendations](./gaps-and-recommendations.md)

