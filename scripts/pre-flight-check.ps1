# Pre-Flight Deployment Validation Script (PowerShell)
# Phase 6 Full + Phase 8 Full
# Version: 1.0
# Date: 2024-10-16

$ErrorActionPreference = "Continue"

# Counters
$Script:Errors = 0
$Script:Warnings = 0
$Script:Checks = 0

function Write-SectionHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "--- $Title ---" -ForegroundColor Cyan
}

function Write-Pass {
    param([string]$Message)
    Write-Host "[OK]  $Message" -ForegroundColor Green
    $Script:Checks++
}

function Write-Fail {
    param([string]$Message)
    Write-Host "[ERR] $Message" -ForegroundColor Red
    $Script:Errors++
    $Script:Checks++
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
    $Script:Warnings++
    $Script:Checks++
}

# Header
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Pre-Flight Deployment Validation" -ForegroundColor Cyan
Write-Host "   Phase 6 Full + Phase 8 Full" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ============================================================================
# 1. SYSTEM TOOLS
# ============================================================================
Write-SectionHeader "1. Checking Required Tools"

# Node.js
try {
    $nodeVersion = node --version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -ge 20) {
        Write-Pass "Node.js $nodeVersion (>= 20 required)"
    } else {
        Write-Fail "Node.js $nodeVersion (need >= 20)"
    }
} catch {
    Write-Fail "Node.js not installed"
}

# pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Pass "pnpm $pnpmVersion"
} catch {
    Write-Fail "pnpm not installed (run: npm install -g pnpm)"
}

# Git
try {
    $gitVersion = git --version
    Write-Pass "Git $gitVersion"
} catch {
    Write-Fail "Git not installed"
}

# tsx
try {
    $tsxVersion = tsx --version 2>$null
    Write-Pass "tsx available"
} catch {
    try {
        pnpm exec tsx --version 2>$null | Out-Null
        Write-Pass "tsx available via pnpm"
    } catch {
        Write-Warn "tsx not found (will use pnpm exec tsx)"
    }
}

# curl
try {
    curl --version | Out-Null
    Write-Pass "curl available"
} catch {
    Write-Warn "curl not installed (needed for API testing)"
}

# ============================================================================
# 2. ENVIRONMENT VARIABLES
# ============================================================================
Write-SectionHeader "2. Checking Environment Variables"

# Check for .env file
if (Test-Path "packages/db/.env") {
    Write-Pass ".env file exists in packages/db/"
    # Load .env
    Get-Content "packages/db/.env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Warn ".env file not found in packages/db/ (will use existing env vars)"
}

# DATABASE_URL
$databaseUrl = $env:DATABASE_URL
if ([string]::IsNullOrEmpty($databaseUrl)) {
    Write-Fail "DATABASE_URL not set"
    Write-Host "         Set with: `$env:DATABASE_URL='<your-pooled-url>'" -ForegroundColor Gray
} else {
    $maskedUrl = $databaseUrl -replace '(postgresql://[^:]+:)[^@]+(@.*)', '$1****$2'
    Write-Pass "DATABASE_URL set: $($maskedUrl.Substring(0, [Math]::Min(50, $maskedUrl.Length)))..."
    
    if ($databaseUrl -match 'pgbouncer=true') {
        Write-Pass "DATABASE_URL includes pgbouncer=true"
    } else {
        Write-Warn "DATABASE_URL missing pgbouncer=true"
    }
    
    if ($databaseUrl -match 'sslmode=require') {
        Write-Pass "DATABASE_URL includes sslmode=require"
    } else {
        Write-Warn "DATABASE_URL missing sslmode=require"
    }
}

# DIRECT_URL
$directUrl = $env:DIRECT_URL
if ([string]::IsNullOrEmpty($directUrl)) {
    Write-Fail "DIRECT_URL not set"
    Write-Host "         Set with: `$env:DIRECT_URL='<your-direct-url>'" -ForegroundColor Gray
} else {
    $maskedDirect = $directUrl -replace '(postgresql://[^:]+:)[^@]+(@.*)', '$1****$2'
    Write-Pass "DIRECT_URL set: $($maskedDirect.Substring(0, [Math]::Min(50, $maskedDirect.Length)))..."
    
    if ($directUrl -match 'sslmode=require') {
        Write-Pass "DIRECT_URL includes sslmode=require"
    } else {
        Write-Warn "DIRECT_URL missing sslmode=require"
    }
}

# REVALIDATE_SECRET
$revalidateSecret = $env:REVALIDATE_SECRET
if ([string]::IsNullOrEmpty($revalidateSecret)) {
    Write-Warn "REVALIDATE_SECRET not set"
} else {
    $secretLen = $revalidateSecret.Length
    if ($secretLen -ge 32) {
        Write-Pass "REVALIDATE_SECRET set ($secretLen chars)"
    } else {
        Write-Warn "REVALIDATE_SECRET only $secretLen chars (recommend 32+)"
    }
}

