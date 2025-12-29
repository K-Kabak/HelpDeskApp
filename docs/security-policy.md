# Security Policy

## Authentication Requirements

- Credential-based logins via NextAuth and bcrypt-hashed passwords; password checks use at least 12 salt rounds and are throttled by admission rate limiting.
- Sessions are issued as JWT tokens with `SameSite`, `Secure`, and `HttpOnly` cookie flags enforced by `NEXTAUTH_OPTIONS`; tokens include `role` and `organizationId` claims to support downstream authorization.
- Login endpoints are guarded by per-IP rate limiting and monitored for failed attempts so suspicious credential stuffing is surfaced as security events.
- Service-to-service or automation integrations must use scoped API tokens that are rotated on a regular cadence; no secrets are committed to the repository and `.env.local` remains git-ignored.

## Authorization Model

- Roles: `REQUESTER` (ticket creator), `AGENT` (organization staff), `ADMIN` (tenant admin). Role metadata flows through NextAuth callbacks into every request context.
- Organization scoping is enforced at the Prisma layer via `ticketScope()` and `isSameOrganization()` helpers so every ticket, comment, attachment, and audit query filters by the caller’s organization.
- Administrative endpoints such as `/api/admin/*` require `ADMIN` role checks before performing writes or reads; RBAC decisions are centralized in shared helpers to avoid drift.
- Authorization failures are treated as security events (`authorization_failure`) and logged with request IDs to aid incident review.

## Data Protection

- Sensitive data (password hashes, session tokens, audit trails) is stored in the database behind Prisma and never leaked to clients; API responses are shaped strictly (`{ error: { code, message } }`) to avoid stack trace leakage.
- All Markdown content is sanitized with `rehype-sanitize` before rendering, and rendered pages enforce a Content Security Policy via `next.config.ts`.
- Attachments remain in private storage with signed URLs, and uploads enforce file-type allowlists, size caps, and antivirus scans before ingestion.
- Logging captures security-relevant metadata (user ID, route, request ID) while stripping PII, and logs (including security events) are retained according to the platform’s retention policy.

## Security Best Practices

- Rate limits exist per route (auth, ticket/comment create, bulk operations) and are enabled by default in production (`RATE_LIMIT_ENABLED=true`); overridable routes can be inspected via `rate-limit.ts`.
- Input validation relies on Zod schemas with explicit max lengths, and request bodies are sanitized/validated before touching Prisma.
- Security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) are configured in `next.config.ts`, and HTTPS is required in production deployments.
- Secrets management expects environment variables for `DATABASE_URL`, `NEXTAUTH_SECRET`, `REDIS_URL`, `SMTP_*`, and rate-limiting knobs; `.env.example` documents these variables for local setup.
- Dependencies follow the team’s update cadence, and automated scans or dependency-check tools are run before releases.

## Incident Response

- Security events (failed logins, auth failures, rate-limit violations, suspicious cross-org access) are logged through `src/lib/logger.ts` with warn/error levels and routed to the platform’s observability stack.
- On detection, the on-call engineer follows `docs/security-ops.md` for escalation: investigate logs, isolate affected services, rotate compromised credentials, and document the timeline in the incident channel.
- Post-incident reviews update the threat model (`docs/threat-model.md`) and introduce new validation/monitoring requirements as needed.
- Communication includes notifying stakeholders, filing tickets for remediation, and closing visibility gaps via tests or documentation updates.




