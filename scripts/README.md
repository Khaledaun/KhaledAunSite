# Deployment Scripts

This directory contains automation and validation scripts for Phase 6 Full + Phase 8 Full deployment.

## Pre-Flight Validation Script

The pre-flight script validates your environment before deployment to catch issues early.

### What It Checks

1. **System Tools** - Node.js (v20+), pnpm, git, tsx, curl
2. **Environment Variables** - DATABASE_URL, DIRECT_URL, secrets
3. **Git Status** - branch, uncommitted changes, sync status
4. **Repository Structure** - all required files and directories
5. **Dependencies** - node_modules, sanitize-html, Prisma client
6. **Prisma Schema** - validation, Phase 6/8 models present
7. **Database Connectivity** - connection test
8. **Migration Scripts** - backfill and verify scripts
9. **Build Test** - quick build check
10. **Documentation** - deployment docs present

### Usage

#### On macOS/Linux/WSL (Bash)

```bash
# Make executable
chmod +x scripts/pre-flight-check.sh

# Run from repo root
./scripts/pre-flight-check.sh
```

#### On Windows (PowerShell)

```powershell
# Run from repo root
.\scripts\pre-flight-check.ps1
```

### Exit Codes

- `0` - All checks passed (or only warnings)
- `1` - Errors detected, fix before deploying

### Sample Output

```
╔══════════════════════════════════════════════════════════╗
║  Pre-Flight Deployment Validation                       ║
║  Phase 6 Full + Phase 8 Full                            ║
╚══════════════════════════════════════════════════════════╝

━━━ 1. Checking Required Tools ━━━
✓ Node.js v20.10.0 (>= 20 required)
✓ pnpm 8.15.1
✓ Git 2.43.0
✓ tsx available
✓ curl available
⚠ psql not installed (optional, for direct DB testing)

━━━ 2. Checking Environment Variables ━━━
✓ .env file exists in packages/db/
✓ DATABASE_URL set: postgresql://postgres:****@aws-0-us-...
✓ DATABASE_URL includes pgbouncer=true
✓ DATABASE_URL includes sslmode=require
✓ DIRECT_URL set: postgresql://postgres:****@aws-0-us-...
✓ DIRECT_URL includes sslmode=require
✓ REVALIDATE_SECRET set (64 chars)
✓ PREVIEW_SECRET set (64 chars)
✓ SITE_URL set: https://khaled-aun.com

...

╔══════════════════════════════════════════════════════════╗
║  Pre-Flight Check Summary                                ║
╚══════════════════════════════════════════════════════════╝

Total Checks: 47
Errors: 0
Warnings: 2

╔════════════════════════════════════════════════════════╗
║  ⚠ WARNINGS PRESENT - REVIEW BEFORE DEPLOYING         ║
╚════════════════════════════════════════════════════════╝

You can proceed, but review warnings above.
Some features may not work as expected.
```

### Troubleshooting

#### "DATABASE_URL not set"

Create a `.env` file in `packages/db/`:

```env
DATABASE_URL="postgresql://user:pass@host/db?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
REVALIDATE_SECRET="your-64-char-secret-here"
PREVIEW_SECRET="your-64-char-secret-here"
SITE_URL="https://your-production-site.com"
```

Or export them:

```bash
# Bash
export DATABASE_URL="postgresql://..."
export DIRECT_URL="postgresql://..."

# PowerShell
$env:DATABASE_URL="postgresql://..."
$env:DIRECT_URL="postgresql://..."
```

#### "Prisma schema validation failed"

```bash
cd packages/db
pnpm exec prisma format
pnpm exec prisma validate
```

#### "Cannot connect to database"

1. Check your Supabase project is running
2. Verify credentials in DATABASE_URL
3. Check network/firewall settings
4. Try direct connection with psql:

```bash
psql "$DATABASE_URL"
```

#### "Missing directory/file"

Ensure you're running from the repo root and all PRs #1-9 have been applied:

```bash
git status
git log --oneline -10
```

#### "sanitize-html not installed"

```bash
pnpm install sanitize-html
```

#### "Root node_modules missing"

```bash
pnpm install
```

### Before Running

1. **Close other DB connections** - Supabase has connection limits
2. **Be on the correct branch** - `main` or your release branch
3. **Pull latest changes** - `git pull origin main`
4. **Have credentials ready** - Supabase URLs, secrets

### After Running

If all checks pass:

1. Open `DEPLOYMENT-RUNBOOK.md`
2. Follow Step 2 (Schema & Data Migration)
3. Continue through remaining deployment steps

If errors are found:

1. Fix each error listed
2. Re-run the pre-flight script
3. Repeat until clean

### Integration with CI/CD

You can run this script in CI before deployment:

```yaml
# .github/workflows/deploy-check.yml
- name: Pre-flight validation
  run: |
    chmod +x scripts/pre-flight-check.sh
    ./scripts/pre-flight-check.sh
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    DIRECT_URL: ${{ secrets.DIRECT_URL }}
    # ... other secrets
```

## Other Scripts (Future)

- `deploy-phase-6-8.sh` - Automated deployment (coming soon)
- `rollback-migration.sh` - Emergency rollback (coming soon)
- `health-check.sh` - Post-deployment verification (coming soon)

## Support

For issues or questions:

1. Check `DEPLOYMENT-RUNBOOK.md` troubleshooting section
2. Review `docs/phase6-full-readiness.md`
3. Check `packages/db/MIGRATION_GUIDE.md`
4. Open a GitHub issue with script output

