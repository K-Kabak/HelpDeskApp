# Runbooks

## Dev Environment Setup (repo-specific)
1. Install deps: `pnpm install` (Node 22+); ensure Postgres reachable.
2. Configure `.env.local` from `.env.example` with `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` for callbacks.
3. Migrate and seed: `pnpm prisma:migrate` then `pnpm prisma:seed` for demo org/users/ticket (dev only; contains static creds).
4. Run app: `pnpm dev` (http://localhost:3000).

## Database Migrations & Rollback
- Apply: `prisma migrate dev` locally; `prisma migrate deploy` in CI/CD with `DATABASE_URL` set.
- Rollback: prefer forward fixes; emergency: restore from backup and run `prisma migrate resolve --applied` to mark bad migration; document incidents.
- Verification: after deploy, run smoke query (ticket count) and Playwright smoke (ticket create/view/comment).

## Seeding Strategy
- Dev/local: use full seed (demo admin/agent/requester, SLA policies). Rotate/change passwords after first run if exposed.
- CI/Test: minimal deterministic seed per test DB or factories; avoid shipping static passwords outside CI.
- Staging/Prod: avoid seed; if bootstrap needed, create one-time script with random credentials and delete after use.

## Background Jobs Operations (SLA/notifications)
- Current state: no job runner; SLA breach monitoring and notifications not automated.
- Plan and checklist: introduce queue worker (e.g., BullMQ/Temporal) to evaluate SLA deadlines and send alerts. Ensure idempotent jobs, retries with backoff, poison-queue isolation, visibility timeout metrics, and alerting when queue latency exceeds thresholds. Document SLAs (<60s scheduling, <5m delivery) and notification channels (email/webhook).
- Failure handling: dashboard for success/error rates; manual runbook to drain/requeue; store last run timestamp; alarms on retry exhaustion.

## Observability & Health Checks
- Add `/healthz` (DB ping via Prisma) and `/readyz` (checks migrations applied). Expose metrics (request rates, 429/401 counts, job latency) and integrate error tracking.
- Logging: use structured logs with correlation IDs; log auth failures, rate-limit blocks, AV scan results; keep PII out of logs.
- Alerts: DB connectivity errors, spike in 401/403/429, job backlog, and attachment scan failures.

## Release Checklist
1. CI green: lint, types, unit/integration, e2e, SCA, secret scan.
2. Migrations applied to staging; backups verified; health checks passing.
3. Org scoping and markdown sanitization tests enabled; rate limiting configured.
4. Attachment pipeline (if enabled) passes MIME/size/AV tests; audit hash chain verification clean.
5. Rotate demo credentials; confirm secrets set (`DATABASE_URL`, `NEXTAUTH_SECRET`, storage keys).

## Incident Response Checklist
- Detect: monitor alerts; capture recent deploys/feature flags.
- Contain: revoke sessions (rotate JWT secret), block vulnerable routes behind feature flags, restrict attachment URLs.
- Eradicate: patch root cause (e.g., org filter, sanitizer), add regression tests, redeploy.
- Recover: restore from backups if needed; verify audit hash chain; validate health checks.
- Postmortem: document timeline, impacted data, controls added; rotate credentials and update threat model.
