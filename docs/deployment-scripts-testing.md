# Deployment Scripts Testing Guide

**Last Updated:** 2025-01-27  
**Purpose:** Guide for testing deployment scripts in staging environment

This document describes the testing procedures for deployment scripts to ensure they work correctly before using them in production.

## Available Deployment Scripts

The following deployment scripts are available in the `scripts/` directory:

1. **`migrate-production.ps1`** - Database migration script with automatic backup and rollback
2. **`rollback-migration.ps1`** - Migration rollback script
3. **`verify-deployment.ps1`** - Comprehensive deployment verification script
4. **`backup-db.ps1`** - Database backup script
5. **`restore-database.ps1`** - Database restore script

## Testing Environment Setup

### Prerequisites

Before testing deployment scripts in staging:

1. **Staging Environment**: A staging environment that mirrors production
2. **Database Access**: Access to staging database with appropriate permissions
3. **Backup Storage**: Sufficient storage space for backup files
4. **Network Access**: Access to staging database, Redis, MinIO (if applicable)
5. **PowerShell**: PowerShell 5.1+ on Windows or PowerShell Core on Linux/Mac

### Staging Environment Requirements

The staging environment should match production as closely as possible:

- ✅ Same database version (PostgreSQL 16+)
- ✅ Same database schema (up-to-date migrations)
- ✅ Same environment variables structure
- ✅ Same backup/restore infrastructure
- ✅ Same network configuration

### Environment Variables

Set the following environment variables in staging:

```powershell
# Database
$env:DATABASE_URL = "postgresql://user:password@staging-db-host:5432/helpdesk_staging"

# NextAuth
$env:NEXTAUTH_SECRET = "staging-secret-key-32-chars-min"
$env:NEXTAUTH_URL = "https://staging.example.com"

# Node Environment
$env:NODE_ENV = "staging"  # or "production" for production-like testing

# Optional: Redis (if using worker)
$env:REDIS_URL = "redis://staging-redis-host:6379"

# Optional: MinIO (if using object storage)
$env:MINIO_ENDPOINT = "http://staging-minio:9000"
```

## Script Testing Procedures

### 1. Database Backup Script (`backup-db.ps1`)

#### Test Procedure

```powershell
# 1. Test basic backup
.\scripts\backup-db.ps1 -OutputPath ".\test-backups" -Compress

# 2. Verify backup file was created
Get-ChildItem ".\test-backups" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# 3. Verify backup file is not empty
$backupFile = Get-ChildItem ".\test-backups\backup_*.sql*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($backupFile.Length -gt 0) {
    Write-Host "✅ Backup file created successfully: $($backupFile.FullName)"
} else {
    Write-Host "❌ Backup file is empty"
    exit 1
}

# 4. Test backup restoration (see restore script testing)
```

#### Success Criteria

- [x] Backup script runs without errors
- [x] Backup file is created in specified directory
- [x] Backup file is not empty
- [x] Backup file can be restored (test with restore script)
- [x] Compressed backup works (if -Compress flag used)

#### Common Issues

- **Permission Errors**: Ensure database user has backup permissions
- **Disk Space**: Verify sufficient disk space for backup files
- **Network Timeout**: Check database connectivity and network stability

### 2. Database Restore Script (`restore-database.ps1`)

#### Test Procedure

```powershell
# 1. Create a test backup first
.\scripts\backup-db.ps1 -OutputPath ".\test-backups"
$backupFile = Get-ChildItem ".\test-backups\backup_*.sql*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# 2. Create a test table to verify restoration
# Connect to database and create test data
# Then restore from backup

# 3. Test restore
.\scripts\restore-database.ps1 -BackupFile $backupFile.FullName -Force

# 4. Verify database state matches backup
# Connect to database and verify test table is restored
```

#### Success Criteria

- [x] Restore script runs without errors
- [x] Database is restored from backup
- [x] All tables and data are restored correctly
- [x] Migration state is preserved (verify with `npx prisma migrate status`)

#### Common Issues

- **Connection Errors**: Verify DATABASE_URL is correct
- **Permission Errors**: Ensure database user has restore permissions
- **Schema Conflicts**: Ensure database schema matches backup

**⚠️ Warning**: Restoring a database will overwrite existing data. Always test in staging environment.

### 3. Migration Script (`migrate-production.ps1`)

#### Test Procedure

