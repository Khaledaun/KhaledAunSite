# Production Database Migration Script
# This script pulls the DATABASE_URL from Vercel and runs the migration

Write-Host "🚀 Production Database Migration for Phase 6.5 & 7" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Get DATABASE_URL from Vercel
Write-Host "📡 Fetching DATABASE_URL from Vercel..." -ForegroundColor Yellow
Write-Host "   (This will pull from your admin project environment variables)" -ForegroundColor Gray
Write-Host ""

# Navigate to admin directory
Set-Location apps/admin

# Pull environment variable
$envOutput = vercel env pull .env.local 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Environment variables downloaded" -ForegroundColor Green
    Write-Host ""
    
    # Check if .env.local was created
    if (Test-Path .env.local) {
        Write-Host "🔍 Loading DATABASE_URL from .env.local..." -ForegroundColor Yellow
        
        # Read DATABASE_URL from .env.local
        $envContent = Get-Content .env.local -Raw
        if ($envContent -match 'DATABASE_URL=([^\r\n]+)') {
            $databaseUrl = $matches[1]
            $env:DATABASE_URL = $databaseUrl
            
            # Navigate to db package
            Set-Location ../../packages/db
            
            Write-Host "✅ DATABASE_URL loaded" -ForegroundColor Green
            Write-Host ""
            Write-Host "🔄 Running Prisma schema push..." -ForegroundColor Cyan
            Write-Host "   This will sync your production database with the Phase 6.5 & 7 schema" -ForegroundColor Gray
            Write-Host ""
            
            # Run Prisma push
            npx prisma db push
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "📊 What was added:" -ForegroundColor Cyan
                Write-Host "   - MediaAsset table (for media library)" -ForegroundColor White
                Write-Host "   - AIGeneration table (for AI tracking)" -ForegroundColor White
                Write-Host "   - URLExtraction table (for URL imports)" -ForegroundColor White
                Write-Host "   - Post.featuredImageId column" -ForegroundColor White
                Write-Host ""
                Write-Host "🎯 Next steps:" -ForegroundColor Cyan
                Write-Host "   1. Set up Supabase Storage (run the SQL in packages/db/sql/phase6.5-storage-setup.sql)" -ForegroundColor White
                Write-Host "   2. Add OPENAI_API_KEY to Vercel environment variables" -ForegroundColor White
                Write-Host "   3. Test media upload in admin dashboard" -ForegroundColor White
                Write-Host "   4. Test AI features in admin dashboard" -ForegroundColor White
            } else {
                Write-Host ""
                Write-Host "❌ Migration failed. Check the error above." -ForegroundColor Red
                Write-Host ""
                Write-Host "💡 Common issues:" -ForegroundColor Yellow
                Write-Host "   - Database is not accessible from your IP" -ForegroundColor White
                Write-Host "   - DATABASE_URL is incorrect" -ForegroundColor White
                Write-Host "   - Schema conflicts (tables already exist)" -ForegroundColor White
            }
            
            # Clean up .env.local
            Set-Location ../../apps/admin
            Remove-Item .env.local -ErrorAction SilentlyContinue
            Write-Host ""
            Write-Host "🧹 Cleaned up temporary .env.local file" -ForegroundColor Gray
            
        } else {
            Write-Host "❌ DATABASE_URL not found in .env.local" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ .env.local file was not created" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Failed to pull environment variables from Vercel" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure you're logged in to Vercel:" -ForegroundColor Yellow
    Write-Host "   vercel login" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 And link this project:" -ForegroundColor Yellow
    Write-Host "   vercel link" -ForegroundColor White
}

# Return to root
Set-Location ../..

