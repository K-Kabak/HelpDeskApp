# Staging Backup/Restore Verification

This document provides procedures for testing backup and restore procedures in a staging environment to ensure they work correctly before production deployment.

## Overview

Before deploying to production, backup and restore procedures must be tested in a staging environment to verify:
- Backup scripts work correctly
- Restore procedures function as expected
- Backup integrity is maintained
- Restore process doesn't cause data loss or corruption
- Automation works correctly

---

## 1. Prerequisites

### 1.1. Staging Environment Setup

**Requirements:**
- Staging database server (PostgreSQL 16+)
- Access to staging environment
- Backup storage location (local filesystem or object storage)
- Sufficient disk space for backups

**Verify Staging Environment:**

```bash
# Verify database connectivity
psql "$STAGING_DATABASE_URL" -c "SELECT version();"

# Check available disk space
df -h /path/to/backup/location

# Verify backup script exists
Test-Path scripts/backup-db.ps1

# Verify restore script exists
Test-Path scripts/restore-database.ps1
```

### 1.2. Test Data Preparation

**Requirements:**
- Staging database should contain test data
- Test data should include various entity types (tickets, comments, users, etc.)
- Record initial state for verification after restore

**Create Test Data Snapshot:**

```bash
# Record initial record counts
psql "$STAGING_DATABASE_URL" -c "
  SELECT 
    'Ticket' as table_name, COUNT(*) as count FROM \"Ticket\"
  UNION ALL
  SELECT 'Comment', COUNT(*) FROM \"Comment\"
  UNION ALL
  SELECT 'User', COUNT(*) FROM \"User\"
  UNION ALL
  SELECT 'Organization', COUNT(*) FROM \"Organization\"
  UNION ALL
  SELECT 'AuditEvent', COUNT(*) FROM \"AuditEvent\";
" > staging-initial-state.txt
```

---

## 2. Backup Testing

### 2.1. Basic Backup Test

**Objective:** Verify basic backup functionality works

**Steps:**

1. **Run backup script:**
   ```powershell
   .\scripts\backup-db.ps1 -OutputPath "C:\StagingBackups\Test" -Compress
   ```

2. **Verify backup file exists:**
   ```powershell
   $backupFile = Get-ChildItem "C:\StagingBackups\Test" -Filter "backup_*.sql.gz" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
   if ($backupFile -and $backupFile.Length -gt 0) {
       Write-Host "✓ Backup file created: $($backupFile.Name) ($($backupFile.Length) bytes)"
   } else {
       Write-Host "✗ Backup file not found or empty"
       exit 1
   }
   ```

3. **Check backup file integrity:**
   ```bash
   # Verify it's a valid gzip file
   gunzip -t backup_*.sql.gz && echo "✓ Backup file is valid gzip" || echo "✗ Backup file is corrupted"
   
   # Check SQL content (uncompressed first few lines)
   gunzip -c backup_*.sql.gz | head -20
   ```

**Expected Results:**
- ✓ Backup file is created with timestamp
- ✓ File size is greater than 0
- ✓ File is valid gzip format
- ✓ SQL dump contains expected PostgreSQL header

### 2.2. Backup with Verification

**Objective:** Test backup script with built-in verification

**Steps:**

```powershell
.\scripts\backup-db.ps1 -OutputPath "C:\StagingBackups\Test" -Compress -Verify
```

**Expected Results:**
- ✓ Backup completes successfully
- ✓ Verification passes
- ✓ No errors in output

### 2.3. Backup Retention Test

**Objective:** Verify retention policy works correctly

**Steps:**

1. **Create multiple test backups:**
   ```powershell
   # Create backups with different timestamps (simulate old backups)
   $testPath = "C:\StagingBackups\RetentionTest"
   New-Item -ItemType Directory -Path $testPath -Force
   
   # Create 5 test backup files
   for ($i = 1; $i -le 5; $i++) {
       $backupName = "backup_test_$(Get-Date -Format 'yyyyMMdd-HHmmss').sql.gz"
       "Test backup $i" | Out-File "$testPath\$backupName"
       Start-Sleep -Seconds 2
   }
   ```

2. **Run backup with retention (keep last 3):**
   ```powershell
   .\scripts\backup-db.ps1 -OutputPath $testPath -Compress -RetentionDays 0
   ```
   
   Note: Use a small retention period or manual cleanup for testing

3. **Verify old backups are cleaned up:**
   ```powershell
   $remainingBackups = Get-ChildItem $testPath -Filter "backup_*.sql*" | Measure-Object
   Write-Host "Remaining backups: $($remainingBackups.Count)"
   ```

