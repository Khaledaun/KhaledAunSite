# ✅ Pre-Flight Validation Scripts - Delivered

**Date:** October 16, 2024  
**Status:** ✅ **COMPLETE**  
**Request:** Option B - Pre-flight validation script

---

## 📦 **WHAT WAS CREATED**

### **4 New Files in `scripts/` Directory**

#### **1. `scripts/pre-flight-check.sh`** (Bash)
- **Platform:** macOS, Linux, WSL on Windows
- **Lines:** ~600 lines
- **Features:**
  - 10 comprehensive validation sections
  - Color-coded output (green ✓, red ✗, yellow ⚠)
  - Detailed error messages with fixes
  - Exit codes for CI/CD integration
  - Masked sensitive data in output

#### **2. `scripts/pre-flight-check.ps1`** (PowerShell)
- **Platform:** Windows (native PowerShell)
- **Lines:** ~550 lines
- **Features:**
  - Same functionality as Bash version
  - Native Windows implementation
  - Works without WSL
  - PowerShell-native output formatting

#### **3. `scripts/README.md`** (Documentation)
- **Purpose:** How to use the scripts
- **Content:**
  - What each script checks
  - Usage instructions (both platforms)
  - Sample output
  - Troubleshooting guide
  - Common errors & fixes
  - CI/CD integration examples

#### **4. `scripts/QUICK-REFERENCE.md`** (Cheat Sheet)
- **Purpose:** One-page command reference for entire deployment
- **Content:**
  - Pre-flight command
  - Environment setup (copy-paste ready)
  - Database migration commands
  - Deployment commands
  - Smoke test procedures
  - Security check curl commands
  - Health check commands
  - Tagging commands
  - Common issues & quick fixes

---

## 🔍 **WHAT THE SCRIPTS VALIDATE**

### **Section 1: System Tools**
- ✅ Node.js (version >= 20)
- ✅ pnpm (package manager)
- ✅ Git (version control)
- ✅ tsx (TypeScript execution)
- ⚠️ curl (for API testing)
- ⚠️ psql (optional, for direct DB testing)

### **Section 2: Environment Variables**
- ✅ DATABASE_URL (with pgbouncer check)
- ✅ DIRECT_URL (with sslmode check)
- ✅ REVALIDATE_SECRET (length validation)
- ✅ PREVIEW_SECRET (length validation)
- ✅ SITE_URL
- ✅ Loads from `.env` file if present

### **Section 3: Git Status**
- ✅ Git repository detected
- ✅ Current branch name
- ✅ Uncommitted changes check
- ✅ Remote tracking status
- ✅ Sync status (ahead/behind/diverged)
- ✅ Last commit info

### **Section 4: Repository Structure**
- ✅ Required directories exist:
  - `packages/db`, `packages/db/prisma`, `packages/db/scripts`
  - `packages/auth`, `packages/utils`
  - `apps/site`, `apps/admin`, `apps/tests`
- ✅ Required files exist:
  - `packages/db/prisma/schema.prisma`
  - `packages/db/seed.ts`
  - `packages/db/scripts/backfill-phase6-full.ts`
  - `packages/db/scripts/verify-post-translations.ts`
  - `packages/auth/permissions.ts`
  - `packages/utils/sanitize.ts`
  - `DEPLOYMENT-RUNBOOK.md`

### **Section 5: Dependencies**
- ✅ Root `node_modules` exists
- ✅ `packages/db/node_modules` exists
- ✅ `sanitize-html` package installed
- ✅ Prisma client generated

### **Section 6: Prisma Schema**
- ✅ Schema syntax validation
- ✅ `PostTranslation` model present (Phase 6)
- ✅ `Locale` enum present (Phase 6)
- ✅ `SocialEmbed` model present (Phase 8)
- ✅ Expanded `Role` enum (AUTHOR, EDITOR, etc.)

### **Section 7: Database Connectivity**
- ✅ Connection test via Prisma
- ⚠️ Timeout handling (10 seconds)

### **Section 8: Migration Scripts**
- ✅ Backfill script present & valid
- ✅ Verify script present & valid

### **Section 9: Build Test**
- ✅ `packages/db` builds successfully
- ⚠️ Timeout handling (30 seconds)

