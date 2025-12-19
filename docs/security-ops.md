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
>>>>>>> theirs
