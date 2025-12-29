# Production Environment Configuration Verification

This document provides a comprehensive checklist and verification procedures for production environment configuration, including environment variables, secrets management, SSL/TLS, and security headers.

## Overview

Before deploying to production, all environment configurations must be verified to ensure:
- All required environment variables are set
- Secrets are properly managed and not exposed
- SSL/TLS is properly configured
- Security headers are correctly set
- Configuration follows security best practices

---

## 1. Environment Variables Verification

### 1.1. Required Variables Checklist

Verify the following required variables are set:

- [ ] `DATABASE_URL` - PostgreSQL connection string with SSL in production
- [ ] `NEXTAUTH_SECRET` - Strong secret (32+ bytes, Base64)
- [ ] `NEXTAUTH_URL` - Production URL with `https://` protocol
- [ ] `NODE_ENV` - Set to `production`

**Verification Commands:**

```bash
# Check required variables are set
node scripts/validate-env.mjs

# Verify DATABASE_URL uses SSL (production)
echo $DATABASE_URL | grep -q "sslmode=require" && echo "✓ SSL enabled" || echo "✗ SSL not enabled"

# Verify NEXTAUTH_URL uses HTTPS
echo $NEXTAUTH_URL | grep -q "^https://" && echo "✓ HTTPS enabled" || echo "✗ HTTPS not enabled"

# Verify NODE_ENV is production
[ "$NODE_ENV" = "production" ] && echo "✓ NODE_ENV is production" || echo "✗ NODE_ENV is not production"
```

### 1.2. Database Configuration

**Production Requirements:**
- `DATABASE_URL` must include `?sslmode=require` for encrypted connections
- Connection pooling parameters should be configured appropriately
- Database user should have minimal required permissions

**Verification:**

```bash
# Test database connection with SSL
psql "$DATABASE_URL" -c "SELECT version();" || echo "✗ Database connection failed"

# Verify SSL is required (connection should fail without SSL in production)
psql "$DATABASE_URL?sslmode=disable" -c "SELECT 1;" 2>&1 | grep -q "SSL" && echo "✓ SSL enforcement working" || echo "✗ SSL not enforced"
```

**Recommended Production Format:**

```bash
DATABASE_URL=postgresql://user:password@host:5432/helpdesk?connection_limit=10&pool_timeout=20&sslmode=require
```

### 1.3. NextAuth Configuration

**Production Requirements:**
- `NEXTAUTH_SECRET` must be at least 32 characters (Base64 encoded)
- `NEXTAUTH_URL` must use `https://` protocol
- Secret should be unique per deployment environment
- Secret should be rotated periodically

**Verification:**

```bash
# Check NEXTAUTH_SECRET length (should be at least 32 chars after Base64 decode)
SECRET_LENGTH=$(echo -n "$NEXTAUTH_SECRET" | base64 -d 2>/dev/null | wc -c)
[ "$SECRET_LENGTH" -ge 32 ] && echo "✓ Secret length OK" || echo "✗ Secret too short"

# Generate new secret if needed
openssl rand -base64 32
```

**Generation Command:**

```bash
# Generate strong NEXTAUTH_SECRET
openssl rand -base64 32
```

### 1.4. Optional Variables Verification

Verify optional variables are set with appropriate production values:

- [ ] `REDIS_URL` - Should use TLS (`rediss://`) in production
- [ ] `EMAIL_ENABLED` - Set to `true` if email notifications are required
- [ ] `SMTP_*` variables - All SMTP configuration if email is enabled
- [ ] `RATE_LIMIT_ENABLED` - Should be `true` in production
- [ ] `SPAM_GUARD_ENABLED` - Should be `true` in production
- [ ] `STORAGE_BASE_URL` - Should use `https://` in production

**Verification:**

```bash
# Check Redis URL uses TLS in production
echo $REDIS_URL | grep -q "^rediss://" && echo "✓ Redis TLS enabled" || echo "✗ Redis TLS not enabled"

# Verify rate limiting is enabled
[ "$RATE_LIMIT_ENABLED" = "true" ] && echo "✓ Rate limiting enabled" || echo "✗ Rate limiting disabled"

# Verify spam guard is enabled
[ "$SPAM_GUARD_ENABLED" = "true" ] && echo "✓ Spam guard enabled" || echo "✗ Spam guard disabled"
```

---

## 2. Secrets Management Verification

### 2.1. Secret Storage

**Requirements:**
- Secrets must NOT be stored in `.env` files committed to version control
- Secrets should be stored in a secret management service (AWS Secrets Manager, HashiCorp Vault, etc.)
- Secrets should be injected at runtime, not baked into images

**Verification Checklist:**

