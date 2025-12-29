# Database Migrations Guide

This guide provides comprehensive procedures for running database migrations in production, including best practices, rollback procedures, and troubleshooting.

## Table of Contents

- [Overview](#overview)
- [Migration Types](#migration-types)
- [Production Migration Procedure](#production-migration-procedure)
- [Migration Status](#migration-status)
- [Rollback Procedures](#rollback-procedures)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## Overview

HelpDeskApp uses Prisma for database migrations. Migrations are SQL files that modify the database schema (tables, indexes, constraints, etc.) in a version-controlled, repeatable way.

### Key Concepts

- **Migration Files**: Located in `prisma/migrations/`, each migration has a timestamp and name
- **Migration History**: Tracked in the `_prisma_migrations` table in your database
- **Production Commands**: Use `prisma migrate deploy` (no prompts, safe for automation)
- **Development Commands**: Use `prisma migrate dev` (creates new migrations, prompts for confirmation)

### Migration Safety

All 19 existing migrations have been reviewed and are production-ready (see [Migration Review](./migration-review.md)). They are:
- ✅ Idempotent (safe to run multiple times)
- ✅ Backward compatible
- ✅ Include rollback capability where applicable

---

## Migration Types

### Development Migrations

**When to use**: During local development when creating new schema changes.

```bash
# Create a new migration
npx prisma migrate dev --name add_user_preferences

# This will:
# 1. Create a new migration file
# 2. Apply it to your local database
# 3. Regenerate Prisma Client
```

**⚠️ Never use `prisma migrate dev` in production!**

### Production Migrations

**When to use**: Applying existing migrations to production/staging databases.

```bash
# Apply all pending migrations
npx prisma migrate deploy

# This will:
# 1. Check which migrations are pending
# 2. Apply them in order
# 3. Update migration history
# 4. NOT prompt for confirmation (safe for automation)
```

**✅ Always use `prisma migrate deploy` in production!**

---

## Production Migration Procedure

### Method 1: Using Production Migration Script (Recommended)

The project includes a production-safe migration script that handles backup, verification, and automatic rollback:

```powershell
# Basic usage (with backup and confirmation)
.\scripts\migrate-production.ps1

# With custom backup path
.\scripts\migrate-production.ps1 -BackupPath "C:\Backups\PreMigration"

# Skip confirmation (use with caution)
.\scripts\migrate-production.ps1 -Force
```

**What the script does:**

1. ✅ Creates a backup before migration (using `backup-db.ps1`)
2. ✅ Verifies current migration status
3. ✅ Runs `prisma migrate deploy` (production-safe)
4. ✅ Verifies migration success
5. ✅ Automatically rolls back on failure (restores from backup)

**Example Output:**

```
=== Production Migration Script ===

=== Step 1: Creating Pre-Migration Backup ===
Running backup script...
Backup created successfully: C:\Backups\PreMigration\backup_helpdesk_20240101_120000.sql.gz

=== Step 2: Checking Migration Status ===
Checking current migration status...
Database schema is up to date.

=== Step 3: Running Database Migration ===
Running: npx prisma migrate deploy
Migration completed successfully!

=== Step 4: Verifying Migration Success ===
Migration verification successful!

=== Migration Process Completed Successfully ===
```

### Method 2: Manual Migration (Advanced)

If you need more control or the script is unavailable:

```bash
# 1. Create backup first
.\scripts\backup-db.ps1 -OutputPath "./backups/pre-migration" -Compress

# 2. Check migration status
npx prisma migrate status

# 3. Apply migrations
npx prisma migrate deploy

# 4. Verify success
npx prisma migrate status
```

### Method 3: Docker Compose

When running in Docker:

```bash
# Run migration in app container
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Or during deployment
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

---

## Migration Status

### Check Current Status

```bash
# View migration status
npx prisma migrate status

# Example output:
# Database schema is up to date.
# Or:
# The following migration(s) have not yet been applied:
#   20240101120000_add_user_preferences
```

### View Migration History

```bash
# List all migrations
ls prisma/migrations/

# View specific migration SQL
cat prisma/migrations/20240101120000_add_user_preferences/migration.sql
```

### Database Migration Table

The `_prisma_migrations` table tracks which migrations have been applied:

```sql
-- View applied migrations
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;

-- Check if specific migration is applied
SELECT * FROM "_prisma_migrations" WHERE migration_name = '20240101120000_add_user_preferences';
```

---

## Rollback Procedures

### Automatic Rollback (Using Migration Script)

If the production migration script fails, it automatically attempts to restore from backup:

```powershell
# If migration fails, the script will:
# 1. Detect failure
# 2. Prompt for rollback confirmation (unless -Force)
# 3. Restore database from pre-migration backup
# 4. Report success/failure
```

### Manual Rollback (Using Rollback Script)

If you need to rollback a specific migration:

```powershell
# Rollback a specific migration
.\scripts\rollback-migration.ps1 -MigrationName "20240101120000_add_user_preferences"

# With backup restore
.\scripts\rollback-migration.ps1 -MigrationName "20240101120000_add_user_preferences" -RestoreBackup
```

**⚠️ Important Notes:**

- Prisma does not automatically reverse migration changes
- The rollback script marks the migration as rolled back in Prisma's history
- You must manually reverse database changes or restore from backup
- Always review the migration SQL file to understand what needs to be reversed

### Full Database Restore

If you need to restore the entire database:

```powershell
# Restore from backup file
.\scripts\restore-database.ps1 -BackupFile "C:\Backups\backup_20240101_120000.sql.gz"

# The restore script will:
# 1. Create a backup of current state
# 2. Require explicit confirmation (especially in production)
# 3. Restore from backup file
# 4. Verify restore success
```

See [Backup and Restore Guide](./backup-restore.md) for more details.

---

## Pre-Migration Checklist

Before running migrations in production, ensure:

### Environment Preparation

- [ ] `DATABASE_URL` is set and correct
- [ ] Database connection is tested: `psql $DATABASE_URL` or `npx prisma migrate status`
- [ ] Database has sufficient disk space (check with `df -h` or equivalent)
- [ ] Database user has required permissions (CREATE, ALTER, SELECT, INSERT, UPDATE, DELETE)
- [ ] Application is in maintenance mode (if applicable)

### Backup Preparation

- [ ] Pre-migration backup is created: `.\scripts\backup-db.ps1 -OutputPath "./backups/pre-migration" -Compress`
- [ ] Backup file is verified (not empty, reasonable size)
- [ ] Backup is stored in a safe location (not on the same server as database)
- [ ] Backup retention policy is configured (if using automated backups)

### Migration Preparation

- [ ] All migrations are tested in staging environment
- [ ] Migration status is checked: `npx prisma migrate status`
- [ ] Pending migrations are reviewed: `ls prisma/migrations/`
- [ ] Migration SQL files are reviewed for potential issues
- [ ] Team is notified of migration window
- [ ] Rollback plan is prepared and documented

### Application Preparation

- [ ] Application code is compatible with new schema
- [ ] Application is deployed with new code (if schema changes require it)
- [ ] Worker processes are aware of schema changes (if applicable)
- [ ] API contracts are updated (if schema changes affect API)

### Monitoring Preparation

- [ ] Database monitoring is enabled
- [ ] Application monitoring is enabled
- [ ] Alerting is configured for migration failures
- [ ] Log aggregation is configured
- [ ] Health check endpoints are accessible

---

## Best Practices

### 1. Always Backup Before Migration

```powershell
# Create backup before every migration
.\scripts\backup-db.ps1 -OutputPath "./backups/pre-migration" -Compress
npx prisma migrate deploy
```

### 2. Test Migrations in Staging First

- Never run untested migrations in production
- Test migrations in staging environment that mirrors production
- Verify application works correctly after migration

### 3. Use Production Migration Script

- Use `.\scripts\migrate-production.ps1` for automated backup and rollback
- Never use `prisma migrate dev` in production
- Always use `prisma migrate deploy` in production

### 4. Review Migration SQL Files

- Review migration SQL before applying
- Understand what changes will be made
- Check for potential data loss or breaking changes

### 5. Monitor During Migration

- Watch database logs during migration
- Monitor application health endpoints
- Check for errors or warnings

### 6. Verify After Migration

```bash
# Check migration status
npx prisma migrate status

# Verify database schema
npx prisma db pull  # Compare with schema.prisma

# Test application functionality
# Run smoke tests or manual testing
```

### 7. Document Migration Changes

- Document schema changes in commit messages
- Update API documentation if schema affects API
- Notify team of breaking changes

### 8. Use Transactional Migrations (When Possible)

- Prisma migrations run in transactions by default (PostgreSQL)
- If migration fails, database is rolled back automatically
- Some migrations cannot run in transactions (e.g., creating indexes concurrently)

### 9. Plan for Large Migrations

- Large migrations (adding indexes, altering large tables) may take time
- Schedule during low-traffic periods
- Consider using `CREATE INDEX CONCURRENTLY` for large indexes
- Monitor database performance during migration

### 10. Keep Migration History Clean

- Don't modify existing migration files after they're applied
- Create new migrations for additional changes
- Document why migrations were created

---

## Troubleshooting

### Migration Fails with "Migration Already Applied"

**Symptom:**
```
Error: Migration `20240101120000_add_user_preferences` failed to apply.
Migration `20240101120000_add_user_preferences` is already recorded as applied in the database.
```

**Solution:**
- Check migration history: `npx prisma migrate status`
- If migration is partially applied, you may need to manually fix the database
- Use `prisma migrate resolve` to mark migration as applied or rolled back:
  ```bash
  npx prisma migrate resolve --applied 20240101120000_add_user_preferences
  # Or
  npx prisma migrate resolve --rolled-back 20240101120000_add_user_preferences
  ```

### Migration Fails with Database Connection Error

**Symptom:**
```
Error: Can't reach database server at `localhost:5432`
```

**Solution:**
- Verify `DATABASE_URL` is set correctly
- Test database connection: `psql $DATABASE_URL`
- Check database server is running
- Verify network connectivity and firewall rules

### Migration Fails with Permission Error

**Symptom:**
```
Error: permission denied to create table
```

**Solution:**
- Verify database user has required permissions
- Grant necessary permissions:
  ```sql
  GRANT CREATE ON DATABASE helpdesk TO your_user;
  GRANT ALL PRIVILEGES ON SCHEMA public TO your_user;
  ```

### Migration Takes Too Long

**Symptom:**
- Migration hangs or takes hours to complete

**Solution:**
- Check database logs for errors
- Monitor database CPU and I/O usage
- For large migrations, consider:
  - Running during maintenance window
  - Using `CREATE INDEX CONCURRENTLY` for indexes
  - Breaking large migrations into smaller ones

### Migration Partially Applied

**Symptom:**
- Migration fails partway through
- Some changes are applied, others are not

**Solution:**
1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **Review database state:**
   ```sql
   -- Check what was created/modified
   \dt  -- List tables
   \di  -- List indexes
   ```

3. **Restore from backup (if needed):**
   ```powershell
   .\scripts\restore-database.ps1 -BackupFile "backup_file.sql.gz"
   ```

4. **Fix migration SQL (if needed):**
   - Review migration file
   - Manually fix database state
   - Mark migration as resolved

### Migration Status Shows "Drift Detected"

**Symptom:**
```
⚠️  Your database schema has drifted. The migration history may not be in sync.
```

**Solution:**
- This means database schema doesn't match migration history
- Review what changed: `npx prisma migrate status`
- Option 1: Reset database and reapply migrations (development only)
- Option 2: Create a new migration to sync schema
- Option 3: Manually fix database to match migration history

### Cannot Rollback Migration

**Symptom:**
- Rollback script fails or migration cannot be reversed

**Solution:**
- Prisma doesn't automatically reverse migrations
- You must manually reverse database changes
- Or restore from backup:
  ```powershell
  .\scripts\restore-database.ps1 -BackupFile "pre_migration_backup.sql.gz"
  ```

---

## Related Documentation

- [Backup and Restore Guide](./backup-restore.md) - Database backup and restore procedures
- [Migration Review](./migration-review.md) - Review of all existing migrations
- [Deployment Guide](./deployment.md) - Full deployment procedures
- [Environment Variables](./environment-variables.md) - Configuration reference
- [Infrastructure Guide](./infrastructure.md) - Infrastructure setup and configuration

---

## Quick Reference

### Production Migration Command

```powershell
# Recommended: Use production migration script
.\scripts\migrate-production.ps1

# Or manually:
.\scripts\backup-db.ps1 -OutputPath "./backups/pre-migration" -Compress
npx prisma migrate deploy
npx prisma migrate status
```

### Check Migration Status

```bash
npx prisma migrate status
```

### Rollback Migration

```powershell
.\scripts\rollback-migration.ps1 -MigrationName "migration_name"
```

### Restore Database

```powershell
.\scripts\restore-database.ps1 -BackupFile "backup_file.sql.gz"
```

---

## Migration Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `migrate-production.ps1` | Production-safe migration with backup/rollback | Production migrations |
| `rollback-migration.ps1` | Rollback specific migration | When migration needs to be reversed |
| `restore-database.ps1` | Full database restore from backup | Disaster recovery, full rollback |
| `backup-db.ps1` | Create database backup | Before migrations, scheduled backups |

---

## Support

If you encounter issues not covered in this guide:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Migration Review](./migration-review.md) for migration-specific details
3. Check Prisma documentation: https://www.prisma.io/docs/concepts/components/prisma-migrate
4. Review application logs and database logs
5. Contact development team with:
   - Migration name and timestamp
   - Error message and stack trace
   - Database migration status output
   - Backup file location (if available)