### **Section 10: Documentation**
- ✅ `DEPLOYMENT-RUNBOOK.md` present
- ⚠️ `RELEASE_NOTES_0.6.1_0.8.0.md` present
- ⚠️ `FOLLOW-UP-ISSUES.md` present

---

## 🚀 **HOW TO USE**

### **On Windows (Your Platform)**

**Option 1: PowerShell (Recommended)**
```powershell
# From repo root
.\scripts\pre-flight-check.ps1
```

**Option 2: WSL (if you have it)**
```bash
# From repo root
chmod +x scripts/pre-flight-check.sh
./scripts/pre-flight-check.sh
```

### **What You'll See**

```
╔══════════════════════════════════════════════════════════╗
║  Pre-Flight Deployment Validation                       ║
║  Phase 6 Full + Phase 8 Full                            ║
╚══════════════════════════════════════════════════════════╝

━━━ 1. Checking Required Tools ━━━
✓ Node.js v20.10.0 (>= 20 required)
✓ pnpm 8.15.1
✓ Git 2.43.0
...

━━━ 2. Checking Environment Variables ━━━
✗ DATABASE_URL not set
         Set with: $env:DATABASE_URL='<your-pooled-url>'
...

╔══════════════════════════════════════════════════════════╗
║  Pre-Flight Check Summary                                ║
╚══════════════════════════════════════════════════════════╝

Total Checks: 47
Errors: 2
Warnings: 3

╔════════════════════════════════════════════════════════╗
║  ✗ ERRORS DETECTED - FIX BEFORE DEPLOYING             ║
╚════════════════════════════════════════════════════════╝

Please fix the errors above before deploying.
See DEPLOYMENT-RUNBOOK.md for troubleshooting.
```

### **Exit Codes**

- **Exit 0:** All checks passed (or only warnings) → **READY TO DEPLOY**
- **Exit 1:** Errors detected → **FIX BEFORE DEPLOYING**

### **Interpreting Results**

| Symbol | Meaning | Action |
|--------|---------|--------|
| ✓ Green | Check passed | Continue |
| ✗ Red | Error - must fix | Fix before deploying |
| ⚠ Yellow | Warning - may affect features | Review, can proceed |

---

## 🔧 **BEFORE RUNNING THE SCRIPT**

### **1. Set Up Environment Variables**

Create `packages/db/.env`:

```env
DATABASE_URL="postgresql://user:pass@host.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://user:pass@host.supabase.co:5432/postgres?sslmode=require"
REVALIDATE_SECRET="your-64-character-secret-here-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
PREVIEW_SECRET="your-64-character-secret-here-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
SITE_URL="https://your-production-site.com"
```

**Or export them in your shell:**

```powershell
# PowerShell
$env:DATABASE_URL="postgresql://..."
$env:DIRECT_URL="postgresql://..."
$env:REVALIDATE_SECRET="..."
$env:PREVIEW_SECRET="..."
$env:SITE_URL="https://..."
```

### **2. Install Dependencies**

```bash
pnpm install
```

### **3. Be on Correct Branch**

```bash
git checkout main
git pull origin main
```

---

## ✅ **AFTER RUNNING THE SCRIPT**

### **If All Checks Pass:**
```
╔════════════════════════════════════════════════════════╗
║  ✓ ALL CHECKS PASSED - READY TO DEPLOY                ║
╚════════════════════════════════════════════════════════╝

Next steps:
  1. Review DEPLOYMENT-RUNBOOK.md
  2. Run: cd packages/db && pnpm db:push
  3. Follow remaining deployment steps
```

**You can proceed to:**
1. Open `DEPLOYMENT-RUNBOOK.md`
2. Follow Step 2 (Schema & Data Migration)
3. Continue with deployment

### **If Errors Are Found:**

1. **Read each error message** - they include suggested fixes
2. **Fix the errors** (examples below)
3. **Re-run the script** until clean
4. **Then proceed** with deployment

---

## 🐛 **COMMON ERRORS & FIXES**

### **Error: "DATABASE_URL not set"**

**Fix:**
```powershell
# PowerShell
$env:DATABASE_URL="postgresql://your-supabase-url"

# Or create packages/db/.env
```

