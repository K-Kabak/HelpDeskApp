# Security & Operations

## Baseline Checklist (current vs gaps)
| Area | Exists (evidence) | Missing / Priority Gap |
| --- | --- | --- |
| AuthN | NextAuth credentials with bcrypt verification and JWT sessions; custom sign-in page configured.【F:src/lib/auth.ts†L21-L80】 | No MFA, password policy, or rate limiting on login; demo credentials published.【F:README.md†L42-L61】 |
| AuthZ | API guards enforce requester vs agent/admin for updates and assignments; org filter used in ticket list and creation.【F:src/app/api/tickets/route.ts†L16-L88】【F:src/app/api/tickets/[id]/route.ts†L59-L166】 | Ticket detail page fetch lacks org filter; comment list not server-filtered for requesters.【F:src/app/app/tickets/[id]/page.tsx†L30-L220】 |
| Data validation | Zod schemas validate ticket create/update/comment payloads.【F:src/app/api/tickets/route.ts†L9-L50】【F:src/app/api/tickets/[id]/route.ts†L8-L57】【F:src/app/api/tickets/[id]/comments/route.ts†L7-L59】 | No server-side length limits for markdown/inputs beyond min; no file validation (uploads absent). |
| Secrets/config | README documents `DATABASE_URL` and `NEXTAUTH_SECRET` envs; Prisma uses env var for DB connection.【F:README.md†L21-L35】【F:prisma/schema.prisma†L4-L27】 | No `.env.example`; no secret rotation guidance or vault integration. |
| Logging/Audit | Prisma dev logging; audit events recorded on ticket create/update.【F:src/lib/prisma.ts†L5-L13】【F:src/app/api/tickets/route.ts†L64-L88】【F:src/app/api/tickets/[id]/route.ts†L172-L194】 | Audit integrity not enforced; no structured security logs or retention plan. |
| Dependency/CI | Scripts for lint/test/e2e exist in package.json.【F:package.json†L5-L26】 | CI pipeline not described; no SCA/secret scans enforced. |
| Availability | Docker compose provides single Postgres instance.【F:docker-compose.yml†L1-L15】 | No health checks, backups, or scaling guidance. |
| Features in backlog | Attachments/exports planned but not implemented.【F:README.md†L63-L66】 | Need security design for uploads/exports before build. |

## Upload Security Policy (to implement)
- **Scope & location**: implement upload handler under `src/app/api/attachments/route.ts` with Prisma `Attachment` metadata linking ticket/org.【F:prisma/schema.prisma†L130-L158】
- **Controls**:
  - Enforce MIME/extension allowlist (e.g., `.png,.jpg,.pdf,.txt`); block executables and scripts.
  - Size limits (e.g., 10MB request limit via Next.js route config + streaming storage).
  - Store via signed URLs to object storage; require short-lived write URL and separate read URL scoped by ticket/org.
  - Antivirus scan hook prior to marking attachment active; quarantine failures.
  - Require authenticated user and verify ticket `organizationId` & role before issuing URLs.
- **Verification**: integration tests uploading disallowed types and oversize files expecting 400; unit tests for org check; E2E ensuring requester cannot read other org’s files; manual AV scan logs review.

## Rate Limiting Strategy
- **Where**: add middleware in `middleware.ts` for auth routes (`/api/auth/*`, `/api/tickets*`) using IP + user key; fallback limiter helper in `src/lib/rate-limit.ts` backed by Redis.
- **Policies**:
  - Login: 5 attempts/15 minutes per IP+email; exponential backoff.
  - Ticket/comment writes: 60 requests/10 minutes per user; stricter for anonymous (should be none).
- **Verification**: load tests simulating bursts expecting 429; unit tests on limiter helper; observe metrics in logs/telemetry dashboards.

## Logging, Secrets, and Audit Integrity Rules
- **Logging**: convert Prisma logs to structured sink (e.g., pino) with PII redaction; production log level `error` only for DB client is already configured.【F:src/lib/prisma.ts†L5-L13】 Add request logging middleware with correlation IDs and audit of auth failures.
- **Secrets**: require `.env.example` with no secrets; store real secrets in vault; rotate demo credentials from seed after first run.【F:prisma/seed.js†L7-L146】
- **Audit Integrity**: extend `AuditEvent` with hash of previous event + canonical payload, stored server-side only. Enforce append-only writes via transaction. Verify chain during incident response.
- **Verification**: CI secret scan; unit tests generating audit hash chain; staging log review ensuring redaction; periodic credential rotation checklist.

## Operational Priorities (missing → highest first)
1. Add org-level access controls to all ticket/comment queries (block cross-org data leakage).
2. Implement markdown sanitization and CSP.
3. Introduce rate limiting + password policy for credential logins.
4. Build upload pipeline with AV and signed URLs before enabling attachments.
5. Create CI pipeline with lint/tests/SCA/secret-scan gates and deploy health checks.

