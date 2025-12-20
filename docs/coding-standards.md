# Coding Standards

## Tooling
- Use Node 22+ and pnpm (repo uses `pnpm-lock.yaml`).
- Run `pnpm lint` before pushing; add targeted fixes instead of suppressing rules.
- Prefer Prettier-equivalent formatting where ESLint enforces it; avoid inline `// eslint-disable` unless justified in code review notes.

## Branches and commits
- Branch from `main`; use `codex/<scope>-<yyyymmdd-hhmm>` for work orders or `feature/<ticket>-<slug>` for regular tasks.
- Keep commits focused; message style `type: summary` (e.g., `docs: add coding standards`).
- Rebase or update from `main` before opening a PR to avoid merge noise.

## PR expectations
- Title: concise and references scope (e.g., `P0: dev bootstrap + standards (closes #4 #5 #6 #9)`).
- Body: include closing keywords for linked issues; list tests run (or state "not run" with rationale).
- Keep scope aligned to the work order; avoid drive-by changes without notes.

## Code conventions
- TypeScript/React: prefer functional components, explicit return types on exported functions, and narrow `any` usage.
- API/routes: validate inputs (Zod), enforce org/role checks, and return consistent error shapes defined in OpenAPI/error model.
- Database: migrations should be additive; never drop data without a backup/rollback plan.
- Logging: use structured logs; avoid leaking secrets.