- [ ] `.env` files are in `.gitignore`
- [ ] No secrets in `package.json`, `docker-compose.yml`, or source code
- [ ] Secrets are injected via environment variables or secret management service
- [ ] No hardcoded secrets in configuration files
- [ ] Secrets are rotated periodically

**Verification Commands:**

```bash
# Check .gitignore includes .env files
grep -q "\.env" .gitignore && echo "✓ .env in .gitignore" || echo "✗ .env not in .gitignore"

# Search for potential secrets in code (password, secret, key patterns)
grep -r -i "password\s*=\s*['\"][^'\"]" --exclude-dir=node_modules --exclude="*.md" . && echo "✗ Potential hardcoded passwords found" || echo "✓ No hardcoded passwords found"

# Check docker-compose files don't contain secrets
grep -E "(password|secret|key)\s*:\s*[^$]" docker-compose*.yml && echo "✗ Secrets in docker-compose files" || echo "✓ No secrets in docker-compose files"
```

### 2.2. Secret Rotation

**Requirements:**
- Secrets should be rotated periodically (recommended: every 90 days)
- Secret rotation process should be documented
- Old secrets should be invalidated after rotation

**Verification:**

- [ ] Secret rotation procedure is documented
- [ ] Last rotation date is recorded
- [ ] Secrets are scheduled for next rotation

---

## 3. SSL/TLS Configuration Verification

### 3.1. HTTPS Enforcement

**Requirements:**
- All production URLs must use `https://` protocol
- HTTP requests should be redirected to HTTPS
- SSL certificates must be valid and not expired

**Code Verification:**

The application enforces HTTPS in production via `middleware.ts`:

```typescript
// middleware.ts lines 8-14
if (process.env.NODE_ENV === "production") {
  const proto = req.headers.get("x-forwarded-proto");
  if (proto && proto !== "https") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
}
```

**Verification Checklist:**

- [ ] `NEXTAUTH_URL` uses `https://`
- [ ] `STORAGE_BASE_URL` uses `https://` (if set)
- [ ] Middleware enforces HTTPS redirects (verified in code)
- [ ] SSL certificate is valid and not expired
- [ ] SSL certificate covers all required domains

**Verification Commands:**

```bash
# Check SSL certificate validity
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates

# Test HTTPS redirect
curl -I http://your-domain.com 2>&1 | grep -q "301\|302" && echo "✓ HTTPS redirect working" || echo "✗ HTTPS redirect not working"

# Verify HTTPS endpoint is accessible
curl -I https://your-domain.com 2>&1 | grep -q "200 OK" && echo "✓ HTTPS endpoint accessible" || echo "✗ HTTPS endpoint not accessible"
```

### 3.2. Database SSL/TLS

**Requirements:**
- `DATABASE_URL` must include `sslmode=require` in production
- Database connections should use encrypted connections

**Verification:**

- [ ] `DATABASE_URL` contains `sslmode=require`
- [ ] Database connection test succeeds with SSL
- [ ] Connection fails when SSL is disabled

**Verification Command:**

```bash
# Test database connection with SSL
psql "$DATABASE_URL" -c "SELECT version();" || echo "✗ Database connection failed"
```

### 3.3. Redis TLS

**Requirements:**
- `REDIS_URL` should use `rediss://` (TLS) in production if available
- Redis connections should be encrypted

**Verification:**

- [ ] `REDIS_URL` uses `rediss://` protocol (if TLS is available)
- [ ] Redis connection test succeeds with TLS

**Verification Command:**

```bash
# Check Redis URL uses TLS
echo $REDIS_URL | grep -q "^rediss://" && echo "✓ Redis TLS enabled" || echo "⚠ Redis TLS not enabled (may be acceptable if Redis is internal)"
```

---

## 4. Security Headers Verification

### 4.1. Security Headers Configuration

The application configures security headers in `next.config.ts`:

**Configured Headers:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `Content-Security-Policy` (comprehensive CSP)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

**Verification Checklist:**

- [ ] Security headers are configured in `next.config.ts` (verified in code)
- [ ] Headers are present in production responses
- [ ] CSP allows necessary resources (Next.js, Tailwind)
- [ ] HSTS is configured with appropriate max-age

**Verification Commands:**

```bash
# Check security headers on production URL
curl -I https://your-domain.com 2>&1 | grep -iE "(x-frame-options|x-content-type-options|referrer-policy|strict-transport-security|content-security-policy)" && echo "✓ Security headers present" || echo "✗ Security headers missing"

# Detailed header check
curl -I https://your-domain.com 2>&1 | grep -i "strict-transport-security" | grep -q "max-age=31536000" && echo "✓ HSTS configured" || echo "✗ HSTS not configured"

# Check CSP header
curl -I https://your-domain.com 2>&1 | grep -i "content-security-policy" && echo "✓ CSP configured" || echo "✗ CSP not configured"
```

