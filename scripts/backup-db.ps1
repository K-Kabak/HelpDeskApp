#Requires -Version 5.1

<#
.SYNOPSIS
    Creates a PostgreSQL database backup using pg_dump.

.DESCRIPTION
    This script creates a timestamped backup of the PostgreSQL database specified in DATABASE_URL.
    Supports optional compression and custom output paths.

.PARAMETER OutputPath
    Optional. Directory path where backup files will be saved. Defaults to current directory.

.PARAMETER Compress
    Optional. If specified, compresses the backup using gzip.

.EXAMPLE
    .\scripts\backup-db.ps1
    Creates a backup in the current directory with timestamp.

.EXAMPLE
    .\scripts\backup-db.ps1 -OutputPath "C:\Backups" -Compress
    Creates a compressed backup in C:\Backups directory.
#>

param(
    [string]$OutputPath = ".",
    [switch]$Compress
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

