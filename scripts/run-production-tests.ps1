#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run E2E tests against production environment
.DESCRIPTION
    Executes comprehensive E2E tests against deployed applications
    and generates a detailed status report
#>

param(
    [switch]$SkipInstall,
    [switch]$Debug
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 Production E2E Test Suite" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check if playwright is installed
if (-not $SkipInstall) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    
    Write-Host "🎭 Installing Playwright browsers..." -ForegroundColor Yellow
    npx playwright install chromium --with-deps
}

Write-Host ""
Write-Host "🧪 Running production tests..." -ForegroundColor Green
Write-Host ""

# Run tests with production config
$testCommand = "npx playwright test --config=playwright.config.production.ts"

if ($Debug) {
    $testCommand += " --debug"
}

Invoke-Expression $testCommand

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed or were skipped" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 View detailed report:" -ForegroundColor Cyan
Write-Host "   npx playwright show-report test-results/production-report" -ForegroundColor White
Write-Host ""
Write-Host "📋 JSON results:" -ForegroundColor Cyan
Write-Host "   test-results/production-results.json" -ForegroundColor White
Write-Host ""

exit $exitCode

