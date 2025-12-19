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
## Environment Variables & Secrets
- `DATABASE_URL`: Postgres connection string used by Prisma.【F:README.md†L21-L35】【F:prisma/schema.prisma†L4-L27】
- `NEXTAUTH_SECRET`: secret for NextAuth JWT sessions.【F:README.md†L21-L25】
- Optional: `NEXTAUTH_URL` for production callbacks; rate limiter/telemetry secrets once added.
- Store secrets in vault/secret manager; never commit `.env`. Provide `.env.example` without secrets.

## Database Migrations & Rollback
1. **Apply**: `pnpm prisma:migrate` during development; use `prisma migrate deploy` in CI/CD with `DATABASE_URL` set.【F:package.json†L5-L15】
2. **Seed**: `pnpm prisma:seed` to load demo org/users/SLA/ticket; includes default credentials—rotate in non-dev envs.【F:package.json†L11-L15】【F:prisma/seed.js†L7-L146】【F:README.md†L42-L61】
3. **Rollback**: prefer forward-fix migrations; for emergencies use `prisma migrate resolve --applied` with backup restore. Keep nightly DB backups and test restore quarterly.
4. **Verification**: run smoke query `SELECT count(*) FROM "User";` and Playwright smoke after migration.

## Seeding Per Environment
- **Local/dev**: run full seed for demo users/tickets; mark demo passwords as temporary and rotate after first login.
- **Test/CI**: use minimal seed tailored for deterministic tests; ensure per-run schema or transactional cleanup.
- **Staging/Prod**: avoid seed; rely on migrations only. If bootstrap required, run dedicated bootstrap script with one-time tokens.

## Background Jobs Operations
- Current state: no background workers; SLA breaches and notifications not automated.【F:README.md†L56-L66】【F:src/app/api/tickets/route.ts†L52-L75】
- Plan: introduce job runner (e.g., `bullmq`/`temporal`) for SLA monitoring and notification delivery. Define SLAs per queue (e.g., 60s scheduling, <5m delivery) and alert to on-call if queue latency >2m.
- Failure handling: retries with exponential backoff, poison-queue isolation, and dashboards tracking success rate. Provide playbook for draining stuck jobs and replaying after fixes.

## Observability & Health Checks
- Add `/healthz` route (DB connectivity check via Prisma) and `/readyz` (depends on migrations run). Expose metrics endpoint or push to APM.
- Configure structured logs with correlation IDs; log auth failures and rate-limit events (see security-ops logging rules).【F:src/lib/prisma.ts†L5-L13】
- Alerts: DB connection errors, auth failure spikes, SLA job backlog, and elevated 429/500 rates.

## Release Checklist
1. Ensure migrations reviewed and applied to staging; backups verified.
2. CI green: lint, unit/integration, E2E, audit, secret scan.【F:package.json†L5-L26】
3. Rotate demo credentials and confirm env vars set (`DATABASE_URL`, `NEXTAUTH_SECRET`).【F:README.md†L21-L61】
4. Verify org-scoping tests and markdown sanitization are enabled; run smoke on ticket create/view/comment.
5. Update runbooks and playbooks for new features (attachments/admin/export).

## Incident Response Checklist
- Identify scope: affected org/users, data types (tickets/comments/attachments).
- Contain: revoke sessions (NextAuth JWT rotation), disable impacted routes via feature flag/middleware.
- Eradicate: patch vulnerabilities (e.g., org filter, sanitization), redeploy.
- Recover: restore from backups if data integrity compromised; verify audit hash chain if implemented.
- Post-incident: add regression tests, update threat model, rotate credentials, and communicate to stakeholders.
>>>>>>> theirs
