# Deployment Fix Log

## Problem Summary
Admin app deployment on Vercel fails with "Module not found: Can't resolve '@khaledaun/db'" error during Next.js build, despite successful npm install.

## Root Cause
The monorepo structure uses workspace packages (`@khaledaun/auth`, `@khaledaun/db`, etc.) that reference each other. During Vercel build:
1. npm install works fine (packages are symlinked)
2. Next.js webpack compilation fails because it can't resolve the internal workspace package references

## Attempted Solutions

### Attempt 1-5: Various npm configurations
- Added direct dependencies to admin app
- Modified workspace package dependencies  
- **Result**: Module not found errors persist

### Attempt 6-7: Next.js and webpack configuration
- Added `transpilePackages` for workspace packages
- Configured webpack to resolve from monorepo root
- Added Prisma client alias
- **Result**: Module not found errors persist

### Attempt 8: Workspace package dependency fixes
- Added @prisma/client to packages/auth
- Added peerDependencies to packages/db
- **Result**: Module not found errors persist

### Attempt 9: pnpm
- Switched to pnpm (designed for monorepos)
- **Result**: Registry errors (ERR_INVALID_THIS) on Vercel

### Attempt 10: npm with workspace: protocol
- Used `workspace:*` protocol
- **Result**: npm doesn't support workspace: protocol (pnpm-specific)

### Attempt 11: npm with file: protocol + root install
- Install from root first: `npm install --prefix ../..`
- Then install in admin: `npm install`
- **Result**: Still getting module not found errors

## Analysis

The fundamental issue is that **webpack/Next.js can't resolve transitive dependencies in a monorepo with file: protocol packages**. When `packages/auth/index.ts` imports from `@khaledaun/db`, webpack doesn't know how to resolve it because:

1. `@khaledaun/db` is a symbolic link (file: protocol)
2. Webpack's module resolution doesn't follow the symlink chain properly
3. The `transpilePackages` config helps but doesn't solve the transitive dependency problem

## Recommended Solutions

### Option A: Flatten the dependencies (RECOMMENDED)
Remove internal package dependencies and inline the code:
- Copy `packages/auth`, `packages/db`, etc. directly into `apps/admin/lib/`
- Remove `@khaledaun/*` dependencies
- Update imports to use relative paths

**Pros**: 
- Guaranteed to work
- Simple and reliable
- No monorepo complexity for Vercel

**Cons**: 
- Code duplication
- Need to sync changes manually

### Option B: Use Turborepo
Set up Turborepo properly with build outputs:
- Configure Turborepo to build packages first
- Have each package output a dist/ folder
- Import from compiled outputs instead of source

**Pros**: 
- Proper monorepo setup
- No code duplication

**Cons**: 
- More complex setup
- Requires significant refactoring

### Option C: Deploy from a separate branch with flattened structure
Create a deployment branch where workspace packages are pre-bundled:
- Use a build script to bundle workspace packages
- Deploy branch has no workspace dependencies
- Main branch keeps monorepo structure

**Pros**: 
- Clean separation of dev and deploy
- Maintains monorepo for development

**Cons**: 
- Additional CI/CD complexity
- Need to manage deployment branch

## Decision

Given time constraints and the need to get production deployed, **Option A (flatten dependencies)** is the most practical immediate solution. We can refactor to Option B later as a Phase 6.5 improvement.

## Current Status (Commit eeb05a6)

- ❌ Build failing with "Module not found: Can't resolve '@khaledaun/db'"
- ✅ npm install succeeds
- ✅ Prisma generate succeeds
- ❌ Next.js build fails during webpack compilation

## Next Steps

1. Implement Option A: Flatten dependencies for admin app
2. Document the approach in README
3. Add to backlog: Refactor to Turborepo (Phase 6.5 or Phase 10)
