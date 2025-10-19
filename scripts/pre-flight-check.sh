#!/bin/bash

# Pre-Flight Deployment Validation Script
# Phase 6 Full + Phase 8 Full
# Version: 1.0
# Date: 2024-10-16

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
CHECKS=0

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Pre-Flight Deployment Validation                       ║${NC}"
echo -e "${BLUE}║  Phase 6 Full + Phase 8 Full                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
    ((CHECKS++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
    ((CHECKS++))
}

section_header() {
    echo ""
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

# ============================================================================
# 1. SYSTEM TOOLS
# ============================================================================
section_header "1. Checking Required Tools"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 20 ]; then
        check_pass "Node.js $NODE_VERSION (>= 20 required)"
    else
        check_fail "Node.js $NODE_VERSION (need >= 20)"
    fi
else
    check_fail "Node.js not installed"
fi

# pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    check_pass "pnpm $PNPM_VERSION"
else
    check_fail "pnpm not installed (run: npm install -g pnpm)"
fi

# Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    check_pass "Git $GIT_VERSION"
else
    check_fail "Git not installed"
fi

# tsx (for running TypeScript)
if command -v tsx &> /dev/null; then
    check_pass "tsx available"
elif pnpm exec tsx --version &> /dev/null; then
    check_pass "tsx available via pnpm"
else
    check_warn "tsx not found globally (will use pnpm exec tsx)"
fi

# curl (for API testing)
if command -v curl &> /dev/null; then
    check_pass "curl available"
else
    check_warn "curl not installed (needed for API testing)"
fi

# psql (optional, for direct DB testing)
if command -v psql &> /dev/null; then
    check_pass "psql available (optional)"
else
    check_warn "psql not installed (optional, for direct DB testing)"
fi

# ============================================================================
# 2. ENVIRONMENT VARIABLES
# ============================================================================
section_header "2. Checking Environment Variables"

# Check if .env file exists
if [ -f "packages/db/.env" ]; then
    check_pass ".env file exists in packages/db/"
    # Source it for checks
    set -a
    source packages/db/.env
    set +a
else
    check_warn ".env file not found in packages/db/ (will use exported vars)"
fi

# DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    check_fail "DATABASE_URL not set"
    echo "         Set with: export DATABASE_URL='<your-pooled-url>'"
else
    # Mask the password
    MASKED_URL=$(echo $DATABASE_URL | sed -E 's/(postgresql:\/\/[^:]+:)[^@]+(@.*)/\1****\2/')
    check_pass "DATABASE_URL set: ${MASKED_URL:0:50}..."
    
    # Check if it contains pgbouncer
    if [[ $DATABASE_URL == *"pgbouncer=true"* ]]; then
        check_pass "DATABASE_URL includes pgbouncer=true"
    else
        check_warn "DATABASE_URL missing pgbouncer=true (add: ?pgbouncer=true&connection_limit=1)"
    fi
    
    # Check SSL mode
    if [[ $DATABASE_URL == *"sslmode=require"* ]]; then
        check_pass "DATABASE_URL includes sslmode=require"
    else
        check_warn "DATABASE_URL missing sslmode=require"
    fi
fi

# DIRECT_URL
if [ -z "$DIRECT_URL" ]; then
    check_fail "DIRECT_URL not set"
    echo "         Set with: export DIRECT_URL='<your-direct-url>'"
else
    MASKED_DIRECT=$(echo $DIRECT_URL | sed -E 's/(postgresql:\/\/[^:]+:)[^@]+(@.*)/\1****\2/')
    check_pass "DIRECT_URL set: ${MASKED_DIRECT:0:50}..."
    
    # Check SSL mode
    if [[ $DIRECT_URL == *"sslmode=require"* ]]; then
        check_pass "DIRECT_URL includes sslmode=require"
    else
        check_warn "DIRECT_URL missing sslmode=require"
    fi
fi

# REVALIDATE_SECRET
if [ -z "$REVALIDATE_SECRET" ]; then
    check_warn "REVALIDATE_SECRET not set (needed for API testing)"
else
    SECRET_LEN=${#REVALIDATE_SECRET}
    if [ $SECRET_LEN -ge 32 ]; then
        check_pass "REVALIDATE_SECRET set (${SECRET_LEN} chars)"
    else
        check_warn "REVALIDATE_SECRET only ${SECRET_LEN} chars (recommend 32+)"
    fi
fi

# PREVIEW_SECRET
if [ -z "$PREVIEW_SECRET" ]; then
    check_warn "PREVIEW_SECRET not set (needed for preview testing)"
else
    SECRET_LEN=${#PREVIEW_SECRET}
    if [ $SECRET_LEN -ge 32 ]; then
        check_pass "PREVIEW_SECRET set (${SECRET_LEN} chars)"
    else
        check_warn "PREVIEW_SECRET only ${SECRET_LEN} chars (recommend 32+)"
    fi
fi

# SITE_URL
if [ -z "$SITE_URL" ]; then
    check_warn "SITE_URL not set"
else
    check_pass "SITE_URL set: $SITE_URL"
fi

# ============================================================================
# 3. GIT STATUS
# ============================================================================
section_header "3. Checking Git Status"

# Check if in git repo
if git rev-parse --git-dir > /dev/null 2>&1; then
    check_pass "Git repository detected"
    
    # Current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    check_pass "Current branch: $CURRENT_BRANCH"
    
    # Uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        check_pass "No uncommitted changes"
    else
        check_warn "Uncommitted changes detected:"
        git status --short | head -5
        if [ $(git status --porcelain | wc -l) -gt 5 ]; then
            echo "         ... and $(( $(git status --porcelain | wc -l) - 5 )) more"
        fi
    fi
    
    # Remote tracking
    if git rev-parse --abbrev-ref --symbolic-full-name @{u} > /dev/null 2>&1; then
        check_pass "Branch tracks remote"
        
        # Check if ahead/behind
        LOCAL=$(git rev-parse @)
        REMOTE=$(git rev-parse @{u})
        BASE=$(git merge-base @ @{u})
        
        if [ $LOCAL = $REMOTE ]; then
            check_pass "Branch up to date with remote"
        elif [ $LOCAL = $BASE ]; then
            check_warn "Branch behind remote (need to pull)"
        elif [ $REMOTE = $BASE ]; then
            check_warn "Branch ahead of remote (will push on deploy)"
        else
            check_warn "Branch diverged from remote"
        fi
    else
        check_warn "Branch doesn't track a remote"
    fi
    
    # Last commit
    LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s" 2>/dev/null)
    if [ ! -z "$LAST_COMMIT" ]; then
        check_pass "Last commit: $LAST_COMMIT"
    fi
else
    check_fail "Not a Git repository"
fi

# ============================================================================
# 4. REPOSITORY STRUCTURE
# ============================================================================
section_header "4. Checking Repository Structure"

# Required directories
declare -a REQUIRED_DIRS=(
    "packages/db"
    "packages/db/prisma"
    "packages/db/scripts"
    "packages/auth"
    "packages/utils"
    "apps/site"
    "apps/admin"
    "apps/tests"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        check_pass "Directory exists: $dir"
    else
        check_fail "Missing directory: $dir"
    fi
done

# Required files
declare -a REQUIRED_FILES=(
    "packages/db/prisma/schema.prisma"
    "packages/db/seed.ts"
    "packages/db/scripts/backfill-phase6-full.ts"
    "packages/db/scripts/verify-post-translations.ts"
    "packages/auth/permissions.ts"
    "packages/utils/sanitize.ts"
    "DEPLOYMENT-RUNBOOK.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "File exists: $file"
    else
        check_fail "Missing file: $file"
    fi
done

# ============================================================================
# 5. DEPENDENCIES
# ============================================================================
section_header "5. Checking Dependencies"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    check_pass "Root node_modules exists"
else
    check_fail "Root node_modules missing (run: pnpm install)"
fi

# Check critical package node_modules
if [ -d "packages/db/node_modules" ]; then
    check_pass "packages/db/node_modules exists"
else
    check_warn "packages/db/node_modules missing"
fi

# Check if sanitize-html is installed
if pnpm list sanitize-html --depth=0 2>/dev/null | grep -q "sanitize-html"; then
    check_pass "sanitize-html package installed"
else
    check_fail "sanitize-html not installed (needed for Phase 8)"
fi

# Check Prisma client
if [ -d "packages/db/node_modules/.prisma" ] || [ -d "node_modules/.prisma" ]; then
    check_pass "Prisma client generated"
else
    check_warn "Prisma client not generated (will generate on db:push)"
fi

# ============================================================================
# 6. PRISMA SCHEMA
# ============================================================================
section_header "6. Checking Prisma Schema"

cd packages/db

# Validate schema
if pnpm exec prisma validate > /dev/null 2>&1; then
    check_pass "Prisma schema is valid"
else
    check_fail "Prisma schema validation failed"
    pnpm exec prisma validate 2>&1 | tail -5
fi

# Check for Phase 6 models
if grep -q "model PostTranslation" prisma/schema.prisma; then
    check_pass "PostTranslation model present (Phase 6)"
else
    check_fail "PostTranslation model missing (Phase 6 not applied)"
fi

if grep -q "enum Locale" prisma/schema.prisma; then
    check_pass "Locale enum present (Phase 6)"
else
    check_fail "Locale enum missing (Phase 6 not applied)"
fi

# Check for Phase 8 models
if grep -q "model SocialEmbed" prisma/schema.prisma; then
    check_pass "SocialEmbed model present (Phase 8)"
else
    check_fail "SocialEmbed model missing (Phase 8 not applied)"
fi

# Check for expanded Role enum
if grep -A 5 "enum Role" prisma/schema.prisma | grep -q "AUTHOR"; then
    check_pass "Expanded Role enum present (Phase 6)"
else
    check_fail "Role enum not expanded (Phase 6 not applied)"
fi

cd ../..

# ============================================================================
# 7. DATABASE CONNECTIVITY
# ============================================================================
section_header "7. Checking Database Connectivity"

if [ ! -z "$DATABASE_URL" ]; then
    # Try to connect via Prisma
    cd packages/db
    if timeout 10 pnpm exec prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        check_pass "Database connection successful (via DATABASE_URL)"
    else
        check_warn "Cannot connect to database (check credentials or network)"
    fi
    cd ../..
else
    check_warn "Skipping database connectivity check (DATABASE_URL not set)"
fi

# ============================================================================
# 8. MIGRATION SCRIPTS
# ============================================================================
section_header "8. Checking Migration Scripts"

# Check if scripts are executable
cd packages/db/scripts

# Check backfill script
if [ -f "backfill-phase6-full.ts" ]; then
    if grep -q "Starting Phase 6 Full backfill" backfill-phase6-full.ts; then
        check_pass "Backfill script looks valid"
    else
        check_warn "Backfill script may be incomplete"
    fi
else
    check_fail "Backfill script missing"
fi

# Check verify script
if [ -f "verify-post-translations.ts" ]; then
    if grep -q "Starting Phase 6 Full verification" verify-post-translations.ts; then
        check_pass "Verify script looks valid"
    else
        check_warn "Verify script may be incomplete"
    fi
else
    check_fail "Verify script missing"
fi

cd ../../..

# ============================================================================
# 9. BUILD TEST (OPTIONAL)
# ============================================================================
section_header "9. Build Test (Quick Check)"

echo "Checking if packages build..."

# Try to build db package
cd packages/db
if timeout 30 pnpm build > /dev/null 2>&1; then
    check_pass "packages/db builds successfully"
else
    check_warn "packages/db build failed or timed out"
fi
cd ../..

# ============================================================================
# 10. DOCUMENTATION
# ============================================================================
section_header "10. Checking Documentation"

# Check deployment docs exist
if [ -f "DEPLOYMENT-RUNBOOK.md" ]; then
    check_pass "DEPLOYMENT-RUNBOOK.md present"
else
    check_fail "DEPLOYMENT-RUNBOOK.md missing"
fi

if [ -f "RELEASE_NOTES_0.6.1_0.8.0.md" ]; then
    check_pass "RELEASE_NOTES_0.6.1_0.8.0.md present"
else
    check_warn "RELEASE_NOTES_0.6.1_0.8.0.md missing"
fi

if [ -f "FOLLOW-UP-ISSUES.md" ]; then
    check_pass "FOLLOW-UP-ISSUES.md present"
else
    check_warn "FOLLOW-UP-ISSUES.md missing"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Pre-Flight Check Summary                                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Total Checks: $CHECKS"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}Errors: 0${NC}"
else
    echo -e "${RED}Errors: $ERRORS${NC}"
fi

if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}Warnings: 0${NC}"
else
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
fi

echo ""

# Final verdict
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ ALL CHECKS PASSED - READY TO DEPLOY                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review DEPLOYMENT-RUNBOOK.md"
    echo "  2. Run: cd packages/db && pnpm db:push"
    echo "  3. Follow remaining deployment steps"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠ WARNINGS PRESENT - REVIEW BEFORE DEPLOYING         ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "You can proceed, but review warnings above."
    echo "Some features may not work as expected."
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ ERRORS DETECTED - FIX BEFORE DEPLOYING             ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please fix the errors above before deploying."
    echo "See DEPLOYMENT-RUNBOOK.md for troubleshooting."
    exit 1
fi

