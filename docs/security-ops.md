# Security & Operations

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
