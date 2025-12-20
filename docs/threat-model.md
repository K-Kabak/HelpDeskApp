# Threat Model

## System & Trust Boundaries
- Client › Next.js app/API guarded by NextAuth middleware on `/app/**`; API routes perform their own session lookups.
- API › Database via Prisma using `DATABASE_URL`; some routes enforce org filters while others require hardening.
- Content rendering boundary: user-supplied Markdown is rendered in server components today without sanitization.
- Seed/ops boundary: seed script inserts demo users with static passwords for local use only.
- Future storage boundary: attachment metadata exists in schema but no upload routes or storage backend are defined yet.

## Assets
- Authentication secrets and session claims (JWT), user credentials, and roles.
- Organization-scoped ticket data, comments, SLA timestamps, and audit events.
- Markdown content rendered in UI and planned attachments/exports.

## Threats, Mitigations, Verification
| Area | Threat | Mitigation (planned/current) | Verification |
| --- | --- | --- | --- |
| Authentication | Credential stuffing and reuse of demo creds. | Add rate limits to auth routes; rotate/remove seed accounts outside dev; consider MFA. | Brute-force test hits 429; prod seed disabled; manual MFA check once added. |
| Org scoping | Ticket detail page currently lacks org filter, enabling cross-org reads if IDs known. | Apply `organizationId` filters to all ticket/comment queries and centralize a guard helper. | Integration test requesting another org’s ticket returns 404; lint/semgrep rule for missing org filter. |
| Authorization | Client role strings can be tampered; requester could attempt forbidden updates. | Keep server-side role checks; add shared policy helper and audit denied attempts. | API tests assert 403 on disallowed updates; audit log contains denied actions. |
| Markdown/XSS | Markdown rendered without sanitization. | Enable `rehype-sanitize` (or equivalent) and add CSP. | Unit test rendering `<script>` is escaped; Playwright CSP check. |
| Rate limiting/DoS | No limiter on auth or ticket/comment routes. | Add Redis-backed limiter in middleware and per-route guards. | Load test to 429 threshold; monitor allow/deny metrics. |
| Attachments (future) | Malicious files, MIME spoofing, cross-org URL sharing. | Build signed URL service with org ownership, allowlist, size cap, AV scan, audit trail. | Integration tests for blocked types/oversize; cross-org attempt returns 403/404. |
| Audit integrity | Audit events lack tamper protection. | Hash chain or append-only store with periodic verification. | Unit test of hash chain; operational integrity check script. |
| CSRF/session fixation | Credential login uses JSON POST without CSRF token; cookies may be reused. | Enforce SameSite cookies, add anti-CSRF token for credential form, rotate session on privilege change. | Browser test sending cross-site POST fails; session ID changes after privilege elevation. |
| Data validation | Max lengths/body size limits missing for ticket/comment payloads. | Add server-side caps and request size limits. | Integration test rejecting oversized payloads with 400/413. |
| SLA monitoring | Due timestamps computed on create but not monitored for breach. | Add background job to evaluate SLA breaches and notify. | Fake-clock job test; alert in staging on breach simulation. |

## Top Priorities
1. Add org filters to ticket detail/comments and cover with tests.
2. Sanitize markdown rendering and add CSP.
3. Introduce auth/ticket/comment rate limiting and CSRF token on credential login.
4. Plan and implement attachment pipeline with signed URLs, allowlist, size caps, AV scanning.
5. Add audit integrity (hash chain) and structured security logging.
