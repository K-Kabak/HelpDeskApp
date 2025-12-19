# Threat Model

## Context and Trust Boundaries
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
## System & Trust Boundaries
- **Client → Next.js app/API**: Authenticated requests flow through NextAuth middleware guarding `/app/**` and API routes use server-side session lookups.【F:middleware.ts†L1-L5】【F:src/lib/auth.ts†L21-L80】
- **API → Database**: Route handlers access Postgres via Prisma using `DATABASE_URL`; authorization and org filters are enforced in some paths but missing in others.【F:src/app/api/tickets/route.ts†L16-L88】【F:src/app/api/tickets/[id]/route.ts†L35-L197】【F:prisma/schema.prisma†L1-L208】
- **Content rendering boundary**: Markdown from users is rendered directly in server components without sanitization, crossing from untrusted input to HTML.【F:src/app/app/tickets/[id]/page.tsx†L131-L215】
- **Background/seed boundary**: Seed script inserts demo users with static passwords directly into DB for local use.【F:prisma/seed.js†L7-L146】
- **Future storage boundary**: Attachment metadata exists in schema but no upload routes; storage backend not yet defined.【F:prisma/schema.prisma†L130-L158】

## Assets
- Authentication secrets and session claims (JWT), user credentials, and roles.【F:src/lib/auth.ts†L21-L80】【F:prisma/schema.prisma†L28-L80】
- Organization-scoped ticket data, comments, SLA timestamps, and audit events.【F:src/app/api/tickets/route.ts†L16-L88】【F:src/app/api/tickets/[id]/route.ts†L84-L194】【F:prisma/schema.prisma†L100-L208】
- Markdown content rendered in UI and planned attachments/exports.【F:src/app/app/tickets/[id]/page.tsx†L131-L215】【F:prisma/schema.prisma†L130-L158】

## Threats, Mitigations, Verification
| Area | Threats | Mitigations (current/proposed) | Verification |
| --- | --- | --- | --- |
| Authentication & sessions | Credential stuffing, leaked demo passwords, session theft. Passwords hashed with bcrypt and verified via NextAuth Credentials; demo creds shipped in seed/README.【F:src/lib/auth.ts†L34-L80】【F:prisma/seed.js†L14-L53】【F:README.md†L41-L43】 Add MFA, strong password policy, rotation of demo accounts post-install, and session revocation endpoint. | Automated login brute-force tests to confirm rate limits; check demo credentials disabled outside dev; unit tests for password policy and session TTL. |
| Org scoping | Ticket detail page fetch lacks org filter so cross-org access possible; API detail route enforces org match.【F:src/app/app/tickets/[id]/page.tsx†L51-L99】【F:src/app/api/tickets/[id]/route.ts†L35-L49】 Apply org filters to all queries (pages, comments) and centralize guard middleware. | Integration tests requesting ticket from another org expect 404; lint rule/semgrep for missing `organizationId` filter. |
| Authorization logic | Requesters blocked from priority/assignee updates but could call API directly; client role strings can be tampered. | Keep server-side role checks (already in PATCH) and add policy helper reused by all routes plus audit for denied attempts.【F:src/app/api/tickets/[id]/route.ts†L59-L166】 | API tests asserting 403 on disallowed updates; audit log review includes denied actions. |
| Markdown/comments | XSS via markdown body because ReactMarkdown renders un-sanitized content.【F:src/app/app/tickets/[id]/page.tsx†L131-L215】 Add `rehype-sanitize`, CSP, and output escaping on save. | Unit test rendering `<script>` remains escaped; Playwright CSP check; SAST rule for markdown sanitizer usage. |
| Attachments | (Future) malicious files, MIME spoofing, org-mixing via shared URLs, AV bypass. No upload route yet.【F:prisma/schema.prisma†L130-L158】 Build signed URL service with org ownership, MIME/extension allowlist, size cap, AV scan hook, and audit trail. | Integration tests uploading blocked types/oversize; verify AV scan log; cross-org access attempt returns 403/404. |
| Admin actions | Admin panel not present; risk of future privilege escalation. | Define RBAC matrix and enforce server-side checks for any admin routes; require org scoping and audit for admin mutations. | Policy unit tests on admin APIs; E2E verifying only admins can manage users/teams. |
| Reporting/exports | Not implemented; risk of unscoped bulk data exfiltration. | Require scoped queries, watermarking, signed URLs with expiry, and audit trail before enabling exports. | Security review + integration tests ensuring exports limited to org and time-bound. |
| Audit integrity | Audit events stored but no tamper protection or chain.【F:src/app/api/tickets/[id]/route.ts†L176-L194】【F:prisma/schema.prisma†L172-L184】 Add hash chaining, server timestamps, append-only store, and integrity checker. | Unit tests validating hash chain; operational script to verify latest N events; alert on gap. |
| Rate limiting & abuse | No limiter on auth or ticket APIs. | Add Redis-backed limiter in middleware covering auth/ticket/comment routes with IP+user keys. | Load test to 429 threshold; unit tests on limiter helper. |
| CSRF/session fixation | Credentials login uses JSON POST without CSRF token; JWT cookies may be reused. | Enforce `SameSite=lax` cookies, add anti-CSRF token for credential form, and rotate session on privilege change. | Browser test sending cross-site POST fails; session ID changes after privilege elevation. |
| Data validation | Zod enforces minimums but lacks max lengths; markdown may allow huge payloads.【F:src/app/api/tickets/route.ts†L9-L50】【F:src/app/api/tickets/[id]/comments/route.ts†L7-L39】 Add max lengths, server-side truncation, and request size limits. | Unit tests exceeding max size rejected; observe 413/400 responses in integration. |
| SLA timers | Due timestamps computed on create but no monitor; breaches silent.【F:src/app/api/tickets/route.ts†L52-L75】 Add background job to evaluate SLA breaches and notify. | Job unit tests with fake clock; E2E verifying notification on breach. |
| Logging/secrets | Prisma logging default; no structured security logs or secret hygiene guidance beyond README env note.【F:src/lib/prisma.ts†L5-L13】【F:README.md†L21-L35】 Add structured logging with PII scrubbing, secret scanning, and access controls for logs. | CI secret scan; log inspection in staging ensures redaction; audit on log access. |
| Availability | Single Postgres in docker-compose, no health checks.【F:docker-compose.yml†L1-L15】 Add `/healthz` DB check, backups, and scaling plan. | Health check returns 200 with DB ping; backup/restore drill. |
| Dependency risk | Many dependencies; no SCA gate defined.【F:package.json†L5-L64】 Add `pnpm audit`/`pnpm exec trufflehog` and renovate. | CI gates failing on vuln; monthly report review. |

