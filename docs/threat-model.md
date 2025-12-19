# Threat Model

## Context and Trust Boundaries
<<<<<<< ours
- Public internet → Next.js app router UI under `/app/*` guarded by NextAuth middleware (middleware.ts). Authenticated requests carry a session JWT with `role` and `organizationId` claims set during login (src/lib/auth.ts).
- UI/server components call API routes that talk to Postgres via Prisma (src/app/api/tickets/route.ts; src/app/api/tickets/[id]/route.ts; prisma/schema.prisma). API routes are callable directly without middleware, so per-endpoint checks are the main barrier.
- Background data writes come from Prisma seed/migrations (prisma/seed.js; prisma/schema.prisma).

## Assets to Protect
- User credentials and password hashes (prisma/schema.prisma: User.passwordHash; src/lib/auth.ts).
- Session tokens and role/org claims used for authorization (src/lib/auth.ts; middleware.ts).
- Organization-scoped ticket data, comments, attachments, SLA timestamps (prisma/schema.prisma: Ticket, Comment, Attachment, SlaPolicy).
- Audit evidence of ticket lifecycle changes (prisma/schema.prisma: AuditEvent; src/app/api/tickets/[id]/route.ts audit writes).

## Threats, Mitigations, Verification
- **Auth abuse (brute force / credential stuffing):** Login is password-only with bcrypt check and no throttling (src/lib/auth.ts). Mitigate with rate limiting or device fingerprint lockouts around NextAuth route and alerting; verify via automated tests that >N failed attempts return 429 and logs emit security event.
- **CSRF on authenticated APIs:** Ticket and comment actions accept cookie-authenticated POST/PUT without CSRF tokens or same-site assertion (src/app/api/tickets/route.ts; src/app/api/tickets/[id]/route.ts). Mitigate with `NEXTAUTH_URL`-bound same-site cookies plus CSRF/Origin checks in handlers; verify with integration tests that cross-site POSTs are rejected.
- **Stored XSS in ticket/comment Markdown:** ReactMarkdown renders user-controlled Markdown without sanitize/rehype allowlist (src/app/app/tickets/[id]/page.tsx). Mitigate by enabling `rehype-sanitize` with a strict schema; verify with unit test injecting `<script>` that output is escaped.
- **Comment submission gap:** UI posts to `/api/tickets/{id}/comments` but no handler exists, causing 404 and bypassing server-side validations (src/app/app/tickets/[id]/comment-form.tsx; no matching route in src/app/api/tickets/[id]). Mitigate by implementing authenticated comment API with org/role checks; verify with integration tests that creates succeed and cross-org/comment length violations fail.
- **Missing pagination on ticket list:** GET `/api/tickets` returns all rows unbounded (src/app/api/tickets/route.ts). Mitigate with take/skip + max limits; verify via API tests that responses are capped and include pagination metadata.
- **Missing rate limits on APIs:** Ticket create/update/read have no throttling (src/app/api/tickets/route.ts; src/app/api/tickets/[id]/route.ts). Mitigate via middleware rate limiter (e.g., `src/middleware.ts`) and per-route guards; verify 429 behavior in tests.
- **SLA accuracy gaps:** SLA due dates set on create but not updated on status/priority/comment events (src/app/api/tickets/route.ts; src/app/api/tickets/[id]/route.ts). Mitigate by centralizing SLA updater and calling it on comment creation and status/priority changes; verify timestamps in unit tests and via seeded data assertions.
- **Cross-org access to SSR data:** Ticket detail fetches by id without org filter, so agents from other orgs could read data if they know ids (src/app/app/tickets/[id]/page.tsx). Mitigate with organizationId filter in query; verify with e2e that foreign org user gets 404 and no data rendered.
- **Attachment security undefined:** Attachment model exists but no upload/download pipeline or validation (prisma/schema.prisma; no routes under src/app/api/attachments). Mitigate with dedicated upload API enforcing MIME/size/signed URLs + AV scanning; verify with integration tests and mocked scanner.
- **Audit integrity:** AuditEvent rows are plain JSON without tamper-evidence or retention controls (prisma/schema.prisma). Mitigate with hash chaining or WORM storage and append-only logging; verify hashes via integrity check job and unit tests.
- **Minimal production logging:** Prisma logs only errors in production (src/lib/prisma.ts), reducing detection of abuse. Mitigate by enabling structured audit/security logs and shipping to SIEM; verify log emission in staging with synthetic transactions.
- **Seed credentials reused:** Seed sets deterministic passwords for admin/agent/requester (prisma/seed.js). Mitigate by gating seed to non-prod and forcing secret rotation on deploy; verify seed blocked in prod CI and that `.env` requires override.
- **Search runtime errors:** Dashboard search queries `description` field that does not exist (src/app/app/page.tsx), causing 500 on use. Mitigate by switching to `descriptionMd`; verify via integration test that search returns results.
- **Priority change not recalculating SLA:** Priority updates do not recompute due times (src/app/api/tickets/[id]/route.ts). Mitigate by recalculating SLA windows on priority changes; verify with unit test asserting new due timestamps.
- **Health/availability gap:** No health/readiness endpoint or monitoring hooks exist under `src/app/api`, making operational detection of outages harder. Mitigate by adding `/api/health` and probes; verify with uptime checks and CI smoke tests.

