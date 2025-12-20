# Testing & CI Strategy

## Repository Tooling & Assumptions
- Scripts: `pnpm lint`, `pnpm test` (Vitest), `pnpm test:e2e` (Playwright), Prisma migrate/seed helpers in package.json.
- DB: Postgres via `DATABASE_URL`; Prisma schema defines models including attachments/audit/SLA.
- Auth: NextAuth credentials with Prisma adapter; tests must seed users and sessions carefully.
- Local infra: `docker compose up -d db redis minio` with env placeholders (`POSTGRES_*`, `MINIO_ROOT_*`, `MINIO_BROWSER_REDIRECT_URL`), `DATABASE_URL=postgres://postgres:postgres@localhost:5432/helpdesk`, `REDIS_URL=redis://localhost:6379`, MinIO at `http://localhost:9000`.

## Test Pyramid
- Unit (fast, no DB): validation helpers, rate limiter utilities, markdown sanitizer, audit hash chain builder, SLA due calculators.
- Integration (API + DB): Next.js route handlers for tickets/comments with org scoping and role checks; credential login failures/success; attachment signed-URL service once built. Run against isolated Postgres schema per job using `prisma migrate deploy` and rollback between tests.
- E2E (Playwright): Browser flows against dev server with seeded data and `.env.test`; use per-run test DB or schema to avoid leakage.

## Critical E2E Journeys (role-based)
- Requester: login > create ticket with markdown > confirm only own tickets visible > attempt forbidden status change (expect error) > verify internal comment not visible.
- Agent: login > view org tickets > change status/assignee > add internal comment > requester cannot see it > SLA timestamps present.
- Admin (future): manage users/teams/SLA when admin panel arrives; verify non-admin blocked.
- Security negatives: submit markdown `<script>` and confirm sanitized; attempt cross-org ticket URL returns 404; repeated login triggers rate limit.

## Integration Test Plan & Data Isolation
- Use Prisma migrations against dedicated test database; each suite seeds minimal org/users/tickets via factories or `prisma/seed.js` subsets.
- Wrap integration tests in transactions rolled back per test or generate per-suite schema names to isolate data.
- Fixtures: ticket factory with customizable org/requester/assignee; comment factory with `isInternal` flag; auth helper to obtain session token via NextAuth route.
- Attachments (future): mock storage provider and AV scan hook; verify metadata persisted with org ownership.

## CI Pipeline (proposed gates)
1. Setup: `pnpm install`; generate Prisma client; start Postgres service. Env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` for test callbacks.
2. Static analysis: `pnpm lint`; `pnpm exec tsc --noEmit` (when ready); optional `pnpm exec semgrep` for org filter/sanitizer/auth checks.
3. Security scanning: `pnpm audit --audit-level=high`; optional secret scan (trufflehog/secretlint).
4. Unit/Integration: run Vitest with isolated DB; apply `prisma migrate deploy` before tests; collect coverage (target ?80% lines for core API modules).
5. E2E smoke: `pnpm test:e2e` with Playwright against `pnpm dev` server using seeded test DB; upload traces/screenshots as artifacts.
6. Guardrail: conflict-marker scan mirroring `.github/workflows/conflict-marker.yml` to block merges when `git grep -n "[<=>]\{7\}" -- .` finds markers.
7. Artifacts & failure triage: always upload Playwright traces, Vitest junit/coverage, Prisma query logs; on failure, surface failing stage and rerun command.

## Coverage Expectations
- Critical modules (auth, tickets API, org scoping, sanitizer, rate limiter) ?80% line coverage before release; markdown sanitizer and org filter paths must have direct assertions.
- E2E smoke must cover requester + agent journeys above; failures block deploy until triaged.

## Test Data & Privacy
- Do not reuse demo production credentials; generate unique test users per run.
- Ensure seeded data avoids real PII; purge test databases after CI completion.

## Local Guardrails
- Run conflict-marker scan before pushing: `git grep -n "[<=>]\{7\}" -- .` (fails on any conflict marker).
