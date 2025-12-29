#Requires -Version 5.1

<#
.SYNOPSIS
    Restores a PostgreSQL database from a backup file with safety checks.

.DESCRIPTION
    This script safely restores a database from a backup file by:
    1. Verifying backup file exists and is valid
    2. Creating a backup of current state before restore
    3. Requiring explicit confirmation (especially in production)
    4. Restoring from backup (SQL or compressed)
    5. Verifying restore success

.PARAMETER BackupFile
    Required. Path to the backup file to restore from (supports .sql, .sql.gz).

.PARAMETER SkipPreRestoreBackup
    Optional. Skip creating backup of current state before restore (not recommended).

.PARAMETER PreRestoreBackupPath
    Optional. Directory path for pre-restore backup. Defaults to "./backups/pre-restore".

.PARAMETER Force
    Optional. Skip confirmation prompt (use with extreme caution).

.EXAMPLE
    .\scripts\restore-database.ps1 -BackupFile "C:\Backups\backup_20240101_120000.sql"
    Restores from backup with confirmation prompt.

.EXAMPLE
    .\scripts\restore-database.ps1 -BackupFile "C:\Backups\backup_20240101_120000.sql.gz" -Force
    Restores from compressed backup without confirmation (dangerous).
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    
    [switch]$SkipPreRestoreBackup,
    [string]$PreRestoreBackupPath = "./backups/pre-restore",
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

# Validate backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found: $BackupFile"
    exit 1
}

$backupFileInfo = Get-Item $BackupFile
if ($backupFileInfo.Length -eq 0) {
    Write-Error "Backup file is empty: $BackupFile"
    exit 1
}

Write-Info "=== Database Restore Script ==="
Write-Host ""
Write-Info "Backup file: $BackupFile"
Write-Info "Backup size: $([math]::Round($backupFileInfo.Length / 1MB, 2)) MB"
Write-Host ""

# Production safety check
if (-not $Force) {
    $nodeEnv = $env:NODE_ENV
    if ($nodeEnv -eq "production") {
        Write-Warning "⚠️  PRODUCTION ENVIRONMENT DETECTED"
        Write-Warning "⚠️  This will OVERWRITE the production database!"
        Write-Warning "⚠️  All current data will be replaced with backup data."
        Write-Host ""
        Write-Host "This action cannot be undone!" -ForegroundColor Red
        Write-Host ""
        $confirmation = Read-Host "Type 'RESTORE' to confirm (case-sensitive)"
        if ($confirmation -ne "RESTORE") {
            Write-Info "Restore cancelled."
            exit 0
        }
        Write-Host ""
    } else {
        $confirmation = Read-Host "Are you sure you want to restore from this backup? (yes/no)"
        if ($confirmation -ne "yes") {
            Write-Info "Restore cancelled."
            exit 0
        }
        Write-Host ""
    }
}

# Parse DATABASE_URL
try {
    $uri = [System.Uri]$databaseUrl
    $userInfo = $uri.UserInfo -split ":"
    $dbUser = $userInfo[0]
    $dbPassword = if ($userInfo.Length -gt 1) { $userInfo[1] } else { "" }
    $dbHost = $uri.Host
    $dbPort = if ($uri.Port -ne -1) { $uri.Port } else { 5432 }
    $dbName = $uri.AbsolutePath.TrimStart('/')
    
    if (-not $dbName) {
        throw "Database name not found in DATABASE_URL"
    }
} catch {
    Write-Error "Failed to parse DATABASE_URL: $_"
    Write-Host "Expected format: postgresql://user:password@host:port/database" -ForegroundColor Yellow
    exit 1
}

# Check if PostgreSQL tools are available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Error "psql command not found. Please ensure PostgreSQL client tools are installed and in PATH."
    exit 1
}

$preRestoreBackupFile = $null

