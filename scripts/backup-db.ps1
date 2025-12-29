#Requires -Version 5.1

<#
.SYNOPSIS
    Creates a PostgreSQL database backup using pg_dump with optional MinIO backup and retention policy.

.DESCRIPTION
    This script creates a timestamped backup of the PostgreSQL database specified in DATABASE_URL.
    Supports optional compression, MinIO object storage backup, retention policy, and verification.

.PARAMETER OutputPath
    Optional. Directory path where backup files will be saved. Defaults to current directory.

.PARAMETER Compress
    Optional. If specified, compresses the backup using gzip.

.PARAMETER RetentionDays
    Optional. Number of days to retain backups. Backups older than this will be deleted. Defaults to no retention.

.PARAMETER BackupMinIO
    Optional. If specified and MINIO_ENDPOINT is set, uploads backup to MinIO object storage.

.PARAMETER Verify
    Optional. If specified, verifies backup integrity by checking file size and basic SQL structure.

.EXAMPLE
    .\scripts\backup-db.ps1
    Creates a backup in the current directory with timestamp.

.EXAMPLE
    .\scripts\backup-db.ps1 -OutputPath "C:\Backups" -Compress -RetentionDays 30
    Creates a compressed backup and removes backups older than 30 days.

.EXAMPLE
    .\scripts\backup-db.ps1 -OutputPath "C:\Backups" -Compress -BackupMinIO -Verify
    Creates a compressed backup, uploads to MinIO, and verifies integrity.
#>

param(
    [string]$OutputPath = ".",
    [switch]$Compress,
    [int]$RetentionDays = 0,
    [switch]$BackupMinIO,
    [switch]$Verify
)

$ErrorActionPreference = "Stop"

# Function to write colored output
function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Error {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
}

# Validate DATABASE_URL environment variable
$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl) {
    Write-Error "DATABASE_URL environment variable is not set."
    Write-Host "Please set DATABASE_URL before running this script." -ForegroundColor Yellow
    exit 1
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

# Validate output path
if (-not (Test-Path -Path $OutputPath -PathType Container)) {
    try {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
        Write-Info "Created output directory: $OutputPath"
    } catch {
        Write-Error "Failed to create output directory: $_"
        exit 1
    }
}

# Check if pg_dump is available
$pgDumpPath = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDumpPath) {
    Write-Error "pg_dump command not found. Please ensure PostgreSQL client tools are installed and in PATH."
    exit 1
}

# Generate timestamped filename
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFileName = "backup_${dbName}_${timestamp}.sql"
$backupPath = Join-Path $OutputPath $backupFileName

# If compression is enabled, add .gz extension
if ($Compress) {
    $backupPath = "${backupPath}.gz"
}

Write-Info "Starting database backup..."
Write-Info "Database: $dbName"
Write-Info "Host: $dbHost:$dbPort"
Write-Info "Output: $backupPath"

# Set PGPASSWORD environment variable for pg_dump
$env:PGPASSWORD = $dbPassword

