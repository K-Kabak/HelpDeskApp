# Stop/Go Checkpoints (Phase 0)

Defines objective Go/No-Go gates for early delivery waves. Commands assume PowerShell on Windows; adjust to shell as needed.

## Checkpoint 1 (tasks 001-011)
- **Scope covered:** env validation/bootstrap (001-006), coding standards/conventions (007-009), OpenAPI baseline (010), contract test harness placeholder (011).
- **Must-pass commands:**
  - `pnpm check:env` (Node >=22, package manager present/warned, DATABASE_URL present via env or `.env.local`)
  - `pnpm check:envexample` (verifies `.env.example` has `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
  - `pnpm lint`
  - `pnpm openapi:lint` (spec at `docs/openapi.yaml`; use CI job if local script unavailable)
  - `pnpm test:contract` (can be empty suite but must exit 0)
- **Expected outputs:**
  - Env checks exit 0; warnings acceptable only for missing pnpm if npm present/blocked (PowerShell policy) and called out in run logs.
  - Lint exits 0 with no unhandled errors.
  - OpenAPI lint exits 0; fails if spec drift or script missing (treat missing script as No-Go).
  - Contract tests exit 0 (even if no cases).
- **Go / No-Go:**
  - **Go** if all commands exit 0 and no missing scripts; CI pipeline for these gates is green or documented as green in run log.
  - **No-Go** if any command fails or a required script is absent; log blocking step in PR and return to task owners (001-011) to close gaps.
- **Rollback guidance:**
  - Do not proceed to MVP tasks; fix failing gate (update scripts/docs/spec) and rerun full gate list.
  - If OpenAPI lint/contract tests fail due to spec drift, align `docs/openapi.yaml` with code or update AS-IS notes before reattempt.
  - Keep branch open; avoid merging partial checkpoint changes without green gates.

## Checkpoint 2 (tasks 013-023)
- **Scope covered:** sanitizer + auth helper wiring (013-017), permission matrix doc (018), base test harness + initial tests (019-020), logging/rate limit skeletons (021,016), visibility audit (022), CI gating for contracts (023).
- **Must-pass commands:**
  - `pnpm check:env` and `pnpm check:envexample`
  - `pnpm lint`
  - `pnpm test` (unit/integration harness for sanitizer/auth/helper)
  - `pnpm test:contract` (contract harness present and green)
  - `pnpm openapi:lint` (ensures contracts + AS-IS notes remain consistent)
  - Conflict scan: `git grep -n "[<=>]\\{7\\}" -- .`
- **Expected outputs:**
  - Env checks exit 0 with no missing keys.
  - Lint/test suites exit 0; sanitizer/auth/rate-limit tests present and green.
  - Contract tests exercise documented behaviors or remain empty but must pass.
  - OpenAPI lint exits 0 with updated contracts for sanitizer/auth/error model.
  - Conflict scan returns no matches.
- **Go / No-Go:**
  - **Go** if all commands exit 0 and visibility/rate-limit/auth changes are documented in `docs/permission-matrix.md` and `docs/contract-conventions.md` as applicable.
  - **No-Go** if any command fails, if contract/docs are missing corresponding changes, or conflict markers are present.
- **Rollback guidance:**
  - Halt before merging Phase 0 outputs; fix failing stage and rerun full gate list.
  - For test failures, prioritize sanitizer/auth/rate-limit coverage updates, then rerun `pnpm test`.
  - If OpenAPI lint fails, reconcile handlers vs `docs/openapi.yaml` and rerun lint + contract tests before resuming.

## Checkpoint 3 (tasks 025-035)
- **Scope covered:** attachments metadata/visibility migration + seed (025-026), upload API/presign + AV hook (027-028), attachment UI picker (029), rate limiting wiring (030), category taxonomy + seeds (031), category on ticket form (032), SLA pause fields placeholder (033), notification preferences schema + service stub (034-035), Stop/Go gate.
- **Must-pass commands (PowerShell examples):**
  - `pnpm check:env` and `pnpm check:envexample`
  - `pnpm lint`
  - `pnpm test` (unit/integration covering attachment validation/AV stub/category UI if present)
  - `pnpm test:contract` (contract harness present)
  - `pnpm openapi:lint`
  - DB migration smoke: `pnpm prisma:migrate` (local) and `pnpm prisma:seed` (verifies attachment/category seeds)
  - Conflict scan: `git grep -n "[<=>]\\{7\\}" -- .`
- **Expected outputs:**
  - Migrations apply without drift; seed populates categories and sample attachments metadata.
  - Upload API tests (if present) pass; AV stub records status.
  - UI build renders attachment picker/category field with no type errors.
  - Lint/tests/contract/OpenAPI gates exit 0.
- **Go / No-Go:**
  - **Go** if migrations + seeds succeed, all commands above exit 0, and attachment/category features are documented in `docs/contract-conventions.md`/OpenAPI where applicable.
  - **No-Go** if migrations fail, lint/tests/contract/OpenAPI fail, or conflict markers exist. Also No-Go if attachment org/visibility rules are undocumented or untested.
- **Rollback guidance:**
  - If migrations fail, fix schema files, reset local DB (`pnpm prisma migrate reset`), and rerun migrate/seed before retrying.
  - If AV/attachment tests fail, disable the new route behind a feature flag or revert the route change before proceeding.
  - Hold merge until all gates are green; re-run full gate list after fixes.

## Checkpoint 4 (tasks 037-047)
- **Scope covered:** comment spam guard (037), sanitize on ingest (038), SLA policy admin CRUD + UI (039-041), SLA breach indicators (042), shared policy module for transitions (043), org/role helper on comments (044), ticket search index (045), cursor pagination (046), attachment audit logging (047), Stop/Go gate.
- **Must-pass commands (PowerShell examples):**
  - `pnpm check:env` and `pnpm check:envexample`
  - `pnpm lint`
  - `pnpm test` (includes sanitizer/auth/rate-limit/attachment audit tests and pagination helpers)
  - `pnpm test:contract`
  - `pnpm openapi:lint`
  - Conflict scan: `git grep -n "[<=>]\\{7\\}" -- .`
- **Expected outputs:**
  - Tests cover sanitizer ingest, comment org guard, spam guard, SLA indicator helpers, pagination helpers, and attachment audit hooks; all pass.
  - OpenAPI/contract docs updated for comment org rules, pagination params, SLA policy endpoints, attachment audit if exposed.
  - Lint/typecheck clean; no missing scripts.
- **Go / No-Go:**
  - **Go** if all commands exit 0, pagination/guard rails reflected in docs, and audit/logging/guards are covered by tests.
  - **No-Go** if any gate fails, if pagination/sanitizer/audit changes are undocumented, or conflict markers exist.
- **Rollback guidance:**
  - Fix failing tests or doc/spec mismatches, then rerun the full gate list.
  - If pagination breaks UI, revert to previous list query or hide pagination behind a flag until fixed.
- Do not merge partial checkpoint work without green gates.

## Checkpoint 7 (tasks 075-085)
- **Scope covered:** notification worker readiness (075), queue health endpoints (076), SLA dashboard widgets (077), automation rule engine (078), job retries/DLQ (079), worker runbook (080), SLA reminders (081), CSAT trigger (082), notification preference enforcement (083), SLA escalation logic (084), OpenAPI updates for worker-driven events/contracts (085). Related issues: #65, #69, #47, #115.
- **Must-pass commands:**
  - `pnpm check:env` and `pnpm check:envexample`
  - `pnpm lint`
  - `pnpm test` (ensure automation/worker/SLA/notification suites pass)
  - `pnpm test:contract`
  - `pnpm openapi:lint`
  - Conflict scan: `git grep -n "[<=>]\\{7\\}" -- .`
  - Worker health verification: `node scripts/worker-health.js` (BullMQ connection/drain check)
- **Expected outputs / acceptance:**
  - Env scripts exit 0; warnings allowed only for package-manager detection.
  - Lint/tests/contract/OpenAPI gates exit 0 with coverage for automation, SLA, notification, and audit hooks.
  - Worker health script reports ready queues and successful Redis heartbeat (see `docs/worker-deployment-runbook.md`).
  - Documentation links referencing #115 and automation changes are present.
- **Go / No-Go:**
  - **Go** if all checks pass, worker health is verified, docs updated, and relevant issues (#65, #69, #47, #115) are linked in the PR.
  - **No-Go** if any command fails, worker health script reports errors, tests are missing for automation/audit logic, or conflict markers exist.
- **Rollback guidance:**
  - Revert to prior worker artifact/tag, rerun health checks, and ensure automation jobs are disabled (`WORKER_DISABLE_AUTOMATIONS=true`) before reopening gate.
  - If automation or notification jobs deliver duplicates, pause the worker, inspect `tests/automation.test.ts`, and rerun `pnpm test:contract`.
  - Record the rollback in issue #121 and reschedule the gate once the fix is verified.
