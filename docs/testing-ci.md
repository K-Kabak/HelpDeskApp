# Testing & CI

## Tooling Baseline
- Vitest and Playwright are available via scripts (`pnpm test`, `pnpm test:e2e`) in package.json.
- Prisma models define the data surface for fixtures (prisma/schema.prisma) and demo data exists in `prisma/seed.js`.

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
