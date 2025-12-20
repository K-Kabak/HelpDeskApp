# Security & Operations

<<<<<<< ours
## Baseline Checklist (evidence vs gaps)
| Area | Current state (with evidence) | Gap / priority |
| --- | --- | --- |
| Authn/z | NextAuth credentials with Prisma adapter, JWT roles/org claims (src/lib/auth.ts); `/app/*` protected by middleware (middleware.ts). | No MFA, no login throttling, CSRF/origin checks not enforced on APIs (P0). |
| Org scoping | Ticket APIs scope to requester or organization (src/app/api/tickets/route.ts) and updates require org match (src/app/api/tickets/[id]/route.ts). | Ticket detail page lacks org filter for agents/admins, enabling cross-org read (P0). |
| Input validation | Ticket create/update use Zod schemas (src/app/api/tickets/route.ts; src/app/api/tickets/[id]/route.ts). | Comment API missing; search uses nonexistent `description` field causing errors (src/app/app/page.tsx) (P0). |
| Audit trail | Ticket create/update write AuditEvent rows (src/app/api/tickets/route.ts; src/app/api/tickets/[id]/route.ts; prisma/schema.prisma). | No integrity protection/retention controls on audits (P1). |
| Logging | Prisma logs only errors in production (src/lib/prisma.ts). | No structured request/security logging or SIEM shipping (P1). |
| Rate limiting | None on auth or ticket endpoints (src/lib/auth.ts; src/app/api/tickets/route.ts; src/app/api/tickets/[id]/route.ts). | Add per-route + global limiter (P0). |
| Data handling | Markdown rendered without sanitization (src/app/app/tickets/[id]/page.tsx). | Add sanitizer and allowlist (P0). |
| Files | Attachment model exists (prisma/schema.prisma) but no upload/download routes. | Define upload policy + scanning before enabling (P1). |
| Resilience | No health/readiness endpoint or monitoring hooks under `src/app/api`. | Add `/api/health` + telemetry emitters (P1). |

## Upload Security Policy (to implement before enabling attachments)
- **Where:** Add `src/app/api/attachments/route.ts` (POST for signed upload) and `src/app/api/attachments/[id]/route.ts` (GET for signed download). Centralize validation in `src/lib/uploads.ts`.
- **Validation:** Enforce MIME allowlist (`image/jpeg`, `image/png`, `application/pdf`, `text/plain`) plus extension match; reject archives/executables. Enforce size cap (e.g., 10 MB) and per-ticket count limit. Persist metadata to `Attachment` (prisma/schema.prisma) after scan only.
- **Controls:** Require authenticated org/role checks on upload/download; generate signed, single-use URLs with short TTL; store in private bucket/storage provider. Run AV scan (e.g., ClamAV) and simple content-type sniffing; quarantine failures and log security event.
- **Verification:** Integration test uploads for allowed/blocked MIME + oversize; simulated EICAR sample rejected; signed URL expiry enforced; metadata rows only created after scan.

## Rate Limiting Strategy
- **Implementation points:** Extend middleware matcher to cover `/api/:path*` for generic IP + session token bucket; add per-route guards in `src/app/api/tickets/route.ts` and `src/app/api/tickets/[id]/route.ts` for stricter write limits; add NextAuth-specific limiter around credentials provider in `src/lib/auth.ts`.
- **Policies:** Auth: 5 attempts/10 min/IP; Ticket create/update/comment: 30/min/session; Ticket list/search: 60/min/session with pagination caps; Global burst cap to protect DB.
- **Verification:** Automated tests issuing >limit requests assert 429; observability counters exported; manual soak in staging confirms no regressions for normal traffic.

## Logging, Secrets Hygiene, Audit Integrity
- **Secrets:** Validate presence of `DATABASE_URL`, `NEXTAUTH_SECRET`, storage keys at startup; forbid defaults from seed in non-dev. Keep `.env.local` out of production and rotate secrets regularly.
- **Logging:** Enable structured JSON logs for auth attempts, ticket writes, and rate-limit triggers; redaction of PII; ship to centralized sink. Expand Prisma client logging to include slow query thresholds in `src/lib/prisma.ts`.
- **Audit integrity:** Add hash-chaining or signature on AuditEvent rows and store immutable copy (e.g., in object storage). Include actor, org, IP/UA for sensitive actions. Nightly job validates audit hash chain and alerts on mismatch.
- **Verification:** CI lint checks ensure `NEXTAUTH_SECRET` and DB URLs set; staging run captures structured logs; integrity check job reports success/fail and is covered by unit test over sample audit chain.
=======
>>>>>>> theirs
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
<<<<<<< ours
- **Checklist**: Threat review for signed URL scope, MIME sniffing disabled, server-side size validation, quarantine bucket, per-org path prefix, and authorization on every fetch.
- **Verification**: Integration tests for disallowed MIME/oversize, cross-org access attempts, expired URL reuse; manual review of AV scan logs and audit rows.

=======
- **Checklist**: Threat review for signed URL scope, MIME sniffing disabled, server-side size validation, quarantine bucket, per-org path prefix, and authorization on every fetch—keep aligned with attachment contract (signed URLs + allowlist + size caps + AV scan + audit trail) before rollout.【F:prisma/schema.prisma†L130-L158】
- **Verification**: Integration tests for disallowed MIME/oversize, cross-org access attempts, expired URL reuse; manual review of AV scan logs and audit rows.

## Error Handling & Content Safety
- **Error envelope standardization**: API routes currently return varied `{ error: string | object }` shapes; standardize to `{ error: { code, message } }` (and optionally `details`) to keep clients predictable and safer to log.【F:src/app/api/tickets/route.ts†L19-L88】【F:src/app/api/tickets/[id]/route.ts†L32-L196】【F:src/app/api/tickets/[id]/comments/route.ts†L18-L58】 Add contract tests to ensure consistent structure and status codes.
- **Markdown sanitization**: Ticket page renders markdown without sanitization, enabling XSS if untrusted content is stored.【F:src/app/app/tickets/[id]/page.tsx†L131-L215】 Enforce `rehype-sanitize` (or equivalent) and CSP; add unit/E2E tests that scripts remain escaped.

>>>>>>> theirs
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
