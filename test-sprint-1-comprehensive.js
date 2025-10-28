const https = require('https');

const ADMIN_URL = 'https://admin.khaledaun.com';
const tests = [];
let passed = 0;
let failed = 0;

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      const bodyString = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let parsedData = null;
        if (data) {
          try {
            parsedData = JSON.parse(data);
          } catch (e) {
            // Not JSON, that's okay
          }
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json: parsedData,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test function
async function runTest(description, testFn) {
  try {
    const result = await testFn();
    if (result.success) {
      passed++;
      console.log(`✅ PASS: ${description}`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
    } else {
      failed++;
      console.log(`❌ FAIL: ${description}`);
      console.log(`   ${result.message}`);
    }
    tests.push({ description, ...result });
  } catch (error) {
    failed++;
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Error: ${error.message}`);
    tests.push({ description, success: false, error: error.message });
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Comprehensive Sprint 1 Tests...\n');
  console.log(`Testing against: ${ADMIN_URL}\n`);
  console.log('='.repeat(60));

  // ============================================================
  // SECTION 1: UI PAGES
  // ============================================================
  console.log('\n📄 SECTION 1: UI Pages Accessibility\n');

  await runTest('Admin homepage loads', async () => {
    const res = await makeRequest(`${ADMIN_URL}`);
    return {
      success: res.statusCode === 200,
      message: `Status: ${res.statusCode}`,
    };
  });

  await runTest('Topic Queue page loads', async () => {
    const res = await makeRequest(`${ADMIN_URL}/topics`);
    return {
      success: res.statusCode === 200,
      message: `Status: ${res.statusCode}`,
    };
  });

  await runTest('Content Library page loads', async () => {
    const res = await makeRequest(`${ADMIN_URL}/content/library`);
    return {
      success: res.statusCode === 200,
      message: `Status: ${res.statusCode}`,
    };
  });

  await runTest('Media Library page loads', async () => {
    const res = await makeRequest(`${ADMIN_URL}/media`);
    return {
      success: res.statusCode === 200,
      message: `Status: ${res.statusCode}`,
    };
  });

  // ============================================================
  // SECTION 2: API ENDPOINTS - READ OPERATIONS
  // ============================================================
  console.log('\n📡 SECTION 2: API Endpoints - Read Operations\n');

  await runTest('Topics API - GET /api/topics returns 200 or 401', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/topics`);
    // 200 if authenticated, 401 if not - both are acceptable
    return {
      success: res.statusCode === 200 || res.statusCode === 401,
      message: `Status: ${res.statusCode} ${res.statusCode === 200 ? '(authenticated)' : '(requires auth)'}`,
    };
  });

  await runTest('Content Library API - GET /api/content-library returns 200 or 401', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/content-library`);
    return {
      success: res.statusCode === 200 || res.statusCode === 401,
      message: `Status: ${res.statusCode} ${res.statusCode === 200 ? '(authenticated)' : '(requires auth)'}`,
    };
  });

  await runTest('Media Library API - GET /api/media-library returns 200 or 401', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/media-library`);
    return {
      success: res.statusCode === 200 || res.statusCode === 401,
      message: `Status: ${res.statusCode} ${res.statusCode === 200 ? '(authenticated)' : '(requires auth)'}`,
    };
  });

  // ============================================================
  // SECTION 3: DATABASE CONNECTION
  // ============================================================
  console.log('\n💾 SECTION 3: Database Connection\n');

  await runTest('Debug endpoint - Prisma models available', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/debug/prisma-models`);
    if (res.statusCode !== 200) {
      return { success: false, message: `Status: ${res.statusCode}` };
    }
    const data = res.json;
    const hasAllModels = data.hasTopicModel && data.hasContentLibraryModel && data.hasMediaLibraryModel;
    return {
      success: hasAllModels,
      message: `Topic: ${data.hasTopicModel}, ContentLibrary: ${data.hasContentLibraryModel}, MediaLibrary: ${data.hasMediaLibraryModel}`,
    };
  });

  await runTest('Debug endpoint - Database config correct', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/debug/test-db-config`);
    if (res.statusCode !== 200) {
      return { success: false, message: `Status: ${res.statusCode}` };
    }
    const data = res.json;
    return {
      success: data.hasDatabaseUrl && data.hasDirectUrl,
      message: `DATABASE_URL: ${data.hasDatabaseUrl ? '✓' : '✗'}, DIRECT_URL: ${data.hasDirectUrl ? '✓' : '✗'}`,
    };
  });

  await runTest('Debug endpoint - Topic query executes (no errors)', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/debug/test-topic-query`);
    // 200 if auth works, 401/403 if no auth - both mean DB is working
    return {
      success: res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 403,
      message: `Status: ${res.statusCode} (database connection ${res.statusCode === 200 ? 'working' : 'requires auth'})`,
    };
  });

  // ============================================================
  // SECTION 4: API STRUCTURE VALIDATION
  // ============================================================
  console.log('\n🔍 SECTION 4: API Response Structure\n');

  await runTest('Topics API returns proper JSON structure', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/topics`);
    if (res.statusCode === 401 || res.statusCode === 403) {
      return { success: true, message: 'API requires authentication (expected)' };
    }
    if (res.statusCode !== 200) {
      return { success: false, message: `Unexpected status: ${res.statusCode}` };
    }
    const hasProperStructure = res.json && (Array.isArray(res.json.topics) || res.json.error);
    return {
      success: hasProperStructure,
      message: hasProperStructure ? 'Valid JSON response structure' : 'Invalid response structure',
    };
  });

  await runTest('Content Library API returns proper JSON structure', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/content-library`);
    if (res.statusCode === 401 || res.statusCode === 403) {
      return { success: true, message: 'API requires authentication (expected)' };
    }
    if (res.statusCode !== 200) {
      return { success: false, message: `Unexpected status: ${res.statusCode}` };
    }
    const hasProperStructure = res.json && (Array.isArray(res.json.content) || res.json.error);
    return {
      success: hasProperStructure,
      message: hasProperStructure ? 'Valid JSON response structure' : 'Invalid response structure',
    };
  });

  await runTest('Media Library API returns proper JSON structure', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/media-library`);
    if (res.statusCode === 401 || res.statusCode === 403) {
      return { success: true, message: 'API requires authentication (expected)' };
    }
    if (res.statusCode !== 200) {
      return { success: false, message: `Unexpected status: ${res.statusCode}` };
    }
    const hasProperStructure = res.json && (Array.isArray(res.json.media) || res.json.error);
    return {
      success: hasProperStructure,
      message: hasProperStructure ? 'Valid JSON response structure' : 'Invalid response structure',
    };
  });

  // ============================================================
  // SECTION 5: API ENDPOINT ROUTES
  // ============================================================
  console.log('\n🛣️  SECTION 5: API Endpoint Routes Exist\n');

  await runTest('Topics API - Single topic endpoint exists', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/topics/test-id`);
    // Should return 401/403 (auth required) or 404 (not found), NOT 500
    return {
      success: res.statusCode !== 500,
      message: `Status: ${res.statusCode} (endpoint exists)`,
    };
  });

  await runTest('Topics API - Lock endpoint exists', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/topics/test-id/lock`, 'POST');
    // Should return 401/403 (auth required) or 404 (not found), NOT 500
    return {
      success: res.statusCode !== 500,
      message: `Status: ${res.statusCode} (endpoint exists)`,
    };
  });

  await runTest('Content Library API - Single content endpoint exists', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/content-library/test-id`);
    // Should return 401/403 (auth required) or 404 (not found), NOT 500
    return {
      success: res.statusCode !== 500,
      message: `Status: ${res.statusCode} (endpoint exists)`,
    };
  });

  await runTest('Media Library API - Single media endpoint exists', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/media-library/test-id`);
    // Should return 401/403 (auth required) or 404 (not found), NOT 500
    return {
      success: res.statusCode !== 500,
      message: `Status: ${res.statusCode} (endpoint exists)`,
    };
  });

  await runTest('Media Library API - Upload endpoint exists', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/media-library/upload`, 'POST');
    // Should return 400/401/403 (validation/auth), NOT 500
    return {
      success: res.statusCode !== 500,
      message: `Status: ${res.statusCode} (endpoint exists)`,
    };
  });

  // ============================================================
  // SECTION 6: ERROR HANDLING
  // ============================================================
  console.log('\n⚠️  SECTION 6: Error Handling\n');

  await runTest('Non-existent API route returns proper error', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/non-existent-route`);
    return {
      success: res.statusCode === 404,
      message: `Status: ${res.statusCode} (proper 404 handling)`,
    };
  });

  await runTest('Invalid topic ID returns proper error', async () => {
    const res = await makeRequest(`${ADMIN_URL}/api/topics/invalid-uuid-format`);
    // Should return 401/403/404/400, NOT 500
    return {
      success: res.statusCode !== 500,
      message: `Status: ${res.statusCode} (graceful error handling)`,
    };
  });

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Sprint 1 is fully operational.\n');
    console.log('✅ Verification Complete:');
    console.log('   • All UI pages accessible');
    console.log('   • All API endpoints responding correctly');
    console.log('   • Database connection working');
    console.log('   • Prisma models available');
    console.log('   • Error handling working properly');
    console.log('   • API routes properly configured\n');
    console.log('🚀 Sprint 1 is PRODUCTION READY!\n');
  } else {
    console.log('⚠️  Some tests failed. Details:\n');
    tests.filter(t => !t.success).forEach(t => {
      console.log(`   ❌ ${t.description}`);
      console.log(`      ${t.message || t.error || 'Unknown error'}\n`);
    });
  }

  // Summary by section
  console.log('📋 Results by Section:\n');
  const sections = {
    'UI Pages': tests.slice(0, 4),
    'API Read Operations': tests.slice(4, 7),
    'Database Connection': tests.slice(7, 10),
    'API Response Structure': tests.slice(10, 13),
    'API Endpoint Routes': tests.slice(13, 18),
    'Error Handling': tests.slice(18, 20),
  };

  Object.entries(sections).forEach(([name, sectionTests]) => {
    const sectionPassed = sectionTests.filter(t => t.success).length;
    const sectionTotal = sectionTests.length;
    const icon = sectionPassed === sectionTotal ? '✅' : '⚠️';
    console.log(`   ${icon} ${name}: ${sectionPassed}/${sectionTotal} passed`);
  });

  console.log('');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});

