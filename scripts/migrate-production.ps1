#Requires -Version 5.1

<#
.SYNOPSIS
    Runs Prisma migrations in production with automatic backup and rollback on error.

.DESCRIPTION
    This script safely runs database migrations in production by:
    1. Creating a backup before migration
    2. Verifying current migration status
    3. Running prisma migrate deploy (production-safe, no prompts)
    4. Verifying migration success
    5. Automatically rolling back on failure (restores from backup)

.PARAMETER SkipBackup
    Optional. Skip backup creation (not recommended for production).

.PARAMETER BackupPath
    Optional. Directory path for backup files. Defaults to "./backups/pre-migration".

.PARAMETER Force
    Optional. Skip production confirmation prompt (use with caution).

.EXAMPLE
    .\scripts\migrate-production.ps1
    Runs migration with backup and confirmation prompt.

.EXAMPLE
    .\scripts\migrate-production.ps1 -BackupPath "C:\Backups\PreMigration" -Force
    Runs migration with custom backup path and skips confirmation.
#>

param(
    [switch]$SkipBackup,
    [string]$BackupPath = "./backups/pre-migration",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Function to write colored output
function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

# Validate DATABASE_URL environment variable
$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl) {
    Write-Error "DATABASE_URL environment variable is not set."
    Write-Host "Please set DATABASE_URL before running this script." -ForegroundColor Yellow
    exit 1
}

# Check if Prisma CLI is available
$prismaPath = Get-Command npx -ErrorAction SilentlyContinue
if (-not $prismaPath) {
    Write-Error "npx command not found. Please ensure Node.js and npm are installed."
    exit 1
}

Write-Info "=== Production Migration Script ==="
Write-Host ""

# Production safety check
if (-not $Force) {
    $nodeEnv = $env:NODE_ENV
    if ($nodeEnv -eq "production") {
        Write-Warning "⚠️  PRODUCTION ENVIRONMENT DETECTED"
        Write-Warning "⚠️  This will modify the production database."
        Write-Host ""
        $confirmation = Read-Host "Are you sure you want to proceed? (yes/no)"
        if ($confirmation -ne "yes") {
            Write-Info "Migration cancelled."
            exit 0
        }
        Write-Host ""
    }
}

# Variables for backup and rollback
$backupFile = $null
$backupCreated = $false