## Top 15 Production Risks → Mitigation → Verification
1. Cross-org ticket access via page fetch → Add org filter middleware + tests.【F:src/app/app/tickets/[id]/page.tsx†L51-L99】 → Integration test expecting 404 for other org.
2. Markdown XSS → Enable sanitization/CSP → Unit + E2E rendering tests.【F:src/app/app/tickets/[id]/page.tsx†L131-L215】
3. Missing rate limits on auth → Redis limiter on auth routes → Burst test to 429.【F:src/lib/auth.ts†L34-L80】
4. Demo credentials left enabled → Rotate/remove seeds outside dev → Check prod seed disabled.【F:prisma/seed.js†L14-L53】【F:README.md†L41-L43】
5. No attachment validation → Add signed URLs, allowlist, AV scan → Integration upload tests.【F:prisma/schema.prisma†L130-L158】
6. Audit log tampering → Hash chain + append-only store → Unit tests verifying chain.【F:prisma/schema.prisma†L172-L184】
7. SLA breaches unnoticed → Add monitoring job + alerts → Fake-clock job test; alert in staging.【F:src/app/api/tickets/route.ts†L52-L75】
8. CSRF on credential login → Add CSRF token + SameSite cookies → Browser test rejects cross-site POST.【F:src/lib/auth.ts†L21-L80】
9. Excessive request size/DoS → Add body size limits + max lengths → Integration 413 test.【F:src/app/api/tickets/route.ts†L9-L50】
10. Comment visibility leak (requester seeing internal) → Server-side filter for requesters → API test ensures internal comments absent.【F:src/app/app/tickets/[id]/page.tsx†L94-L220】
11. Unvalidated assignee/team IDs → Keep org-scoped validation + add for missing routes → Tests for invalid IDs return 400.【F:src/app/api/tickets/[id]/route.ts†L102-L166】
12. Weak logging/secret hygiene → Structured logs + secret scanning → CI secret scan; log redaction check.【F:src/lib/prisma.ts†L5-L13】【F:README.md†L21-L35】
13. Lack of health checks → Implement `/healthz` DB ping → Monitor 200 response in deploy pipeline.【F:docker-compose.yml†L1-L15】
14. Dependency vulnerabilities → Add SCA gate → CI `pnpm audit` step pass required.【F:package.json†L5-L64】
15. Missing admin RBAC design → Define RBAC and enforce server-side → Policy tests ensuring only admins can manage admin routes (once added).【F:prisma/schema.prisma†L10-L80】