## Trust Boundary Risks by Area
- **Auth:** Session issuance relies on credentials without MFA or throttling (src/lib/auth.ts). Add MFA option and IP-based rate limiting; verify via e2e sign-in coverage.
- **Org scoping:** API routes enforce org filters, but SSR page misses org constraint as noted above (src/app/app/tickets/[id]/page.tsx). Add Prisma filters and regression tests.
- **Markdown:** Stored Markdown rendered without sanitization (src/app/app/tickets/[id]/page.tsx). Add sanitizer as above.
- **Attachments:** No upload path/policy yet (prisma/schema.prisma). Implement signed uploads with scanning and enforce on download; test with EICAR and over-limit payloads.
- **Admin:** No admin CRUD endpoints beyond seed data (absence under src/app/api/admin). Add scoped admin APIs with audit logs; verify role-gated access via e2e.
- **Exports:** No export endpoints exist; when added they must scope by organization and redact internal notes. Plan export module under `src/app/api/exports` with audit trails; verify with download tests that foreign org access fails.
=======
- **Client ↔ Next.js edge/API**: Authenticated users interact over HTTPS with Next.js middleware-protected routes under `/app` using NextAuth JWT sessions.【F:middleware.ts†L1-L5】【F:src/lib/auth.ts†L21-L80】
- **API ↔ Database**: API route handlers call Prisma against Postgres via `DATABASE_URL` with role-based and organization-aware filters in some paths.【F:src/app/api/tickets/route.ts†L16-L88】【F:src/app/api/tickets/[id]/route.ts†L26-L211】
- **Background/seed**: Seed script writes demo org/users/SLA/tickets directly into the DB with static passwords for local/demo use.【F:prisma/seed.js†L7-L146】【F:README.md†L42-L61】
- **Static assets**: Public assets served by Next; attachment upload endpoints are not yet implemented (planned work).【F:README.md†L63-L66】【F:prisma/schema.prisma†L100-L158】

## Assets
- User identities, roles, and credentials (including JWT session claims and stored password hashes).【F:src/lib/auth.ts†L21-L80】【F:prisma/schema.prisma†L28-L80】
- Organization-scoped ticket data: tickets, comments (public/internal), SLAs, tags, assignments, audit trail.【F:README.md†L51-L61】【F:prisma/schema.prisma†L100-L208】【F:src/app/api/tickets/[id]/route.ts†L84-L194】
- Planned attachments/exports and potential markdown content rendered in UI.【F:README.md†L63-L66】【F:src/app/app/tickets/[id]/page.tsx†L131-L215】

