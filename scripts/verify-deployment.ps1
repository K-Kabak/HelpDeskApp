#Requires -Version 5.1

<#
.SYNOPSIS
    Verifies deployment by checking all dependencies and services.

.DESCRIPTION
    This script verifies that all deployment dependencies are working:
    - Database connection (PostgreSQL via Prisma)
    - Redis connection (via BullMQ)
    - MinIO connection (if configured)
    - Worker health check
    - API health check endpoint

.PARAMETER ApiUrl
    Optional. Base URL for the API health check. Defaults to http://localhost:3000.

.PARAMETER OutputFormat
    Optional. Output format: "json" or "console" (default: "console").

.EXAMPLE
    .\scripts\verify-deployment.ps1
    Runs all checks and displays results in console.

.EXAMPLE
    .\scripts\verify-deployment.ps1 -ApiUrl "https://api.example.com" -OutputFormat "json"
    Runs checks against production API and outputs JSON.
#>

param(
    [string]$ApiUrl = "http://localhost:3000",
    [ValidateSet("json", "console")]
    [string]$OutputFormat = "console"
)

$ErrorActionPreference = "Continue"

# Initialize results object
$results = @{
    timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    checks = @{}
    overall = "unknown"
}

# Function to write colored output
function Write-Info {
    param([string]$Message)
    if ($OutputFormat -eq "console") {
        Write-Host $Message -ForegroundColor Cyan
    }
}

function Write-Success {
    param([string]$Message)
    if ($OutputFormat -eq "console") {
        Write-Host "✓ $Message" -ForegroundColor Green
    }
}

function Write-Error {
    param([string]$Message)
    if ($OutputFormat -eq "console") {
        Write-Host "✗ $Message" -ForegroundColor Red
    }
}

function Write-Warning {
    param([string]$Message)
    if ($OutputFormat -eq "console") {
        Write-Host "⚠ $Message" -ForegroundColor Yellow
    }
}

# Check Database
function Test-Database {
    Write-Info "Checking database connection..."
    
    $check = @{
        name = "database"
        status = "unknown"
        error = $null
    }
    
    try {
        # Check if DATABASE_URL is set
        if (-not $env:DATABASE_URL) {
            throw "DATABASE_URL environment variable is not set"
        }
        
        # Use Prisma to test connection
        # We'll use npx prisma db execute with a simple query
        $query = "SELECT 1 as test"
        $output = npx prisma db execute --stdin 2>&1 | Out-String
        
        # Alternative: try to use prisma migrate status as a connection test
        $statusOutput = npx prisma migrate status 2>&1 | Out-String
        
        if ($LASTEXITCODE -eq 0 -or $statusOutput -notmatch "error|Error|failed|Failed") {
            $check.status = "ok"
            Write-Success "Database connection: OK"
        } else {
            throw "Prisma connection test failed"
        }
    } catch {
        $check.status = "error"
        $check.error = $_.Exception.Message
        Write-Error "Database connection: FAILED - $($_.Exception.Message)"
    }
    
    $results.checks.database = $check
}

