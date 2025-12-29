# Threat Model

## System & Trust Boundaries
- Client > Next.js app/API guarded by NextAuth middleware on `/app/**`; API routes perform their own session lookups.
- API > Database via Prisma using `DATABASE_URL`; organization filters and `ticketScope()` enforce tenant isolation on query paths.
- Content rendering boundary: user-supplied Markdown is sanitized with `rehype-sanitize` before rendering, and CSP is applied at the platform boundary.
- Seed/ops boundary: seed script inserts demo users with static passwords for local use only.
- Future storage boundary: attachment metadata exists in schema but uploads go through signed URLs, AV scanning, and storage validation before persistence.
- Observability boundary: security events (failed logins, auth failures, rate-limit violations, suspicious access) are emitted with request IDs to the logging pipeline for monitoring or alerting.

## Assets
- Authentication secrets and session claims (JWT), user credentials, and roles.
- Organization-scoped ticket data, comments, SLA timestamps, and audit events.
- Markdown content rendered in UI and planned attachments/exports.
- Security logs and rate-limit counters that track abuse, along with attachment metadata and signed URLs.

## Threats, Mitigations, Verification
| Area | Threat | Mitigation (planned/current) | Verification |
| --- | --- | --- | --- |
| Area | Threat | Mitigation (planned/current) | Verification |
| --- | --- | --- | --- |
| Authentication | Credential stuffing and demo credential reuse still risk account takeover. | Credential logins go through NextAuth with bcrypt, rate limiting, and security event logging; seed/demo accounts are disabled in production. | Brute-force tests return 429; security logger flags `failed_login`; NextAuth session issuance is monitored. |
| Org scoping | Tickets, comments, and attachments missing org filters enable cross-tenant reads and writes. | `ticketScope()` and `isSameOrganization()` enforce tenant boundaries, and mismatched org access now surfaces `security.suspicious_activity` events. | Cross-org access requests return 404/403 with audit trails and logged security events; tests simulate foreign IDs. |
| Authorization | Requesters might escalate privileges or tamper with role claims in-flight. | Server-side role guards (`isAgentOrAdmin()`, `ticketScope()`) centralize RBAC and log `security.authorization_failure` events for denied operations. | API tests assert 403 on forbidden data changes; logs surface the security event plus request ID. |
| Security headers / CSP | Missing headers allow clickjacking, MIME sniffing, or data injection. | Next.js middleware injects CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`; CSP works with sanitized Markdown. | Automated checks (`curl -I`, Playwright) confirm headers; CSP tests ensure `<script>` payloads are blocked. |
| Rate limiting / DoS | Auth, ticket/comment writes, and bulk routes were previously unthrottled. | `checkRateLimit()` enforces per-IP and per-user caps with retry headers and security logging; defaults enable limits in prod. | Load/abuse tests produce 429/ retry headers; logs mark `rate_limit_violation`; dashboards show drop in abuse volume. |
| Security logging & monitoring | Lack of structured security telemetry delays incident response. | `src/lib/logger.ts` emits structured security events (failed logins, auth failures, rate-limit violations, suspicious activities) with request IDs, routed to the observability stack. | Alerts trigger on suspicious log spikes; runbooks verify log delivery/resolution. |
| Attachments | Malicious uploads or cross-org shares expose sensitive files. | Upload APIs enforce MIME/size allowlists, signed URLs, AV scanning, and org checks; audit trails capture `ATTACHMENT_*` events. | Integration tests block disallowed content; audit logs show attachments per org. |
| Audit integrity | Audit events lack tamper protection. | Hash chaining or append-only storage is being prototyped with periodic verification scripts. | Automated scripts verify hash chain integrity; manual reviews confirm the append-only store is intact. |
| CSRF / Session fixation | Credential forms could be abused without CSRF protection. | SameSite cookies, anti-CSRF tokens, and rotation on privilege elevation harden session handling. | Browser test sending cross-site POST fails; session ID rotates on role change. |
| Data validation | Payloads lack max lengths/body size guards. | Zod schemas enforce length limits; request size checks drop oversized payloads before processing. | Integration tests reject oversized/tampered payloads with 400/413 responses. |

## Top Priorities
1. Add org filters to ticket detail/comments and cover with tests.
2. Sanitize markdown rendering and add CSP.
3. Introduce auth/ticket/comment rate limiting and CSRF token on credential login.
4. Plan and implement attachment pipeline with signed URLs, allowlist, size caps, AV scanning.
5. Add audit integrity (hash chain) and structured security logging.
