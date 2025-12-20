# Security & Operations

## Baseline Checklist (current vs gaps)
| Area | Exists (evidence) | Missing / Priority Gap |
| --- | --- | --- |
| AuthN | Credential login via NextAuth with bcrypt verification and JWT sessions; login page routed through middleware. | No MFA, CSRF token for credential form, or rate limiting. |
| AuthZ & org scoping | Ticket list scoped by requester vs org; ticket update API enforces org ownership and role checks for priority/assignee changes. | Ticket detail page lacks org filter; admin RBAC unspecified. |
| Data validation | Zod schemas enforce presence/min lengths on ticket/comment payloads. | Max lengths, request size limits, and file validation absent. |
| Secrets/config | `DATABASE_URL` and `NEXTAUTH_SECRET` documented; Prisma uses env var datasource. | No `.env.example` committed; no secret rotation guidance or vault use. |
| Logging/Audit | Prisma client configured with minimal logging; audit events recorded on ticket create/update. | No tamper-proof audit chain, no structured security logs, no retention/PII scrubbing policy. |
| Dependency/CI | Scripts for lint/test/e2e exist in package.json. | CI pipeline, SCA, secret scanning, and coverage gates not yet defined. |
| Availability | Docker Compose provides single Postgres service for local dev. | No health checks, backups, or HA guidance. |
| Attachments/exports | Attachment model exists only; exports not built. | Upload routing, scanning, signed URLs, and export scoping not implemented. |

Unknown items (e.g., infra firewalling, CDN settings) must be validated during deployment design; add verification tasks in runbooks.

## Upload Security Policy (to implement before enabling)
- Location: create API routes under `src/app/api/attachments` issuing signed URLs tied to `Attachment` records with org/ticket ownership.
- Controls: MIME/extension allowlist (png, jpg, pdf, txt), max size 10MB enforced via route config and storage bucket policy; store in object storage with short-lived write/read URLs; require authenticated user with matching `organizationId`; AV scan hook before marking attachment active; retain audit entry linking uploader and checksum.
- Checklist: signed URL scope reviewed, server-side size validation, quarantine bucket, per-org path prefix, authorization on every fetch, and alignment with attachment contract (signed URLs + allowlist + size caps + AV scan + audit trail) before rollout.
- Verification: integration tests for disallowed MIME/oversize, cross-org access attempts, expired URL reuse; manual review of AV scan logs and audit rows.

## Error Handling & Content Safety
- Standardize API errors to `{ error: { code, message } }` (optional `details`) so clients and logs are predictable; add contract tests for status codes.
- Ticket page renders markdown without sanitization; enable sanitization (rehype-sanitize or equivalent) and a CSP, and add tests that scripts are escaped.

## Rate Limiting Strategy
- Placement: add middleware limiter for `/api/auth/*`, `/api/tickets*`, `/api/tickets/*/comments`, and future `/api/attachments*` endpoints.
- Policies: login 5 attempts/15m per IP+email; ticket/comment writes 60/10m per user; attachment URLs single-use expiring in 5m; anonymous access blocked.
- Verification: load test confirming 429 after thresholds; unit tests on limiter helper; observability emits metrics for allow/deny counts.

## Logging, Secrets, and Audit Integrity
- Logging: switch Prisma to structured logger with correlation IDs; capture auth failures, rate-limit denies, attachment AV results; scrub PII and keep prod log level to warn/error.
- Secrets: provide `.env.example` with placeholders; store real secrets in a vault/secret manager; rotate demo credentials from seed after first run or disable seed in prod.
- Audit integrity: extend `AuditEvent` with hash of previous event and immutable timestamps; append-only writes in transactions; verify chain regularly.
- Verification: CI secret scan; staging log review ensures redaction; periodic audit chain check; alert on missing environment variables at boot.

## Data Retention / Privacy
- Define retention per environment and purge jobs with audit trail; anonymize requester personal data on account deletion; ensure backups follow the same retention and encryption controls.

## Operational Priorities (highest first)
1. Fix org scoping gaps in UI queries and comment visibility; add sanitization for markdown before launch.
2. Add rate limiting and CSRF protection on auth; enforce password policy.
3. Implement attachment pipeline with allowlist, size caps, signed URLs, AV scanning, and audits.
4. Establish CI gates (lint, tests, SCA, secret scan, coverage) and production health checks/backups.
5. Harden audit logging (hash chain) and structured security telemetry.
