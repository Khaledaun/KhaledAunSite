/**
 * Sprint 1 - Quick Smoke Test Script
 * 
 * This script performs basic checks to verify Sprint 1 deployment
 * Run with: node test-sprint-1.js
 */

const https = require('https');

const ADMIN_URL = 'https://admin.khaledaun.com';
const tests = [];
let passed = 0;
let failed = 0;

// Helper function to make HTTP requests
function checkUrl(url, description) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const success = res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 307;
      tests.push({
        description,
        url,
        status: res.statusCode,
        success
      });
      
      if (success) {
        passed++;
        console.log(`✅ PASS: ${description} (${res.statusCode})`);
      } else {
        failed++;
        console.log(`❌ FAIL: ${description} (${res.statusCode})`);
      }
      
      resolve();
    }).on('error', (err) => {
      tests.push({
        description,
        url,
        error: err.message,
        success: false
      });
      failed++;
      console.log(`❌ FAIL: ${description} - ${err.message}`);
      resolve();
    });
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Sprint 1 Smoke Tests...\n');
  console.log(`Testing against: ${ADMIN_URL}\n`);
  
  // Test 1: Admin homepage
  await checkUrl(`${ADMIN_URL}`, 'Admin homepage accessible');
  
  // Test 2: Topic Queue page
  await checkUrl(`${ADMIN_URL}/admin/topics`, 'Topic Queue page accessible');
  
  // Test 3: Content Library page
  await checkUrl(`${ADMIN_URL}/admin/content/library`, 'Content Library page accessible');
  
  // Test 4: Media Library page
  await checkUrl(`${ADMIN_URL}/admin/media`, 'Media Library page accessible');
  
  // Test 5: API endpoints (these might require auth, so 401/403 is acceptable)
  console.log('\n📡 Testing API Endpoints (401/403 expected if not authenticated)...\n');
  
  await checkUrl(`${ADMIN_URL}/api/topics`, 'Topics API endpoint exists');
  await checkUrl(`${ADMIN_URL}/api/content`, 'Content API endpoint exists');
  await checkUrl(`${ADMIN_URL}/api/media`, 'Media API endpoint exists');
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');
  
  if (failed === 0) {
    console.log('🎉 All smoke tests passed! Sprint 1 deployment looks good.\n');
    console.log('Next steps:');
    console.log('1. Log into admin panel and manually test features');
    console.log('2. Follow the detailed test plan in SPRINT-1-TEST-PLAN.md');
    console.log('3. Report any issues found\n');
  } else {
    console.log('⚠️  Some tests failed. Please investigate:\n');
    tests.filter(t => !t.success).forEach(t => {
      console.log(`   - ${t.description}`);
      console.log(`     URL: ${t.url}`);
      console.log(`     ${t.error || `Status: ${t.status}`}\n`);
    });
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(err => {
  console.error('❌ Test runner error:', err);
  process.exit(1);
});

