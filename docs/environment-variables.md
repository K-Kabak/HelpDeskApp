# Environment Variables Documentation

This document provides comprehensive documentation for all environment variables used in HelpDeskApp.

## Table of Contents

- [Required Variables](#required-variables)
- [Worker Configuration](#worker-configuration)
- [Email Configuration](#email-configuration)
- [Storage Configuration](#storage-configuration)
- [Rate Limiting](#rate-limiting)
- [Spam Guard](#spam-guard)
- [Attachment Configuration](#attachment-configuration)
- [SLA Configuration](#sla-configuration)
- [Ticket Reopen Configuration](#ticket-reopen-configuration)
- [Security & Authentication](#security--authentication)
- [Development & Debugging](#development--debugging)
- [Deployment Configuration](#deployment-configuration)
- [Docker Compose Variables](#docker-compose-variables)

---

## Required Variables

These variables must be set before the application can run.

### `DATABASE_URL`

- **Type**: Required
- **Description**: PostgreSQL database connection string
- **Format**: `postgresql://user:password@host:port/database`
- **Example**: `postgresql://postgres:password@localhost:5432/helpdesk`
- **Security Notes**: Contains database credentials. Keep secure and never commit to version control.
- **Default**: None
- **Used In**: Prisma client initialization, database migrations
- **Notes**: 
  - For production, use SSL connection: `postgresql://user:password@host:5432/database?sslmode=require`
  - For Docker Compose, typically: `postgresql://postgres:postgres@db:5432/helpdesk`

### `NEXTAUTH_SECRET`

- **Type**: Required
- **Description**: Secret key used by NextAuth.js to sign and encrypt cookies, tokens, and session data
- **Format**: Base64-encoded string (recommended: 32+ bytes)
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- **Security Notes**: **CRITICAL SECRET** - Must be kept secure. Never commit to version control. Rotate if compromised.
- **Default**: None
- **Used In**: NextAuth.js authentication, session management, CSAT token signing (fallback)
- **Generation**: 
  ```bash
  openssl rand -base64 32
  ```
- **Notes**: 
  - Must be at least 32 characters long
  - Should be unique per deployment environment
  - Changing this invalidates all existing sessions

### `NEXTAUTH_URL`

- **Type**: Required
- **Description**: The canonical URL of your application (used for OAuth callbacks and email links)
- **Format**: Full URL without trailing slash
- **Example (Development)**: `http://localhost:3000`
- **Example (Production)**: `https://helpdesk.yourdomain.com`
- **Security Notes**: Must match the actual domain to prevent OAuth callback hijacking
- **Default**: None
- **Used In**: NextAuth.js OAuth callbacks, email verification links, password reset links
- **Notes**: 
  - Must not have a trailing slash
  - Must use `https://` in production
  - Should match the `Host` header of incoming requests

### `NODE_ENV`

- **Type**: Required
- **Description**: Node.js environment mode
- **Values**: `development` | `production` | `test`
- **Example**: `production`
- **Security Notes**: None
- **Default**: None (but should always be set)
- **Used In**: 
  - Prisma query logging (enabled in development)
  - Error handling (more verbose in development)
  - Next.js optimizations
- **Notes**: 
  - Set to `production` for production deployments
  - Set to `development` for local development
  - Set to `test` when running tests

---

## Worker Configuration

Configuration for the background worker process that handles asynchronous jobs (SLA monitoring, email notifications, etc.).

### `REDIS_URL`

- **Type**: Optional
- **Description**: Redis connection string for BullMQ job queue
- **Format**: `redis://[password@]host:port[/database]`
- **Example**: `redis://localhost:6379`
- **Example (with password)**: `redis://:password@redis.example.com:6379/0`
- **Security Notes**: May contain password. Use TLS in production: `rediss://` (note the double 's')
- **Default**: `redis://localhost:6379`
- **Used In**: Worker process, BullMQ queue initialization
- **Notes**: 
  - Required if using worker functionality
  - For Docker Compose: `redis://redis:6379`
  - For production with TLS: `rediss://host:6380`

### `BULLMQ_QUEUE`

- **Type**: Optional
- **Description**: Name of the default BullMQ job queue
- **Format**: String (alphanumeric, hyphens, underscores)
- **Example**: `helpdesk-default`
- **Security Notes**: None
- **Default**: `helpdesk-default`
- **Used In**: Worker queue initialization
- **Notes**: Use different queue names for different environments (e.g., `helpdesk-dev`, `helpdesk-prod`)

### `BULLMQ_PREFIX`

- **Type**: Optional
- **Description**: Prefix for all Redis keys used by BullMQ
- **Format**: String (alphanumeric, hyphens, underscores)
- **Example**: `helpdesk`
- **Security Notes**: None
- **Default**: `helpdesk`
- **Used In**: Worker queue initialization, Redis key namespacing
- **Notes**: Helps organize Redis keys when multiple applications share a Redis instance

### `WORKER_CONCURRENCY`

- **Type**: Optional
- **Description**: Number of jobs the worker can process simultaneously
- **Format**: Integer
- **Example**: `5`
- **Security Notes**: None
- **Default**: `5`
- **Used In**: Worker initialization
- **Notes**: 
  - Higher values increase throughput but consume more resources
  - Recommended: 5-10 for most use cases
  - Monitor CPU and memory usage when adjusting

### `WORKER_MAX_ATTEMPTS`

- **Type**: Optional
- **Description**: Maximum number of retry attempts for failed jobs
- **Format**: Integer
- **Example**: `3`
- **Security Notes**: None
- **Default**: `3`
- **Used In**: Worker retry logic
- **Notes**: 
  - Jobs that fail after max attempts are moved to dead letter queue (if enabled)
  - Set to 1 to disable retries

### `WORKER_BACKOFF_MS`

- **Type**: Optional
- **Description**: Delay in milliseconds between retry attempts
- **Format**: Integer (milliseconds)
- **Example**: `5000` (5 seconds)
- **Security Notes**: None
- **Default**: `5000`
- **Used In**: Worker retry logic
- **Notes**: 
  - Exponential backoff is typically used (delay increases with each retry)
  - Adjust based on external service response times

### `WORKER_DLQ_ENABLED`

- **Type**: Optional
- **Description**: Enable dead letter queue for permanently failed jobs
- **Format**: Boolean string (`true` | `false`)
- **Example**: `true`
- **Security Notes**: None
- **Default**: `true`
- **Used In**: Worker initialization
- **Notes**: 
  - When enabled, failed jobs are moved to a separate queue for manual inspection
  - Disable to discard failed jobs immediately

### `WORKER_DLQ_NAME`

- **Type**: Optional
- **Description**: Name of the dead letter queue for failed jobs
- **Format**: String
- **Example**: `helpdesk-default-dlq`
- **Security Notes**: None
- **Default**: `{BULLMQ_QUEUE}-dlq`
- **Used In**: Worker dead letter queue initialization
- **Notes**: Automatically derived from `BULLMQ_QUEUE` if not specified

### `WORKER_DRY_RUN`

- **Type**: Optional
- **Description**: Enable dry run mode to test worker without executing jobs
- **Format**: Boolean string (`true` | `false`)
- **Example**: `false`
- **Security Notes**: None
- **Default**: `false`
- **Used In**: Worker execution mode
- **Notes**: 
  - When enabled, worker logs what it would do without actually executing jobs
  - Useful for testing and debugging

### `WORKER_HEALTH_DRY_RUN`

- **Type**: Optional
- **Description**: Enable dry run mode for health check command
- **Format**: Boolean string (`true` | `false`)
- **Example**: `false`
- **Security Notes**: None
- **Default**: `false`
- **Used In**: Worker health check command
- **Notes**: Useful for testing health check without affecting production queues

### `WORKER_HEALTH_SAMPLE_FAILED`

- **Type**: Optional
- **Description**: Number of failed jobs to sample in health check
- **Format**: Integer
- **Example**: `3`
- **Security Notes**: None
- **Default**: `3`
- **Used In**: Worker health check command
- **Notes**: Limits the number of failed job details returned in health check response

---

## Email Configuration

SMTP settings for sending email notifications (ticket updates, SLA reminders, etc.).

### `EMAIL_ENABLED`

- **Type**: Optional
- **Description**: Enable or disable email notifications globally
- **Format**: Boolean string (`true` | `false`)
- **Example**: `true`
- **Security Notes**: None
- **Default**: `false`
- **Used In**: Email adapter initialization
- **Notes**: 
  - When `false`, email functions return success without sending
  - Useful for development and testing
  - All SMTP variables are ignored when disabled

### `SMTP_HOST`

- **Type**: Optional (required if `EMAIL_ENABLED=true`)
- **Description**: SMTP server hostname
- **Format**: Hostname or IP address
- **Example**: `smtp.gmail.com`
- **Example**: `mail.example.com`
- **Security Notes**: None
- **Default**: Empty string
- **Used In**: Email adapter SMTP connection
- **Notes**: 
  - Common providers:
    - Gmail: `smtp.gmail.com`
    - Outlook: `smtp-mail.outlook.com`
    - SendGrid: `smtp.sendgrid.net`
    - AWS SES: `email-smtp.region.amazonaws.com`

### `SMTP_PORT`

- **Type**: Optional
- **Description**: SMTP server port number
- **Format**: Integer
- **Example**: `587` (TLS)
- **Example**: `465` (SSL)
- **Example**: `25` (unencrypted, not recommended)
- **Security Notes**: Use TLS (587) or SSL (465) in production, never unencrypted (25)
- **Default**: `587`
- **Used In**: Email adapter SMTP connection
- **Notes**: 
  - Port 587: STARTTLS (recommended)
  - Port 465: SSL/TLS (legacy but still common)
  - Port 25: Unencrypted (avoid in production)

### `SMTP_USER`

- **Type**: Optional (required if `EMAIL_ENABLED=true`)
- **Description**: SMTP authentication username
- **Format**: String (typically email address)
- **Example**: `noreply@yourdomain.com`
- **Security Notes**: May be sensitive if it's an email address. Keep secure.
- **Default**: Empty string
- **Used In**: Email adapter SMTP authentication
- **Notes**: Often the same as the sender email address

### `SMTP_PASSWORD`

- **Type**: Optional (required if `EMAIL_ENABLED=true`)
- **Description**: SMTP authentication password
- **Format**: String
- **Example**: `your-smtp-password`
- **Security Notes**: **SECRET** - Keep secure, never commit to version control. Use app-specific passwords for Gmail/Outlook.
- **Default**: Empty string
- **Used In**: Email adapter SMTP authentication
- **Notes**: 
  - For Gmail, use an "App Password" (not your regular password)
  - For AWS SES, use IAM credentials
  - Rotate regularly

### `SMTP_FROM`

- **Type**: Optional
- **Description**: Default sender email address for notifications
- **Format**: Email address
- **Example**: `noreply@yourdomain.com`
- **Security Notes**: None
- **Default**: `noreply@helpdesk.local`
- **Used In**: Email adapter sender address
- **Notes**: 
  - Should be a valid email address on your domain
  - Use `noreply@` or `no-reply@` to indicate automated emails
  - Must be verified with your SMTP provider

---

## Storage Configuration

Configuration for file attachment storage (local filesystem or S3-compatible storage).

### `STORAGE_BASE_URL`

- **Type**: Optional
- **Description**: Base URL for accessing stored files (no trailing slash)
- **Format**: Full URL without trailing slash
- **Example (Local)**: `http://localhost:3000/uploads`
- **Example (MinIO)**: `http://minio:9000`
- **Example (S3)**: `https://your-bucket.s3.amazonaws.com`
- **Security Notes**: None (public URLs)
- **Default**: `http://localhost:3000/uploads`
- **Used In**: Storage adapter, file download URLs
- **Notes**: 
  - For local storage, typically matches `NEXTAUTH_URL` + `/uploads`
  - For S3/MinIO, use the bucket endpoint URL
  - Used to generate presigned upload URLs and download URLs

### `MINIO_ENDPOINT`

- **Type**: Optional (for future S3 integration)
- **Description**: MinIO server endpoint URL
- **Format**: Full URL
- **Example**: `http://localhost:9000`
- **Security Notes**: None
- **Default**: None
- **Used In**: Future S3/MinIO integration
- **Notes**: Currently not used, reserved for future implementation

### `MINIO_ACCESS_KEY`

- **Type**: Optional (for future S3 integration)
- **Description**: MinIO access key for authentication
- **Format**: String
- **Example**: `minioadmin`
- **Security Notes**: **SECRET** - Keep secure, similar to AWS access key
- **Default**: None
- **Used In**: Future S3/MinIO integration
- **Notes**: Currently not used, reserved for future implementation

### `MINIO_SECRET_KEY`

- **Type**: Optional (for future S3 integration)
- **Description**: MinIO secret key for authentication
- **Format**: String
- **Example**: `minioadmin`
- **Security Notes**: **SECRET** - Keep secure, similar to AWS secret key
- **Default**: None
- **Used In**: Future S3/MinIO integration
- **Notes**: Currently not used, reserved for future implementation

---

## Rate Limiting

Configuration for API rate limiting to prevent abuse and ensure fair usage.

### `RATE_LIMIT_ENABLED`

- **Type**: Optional
- **Description**: Enable or disable rate limiting globally
- **Format**: Boolean string (`true` | `false`)
- **Example**: `true`
- **Security Notes**: Should be enabled in production to prevent abuse
- **Default**: `true`
- **Used In**: Rate limiting middleware
- **Notes**: 
  - Disable only for development/testing
  - Always enable in production

### `RATE_LIMIT_WINDOW_MS`

- **Type**: Optional
- **Description**: Time window for rate limiting in milliseconds
- **Format**: Integer (milliseconds)
- **Example**: `60000` (1 minute)
- **Security Notes**: None
- **Default**: `60000` (1 minute)
- **Used In**: Rate limiting middleware
- **Notes**: 
  - Common values: 60000 (1 min), 300000 (5 min), 3600000 (1 hour)
  - Shorter windows provide better protection but may block legitimate users

### `RATE_LIMIT_MAX_REQUESTS`

- **Type**: Optional
- **Description**: Maximum number of requests allowed per window per IP/user
- **Format**: Integer
- **Example**: `20`
- **Security Notes**: None
- **Default**: `20`
- **Used In**: Rate limiting middleware
- **Notes**: 
  - Adjust based on your API usage patterns
  - Too low: may block legitimate users
  - Too high: may not prevent abuse effectively

### `RATE_LIMIT_DISABLED_ROUTES`

- **Type**: Optional
- **Description**: Comma-separated list of routes to exclude from rate limiting
- **Format**: Comma-separated paths
- **Example**: `/api/health,/api/status`
- **Security Notes**: Be careful not to exclude sensitive routes
- **Default**: Empty string
- **Used In**: Rate limiting middleware
- **Notes**: 
  - Typically used for health checks and monitoring endpoints
  - Use exact path matches (no wildcards)

---

## Spam Guard

Configuration for spam protection on comments and ticket submissions.

### `SPAM_GUARD_ENABLED`

- **Type**: Optional
- **Description**: Enable or disable spam guard
- **Format**: Boolean string (`true` | `false`)
- **Example**: `true`
- **Security Notes**: Should be enabled in production to prevent spam
- **Default**: `true`
- **Used In**: Spam guard middleware
- **Notes**: 
  - Disable only for development/testing
  - Always enable in production

### `SPAM_GUARD_COOLDOWN_MS`

- **Type**: Optional
- **Description**: Minimum time between submissions from the same user (in milliseconds)
- **Format**: Integer (milliseconds)
- **Example**: `10000` (10 seconds)
- **Security Notes**: None
- **Default**: `10000` (10 seconds)
- **Used In**: Spam guard middleware
- **Notes**: 
  - Prevents rapid-fire submissions
  - Adjust based on your use case (comments vs tickets)

---

## Attachment Configuration

Configuration for file attachments on tickets.

### `ATTACH_ALLOWED_MIME`

- **Type**: Optional
- **Description**: Comma-separated list of allowed MIME types for attachments
- **Format**: Comma-separated MIME types
- **Example**: `image/png,image/jpeg,application/pdf,text/plain`
- **Security Notes**: Restrict to safe file types to prevent malicious uploads
- **Default**: `image/png,image/jpeg,application/pdf,text/plain`
- **Used In**: Attachment validation
- **Notes**: 
  - Common safe types: images (png, jpeg, gif), documents (pdf), text files
  - Avoid executable types: `application/x-executable`, `application/x-msdownload`
  - Can include specific extensions: `image/*` (all images)

### `ATTACH_MAX_BYTES`

- **Type**: Optional
- **Description**: Maximum file size for attachments in bytes
- **Format**: Integer (bytes)
- **Example**: `26214400` (25 MB)
- **Security Notes**: None
- **Default**: `26214400` (25 MB)
- **Used In**: Attachment validation
- **Notes**: 
  - Common values: 10485760 (10 MB), 26214400 (25 MB), 52428800 (50 MB)
  - Consider storage costs and upload times
  - Enforced on both client and server

### `NEXT_PUBLIC_ATTACHMENTS_ENABLED`

- **Type**: Optional
- **Description**: Enable or disable attachment uploads in the UI
- **Format**: Boolean string (`true` | `false`)
- **Example**: `true`
- **Security Notes**: This is a Next.js public variable (exposed to browser). Do not include secrets.
- **Default**: `true`
- **Used In**: Frontend attachment picker component
- **Notes**: 
  - When `false`, upload controls are hidden (read-only list remains)
  - Useful for disabling uploads without code changes
  - Next.js public variables are prefixed with `NEXT_PUBLIC_`

---

## SLA Configuration

Configuration for SLA (Service Level Agreement) monitoring and reminders.

### `SLA_REMINDER_LEAD_MINUTES`

- **Type**: Optional
- **Description**: How many minutes before SLA deadline to send reminder notifications
- **Format**: Integer (minutes)
- **Example**: `30`
- **Security Notes**: None
- **Default**: `30`
- **Used In**: SLA scheduler, reminder notifications
- **Notes**: 
  - Sends reminders X minutes before SLA deadline
  - Common values: 15, 30, 60 minutes
  - Set to 0 to disable reminders

---

## Ticket Reopen Configuration

Configuration for ticket reopen throttling to prevent abuse.

### `REOPEN_COOLDOWN_ENABLED`

- **Type**: Optional
- **Description**: Enable cooldown period between ticket reopens
- **Format**: Boolean string (`true` | `false`)
- **Example**: `true`
- **Security Notes**: Should be enabled to prevent reopen abuse
- **Default**: `true`
- **Used In**: Ticket reopen validation
- **Notes**: 
  - Prevents users from repeatedly reopening tickets
  - Disable only for development/testing

### `REOPEN_COOLDOWN_MS`

- **Type**: Optional
- **Description**: Minimum time between ticket reopens (in milliseconds)
- **Format**: Integer (milliseconds)
- **Example**: `600000` (10 minutes)
- **Security Notes**: None
- **Default**: `600000` (10 minutes)
- **Used In**: Ticket reopen validation
- **Notes**: 
  - Prevents rapid reopen cycles
  - Common values: 300000 (5 min), 600000 (10 min), 3600000 (1 hour)

---

## Security & Authentication

Additional security and authentication configuration.

### `CSAT_SECRET`

- **Type**: Optional
- **Description**: Secret key for CSAT (Customer Satisfaction) token signing
- **Format**: Base64-encoded string (recommended: 32+ bytes)
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- **Security Notes**: **SECRET** - Keep secure. Falls back to `NEXTAUTH_SECRET` if not set.
- **Default**: Falls back to `NEXTAUTH_SECRET`
- **Used In**: CSAT token generation and validation
- **Generation**: 
  ```bash
  openssl rand -base64 32
  ```
- **Notes**: 
  - Used to sign CSAT survey tokens
  - If not set, uses `NEXTAUTH_SECRET` as fallback
  - Should be unique per deployment

---

## Development & Debugging

Variables for development and debugging purposes.

### `LOG_QUERY_TIME`

- **Type**: Optional
- **Description**: Enable logging of database query execution times
- **Format**: Boolean string (`true` | `false`)
- **Example**: `false`
- **Security Notes**: None
- **Default**: `false` (enabled automatically in development via `NODE_ENV`)
- **Used In**: Prisma query logging
- **Notes**: 
  - Automatically enabled when `NODE_ENV=development`
  - Can be explicitly enabled in production for performance analysis
  - Useful for identifying slow queries

---

## Deployment Configuration

Variables used during deployment and containerization.

### `APP_PORT`

- **Type**: Optional
- **Description**: Port number for the Next.js application
- **Format**: Integer
- **Example**: `3000`
- **Security Notes**: None
- **Default**: `3000`
- **Used In**: Docker Compose port mapping
- **Notes**: 
  - Used by `docker-compose.prod.yml` for port mapping
  - Next.js default port is 3000
  - Change if port 3000 is already in use

---

## Docker Compose Variables

These variables are used by `docker-compose.yml` and `docker-compose.prod.yml` for service configuration. They are not required if using external services.

### `POSTGRES_USER`

- **Type**: Optional (Docker Compose only)
- **Description**: PostgreSQL database user
- **Format**: String
- **Example**: `postgres`
- **Security Notes**: None (used only by Docker Compose)
- **Default**: `postgres`
- **Used In**: Docker Compose PostgreSQL service
- **Notes**: Only used when running PostgreSQL via Docker Compose

### `POSTGRES_PASSWORD`

- **Type**: Optional (Docker Compose only)
- **Description**: PostgreSQL database password
- **Format**: String
- **Example**: `postgres`
- **Security Notes**: **SECRET** - Keep secure. Used only by Docker Compose.
- **Default**: `postgres`
- **Used In**: Docker Compose PostgreSQL service
- **Notes**: 
  - Only used when running PostgreSQL via Docker Compose
  - Change default password in production
  - Must match the password in `DATABASE_URL`

### `POSTGRES_DB`

- **Type**: Optional (Docker Compose only)
- **Description**: PostgreSQL database name
- **Format**: String
- **Example**: `helpdesk`
- **Security Notes**: None
- **Default**: `helpdesk`
- **Used In**: Docker Compose PostgreSQL service
- **Notes**: Only used when running PostgreSQL via Docker Compose

### `MINIO_ROOT_USER`

- **Type**: Optional (Docker Compose only)
- **Description**: Root username for MinIO service
- **Format**: String
- **Example**: `minio`
- **Security Notes**: None (used only by Docker Compose)
- **Default**: `minio`
- **Used In**: Docker Compose MinIO service
- **Notes**: Only used when running MinIO via Docker Compose

### `MINIO_ROOT_PASSWORD`

- **Type**: Optional (Docker Compose only)
- **Description**: Root password for MinIO service
- **Format**: String
- **Example**: `minio-minio`
- **Security Notes**: **SECRET** - Keep secure. Used only by Docker Compose.
- **Default**: `minio-minio` (development only)
- **Used In**: Docker Compose MinIO service
- **Notes**: 
  - Only used when running MinIO via Docker Compose
  - Change default password in production
  - Must be at least 8 characters long

### `MINIO_BROWSER_REDIRECT_URL`

- **Type**: Optional (Docker Compose only)
- **Description**: URL for MinIO web console
- **Format**: Full URL
- **Example**: `http://localhost:9001`
- **Security Notes**: None
- **Default**: `http://localhost:9001`
- **Used In**: Docker Compose MinIO service
- **Notes**: Only used when running MinIO via Docker Compose

---

## Security Best Practices

1. **Never commit secrets**: Never commit `.env` or `.env.local` files to version control
2. **Use strong secrets**: Generate `NEXTAUTH_SECRET` and `CSAT_SECRET` using `openssl rand -base64 32`
3. **Rotate secrets regularly**: Rotate secrets periodically, especially if compromised
4. **Use environment-specific values**: Use different values for development, staging, and production
5. **Use secret management**: In production, use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)
6. **Enable HTTPS**: Always use `https://` in production URLs (`NEXTAUTH_URL`, `STORAGE_BASE_URL`)
7. **Use TLS for databases**: Use SSL/TLS connections for `DATABASE_URL` and `REDIS_URL` in production
8. **Restrict file types**: Only allow safe MIME types in `ATTACH_ALLOWED_MIME`
9. **Enable rate limiting**: Always enable `RATE_LIMIT_ENABLED` in production
10. **Monitor logs**: Regularly review logs for exposed secrets or sensitive information

---

## Quick Reference

### Minimum Required for Local Development

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/helpdesk
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### Production Checklist

- [ ] `DATABASE_URL` with SSL (`?sslmode=require`)
- [ ] Strong `NEXTAUTH_SECRET` (32+ bytes)
- [ ] `NEXTAUTH_URL` with `https://`
- [ ] `NODE_ENV=production`
- [ ] `REDIS_URL` with TLS (`rediss://`)
- [ ] `EMAIL_ENABLED=true` with valid SMTP credentials
- [ ] `RATE_LIMIT_ENABLED=true`
- [ ] `SPAM_GUARD_ENABLED=true`
- [ ] All secrets stored in secret management service
- [ ] `.env` file not committed to version control

---

## Related Documentation

- [Deployment Guide](./deployment.md) - Full deployment instructions
- [Setup Instructions](./setup-instructions.md) - Local development setup
- [Worker Deployment Runbook](./worker-deployment-runbook.md) - Worker-specific deployment

