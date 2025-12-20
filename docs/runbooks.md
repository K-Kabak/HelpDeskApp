# Runbooks

<<<<<<< ours
## Environment and Secrets
- Required variables: `DATABASE_URL` (Postgres, prisma/schema.prisma datasource), `NEXTAUTH_SECRET` (NextAuth JWT), optional storage credentials for uploads (to be added with attachment API). Reference setup in README.md.
- Local dev: `.env.local` loaded by Next.js; never reuse in staging/prod. Validate presence at boot and fail fast.
- Secrets rotation: rotate `NEXTAUTH_SECRET` and DB credentials on release; update deployment manifests and restart app nodes.

## Migrations and Rollback (Prisma)
- Forward: `pnpm prisma:migrate` (package.json) applies migrations based on prisma/schema.prisma. Run in CI against staging before prod.
- Rollback: if latest migration breaks, run `prisma migrate resolve --applied <prev>` to mark rollback, then redeploy previous image. Keep DB backups for full restore.
- Safety: take snapshot/backup before applying prod migrations; gate deploy until migration succeeds in staging.

## Seeding per Environment
- Dev/test: use `pnpm prisma:seed` to load demo org/users/tickets (prisma/seed.js). Override default passwords per environment to avoid shared secrets.
- Staging/prod: avoid seed except for smoke fixtures; prefer targeted scripts that insert non-sensitive test data with short TTL.

## Background Jobs (SLA/Notifications)
- Current gap: no job runner exists; SLA fields (`firstResponseDue`, `resolveDue`) on Ticket (prisma/schema.prisma) are not monitored.
- Plan: add scheduled worker (e.g., cron) to scan tickets nearing breach, send notifications, and stamp `firstResponseAt`/`resolveDue` recalculations on comment/status changes.
- Failure handling: surface job metrics and alerts; retries with backoff; dead-letter queue for irrecoverable items with ticket references.

## Observability and Health
- Current gap: no health or readiness endpoint under `src/app/api`. Add `/api/health` with DB check and expose metrics endpoint for request counts/rate-limit hits.
- Logging: expand beyond Prisma error-only logging (src/lib/prisma.ts) to structured application logs shipped to centralized sink; include request IDs and user/org context.
- Dashboards: track sign-in attempts, 4xx/5xx rates on ticket APIs, SLA breach counts.

## Release Checklist
- Confirm env vars/secrets present and rotated as needed.
- Run `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build`.
- Apply migrations to staging; verify smoke tests (login, ticket create/update) using seeded users (prisma/seed.js).
- Tag release, deploy with migrations, monitor health/alerts for 30 minutes; if regression, rollback image and, if needed, restore DB snapshot.

## Incident Checklist
- Triage: capture timeline, affected org/users, and scope (API vs UI). Check logs (structured app logs + Prisma errors) for the window.
- Contain: disable offending feature flag or rate-limit path (middleware.ts matcher) if abuse; for data leak, revoke sessions (`NEXTAUTH_SECRET` rotate) and block compromised accounts.
- Eradicate/Recover: apply hotfix or rollback; restore from DB backup if corruption; re-run migrations if necessary.
- Lessons: record root cause, add regression tests (see docs/testing-ci.md), update runbooks and alerting thresholds.
=======
>>>>>>> theirs
## Dev Environment Setup (repo-specific)
1. Install deps: `pnpm install` (Node 22+); ensure Postgres reachable.
2. Configure `.env.local` from `.env.example` once added with `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` for callbacks.【F:README.md†L16-L43】
3. Migrate & seed: `pnpm prisma:migrate` then `pnpm prisma:seed` for demo org/users/ticket (dev only; contains static creds).【F:package.json†L5-L19】【F:prisma/seed.js†L7-L146】【F:README.md†L41-L43】
4. Run app: `pnpm dev` (http://localhost:3000).【F:package.json†L5-L16】

## Database Migrations & Rollback
- **Apply**: `prisma migrate dev` locally; `prisma migrate deploy` in CI/CD with `DATABASE_URL` set.
- **Rollback**: Prefer forward fixes; emergency: restore from backup + `prisma migrate resolve --applied` to mark bad migration; document incidents.
- **Verification**: After deploy, run smoke query (e.g., ticket count) and Playwright smoke (ticket create/view/comment).

## Seeding Strategy
- **Dev/local**: use full seed (demo admin/agent/requester, SLA policies). Rotate or change passwords after first run if exposed.【F:prisma/seed.js†L14-L136】【F:README.md†L41-L43】
- **CI/Test**: minimal deterministic seed per test DB or factories; avoid shipping static passwords outside CI.
- **Staging/Prod**: avoid seed; if bootstrap needed, create one-time script with random credentials and delete after use.

## Background Jobs Operations (SLA/notifications)
- **Current state**: No job runner; SLA breach monitoring and notifications not automated.【F:src/app/api/tickets/route.ts†L52-L75】【F:README.md†L63-L66】
- **Plan & checklist**: introduce queue worker (e.g., bullmq/temporal) to evaluate SLA deadlines and send alerts. Ensure idempotent jobs, retries with backoff, poison-queue isolation, visibility timeout metrics, and alerting when queue latency >2m. Document SLAs (<60s scheduling, <5m delivery) and notification channels (email/webhook).
- **Failure handling**: dashboard for success/error rates; manual runbook to drain/requeue; store last run timestamp; alarms on retry exhaustion.

## Observability & Health Checks
- Add `/healthz` (DB ping via Prisma) and `/readyz` (checks migrations applied). Expose metrics (request rates, 429/401 counts, job latency) and integrate error tracking.
- Logging: use structured logs with correlation IDs; log auth failures, rate-limit blocks, AV scan results; keep PII out of logs.【F:src/lib/prisma.ts†L5-L13】
- Alerts: DB connectivity errors, spike in 401/403/429, job backlog, and attachment scan failures.

## Release Checklist
1. CI green: lint, types, unit/integration, e2e, SCA, secret scan.【F:package.json†L5-L64】
2. Migrations applied to staging; backups verified; health checks passing.
3. Org scoping + markdown sanitization tests enabled; rate limiting configured.
4. Attachment pipeline (if enabled) passes MIME/size/AV tests; audit hash chain verification clean.
5. Rotate demo credentials; confirm secrets set (`DATABASE_URL`, `NEXTAUTH_SECRET`, storage keys).【F:README.md†L16-L43】

## Incident Response Checklist
- **Detect**: monitor alerts; capture recent deploys/feature flags.
- **Contain**: revoke sessions (invalidate JWT secrets), enable feature flags to block vulnerable routes, restrict attachment URLs.
- **Eradicate**: patch root cause (e.g., org filter, sanitizer), add regression tests, redeploy.
- **Recover**: restore from backups if needed; verify audit hash chain; validate health checks.
- **Postmortem**: document timeline, impacted data, controls added; rotate credentials and update threat model.
