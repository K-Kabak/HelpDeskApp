# Runbooks

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