### 4.2. Header Verification Tools

You can also use online tools to verify security headers:
- [SecurityHeaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)

**Expected Results:**
- Security Headers Grade: A or higher
- HSTS: Enabled
- CSP: Present and configured
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

---

## 5. Production Configuration Checklist

### Complete Production Configuration Checklist

**Environment Variables:**
- [ ] `DATABASE_URL` with SSL (`?sslmode=require`)
- [ ] `NEXTAUTH_SECRET` (32+ bytes, Base64)
- [ ] `NEXTAUTH_URL` with `https://`
- [ ] `NODE_ENV=production`
- [ ] `REDIS_URL` with TLS (`rediss://`) if available
- [ ] `EMAIL_ENABLED=true` if email is required
- [ ] All `SMTP_*` variables if email is enabled
- [ ] `RATE_LIMIT_ENABLED=true`
- [ ] `SPAM_GUARD_ENABLED=true`
- [ ] `STORAGE_BASE_URL` with `https://` if set

**Secrets Management:**
- [ ] `.env` files in `.gitignore`
- [ ] No secrets in version control
- [ ] Secrets stored in secret management service
- [ ] Secret rotation procedure documented

**SSL/TLS:**
- [ ] HTTPS enforced for all URLs
- [ ] SSL certificate valid and not expired
- [ ] Database connections use SSL
- [ ] Redis connections use TLS (if available)

**Security Headers:**
- [ ] All security headers present in responses
- [ ] CSP configured correctly
- [ ] HSTS enabled with appropriate max-age

**Verification:**
- [ ] Environment validation script passes
- [ ] Security headers verified
- [ ] SSL certificate verified
- [ ] Database connection tested
- [ ] All checks pass

---

## 6. Automated Verification Script

Create a verification script to automate these checks. Example structure:

```bash
#!/bin/bash
# scripts/verify-production-env.sh

set -e

echo "=== Production Environment Verification ==="

# Check required variables
echo "Checking required environment variables..."
node scripts/validate-env.mjs

# Check SSL/TLS
echo "Checking SSL/TLS configuration..."
if ! echo "$DATABASE_URL" | grep -q "sslmode=require"; then
  echo "✗ DATABASE_URL missing sslmode=require"
  exit 1
fi

if ! echo "$NEXTAUTH_URL" | grep -q "^https://"; then
  echo "✗ NEXTAUTH_URL must use https://"
  exit 1
fi

# Check security headers (requires running application)
echo "Checking security headers..."
HEADERS=$(curl -sI https://your-domain.com)
if ! echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
  echo "✗ HSTS header missing"
  exit 1
fi

echo "✓ All checks passed"
```

---

## 7. Documentation

### Related Documentation

- [Environment Variables](./environment-variables.md) - Complete environment variable reference
- [Deployment Guide](./deployment.md) - Deployment procedures
- [Security Review](./security-review.md) - Security review procedures
- [Production Readiness Checklist](./production-readiness-checklist.md) - Complete production readiness checklist

---

## 8. Troubleshooting

### Common Issues

**Issue: DATABASE_URL SSL not working**
- Verify database server supports SSL
- Check `sslmode=require` is included in connection string
- Verify certificate is valid

**Issue: Security headers not present**
- Verify `next.config.ts` headers configuration
- Check if headers are being stripped by reverse proxy
- Ensure application is running in production mode

**Issue: HTTPS redirect not working**
- Verify middleware is configured correctly
- Check reverse proxy configuration (if using)
- Ensure `x-forwarded-proto` header is set correctly

**Issue: Secrets exposed**
- Remove secrets from version control immediately
- Rotate all exposed secrets
- Review git history for other exposed secrets
- Update `.gitignore` if needed

---

## Quick Reference

### Production Environment Variables Template

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/helpdesk?connection_limit=10&pool_timeout=20&sslmode=require
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production

# Optional (with production defaults)
REDIS_URL=rediss://host:6380
RATE_LIMIT_ENABLED=true
SPAM_GUARD_ENABLED=true
STORAGE_BASE_URL=https://your-domain.com/uploads
```

### Verification Commands Summary

```bash
# Validate environment
node scripts/validate-env.mjs

# Check SSL certificate
openssl s_client -servername your-domain.com -connect your-domain.com:443

# Check security headers
curl -I https://your-domain.com

# Test database connection
psql "$DATABASE_URL" -c "SELECT version();"
```

