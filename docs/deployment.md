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

5. **Verify deployment:**
   ```bash
   # Check application health
   curl http://localhost:3000/api/health
   
   # Check worker health
   docker compose -f docker-compose.prod.yml exec worker pnpm worker:health
   
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

4. **Start application:**
   ```bash
   # Using PM2 (recommended)
   pm2 start npm --name "helpdesk-app" -- start
   
   # Or using systemd (see systemd service example below)
   ```

5. **Start worker process:**
   ```bash
   pm2 start npm --name "helpdesk-worker" -- run worker:start
   ```

6. **Configure reverse proxy (Nginx example):**
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

### Application Rollback

1. **Identify previous working version:**
   ```bash
   git log --oneline
   ```

2. **Checkout previous version:**
   ```bash
   git checkout <previous-commit-hash>
   ```

3. **Rebuild and restart:**
   ```bash
   pnpm install --frozen-lockfile
   pnpm build
   pm2 restart helpdesk-app
   ```

### Database Rollback

**⚠️ Warning:** Prisma does not support automatic rollback. Use database backups.

1. **Restore from backup:**
   ```bash
   # PostgreSQL restore example
   pg_restore -d helpdesk backup.dump
   ```

2. **Mark migrations as applied (if needed):**
   ```bash
   pnpm prisma migrate resolve --applied <migration-name>
   ```

### Worker Rollback

1. **Stop worker:**
   ```bash
   pm2 stop helpdesk-worker
   ```

2. **Checkout previous version and restart:**
   ```bash
   git checkout <previous-commit-hash>
   pnpm install --frozen-lockfile
   pm2 restart helpdesk-worker
   ```

### Docker Compose Rollback

1. **Checkout previous version:**
   ```bash
   git checkout <previous-commit-hash>
   ```

2. **Rebuild and restart:**
   ```bash
   docker compose -f docker-compose.prod.yml build
   docker compose -f docker-compose.prod.yml up -d
   ```

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

### Application Won't Start

1. Check environment variables are set correctly
2. Verify database connectivity: `psql $DATABASE_URL`
3. Check application logs for errors
4. Verify port 3000 is available

### Worker Not Processing Jobs

1. Check Redis connectivity: `redis-cli -u $REDIS_URL ping`
2. Verify worker is running: `pm2 list` or `docker ps`
3. Check worker logs for errors
4. Run health check: `pnpm worker:health`

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check database server is accessible
3. Verify database credentials
4. Check firewall rules

### Migration Failures

1. Check migration logs
2. Verify database permissions
3. Check for conflicting migrations
4. Review Prisma migration status

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