## Threats by Area
| Area | Threats | Mitigations (current/proposed) | Verification |
| --- | --- | --- | --- |
| Authentication & sessions | Credential brute force, weak demo passwords, stolen JWT, lack of MFA. NextAuth credential checks with bcrypt exist but no rate-limit or MFA; demo creds published.【F:src/lib/auth.ts†L21-L80】【F:README.md†L42-L61】 | Add IP/user-based rate limiting middleware; enforce strong password policy; add optional 2FA; rotate demo creds post-install. | Pen-test login; automated rate-limit tests hitting `/api/auth/[...nextauth]`; unit tests for password policy. |
| Org scoping | Agents from other orgs could fetch tickets by ID because detail queries lack organization filter; API PATCH enforces org match, but page fetch only checks requester ownership.【F:src/app/app/tickets/[id]/page.tsx†L30-L99】【F:src/app/api/tickets/[id]/route.ts†L35-L81】 | Add `organizationId` condition to all ticket/comment queries and middleware to assert session org; reuse same guard in pages. | Integration tests fetching ticket from another org expect 404; static analysis for missing org filters. |
| Authorization logic | Requesters blocked from certain updates in API, but UI assumes `role` string; role tampering in client could call APIs directly. | Server-side role enforcement already in PATCH/POST; add policy helper and middleware to centralize checks; add audit for denied attempts. | API tests asserting 403 for disallowed operations; log review showing denied actions. |
| Markdown rendering | ReactMarkdown without sanitization exposes XSS in ticket descriptions/comments.【F:src/app/app/tickets/[id]/page.tsx†L131-L215】【F:src/app/app/ticket-form.tsx†L5-L210】 | Enable `rehype-sanitize` with strict schema and content security policy; store and render sanitized HTML or escape markdown. | Unit tests rendering payload with `<script>` expecting escaping; dynamic CSP check in E2E. |
| Attachments (planned) | Risk of malicious files, MIME spoofing, unscanned uploads, broken org scoping. Currently no upload route. | Implement upload service with signed URLs, MIME/extension allowlist, AV scanning, org ownership metadata. | Integration tests uploading blocked types, large files, cross-org access; verify AV scan hook logs. |
| Admin/role actions | Admin endpoints not built; risk of privilege escalation when added. | Define RBAC matrix and guard all admin routes with server-side checks; protect seeds and demo accounts. | Policy unit tests on admin APIs; E2E flows verifying only admins can manage users/teams. |
| Exports/reporting | Not built yet; risk of data exfiltration and missing scoping. | When implemented, require scoped queries, watermarks, audit logs, and signed URLs for downloadable exports. | Security review + integration tests on export endpoints. |
| Ticket state changes | Unauthorized status changes or assignment changes; audit exists per change but integrity not enforced.【F:src/app/api/tickets/[id]/route.ts†L84-L194】 | Add immutable audit log with hash chaining and server timestamps; restrict who can set certain states (e.g., closure reason). | Unit tests validating audit hash chain; E2E ensuring requester cannot change priority/assignee. |
| Comment visibility | Internal comments should be hidden from requesters; filter uses client-side `visibleComments` but server returns all comments before filtering.【F:src/app/app/tickets/[id]/page.tsx†L30-L99】【F:src/app/app/tickets/[id]/page.tsx†L167-L220】 | Enforce `isInternal` filter in server query for requester sessions; mask in API layer rather than UI. | Integration test: requester fetching comments never sees internal flag; snapshot of API response. |
| SLA timers | First/resolve due computed server-side; no enforcement job; risk of missed SLA alerts.【F:src/app/api/tickets/route.ts†L52-L75】 | Add background worker to monitor SLA breaches and notify; store breach timestamps. | Job unit tests with fake clock; E2E verifying notification when SLA breached. |
| Logging & secrets | Prisma logs queries in dev; no structured security logging; `.env` not present but README lists secrets. Risk of sensitive data in logs. | Centralize logging with PII scrubbing; restrict log levels in prod; add secret scanning in CI. | CI pipeline for secret scan; log inspection in staging ensuring no PII. |
| Rate limiting | No rate limiting on APIs; risk of abuse/brute force. | Apply rate limiting middleware (e.g., Redis-based) on auth and ticket APIs; include user+IP keys. | Load test showing 429 responses after threshold; monitor metrics. |
| CSRF/Session fixation | Relying on NextAuth JWT API routes; APIs accept JSON POST without CSRF token. | Use `NEXTAUTH_URL` secure cookies with `SameSite=lax` and enable CSRF for credential login routes or enforce `Authorization` header with `POST` only. | Security test submitting forged requests from third-party origin; verify failure. |
| Dependency risk | Multiple dependencies; no SCA policy. | Add `pnpm audit`/`npm audit` gate; renovate. | CI audit step; report review. |
| Availability | No health checks or rate limits; DB single point of failure in docker-compose. | Add `/healthz` endpoint, DB liveness probes, and horizontal scaling guidance. | Operational runbook tests; k8s/liveness checks returning 200. |

## Verification Steps Summary
- Automated: unit/integration tests for auth, org scoping, markdown sanitization, and permission enforcement; SAST/DAST (e.g., ESLint rules, Semgrep); dependency and secret scanning in CI.
- Manual: threat hunting for XSS via markdown, privilege escalation attempts using alternate org IDs, and brute-force exercises with monitoring for rate-limit events.
- Operational: log review for audit chain integrity and denied events; periodic rotation of demo credentials and inspection of backup/restore drills.
>>>>>>> theirs
