# Production Deployment Guide

This guide provides step-by-step instructions for deploying HelpDeskApp to production environments.

## Prerequisites

- Node.js 22+ and pnpm installed on deployment host
- Docker and Docker Compose (if using containerized deployment)
- PostgreSQL 16+ database (accessible from deployment host)
- Redis 7+ instance (for worker job queue)
- SMTP server or email service (for notifications)
- Object storage (S3-compatible) or local storage for attachments
- Domain name and SSL certificate (for HTTPS)

## Environment Variables

### Required Variables

These must be set before deployment:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/helpdesk

# NextAuth (Authentication)
NEXTAUTH_SECRET=<generate-strong-random-secret>
NEXTAUTH_URL=https://your-domain.com

# Node Environment
NODE_ENV=production
```

### Optional Variables (with defaults)

#### Worker Configuration
```bash
REDIS_URL=redis://host:6379
BULLMQ_QUEUE=helpdesk-default
BULLMQ_PREFIX=helpdesk
WORKER_CONCURRENCY=5
WORKER_MAX_ATTEMPTS=3
WORKER_BACKOFF_MS=5000
WORKER_DLQ_ENABLED=true
WORKER_DLQ_NAME=helpdesk-default-dlq
```

#### Email Configuration
```bash
EMAIL_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@your-domain.com
```

#### Storage Configuration
```bash
STORAGE_BASE_URL=https://your-domain.com/uploads
# For S3-compatible storage, configure MinIO or AWS S3 credentials separately
```

#### Rate Limiting
```bash
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20
RATE_LIMIT_DISABLED_ROUTES=/api/health,/api/status
```

#### Spam Guard
```bash
SPAM_GUARD_ENABLED=true
SPAM_GUARD_COOLDOWN_MS=10000
```

#### Attachment Configuration
```bash
ATTACH_ALLOWED_MIME=image/png,image/jpeg,application/pdf,text/plain
ATTACH_MAX_BYTES=26214400  # 25MB
```

#### SLA Configuration
```bash
SLA_REMINDER_LEAD_MINUTES=30
```

## Pre-Deployment Checklist

Before deploying to production, ensure all items below are completed:

### Environment Setup
- [ ] All required environment variables are set (see [Environment Variables](#environment-variables) section)
- [ ] `NEXTAUTH_SECRET` is generated using `openssl rand -base64 32` (32+ characters)
- [ ] `NEXTAUTH_URL` uses `https://` protocol in production
- [ ] `DATABASE_URL` includes SSL connection (`?sslmode=require`) for production
- [ ] `REDIS_URL` uses TLS (`rediss://`) for production if available
- [ ] All secrets are stored in a secret management service (not in `.env` files)
- [ ] `.env` file is in `.gitignore` and not committed to version control

### Database Preparation
- [ ] Database backup created (see `docs/backup-restore.md`)
- [ ] Database migrations tested in staging environment
- [ ] Database connection tested: `psql $DATABASE_URL` or `npx prisma migrate status`
- [ ] Database has sufficient disk space for migration
- [ ] Database user has required permissions (CREATE, ALTER, SELECT, INSERT, UPDATE, DELETE)

### Infrastructure Readiness
- [ ] PostgreSQL 16+ is running and accessible
- [ ] Redis 7+ is running and accessible (if using worker)
- [ ] SMTP server is configured and tested (if using email notifications)
- [ ] Object storage (S3/MinIO) is configured (if using attachments)
- [ ] SSL certificate is installed and valid
- [ ] Domain DNS is configured correctly
- [ ] Firewall rules allow necessary ports (5432 for PostgreSQL, 6379 for Redis, 3000 for app)

### Application Readiness
- [ ] Code is reviewed and approved
- [ ] All tests pass: `pnpm test`
- [ ] Application builds successfully: `pnpm build`
- [ ] No critical security vulnerabilities in dependencies: `pnpm audit`
- [ ] Application version is tagged in git
- [ ] Deployment scripts are tested in staging

### Monitoring & Logging
- [ ] Log aggregation is configured (if applicable)
- [ ] Monitoring/alerting is set up
- [ ] Health check endpoints are accessible
- [ ] Error tracking is configured (if applicable)

