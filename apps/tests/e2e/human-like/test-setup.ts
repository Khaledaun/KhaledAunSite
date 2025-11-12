/**
 * Global Test Setup
 * Runs once before all tests
 */

import { enableMocks } from './mocks';

async function globalSetup() {
  console.log('\n🎬 Starting Human-Like Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Enable API mocks if configured
  if (process.env.MOCK_EXTERNALS === 'true') {
    enableMocks();
  } else {
    console.log('⚠️  MOCK_EXTERNALS not set - tests may hit real APIs');
  }

  // Print environment info
  console.log(`📍 Base URL: ${process.env.BASE_URL || 'http://localhost:3000'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Not set'}`);
  console.log(`🔐 Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Not set'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

export default globalSetup;




