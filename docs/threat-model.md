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