try {
    # Step 1: Create backup of current state
    if (-not $SkipPreRestoreBackup) {
        Write-Info "=== Step 1: Creating Pre-Restore Backup ==="
        Write-Host ""
        
        # Ensure backup directory exists
        if (-not (Test-Path -Path $PreRestoreBackupPath -PathType Container)) {
            try {
                New-Item -ItemType Directory -Path $PreRestoreBackupPath -Force | Out-Null
                Write-Info "Created backup directory: $PreRestoreBackupPath"
            } catch {
                Write-Error "Failed to create backup directory: $_"
                exit 1
            }
        }
        
        # Run backup script
        $backupScript = Join-Path $PSScriptRoot "backup-db.ps1"
        if (Test-Path $backupScript) {
            Write-Info "Creating backup of current database state..."
            & $backupScript -OutputPath $PreRestoreBackupPath -Compress
            
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Pre-restore backup failed, but continuing with restore..."
            } else {
                # Find the backup file that was just created
                $backupFiles = Get-ChildItem -Path $PreRestoreBackupPath -Filter "backup_*.sql*" | Sort-Object LastWriteTime -Descending
                if ($backupFiles.Count -gt 0) {
                    $preRestoreBackupFile = $backupFiles[0].FullName
                    Write-Success "Pre-restore backup created: $preRestoreBackupFile"
                }
            }
        } else {
            Write-Warning "Backup script not found. Skipping pre-restore backup."
        }
        
        Write-Host ""
    } else {
        Write-Warning "Pre-restore backup skipped (--SkipPreRestoreBackup flag used)"
        Write-Host ""
    }
    
    # Step 2: Determine backup format and prepare restore
    Write-Info "=== Step 2: Preparing Restore ==="
    Write-Host ""
    
    $isCompressed = $BackupFile -match '\.gz$'
    $isSQL = $BackupFile -match '\.sql$'
    
    if (-not $isSQL -and -not $isCompressed) {
        Write-Warning "Backup file doesn't have .sql or .sql.gz extension."
        Write-Warning "Assuming SQL format and proceeding..."
    }
    
    Write-Info "Database: $dbName"
    Write-Info "Host: $dbHost:$dbPort"
    Write-Info "Backup format: $(if ($isCompressed) { 'Compressed SQL (gzip)' } else { 'SQL' })"
    Write-Host ""
    
    # Step 3: Restore database
    Write-Info "=== Step 3: Restoring Database ==="
    Write-Host ""
    
    # Set PGPASSWORD environment variable
    $env:PGPASSWORD = $dbPassword
    
    try {
        if ($isCompressed) {
            Write-Info "Decompressing and restoring compressed backup..."
            
            # Check if gzip/gunzip is available
            $gzipPath = Get-Command gzip -ErrorAction SilentlyContinue
            $gunzipPath = Get-Command gunzip -ErrorAction SilentlyContinue
            
            if ($gunzipPath) {
                # Use gunzip to decompress and pipe to psql
                Write-Info "Using gunzip to decompress..."
                $decompressed = gunzip -c $BackupFile | psql -h $dbHost -p $dbPort -U $dbUser -d $dbName
                
                if ($LASTEXITCODE -ne 0) {
                    throw "Restore failed with exit code $LASTEXITCODE"
                }
            } elseif ($gzipPath) {
                # Alternative: use gzip -d to decompress to temp file
                Write-Info "Decompressing to temporary file..."
                $tempFile = [System.IO.Path]::GetTempFileName()
                $tempFile = $tempFile -replace '\.tmp$', '.sql'
                
                try {
                    # Use PowerShell's built-in compression (if available) or external tool
                    $inputStream = [System.IO.File]::OpenRead($BackupFile)
                    $gzipStream = New-Object System.IO.Compression.GzipStream($inputStream, [System.IO.Compression.CompressionMode]::Decompress)
                    $outputStream = [System.IO.File]::Create($tempFile)
                    
                    $gzipStream.CopyTo($outputStream)
                    $gzipStream.Close()
                    $outputStream.Close()
                    $inputStream.Close()
                    
                    Write-Info "Restoring from decompressed file..."
                    & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $tempFile
                    
                    if ($LASTEXITCODE -ne 0) {
                        throw "Restore failed with exit code $LASTEXITCODE"
                    }
                } finally {
                    if (Test-Path $tempFile) {
                        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
                    }
                }
            } else {
                Write-Error "Neither gunzip nor gzip found. Cannot decompress backup file."
                Write-Info "Please install gzip/gunzip or decompress the file manually."
                exit 1
            }
        } else {
            Write-Info "Restoring SQL backup..."
            & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $BackupFile
            
            if ($LASTEXITCODE -ne 0) {
                throw "Restore failed with exit code $LASTEXITCODE"
            }
        }
        
        Write-Success "Database restore completed successfully!"
        Write-Host ""
        
    } catch {
        Write-Error "Restore failed: $_"
        Write-Host ""
        Write-Warning "If pre-restore backup was created, you can restore it using:"
        if ($preRestoreBackupFile) {
            Write-Host "  .\scripts\restore-database.ps1 -BackupFile `"$preRestoreBackupFile`"" -ForegroundColor Gray
        }
        exit 1
    } finally {
        # Clear PGPASSWORD from environment
        $env:PGPASSWORD = $null
    }
    
    # Step 4: Verify restore
    Write-Info "=== Step 4: Verifying Restore ==="
    Write-Host ""
    
    Write-Info "Checking database connection and basic queries..."
    
    # Test database connection
    $env:PGPASSWORD = $dbPassword
    try {
        $testQuery = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $tableCount = $testQuery.Trim()
            Write-Success "Database connection successful. Found $tableCount tables."
        } else {
            Write-Warning "Could not verify table count, but restore completed."
        }
        
        # Check Prisma migration status if available
        $prismaPath = Get-Command npx -ErrorAction SilentlyContinue
        if ($prismaPath) {
            Write-Info "Checking Prisma migration status..."
            $migrationStatus = npx prisma migrate status 2>&1 | Out-String
            Write-Host $migrationStatus
        }
        
    } catch {
        Write-Warning "Verification query failed: $_"
        Write-Warning "Restore may have succeeded, but verification could not complete."
    } finally {
        $env:PGPASSWORD = $null
    }
    
    Write-Host ""
    Write-Success "=== Restore Process Completed Successfully ==="
    if ($preRestoreBackupFile) {
        Write-Info "Pre-restore backup saved at: $preRestoreBackupFile"
    }
    
} catch {
    Write-Host ""
    Write-Error "=== Restore Failed ==="
    Write-Error "Error: $_"
    Write-Host ""
    
    if ($preRestoreBackupFile) {
        Write-Warning "Pre-restore backup is available at: $preRestoreBackupFile"
        Write-Info "You can restore the previous state using:"
        Write-Host "  .\scripts\restore-database.ps1 -BackupFile `"$preRestoreBackupFile`"" -ForegroundColor Gray
    }
    
    exit 1
}

exit 0