# PREVIEW_SECRET
$previewSecret = $env:PREVIEW_SECRET
if ([string]::IsNullOrEmpty($previewSecret)) {
    Write-Warn "PREVIEW_SECRET not set"
} else {
    $secretLen = $previewSecret.Length
    if ($secretLen -ge 32) {
        Write-Pass "PREVIEW_SECRET set ($secretLen chars)"
    } else {
        Write-Warn "PREVIEW_SECRET only $secretLen chars (recommend 32+)"
    }
}

# SITE_URL
$siteUrl = $env:SITE_URL
if ([string]::IsNullOrEmpty($siteUrl)) {
    Write-Warn "SITE_URL not set"
} else {
    Write-Pass "SITE_URL set: $siteUrl"
}

# ============================================================================
# 3. GIT STATUS
# ============================================================================
Write-SectionHeader "3. Checking Git Status"

try {
    git rev-parse --git-dir 2>$null | Out-Null
    Write-Pass "Git repository detected"
    
    # Current branch
    $currentBranch = git rev-parse --abbrev-ref HEAD
    Write-Pass "Current branch: $currentBranch"
    
    # Uncommitted changes
    $gitStatus = git status --porcelain
    if ([string]::IsNullOrEmpty($gitStatus)) {
        Write-Pass "No uncommitted changes"
    } else {
        Write-Warn "Uncommitted changes detected:"
        $gitStatus | Select-Object -First 5 | ForEach-Object {
            Write-Host "         $_" -ForegroundColor Gray
        }
        $remaining = ($gitStatus | Measure-Object).Count - 5
        if ($remaining -gt 0) {
            Write-Host "         ... and $remaining more" -ForegroundColor Gray
        }
    }
    
    # Last commit
    $lastCommit = git log -1 --pretty=format:"%h - %s" 2>$null
    if (![string]::IsNullOrEmpty($lastCommit)) {
        Write-Pass "Last commit: $lastCommit"
    }
} catch {
    Write-Fail "Not a Git repository"
}

# ============================================================================
# 4. REPOSITORY STRUCTURE
# ============================================================================
Write-SectionHeader "4. Checking Repository Structure"

$requiredDirs = @(
    "packages/db",
    "packages/db/prisma",
    "packages/db/scripts",
    "packages/auth",
    "packages/utils",
    "apps/site",
    "apps/admin",
    "apps/tests"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir -PathType Container) {
        Write-Pass "Directory exists: $dir"
    } else {
        Write-Fail "Missing directory: $dir"
    }
}

$requiredFiles = @(
    "packages/db/prisma/schema.prisma",
    "packages/db/seed.ts",
    "packages/db/scripts/backfill-phase6-full.ts",
    "packages/db/scripts/verify-post-translations.ts",
    "packages/auth/permissions.ts",
    "packages/utils/sanitize.ts",
    "DEPLOYMENT-RUNBOOK.md"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file -PathType Leaf) {
        Write-Pass "File exists: $file"
    } else {
        Write-Fail "Missing file: $file"
    }
}

# ============================================================================
# 5. DEPENDENCIES
# ============================================================================
Write-SectionHeader "5. Checking Dependencies"

if (Test-Path "node_modules" -PathType Container) {
    Write-Pass "Root node_modules exists"
} else {
    Write-Fail "Root node_modules missing (run: pnpm install)"
}

if (Test-Path "packages/db/node_modules" -PathType Container) {
    Write-Pass "packages/db/node_modules exists"
} else {
    Write-Warn "packages/db/node_modules missing"
}

# Check sanitize-html (in packages/utils)
if (Test-Path "packages/utils/node_modules/sanitize-html") {
    Write-Pass "sanitize-html package installed"
} elseif (Test-Path "node_modules/sanitize-html") {
    Write-Pass "sanitize-html package installed (at root)"
} else {
    $sanitizeCheck = pnpm list sanitize-html -r 2>$null | Select-String "sanitize-html"
    if ($sanitizeCheck) {
        Write-Pass "sanitize-html package installed"
    } else {
        Write-Fail "sanitize-html not installed (needed for Phase 8)"
    }
}

# Check Prisma client
if ((Test-Path "packages/db/node_modules/.prisma") -or (Test-Path "node_modules/.prisma")) {
    Write-Pass "Prisma client generated"
} else {
    Write-Warn "Prisma client not generated (will generate on db:push)"
}

# ============================================================================
# 6. PRISMA SCHEMA
# ============================================================================
Write-SectionHeader "6. Checking Prisma Schema"

Push-Location packages/db

# Validate schema
try {
    $validateOutput = pnpm exec prisma validate 2>&1
    if ($validateOutput -match "is valid") {
        Write-Pass "Prisma schema is valid"
    } elseif ($LASTEXITCODE -eq 0) {
        Write-Pass "Prisma schema is valid"
    } else {
        Write-Fail "Prisma schema validation failed"
        Write-Host "         Output: $validateOutput" -ForegroundColor Gray
    }
} catch {
    Write-Fail "Prisma schema validation failed: $_"
}

# Check for Phase 6 models
$schemaContent = Get-Content prisma/schema.prisma -Raw