### Documentation
- [ ] Deployment runbook is reviewed
- [ ] Rollback procedures are understood
- [ ] Team is notified of deployment window
- [ ] Maintenance window is scheduled (if needed)

## Deployment Methods

### Method 1: Docker Compose (Recommended)

1. **Clone repository and checkout production branch:**
   ```bash
   git clone <repository-url>
   cd HelpDeskApp
   git checkout main
   ```

2. **Create environment file:**
   ```bash
   # Create .env file with production values
   # Required: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
   # See Environment Variables section above for full list
   ```

3. **Build and start services:**
   ```bash
   # Build images
   docker compose -f docker-compose.prod.yml build
   
   # Start services
   docker compose -f docker-compose.prod.yml up -d
   ```

4. **Run database migrations:**
   ```bash
   docker compose -f docker-compose.prod.yml exec app pnpm prisma migrate deploy
   ```

5. **Run database migrations:**
   ```bash
   docker compose -f docker-compose.prod.yml exec app pnpm prisma migrate deploy
   ```

6. **Verify deployment** (see [Post-Deployment Verification](#post-deployment-verification) section):
   ```bash
   # Check application health
   curl http://localhost:3000/api/health
   
   # Check worker health
   docker compose -f docker-compose.prod.yml exec worker pnpm worker:health
   
   # Run comprehensive verification
   .\scripts\verify-deployment.ps1
   
   # View logs
   docker compose -f docker-compose.prod.yml logs -f app
   docker compose -f docker-compose.prod.yml logs -f worker
   ```

### Method 2: Manual Deployment

1. **Prepare deployment host:**
   ```bash
   # Install dependencies
   pnpm install --frozen-lockfile --production=false
   
   # Build application
   pnpm build
   ```

2. **Set environment variables:**
   ```bash
   export DATABASE_URL="postgresql://..."
   export NEXTAUTH_SECRET="..."
   export NEXTAUTH_URL="https://your-domain.com"
   # ... (set all required variables)
   ```

3. **Run database migrations:**
   ```bash
   pnpm prisma migrate deploy
   ```

4. **Verify deployment** (see [Post-Deployment Verification](#post-deployment-verification) section):
   ```bash
   # Run comprehensive verification
   .\scripts\verify-deployment.ps1
   ```

5. **Start application:**
   ```bash
   # Using PM2 (recommended)
   pm2 start npm --name "helpdesk-app" -- start
   
   # Or using systemd (see systemd service example below)
   ```

6. **Start worker process:**
   ```bash
   pm2 start npm --name "helpdesk-worker" -- run worker:start
   ```

7. **Configure reverse proxy (Nginx example):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Post-Deployment Verification

After deployment, perform these verification steps to ensure everything is working correctly:

### 1. Automated Verification Script

Run the comprehensive verification script:

```bash
# PowerShell (Windows)
.\scripts\verify-deployment.ps1

# With custom API URL
.\scripts\verify-deployment.ps1 -ApiUrl "https://your-domain.com"

# JSON output for automation
.\scripts\verify-deployment.ps1 -OutputFormat "json"
```

This script checks:
- ✅ Database connection (PostgreSQL via Prisma)
- ✅ Redis connection (via BullMQ, if configured)
- ✅ MinIO connection (if configured)
- ✅ Worker health check
- ✅ API health endpoint

### 2. Manual Health Checks

#### Application Health
```bash
# Basic health check
curl https://your-domain.com/api/health

# Expected response (200 OK):
{
  "database": true,
  "redis": true,
  "minio": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Worker Health
```bash
# Via CLI
pnpm worker:health

# Via Docker
docker compose -f docker-compose.prod.yml exec worker pnpm worker:health

# Expected response:
{
  "status": "healthy",
  "queue": {
    "name": "helpdesk-default",
    "waiting": 0,
    "active": 0,
    "completed": 1234,
    "failed": 0
  },
  "redis": {
    "connected": true
  }
}
```

### 3. Functional Verification

Test critical user flows:

- [ ] **Authentication**: Login works correctly
- [ ] **Ticket Creation**: Can create a new ticket
- [ ] **Ticket List**: Can view and filter tickets
- [ ] **Comments**: Can add comments to tickets
- [ ] **Admin Functions**: Admin users can access admin panels
- [ ] **Notifications**: Email notifications are sent (if enabled)
- [ ] **Attachments**: File uploads work (if enabled)

### 4. Performance Checks

- [ ] Application responds within acceptable time (< 2s for page loads)
- [ ] Database queries are performing well
- [ ] No memory leaks (monitor over 15-30 minutes)
- [ ] Worker processes jobs without backlog

### 5. Security Verification

- [ ] HTTPS is enforced (redirects HTTP to HTTPS)
- [ ] Rate limiting is active (test with rapid requests)
- [ ] Authentication is required for protected routes
- [ ] CORS is configured correctly (if applicable)
- [ ] No sensitive data in error messages

### 6. Log Review

Check logs for errors or warnings:

```bash
# Application logs
docker compose -f docker-compose.prod.yml logs app | grep -i error
pm2 logs helpdesk-app | grep -i error

# Worker logs
docker compose -f docker-compose.prod.yml logs worker | grep -i error
pm2 logs helpdesk-worker | grep -i error
```

### 7. Database Verification

```bash
# Check migration status
npx prisma migrate status

# Verify database connectivity
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Ticket\";"
```

### 8. Monitoring Setup

- [ ] Application metrics are being collected
- [ ] Error rates are within normal range
- [ ] Alerts are configured for critical issues
- [ ] Dashboard shows healthy status

### Verification Checklist Summary

- [ ] All automated checks pass (`verify-deployment.ps1`)
- [ ] Health endpoints return 200 OK
- [ ] Worker is processing jobs
- [ ] Critical user flows work
- [ ] No errors in logs
- [ ] Performance is acceptable
- [ ] Security checks pass
- [ ] Monitoring is active

**If any check fails, refer to the [Troubleshooting](#troubleshooting) section before proceeding.**

## Health Checks

### Application Health

The application exposes health check endpoints:

- `GET /api/health` - Basic application health
- `GET /api/status` - Detailed status (if implemented)

### Worker Health

Check worker health using the CLI:

```bash
pnpm worker:health
```

Or via Docker:

```bash
docker compose -f docker-compose.prod.yml exec worker pnpm worker:health
```

Expected output:
```json
{
  "status": "healthy",
  "queue": {
    "name": "helpdesk-default",
    "waiting": 0,
    "active": 0,
    "completed": 1234,
    "failed": 0
  },
  "redis": {
    "connected": true
  }
}
```

## Database Migrations

### Applying Migrations

**In production, always use `migrate deploy` (not `migrate dev`):**

```bash
pnpm prisma migrate deploy
```

This command:
- Applies pending migrations
- Does not create new migrations
- Safe for production use

### Migration Best Practices

1. **Test migrations in staging first**
2. **Backup database before applying migrations**
3. **Apply migrations during maintenance windows for large changes**
4. **Monitor application logs during migration**

### Verifying Migrations

Check migration status:

```bash
pnpm prisma migrate status
```

## Worker Deployment

The worker process handles background jobs (SLA monitoring, notifications).

### Starting the Worker

```bash
# Using PM2
pm2 start npm --name "helpdesk-worker" -- run worker:start

# Or directly
pnpm worker:start
```

### Worker Configuration

- **Concurrency:** Set `WORKER_CONCURRENCY` (default: 5)
- **Retries:** Configured via `WORKER_MAX_ATTEMPTS` (default: 3)
- **Dead Letter Queue:** Enabled by default, disabled with `WORKER_DLQ_ENABLED=false`

### Worker Monitoring

Monitor worker logs:

```bash
pm2 logs helpdesk-worker
```

Check queue health:

```bash
pnpm worker:health
```

## Rollback Procedures

**⚠️ Important:** Always backup your database before performing a rollback. See `docs/backup-restore.md` for backup procedures.

### When to Rollback

Consider rolling back if:
- Critical bugs are discovered in production
- Performance degradation is severe
- Security vulnerabilities are found
- Data corruption is detected
- Application is completely non-functional

### Rollback Decision Process

1. **Assess Impact**: Determine severity of the issue
2. **Check Fix Availability**: Is there a hotfix available?
3. **Evaluate Rollback Risk**: Will rollback cause data loss or inconsistencies?
4. **Notify Team**: Alert stakeholders of rollback decision
5. **Document Issue**: Record what went wrong for post-mortem

### Application Rollback

#### Docker Compose Method

1. **Identify previous working version:**
   ```bash
   git log --oneline
   git tag -l  # List version tags
   ```

2. **Stop current deployment:**
   ```bash
   docker compose -f docker-compose.prod.yml down
   ```

3. **Checkout previous version:**
   ```bash
   git checkout <previous-commit-hash>
   # Or use a tag: git checkout v1.2.3
   ```

4. **Rebuild and restart:**
   ```bash
   docker compose -f docker-compose.prod.yml build
   docker compose -f docker-compose.prod.yml up -d
   ```

5. **Verify rollback:**
   ```bash
   .\scripts\verify-deployment.ps1
   curl https://your-domain.com/api/health
   ```

#### Manual Deployment Method

1. **Identify previous working version:**
   ```bash
   git log --oneline
   ```

2. **Stop application:**
   ```bash
   pm2 stop helpdesk-app
   pm2 stop helpdesk-worker
   ```

3. **Checkout previous version:**
   ```bash
   git checkout <previous-commit-hash>
   ```

4. **Rebuild and restart:**
   ```bash
   pnpm install --frozen-lockfile
   pnpm build
   pm2 restart helpdesk-app
   pm2 restart helpdesk-worker
   ```

5. **Verify rollback:**
   ```bash
   .\scripts\verify-deployment.ps1
   pm2 logs helpdesk-app --lines 50
   ```

### Database Rollback

**⚠️ Critical Warning:** Prisma does not support automatic database rollback. You must manually reverse schema changes or restore from backup.

#### Option 1: Restore from Backup (Recommended)

1. **Identify backup to restore:**
   ```bash
   # List available backups
   ls -lh backups/
   ```

2. **Restore database:**
   ```bash
   # Using backup script (see docs/backup-restore.md)
   # Or manually:
   pg_restore -h localhost -U postgres -d helpdesk backup_20240101_120000.sql
   ```

3. **Verify restore:**
   ```bash
   npx prisma migrate status
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Ticket\";"
   ```

#### Option 2: Manual Migration Rollback

1. **Review migration to rollback:**
   ```bash
   cat prisma/migrations/<migration-name>/migration.sql
   ```

2. **Create reverse migration manually:**
   - Write SQL to reverse the changes
   - Test in staging first

3. **Apply reverse migration:**
   ```bash
   psql $DATABASE_URL -f reverse_migration.sql
   ```

4. **Mark migration as rolled back:**
   ```bash
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

#### Option 3: Using Rollback Script

Use the provided rollback script:

```bash
# Rollback specific migration
.\scripts\rollback-migration.ps1 -MigrationName "20240101120000_migration_name"

# With backup restore
.\scripts\rollback-migration.ps1 -MigrationName "20240101120000_migration_name" -RestoreBackup
```

### Worker Rollback

1. **Stop worker:**
   ```bash
   pm2 stop helpdesk-worker
   # Or with Docker:
   docker compose -f docker-compose.prod.yml stop worker
   ```

2. **Checkout previous version:**
   ```bash
   git checkout <previous-commit-hash>
   ```

3. **Restart worker:**
   ```bash
   # Manual deployment
   pnpm install --frozen-lockfile
   pm2 restart helpdesk-worker
   
   # Docker Compose
   docker compose -f docker-compose.prod.yml build worker
   docker compose -f docker-compose.prod.yml up -d worker
   ```

4. **Verify worker:**
   ```bash
   pnpm worker:health
   ```

### Partial Rollback (Code Only, Keep Database)

If you need to rollback code but keep the current database schema:

1. **Rollback application code** (follow Application Rollback steps above)
2. **Do NOT rollback database migrations**
3. **Verify application works with current schema**
4. **Monitor for schema compatibility issues**

### Post-Rollback Verification

After rollback, verify:

- [ ] Application starts successfully
- [ ] Health checks pass
- [ ] Critical user flows work
- [ ] Database is accessible
- [ ] Worker processes jobs
- [ ] No errors in logs
- [ ] Performance is restored

### Rollback Best Practices

1. **Always backup before rollback**: Use `.\scripts\backup-db.ps1`
2. **Test rollback in staging first**: If possible
3. **Document rollback reason**: For post-mortem analysis
4. **Monitor after rollback**: Watch for issues
5. **Plan forward fix**: Address the issue that caused rollback
6. **Communicate**: Notify team and users if needed

## Monitoring and Logging

### Application Logs

- **PM2 logs:** `pm2 logs helpdesk-app`
- **Docker logs:** `docker compose -f docker-compose.prod.yml logs -f app`
- **Systemd logs:** `journalctl -u helpdesk-app -f`

### Worker Logs

- **PM2 logs:** `pm2 logs helpdesk-worker`
- **Docker logs:** `docker compose -f docker-compose.prod.yml logs -f worker`

### Key Metrics to Monitor

- Application response times
- Database connection pool usage
- Redis connection status
- Worker queue depth (waiting/active jobs)
- Failed job count
- Error rates

## Security Considerations

1. **Secrets Management:**
   - Never commit secrets to version control
   - Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Rotate secrets regularly

2. **Database Security:**
   - Use strong passwords
   - Enable SSL/TLS connections
   - Restrict network access
   - Regular backups

3. **Application Security:**
   - Enable HTTPS (TLS 1.2+)
   - Set secure cookie flags
   - Implement rate limiting
   - Regular security updates

4. **Worker Security:**
   - Secure Redis connections (use TLS if possible)
   - Monitor failed jobs for anomalies
   - Set up alerts for queue backlogs

## Troubleshooting

This section covers common deployment issues and their solutions.

### Application Won't Start

**Symptoms:**
- Application exits immediately after start
- Port 3000 is not listening
- PM2 shows "errored" status
- Docker container exits with error code

**Diagnosis Steps:**

1. **Check environment variables:**
   ```bash
   # Verify required variables are set
   echo $DATABASE_URL
   echo $NEXTAUTH_SECRET
   echo $NEXTAUTH_URL
   ```

2. **Verify database connectivity:**
   ```bash
   # Test PostgreSQL connection
   psql $DATABASE_URL -c "SELECT 1;"
   
   # Or using Prisma
   npx prisma migrate status
   ```

3. **Check application logs:**
   ```bash
   # PM2
   pm2 logs helpdesk-app --lines 100
   
   # Docker
   docker compose -f docker-compose.prod.yml logs app --tail 100
   
   # Systemd
   journalctl -u helpdesk-app -n 100
   ```

4. **Verify port availability:**
   ```bash
   # Check if port 3000 is in use
   netstat -ano | findstr :3000  # Windows
   lsof -i :3000                  # Linux/Mac
   ```

5. **Test build locally:**
   ```bash
   pnpm build
   ```

**Common Solutions:**
- Missing or incorrect `DATABASE_URL` → Set correct connection string
- Invalid `NEXTAUTH_SECRET` → Generate new secret: `openssl rand -base64 32`
- Port conflict → Change `APP_PORT` or stop conflicting service
- Build errors → Check Node.js version (requires 22+)
- Missing dependencies → Run `pnpm install --frozen-lockfile`

### Worker Not Processing Jobs

**Symptoms:**
- Jobs remain in "waiting" state
- Worker health check fails
- No job processing activity in logs
- Queue depth increases without processing

**Diagnosis Steps:**

1. **Check Redis connectivity:**
   ```bash
   # Test Redis connection
   redis-cli -u $REDIS_URL ping
   # Should return: PONG
   ```

2. **Verify worker is running:**
   ```bash
   # PM2
   pm2 list
   pm2 logs helpdesk-worker --lines 50
   
   # Docker
   docker compose -f docker-compose.prod.yml ps worker
   docker compose -f docker-compose.prod.yml logs worker --tail 50
   ```

3. **Run worker health check:**
   ```bash
   pnpm worker:health
   ```

4. **Check queue status:**
   ```bash
   # Using Redis CLI
   redis-cli -u $REDIS_URL
   > KEYS helpdesk:*
   > LLEN helpdesk:helpdesk-default:waiting
   ```

**Common Solutions:**
- Redis not accessible → Check `REDIS_URL` and network connectivity
- Worker not started → Start worker: `pm2 start helpdesk-worker` or `docker compose up -d worker`
- Worker crashed → Check logs for errors, restart worker
- Queue configuration mismatch → Verify `BULLMQ_QUEUE` and `BULLMQ_PREFIX` match
- Worker concurrency too low → Increase `WORKER_CONCURRENCY` if needed

### Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- "Authentication failed" errors
- Timeout errors
- Migration failures

**Diagnosis Steps:**

1. **Verify DATABASE_URL format:**
   ```bash
   echo $DATABASE_URL
   # Should be: postgresql://user:password@host:port/database
   ```

2. **Test database connectivity:**
   ```bash
   # Direct connection test
   psql $DATABASE_URL -c "SELECT version();"
   
   # Using Prisma
   npx prisma db execute --stdin <<< "SELECT 1;"
   ```

3. **Check database server status:**
   ```bash
   # If database is on remote server
   ping <database-host>
   telnet <database-host> 5432
   ```

4. **Verify credentials:**
   - Check username and password in `DATABASE_URL`
   - Ensure user has required permissions

5. **Check firewall rules:**
   - Verify port 5432 is open
   - Check security groups (AWS) or firewall rules

**Common Solutions:**
- Incorrect `DATABASE_URL` → Fix connection string format
- Database server down → Restart database service
- Network issues → Check firewall and security groups
- SSL required → Add `?sslmode=require` to `DATABASE_URL`
- Connection pool exhausted → Increase pool size or reduce connections
- Credentials expired → Update password in `DATABASE_URL`

### Migration Failures

**Symptoms:**
- `prisma migrate deploy` fails
- Migration errors in logs
- Database schema mismatch
- "Migration already applied" errors

**Diagnosis Steps:**

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **Review migration files:**
   ```bash
   ls -la prisma/migrations/
   cat prisma/migrations/<migration-name>/migration.sql
   ```

3. **Check database permissions:**
   ```bash
   psql $DATABASE_URL -c "\du"  # List users
   ```

4. **Test migration in isolation:**
   ```bash
   # Create test database
   createdb test_db
   DATABASE_URL="postgresql://user:pass@host:5432/test_db" npx prisma migrate deploy
   ```

**Common Solutions:**
- Insufficient permissions → Grant CREATE, ALTER permissions to database user
- Conflicting migrations → Resolve conflicts manually or use `prisma migrate resolve`
- Database locked → Check for active transactions, wait or kill blocking queries
- Migration already applied → Use `prisma migrate resolve --applied <name>`
- Syntax errors → Review migration SQL, fix and create new migration
- Data conflicts → Backup data, resolve conflicts, restore if needed

### Health Check Failures

**Symptoms:**
- `/api/health` returns 503
- Health check script fails
- Monitoring alerts trigger

**Diagnosis Steps:**

1. **Check health endpoint directly:**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Run verification script:**
   ```bash
   .\scripts\verify-deployment.ps1
   ```

3. **Check individual components:**
   - Database: `npx prisma migrate status`
   - Redis: `redis-cli -u $REDIS_URL ping`
   - MinIO: `curl $MINIO_ENDPOINT/minio/health/live`

**Common Solutions:**
- Database down → Restart database, check connectivity
- Redis down → Restart Redis, check `REDIS_URL`
- MinIO down → Restart MinIO service (if used)
- Network issues → Check firewall and network connectivity
- Timeout issues → Increase timeout values in health check

### Performance Issues

**Symptoms:**
- Slow page loads (> 5 seconds)
- High database CPU usage
- Memory leaks
- Timeout errors

**Diagnosis Steps:**

1. **Check application metrics:**
   ```bash
   # PM2 metrics
   pm2 monit
   
   # Docker stats
   docker stats
   ```

2. **Analyze database queries:**
   ```bash
   # Enable query logging
   # In DATABASE_URL, add: ?log_queries=true
   ```

3. **Check worker queue depth:**
   ```bash
   pnpm worker:health
   ```

4. **Review logs for slow queries:**
   ```bash
   pm2 logs helpdesk-app | grep -i "slow\|timeout"
   ```

**Common Solutions:**
- Database connection pool exhausted → Increase pool size
- Missing database indexes → Add indexes for frequently queried columns
- N+1 query problems → Optimize queries, use Prisma `include` efficiently
- Worker backlog → Increase `WORKER_CONCURRENCY` or add more workers
- Memory leaks → Restart application periodically, investigate leaks
- High traffic → Scale horizontally (add more instances)

### Authentication Issues

**Symptoms:**
- Users cannot login
- "Unauthorized" errors
- Session expires immediately
- CSRF errors

**Diagnosis Steps:**

1. **Verify NEXTAUTH_SECRET:**
   ```bash
   echo $NEXTAUTH_SECRET
   # Should be 32+ characters
   ```

2. **Check NEXTAUTH_URL:**
   ```bash
   echo $NEXTAUTH_URL
   # Should match actual domain (https://your-domain.com)
   ```

3. **Test authentication flow:**
   - Try logging in via UI
   - Check browser console for errors
   - Check network tab for failed requests

4. **Review session configuration:**
   - Check cookie settings
   - Verify HTTPS is enabled
   - Check CORS settings

**Common Solutions:**
- Invalid `NEXTAUTH_SECRET` → Generate new secret, restart app
- Mismatched `NEXTAUTH_URL` → Update to match actual domain
- Cookie issues → Check SameSite and Secure flags
- CORS misconfiguration → Update CORS settings in Next.js config
- Session store issues → Check Redis connection (if using Redis sessions)

### Email Not Sending

**Symptoms:**
- No email notifications received
- SMTP errors in logs
- Email jobs failing in worker

**Diagnosis Steps:**

1. **Verify email configuration:**
   ```bash
   echo $EMAIL_ENABLED
   echo $SMTP_HOST
   echo $SMTP_PORT
   ```

2. **Test SMTP connection:**
   ```bash
   # Using telnet
   telnet $SMTP_HOST $SMTP_PORT
   ```

3. **Check worker logs:**
   ```bash
   pm2 logs helpdesk-worker | grep -i email
   ```

4. **Review email adapter logs:**
   - Check application logs for SMTP errors
   - Verify credentials are correct

**Common Solutions:**
- `EMAIL_ENABLED=false` → Set to `true`
- Incorrect SMTP credentials → Update `SMTP_USER` and `SMTP_PASSWORD`
- SMTP server unreachable → Check network and firewall
- Port blocked → Verify port 587 (TLS) or 465 (SSL) is open
- Authentication required → Use app-specific passwords for Gmail/Outlook

### Getting Additional Help

If issues persist:

1. **Collect diagnostic information:**
   ```bash
   # Run verification script
   .\scripts\verify-deployment.ps1 -OutputFormat "json" > diagnostics.json
   
   # Collect logs
   pm2 logs helpdesk-app --lines 500 > app-logs.txt
   pm2 logs helpdesk-worker --lines 500 > worker-logs.txt
   ```

2. **Review documentation:**
   - `docs/backup-restore.md` - Database backup/restore
   - `docs/worker-deployment-runbook.md` - Worker-specific issues
   - `docs/runbooks.md` - Operational procedures

3. **Check known issues:**
   - Review `docs/known-issues.md`
   - Check GitHub issues

4. **Escalate:**
   - Contact DevOps team
   - Create detailed issue report with diagnostics

## Maintenance Windows

Schedule regular maintenance for:

- Database migrations
- Security updates
- Dependency updates
- Performance optimization

**Recommended:** Schedule during low-traffic periods with advance notice to users.

## Support

For deployment issues:

1. Check application and worker logs
2. Review this deployment guide
3. Consult `docs/worker-deployment-runbook.md` for worker-specific issues
4. Review `docs/runbooks.md` for operational procedures

