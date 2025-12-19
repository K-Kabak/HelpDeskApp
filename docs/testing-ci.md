<<<<<<< ours
# Testing & CI

## Tooling Baseline
- Vitest and Playwright are available via scripts (`pnpm test`, `pnpm test:e2e`) in package.json.
- Prisma models define the data surface for fixtures (prisma/schema.prisma) and demo data exists in `prisma/seed.js`.
- Auth-dependent tests need deterministic env values: set `DATABASE_URL` for the test database and `NEXTAUTH_SECRET` so session cookies issued by `src/lib/auth.ts` remain valid across test workers.

## Unit Test Strategy (Vitest)
- Scope: pure utilities (e.g., SLA calculators once added), role/permission helpers, React components with conditional rendering.
- Structure: colocate `*.test.ts[x]` beside source under `src/`, using jsdom for components and mocked Prisma client for logic.
- Coverage goals: 80%+ on auth helpers, role gating, SLA computations. Mock NextAuth session objects to assert behavior.

## Integration Tests
- Scope: Next.js API routes under `src/app/api` using a test Postgres database. Seed minimal org/users via `prisma/seed.js` helper or lightweight factory.
- Focus cases: ticket create/update success and forbidden paths; pagination and search on `/api/tickets`; rate-limit responses once implemented; CSRF/origin rejection.
- Harness: run `prisma migrate deploy` against test DB, start Next.js in minimal mode, hit routes with supertest/fetch using test JWT/session cookies.

## E2E Journeys (Playwright; role-based)
- Requester: sign in, create ticket, view dashboard filters/search, close/reopen own ticket, verify cannot change assignee/priority.
- Agent: sign in, view org ticket list, assign to self/team, change status, add internal comment (after comment API exists), ensure requester cannot see internal note.
- Admin: same as agent plus org-level visibility and attempted cross-org access should 404 (ticket detail org filter fix).
- Negative/security: invalid login lockouts, pagination caps, blocked Markdown XSS payload stays escaped, over-limit upload rejected (after upload feature).
- Run via `pnpm test:e2e` with seeded demo users from `prisma/seed.js`.

## Test Data, Fixtures, and DB Isolation
- Use Prisma seed to create baseline org/users and extend with factories per suite; avoid reusing production seed passwords outside dev.
- For unit tests, mock Prisma calls; for integration/e2e use isolated test DB (`DATABASE_URL_TEST`) per run with `prisma migrate deploy` and truncate between cases.
- Snapshot sensitive outputs (audit events) only after redaction; avoid asserting on timestamps that vary.

## CI Pipeline Gates and Triage
- Gates (in order): `pnpm lint` → `pnpm test` (unit) → `pnpm test:e2e` (headless) → `pnpm build` for typecheck/bundle. Fail fast on lint/unit; allow e2e to retry once.
- Artifacts: store Playwright traces/videos on failure; upload coverage from Vitest.
- Triage: classify as flaky (retry pass) vs regression (repeatable). For regressions, link failing test to code ownership (API route or component) and open blocking issue; for flaky, quarantine and file ticket with repro steps/logs.
=======
# Testing & CI Strategy

## Repository Tooling
- Lint/test/e2e scripts exist: `pnpm lint`, `pnpm test` (Vitest), `pnpm test:e2e` (Playwright).【F:package.json†L5-L26】
- Prisma seed/migrate scripts support DB fixtures for tests.【F:package.json†L5-L15】【F:prisma/seed.js†L7-L146】

## Test Pyramid
- **Unit tests** (Vitest):
  - Pure functions (e.g., SLA due calculations when added), auth helpers, rate-limit utilities (planned `src/lib/rate-limit.ts`).
  - Security-specific tests: markdown sanitization helper (escape scripts), audit hash chain generation.
- **Integration tests** (Vitest + Prisma test DB):
  - API routes for tickets/comments with org scoping and role enforcement using in-memory/test Postgres schema; run `prisma migrate deploy` against isolated DB.
  - Auth flow: credential login success/failure, rate-limit responses.
- **E2E (Playwright)**:
  - Run against dev server with seeded data; use dedicated `.env.test` and Postgres schema per run to avoid leakage.
  - Cover role-based paths and critical journeys (below).

## Critical E2E Journeys
- Requester: login → create ticket with markdown → verify only own tickets visible → attempt forbidden status change → expect error.
- Agent: login → view org tickets → change status/assignee → add internal comment (hidden from requester) → verify SLA timestamps displayed.
- Admin (future): user/team management once admin panel exists; verify RBAC.
- Negative flows: XSS payload remains escaped in description/comment; cross-org ticket fetch returns 404.

## Test Data & DB Isolation
- Use Prisma seed to provision org/users/tickets; wrap tests with transaction rollback or per-test schema to isolate data.【F:prisma/seed.js†L7-L146】
- For Playwright, run migrations to a throwaway database (`DATABASE_URL` pointing to per-run schema) and load minimal seed for deterministic IDs.
- Provide factories for tickets/comments to avoid sharing fixtures; avoid reusing demo passwords in automated runs.

## CI Pipeline & Gates
1. **Install & build**: `pnpm install`, `pnpm lint`, typecheck if added.
2. **Unit/Integration**: run Vitest suites against test DB (dockerized Postgres) after `prisma migrate deploy`.
3. **E2E smoke**: start Next dev server, seed DB, run Playwright headless for critical flows.
4. **Security gates**: add `pnpm audit`/`pnpm exec secretlint` (or trufflehog) and markdown/semgrep checks.
5. **Artifacts & triage**: on failure, upload Playwright traces, Vitest reports, and Prisma query logs; auto-open ticket with failing step summary.

## Failure Handling & Triage
- Classify failures: **env** (DB unavailable), **data** (fixture drift), **regression** (assert failure), **flaky** (timeout). Include tags in CI annotations.
- Provide rerun command snippets in CI output; auto-collect server logs and recent audit events for debugging.
>>>>>>> theirs