```powershell
# 1. Check current migration status
npx prisma migrate status

# 2. Create a test migration (if needed)
# Create a new migration that can be safely applied and rolled back
# Example: Add a test column to a table

# 3. Test migration with backup
.\scripts\migrate-production.ps1 -BackupPath ".\test-backups\pre-migration"

# 4. Verify migration was applied
npx prisma migrate status

# 5. Test rollback (see rollback script testing)

# 6. Restore from backup if needed
$backupFile = Get-ChildItem ".\test-backups\pre-migration\backup_*.sql*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
.\scripts\restore-database.ps1 -BackupFile $backupFile.FullName -Force
```

#### Success Criteria

- [x] Migration script runs without errors
- [x] Backup is created before migration
- [x] Migration is applied successfully
- [x] Migration status shows migration as applied
- [x] Database schema is updated correctly
- [x] Application continues to work after migration

#### Testing Migration Rollback

```powershell
# 1. Apply a test migration
.\scripts\migrate-production.ps1

# 2. Simulate migration failure by manually corrupting database
# (DO NOT do this in production - only in staging testing)

# 3. Verify automatic rollback triggers (if implemented)
# OR manually restore from backup:
$backupFile = Get-ChildItem ".\test-backups\pre-migration\backup_*.sql*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
.\scripts\restore-database.ps1 -BackupFile $backupFile.FullName -Force
```

#### Common Issues

- **Migration Conflicts**: Ensure no conflicting migrations exist
- **Database Lock**: Ensure no other processes are using the database
- **Permission Errors**: Ensure database user has migration permissions
- **Schema Validation**: Verify Prisma schema matches database after migration

### 4. Rollback Script (`rollback-migration.ps1`)

#### Test Procedure

```powershell
# 1. Apply a test migration first
.\scripts\migrate-production.ps1

# 2. Note the migration name from migrate status
npx prisma migrate status

# 3. Test rollback with migration name
.\scripts\rollback-migration.ps1 -MigrationName "20250127120000_test_migration"

# 4. Verify migration is marked as rolled back
npx prisma migrate status

# 5. Test rollback with backup restore
.\scripts\rollback-migration.ps1 -MigrationName "20250127120000_test_migration" -RestoreBackup
# When prompted, provide path to backup file
```

#### Success Criteria

- [x] Rollback script runs without errors
- [x] Migration is marked as rolled back
- [x] Migration status reflects rollback state
- [x] Backup restore works (if -RestoreBackup flag used)
- [x] Application continues to work after rollback

#### Common Issues

- **Migration Name Format**: Ensure migration name matches format (YYYYMMDDHHMMSS_name)
- **Manual Schema Changes**: Remember that Prisma doesn't automatically reverse schema changes
- **Backup Availability**: Ensure backup file exists if using -RestoreBackup

**⚠️ Important**: Prisma's `migrate resolve --rolled-back` only marks a migration as rolled back. It does NOT automatically reverse the database schema changes. You must manually reverse the changes or restore from backup.

### 5. Deployment Verification Script (`verify-deployment.ps1`)

#### Test Procedure

```powershell
# 1. Test with default settings (localhost:3000)
.\scripts\verify-deployment.ps1

# 2. Test with custom API URL
.\scripts\verify-deployment.ps1 -ApiUrl "https://staging.example.com"

# 3. Test with JSON output
.\scripts\verify-deployment.ps1 -OutputFormat "json"

# 4. Test individual checks by inspecting script output
```

#### Success Criteria

- [x] All checks pass (database, Redis, MinIO, worker, API)
- [x] Script returns appropriate exit codes (0 for success, 1 for error, 2 for warning)
- [x] JSON output is valid (if using -OutputFormat "json")
- [x] All service connectivity checks work correctly
- [x] Health endpoint is accessible and returns correct status

#### Expected Output

```
=== Deployment Verification ===

Checking database connection...
✓ Database connection: OK
Checking Redis connection...
✓ Redis connection: OK
Checking MinIO connection...
✓ MinIO connection: OK
Checking worker health...
✓ Worker health: OK
Checking API health endpoint...
✓ API health: OK
  Database: OK
  Redis: OK
  MinIO: OK

=== Summary ===

✓ database: ok
✓ redis: ok
✓ minio: ok
✓ worker: ok
✓ api: ok

Overall status: ok
```

#### Common Issues

- **Connection Failures**: Verify all services are running and accessible
- **Environment Variables**: Ensure all required environment variables are set
- **Network Access**: Verify network connectivity to all services
- **Health Endpoint**: Ensure application is running and health endpoint is accessible

## End-to-End Testing Scenario

### Complete Deployment Flow Test

Test the complete deployment flow in staging:

```powershell
# 1. Pre-deployment verification
.\scripts\verify-deployment.ps1 -ApiUrl "https://staging.example.com"

# 2. Create backup before deployment
.\scripts\backup-db.ps1 -OutputPath ".\staging-backups\pre-deployment"

# 3. Run migrations
.\scripts\migrate-production.ps1 -BackupPath ".\staging-backups\pre-migration"

# 4. Post-deployment verification
.\scripts\verify-deployment.ps1 -ApiUrl "https://staging.example.com"

# 5. Smoke test application
# - Login
# - Create ticket
# - View ticket
# - Add comment
# - Verify all features work

# 6. If issues occur, rollback:
#    a. Restore from backup
#    .\scripts\restore-database.ps1 -BackupFile ".\staging-backups\pre-migration\backup_*.sql"
#    b. OR mark migration as rolled back
#    .\scripts\rollback-migration.ps1 -MigrationName "migration_name"
```

## Testing Checklist

Before considering deployment scripts ready for production:

### Backup/Restore Scripts

- [ ] Backup script creates valid backup files
- [ ] Backup files can be restored successfully
- [ ] Restored database matches original state
- [ ] Backup compression works (if applicable)
- [ ] Backup script handles errors gracefully
- [ ] Restore script handles errors gracefully
- [ ] Backup script works with production-sized databases

### Migration Scripts

- [ ] Migration script creates backup before migration
- [ ] Migration script applies migrations successfully
- [ ] Migration script verifies migration success
- [ ] Migration script handles migration failures
- [ ] Migration script can rollback on failure (if implemented)
- [ ] Rollback script marks migrations as rolled back correctly
- [ ] Rollback script restores from backup correctly
- [ ] Migration scripts work with production-sized databases
- [ ] Migration scripts are idempotent (safe to run multiple times)

### Verification Script

- [ ] Verification script checks all required services
- [ ] Verification script returns correct exit codes
- [ ] Verification script provides clear output
- [ ] Verification script works with JSON output format
- [ ] Verification script handles service failures gracefully
- [ ] Verification script can connect to remote APIs

### Integration Testing

- [ ] All scripts work together correctly
- [ ] Complete deployment flow works end-to-end
- [ ] Rollback procedures work correctly
- [ ] Scripts work in staging environment
- [ ] Scripts handle edge cases (missing services, network errors, etc.)

## Test Data Management

### Creating Test Data

Before testing, create appropriate test data in staging:

```sql
-- Example: Create test tickets, users, etc.
-- This ensures backups and restores work with realistic data volumes
```

### Cleaning Up Test Data

After testing:

```powershell
# Option 1: Restore from backup taken before testing
.\scripts\restore-database.ps1 -BackupFile ".\pre-test-backup.sql"

# Option 2: Manually clean up test data
# Connect to database and remove test records
```

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Errors

**Problem**: Scripts fail to connect to database  
**Solutions**:
- Verify DATABASE_URL is correct
- Check database is running and accessible
- Verify network connectivity
- Check firewall rules
- Verify database user has required permissions

#### Permission Errors

**Problem**: Scripts fail due to insufficient permissions  
**Solutions**:
- Verify database user has CREATE, ALTER, SELECT, INSERT, UPDATE, DELETE permissions
- Check file system permissions for backup directories
- Verify user has execute permissions on scripts

#### Migration Conflicts

**Problem**: Migration fails due to conflicts  
**Solutions**:
- Check current migration status
- Verify no conflicting migrations exist
- Ensure database schema is up-to-date
- Check for manual schema changes that conflict with migrations

#### Backup/Restore Failures

**Problem**: Backup or restore fails  
**Solutions**:
- Verify sufficient disk space
- Check database connectivity
- Verify backup file is not corrupted
- Check PostgreSQL client tools are installed
- Verify database user has backup/restore permissions

## Production Readiness

Before using scripts in production:

1. ✅ All scripts tested in staging environment
2. ✅ All test scenarios pass
3. ✅ Error handling verified
4. ✅ Rollback procedures tested
5. ✅ Documentation reviewed
6. ✅ Team trained on script usage
7. ✅ Backup/restore procedures verified
8. ✅ Monitoring/alerting configured for deployment process

## Related Documentation

- `docs/deployment.md` - Production deployment guide
- `docs/backup-restore.md` - Backup and restore procedures
- `docs/runbooks.md` - Operational runbooks
- `scripts/README.md` - Script documentation (if exists)

## Notes

- Always test in staging before using scripts in production
- Keep backups of staging database before testing
- Document any issues encountered during testing
- Update scripts based on testing feedback
- Review and update this testing guide periodically