try {
    # Build pg_dump command
    $pgDumpArgs = @(
        "-h", $dbHost,
        "-p", $dbPort.ToString(),
        "-U", $dbUser,
        "-d", $dbName,
        "-F", "p",  # Plain text format
        "--no-owner",
        "--no-privileges",
        "-f", $backupPath
    )
    
    # If compression is enabled, pipe through gzip
    if ($Compress) {
        $tempFile = "${backupPath}.tmp"
        $pgDumpArgs[-1] = $tempFile  # Change output to temp file
        
        Write-Info "Running pg_dump (will compress after dump)..."
        & pg_dump $pgDumpArgs
        
        if ($LASTEXITCODE -ne 0) {
            throw "pg_dump failed with exit code $LASTEXITCODE"
        }
        
        # Compress the backup
        Write-Info "Compressing backup..."
        $inputStream = [System.IO.File]::OpenRead($tempFile)
        $outputStream = [System.IO.File]::Create($backupPath)
        $gzipStream = New-Object System.IO.Compression.GzipStream($outputStream, [System.IO.Compression.CompressionMode]::Compress)
        
        $inputStream.CopyTo($gzipStream)
        $gzipStream.Close()
        $outputStream.Close()
        $inputStream.Close()
        
        # Remove temp file
        Remove-Item $tempFile -Force
        
        Write-Success "Backup compressed successfully"
    } else {
        Write-Info "Running pg_dump..."
        & pg_dump $pgDumpArgs
        
        if ($LASTEXITCODE -ne 0) {
            throw "pg_dump failed with exit code $LASTEXITCODE"
        }
    }
    
    # Verify backup file exists and has content
    if (-not (Test-Path $backupPath)) {
        throw "Backup file was not created"
    }
    
    $fileInfo = Get-Item $backupPath
    if ($fileInfo.Length -eq 0) {
        throw "Backup file is empty"
    }
    
    Write-Success "Backup completed successfully!"
    Write-Info "Backup file: $backupPath"
    Write-Info "Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB"
    Write-Host ""
    
    # Step: Verify backup (if requested)
    if ($Verify) {
        Write-Info "=== Verifying Backup Integrity ==="
        Write-Host ""
        
        try {
            # Check file size is reasonable (not empty, not suspiciously small)
            if ($fileInfo.Length -lt 1024) {
                Write-Warning "Backup file is very small ($($fileInfo.Length) bytes). This may indicate an issue."
            } else {
                Write-Success "Backup file size check passed"
            }
            
            # For SQL files, check if it starts with PostgreSQL dump header
            if (-not $Compress) {
                $header = Get-Content $backupPath -TotalCount 5 -ErrorAction SilentlyContinue
                if ($header -match "PostgreSQL database dump") {
                    Write-Success "Backup file format verification passed"
                } else {
                    Write-Warning "Backup file doesn't appear to have PostgreSQL dump header"
                }
            } else {
                Write-Info "Compressed backup - skipping header check (would require decompression)"
            }
            
            Write-Success "Backup verification completed"
            Write-Host ""
        } catch {
            Write-Warning "Backup verification encountered an error: $_"
            Write-Warning "Backup file was created, but verification could not complete"
            Write-Host ""
        }
    }
    
    # Step: Upload to MinIO (if requested and configured)
    if ($BackupMinIO) {
        Write-Info "=== Uploading to MinIO ==="
        Write-Host ""
        
        $minioEndpoint = $env:MINIO_ENDPOINT
        $minioAccessKey = $env:MINIO_ACCESS_KEY
        $minioSecretKey = $env:MINIO_SECRET_KEY
        $minioBucket = $env:MINIO_BUCKET
        
        if (-not $minioEndpoint) {
            Write-Warning "MINIO_ENDPOINT not set. Skipping MinIO backup."
            Write-Host ""
        } elseif (-not $minioAccessKey -or -not $minioSecretKey) {
            Write-Warning "MINIO_ACCESS_KEY or MINIO_SECRET_KEY not set. Skipping MinIO backup."
            Write-Host ""
        } else {
            try {
                # Check if MinIO client (mc) is available
                $mcPath = Get-Command mc -ErrorAction SilentlyContinue
                
                if ($mcPath) {
                    Write-Info "Using MinIO client (mc) for upload..."
                    
                    # Configure MinIO alias if not already configured
                    $aliasName = "backup-alias"
                    $mcAliasCheck = mc alias list 2>&1 | Select-String $aliasName
                    
                    if (-not $mcAliasCheck) {
                        Write-Info "Configuring MinIO alias..."
                        mc alias set $aliasName $minioEndpoint $minioAccessKey $minioSecretKey 2>&1 | Out-Null
                    }
                    
                    # Determine bucket name
                    if (-not $minioBucket) {
                        $minioBucket = "helpdesk-backups"
                        Write-Info "Using default bucket name: $minioBucket"
                    }
                    
                    # Create bucket if it doesn't exist
                    mc mb "$aliasName/$minioBucket" --ignore-existing 2>&1 | Out-Null
                    
                    # Upload backup file
                    $minioPath = "$aliasName/$minioBucket/$(Split-Path $backupFileName -Leaf)"
                    Write-Info "Uploading to MinIO: $minioPath"
                    
                    mc cp $backupPath $minioPath 2>&1 | Out-String | ForEach-Object {
                        if ($_ -match "error|Error|ERROR") {
                            Write-Error $_
                        } else {
                            Write-Info $_
                        }
                    }
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Success "Backup uploaded to MinIO successfully!"
                        Write-Info "MinIO path: $minioPath"
                    } else {
                        throw "MinIO upload failed with exit code $LASTEXITCODE"
                    }
                } else {
                    # Fallback: Use PowerShell to upload via S3 API (if AWS SDK or similar is available)
                    Write-Warning "MinIO client (mc) not found. MinIO upload requires 'mc' command."
                    Write-Info "Install MinIO client from: https://min.io/docs/minio/linux/reference/minio-mc.html"
                    Write-Info "Or use AWS CLI with S3-compatible endpoint"
                }
                
                Write-Host ""
            } catch {
                Write-Warning "MinIO backup failed: $_"
                Write-Warning "Local backup was successful, but MinIO upload failed."
                Write-Host ""
            }
        }
    }
    
    # Step: Apply retention policy (if specified)
    if ($RetentionDays -gt 0) {
        Write-Info "=== Applying Retention Policy ==="
        Write-Host ""
        
        try {
            $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
            Write-Info "Removing backups older than $RetentionDays days (before $($cutoffDate.ToString('yyyy-MM-dd')))..."
            
            $oldBackups = Get-ChildItem -Path $OutputPath -Filter "backup_*.sql*" | 
                Where-Object { $_.LastWriteTime -lt $cutoffDate }
            
            if ($oldBackups.Count -gt 0) {
                $totalSize = ($oldBackups | Measure-Object -Property Length -Sum).Sum
                Write-Info "Found $($oldBackups.Count) backup(s) to remove ($([math]::Round($totalSize / 1MB, 2)) MB)"
                
                foreach ($oldBackup in $oldBackups) {
                    Remove-Item $oldBackup.FullName -Force
                    Write-Info "Removed: $($oldBackup.Name)"
                }
                
                Write-Success "Retention policy applied. Removed $($oldBackups.Count) old backup(s)."
            } else {
                Write-Info "No backups older than $RetentionDays days found."
            }
            
            Write-Host ""
        } catch {
            Write-Warning "Retention policy application failed: $_"
            Write-Warning "Backup was successful, but old backups were not cleaned up."
            Write-Host ""
        }
    }
    
} catch {
    Write-Error "Backup failed: $_"
    
    # Clean up partial backup file if it exists
    if (Test-Path $backupPath) {
        Remove-Item $backupPath -Force
        Write-Info "Removed partial backup file"
    }
    
    exit 1
} finally {
    # Clear PGPASSWORD from environment
    $env:PGPASSWORD = $null
}

exit 0