try {
    # Step 1: Create backup before migration
    if (-not $SkipBackup) {
        Write-Info "=== Step 1: Creating Pre-Migration Backup ==="
        Write-Host ""
        
        # Ensure backup directory exists
        if (-not (Test-Path -Path $BackupPath -PathType Container)) {
            try {
                New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
                Write-Info "Created backup directory: $BackupPath"
            } catch {
                Write-Error "Failed to create backup directory: $_"
                exit 1
            }
        }
        
        # Run backup script
        $backupScript = Join-Path $PSScriptRoot "backup-db.ps1"
        if (-not (Test-Path $backupScript)) {
            Write-Error "Backup script not found: $backupScript"
            exit 1
        }
        
        Write-Info "Running backup script..."
        & $backupScript -OutputPath $BackupPath -Compress
        
        if ($LASTEXITCODE -ne 0) {
            throw "Backup failed with exit code $LASTEXITCODE"
        }
        
        # Find the backup file that was just created
        $backupFiles = Get-ChildItem -Path $BackupPath -Filter "backup_*.sql*" | Sort-Object LastWriteTime -Descending
        if ($backupFiles.Count -gt 0) {
            $backupFile = $backupFiles[0].FullName
            $backupCreated = $true
            Write-Success "Backup created successfully: $backupFile"
        } else {
            Write-Warning "Could not locate backup file, but backup script reported success."
        }
        
        Write-Host ""
    } else {
        Write-Warning "Backup skipped (--SkipBackup flag used)"
        Write-Host ""
    }
    
    # Step 2: Verify current migration status
    Write-Info "=== Step 2: Checking Migration Status ==="
    Write-Host ""
    
    Write-Info "Checking current migration status..."
    $statusOutput = npx prisma migrate status 2>&1 | Out-String
    Write-Host $statusOutput
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Migration status check returned non-zero exit code."
        Write-Warning "This may indicate database connection issues."
        Write-Host ""
        
        $continue = Read-Host "Continue anyway? (yes/no)"
        if ($continue -ne "yes") {
            Write-Info "Migration cancelled."
            exit 0
        }
    }
    
    Write-Host ""
    
    # Step 3: Run migration
    Write-Info "=== Step 3: Running Database Migration ==="
    Write-Host ""
    
    Write-Info "Running: npx prisma migrate deploy"
    Write-Info "This command is production-safe and will not prompt for confirmation."
    Write-Host ""
    
    $migrationOutput = npx prisma migrate deploy 2>&1 | Out-String
    
    if ($LASTEXITCODE -ne 0) {
        throw "Migration failed with exit code $LASTEXITCODE. Output: $migrationOutput"
    }
    
    Write-Host $migrationOutput
    Write-Success "Migration completed successfully!"
    Write-Host ""
    
    # Step 4: Verify migration success
    Write-Info "=== Step 4: Verifying Migration Success ==="
    Write-Host ""
    
    Write-Info "Checking migration status after deployment..."
    $postStatusOutput = npx prisma migrate status 2>&1 | Out-String
    Write-Host $postStatusOutput
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Post-migration status check returned non-zero exit code."
        Write-Warning "This may indicate an issue, but migration may have succeeded."
    } else {
        Write-Success "Migration verification successful!"
    }
    
    Write-Host ""
    Write-Success "=== Migration Process Completed Successfully ==="
    Write-Info "Backup location: $backupFile"
    
} catch {
    Write-Host ""
    Write-Error "=== Migration Failed ==="
    Write-Error "Error: $_"
    Write-Host ""
    
    # Step 5: Automatic rollback on failure
    if ($backupCreated -and $backupFile -and (Test-Path $backupFile)) {
        Write-Warning "=== Attempting Automatic Rollback ==="
        Write-Host ""
        
        Write-Warning "Migration failed. Attempting to restore from backup..."
        Write-Info "Backup file: $backupFile"
        Write-Host ""
        
        # Parse DATABASE_URL for restore
        try {
            $uri = [System.Uri]$databaseUrl
            $userInfo = $uri.UserInfo -split ":"
            $dbUser = $userInfo[0]
            $dbPassword = if ($userInfo.Length -gt 1) { $userInfo[1] } else { "" }
            $dbHost = $uri.Host
            $dbPort = if ($uri.Port -ne -1) { $uri.Port } else { 5432 }
            $dbName = $uri.AbsolutePath.TrimStart('/')
            
            # Check if restore script exists
            $restoreScript = Join-Path $PSScriptRoot "restore-database.ps1"
            if (Test-Path $restoreScript) {
                Write-Info "Using restore script for rollback..."
                Write-Warning "⚠️  This will restore the database to the pre-migration state."
                Write-Host ""
                
                if (-not $Force) {
                    $rollbackConfirm = Read-Host "Proceed with automatic rollback? (yes/no)"
                    if ($rollbackConfirm -ne "yes") {
                        Write-Warning "Rollback cancelled. Manual intervention required."
                        Write-Info "Backup file: $backupFile"
                        exit 1
                    }
                }
                
                # Run restore script
                & $restoreScript -BackupFile $backupFile -Force
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Database restored successfully from backup!"
                } else {
                    Write-Error "Restore failed. Manual intervention required."
                    Write-Info "Backup file: $backupFile"
                    exit 1
                }
            } else {
                Write-Warning "Restore script not found. Manual rollback required."
                Write-Info "Backup file: $backupFile"
                Write-Info "To restore manually, run:"
                Write-Host "  .\scripts\restore-database.ps1 -BackupFile `"$backupFile`"" -ForegroundColor Gray
            }
        } catch {
            Write-Error "Failed to parse DATABASE_URL for rollback: $_"
            Write-Info "Backup file: $backupFile"
            Write-Info "Manual rollback required."
        }
    } else {
        Write-Warning "No backup available for automatic rollback."
        Write-Warning "Manual intervention required."
    }
    
    exit 1
}

exit 0