**Expected Results:**
- ✓ Old backups are removed according to retention policy
- ✓ Recent backups are preserved

### 2.4. Backup to Object Storage (Optional)

**Objective:** Test backup to MinIO/S3 if configured

**Prerequisites:**
- MinIO client (`mc`) installed
- MinIO credentials configured

**Steps:**

```powershell
# Set MinIO environment variables
$env:MINIO_ENDPOINT = "http://localhost:9000"
$env:MINIO_ACCESS_KEY = "minioadmin"
$env:MINIO_SECRET_KEY = "minioadmin"
$env:MINIO_BUCKET = "helpdesk-backups"

# Run backup with MinIO upload
.\scripts\backup-db.ps1 -OutputPath "C:\StagingBackups\Test" -Compress -BackupMinIO
```

**Expected Results:**
- ✓ Backup file is created locally
- ✓ Backup file is uploaded to MinIO
- ✓ File exists in MinIO bucket

**Verification:**

```bash
# Verify backup in MinIO
mc ls minio/helpdesk-backups/
```

---

## 3. Restore Testing

### 3.1. Pre-Restore Preparation

**IMPORTANT:** Always backup current state before restore testing

**Steps:**

1. **Create pre-restore backup:**
   ```powershell
   .\scripts\backup-db.ps1 -OutputPath "C:\StagingBackups\PreRestore" -Compress
   ```

2. **Record current state:**
   ```bash
   psql "$STAGING_DATABASE_URL" -c "
     SELECT 
       'Ticket' as table_name, COUNT(*) as count FROM \"Ticket\"
     UNION ALL
     SELECT 'Comment', COUNT(*) FROM \"Comment\"
     UNION ALL
     SELECT 'User', COUNT(*) FROM \"User\";
   " > staging-before-restore.txt
   ```

3. **Make a test change to database (to verify restore works):**
   ```sql
   -- Create a test record
   INSERT INTO "Ticket" (title, description, "organizationId", "requesterId", status, priority)
   VALUES ('Test Ticket Before Restore', 'This should be removed after restore', 
           (SELECT id FROM "Organization" LIMIT 1),
           (SELECT id FROM "User" WHERE role = 'REQUESTER' LIMIT 1),
           'OTWARTE', 'NORMALNA');
   ```

### 3.2. Basic Restore Test

**Objective:** Verify restore procedure works correctly

**Steps:**

1. **Identify backup file to restore:**
   ```powershell
   $backupFile = Get-ChildItem "C:\StagingBackups\Test" -Filter "backup_*.sql.gz" | 
                 Sort-Object LastWriteTime -Descending | 
                 Select-Object -First 1
   Write-Host "Restoring from: $($backupFile.FullName)"
   ```

2. **Run restore script:**
   ```powershell
   .\scripts\restore-database.ps1 -BackupFile $backupFile.FullName
   ```

3. **Follow confirmation prompts:**
   - Script will prompt for confirmation
   - Type "RESTORE" (case-sensitive) in production mode
   - Script will create pre-restore backup automatically

**Expected Results:**
- ✓ Pre-restore backup is created automatically
- ✓ Restore completes successfully
- ✓ No errors during restore
- ✓ Test record created before restore is removed

### 3.3. Restore Verification

**Objective:** Verify data integrity after restore

**Steps:**

1. **Verify database connection:**
   ```bash
   psql "$STAGING_DATABASE_URL" -c "SELECT version();"
   ```

2. **Compare record counts:**
   ```bash
   psql "$STAGING_DATABASE_URL" -c "
     SELECT 
       'Ticket' as table_name, COUNT(*) as count FROM \"Ticket\"
     UNION ALL
       SELECT 'Comment', COUNT(*) FROM \"Comment\"
     UNION ALL
       SELECT 'User', COUNT(*) FROM \"User\"
     UNION ALL
       SELECT 'Organization', COUNT(*) FROM \"Organization\";
   " > staging-after-restore.txt
   
   # Compare with initial state
   diff staging-initial-state.txt staging-after-restore.txt
   ```

3. **Verify specific test data:**
   ```sql
   -- Check that test ticket from before restore is gone
   SELECT COUNT(*) FROM "Ticket" WHERE title = 'Test Ticket Before Restore';
   -- Should return 0
   
   -- Verify original data exists
   SELECT COUNT(*) FROM "Ticket";
   -- Should match initial count
   ```