### **Error: "pnpm not installed"**

**Fix:**
```powershell
npm install -g pnpm
```

### **Error: "Root node_modules missing"**

**Fix:**
```bash
pnpm install
```

### **Error: "Prisma schema validation failed"**

**Fix:**
```bash
cd packages/db
pnpm exec prisma format
pnpm exec prisma validate
```

### **Error: "sanitize-html not installed"**

**Fix:**
```bash
pnpm install sanitize-html
```

### **Error: "Cannot connect to database"**

**Possible causes:**
1. Wrong credentials in DATABASE_URL
2. Supabase project paused/deleted
3. Network/firewall blocking connection
4. Connection limit reached

**Fix:**
```bash
# Test connection directly
psql "$DATABASE_URL" -c "SELECT version();"

# Or check Supabase dashboard
```

### **Warning: "Uncommitted changes detected"**

**Not an error, but:**
- Review changes with `git status`
- Commit or stash before deploying
- Or proceed if changes are intentional

---

## 🎯 **INTEGRATION WITH YOUR WORKFLOW**

### **Recommended Workflow:**

```
1. Run Pre-Flight Script
   ↓
2. Fix any errors
   ↓
3. Re-run until clean
   ↓
4. Open DEPLOYMENT-RUNBOOK.md
   ↓
5. Keep QUICK-REFERENCE.md open
   ↓
6. Execute deployment steps
```

### **Integration with CI/CD (Future)**

You can add this to GitHub Actions:

```yaml
# .github/workflows/deploy-check.yml
- name: Pre-flight validation
  run: |
    chmod +x scripts/pre-flight-check.sh
    ./scripts/pre-flight-check.sh
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    DIRECT_URL: ${{ secrets.DIRECT_URL }}
    REVALIDATE_SECRET: ${{ secrets.REVALIDATE_SECRET }}
    PREVIEW_SECRET: ${{ secrets.PREVIEW_SECRET }}
    SITE_URL: ${{ secrets.SITE_URL }}
```

---

## 📊 **WHAT'S CHECKED VS. DEPLOYMENT STEPS**

| Deployment Step | Pre-Flight Checks |
|-----------------|-------------------|
| Step 0: Environment Sanity | ✅ Env vars, Vercel access (manual) |
| Step 1: Schema & Migration | ✅ Prisma schema, DB connectivity, scripts |
| Step 2: Deploy | ✅ Git status, build test |
| Step 3: E2E & Smoke | ⚠️ Manual (not automated) |
| Step 4: Security Checks | ⚠️ Manual (requires deployed URLs) |
| Step 5: Health Checks | ⚠️ Manual (requires deployed URLs) |
| Step 6: Tagging | ✅ Git repo status |
| Step 7: Docs Update | ✅ Doc files present |
| Step 8: Follow-up Issues | ✅ Follow-up doc present |

**Key:** ✅ = Automated check | ⚠️ = Manual step (can't automate)

---

## 🎉 **SUMMARY**

**You now have:**

1. ✅ **Bash pre-flight script** (macOS/Linux/WSL)
2. ✅ **PowerShell pre-flight script** (Windows native)
3. ✅ **Script documentation** (README.md)
4. ✅ **Quick reference guide** (QUICK-REFERENCE.md)
5. ✅ **Updated deployment summary** (DEPLOYMENT-READY-SUMMARY.md)

**Total:** 5 new files, ~1,800 lines of automation & documentation

---

## 🚀 **YOUR NEXT ACTION**

**Run the pre-flight script NOW:**

```powershell
# Windows PowerShell (from repo root)
.\scripts\pre-flight-check.ps1
```

**Expected time:** 30-60 seconds

**If you get errors:**
1. Read the error messages
2. Apply the suggested fixes
3. Re-run the script
4. Repeat until clean

**If all checks pass:**
1. Celebrate 🎉
2. Open `DEPLOYMENT-RUNBOOK.md`
3. Proceed with deployment

---

**Document Created:** October 16, 2024  
**Status:** ✅ **READY TO USE**  
**Next Action:** Run `.\scripts\pre-flight-check.ps1`

