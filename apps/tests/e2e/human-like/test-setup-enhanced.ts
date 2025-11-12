/**
 * Enhanced Global Test Setup
 * Runs once before all tests
 * Includes environment validation and database connectivity check
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { enableMocks } from './mocks';
import { printEnvironmentReport, validateTestEnvironment } from './env-validation';

/**
 * Load environment variables from .env files
 * Checks multiple locations: root .env, admin .env, .env.test
 */
function loadEnvironmentVariables() {
  // Get root directory - Playwright runs in Node.js, so __dirname is available
  // Path: apps/tests/e2e/human-like/test-setup-enhanced.ts -> root (4 levels up)
  const rootDir = join(__dirname, '../../../../');
  const adminDir = join(rootDir, 'apps/admin');
  
  const envFiles = [
    join(rootDir, '.env.test'),
    join(rootDir, '.env.local'),
    join(rootDir, '.env'),
    join(adminDir, '.env.local'),
    join(adminDir, '.env'),
  ];
  
  for (const envFile of envFiles) {
    try {
      const content = readFileSync(envFile, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      }
    } catch (error) {
      // File doesn't exist, continue to next
    }
  }
}

async function globalSetup() {
  console.log('\n🎬 Starting Human-Like Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Load environment variables from .env files FIRST
  loadEnvironmentVariables();
  
  // Validate environment variables
  printEnvironmentReport();
  const envCheck = validateTestEnvironment();
  
  if (!envCheck.valid) {
    console.error('\n❌ Environment validation failed!');
    console.error('   Please fix the missing environment variables and try again.');
    console.error('   See .env.test.example for required variables.\n');
    process.exit(1);
  }
  
  // Test database connection before proceeding
  if (process.env.DATABASE_URL) {
    console.log('🔌 Testing database connection...');
    const { prisma } = require('@khaledaun/db');

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        await prisma.$disconnect();
        console.log('✅ Database connection successful!\n');
        break;
      } catch (error: any) {
        console.error(`❌ Database connection attempt ${attempt} failed: ${error.message}`);
        if (attempt === maxAttempts) {
          console.error('\n💡 Possible solutions:');
          console.error('   1. Check if Supabase project is active (not paused)');
          console.error('   2. Verify DATABASE_URL is correct');
          console.error('   3. Check network/firewall settings');
          console.error('   4. Try direct connection instead of pooler\n');
          process.exit(1);
        }
        console.log('   Retrying in 2 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  // Enable API mocks if configured
  if (process.env.MOCK_EXTERNALS === 'true') {
    enableMocks();
    console.log('✅ Mock mode enabled - external APIs will be mocked');
  } else {
    console.log('⚠️  MOCK_EXTERNALS not set - tests may hit real APIs');
  }

  // Print environment info
  console.log('\n📋 Environment Configuration:');
  console.log(`📍 Base URL: ${process.env.BASE_URL || 'http://localhost:3000'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Not set'}`);
  console.log(`🔐 Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Not set'}`);
  console.log(`🔗 Admin API: ${process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000 (default)'}`);
  
  if (envCheck.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    for (const warning of envCheck.warnings) {
      console.log(`   - ${warning}`);
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

export default globalSetup;