4. **Test application functionality:**
   - Log in to staging application
   - View ticket list
   - Open a specific ticket
   - Add a comment
   - Verify all functionality works

**Expected Results:**
- ✓ Record counts match initial state
- ✓ Test record from before restore is removed
- ✓ Application functions correctly
- ✓ No data corruption or missing relationships

### 3.4. Restore from Compressed Backup

**Objective:** Verify restore from compressed (.gz) backup works

**Steps:**

```powershell
$compressedBackup = Get-ChildItem "C:\StagingBackups\Test" -Filter "backup_*.sql.gz" | 
                    Sort-Object LastWriteTime -Descending | 
                    Select-Object -First 1

.\scripts\restore-database.ps1 -BackupFile $compressedBackup.FullName
```

**Expected Results:**
- ✓ Script detects compressed format
- ✓ Backup is decompressed automatically
- ✓ Restore completes successfully

### 3.5. Restore Error Handling Test

**Objective:** Verify error handling works correctly

**Steps:**

1. **Test with invalid backup file:**
   ```powershell
   # Create invalid backup file
   "Invalid SQL content" | Out-File "C:\StagingBackups\Test\invalid-backup.sql"
   
   # Attempt restore (should fail gracefully)
   .\scripts\restore-database.ps1 -BackupFile "C:\StagingBackups\Test\invalid-backup.sql"
   ```

2. **Test with non-existent file:**
   ```powershell
   .\scripts\restore-database.ps1 -BackupFile "C:\StagingBackups\Test\nonexistent.sql"
   ```

**Expected Results:**
- ✓ Script detects invalid backup file
- ✓ Appropriate error message is displayed
- ✓ Script exits without corrupting database
- ✓ Pre-restore backup is preserved

---

## 4. End-to-End Backup/Restore Test

### 4.1. Complete Test Scenario

**Objective:** Test complete backup and restore workflow

**Steps:**

1. **Initial State:**
   - Record current database state
   - Note specific test records

2. **Create Backup:**
   ```powershell
   $backupFile = .\scripts\backup-db.ps1 -OutputPath "C:\StagingBackups\E2ETest" -Compress -Verify
   ```

3. **Make Changes:**
   - Add test records
   - Modify existing records
   - Delete some records

4. **Restore from Backup:**
   ```powershell
   .\scripts\restore-database.ps1 -BackupFile $backupFile
   ```

5. **Verify:**
   - Database state matches initial state
   - Test changes are reverted
   - Application functions correctly

**Expected Results:**
- ✓ Complete workflow executes successfully
- ✓ Database is restored to exact state at backup time
- ✓ No data loss or corruption

---

## 5. Performance Testing

### 5.1. Backup Performance

**Objective:** Measure backup performance

**Steps:**

```powershell
$startTime = Get-Date
.\scripts\backup-db.ps1 -OutputPath "C:\StagingBackups\PerformanceTest" -Compress
$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "Backup duration: $($duration.TotalSeconds) seconds"

# Check backup file size
$backupFile = Get-ChildItem "C:\StagingBackups\PerformanceTest" -Filter "backup_*.sql.gz" | Select-Object -First 1
$sizeMB = [math]::Round($backupFile.Length / 1MB, 2)
Write-Host "Backup size: $sizeMB MB"
Write-Host "Backup speed: $([math]::Round($sizeMB / $duration.TotalSeconds, 2)) MB/s"
```

**Expected Results:**
- ✓ Backup completes in reasonable time (< 5 minutes for typical database)
- ✓ Backup size is reasonable
- ✓ Performance metrics are recorded

### 5.2. Restore Performance

**Objective:** Measure restore performance

**Steps:**

```powershell
$backupFile = Get-ChildItem "C:\StagingBackups\PerformanceTest" -Filter "backup_*.sql.gz" | Select-Object -First 1

$startTime = Get-Date
.\scripts\restore-database.ps1 -BackupFile $backupFile.FullName -Force
$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "Restore duration: $($duration.TotalSeconds) seconds"
```

**Expected Results:**
- ✓ Restore completes in reasonable time
- ✓ Performance metrics are recorded

---

## 6. Automation Testing

### 6.1. Scheduled Backup Test

**Objective:** Test automated backup scheduling

**Steps:**

1. **Create scheduled task (Windows):**
   ```powershell
   $action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
     -Argument "-File C:\HelpDeskApp\scripts\backup-db.ps1 -OutputPath C:\StagingBackups\Scheduled -Compress -RetentionDays 7"
   $trigger = New-ScheduledTaskTrigger -Daily -At 2am
   Register-ScheduledTask -TaskName "HelpDeskApp-StagingBackup" -Action $action -Trigger $trigger
   ```

