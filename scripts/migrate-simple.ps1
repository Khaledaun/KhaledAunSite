# Simple Production Database Migration
Write-Host "Database Migration for Phase 6.5 & 7" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "ERROR: DATABASE_URL not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set it first:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL="postgresql://postgres:password@host:port/database"' -ForegroundColor White
    Write-Host ""
    Write-Host "Get your DATABASE_URL from:" -ForegroundColor Yellow
    Write-Host "  Supabase Dashboard -> Settings -> Database -> Connection string" -ForegroundColor White
    exit 1
}

Write-Host "DATABASE_URL is set" -ForegroundColor Green
Write-Host "Running migration..." -ForegroundColor Yellow
Write-Host ""

# Navigate to db package
Set-Location packages/db

# Run Prisma push
npx prisma db push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Migration completed" -ForegroundColor Green
    Write-Host ""
    Write-Host "What was added:" -ForegroundColor Cyan
    Write-Host "  - MediaAsset table" -ForegroundColor White
    Write-Host "  - AIGeneration table" -ForegroundColor White
    Write-Host "  - URLExtraction table" -ForegroundColor White
    Write-Host "  - Post.featuredImageId column" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ERROR: Migration failed" -ForegroundColor Red
}

# Return to root
Set-Location ../..