## Baseline Checklist (current vs gaps)
| Area | Exists (evidence) | Missing / Priority Gap |
| --- | --- | --- |
| AuthN | Credential login via NextAuth with bcrypt verification and JWT sessions; login page routed through middleware.【F:src/lib/auth.ts†L21-L80】【F:middleware.ts†L1-L5】 | No MFA, CSRF token for credential form, or rate limiting. |
| AuthZ & org scoping | Ticket list scoped by requester vs org; ticket update API enforces org ownership and role checks for priority/assignee changes.【F:src/app/api/tickets/route.ts†L16-L38】【F:src/app/api/tickets/[id]/route.ts†L35-L166】 | Ticket detail page lacks org filter and relies on client-side filtering for internal comments; admin RBAC unspecified.【F:src/app/app/tickets/[id]/page.tsx†L51-L220】 |
| Data validation | Zod schemas enforce presence/min lengths on ticket/comment payloads.【F:src/app/api/tickets/route.ts†L9-L50】【F:src/app/api/tickets/[id]/comments/route.ts†L7-L39】 | Max lengths, request size limits, and file validation absent. |
| Secrets/config | `DATABASE_URL` and `NEXTAUTH_SECRET` documented; Prisma uses env var datasource.【F:README.md†L16-L35】【F:prisma/schema.prisma†L1-L27】 | No `.env.example` committed; no secret rotation guidance or vault use. |
| Logging/Audit | Prisma client configured with minimal logging; audit events recorded on ticket create/update.【F:src/lib/prisma.ts†L5-L13】【F:src/app/api/tickets/[id]/route.ts†L176-L194】 | No tamper-proof audit chain, no structured security logs, no retention/PII scrubbing policy. |
| Dependency/CI | Scripts for lint/test/e2e exist in package.json.【F:package.json†L5-L64】 | CI pipeline, SCA, secret scanning, and coverage gates not yet defined. |
| Availability | Docker Compose provides single Postgres service for local dev.【F:docker-compose.yml†L1-L15】 | No health checks, backups, or HA guidance. |
| Attachments/exports | Attachment model exists only; exports not built.【F:prisma/schema.prisma†L130-L158】【F:README.md†L63-L66】 | Upload routing, scanning, signed URLs, and export scoping not implemented (high priority before release). |

Unknown items (e.g., infra firewalling, CDN settings) must be validated during deployment design; add verification tasks in runbooks.

## Upload Security Policy (to implement before enabling)
- **Location**: Create API routes under `src/app/api/attachments` issuing signed URLs tied to `Attachment` records with org/ticket ownership.【F:prisma/schema.prisma†L130-L158】
- **Controls**: MIME/extension allowlist (png,jpg,pdf,txt), max size 10MB enforced via route config and storage bucket policy; store in object storage with short-lived write/read URLs; require authenticated user with matching `organizationId`; AV scan hook before marking attachment active; retain audit entry linking uploader and checksum.
- **Checklist**: Threat review for signed URL scope, MIME sniffing disabled, server-side size validation, quarantine bucket, per-org path prefix, and authorization on every fetch.
- **Verification**: Integration tests for disallowed MIME/oversize, cross-org access attempts, expired URL reuse; manual review of AV scan logs and audit rows.

## Rate Limiting Strategy
- **Placement**: Add middleware limiter (e.g., Redis) for `/api/auth/*`, `/api/tickets*`, `/api/tickets/*/comments`, and future `/api/attachments*` endpoints.
- **Policies**: Login 5 attempts/15m per IP+email; ticket/comment writes 60/10m per user; attachment URLs single-use, expiring in 5m; anonymous access blocked.
- **Verification**: Load test confirming 429 after thresholds; unit tests on limiter helper; observability emits metrics for allow/deny counts.

## Logging, Secrets, and Audit Integrity
- **Logging**: Switch Prisma to structured logger with correlation IDs; capture auth failures, rate-limit denies, attachment AV results; scrub PII (passwords/tokens); restrict prod log level to `warn`/`error`.【F:src/lib/prisma.ts†L5-L13】
- **Secrets**: Provide `.env.example` with placeholders; store real secrets in vault/secret manager; rotate demo credentials from seed after first run or disable seed in prod.【F:prisma/seed.js†L14-L53】【F:README.md†L41-L43】
- **Audit integrity**: Extend `AuditEvent` with hash of previous event and immutable timestamps; append-only writes in transactions; verify chain regularly.
- **Verification**: CI secret scan; staging log review ensures redaction; periodic audit chain check; alert on missing environment variables at boot.

## Data Retention / Privacy
- Tickets/comments/audit retained per org policy; define retention configs per environment and purge jobs with audit trail (Unknown until policy agreed—validate with stakeholders).
- Anonymize requester personal data on account deletion requests; ensure backups follow same retention and encryption controls.

## Operational Priorities (highest first)
1. Fix org scoping gaps in UI queries and comment visibility; add sanitization for markdown before launch.
2. Add rate limiting + CSRF protection on auth; enforce password policy.
3. Implement attachment pipeline with allowlist, size caps, signed URLs, AV scanning, and audits.
4. Establish CI gates (lint, tests, SCA, secret scan, coverage) and production health checks/backups.
5. Harden audit logging (hash chain) and structured security telemetry.