2. **Test scheduled task:**
   ```powershell
   Start-ScheduledTask -TaskName "HelpDeskApp-StagingBackup"
   Start-Sleep -Seconds 30
   Get-ScheduledTaskInfo -TaskName "HelpDeskApp-StagingBackup"
   ```

3. **Verify backup was created:**
   ```powershell
   $latestBackup = Get-ChildItem "C:\StagingBackups\Scheduled" -Filter "backup_*.sql.gz" | 
                   Sort-Object LastWriteTime -Descending | 
                   Select-Object -First 1
   if ($latestBackup) {
       Write-Host "✓ Scheduled backup created: $($latestBackup.Name)"
   }
   ```

**Expected Results:**
- ✓ Scheduled task executes successfully
- ✓ Backup is created automatically
- ✓ Retention policy is applied

---

## 7. Verification Checklist

### Complete Verification Checklist

**Backup Testing:**
- [ ] Basic backup creates valid file
- [ ] Compressed backup works correctly
- [ ] Backup verification passes
- [ ] Retention policy works
- [ ] MinIO/S3 backup works (if configured)
- [ ] Backup performance is acceptable

**Restore Testing:**
- [ ] Restore from SQL file works
- [ ] Restore from compressed backup works
- [ ] Pre-restore backup is created automatically
- [ ] Data integrity is maintained
- [ ] Application functions after restore
- [ ] Error handling works correctly

**End-to-End Testing:**
- [ ] Complete backup/restore cycle works
- [ ] Database state is correctly restored
- [ ] No data loss or corruption

**Performance:**
- [ ] Backup completes in acceptable time
- [ ] Restore completes in acceptable time
- [ ] Performance metrics are recorded

**Automation:**
- [ ] Scheduled backups work
- [ ] Automation scripts function correctly

---

## 8. Test Results Documentation

### Test Results Template

After completing verification tests, document results:

```markdown
# Staging Backup/Restore Verification Results

**Date:** [Date]
**Tester:** [Name]
**Environment:** Staging
**Database Version:** PostgreSQL [Version]
**Backup Script Version:** [Version]

## Test Results

### Backup Tests
- [ ] Basic backup: PASS / FAIL
- [ ] Compressed backup: PASS / FAIL
- [ ] Backup verification: PASS / FAIL
- [ ] Retention policy: PASS / FAIL

### Restore Tests
- [ ] Basic restore: PASS / FAIL
- [ ] Compressed restore: PASS / FAIL
- [ ] Data integrity: PASS / FAIL
- [ ] Error handling: PASS / FAIL

### Performance
- Backup duration: [Time]
- Backup size: [Size]
- Restore duration: [Time]

### Issues Found
[List any issues found during testing]

### Recommendations
[Any recommendations for improvements]
```

---

## 9. Troubleshooting

### Common Issues

**Issue: Backup script fails**
- Verify `DATABASE_URL` environment variable is set
- Check database connection is accessible
- Verify sufficient disk space
- Check script permissions

**Issue: Restore fails**
- Verify backup file is not corrupted
- Check database connection
- Ensure sufficient disk space
- Verify backup file format matches script expectations

**Issue: Data mismatch after restore**
- Verify backup was created from correct database
- Check restore script is using correct database
- Verify no concurrent modifications during restore

**Issue: Performance issues**
- Check database size
- Verify disk I/O performance
- Consider adjusting compression settings
- Monitor system resources during backup/restore

---

## 10. Next Steps

After successful staging verification:

1. **Document results** in test results document
2. **Fix any issues** found during testing
3. **Update procedures** if needed based on findings
4. **Schedule production backup** testing (if applicable)
5. **Train operations team** on backup/restore procedures

---

## Related Documentation

- [Backup and Restore Guide](./backup-restore.md) - Complete backup/restore procedures
- [Deployment Guide](./deployment.md) - Deployment procedures
- [Production Readiness Checklist](./production-readiness-checklist.md) - Production readiness verification

---

## Quick Reference

### Backup Command
```powershell
.\scripts\backup-db.ps1 -OutputPath "C:\Backups" -Compress -Verify -RetentionDays 30
```

### Restore Command
```powershell
.\scripts\restore-database.ps1 -BackupFile "C:\Backups\backup_YYYYMMDD-HHMMSS.sql.gz"
```

### Verify Backup
```bash
gunzip -t backup_*.sql.gz
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"Ticket\";"
```