# Check Redis
function Test-Redis {
    Write-Info "Checking Redis connection..."
    
    $check = @{
        name = "redis"
        status = "unknown"
        error = $null
    }
    
    try {
        $redisUrl = $env:REDIS_URL
        if (-not $redisUrl) {
            $check.status = "skipped"
            $check.error = "REDIS_URL not configured"
            Write-Warning "Redis: SKIPPED (REDIS_URL not set)"
            $results.checks.redis = $check
            return
        }
        
        # Parse Redis URL
        $uri = [System.Uri]$redisUrl
        $host = $uri.Host
        $port = if ($uri.Port -ne -1) { $uri.Port } else { 6379 }
        
        # Try to connect using redis-cli if available
        $redisCli = Get-Command redis-cli -ErrorAction SilentlyContinue
        
        if ($redisCli) {
            $pingResult = redis-cli -h $host -p $port ping 2>&1
            if ($pingResult -eq "PONG") {
                $check.status = "ok"
                Write-Success "Redis connection: OK"
            } else {
                throw "Redis ping failed: $pingResult"
            }
        } else {
            # Fallback: try to use Node.js to test BullMQ connection
            $testScript = @"
const { Queue } = require('bullmq');
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const queueName = process.env.BULLMQ_QUEUE || 'helpdesk-default';
const prefix = process.env.BULLMQ_PREFIX || 'helpdesk';

const connection = {
    host: new URL(redisUrl).hostname,
    port: parseInt(new URL(redisUrl).port || '6379', 10)
};

const queue = new Queue(queueName, { connection, prefix });

queue.getJobCounts()
    .then(() => {
        console.log('OK');
        queue.close();
        process.exit(0);
    })
    .catch((err) => {
        console.error('ERROR:', err.message);
        queue.close();
        process.exit(1);
    });
"@
            
            $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
            $testScript | Out-File -FilePath $tempFile -Encoding UTF8
            
            try {
                $nodeResult = node $tempFile 2>&1 | Out-String
                Remove-Item $tempFile -Force
                
                if ($nodeResult -match "OK") {
                    $check.status = "ok"
                    Write-Success "Redis connection: OK"
                } else {
                    throw "BullMQ connection test failed: $nodeResult"
                }
            } catch {
                Remove-Item $tempFile -ErrorAction SilentlyContinue
                throw $_.Exception.Message
            }
        }
    } catch {
        $check.status = "error"
        $check.error = $_.Exception.Message
        Write-Error "Redis connection: FAILED - $($_.Exception.Message)"
    }
    
    $results.checks.redis = $check
}

# Check MinIO
function Test-MinIO {
    Write-Info "Checking MinIO connection..."
    
    $check = @{
        name = "minio"
        status = "unknown"
        error = $null
    }
    
    try {
        $minioEndpoint = $env:MINIO_ENDPOINT
        if (-not $minioEndpoint) {
            $check.status = "skipped"
            $check.error = "MINIO_ENDPOINT not configured"
            Write-Warning "MinIO: SKIPPED (MINIO_ENDPOINT not set)"
            $results.checks.minio = $check
            return
        }
        
        # MinIO health endpoint
        $healthUrl = "$($minioEndpoint.TrimEnd('/'))/minio/health/live"
        
        try {
            $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $check.status = "ok"
                Write-Success "MinIO connection: OK"
            } else {
                throw "MinIO health check returned status $($response.StatusCode)"
            }
        } catch {
            throw "Failed to connect to MinIO: $($_.Exception.Message)"
        }
    } catch {
        $check.status = "error"
        $check.error = $_.Exception.Message
        Write-Error "MinIO connection: FAILED - $($_.Exception.Message)"
    }
    
    $results.checks.minio = $check
}

# Check Worker Health
function Test-Worker {
    Write-Info "Checking worker health..."
    
    $check = @{
        name = "worker"
        status = "unknown"
        error = $null
    }
    
    try {
        # Check if worker health script exists
        $workerHealthScript = "src/worker/health.ts"
        if (-not (Test-Path $workerHealthScript)) {
            $check.status = "skipped"
            $check.error = "Worker health script not found"
            Write-Warning "Worker: SKIPPED (health script not found)"
            $results.checks.worker = $check
            return
        }
        
        # Run worker health check
        $healthOutput = pnpm worker:health 2>&1 | Out-String
        
        if ($LASTEXITCODE -eq 0 -and $healthOutput -match '"status"\s*:\s*"ok"') {
            $check.status = "ok"
            Write-Success "Worker health: OK"
        } elseif ($healthOutput -match '"status"\s*:\s*"skip"') {
            $check.status = "skipped"
            $check.error = "Worker health check skipped (dry run or Redis not configured)"
            Write-Warning "Worker: SKIPPED (dry run or Redis not configured)"
        } else {
            throw "Worker health check failed: $healthOutput"
        }
    } catch {
        $check.status = "error"
        $check.error = $_.Exception.Message
        Write-Error "Worker health: FAILED - $($_.Exception.Message)"
    }
    
    $results.checks.worker = $check
}

