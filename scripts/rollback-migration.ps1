#Requires -Version 5.1

<#
.SYNOPSIS
    Rolls back a Prisma migration with safety checks.

.DESCRIPTION
    This script helps rollback a Prisma migration by:
    1. Listing recent migrations
    2. Optionally restoring from a backup before rollback
    3. Marking the migration as rolled back using Prisma migrate resolve

.PARAMETER MigrationName
    Required. The name of the migration to rollback (e.g., "202512221438_ticket_search_index").

.PARAMETER RestoreBackup
    Optional. If specified, prompts for a backup file to restore before rollback.

.EXAMPLE
    .\scripts\rollback-migration.ps1 -MigrationName "202512221438_ticket_search_index"
    Rolls back the specified migration after confirmation.

.EXAMPLE
    .\scripts\rollback-migration.ps1 -MigrationName "202512221438_ticket_search_index" -RestoreBackup
    Prompts for backup file and restores it before rolling back the migration.
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$MigrationName,
    
    [switch]$RestoreBackup
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

Write-Info "=== Prisma Migration Rollback ===" -ForegroundColor Cyan
Write-Host ""

# List current migration status
Write-Info "Checking current migration status..."
try {
    $statusOutput = npx prisma migrate status 2>&1 | Out-String
    Write-Host $statusOutput
    
    # Check if migration status command failed
    if ($LASTEXITCODE -ne 0 -and $statusOutput -match "error|Error") {
        Write-Warning "Could not retrieve migration status. Continuing anyway..."
    }
} catch {
    Write-Warning "Could not retrieve migration status: $_"
}

Write-Host ""

# Verify migration name format
if ($MigrationName -notmatch '^\d{14}_') {
    Write-Warning "Migration name doesn't match expected format (YYYYMMDDHHMMSS_name)."
    Write-Warning "Make sure you're using the correct migration name."
    Write-Host ""
}

# Safety check: Confirm rollback
Write-Warning "⚠️  WARNING: This will mark migration '$MigrationName' as rolled back."
Write-Warning "⚠️  Prisma does not automatically reverse migration changes."
Write-Warning "⚠️  You must manually reverse the database changes or restore from backup."
Write-Host ""

$confirmation = Read-Host "Are you sure you want to proceed? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Info "Rollback cancelled."
    exit 0
}

Write-Host ""

# Optional backup restore
if ($RestoreBackup) {
    Write-Info "=== Backup Restore ===" -ForegroundColor Cyan
    Write-Host ""
    
    # Prompt for backup file
    $backupFile = Read-Host "Enter path to backup file (or press Enter to skip)"
    
    if ($backupFile -and (Test-Path $backupFile)) {
        Write-Info "Restoring from backup: $backupFile"
        
        # Parse DATABASE_URL for restore
        try {
            $uri = [System.Uri]$databaseUrl
            $userInfo = $uri.UserInfo -split ":"
            $dbUser = $userInfo[0]
            $dbPassword = if ($userInfo.Length -gt 1) { $userInfo[1] } else { "" }
            $dbHost = $uri.Host
            $dbPort = if ($uri.Port -ne -1) { $uri.Port } else { 5432 }
            $dbName = $uri.AbsolutePath.TrimStart('/')
            
            # Check if pg_restore or psql is available
            $pgRestorePath = Get-Command pg_restore -ErrorAction SilentlyContinue
            $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
            
            if (-not $pgRestorePath -and -not $psqlPath) {
                Write-Error "Neither pg_restore nor psql found. Please install PostgreSQL client tools."
                exit 1
            }
            
            # Set PGPASSWORD
            $env:PGPASSWORD = $dbPassword
            
            try {
                # Determine if backup is compressed or SQL
                $isCompressed = $backupFile -match '\.gz$|\.zip$'
                $isSQL = $backupFile -match '\.sql$'
                
                if ($isCompressed) {
                    Write-Info "Detected compressed backup. Decompressing and restoring..."
                    # For compressed backups, we'd need to decompress first
                    # This is a simplified version - in production, handle different compression formats
                    Write-Warning "Compressed backup restore not fully implemented. Please decompress manually first."
                } elseif ($isSQL -or $pgRestorePath) {
                    if ($isSQL) {
                        # SQL file - use psql
                        Write-Info "Restoring SQL backup using psql..."
                        & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $backupFile
                    } else {
                        # Custom format - use pg_restore
                        Write-Info "Restoring backup using pg_restore..."
                        & pg_restore -h $dbHost -p $dbPort -U $dbUser -d $dbName $backupFile
                    }
                    
                    if ($LASTEXITCODE -ne 0) {
                        throw "Backup restore failed with exit code $LASTEXITCODE"
                    }
                    
                    Write-Success "Backup restored successfully!"
                } else {
                    Write-Error "Unsupported backup format or tools not available."
                    exit 1
                }
            } catch {
                Write-Error "Failed to restore backup: $_"
                exit 1
            } finally {
                $env:PGPASSWORD = $null
            }
            
            Write-Host ""
        } catch {
            Write-Error "Failed to parse DATABASE_URL: $_"
            exit 1
        }
    } else {
        Write-Warning "Backup file not provided or not found. Skipping restore."
        Write-Warning "Make sure you have a backup before proceeding with rollback!"
        Write-Host ""
        
        $continue = Read-Host "Continue without restore? (yes/no)"
        if ($continue -ne "yes") {
            Write-Info "Rollback cancelled."
            exit 0
        }
    }
}

# Mark migration as rolled back
Write-Info "=== Marking Migration as Rolled Back ===" -ForegroundColor Cyan
Write-Host ""

Write-Info "Marking migration '$MigrationName' as rolled back..."
try {
    npx prisma migrate resolve --rolled-back $MigrationName
    
    if ($LASTEXITCODE -ne 0) {
        throw "prisma migrate resolve failed with exit code $LASTEXITCODE"
    }
    
    Write-Success "Migration '$MigrationName' has been marked as rolled back."
    Write-Host ""
    Write-Warning "⚠️  IMPORTANT: The database schema may still contain changes from this migration."
    Write-Warning "⚠️  You must manually reverse the database changes if needed."
    Write-Warning "⚠️  Review the migration file to understand what changes were made:"
    Write-Host "    prisma/migrations/$MigrationName/migration.sql" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Error "Failed to mark migration as rolled back: $_"
    Write-Host ""
    Write-Info "You may need to:"
    Write-Info "1. Manually reverse the database changes"
    Write-Info "2. Run: npx prisma migrate resolve --rolled-back $MigrationName"
    exit 1
}

# Show updated status
Write-Host ""
Write-Info "Checking migration status after rollback..."
try {
    npx prisma migrate status
} catch {
    Write-Warning "Could not retrieve updated migration status."
}

Write-Host ""
Write-Success "Rollback process completed."

exit 0

