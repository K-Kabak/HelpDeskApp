#Requires -Version 5.1

<#
.SYNOPSIS
    Sets up the database for E2E tests by ensuring Docker services are running and database is migrated/seeded.

.DESCRIPTION
    This script prepares the database for E2E tests by:
    1. Checking if Docker Compose services are running
    2. Verifying database connectivity
    3. Running Prisma migrations
    4. Seeding the database with test data

.PARAMETER DatabaseUrl
    Optional. Database connection string. Defaults to postgresql://postgres:postgres@localhost:5432/helpdesk

.EXAMPLE
    .\scripts\setup-e2e-db.ps1
    Sets up the database using default connection string.

.EXAMPLE
    .\scripts\setup-e2e-db.ps1 -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/helpdesk_test"
    Sets up a test database with custom connection string.
#>

param(
    [string]$DatabaseUrl = "postgresql://postgres:postgres@localhost:5432/helpdesk"
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Setting up database for E2E tests..." -ForegroundColor Cyan

# Step 1: Check if Docker Compose is running
Write-Host "`n📦 Checking Docker Compose services..." -ForegroundColor Yellow
try {
    $services = docker compose ps --format json 2>&1 | ConvertFrom-Json
    $dbService = $services | Where-Object { $_.Service -eq "db" -and $_.State -eq "running" }
    
    if (-not $dbService) {
        Write-Host "⚠️  Database service is not running. Starting Docker Compose services..." -ForegroundColor Yellow
        docker compose up -d db
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to start Docker Compose services"
        }
        Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "✅ Database service is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error checking Docker Compose: $_" -ForegroundColor Red
    Write-Host "💡 Make sure Docker Desktop is running and docker-compose.yml exists" -ForegroundColor Yellow
    exit 1
}

# Step 2: Verify database connectivity
Write-Host "`n🔌 Verifying database connectivity..." -ForegroundColor Yellow
$env:DATABASE_URL = $DatabaseUrl

# Try to connect using psql if available, otherwise just proceed
$psqlAvailable = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlAvailable) {
    try {
        $connectionTest = & psql $DatabaseUrl -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database connection successful" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Database connection test failed, but continuing..." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not test database connection with psql, continuing..." -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  psql not available, skipping connection test" -ForegroundColor Gray
}

# Step 3: Run migrations
Write-Host "`n🔄 Running database migrations..." -ForegroundColor Yellow
try {
    $env:DATABASE_URL = $DatabaseUrl
    pnpm prisma:migrate
    if ($LASTEXITCODE -ne 0) {
        throw "Migration failed"
    }
    Write-Host "✅ Migrations completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error running migrations: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Seed database
Write-Host "`n🌱 Seeding database..." -ForegroundColor Yellow
try {
    $env:DATABASE_URL = $DatabaseUrl
    pnpm prisma:seed
    if ($LASTEXITCODE -ne 0) {
        throw "Seeding failed"
    }
    Write-Host "✅ Database seeded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error seeding database: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Database setup complete! Ready for E2E tests." -ForegroundColor Green
Write-Host "💡 You can now run: pnpm test:e2e" -ForegroundColor Cyan

