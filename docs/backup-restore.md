# Backup and Restore Guide

This guide provides procedures for backing up and restoring HelpDeskApp data, including database backups, file storage backups, and disaster recovery procedures.

## Table of Contents

- [Overview](#overview)
- [Database Backups](#database-backups)
- [File Storage Backups](#file-storage-backups)
- [Backup Frequency Recommendations](#backup-frequency-recommendations)
- [Retention Policy](#retention-policy)
- [Restore Procedures](#restore-procedures)
- [Disaster Recovery](#disaster-recovery)
- [Automation](#automation)
- [Verification](#verification)

---

## Overview

HelpDeskApp requires backups of:

1. **PostgreSQL Database** - All application data (tickets, users, comments, etc.)
2. **File Attachments** - User-uploaded files stored in `uploads/` or object storage
3. **Configuration** - Environment variables and secrets (stored in secret management)

### Backup Strategy

- **Full Backups**: Complete database dump and all files
- **Incremental Backups**: Only changed data (not covered in this guide)
- **Point-in-Time Recovery**: Using PostgreSQL WAL archiving (advanced, not covered)

---

## Database Backups

### Using Backup Script (Recommended)

The project includes a PowerShell script for automated database backups:

```powershell
# Basic backup (current directory)
.\scripts\backup-db.ps1

# Backup to specific directory
.\scripts\backup-db.ps1 -OutputPath "C:\Backups"

# Compressed backup
.\scripts\backup-db.ps1 -OutputPath "C:\Backups" -Compress
```

**Script Features:**
- Validates `DATABASE_URL` environment variable
- Generates timestamped backup files
- Supports optional compression (gzip)
- Verifies backup file integrity
- Error handling and logging

**Backup File Format:**
- Uncompressed: `backup_helpdesk_YYYYMMDD-HHMMSS.sql`
- Compressed: `backup_helpdesk_YYYYMMDD-HHMMSS.sql.gz`

### Manual Database Backup

#### Using pg_dump

```bash
# Basic backup
pg_dump -h localhost -U postgres -d helpdesk -f backup.sql

# Custom format (supports compression and selective restore)
pg_dump -h localhost -U postgres -d helpdesk -F c -f backup.dump

# Compressed backup
pg_dump -h localhost -U postgres -d helpdesk | gzip > backup.sql.gz

# With SSL connection
pg_dump "postgresql://user:pass@host:5432/helpdesk?sslmode=require" -f backup.sql
```

#### Using Prisma

Prisma doesn't provide direct backup functionality, but you can use:

```bash
# Export schema only
npx prisma db pull

# For full backup, use pg_dump (see above)
```

### Database Backup Best Practices

1. **Always backup before migrations:**
   ```bash
   .\scripts\backup-db.ps1 -OutputPath "./backups/pre-migration"
   npx prisma migrate deploy
   ```

2. **Use consistent naming:**
   - Include timestamp: `backup_YYYYMMDD_HHMMSS.sql`
   - Include purpose: `backup_pre_migration_20240101.sql`
   - Include version: `backup_v1.2.3_20240101.sql`

3. **Verify backups:**
   - Check file size (should not be 0 bytes)
   - Test restore on staging environment
   - Verify backup file integrity

4. **Secure backups:**
   - Store backups in secure location
   - Encrypt backups containing sensitive data
   - Restrict access to backup files
   - Never commit backups to version control

---

## File Storage Backups

### Local File Storage (`uploads/`)

If using local file storage:

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/

# Or using PowerShell
Compress-Archive -Path uploads\* -DestinationPath "uploads_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
```

### S3-Compatible Storage (MinIO/AWS S3)

#### MinIO Backup

```bash
# Using MinIO client (mc)
mc mirror minio/helpdesk-bucket ./backups/minio-backup/

# Or export specific prefix
mc mirror minio/helpdesk-bucket/uploads ./backups/minio-uploads/
```

#### AWS S3 Backup

```bash
# Using AWS CLI
aws s3 sync s3://helpdesk-bucket ./backups/s3-backup/

# Or using lifecycle policies (automated)
# Configure in AWS Console: S3 > Bucket > Management > Lifecycle
```

### Object Storage Backup Best Practices

1. **Versioning**: Enable versioning on S3/MinIO buckets
2. **Cross-region replication**: For disaster recovery
3. **Lifecycle policies**: Automate backup retention
4. **Encryption**: Encrypt backups at rest

---

## Backup Frequency Recommendations

### Production Environment

| Backup Type | Frequency | Retention | Notes |
|------------|-----------|----------|-------|
| **Database Full Backup** | Daily | 30 days | Automated, during low-traffic hours (2-4 AM) |
| **Database Pre-Migration** | Before each migration | 7 days | Manual, before applying migrations |
| **Database Pre-Deployment** | Before each deployment | 3 days | Manual, before code deployments |
| **File Storage** | Daily | 30 days | Automated, sync to backup location |
| **Configuration/Secrets** | On change | 90 days | Manual, when secrets are rotated |

### Staging Environment

| Backup Type | Frequency | Retention | Notes |
|------------|-----------|----------|-------|
| **Database Full Backup** | Weekly | 14 days | Automated |
| **File Storage** | Weekly | 14 days | Automated |

### Development Environment

- **Optional**: Manual backups before major changes
- **Retention**: 7 days
- **Purpose**: Recovery from accidental data loss

### Special Circumstances

- **Before major updates**: Always backup
- **Before schema changes**: Always backup
- **Before bulk operations**: Always backup
- **After security incidents**: Create forensic backup

### Automated Backup Schedule

**Recommended cron schedule (Linux) or Task Scheduler (Windows):**

```bash
# Daily database backup at 2 AM
0 2 * * * /path/to/scripts/backup-db.ps1 -OutputPath "/backups/daily" -Compress

# Weekly full backup on Sunday at 1 AM
0 1 * * 0 /path/to/scripts/backup-db.ps1 -OutputPath "/backups/weekly" -Compress
```

**PowerShell Task Scheduler (Windows):**

```powershell
# Create scheduled task for daily backup
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\HelpDeskApp\scripts\backup-db.ps1 -OutputPath C:\Backups\Daily -Compress"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -TaskName "HelpDeskApp-DailyBackup" -Action $action -Trigger $trigger
```

---

## Retention Policy

### Retention Schedule

| Backup Age | Action | Notes |
|-----------|--------|-------|
| **0-7 days** | Keep all | Daily backups, available for quick restore |
| **8-30 days** | Keep daily | One backup per day |
| **31-90 days** | Keep weekly | One backup per week |
| **91-365 days** | Keep monthly | One backup per month |
| **> 365 days** | Archive or delete | Move to cold storage or delete |

### Implementation

**Manual Cleanup Script (PowerShell):**

```powershell
# Cleanup old backups (keep last 30 days)
$backupPath = "C:\Backups\Daily"
$cutoffDate = (Get-Date).AddDays(-30)
Get-ChildItem -Path $backupPath -Filter "backup_*.sql*" | 
    Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
    Remove-Item -Force
```

**Automated Cleanup:**

```bash
# Linux: Keep backups from last 30 days
find /backups/daily -name "backup_*.sql*" -mtime +30 -delete

# Keep weekly backups for 90 days
find /backups/weekly -name "backup_*.sql*" -mtime +90 -delete
```

### Storage Considerations

- **Local Storage**: Monitor disk space, move old backups to archive
- **Cloud Storage**: Use lifecycle policies to transition to cheaper storage tiers
- **Compression**: Always compress backups older than 7 days to save space

---

## Restore Procedures

### Database Restore

#### Using Backup Script (if restore script exists)

```powershell
# Restore from backup
.\scripts\restore-db.ps1 -BackupFile "C:\Backups\backup_20240101_120000.sql"
```

#### Manual Restore

**From SQL file:**

```bash
# Uncompressed
psql -h localhost -U postgres -d helpdesk -f backup.sql

# Compressed
gunzip -c backup.sql.gz | psql -h localhost -U postgres -d helpdesk

# With DATABASE_URL
gunzip -c backup.sql.gz | psql $DATABASE_URL
```

**From custom format (pg_dump -F c):**

```bash
pg_restore -h localhost -U postgres -d helpdesk backup.dump

# Drop existing objects first (careful!)
pg_restore -h localhost -U postgres -d helpdesk --clean backup.dump
```

**Using Prisma after restore:**

```bash
# After restoring, sync Prisma schema
npx prisma db pull

# Or mark migrations as applied
npx prisma migrate resolve --applied <migration-name>
```

#### Restore to Different Database

```bash
# Create new database
createdb helpdesk_restore

# Restore to new database
pg_restore -h localhost -U postgres -d helpdesk_restore backup.dump

# Update DATABASE_URL and test
export DATABASE_URL="postgresql://user:pass@host:5432/helpdesk_restore"
npx prisma migrate status
```

### File Storage Restore

#### Local File Storage

```bash
# Extract backup
tar -xzf uploads_backup_20240101_120000.tar.gz

# Or using PowerShell
Expand-Archive -Path uploads_backup_20240101_120000.zip -DestinationPath uploads/
```

#### S3-Compatible Storage

```bash
# MinIO restore
mc mirror ./backups/minio-backup/ minio/helpdesk-bucket/

# AWS S3 restore
aws s3 sync ./backups/s3-backup/ s3://helpdesk-bucket/
```

### Restore Best Practices

1. **Test restore in staging first**: Never restore directly to production
2. **Stop application**: Prevent data corruption during restore
3. **Backup current state**: Create backup before restoring
4. **Verify restore**: Check data integrity after restore
5. **Update application**: Ensure application works with restored data

---

## Disaster Recovery

### Disaster Recovery Plan

#### Scenario 1: Database Corruption

1. **Stop application:**
   ```bash
   pm2 stop helpdesk-app
   pm2 stop helpdesk-worker
   ```

2. **Assess damage:**
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Ticket\";"
   ```

3. **Restore from most recent backup:**
   ```bash
   .\scripts\backup-db.ps1 -OutputPath "./backups/pre-restore"
   psql $DATABASE_URL -f backups/backup_YYYYMMDD_HHMMSS.sql
   ```

4. **Verify restore:**
   ```bash
   npx prisma migrate status
   .\scripts\verify-deployment.ps1
   ```

5. **Restart application:**
   ```bash
   pm2 start helpdesk-app
   pm2 start helpdesk-worker
   ```

#### Scenario 2: Complete Server Loss

1. **Provision new infrastructure:**
   - Set up new database server
   - Set up new application server
   - Configure networking

2. **Restore database:**
   ```bash
   # On new database server
   createdb helpdesk
   psql -d helpdesk -f backup.sql
   ```

3. **Restore file storage:**
   ```bash
   # Restore from S3/MinIO backup
   aws s3 sync s3://backup-bucket/uploads/ s3://helpdesk-bucket/uploads/
   ```

4. **Deploy application:**
   - Follow deployment guide
   - Configure environment variables
   - Run migrations (if needed)

5. **Verify and test:**
   ```bash
   .\scripts\verify-deployment.ps1
   # Test critical user flows
   ```

#### Scenario 3: Partial Data Loss

1. **Identify affected data:**
   - Check audit logs
   - Identify time range of data loss

2. **Restore from point-in-time backup:**
   - Use backup closest to incident time
   - Restore to staging first

3. **Merge data (if needed):**
   - Export current data
   - Import missing data from backup
   - Resolve conflicts manually

4. **Verify data integrity:**
   - Check record counts
   - Verify relationships
   - Test application functionality

### Recovery Time Objectives (RTO)

| Scenario | Target RTO | Notes |
|----------|-------------|-------|
| **Database corruption** | 1 hour | Quick restore from backup |
| **Single server failure** | 4 hours | Restore to new server |
| **Complete data center loss** | 24 hours | Full disaster recovery |
| **Partial data loss** | 2-8 hours | Depends on data scope |

### Recovery Point Objectives (RPO)

- **Database**: Maximum 24 hours of data loss (daily backups)
- **File Storage**: Maximum 24 hours of data loss (daily sync)
- **Critical data**: Consider more frequent backups (every 6-12 hours)

---

## Automation

### Automated Backup Script

Create a comprehensive backup script that:

1. Backs up database
2. Backs up file storage
3. Verifies backups
4. Cleans up old backups
5. Sends notifications

**Example PowerShell script:**

```powershell
# backup-all.ps1
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "C:\Backups\$timestamp"

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force

# Backup database
.\scripts\backup-db.ps1 -OutputPath $backupDir -Compress

# Backup file storage (if local)
if (Test-Path "uploads") {
    Compress-Archive -Path uploads\* -DestinationPath "$backupDir\uploads.zip"
}

# Verify backups
$dbBackup = Get-ChildItem -Path $backupDir -Filter "backup_*.sql.gz" | Select-Object -First 1
if ($dbBackup -and $dbBackup.Length -gt 0) {
    Write-Host "Backup successful: $($dbBackup.Name)" -ForegroundColor Green
} else {
    Write-Host "Backup failed!" -ForegroundColor Red
    exit 1
}

# Cleanup old backups (keep last 30 days)
.\scripts\cleanup-backups.ps1 -Path "C:\Backups" -RetentionDays 30
```

### Cloud Backup Integration

**AWS S3 Backup:**

```bash
# Upload backup to S3
aws s3 cp backup.sql.gz s3://helpdesk-backups/database/backup_$(date +%Y%m%d).sql.gz

# Set lifecycle policy (automated via AWS Console)
```

**Azure Blob Storage:**

```bash
# Upload to Azure
az storage blob upload --account-name <account> --container-name backups --file backup.sql.gz --name backup_$(date +%Y%m%d).sql.gz
```

---

## Verification

### Backup Verification

**Immediate Verification:**

1. **Check backup file exists and has content:**
   ```bash
   ls -lh backup_*.sql*
   # File should not be 0 bytes
   ```

2. **Verify backup integrity (SQL):**
   ```bash
   # Check if SQL file is valid
   head -n 20 backup.sql
   # Should show PostgreSQL dump header
   ```

3. **Test restore on staging:**
   ```bash
   # Restore to test database
   createdb helpdesk_test
   psql -d helpdesk_test -f backup.sql
   
   # Verify data
   psql -d helpdesk_test -c "SELECT COUNT(*) FROM \"Ticket\";"
   ```

**Regular Verification:**

- Weekly: Test restore on staging environment
- Monthly: Full disaster recovery drill
- Quarterly: Review and update backup procedures

### Restore Verification

After restore, verify:

1. **Database connectivity:**
   ```bash
   npx prisma migrate status
   ```

2. **Data integrity:**
   ```bash
   # Check record counts
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Ticket\";"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Comment\";"
   ```

3. **Application functionality:**
   ```bash
   .\scripts\verify-deployment.ps1
   # Test critical user flows manually
   ```

4. **File storage:**
   - Verify files are accessible
   - Test file upload/download
   - Check file integrity

---

## Related Documentation

- [Deployment Guide](./deployment.md) - Full deployment procedures
- [Environment Variables](./environment-variables.md) - Configuration reference
- [Worker Deployment Runbook](./worker-deployment-runbook.md) - Worker-specific procedures

---

## Quick Reference

### Daily Backup Command

```powershell
.\scripts\backup-db.ps1 -OutputPath "C:\Backups\Daily" -Compress
```

### Pre-Migration Backup

```powershell
.\scripts\backup-db.ps1 -OutputPath "C:\Backups\PreMigration" -Compress
npx prisma migrate deploy
```

### Restore from Backup

```bash
psql $DATABASE_URL -f backup.sql
# Or
gunzip -c backup.sql.gz | psql $DATABASE_URL
```

### Verify Backup

```bash
ls -lh backup_*.sql*
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Ticket\";"
```