# Check API Health
function Test-ApiHealth {
    Write-Info "Checking API health endpoint..."
    
    $check = @{
        name = "api"
        status = "unknown"
        error = $null
    }
    
    try {
        $healthUrl = "$($ApiUrl.TrimEnd('/'))/api/health"
        
        try {
            $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            
            if ($response.StatusCode -eq 200) {
                $healthData = $response.Content | ConvertFrom-Json
                
                $check.status = "ok"
                $check.details = @{
                    database = $healthData.database
                    redis = $healthData.redis
                    minio = $healthData.minio
                }
                Write-Success "API health: OK"
                
                if ($OutputFormat -eq "console") {
                    Write-Host "  Database: $(if ($healthData.database) { 'OK' } else { 'FAILED' })" -ForegroundColor $(if ($healthData.database) { "Green" } else { "Red" })
                    if ($null -ne $healthData.redis) {
                        Write-Host "  Redis: $(if ($healthData.redis) { 'OK' } else { 'FAILED' })" -ForegroundColor $(if ($healthData.redis) { "Green" } else { "Red" })
                    }
                    if ($null -ne $healthData.minio) {
                        Write-Host "  MinIO: $(if ($healthData.minio) { 'OK' } else { 'FAILED' })" -ForegroundColor $(if ($healthData.minio) { "Green" } else { "Red" })
                    }
                }
            } elseif ($response.StatusCode -eq 503) {
                $healthData = $response.Content | ConvertFrom-Json
                $check.status = "error"
                $check.error = "API returned 503 (service unavailable)"
                $check.details = $healthData
                Write-Error "API health: FAILED - Service unavailable"
            } else {
                throw "API health check returned status $($response.StatusCode)"
            }
        } catch {
            throw "Failed to connect to API: $($_.Exception.Message)"
        }
    } catch {
        $check.status = "error"
        $check.error = $_.Exception.Message
        Write-Error "API health: FAILED - $($_.Exception.Message)"
    }
    
    $results.checks.api = $check
}

# Main execution
Write-Info "=== Deployment Verification ===" -ForegroundColor Cyan
Write-Host ""

# Run all checks
Test-Database
Test-Redis
Test-MinIO
Test-Worker
Test-ApiHealth

# Calculate overall status
$criticalChecks = @("database", "api")
$allCriticalOk = $true
$hasErrors = $false

foreach ($checkName in $criticalChecks) {
    if ($results.checks[$checkName].status -ne "ok") {
        $allCriticalOk = $false
    }
    if ($results.checks[$checkName].status -eq "error") {
        $hasErrors = $true
    }
}

if ($allCriticalOk) {
    $results.overall = "ok"
} elseif ($hasErrors) {
    $results.overall = "error"
} else {
    $results.overall = "warning"
}

# Output results
Write-Host ""

if ($OutputFormat -eq "json") {
    $results | ConvertTo-Json -Depth 10
} else {
    Write-Info "=== Summary ===" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($checkName in $results.checks.Keys | Sort-Object) {
        $check = $results.checks[$checkName]
        $statusSymbol = switch ($check.status) {
            "ok" { "✓" }
            "error" { "✗" }
            "skipped" { "⊘" }
            default { "?" }
        }
        
        $statusColor = switch ($check.status) {
            "ok" { "Green" }
            "error" { "Red" }
            "skipped" { "Yellow" }
            default { "Gray" }
        }
        
        Write-Host "$statusSymbol $($check.name): $($check.status)" -ForegroundColor $statusColor
        if ($check.error) {
            Write-Host "    $($check.error)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "Overall status: $($results.overall)" -ForegroundColor $(switch ($results.overall) {
        "ok" { "Green" }
        "error" { "Red" }
        default { "Yellow" }
    })
}

# Exit with appropriate code
if ($results.overall -eq "ok") {
    exit 0
} elseif ($results.overall -eq "error") {
    exit 1
} else {
    exit 2
}