if ($schemaContent -match 'model PostTranslation') {
    Write-Pass "PostTranslation model present (Phase 6)"
} else {
    Write-Fail "PostTranslation model missing (Phase 6 not applied)"
}

if ($schemaContent -match 'enum Locale') {
    Write-Pass "Locale enum present (Phase 6)"
} else {
    Write-Fail "Locale enum missing (Phase 6 not applied)"
}

# Check for Phase 8 models
if ($schemaContent -match 'model SocialEmbed') {
    Write-Pass "SocialEmbed model present (Phase 8)"
} else {
    Write-Fail "SocialEmbed model missing (Phase 8 not applied)"
}

# Check for expanded Role enum
if ($schemaContent -match 'enum Role.*AUTHOR' -or ($schemaContent -match 'enum Role' -and $schemaContent -match 'AUTHOR')) {
    Write-Pass "Expanded Role enum present (Phase 6)"
} else {
    Write-Fail "Role enum not expanded (Phase 6 not applied)"
}

Pop-Location

# ============================================================================
# 7. DATABASE CONNECTIVITY
# ============================================================================
Write-SectionHeader "7. Checking Database Connectivity"

# Skip actual connection test to avoid hangs - will be tested during db:push
if (![string]::IsNullOrEmpty($env:DATABASE_URL)) {
    Write-Warn "Database connectivity check skipped (will test during migration)"
    Write-Host "         DATABASE_URL is set - connection will be tested when you run 'pnpm db:push'" -ForegroundColor Gray
} else {
    Write-Warn "DATABASE_URL not set - cannot test database connection"
}

# ============================================================================
# 8. MIGRATION SCRIPTS
# ============================================================================
Write-SectionHeader "8. Checking Migration Scripts"

Push-Location packages/db/scripts

if (Test-Path "backfill-phase6-full.ts") {
    $backfillContent = Get-Content "backfill-phase6-full.ts" -Raw
    if ($backfillContent -match 'Starting Phase 6 Full backfill') {
        Write-Pass "Backfill script looks valid"
    } else {
        Write-Warn "Backfill script may be incomplete"
    }
} else {
    Write-Fail "Backfill script missing"
}

if (Test-Path "verify-post-translations.ts") {
    $verifyContent = Get-Content "verify-post-translations.ts" -Raw
    if ($verifyContent -match 'Starting Phase 6 Full verification') {
        Write-Pass "Verify script looks valid"
    } else {
        Write-Warn "Verify script may be incomplete"
    }
} else {
    Write-Fail "Verify script missing"
}

Pop-Location

# ============================================================================
# 9. BUILD TEST (OPTIONAL)
# ============================================================================
Write-SectionHeader "9. Build Test (Quick Check)"

# Skip build test to avoid hangs - assumes dependencies are installed
Write-Warn "Build test skipped (assumes pnpm install already run)"
Write-Host "         If build issues occur, you'll see them during deployment" -ForegroundColor Gray

# ============================================================================
# 10. DOCUMENTATION
# ============================================================================
Write-SectionHeader "10. Checking Documentation"

if (Test-Path "DEPLOYMENT-RUNBOOK.md") {
    Write-Pass "DEPLOYMENT-RUNBOOK.md present"
} else {
    Write-Fail "DEPLOYMENT-RUNBOOK.md missing"
}

if (Test-Path "RELEASE_NOTES_0.6.1_0.8.0.md") {
    Write-Pass "RELEASE_NOTES_0.6.1_0.8.0.md present"
} else {
    Write-Warn "RELEASE_NOTES_0.6.1_0.8.0.md missing"
}

if (Test-Path "FOLLOW-UP-ISSUES.md") {
    Write-Pass "FOLLOW-UP-ISSUES.md present"
} else {
    Write-Warn "FOLLOW-UP-ISSUES.md missing"
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Pre-Flight Check Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Checks: $Script:Checks"

if ($Script:Errors -eq 0) {
    Write-Host "Errors: 0" -ForegroundColor Green
} else {
    Write-Host "Errors: $Script:Errors" -ForegroundColor Red
}

if ($Script:Warnings -eq 0) {
    Write-Host "Warnings: 0" -ForegroundColor Green
} else {
    Write-Host "Warnings: $Script:Warnings" -ForegroundColor Yellow
}

Write-Host ""

# Final verdict
if ($Script:Errors -eq 0 -and $Script:Warnings -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  SUCCESS: ALL CHECKS PASSED - READY TO DEPLOY" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Review DEPLOYMENT-RUNBOOK.md"
    Write-Host "  2. Run: cd packages/db; pnpm db:push"
    Write-Host "  3. Follow remaining deployment steps"
    exit 0
} elseif ($Script:Errors -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host "  WARNING: REVIEW BEFORE DEPLOYING" -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can proceed, but review warnings above."
    Write-Host "Some features may not work as expected."
    exit 0
} else {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Red
    Write-Host "  ERROR: FIX ISSUES BEFORE DEPLOYING" -ForegroundColor Red
    Write-Host "========================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before deploying."
    Write-Host "See DEPLOYMENT-RUNBOOK.md for troubleshooting."
    exit 1
}

