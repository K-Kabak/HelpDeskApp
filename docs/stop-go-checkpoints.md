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
