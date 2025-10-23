# Production API Testing Script
# Tests all Phase 1 Strategic UX endpoints

Write-Host "🧪 Testing Production APIs..." -ForegroundColor Cyan
Write-Host ""

# Color functions
function Test-API {
    param(
        [string]$Name,
        [string]$Url,
        [string]$ExpectedStatus = "200"
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 10
        $status = $response.StatusCode
        
        if ($status -eq $ExpectedStatus) {
            Write-Host "✅ PASS - Status: $status" -ForegroundColor Green
            Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Gray
        } else {
            Write-Host "⚠️  UNEXPECTED - Status: $status (Expected: $ExpectedStatus)" -ForegroundColor Yellow
            Write-Host "Response: $($response.Content)" -ForegroundColor Gray
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host "❌ FAIL - Status: $statusCode" -ForegroundColor Red
        } else {
            Write-Host "❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "PUBLIC SITE APIs (www.khaledaun.com)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 1: Site Logo
Test-API -Name "Site Logo API" -Url "https://www.khaledaun.com/api/site-logo"

# Test 2: LinkedIn Posts Embed
Test-API -Name "LinkedIn Posts Embed" -Url "https://www.khaledaun.com/api/social-embed/LINKEDIN_POSTS"

# Test 3: Latest Posts
Test-API -Name "Latest Posts API" -Url "https://www.khaledaun.com/api/posts/latest?limit=3"

# Test 4: Hero Titles
Test-API -Name "Hero Titles API" -Url "https://www.khaledaun.com/api/hero-titles"

# Test 5: Experiences
Test-API -Name "Experiences API" -Url "https://www.khaledaun.com/api/experiences"

# Test 6: Hero Media
Test-API -Name "Hero Media API" -Url "https://www.khaledaun.com/api/hero-media"

# Test 7: Health Check
Test-API -Name "Health Check" -Url "https://www.khaledaun.com/api/health"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ADMIN APIs (admin.khaledaun.com)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 8: Admin Health
Test-API -Name "Admin Health Check" -Url "https://admin.khaledaun.com/api/health"

# Test 9: Admin Analytics Stats
Test-API -Name "Admin Analytics Stats" -Url "https://admin.khaledaun.com/api/admin/analytics/stats"

# Note: The following require authentication, so we expect 401 or redirect
Write-Host "Testing Protected Admin Endpoints (expect auth required):" -ForegroundColor Yellow
Write-Host ""

# Test 10: Leads (Protected)
Test-API -Name "Leads API (Protected)" -Url "https://admin.khaledaun.com/api/admin/leads"

# Test 11: Case Studies (Protected)
Test-API -Name "Case Studies API (Protected)" -Url "https://admin.khaledaun.com/api/admin/case-studies"

# Test 12: AI Config (Protected)
Test-API -Name "AI Config API (Protected)" -Url "https://admin.khaledaun.com/api/admin/ai-config"

# Test 13: AI Templates (Protected)
Test-API -Name "AI Templates API (Protected)" -Url "https://admin.khaledaun.com/api/admin/ai-templates"

# Test 14: Site Logo Admin (Protected)
Test-API -Name "Site Logo Admin API (Protected)" -Url "https://admin.khaledaun.com/api/admin/site-logo"

# Test 15: Posts (Protected)
Test-API -Name "Posts API (Protected)" -Url "https://admin.khaledaun.com/api/admin/posts"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Public APIs should return 200 with data or empty arrays" -ForegroundColor Green
Write-Host "✅ Protected APIs should return 401 (Unauthorized) or redirect" -ForegroundColor Green
Write-Host "❌ Any 500 errors indicate database/server issues" -ForegroundColor Red
Write-Host ""
Write-Host "If all tests pass, your Phase 1 Strategic UX migration is successful! 🎉" -ForegroundColor Cyan

