# Security Checklist

## Pre-Deployment Checks

- [ ] Verify that `RATE_LIMIT_ENABLED=true` in production configs and that critical routes (`/api/auth/*`, `/api/tickets`, `/api/tickets/*/comments`, `/api/tickets/bulk`) are covered by rate limiting.
- [ ] Confirm there is a up-to-date `.env.example` listing every required secret (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `REDIS_URL`, `SMTP_*`, `RATE_LIMIT_*`, etc.).
- [ ] Run the full test suite, including security-focused suites (`tests/authorization-security.test.ts`, `tests/security/*.test.ts`) and ensure the threat model reflects any new gaps.
- [ ] Validate that security headers from `next.config.ts` load in staging/prod via `curl -I` or automated smoke tests.
- [ ] Ensure input validation (Zod schemas, request size guards) accepts only expected lengths and types by reviewing change diffs or rerunning `tests/security/input-validation.test.ts`.
- [ ] Confirm secrets are not leaked in logs or error responses; review recent deployment logs for stack traces or secrets.
- [ ] Validate that attachments/uploads enforce MIME allowlists, size caps, and antivirus scans (run `runAttachmentScan` smoke paths if necessary).
- [ ] Double-check that `.env.local` remains git-ignored and that any git history cleanup steps have been performed if secrets were rotated.

## Security Configuration Checklist

- [ ] Enforce HTTPS in production, including redirection and HSTS (see `next.config.ts` and deployment docs).
- [ ] Apply CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` headers and confirm they match documented values.
- [ ] Keep NextAuth session cookies flagged `Secure`, `HttpOnly`, and `SameSite` to prevent CSRF/session fixation.
- [ ] Document and rotate secrets regularly (NEXTAUTH_SECRET, SMTP credentials, Redis credentials, database credentials).
- [ ] Ensure Prisma migrations are applied and audit events are captured for sensitive changes (ticket creation, status changes, attachment uploads).
- [ ] Maintain repository dependencies with npm/pnpm audit, and address high/critical alerts before release.
- [ ] Configure observability (logs, metrics, tracing) to surface authentication failures, rate-limit breaches, and suspicious cross-org access attempts.
- [ ] Protect data at rest via encrypted database/storage and restrict access to least-privilege roles.

## Monitoring Checklist

- [ ] Alerts monitor `security.failed_login`, `security.authorization_failure`, `security.rate_limit_violation`, and `security.suspicious_activity` log categories; verify alert thresholds and receivers.
- [ ] Rate limit dashboards show counters per route (auth, ticket creation, comments, bulk) and highlight saturation spikes.
- [ ] Audit trails (ticket actions, attachment uploads/deletions, policy changes) are retained, hashed, or forwarded to a long-lived log sink for tamper resistance.
- [ ] Security logging includes request IDs, user IDs, and metadata to make incident triage efficient.
- [ ] Suspicious activities (cross-org data access, repeated forbidden updates) trigger proactive reviews and optionally automated containment procedures.
- [ ] Regularly review monitoring data after deployments for anomalies, regression in rate limiting, or missing logs.






