# Label taxonomy
- **priority:** `P0` (must-do), `P1` (should-do), `P2` (later)
- **area:** `frontend`, `backend`, `api`, `data`, `auth`, `ops`, `security`, `qa`, `docs`
- **type:** `feature`, `bug`, `chore`, `refactor`, `spike`

# Milestone goals
<<<<<<< ours
- **Phase 0:** establish tooling, environment readiness, guardrails (auth, sanitizer), and baseline tests/logging with checkpoints.
- **MVP (P0):** deliver attachment-ready schema, categories, SLA placeholders, rate limits, and governance checkpoints for collaboration foundations.
- **V1 (P1):** bring workers, notifications, automation, admin auditability, and SLA dashboards online with checkpoints.
- **V2 (P2):** complete reporting/CSAT/UX polish, observability, compliance, and release-readiness gates.

# How to execute
- **Triage flow:** (1) verify dependency readiness, (2) confirm scope/acceptance, (3) size and assign, (4) ensure labels set, (5) add to milestone board, (6) implement, (7) capture Test Proof artifacts, (8) request review, (9) update coverage map if scope shifts.
- **Definition of Ready:** dependencies listed, environments available, acceptance/test proof understood, risks identified, rollback noted, labels assigned.
- **Definition of Done:** acceptance criteria met with passing proofs, docs/tests updated, security/edge cases addressed, rollback documented, milestone board updated, coverage map unchanged or amended intentionally.

# Milestone: Phase 0

**[001] Inventory missing specialist + Agent 5 contract docs**
- Goal / Why: Catalog absent inputs to unblock downstream planning and contract recreation.
- Scope: Included—list missing docs and owners; Excluded—recreating docs here.
- Acceptance Criteria:
  - Inventory enumerates all missing specialist/Agent 5 docs with proposed owners.
  - Stored in repo doc and referenced in planning.
- Test Proof: Document update committed.
- Dependencies: None.
- Labels: priority `P0`, area `docs`, type `chore`.
- Risk/Edge cases:
  - Overlooking hidden files in repo.
  - Owners unavailable; note gaps.
- Rollback/Recovery: Update list if new docs appear.

**[002] Create environment validation script**
- Goal / Why: Automatically fail when Node 22, pnpm, or Postgres is missing.
- Scope: Included—script for local/CI checks; Excluded—installing tools.
- Acceptance Criteria:
  - Script exits non-zero when prerequisites unmet.
  - Documented usage in README or CI.
- Test Proof: Script run output in CI/local logs.
- Dependencies: Inventory missing docs.
- Labels: priority `P0`, area `ops`, type `feature`.
- Risk/Edge cases:
  - False positives on differing PATHs.
  - Postgres connection string secrets leakage.
- Rollback/Recovery: Remove script reference if blocking pipelines.

**[003] Add `.env.example` completeness check**
- Goal / Why: Ensure required env vars (DATABASE_URL, NEXTAUTH_SECRET, etc.) are present.
- Scope: Included—checker tooling; Excluded—real secrets.
- Acceptance Criteria:
  - Check fails on missing keys and passes with placeholders.
  - Integrated into lint/CI.
- Test Proof: Unit test or CI log showing pass/fail behavior.
- Dependencies: Environment validation script.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Accidental logging of secrets.
  - Optional vars treated as required; document exceptions.
- Rollback/Recovery: Disable check temporarily via flag.

**[004] Document local dev bootstrap steps**
- Goal / Why: Provide reproducible setup guidance.
- Scope: Included—README addendum; Excluded—per-OS nuances beyond basics.
- Acceptance Criteria:
  - Steps cover install, env setup, DB start, seed, and test commands.
  - Validated by following instructions on clean environment.
- Test Proof: Command transcript or reviewer sign-off.
- Dependencies: Environment validation script.
- Labels: priority `P0`, area `docs`, type `chore`.
- Risk/Edge cases:
  - Outdated commands as tooling evolves.
  - Missing troubleshooting tips for DB/startup.
- Rollback/Recovery: Revert doc section if incorrect.

**[005] Add infra IaC stub (Docker compose for Postgres/Redis/MinIO)**
- Goal / Why: Provide local infrastructure parity for DB/cache/storage.
- Scope: Included—docker-compose services with safe defaults; Excluded—production infra.
- Acceptance Criteria:
  - `docker compose up` starts Postgres, Redis, MinIO with documented ports.
  - Smoke connection verified.
- Test Proof: Compose up log and connection check.
- Dependencies: Environment validation script.
- Labels: priority `P0`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Port conflicts on developer machines.
  - Default creds accidentally reused in prod.
- Rollback/Recovery: Remove services from compose if unstable.

**[006] CI pipeline skeleton (lint, typecheck placeholder)**
- Goal / Why: Establish CI entrypoint to catch regressions early.
- Scope: Included—workflow file for lint/typecheck/test placeholders; Excluded—full coverage.
- Acceptance Criteria:
  - Workflow runs on PRs and reports status.
  - Secrets masked; no failing placeholder steps.
- Test Proof: CI log or local act run.
- Dependencies: `.env.example` check.
- Labels: priority `P0`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Missing cache causing slow runs.
  - Secrets or tokens misconfigured.
- Rollback/Recovery: Disable workflow step-by-step if blocking.

**[007] Publish coding standards doc**
- Goal / Why: Align lint/format/commit expectations.
- Scope: Included—doc covering validation, auth, audit expectations; Excluded—enforcement tooling beyond CI hooks.
- Acceptance Criteria:
  - Document merged with reviewers acknowledging scope.
  - References lint/format commands and commit message style.
- Test Proof: Doc presence in repo.
- Dependencies: Dev bootstrap doc.
- Labels: priority `P0`, area `docs`, type `chore`.
- Risk/Edge cases:
  - Conflicts with existing conventions; resolve in doc.
  - Developers ignore guidance; link in PR template later.
- Rollback/Recovery: Update doc if standards change.

**[008] Introduce shared error/response schema**
- Goal / Why: Standardize API responses and prevent detail leaks.
- Scope: Included—schema export and usage in one route; Excluded—full API refactor.
- Acceptance Criteria:
  - Schema defined and consumed by at least one API route.
  - Validation ensures sanitized error messages.
- Test Proof: Unit test for serializer.
- Dependencies: CI pipeline skeleton.
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - Backwards incompatibility with clients.
  - Error messages losing useful debug info.
- Rollback/Recovery: Revert route wiring to prior response shape.

**[009] Add Markdown sanitization utility**
- Goal / Why: Prevent XSS in rendered Markdown.
- Scope: Included—utility and tests; Excluded—full ingest sanitization (later task).
- Acceptance Criteria:
  - Sanitizer handles representative XSS strings.
  - Utility imported where Markdown rendered.
- Test Proof: Unit tests covering malicious payloads.
- Dependencies: Shared error/response schema.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Over-sanitization removing safe content.
  - Performance overhead on large inputs.
- Rollback/Recovery: Remove sanitizer call temporarily.

**[010] Stop/Go Checkpoint 1 (tasks 001–009)**
- Goal / Why: Confirm foundations before permission/auth tasks.
- Scope: Included—review outcomes and sign-off; Excluded—new implementation work.
- Acceptance Criteria:
  - Checklist completed with go/hold decision recorded.
  - Action items assigned for any blockers.
- Test Proof: Checkpoint note stored in docs.
- Dependencies: Tasks 001–009.
- Labels: priority `P0`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Incomplete evidence leading to false go.
  - Decision not circulated to team.
- Rollback/Recovery: Re-run checkpoint after fixes.

**[011] Add shared authorization helper**
- Goal / Why: Centralize org/role checks for consistency.
- Scope: Included—helper function/module; Excluded—applying everywhere (next task handles key routes).
- Acceptance Criteria:
  - Helper enforces org + role gates with defaults to deny.
  - Used in at least one endpoint.
- Test Proof: Unit test matrix for roles/org ownership.
- Dependencies: Shared error/response schema.
- Labels: priority `P0`, area `auth`, type `feature`.
- Risk/Edge cases:
  - Incorrect role mapping locking out users.
  - Performance if used per request without caching.
- Rollback/Recovery: Revert helper usage quickly.

**[012] Apply auth helper to ticket GET/POST routes**
- Goal / Why: Ensure core ticket routes honor org/role permissions.
- Scope: Included—ticket list/create/update; Excluded—comments/admin routes (later tasks).
- Acceptance Criteria:
  - Requester vs agent/admin paths tested and enforced.
  - Unauthorized access returns appropriate status using shared schema.
- Test Proof: Integration tests for requester/agent/admin permutations.
- Dependencies: Add shared authorization helper.
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - Regression on existing clients expecting older behavior.
  - Missing org check on nested relations.
- Rollback/Recovery: Temporarily disable helper per route.

**[013] Add rate limiting middleware skeleton**
- Goal / Why: Prepare for throttling without enabling globally.
- Scope: Included—middleware export and configuration stub; Excluded—wiring to routes (later task).
- Acceptance Criteria:
  - Middleware can be imported and configured; defaults no-op.
  - Unit test validates limit calculation.
- Test Proof: Passing unit test/log output.
- Dependencies: Add shared authorization helper.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Skeleton accidentally rate limits due to default config.
  - Storage for counters not ready; document stub behavior.
- Rollback/Recovery: Remove middleware from exports.

**[014] Wire Markdown sanitizer to ticket/comment display**
- Goal / Why: Ensure rendered Markdown is sanitized in UI.
- Scope: Included—apply sanitizer to display paths; Excluded—ingest sanitization (later).
- Acceptance Criteria:
  - Ticket/comment displays pass through sanitizer.
  - Snapshot or integration shows sanitized output.
- Test Proof: Integration snapshot test.
- Dependencies: Markdown sanitization utility.
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Performance impact on large lists.
  - Edge markdown constructs stripped unexpectedly.
- Rollback/Recovery: Remove sanitizer call temporarily.

**[015] Define permission matrix doc (UI vs API)**
- Goal / Why: Document role-based actions for consistency across stack.
- Scope: Included—matrix for requester/agent/admin across UI/API; Excluded—implementation changes.
- Acceptance Criteria:
  - Matrix published with clear allowed/blocked states.
  - Linked from coding standards or docs index.
- Test Proof: Doc published and reviewed.
- Dependencies: Add shared authorization helper.
- Labels: priority `P0`, area `docs`, type `chore`.
- Risk/Edge cases:
  - Matrix diverges from code; note gaps.
  - Future roles not captured.
- Rollback/Recovery: Update matrix when policy changes.

**[016] Add base test harness (Vitest config)**
- Goal / Why: Enable running unit tests consistently.
- Scope: Included—Vitest config, basic setup; Excluded—full test suite.
- Acceptance Criteria:
  - `pnpm test` executes and exits successfully with placeholder tests.
  - Config checked into repo.
- Test Proof: Command output from test run.
- Dependencies: CI pipeline skeleton.
- Labels: priority `P0`, area `qa`, type `feature`.
- Risk/Edge cases:
  - Conflicts with existing test tooling.
  - Flaky environment dependencies.
- Rollback/Recovery: Remove or disable Vitest config.

**[017] Add unit tests for auth helper and sanitizer**
- Goal / Why: Validate critical security utilities.
- Scope: Included—tests for auth helper and Markdown sanitizer; Excluded—other modules.
- Acceptance Criteria:
  - Coverage includes edge cases (invalid roles, XSS strings).
  - Tests green in CI.
- Test Proof: `pnpm test` passing output.
- Dependencies: Auth helper, Markdown sanitizer, test harness.
- Labels: priority `P0`, area `qa`, type `feature`.
- Risk/Edge cases:
  - Tests brittle to dependency changes.
  - Fixtures leaking secrets; ensure synthetic data.
- Rollback/Recovery: Mark tests skipped if blocking.

**[018] Audit internal/public comment visibility**
- Goal / Why: Capture visibility gaps before implementing API/UI changes.
- Scope: Included—checklist of visibility rules across UI/API; Excluded—code changes.
- Acceptance Criteria:
  - Checklist enumerates current vs expected visibility for roles.
  - Findings linked to follow-up tasks.
- Test Proof: Checklist document.
- Dependencies: Permission matrix doc.
- Labels: priority `P0`, area `security`, type `chore`.
- Risk/Edge cases:
  - Missing flows (attachments, future features) overlooked.
  - Misclassification of internal vs public comment rules.
- Rollback/Recovery: Update audit as new features land.

**[019] Add logging baseline (request IDs, user id)**
- Goal / Why: Provide traceability for API requests.
- Scope: Included—logging middleware capturing request ID/user; Excluded—full observability stack.
- Acceptance Criteria:
  - Logs include request ID and user identifier where available.
  - Configured to avoid PII in messages.
- Test Proof: Unit test or sample log output.
- Dependencies: Shared error/response schema.
- Labels: priority `P0`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Logging secrets by accident; redact sensitive fields.
  - Performance overhead in production.
- Rollback/Recovery: Disable logger via flag.

**[020] Stop/Go Checkpoint 2 (tasks 011–019)**
- Goal / Why: Validate security/auth/logging readiness before MVP scope.
- Scope: Included—review outcomes and go/hold decision; Excluded—new implementation.
- Acceptance Criteria:
  - Checklist completed with decisions recorded.
  - Blockers documented with owners.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 011–019.
- Labels: priority `P0`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Proceeding despite failing tests.
  - Missing stakeholders in review.
- Rollback/Recovery: Re-run checkpoint after fixes.

# Milestone: MVP (P0)

**[021] Migrate attachment visibility/metadata columns**
- Goal / Why: Prepare DB for attachment handling.
- Scope: Included—Prisma migration adding visibility/metadata; Excluded—upload logic.
- Acceptance Criteria:
  - Migration applies locally without data loss.
  - Columns nullable defaults documented.
- Test Proof: Prisma migrate log.
- Dependencies: Infra IaC stub, Apply auth helper to tickets.
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - Breaking existing schema relations.
  - Downtime during migration; note window.
- Rollback/Recovery: Prisma migrate reset/rollback.

**[022] Backfill seed with attachment sample rows**
- Goal / Why: Provide sample data for attachment flows.
- Scope: Included—seed data additions; Excluded—real files.
- Acceptance Criteria:
  - Seed script inserts attachment metadata tied to tickets.
  - Seed runs clean on fresh DB.
- Test Proof: `pnpm prisma db seed` output.
- Dependencies: Migrate attachment visibility.
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - Oversized sample data bloating DB.
  - Non-deterministic seeds causing flaky tests.
- Rollback/Recovery: Remove attachment seed entries.

**[023] Implement attachment upload API with presigned URLs**
- Goal / Why: Enable secure uploads with storage metadata.
- Scope: Included—API route returning presigned URL + DB entry; Excluded—virus scan (later).
- Acceptance Criteria:
  - Presigned URL includes size/type restrictions.
  - Metadata persisted with org/user references.
- Test Proof: Integration test hitting upload endpoint.
- Dependencies: Migrate attachment visibility, Infra IaC stub.
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - Unsigned uploads bypassing validation.
  - URL expiry misconfigured leading to broken uploads.
- Rollback/Recovery: Disable route feature flag.

**[024] Add AV scanning hook (stub) post-upload**
- Goal / Why: Establish security posture for uploads.
- Scope: Included—stub hook marking AV status; Excluded—real AV service.
- Acceptance Criteria:
  - AV status stored and defaults to pending/quarantined until cleared.
  - Hook invoked after upload completes.
- Test Proof: Unit test with mock scan results.
- Dependencies: Attachment upload API.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - False positives blocking users; provide override flag.
  - Scan status not updated on failures.
- Rollback/Recovery: Bypass AV flag and mark safe if blocking.

**[025] Build UI attachment picker with progress + visibility toggle**
- Goal / Why: Allow users to upload attachments with proper visibility.
- Scope: Included—UI component wired to upload API with progress; Excluded—viewer UI.
- Acceptance Criteria:
  - Users can select files, see upload progress, and set public/internal flag.
  - Uploaded file links back to ticket.
- Test Proof: Manual/E2E run showing upload success.
- Dependencies: Attachment upload API.
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Large files causing stalled UI; enforce limits.
  - Wrong default visibility exposing internal files.
- Rollback/Recovery: Hide picker behind feature flag.

**[026] Apply rate limiting middleware to POST routes**
- Goal / Why: Protect comment/ticket/attachment POST endpoints from abuse.
- Scope: Included—enable middleware for key mutations; Excluded—other routes.
- Acceptance Criteria:
  - Exceeding thresholds returns 429 with structured error.
  - Limits configurable per user/IP.
- Test Proof: Integration test triggering throttle.
- Dependencies: Rate limiting skeleton, Attachment upload API.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Legitimate burst traffic blocked; tune limits.
  - Shared IPs (corp/VPN) causing false positives.
- Rollback/Recovery: Disable limiter via config.

**[027] Add category taxonomy table and seeds**
- Goal / Why: Support categorization for tickets.
- Scope: Included—migration and default seeds; Excluded—UI filters (later).
- Acceptance Criteria:
  - Categories table created with seeded defaults.
  - Org scoping enforced in schema/seed.
- Test Proof: Prisma migrate/seed outputs.
- Dependencies: Attachment migration.
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - Duplicate categories causing confusion.
  - Seed collisions with existing data.
- Rollback/Recovery: Revert migration.

**[028] Extend ticket form to select category**
- Goal / Why: Capture category on ticket creation.
- Scope: Included—UI/API handling category selection; Excluded—advanced filters.
- Acceptance Criteria:
  - Form lists taxonomy options and submits selected category ID.
  - Validation rejects categories outside org.
- Test Proof: E2E flow creating ticket with category.
- Dependencies: Category taxonomy seeds.
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Missing default selection causing null categories.
  - Org leakage in options; ensure scoping.
- Rollback/Recovery: Hide category field.

**[029] Add SLA pause/resume fields and placeholders**
- Goal / Why: Prepare schema for SLA pause logic.
- Scope: Included—DB fields and placeholder logic; Excluded—worker handling (later).
- Acceptance Criteria:
  - Fields stored on tickets with defaults.
  - No behavioral change yet beyond persistence.
- Test Proof: Migration applied; fields visible in Prisma client.
- Dependencies: Attachment migration.
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - Incorrect defaults impacting existing SLA calculations.
  - ORM model drift; ensure generated client updated.
- Rollback/Recovery: Remove fields via migration rollback.

**[030] Stop/Go Checkpoint 3 (tasks 021–029)**
- Goal / Why: Validate attachment/category/SLA schema readiness.
- Scope: Included—review tasks 021–029; Excluded—new implementation.
- Acceptance Criteria:
  - Checklist recorded with go/hold decision.
  - Action items documented.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 021–029.
- Labels: priority `P0`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Proceeding without adequate seeding.
  - Missing stakeholders.
- Rollback/Recovery: Re-run after blockers resolved.

**[031] Add notification preference schema**
- Goal / Why: Store user notification toggles.
- Scope: Included—DB migration for preferences; Excluded—enforcement logic (later).
- Acceptance Criteria:
  - Preferences table created with safe defaults.
  - Linked to users/orgs appropriately.
- Test Proof: Migration log.
- Dependencies: Attachment migration.
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - Default opt-out causing missing notifications.
  - Missing foreign key constraints.
- Rollback/Recovery: Drop table via migration.

**[032] Implement basic notification service interface**
- Goal / Why: Provide abstraction for sending notifications.
- Scope: Included—service stub with send method; Excluded—channel implementations beyond stub.
- Acceptance Criteria:
  - Interface supports email/in-app contract.
  - Unit tests validate invocation patterns.
- Test Proof: Passing unit tests.
- Dependencies: Notification preference schema.
- Labels: priority `P0`, area `backend`, type `feature`.
- Risk/Edge cases:
  - API surface may change later; keep backward compatibility.
  - Logging secrets in stub; redact.
- Rollback/Recovery: Remove or stub out implementation.

**[033] Add comment spam guard (cooldown per user)**
- Goal / Why: Reduce spam/abuse on comments.
- Scope: Included—server-side cooldown per user; Excluded—UI hints (later).
- Acceptance Criteria:
  - Repeated posts within window are rejected with structured error.
  - Cooldown configurable.
- Test Proof: Integration test demonstrating throttle.
- Dependencies: Rate limiting middleware applied.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Legitimate rapid replies blocked.
  - Clock skew across servers; rely on server time.
- Rollback/Recovery: Disable guard via config.

**[034] Sanitize Markdown on API ingest**
- Goal / Why: Ensure stored content is safe.
- Scope: Included—sanitize ticket/comment bodies before persistence; Excluded—rendering (already covered).
- Acceptance Criteria:
  - Inputs sanitized and stored cleanly.
  - Unit/integration tests cover XSS attempts.
- Test Proof: Passing tests showing sanitized storage.
- Dependencies: Markdown sanitization utility.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Double-sanitization altering content.
  - Performance hit on large payloads.
- Rollback/Recovery: Bypass sanitization via feature flag with audit note.

**[035] Stop/Go Checkpoint 4 (tasks 031–034)**
- Goal / Why: Confirm notification schema/service and sanitization readiness.
- Scope: Included—review tasks 031–034; Excluded—new implementation.
- Acceptance Criteria:
  - Decision recorded; blockers assigned.
  - Checklist captured.
- Test Proof: Checkpoint documentation.
- Dependencies: Tasks 031–034.
- Labels: priority `P0`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Ignoring spam guard false positives.
  - Preferences not validated before proceeding.
- Rollback/Recovery: Revisit after fixes.

**[036] Add SLA policy admin CRUD API**
- Goal / Why: Allow admins to manage SLA policies with overrides.
- Scope: Included—API routes for create/update/delete with org scope; Excluded—UI (later).
- Acceptance Criteria:
  - Admin-only enforcement with org scoping.
  - CRUD operations validated with integration tests.
- Test Proof: Integration test results.
- Dependencies: Category taxonomy, SLA pause fields.
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - Policy changes impacting existing tickets without migration.
  - Permission bypass exposing other org policies.
- Rollback/Recovery: Disable routes.

**[037] Admin UI for SLA policies**
- Goal / Why: Provide UI to manage SLA policies safely.
- Scope: Included—admin-only UI for CRUD; Excluded—non-admin surfaces.
- Acceptance Criteria:
  - UI validates inputs and respects org scoping.
  - E2E flow passes for create/update/delete.
- Test Proof: E2E test or manual run.
- Dependencies: SLA policy admin CRUD API.
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Unauthorized users accessing admin UI; ensure guards.
  - Data mismatch with API validations.
- Rollback/Recovery: Hide admin UI.

**[038] Ticket creation shows SLA preview**
- Goal / Why: Surface SLA due times during creation.
- Scope: Included—UI logic to compute preview; Excluded—worker enforcement.
- Acceptance Criteria:
  - Preview matches policy based on priority/category.
  - Unit test for calculation correctness.
- Test Proof: Unit test results or UI snapshot.
- Dependencies: SLA policy admin CRUD API, SLA pause fields.
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Preview drift if policy changes mid-session.
  - Timezone handling errors.
- Rollback/Recovery: Hide preview chip.

**[039] Add ticket list SLA breach indicators**
- Goal / Why: Highlight overdue tickets.
- Scope: Included—UI badges for breach state; Excluded—worker-driven updates.
- Acceptance Criteria:
  - Overdue tickets show badge; non-overdue do not.
  - Integration test verifies badge logic.
- Test Proof: Integration test or snapshot.
- Dependencies: SLA pause/resume fields.
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Incorrect thresholds causing false alarms.
  - Visual clutter; ensure accessibility.
- Rollback/Recovery: Hide badge display.

**[040] Shared policy module in TicketActions**
- Goal / Why: Enforce role-based transitions centrally.
- Scope: Included—use shared policy module for status transitions; Excluded—non-ticket flows.
- Acceptance Criteria:
  - Invalid transitions blocked per permission matrix.
  - Unit/integration tests cover role scenarios.
- Test Proof: Passing tests.
- Dependencies: Permission matrix doc.
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Transition rules drift from backend.
  - Requester lockouts if matrix incorrect.
- Rollback/Recovery: Revert to previous logic temporarily.

**[041] Apply auth helper to comments API**
- Goal / Why: Enforce org/role checks on comments endpoints.
- Scope: Included—comments API routes; Excluded—ticket routes (already handled).
- Acceptance Criteria:
  - Org mismatch rejected; requester vs agent/internal paths honored.
  - Integration tests validate access matrix.
- Test Proof: Integration test output.
- Dependencies: Apply auth helper to ticket routes.
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - Internal notes leaked if filter missed.
  - Requester unable to comment due to strict checks.
- Rollback/Recovery: Temporarily relax checks with audit note.

**[042] Add ticket search index**
- Goal / Why: Improve search performance across title/description/category.
- Scope: Included—DB index creation; Excluded—search API changes (later if needed).
- Acceptance Criteria:
  - Index created and used by queries.
  - Migration succeeds without locking issues.
- Test Proof: Migration log and query plan screenshot.
- Dependencies: Attachment migration.
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - Long migration time; plan window.
  - Index unused if queries not updated; confirm usage.
- Rollback/Recovery: Drop index via migration.

**[043] Improve ticket list pagination with cursor**
- Goal / Why: Make list scalable and predictable.
- Scope: Included—cursor-based pagination for list API/UI; Excluded—saved filters.
- Acceptance Criteria:
  - API returns cursor/next fields; UI consumes them.
  - Integration tests cover bounds and invalid cursors.
- Test Proof: Integration test results.
- Dependencies: Ticket search index.
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - Cursor tampering; validate input.
  - Pagination regression for existing clients.
- Rollback/Recovery: Fallback to offset pagination.

**[044] Audit logging for attachment uploads/deletes**
- Goal / Why: Track attachment operations for compliance.
- Scope: Included—audit records on upload/delete; Excluded—download logging (later).
- Acceptance Criteria:
  - Audit rows store actor, ticket, file metadata.
  - Unit tests verify creation on events.
- Test Proof: Unit test output.
- Dependencies: Attachment upload API.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Sensitive metadata stored; ensure minimal fields.
  - Audit table growth; plan retention.
- Rollback/Recovery: Disable audit hook.

**[045] Enforce attachment visibility on ticket detail**
- Goal / Why: Prevent unauthorized file access.
- Scope: Included—UI/API checks for internal/public visibility; Excluded—signed URL work (later).
- Acceptance Criteria:
  - Requesters cannot view internal attachments.
  - Integration/E2E tests validate role differences.
- Test Proof: Integration or E2E run.
- Dependencies: Attachment upload API, UI picker.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Leaking file metadata even when blocked.
  - Cached files bypassing checks.
- Rollback/Recovery: Hide attachments section.

**[046] Add team membership management API**
- Goal / Why: Allow admin management of team membership.
- Scope: Included—API for add/remove users from teams; Excluded—UI (later).
- Acceptance Criteria:
  - Admin-only enforcement.
  - Integration tests for add/remove flows.
- Test Proof: Integration test output.
- Dependencies: Category taxonomy.
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - Removing last admin/owner from team.
  - Org scope enforcement gaps.
- Rollback/Recovery: Disable endpoints.

**[047] Admin UI for users/teams CRUD**
- Goal / Why: Provide interface to manage users/teams.
- Scope: Included—admin UI for create/update/delete; Excluded—self-service invites.
- Acceptance Criteria:
  - UI enforces role guard and org scoping.
  - E2E coverage for CRUD flows.
- Test Proof: E2E results.
- Dependencies: Team membership management API.
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Accidental deletion of critical users; add confirmation.
  - Pagination/filters missing for large lists.
- Rollback/Recovery: Hide admin nav.

**[048] Enforce file size/type limits server-side**
- Goal / Why: Block unsafe uploads.
- Scope: Included—server-side validation for size/mime; Excluded—client validation (optional).
- Acceptance Criteria:
  - Oversized/disallowed types rejected with clear error.
  - Integration tests for allowed/blocked files.
- Test Proof: Integration test output.
- Dependencies: Attachment upload API.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Legitimate files blocked due to mime detection.
  - Inconsistent size checks between presign and ingest.
- Rollback/Recovery: Relax limits via config.

**[049] Add checksum verification for uploads**
- Goal / Why: Ensure integrity of uploaded files.
- Scope: Included—store checksum and validate on completion; Excluded—encryption.
- Acceptance Criteria:
  - Checksum captured and compared; mismatches flagged.
  - Unit test for checksum validation.
- Test Proof: Unit test output.
- Dependencies: Enforce file size/type limits.
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - Performance overhead computing checksum.
  - False negatives if clients compute differently; document algorithm.
- Rollback/Recovery: Bypass checksum check temporarily.

**[050] Stop/Go Checkpoint 5 (tasks 036–049)**
- Goal / Why: Confirm admin/SLA/attachment controls before worker work.
- Scope: Included—review tasks 036–049; Excluded—new implementation.
- Acceptance Criteria:
  - Go/hold decision recorded with action items.
  - Evidence gathered from tests.
- Test Proof: Checkpoint record.
- Dependencies: Tasks 036–049.
- Labels: priority `P0`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Proceeding without adequate audit coverage.
  - Missing stakeholders in review.
- Rollback/Recovery: Repeat after fixes.

# Milestone: V1 (P1)

**[051] Set up Redis/BullMQ worker service**
- Goal / Why: Introduce worker for async jobs.
- Scope: Included—worker service connecting to Redis processing dummy job; Excluded—deploy pipeline.
- Acceptance Criteria:
  - Worker connects and handles sample job end-to-end.
  - Configuration documented (env vars, ports).
- Test Proof: Integration/smoke log.
- Dependencies: Infra IaC stub, Notification service interface.
- Labels: priority `P1`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Resource contention with app DB.
  - Unhandled worker crashes; add retry/backoff later.
- Rollback/Recovery: Disable worker service.

**[052] Define queue job schema for SLA timers**
- Goal / Why: Standardize payloads for SLA timers.
- Scope: Included—job schema definitions; Excluded—enqueue logic (next task).
- Acceptance Criteria:
  - Payload includes org, ticket, due timestamps.
  - Unit tests validate schema.
- Test Proof: Unit test output.
- Dependencies: SLA pause/resume fields, Worker service.
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Schema drift causing job processing failures.
  - Missing org validation.
- Rollback/Recovery: Remove schema registration.

**[053] Schedule SLA jobs on ticket create/update**
- Goal / Why: Enqueue timers for SLA tracking.
- Scope: Included—enqueue on creation/update with due times; Excluded—processing logic (next).
- Acceptance Criteria:
  - Jobs enqueued with correct timestamps and org scope.
  - Integration tests cover create/update paths.
- Test Proof: Integration test logs.
- Dependencies: Queue job schema, SLA pause fields.
- Labels: priority `P1`, area `api`, type `feature`.
- Risk/Edge cases:
  - Duplicate jobs per update; dedupe logic needed.
  - Timezone and daylight savings issues.
- Rollback/Recovery: Disable enqueue step.

**[054] Process SLA breach -> audit + notifications**
- Goal / Why: Respond to SLA breaches automatically.
- Scope: Included—worker marks breach, writes audit, triggers notification stub; Excluded—escalation rules (later).
- Acceptance Criteria:
  - Breach sets flag once and records audit.
  - Notification dispatch invoked.
- Test Proof: Integration test for breach job.
- Dependencies: Schedule SLA jobs.
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Duplicate sends; ensure idempotency.
  - Missing org scope leading to cross-tenant alerts.
- Rollback/Recovery: Mark job failed and skip actions.

**[055] Add SLA pause/resume handling in worker**
- Goal / Why: Stop/start SLA clocks on status changes.
- Scope: Included—worker logic for pause/resume; Excluded—UI indicators (existing badges suffice).
- Acceptance Criteria:
  - Status changes adjust timers correctly.
  - Unit/integration tests cover transitions.
- Test Proof: Test suite results.
- Dependencies: Process SLA breach job.
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Race conditions with concurrent updates.
  - Incorrect mapping of statuses to pause.
- Rollback/Recovery: Disable pause logic flag.

**[056] Implement notification channels (email stub + in-app feed)**
- Goal / Why: Deliver notifications through defined channels.
- Scope: Included—email adapter stub and in-app feed storage; Excluded—production email provider.
- Acceptance Criteria:
  - Messages stored and logged; email stub invoked.
  - Integration tests cover both channels.
- Test Proof: Integration test output.
- Dependencies: Notification service interface.
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Sensitive data in emails; sanitize payloads.
  - In-app feed performance issues.
- Rollback/Recovery: Disable email adapter; keep feed.

**[057] Health checks for worker queues**
- Goal / Why: Observe queue health (lag/failures).
- Scope: Included—endpoint exposing metrics; Excluded—external monitoring integration (later).
- Acceptance Criteria:
  - Health endpoint returns lag/failure counts.
  - Protected from public access.
- Test Proof: Integration test hitting health endpoint.
- Dependencies: Worker service setup.
- Labels: priority `P1`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Exposure of sensitive metrics publicly.
  - Endpoint performance overhead.
- Rollback/Recovery: Disable endpoint.

**[058] Dashboard SLA widgets**
- Goal / Why: Visualize SLA breach states on dashboard.
- Scope: Included—widgets showing counts; Excluded—historical charts.
- Acceptance Criteria:
  - Widget renders breach counts by state.
  - Integration tests validate data mapping.
- Test Proof: Integration test or snapshot.
- Dependencies: SLA breach processing, SLA breach indicators UI.
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Data staleness without live updates.
  - Accessibility of widgets.
- Rollback/Recovery: Hide widget module.

**[059] Add automation rule engine (trigger/action config)**
- Goal / Why: Enable configurable automations.
- Scope: Included—persisted rules and execution on events; Excluded—UI builder.
- Acceptance Criteria:
  - Rules stored with org scope and validated actions.
  - Unit tests for trigger/action execution.
- Test Proof: Unit test output.
- Dependencies: Notification service, SLA policies.
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Misconfigured rules causing loops; add guards.
  - Security checks per action.
- Rollback/Recovery: Disable engine evaluation.

**[060] Stop/Go Checkpoint 6 (tasks 051–059)**
- Goal / Why: Verify worker/automation readiness before resilience work.
- Scope: Included—review tasks 051–059; Excluded—new implementation.
- Acceptance Criteria:
  - Go/hold decision documented.
  - Evidence from tests attached.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 051–059.
- Labels: priority `P1`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Proceeding without queue health metrics validated.
  - Missing automation guardrails.
- Rollback/Recovery: Re-run after remediation.

**[061] Retry/backoff strategy with DLQ**
- Goal / Why: Improve worker resilience.
- Scope: Included—configure retries/backoff, DLQ logging/table; Excluded—alerting (later).
- Acceptance Criteria:
  - Failed jobs retried per policy and routed to DLQ after limit.
  - Unit tests cover retry/backoff logic.
- Test Proof: Unit test output.
- Dependencies: Worker service setup.
- Labels: priority `P1`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Infinite retry loops; cap attempts.
  - DLQ growth without cleanup.
- Rollback/Recovery: Disable retries or DLQ routing.

**[062] Worker deployment runbook**
- Goal / Why: Document restart/drain/rollback steps.
- Scope: Included—runbook for worker operations; Excluded—automated tooling.
- Acceptance Criteria:
  - Runbook covers start/stop, drain, rollback, access controls.
  - Tabletop review performed.
- Test Proof: Tabletop or checklist sign-off.
- Dependencies: Worker health checks.
- Labels: priority `P1`, area `ops`, type `docs`.
- Risk/Edge cases:
  - Missing steps for emergencies.
  - Stale instructions after infra changes.
- Rollback/Recovery: Update runbook promptly.

**[063] SLA reminder notifications before breach**
- Goal / Why: Warn before SLA breaches.
- Scope: Included—reminder trigger logic and notification dispatch; Excluded—UI snooze controls.
- Acceptance Criteria:
  - Reminder sent once per ticket at threshold with deduping.
  - Integration tests validate timing.
- Test Proof: Integration test logs.
- Dependencies: SLA breach processing.
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Duplicate reminders; ensure idempotency.
  - Reminder spam on frequent updates.
- Rollback/Recovery: Disable reminder flag.

**[064] CSAT request trigger on resolution/closure**
- Goal / Why: Solicit feedback post-resolution.
- Scope: Included—trigger sending CSAT notification once per ticket; Excluded—CSAT submission endpoint (later).
- Acceptance Criteria:
  - Trigger fires on resolution/closure and respects dedupe.
  - Integration tests confirm one-per-ticket behavior.
- Test Proof: Integration test output.
- Dependencies: SLA pause handling, Notification channels.
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Trigger firing on reopen incorrectly.
  - Sends to wrong recipients; ensure scoping.
- Rollback/Recovery: Disable trigger logic.

**[065] Stop/Go Checkpoint 7 (tasks 061–064)**
- Goal / Why: Validate resilience and notification triggers.
- Scope: Included—review tasks 061–064; Excluded—new implementation.
- Acceptance Criteria:
  - Decision recorded with evidence.
  - Blockers assigned.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 061–064.
- Labels: priority `P1`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Proceeding without DLQ visibility.
  - Reminder/CSAT spam unresolved.
- Rollback/Recovery: Re-run checkpoint.

**[066] Notification rate limiting/dedup service**
- Goal / Why: Prevent notification spam.
- Scope: Included—service to dedup and throttle notifications; Excluded—UI settings (preferences already stored).
- Acceptance Criteria:
  - Duplicate alerts suppressed per user/org.
  - Unit tests cover dedup/rate scenarios.
- Test Proof: Unit test output.
- Dependencies: Notification channels implemented.
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Legit alerts suppressed; tune thresholds.
  - State storage leaks memory; monitor.
- Rollback/Recovery: Bypass dedup with flag.

**[067] Notification templates (localizable)**
- Goal / Why: Standardize messaging and prepare for i18n.
- Scope: Included—template storage/rendering; Excluded—full localization framework (later task 101).
- Acceptance Criteria:
  - Templates stored with variables sanitized.
  - Snapshot/unit tests for rendering.
- Test Proof: Unit snapshot tests.
- Dependencies: Notification channels implemented.
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Template injection; sanitize variables.
  - Versioning drift; document updates.
- Rollback/Recovery: Revert to plain text messages.

**[068] Add @mentions parsing to comments**
- Goal / Why: Enable targeted notifications.
- Scope: Included—mentions stored and used to notify; Excluded—rich UI mention picker (optional later).
- Acceptance Criteria:
  - Mentions parsed server-side and validated against users.
  - Integration tests confirm notifications fired for mentions.
- Test Proof: Unit/integration tests.
- Dependencies: Markdown ingest sanitization.
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Mention of nonexistent users; handle gracefully.
  - Mention spam; leverage notification dedup.
- Rollback/Recovery: Disable mention parsing.

**[069] Add Kanban board view for tickets**
- Goal / Why: Provide drag/drop workflow management.
- Scope: Included—Kanban UI with status updates; Excluded—saved filters beyond board scope.
- Acceptance Criteria:
  - Drag/drop updates status respecting policy module.
  - E2E test covers move scenarios.
- Test Proof: E2E results.
- Dependencies: Cursor pagination, Policy module.
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Race conditions updating status; handle optimistic updates.
  - Accessibility for drag/drop; provide keyboard alternative.
- Rollback/Recovery: Disable board route.

**[070] Admin governance for tags/categories cleanup**
- Goal / Why: Manage taxonomy hygiene.
- Scope: Included—merge/archive for tags/categories; Excluded—auto-suggest (later).
- Acceptance Criteria:
  - Admin UI/API supports archive/merge with org scoping.
  - Integration tests validate operations.
- Test Proof: Integration test results.
- Dependencies: Notification preference schema (taxonomy availability).
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Data loss during merges; add confirmation.
  - Broken references to archived items.
- Rollback/Recovery: Revert merges/archives via backup.

**[071] Audit coverage for admin CRUD**
- Goal / Why: Ensure admin actions are auditable.
- Scope: Included—audit hooks for users/teams/tags/SLA; Excluded—viewer UI (next task).
- Acceptance Criteria:
  - Audit records created for CRUD operations with actor info.
  - Integration tests verify audit entries.
- Test Proof: Integration test output.
- Dependencies: Admin UI for users/teams CRUD, SLA policy admin API.
- Labels: priority `P1`, area `security`, type `feature`.
- Risk/Edge cases:
  - Sensitive data in audit; limit fields.
  - Audit table growth; plan retention.
- Rollback/Recovery: Disable audit hooks if blocking.

**[072] Audit viewer UI for admins**
- Goal / Why: Provide admin access to audit logs.
- Scope: Included—paginated audit list with filters; Excluded—export.
- Acceptance Criteria:
  - Admin-only guard; filters by actor/date/action.
  - E2E test verifies pagination and filters.
- Test Proof: E2E output.
- Dependencies: Audit coverage for admin CRUD.
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Performance on large datasets; add pagination.
  - Exposure of PII in audit entries; redact sensitive fields.
- Rollback/Recovery: Hide audit viewer route.

**[073] Assignment auto-suggest in TicketActions**
- Goal / Why: Improve assignment efficiency based on load/team.
- Scope: Included—auto-suggest logic; Excluded—ML/advanced heuristics.
- Acceptance Criteria:
  - Suggestion displayed for eligible users/teams respecting org.
  - Unit tests validate selection logic.
- Test Proof: Unit test output.
- Dependencies: Automation rule engine, Team membership API.
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Suggestions exposing other org data.
  - Stale load data leading to poor suggestions.
- Rollback/Recovery: Disable suggestions.

**[074] Enhance search with tag/category filters**
- Goal / Why: Improve discoverability with taxonomy filters.
- Scope: Included—API/UI filters for tags/categories; Excluded—saved views (later).
- Acceptance Criteria:
  - Filters applied server-side with org validation.
  - Integration tests cover combinations.
- Test Proof: Integration test output.
- Dependencies: Category taxonomy, Admin governance for taxonomy.
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Query performance issues; ensure indexes.
  - UI complexity; preserve usability.
- Rollback/Recovery: Remove filters toggle.

**[075] Add reopen reason capture form**
- Goal / Why: Capture reason when reopening tickets.
- Scope: Included—UI/API change to require/collect reason; Excluded—analytics.
- Acceptance Criteria:
  - Reopen requires reason stored on ticket history.
  - Integration tests validate persistence and role rules.
- Test Proof: Integration test output.
- Dependencies: Policy module for transitions.
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - User friction; consider optional fields for some roles.
  - Reason containing sensitive data; sanitize.
- Rollback/Recovery: Make reason optional.

**[076] Reopen throttling (cooldown)**
- Goal / Why: Prevent abuse of reopen action.
- Scope: Included—API cooldown for reopen; Excluded—UI messaging beyond errors.
- Acceptance Criteria:
  - Rapid reopens blocked with clear error.
  - Integration tests verify cooldown enforcement.
- Test Proof: Integration test output.
- Dependencies: Reopen reason capture.
- Labels: priority `P1`, area `security`, type `feature`.
- Risk/Edge cases:
  - Genuine emergencies blocked; allow override for admins.
  - Time sync issues; use server clock.
- Rollback/Recovery: Disable cooldown gate.

**[077] Attachment download logging**
- Goal / Why: Audit attachment access.
- Scope: Included—audit on download events; Excluded—rate limiting downloads.
- Acceptance Criteria:
  - Download actions create audit entries with actor/time/file.
  - Unit tests verify logging hook.
- Test Proof: Unit test output.
- Dependencies: Enforce attachment visibility.
- Labels: priority `P1`, area `security`, type `feature`.
- Risk/Edge cases:
  - Excessive logging volume; monitor size.
  - Missing context (IP/user) reduces usefulness.
- Rollback/Recovery: Disable logging hook.

**[078] Apply auth helper to admin routes**
- Goal / Why: Enforce org scoping across admin endpoints.
- Scope: Included—apply helper to all admin APIs; Excluded—non-admin routes.
- Acceptance Criteria:
  - Admin APIs reject org mismatches.
  - Integration tests cover scoped access.
- Test Proof: Integration test output.
- Dependencies: Shared authorization helper.
- Labels: priority `P1`, area `auth`, type `feature`.
- Risk/Edge cases:
  - Legacy admin flows broken; ensure migration plan.
  - Performance overhead on many endpoints.
- Rollback/Recovery: Revert helper application selectively.

**[079] Contract tests UI vs API permissions**
- Goal / Why: Ensure permission matrix matches implementations.
- Scope: Included—automated contract tests comparing UI/API behaviors; Excluded—fixes (handled separately).
- Acceptance Criteria:
  - Contract suite passes for defined scenarios.
  - Failures documented with follow-up issues.
- Test Proof: Automated contract suite output.
- Dependencies: Permission matrix doc, Policy module.
- Labels: priority `P1`, area `qa`, type `feature`.
- Risk/Edge cases:
  - Flaky tests due to auth/session handling.
  - Coverage gaps for new endpoints.
- Rollback/Recovery: Quarantine flaky tests with issue logged.

**[080] Stop/Go Checkpoint 8 (tasks 066–079)**
- Goal / Why: Validate notification hardening and admin governance.
- Scope: Included—review tasks 066–079; Excluded—new implementation.
- Acceptance Criteria:
  - Go/hold decision captured with evidence.
  - Outstanding risks tracked.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 066–079.
- Labels: priority `P1`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Undetected cycles in dependency graph.
  - Overlooking flaky contract tests.
- Rollback/Recovery: Re-run after fixes.

# Milestone: V2 (P2)

**[081] Reporting job table and async export endpoints**
- Goal / Why: Enable asynchronous report generation.
- Scope: Included—job table and endpoints returning job IDs; Excluded—export scheduling (later).
- Acceptance Criteria:
  - Request returns job id; status endpoints reflect progress.
  - Integration tests validate org scoping and job lifecycle.
- Test Proof: Integration test output.
- Dependencies: Automation rule engine.
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Job queue overload; monitor capacity.
  - Exports including sensitive data; enforce redaction.
- Rollback/Recovery: Disable export endpoints.

**[082] Internal vs public attachment download URLs (signed, time-bound)**
- Goal / Why: Secure attachment delivery per visibility.
- Scope: Included—signed URLs with scope/expiry; Excluded—watermarking.
- Acceptance Criteria:
  - Signed URLs generated with expiry and org/role validation.
  - Integration tests cover internal vs public access paths.
- Test Proof: Integration test results.
- Dependencies: Attachment visibility enforcement, File size/type limits.
- Labels: priority `P2`, area `security`, type `feature`.
- Risk/Edge cases:
  - URL leakage; ensure short TTL and single-use where possible.
  - Clock skew affecting expiry.
- Rollback/Recovery: Revert to server-side proxy.

**[083] In-app notification center UI**
- Goal / Why: Provide centralized notification view.
- Scope: Included—list with read/unread and filters; Excluded—push/mobile.
- Acceptance Criteria:
  - Notifications scoped to user/org and mark-as-read works.
  - E2E test covers filtering and state changes.
- Test Proof: E2E run.
- Dependencies: Notification channels, Preference enforcement.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Performance with many notifications; add pagination.
  - Accessibility of read/unread states.
- Rollback/Recovery: Hide notification center route.

**[084] Bulk actions on ticket list**
- Goal / Why: Speed up multi-ticket workflows.
- Scope: Included—bulk assign/status change with audit; Excluded—bulk delete.
- Acceptance Criteria:
  - Bulk actions enforce permission checks per ticket.
  - Integration tests validate audit entries and partial failure handling.
- Test Proof: Integration test output.
- Dependencies: Policy module, Cursor pagination.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Partial failures leaving inconsistent state; ensure transactional handling.
  - Performance issues on large selections.
- Rollback/Recovery: Disable bulk endpoints.

**[085] Saved views for ticket filters**
- Goal / Why: Let users persist filter sets.
- Scope: Included—save/load personal/team views; Excluded—cross-org sharing.
- Acceptance Criteria:
  - Views stored with org scope; load applies filters.
  - Integration tests for create/update/delete flows.
- Test Proof: Integration test output.
- Dependencies: Cursor pagination.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Permission issues for team-shared views.
  - Stale filters after schema changes.
- Rollback/Recovery: Disable save feature.

**[086] Dashboard KPI cards (MTTR, MTTA, reopen rate)**
- Goal / Why: Surface operational metrics.
- Scope: Included—KPI calculations and UI cards; Excluded—trend charts.
- Acceptance Criteria:
  - Metrics computed accurately from data set.
  - Unit tests validate calculations.
- Test Proof: Unit test output.
- Dependencies: Reporting job infrastructure.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Expensive queries; cache as needed.
  - Misleading metrics due to data gaps.
- Rollback/Recovery: Hide KPI cards.

**[087] CSAT submission endpoint and schema**
- Goal / Why: Collect CSAT responses securely.
- Scope: Included—endpoint and schema allowing one response per ticket with token validation; Excluded—analytics (later).
- Acceptance Criteria:
  - Token validated and single submission enforced.
  - Integration tests cover success/invalid/expired cases.
- Test Proof: Integration test output.
- Dependencies: CSAT request trigger.
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Token leakage leading to spam; bind to ticket/email.
  - Replay attacks; expire tokens quickly.
- Rollback/Recovery: Disable endpoint.

**[088] CSAT UI for requester**
- Goal / Why: Provide interface for CSAT submission.
- Scope: Included—email link/page for requester submission; Excluded—admin dashboard.
- Acceptance Criteria:
  - Form validates token and submits score/comment.
  - E2E test covers happy/error paths.
- Test Proof: E2E output.
- Dependencies: CSAT submission endpoint.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Token reuse; ensure single use enforced.
  - Accessibility of form elements.
- Rollback/Recovery: Disable CSAT page.

**[089] Export to CSV for tickets and comments**
- Goal / Why: Allow data export with redaction.
- Scope: Included—CSV generation for tickets/comments; Excluded—scheduling (later).
- Acceptance Criteria:
  - Exports generated asynchronously with job status updates.
  - Sensitive/internal-only fields redacted for requesters.
- Test Proof: Integration test output.
- Dependencies: Reporting job infrastructure.
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Large export performance; batching required.
  - CSV injection; sanitize fields.
- Rollback/Recovery: Disable export endpoints.

**[090] SLA calibration tool (what-if simulator)**
- Goal / Why: Model breach outcomes under policy changes.
- Scope: Included—simulator returning projected breaches; Excluded—UI polish beyond MVP.
- Acceptance Criteria:
  - Simulator returns projections for sample tickets/policies.
  - Unit test covers calculations.
- Test Proof: Unit test output.
- Dependencies: SLA breach processing.
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Incorrect assumptions leading to misleading projections.
  - Performance on large data sets.
- Rollback/Recovery: Remove tool endpoint.

**[091] Stop/Go Checkpoint 9 (tasks 081–090)**
- Goal / Why: Validate reporting/CSAT foundation before expanding.
- Scope: Included—review tasks 081–090; Excluded—new implementation.
- Acceptance Criteria:
  - Go/hold decision documented with evidence.
  - Blockers captured with owners.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 081–090.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Proceeding without export redaction verified.
  - CSAT token issues unresolved.
- Rollback/Recovery: Re-run after fixes.

**[092] Accessibility audit and fixes (axe)**
- Goal / Why: Eliminate critical accessibility issues.
- Scope: Included—automated axe audit and fixes; Excluded—full WCAG certification.
- Acceptance Criteria:
  - Axe report shows zero critical issues on key screens.
  - Documented fixes applied.
- Test Proof: Automated axe report.
- Dependencies: Attachment picker, Admin SLA UI, Notification center.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - False positives from tooling; verify manually.
  - Regression risk in UI layout after fixes.
- Rollback/Recovery: Log issues and revert breaking fixes.

**[093] Localization framework groundwork**
- Goal / Why: Prepare UI for i18n.
- Scope: Included—key extraction and localization scaffolding; Excluded—full translations.
- Acceptance Criteria:
  - Major screens use translation keys.
  - Unit tests ensure fallback behavior.
- Test Proof: Unit test output.
- Dependencies: Notification templates.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Missing keys causing runtime errors.
  - Mixed languages during rollout; ensure defaults.
- Rollback/Recovery: Keep Polish strings as fallback.

**[094] Captcha fallback for suspicious submissions**
- Goal / Why: Mitigate abuse on ticket/comment submissions.
- Scope: Included—captcha trigger after threshold; Excluded—provider procurement.
- Acceptance Criteria:
  - Captcha enforced after defined threshold on risky clients.
  - Integration tests cover trigger and bypass scenarios.
- Test Proof: Integration test output.
- Dependencies: Comment spam guard.
- Labels: priority `P2`, area `security`, type `feature`.
- Risk/Edge cases:
  - Accessibility impact; provide alternate flow.
  - Key management and rate limits with provider.
- Rollback/Recovery: Disable captcha flag.

**[095] Reopen approvals for high-priority tickets**
- Goal / Why: Add oversight on critical ticket reopenings.
- Scope: Included—approval requirement for WYSOKI/KRYTYCZNY reopen; Excluded—lower priorities.
- Acceptance Criteria:
  - Reopen requires agent/admin approval for high priority.
  - Integration tests validate role enforcement.
- Test Proof: Integration test output.
- Dependencies: Reopen throttling.
- Labels: priority `P2`, area `workflow`, type `feature`.
- Risk/Edge cases:
  - Delayed approvals impacting SLA; document exceptions.
  - Approval bypass exploits; ensure audit logging.
- Rollback/Recovery: Bypass approvals via feature flag.

**[096] Knowledge base link injection based on category**
- Goal / Why: Suggest relevant KB links during intake.
- Scope: Included—link suggestions on ticket form by category; Excluded—KB authoring.
- Acceptance Criteria:
  - Suggestions appear for mapped categories with safe content.
  - Unit tests cover mapping logic.
- Test Proof: Unit test output.
- Dependencies: Category selection on ticket form.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Outdated links; maintain mapping table.
  - Sensitive content exposure; vet links.
- Rollback/Recovery: Hide suggestions.

**[097] CSAT analytics dashboards**
- Goal / Why: Visualize CSAT trends.
- Scope: Included—charts showing score distribution over time; Excluded—export.
- Acceptance Criteria:
  - Dashboards display CSAT metrics with filtering by date/category.
  - Integration tests validate data aggregation.
- Test Proof: Integration test output.
- Dependencies: CSAT UI and submission endpoint.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - PII exposure; anonymize requester data.
  - Performance on large datasets; cache results.
- Rollback/Recovery: Hide dashboard.

**[098] Report job performance optimizations**
- Goal / Why: Ensure exports meet SLA.
- Scope: Included—indexes/batching improvements for report jobs; Excluded—new reports.
- Acceptance Criteria:
  - Job completion meets defined SLA threshold.
  - Load/performance test results recorded.
- Test Proof: Load test output.
- Dependencies: Reporting job infrastructure.
- Labels: priority `P2`, area `perf`, type `feature`.
- Risk/Edge cases:
  - Over-indexing harming writes; evaluate carefully.
  - Batching leading to partial outputs; ensure integrity.
- Rollback/Recovery: Revert indexing/batching changes.

**[099] Export scheduling (email reports)**
- Goal / Why: Allow scheduled report delivery.
- Scope: Included—schedule creation, job enqueue, email on completion; Excluded—complex recurrence UI.
- Acceptance Criteria:
  - Users can schedule exports and receive completion notifications.
  - Integration tests validate schedule creation and notification send.
- Test Proof: Integration test output.
- Dependencies: Saved views, CSV export, Notification templates.
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - Duplicate schedules creating duplicate jobs; dedupe.
  - Notification spam; respect preferences.
- Rollback/Recovery: Disable scheduler.

**[100] Stop/Go Checkpoint 10 (tasks 092–099)**
- Goal / Why: Confirm accessibility/i18n/security/reporting enhancements are stable.
- Scope: Included—review tasks 092–099; Excluded—new implementation.
- Acceptance Criteria:
  - Go/hold decision recorded with evidence.
  - Outstanding issues tracked.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 092–099.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Accessibility fixes incomplete.
  - Scheduled exports unverified.
- Rollback/Recovery: Re-run after fixes.

**[101] `/metrics` endpoint with Prometheus format**
- Goal / Why: Expose metrics for API and worker.
- Scope: Included—metrics endpoint with auth/allowlist; Excluded—dashboarding config.
- Acceptance Criteria:
  - Endpoint serves Prometheus-format metrics for key KPIs.
  - Auth or IP allowlist enforced.
- Test Proof: Curl output or integration test.
- Dependencies: Worker health checks.
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Sensitive metrics exposure; ensure protection.
  - Performance impact when scraped.
- Rollback/Recovery: Disable endpoint.

**[102] Alerting rules for SLA breaches/queue lag**
- Goal / Why: Detect critical conditions automatically.
- Scope: Included—alert rules for SLA breaches and queue lag; Excluded—pager escalation policies.
- Acceptance Criteria:
  - Alerts fire in staging under simulated breach/lag.
  - Noise controls documented to avoid alert storms.
- Test Proof: Simulated breach triggering alerts.
- Dependencies: Metrics endpoint.
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Alert fatigue; tune thresholds.
  - Missing auth on alert webhooks.
- Rollback/Recovery: Mute alerts temporarily.

**[103] Disaster recovery drill (DB backup/restore)**
- Goal / Why: Validate backup/restore process.
- Scope: Included—backup creation and staging restore; Excluded—production restore.
- Acceptance Criteria:
  - Backup restored successfully in staging with integrity checks.
  - Runbook updated with learnings.
- Test Proof: Drill log and checklist.
- Dependencies: Infra IaC stub.
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Data exposure during transfer; encrypt backups.
  - Restore downtime; coordinate window.
- Rollback/Recovery: Roll back restore if issues found.

**[104] Environment parity checklist (dev/stage/prod)**
- Goal / Why: Ensure environments aligned.
- Scope: Included—checklist of configs, secrets, feature flags; Excluded—automated enforcement.
- Acceptance Criteria:
  - Checklist approved by stakeholders.
  - Deviations documented with owners.
- Test Proof: Reviewed checklist document.
- Dependencies: Environment validation script.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Hidden differences (e.g., feature flags) missed.
  - Checklist becoming stale; plan review cadence.
- Rollback/Recovery: Update checklist as changes occur.

**[105] Performance budget for ticket list/detail**
- Goal / Why: Maintain UX performance under load.
- Scope: Included—define and test budgets for list/detail; Excluded—global perf metrics.
- Acceptance Criteria:
  - Budgets defined (e.g., TTI/render thresholds) and tests run.
  - Lighthouse or equivalent results recorded meeting targets.
- Test Proof: Lighthouse or perf test output.
- Dependencies: Cursor pagination, Bulk actions.
- Labels: priority `P2`, area `perf`, type `feature`.
- Risk/Edge cases:
  - Budgets too strict causing false failures.
  - Environmental variance affecting results.
- Rollback/Recovery: Adjust budgets with justification.

**[106] Offline-friendly drafts for ticket/comment forms**
- Goal / Why: Prevent data loss on transient connectivity.
- Scope: Included—local draft storage/restoration; Excluded—multi-device sync.
- Acceptance Criteria:
  - Drafts auto-saved locally and restored on reload.
  - Unit/E2E tests cover save/restore and sensitive data redaction.
- Test Proof: Unit and E2E results.
- Dependencies: Attachment picker (to avoid storing blobs), Category selection.
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - Sensitive data stored locally; ensure redaction/expiry.
  - Storage quota limits; handle gracefully.
- Rollback/Recovery: Disable drafts.

**[107] Data retention policies (attachments/comments)**
- Goal / Why: Meet compliance requirements.
- Scope: Included—policy storage and enforcement for retention/deletion; Excluded—legal review.
- Acceptance Criteria:
  - Retention rules configurable per org and applied to attachments/comments.
  - Unit tests validate deletion/retention behavior.
- Test Proof: Unit test output.
- Dependencies: Attachment audit logging.
- Labels: priority `P2`, area `compliance`, type `feature`.
- Risk/Edge cases:
  - Irreversible deletions; include safeguards.
  - Conflicts with legal holds; document exceptions.
- Rollback/Recovery: Disable enforcement while retaining policy docs.

**[108] Session security enhancements (2FA stub, login attempt logging)**
- Goal / Why: Harden authentication.
- Scope: Included—2FA flag storage and login attempt logging; Excluded—full 2FA UX.
- Acceptance Criteria:
  - Login attempts logged with minimal PII.
  - 2FA flag stored and respected in auth flow (stubbed).
- Test Proof: Unit test output.
- Dependencies: Stop/Go Checkpoint 3 (env readiness).
- Labels: priority `P2`, area `security`, type `feature`.
- Risk/Edge cases:
  - Logging sensitive data; ensure redaction.
  - User lockouts if flags misapplied.
- Rollback/Recovery: Disable 2FA flag and logging hook.

**[109] CSAT anti-gaming safeguards**
- Goal / Why: Prevent CSAT manipulation.
- Scope: Included—token binding/expiry checks and anomaly detection stubs; Excluded—advanced ML.
- Acceptance Criteria:
  - Expired or mismatched tokens rejected.
  - Integration tests cover duplicate submissions and expiry.
- Test Proof: Integration test output.
- Dependencies: CSAT submission endpoint.
- Labels: priority `P2`, area `security`, type `feature`.
- Risk/Edge cases:
  - False positives rejecting legitimate feedback.
  - Token storage/rotation errors.
- Rollback/Recovery: Extend expiry or bypass binding with audit note.

**[110] Stop/Go Checkpoint 11 (tasks 101–109)**
- Goal / Why: Validate observability, security, and compliance readiness.
- Scope: Included—review tasks 101–109; Excluded—new implementation.
- Acceptance Criteria:
  - Go/hold decision documented with evidence.
  - Remaining gaps tracked.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 101–109.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Metrics/alerts untested leading to false confidence.
  - Retention policies unverified.
- Rollback/Recovery: Re-run after remediation.

**[111] Data cleanup cron (stale drafts/temp uploads)**
- Goal / Why: Remove stale local data to reduce risk/storage use.
- Scope: Included—cron to delete stale drafts/temp uploads; Excluded—production data archival.
- Acceptance Criteria:
  - Cron removes stale records/files safely without impacting active data.
  - Unit test covers cutoff logic.
- Test Proof: Unit test output.
- Dependencies: Offline drafts.
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Deleting active drafts if cutoff miscalculated.
  - Cron load impacting performance.
- Rollback/Recovery: Disable cron job.

**[112] Feature flag system for gradual rollouts**
- Goal / Why: Control releases safely.
- Scope: Included—flag storage/evaluation; Excluded—UI toggles for non-admins.
- Acceptance Criteria:
  - Flags persisted and evaluated in app/worker contexts.
  - Unit tests validate default-safe behavior.
- Test Proof: Unit test output.
- Dependencies: Notification service interface.
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Misconfigured flags causing outages; enforce defaults.
  - Flag drift between services; document source of truth.
- Rollback/Recovery: Disable flag evaluation layer.

**[113] End-to-end regression suite expansion**
- Goal / Why: Cover new flows across releases.
- Scope: Included—E2E tests for dashboards, notifications, CSAT, exports; Excluded—performance tests.
- Acceptance Criteria:
  - Suite passes covering new features with stable fixtures.
  - Integrated into CI.
- Test Proof: `pnpm test:e2e` output.
- Dependencies: Dashboard widgets, Notification center, Bulk actions, CSAT UI.
- Labels: priority `P2`, area `qa`, type `feature`.
- Risk/Edge cases:
  - Flaky tests due to auth/session timing.
  - Long runtime; consider parallelization.
- Rollback/Recovery: Quarantine flaky specs with issues filed.

**[114] Performance/load test suite for API + worker**
- Goal / Why: Validate performance budgets under load.
- Scope: Included—k6/JMeter style load tests; Excluded—long-running endurance tests.
- Acceptance Criteria:
  - Tests execute against representative data and meet targets.
  - Results recorded with thresholds.
- Test Proof: Load test report.
- Dependencies: Performance budget, Metrics endpoint.
- Labels: priority `P2`, area `perf`, type `feature`.
- Risk/Edge cases:
  - Impacting shared environments; use staging only.
  - Unreliable test data; ensure seeding.
- Rollback/Recovery: Pause load suite.

**[115] Documentation hub update (blueprint, runbooks, FAQs)**
- Goal / Why: Keep docs coherent post-features.
- Scope: Included—update blueprint/runbooks/FAQs; Excluded—external marketing docs.
- Acceptance Criteria:
  - Docs reflect latest architecture and operations.
  - Review completed by stakeholders.
- Test Proof: Documentation review sign-off.
- Dependencies: Regression suite expansion.
- Labels: priority `P2`, area `docs`, type `chore`.
- Risk/Edge cases:
  - Outdated citations; verify links.
  - Sensitive info leakage; scrub secrets.
- Rollback/Recovery: Revert doc changes.

**[116] Release checklist for GA**
- Goal / Why: Ensure readiness for GA release.
- Scope: Included—checklist covering tests, monitoring, rollback, legal; Excluded—marketing launch.
- Acceptance Criteria:
  - Checklist approved with owners for each item.
  - Rollback plan documented.
- Test Proof: Reviewed checklist.
- Dependencies: Stop/Go Checkpoint 11, Documentation hub update.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Missing items leading to release risk.
  - Checklist drift; keep versioned.
- Rollback/Recovery: Update checklist if gaps found.

**[117] Production smoke test script (post-deploy)**
- Goal / Why: Validate production after releases.
- Scope: Included—script covering key flows (login, list, comment, attachment, reports); Excluded—load tests.
- Acceptance Criteria:
  - Script exits green with clear failure output.
  - Safe credentials/config documented.
- Test Proof: Script run output.
- Dependencies: Regression suite expansion.
- Labels: priority `P2`, area `qa`, type `feature`.
- Risk/Edge cases:
  - Script using production data; ensure read-only where possible.
  - Secrets handling; avoid logging.
- Rollback/Recovery: Disable script if causing issues.

**[118] Worker failover plan and chaos test**
- Goal / Why: Validate worker resilience.
- Scope: Included—failover plan and chaos test execution; Excluded—multi-region setup.
- Acceptance Criteria:
  - Chaos test demonstrates successful failover/recovery.
  - Runbook updated with gaps.
- Test Proof: Chaos drill log.
- Dependencies: Worker deployment runbook.
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Data inconsistency during failover; ensure idempotency.
  - Uncontrolled chaos causing outages; scope carefully.
- Rollback/Recovery: Abort drill if instability detected.

**[119] Final risk review against mitigation map**
- Goal / Why: Ensure risks addressed or accepted.
- Scope: Included—review mitigation map and close/accept risks; Excluded—new feature work.
- Acceptance Criteria:
  - All risks marked closed or accepted with owners.
  - Review minutes recorded.
- Test Proof: Risk review document.
- Dependencies: Release checklist.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Hidden risks not surfaced; invite cross-functional review.
  - Accepted risks lacking follow-up; track actions.
- Rollback/Recovery: Reopen review if new risks emerge.

**[120] Stop/Go Checkpoint 12 (tasks 111–119) & P2 Definition of Done**
- Goal / Why: Final milestone gate before GA.
- Scope: Included—review tasks 111–119 and P2 DoD (tests green, monitoring on, runbooks ready); Excluded—new implementation.
- Acceptance Criteria:
  - Sign-off recorded; DoD checklist completed.
  - Blocking items tracked with owners.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 111–119.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Missing stakeholders in sign-off.
  - Monitoring gaps undiscovered; ensure validation.
- Rollback/Recovery: Delay release until resolved.


**[121] Production smoke test script (post-deploy) – duplicate governance check**
- Goal / Why: Reconfirm post-deploy validation aligned to final numbering.
- Scope: Included—smoke script for key flows; Excluded—load/perf tests.
- Acceptance Criteria:
  - Script executes against production safely with clear pass/fail output.
  - Credentials handling documented.
- Test Proof: Smoke script run log.
- Dependencies: Stop/Go Checkpoint 12.
- Labels: priority `P2`, area `qa`, type `feature`.
- Risk/Edge cases:
  - Hitting live data; ensure read-only and backups.
  - Script drift from current features.
- Rollback/Recovery: Disable script if causing issues.

**[122] Worker failover plan and chaos test – final alignment**
- Goal / Why: Validate worker resilience per final numbering.
- Scope: Included—failover plan plus chaos drill; Excluded—multi-region expansion.
- Acceptance Criteria:
  - Chaos drill demonstrates successful failover/recovery with documented gaps.
  - Runbook updated accordingly.
- Test Proof: Chaos drill log.
- Dependencies: Stop/Go Checkpoint 12, Worker deployment runbook.
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - Data duplication during failover; ensure idempotency.
  - Chaos scope too broad causing outages.
- Rollback/Recovery: Abort drill and restore previous state.

**[123] Final risk review against mitigation map – final numbering**
- Goal / Why: Ensure risk closure per final governance set.
- Scope: Included—review mitigation map, confirm closures/acceptance; Excluded—new features.
- Acceptance Criteria:
  - Risks marked closed/accepted with owners.
  - Review notes stored in docs.
- Test Proof: Risk review record.
- Dependencies: Release checklist for GA.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Overlooking late-breaking risks.
  - Accepted risks lacking follow-up tasks.
- Rollback/Recovery: Schedule follow-up review.

**[124] Stop/Go Checkpoint 13 (tasks 112–123 alignment)**
- Goal / Why: Governance gate for tasks 112–123 after numbering reconciliation.
- Scope: Included—checkpoint decision; Excluded—new implementation.
- Acceptance Criteria:
  - Sign-off recorded with outstanding issues tracked.
  - Decision communicated to stakeholders.
- Test Proof: Checkpoint note.
- Dependencies: Tasks 112–123.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Misaligned numbering causing confusion; document mapping.
  - Skipping review due to perceived duplication.
- Rollback/Recovery: Re-run checkpoint with corrected mapping.

**[125] Definition of Done confirmation for P2**
- Goal / Why: Formalize final DoD confirmation.
- Scope: Included—final DoD checklist sign-off; Excluded—new engineering work.
- Acceptance Criteria:
  - DoD checklist signed with monitoring/runbooks verified.
  - Approval recorded in repository docs.
- Test Proof: Signed checklist.
- Dependencies: Stop/Go Checkpoint 12.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Skipping unresolved items.
  - Documentation drift.
- Rollback/Recovery: Reopen DoD if regressions found.

**[126] Stop/Go Checkpoint 13 (final release gate)**
- Goal / Why: Authorize release after all checks.
- Scope: Included—final approval with rollback plan ready; Excluded—post-release monitoring.
- Acceptance Criteria:
  - Final approval recorded with signatories.
  - Rollback plan verified and linked.
- Test Proof: Checkpoint record.
- Dependencies: Definition of Done confirmation for P2.
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - Approval without validating smoke tests.
  - Missing rollback rehearsals.
- Rollback/Recovery: Delay launch until confidence restored.
=======
- **Phase 0:** env validation ready, contract conventions/OpenAPI recreated, auth/policy helpers and sanitizer in place, contract + unit tests passing, checkpoints 1–2 approved.
- **MVP (P0):** attachments with visibility, categories, SLA placeholders, admin SLA CRUD, rate limits, notification stubs, audit hooks, checkpoints 3–5 approved, contract tests gating merges.
- **V1 (P1):** workers running SLA/notification flows, automation rules, dashboards/widgets, audit coverage, checkpoints 6–7 approved, OpenAPI updated for automation features.
- **V2 (P2):** reporting/CSAT and advanced security/perf features, localization groundwork, metrics/alerts, regression and load suites passing, checkpoints 8–11 approved and final release gate cleared.

# How to execute
- **Triage flow:** verify dependencies, clarify acceptance/test proof, size/assign, set labels, update milestone board, implement, capture Test Proof, request review, and keep coverage map in sync.
- **Definition of Ready:** dependencies resolved or planned, environments available, acceptance/test proof agreed, risks/rollback understood, labels assigned.
- **Definition of Done:** acceptance met with passing proofs, docs/tests updated, security/edge cases addressed, rollback documented, milestone board updated, coverage map unchanged or intentionally amended.
# Milestone: Phase 0

**[001] Inventory missing specialist + Agent 5 contract docs and confirm scope**
- Goal / Why: Inventory missing specialist + Agent 5 contract docs and confirm scope
- Scope: Included—Inventory missing specialist + Agent 5 contract docs and confirm scope; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - list of absent inputs + owner
- Test Proof: doc review
- Dependencies: None
- Labels: priority `P0`, area `docs`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: N/A..

**[002] Create env validation script (Node 22, pnpm, Postgres)**
- Goal / Why: Create env validation script (Node 22, pnpm, Postgres)
- Scope: Included—Create env validation script (Node 22, pnpm, Postgres); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - script exits non-zero when unmet
- Test Proof: run script in CI
- Dependencies: [001] Inventory missing specialist + Agent 5 contract docs and confirm scope
- Labels: priority `P0`, area `ops`, type `feature`.
- Risk/Edge cases:
  - avoid leaking secrets
- Rollback/Recovery: delete script..

**[003] Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET)**
- Goal / Why: Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET)
- Scope: Included—Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - lint passes
  - check fails on missing vars
- Test Proof: unit for checker
- Dependencies: [002] Create env validation script (Node 22, pnpm, Postgres)
- Labels: priority `P0`, area `backend`, type `feature`.
- Risk/Edge cases:
  - do not log secrets
- Rollback/Recovery: remove checker..

**[004] Document local dev bootstrap steps in README addendum**
- Goal / Why: Document local dev bootstrap steps in README addendum
- Scope: Included—Document local dev bootstrap steps in README addendum; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - steps reproducible
- Test Proof: run commands
- Dependencies: [002] Create env validation script (Node 22, pnpm, Postgres)
- Labels: priority `P0`, area `docs`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: revert doc..

**[005] Add infra IaC stub (Docker compose for Postgres/Redis/MinIO)**
- Goal / Why: Add infra IaC stub (Docker compose for Postgres/Redis/MinIO)
- Scope: Included—Add infra IaC stub (Docker compose for Postgres/Redis/MinIO); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - `docker compose up` starts services
- Test Proof: smoke connection
- Dependencies: [002] Create env validation script (Node 22, pnpm, Postgres)
- Labels: priority `P0`, area `ops`, type `chore`.
- Risk/Edge cases:
  - default creds scoped to local only
- Rollback/Recovery: remove compose services..

**[006] CI pipeline skeleton (lint, typecheck placeholder)**
- Goal / Why: CI pipeline skeleton (lint, typecheck placeholder)
- Scope: Included—CI pipeline skeleton (lint, typecheck placeholder); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - pipeline runs on PR
- Test Proof: CI log
- Dependencies: [003] Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET)
- Labels: priority `P0`, area `backend`, type `chore`.
- Risk/Edge cases:
  - mask secrets
- Rollback/Recovery: disable workflow..

**[007] Establish coding standards doc (lint/format/commit)**
- Goal / Why: Establish coding standards doc (lint/format/commit)
- Scope: Included—Establish coding standards doc (lint/format/commit); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - doc merged
- Test Proof: review
- Dependencies: [004] Document local dev bootstrap steps in README addendum
- Labels: priority `P0`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: revert doc..

**[008] Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers)**
- Goal / Why: Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers)
- Scope: Included—Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - conventions doc approved
- Test Proof: review
- Dependencies: [007] Establish coding standards doc (lint/format/commit)
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - avoid leaking internal codes
- Rollback/Recovery: supersede doc..

**[009] Define shared error/response schema aligned to conventions**
- Goal / Why: Define shared error/response schema aligned to conventions
- Scope: Included—Define shared error/response schema aligned to conventions; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - schema exported
  - reusable
- Test Proof: unit for serializer
- Dependencies: [008] Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers)
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - avoid detail leakage
- Rollback/Recovery: revert module..

**[010] Recreate OpenAPI baseline in `docs/openapi.yaml` for current routes**
- Goal / Why: Recreate OpenAPI baseline in `docs/openapi.yaml` for current routes
- Scope: Included—Recreate OpenAPI baseline in `docs/openapi.yaml` for current routes; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - spec passes lint
  - reflects current endpoints
- Test Proof: openapi lint
- Dependencies: [008] Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers), [009] Define shared error/response schema aligned to conventions
- Labels: priority `P0`, area `api`, type `chore`.
- Risk/Edge cases:
  - exclude secrets
- Rollback/Recovery: remove spec..

**[011] Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI**
- Goal / Why: Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI
- Scope: Included—Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - harness runs locally
- Test Proof: `pnpm test:contract` (placeholder)
- Dependencies: [010] Recreate OpenAPI baseline in `docs/openapi.yaml` for current routes
- Labels: priority `P0`, area `qa`, type `chore`.
- Risk/Edge cases:
  - redacts tokens
- Rollback/Recovery: disable harness..

**[012] Stop/Go Checkpoint 1 (tasks 001–011)**
- Goal / Why: Stop/Go Checkpoint 1 (tasks 001–011)
- Scope: Included—Stop/Go Checkpoint 1 (tasks 001–011); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off notes
- Test Proof: checklist
- Dependencies: [001] Inventory missing specialist + Agent 5 contract docs and confirm scope, [002] Create env validation script (Node 22, pnpm, Postgres), [003] Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET), [004] Document local dev bootstrap steps in README addendum, [005] Add infra IaC stub (Docker compose for Postgres/Redis/MinIO), [006] CI pipeline skeleton (lint, typecheck placeholder), [007] Establish coding standards doc (lint/format/commit), [008] Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers), [009] Define shared error/response schema aligned to conventions, [010] Recreate OpenAPI baseline in `docs/openapi.yaml` for current routes, [011] Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI
- Labels: priority `P0`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause next tasks..

**[013] Add Markdown sanitization utility**
- Goal / Why: Add Markdown sanitization utility
- Scope: Included—Add Markdown sanitization utility; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sanitizer used in comment render
- Test Proof: unit with XSS strings
- Dependencies: [011] Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - ensure whitelist
- Rollback/Recovery: remove util..

**[014] Introduce shared authorization helper (org/role checks)**
- Goal / Why: Introduce shared authorization helper (org/role checks)
- Scope: Included—Introduce shared authorization helper (org/role checks); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - helper used in one endpoint
- Test Proof: unit matrix
- Dependencies: [011] Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - enforce role gates
- Rollback/Recovery: remove helper..

**[015] Apply org/role helper to ticket GET/POST routes**
- Goal / Why: Apply org/role helper to ticket GET/POST routes
- Scope: Included—Apply org/role helper to ticket GET/POST routes; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - tests pass for requester/agent/admin
- Test Proof: integration
- Dependencies: [014] Introduce shared authorization helper (org/role checks)
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - ensure org scope
- Rollback/Recovery: revert usage..

**[016] Add rate limiting middleware skeleton**
- Goal / Why: Add rate limiting middleware skeleton
- Scope: Included—Add rate limiting middleware skeleton; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - middleware exported, not yet wired
- Test Proof: unit
- Dependencies: [014] Introduce shared authorization helper (org/role checks)
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - denial-of-service protection
- Rollback/Recovery: disable middleware..

**[017] Wire Markdown sanitizer to ticket/comment display**
- Goal / Why: Wire Markdown sanitizer to ticket/comment display
- Scope: Included—Wire Markdown sanitizer to ticket/comment display; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sanitized output observed
- Test Proof: integration snapshot
- Dependencies: [013] Add Markdown sanitization utility
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - XSS blocked
- Rollback/Recovery: remove call..

**[018] Define permission matrix doc (UI vs API)**
- Goal / Why: Define permission matrix doc (UI vs API)
- Scope: Included—Define permission matrix doc (UI vs API); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - matrix published
- Test Proof: review
- Dependencies: [014] Introduce shared authorization helper (org/role checks)
- Labels: priority `P0`, area `docs`, type `chore`.
- Risk/Edge cases:
  - clarifies gating
- Rollback/Recovery: revert doc..

**[019] Add base test harness (Vitest config)**
- Goal / Why: Add base test harness (Vitest config)
- Scope: Included—Add base test harness (Vitest config); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - `pnpm test` runs placeholder
- Test Proof: run command
- Dependencies: [006] CI pipeline skeleton (lint, typecheck placeholder)
- Labels: priority `P0`, area `qa`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: remove config..

**[020] Add initial unit tests for auth helper, sanitizer, and error schema**
- Goal / Why: Add initial unit tests for auth helper, sanitizer, and error schema
- Scope: Included—Add initial unit tests for auth helper, sanitizer, and error schema; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - tests green
- Test Proof: `pnpm test`
- Dependencies: [013] Add Markdown sanitization utility, [014] Introduce shared authorization helper (org/role checks), [019] Add base test harness (Vitest config)
- Labels: priority `P0`, area `qa`, type `chore`.
- Risk/Edge cases:
  - covers edge strings
- Rollback/Recovery: drop tests..

**[021] Add logging baseline (request IDs, user id)**
- Goal / Why: Add logging baseline (request IDs, user id)
- Scope: Included—Add logging baseline (request IDs, user id); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - middleware outputs IDs
- Test Proof: unit for logger
- Dependencies: [014] Introduce shared authorization helper (org/role checks)
- Labels: priority `P0`, area `ops`, type `feature`.
- Risk/Edge cases:
  - avoid PII
- Rollback/Recovery: disable logger..

**[022] Audit internal/public comment visibility in UI and API**
- Goal / Why: Audit internal/public comment visibility in UI and API
- Scope: Included—Audit internal/public comment visibility in UI and API; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - checklist of visibility rules
- Test Proof: manual review
- Dependencies: [018] Define permission matrix doc (UI vs API)
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - ensure hidden to requesters
- Rollback/Recovery: none..

**[023] Wire CI job to block merges on OpenAPI lint + contract tests**
- Goal / Why: Wire CI job to block merges on OpenAPI lint + contract tests
- Scope: Included—Wire CI job to block merges on OpenAPI lint + contract tests; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - failing spec blocks PR
- Test Proof: CI run
- Dependencies: [006] CI pipeline skeleton (lint, typecheck placeholder), [011] Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI
- Labels: priority `P0`, area `qa`, type `chore`.
- Risk/Edge cases:
  - no secrets
- Rollback/Recovery: make job optional..

**[024] Stop/Go Checkpoint 2 (tasks 013–023)**
- Goal / Why: Stop/Go Checkpoint 2 (tasks 013–023)
- Scope: Included—Stop/Go Checkpoint 2 (tasks 013–023); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [013] Add Markdown sanitization utility, [014] Introduce shared authorization helper (org/role checks), [015] Apply org/role helper to ticket GET/POST routes, [016] Add rate limiting middleware skeleton, [017] Wire Markdown sanitizer to ticket/comment display, [018] Define permission matrix doc (UI vs API), [019] Add base test harness (Vitest config), [020] Add initial unit tests for auth helper, sanitizer, and error schema, [021] Add logging baseline (request IDs, user id), [022] Audit internal/public comment visibility in UI and API, [023] Wire CI job to block merges on OpenAPI lint + contract tests
- Labels: priority `P0`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause next tasks..

# Milestone: MVP (P0)

**[025] Migration for attachment visibility/metadata columns**
- Goal / Why: Migration for attachment visibility/metadata columns
- Scope: Included—Migration for attachment visibility/metadata columns; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - migration applied locally
- Test Proof: prisma migrate
- Dependencies: [005] Add infra IaC stub (Docker compose for Postgres/Redis/MinIO), [015] Apply org/role helper to ticket GET/POST routes
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - nullable defaults
- Rollback/Recovery: prisma migrate reset..

**[026] Backfill seed to include attachment sample rows**
- Goal / Why: Backfill seed to include attachment sample rows
- Scope: Included—Backfill seed to include attachment sample rows; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - seed succeeds
- Test Proof: pnpm prisma:seed
- Dependencies: [025] Migration for attachment visibility/metadata columns
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - sample uses safe files
- Rollback/Recovery: revert seed..

**[027] Implement attachment upload API with presigned URL generation**
- Goal / Why: Implement attachment upload API with presigned URL generation
- Scope: Included—Implement attachment upload API with presigned URL generation; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - returns URL + metadata entry
- Test Proof: integration
- Dependencies: [025] Migration for attachment visibility/metadata columns
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - size/type enforced
- Rollback/Recovery: disable route..

**[028] Add AV scanning hook (stub) post-upload**
- Goal / Why: Add AV scanning hook (stub) post-upload
- Scope: Included—Add AV scanning hook (stub) post-upload; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - AV status recorded
- Test Proof: unit with mock
- Dependencies: [027] Implement attachment upload API with presigned URL generation
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - quarantine flag
- Rollback/Recovery: bypass AV flag..

**[029] UI attachment picker with progress + public/internal toggle**
- Goal / Why: UI attachment picker with progress + public/internal toggle
- Scope: Included—UI attachment picker with progress + public/internal toggle; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - file uploaded
  - linked to ticket
- Test Proof: manual + E2E
- Dependencies: [027] Implement attachment upload API with presigned URL generation
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - respects visibility
- Rollback/Recovery: hide UI..

**[030] Apply rate limiting middleware to comment/ticket/attachment POST routes**
- Goal / Why: Apply rate limiting middleware to comment/ticket/attachment POST routes
- Scope: Included—Apply rate limiting middleware to comment/ticket/attachment POST routes; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - exceeds threshold returns 429
- Test Proof: integration
- Dependencies: [016] Add rate limiting middleware skeleton, [027] Implement attachment upload API with presigned URL generation
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - prevents spam
- Rollback/Recovery: disable middleware..

**[031] Add category taxonomy table + seeds**
- Goal / Why: Add category taxonomy table + seeds
- Scope: Included—Add category taxonomy table + seeds; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - migration adds categories, seed populates defaults
- Test Proof: prisma migrate/seed
- Dependencies: [025] Migration for attachment visibility/metadata columns
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: revert migration..

**[032] Extend ticket form to select category from taxonomy**
- Goal / Why: Extend ticket form to select category from taxonomy
- Scope: Included—Extend ticket form to select category from taxonomy; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - category id stored
- Test Proof: E2E
- Dependencies: [031] Add category taxonomy table + seeds
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - validate org-scoped categories
- Rollback/Recovery: hide field..

**[033] Add SLA pause/resume fields and logic placeholders**
- Goal / Why: Add SLA pause/resume fields and logic placeholders
- Scope: Included—Add SLA pause/resume fields and logic placeholders; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - fields saved
  - no logic yet
- Test Proof: migrate
- Dependencies: [025] Migration for attachment visibility/metadata columns
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: remove fields..

**[034] Notification preference schema (email/in-app toggles)**
- Goal / Why: Notification preference schema (email/in-app toggles)
- Scope: Included—Notification preference schema (email/in-app toggles); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - migration adds preferences
- Test Proof: migrate
- Dependencies: [025] Migration for attachment visibility/metadata columns
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - defaults safe
- Rollback/Recovery: drop table..

**[035] Implement basic notification service interface**
- Goal / Why: Implement basic notification service interface
- Scope: Included—Implement basic notification service interface; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - service stub with send method
- Test Proof: unit
- Dependencies: [034] Notification preference schema (email/in-app toggles)
- Labels: priority `P0`, area `backend`, type `feature`.
- Risk/Edge cases:
  - redact secrets
- Rollback/Recovery: remove service..

**[036] Stop/Go Checkpoint 3 (tasks 025–035)**
- Goal / Why: Stop/Go Checkpoint 3 (tasks 025–035)
- Scope: Included—Stop/Go Checkpoint 3 (tasks 025–035); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [025] Migration for attachment visibility/metadata columns, [026] Backfill seed to include attachment sample rows, [027] Implement attachment upload API with presigned URL generation, [028] Add AV scanning hook (stub) post-upload, [029] UI attachment picker with progress + public/internal toggle, [030] Apply rate limiting middleware to comment/ticket/attachment POST routes, [031] Add category taxonomy table + seeds, [032] Extend ticket form to select category from taxonomy, [033] Add SLA pause/resume fields and logic placeholders, [034] Notification preference schema (email/in-app toggles), [035] Implement basic notification service interface
- Labels: priority `P0`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause..

**[037] Comment spam guard (cooldown per user)**
- Goal / Why: Comment spam guard (cooldown per user)
- Scope: Included—Comment spam guard (cooldown per user); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - repeated posts blocked within window
- Test Proof: integration
- Dependencies: [030] Apply rate limiting middleware to comment/ticket/attachment POST routes
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - avoid DoS
- Rollback/Recovery: disable guard..

**[038] Sanitize Markdown on API ingest (tickets/comments)**
- Goal / Why: Sanitize Markdown on API ingest (tickets/comments)
- Scope: Included—Sanitize Markdown on API ingest (tickets/comments); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - stored content sanitized
- Test Proof: unit/integration
- Dependencies: [013] Add Markdown sanitization utility
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - XSS prevention
- Rollback/Recovery: remove sanitization..

**[039] Add SLA policy admin CRUD API (priority/category overrides)**
- Goal / Why: Add SLA policy admin CRUD API (priority/category overrides)
- Scope: Included—Add SLA policy admin CRUD API (priority/category overrides); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - create/update/delete works with org scope
- Test Proof: integration
- Dependencies: [031] Add category taxonomy table + seeds, [033] Add SLA pause/resume fields and logic placeholders
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - role=ADMIN enforced
- Rollback/Recovery: disable routes..

**[040] Admin UI for SLA policies with validation**
- Goal / Why: Admin UI for SLA policies with validation
- Scope: Included—Admin UI for SLA policies with validation; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - admin can CRUD policy
- Test Proof: E2E
- Dependencies: [039] Add SLA policy admin CRUD API (priority/category overrides)
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - admin-only guard
- Rollback/Recovery: hide menu..

**[041] Ticket creation shows SLA preview (due times)**
- Goal / Why: Ticket creation shows SLA preview (due times)
- Scope: Included—Ticket creation shows SLA preview (due times); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - preview matches policy
- Test Proof: unit for calc
- Dependencies: [033] Add SLA pause/resume fields and logic placeholders, [039] Add SLA policy admin CRUD API (priority/category overrides)
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: hide preview..

**[042] Add ticket list SLA breach indicators**
- Goal / Why: Add ticket list SLA breach indicators
- Scope: Included—Add ticket list SLA breach indicators; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - overdue badge shows when past due
- Test Proof: integration
- Dependencies: [033] Add SLA pause/resume fields and logic placeholders
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: hide badge..

**[043] Shared policy module used in TicketActions (status transitions)**
- Goal / Why: Shared policy module used in TicketActions (status transitions)
- Scope: Included—Shared policy module used in TicketActions (status transitions); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - transitions enforced per role map
- Test Proof: unit/integration
- Dependencies: [018] Define permission matrix doc (UI vs API)
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - prevents invalid statuses
- Rollback/Recovery: revert module usage..

**[044] Apply org/role helper to comments API**
- Goal / Why: Apply org/role helper to comments API
- Scope: Included—Apply org/role helper to comments API; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - org mismatch rejected
- Test Proof: integration
- Dependencies: [014] Introduce shared authorization helper (org/role checks)
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - tenant isolation
- Rollback/Recovery: revert helper..

**[045] Add ticket search index on title/description/category**
- Goal / Why: Add ticket search index on title/description/category
- Scope: Included—Add ticket search index on title/description/category; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - index created
- Test Proof: migration
- Dependencies: [025] Migration for attachment visibility/metadata columns
- Labels: priority `P0`, area `data`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: drop index..

**[046] Improve ticket list pagination with cursor**
- Goal / Why: Improve ticket list pagination with cursor
- Scope: Included—Improve ticket list pagination with cursor; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - paginated responses
- Test Proof: integration
- Dependencies: [045] Add ticket search index on title/description/category
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - validate inputs
- Rollback/Recovery: revert to offset..

**[047] Add audit logging for attachment uploads/deletes**
- Goal / Why: Add audit logging for attachment uploads/deletes
- Scope: Included—Add audit logging for attachment uploads/deletes; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - audit row created
- Test Proof: unit
- Dependencies: [027] Implement attachment upload API with presigned URL generation
- Labels: priority `P0`, area `backend`, type `feature`.
- Risk/Edge cases:
  - includes actor info
- Rollback/Recovery: disable audit hook..

**[048] Stop/Go Checkpoint 4 (tasks 037–047)**
- Goal / Why: Stop/Go Checkpoint 4 (tasks 037–047)
- Scope: Included—Stop/Go Checkpoint 4 (tasks 037–047); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [037] Comment spam guard (cooldown per user), [038] Sanitize Markdown on API ingest (tickets/comments), [039] Add SLA policy admin CRUD API (priority/category overrides), [040] Admin UI for SLA policies with validation, [041] Ticket creation shows SLA preview (due times), [042] Add ticket list SLA breach indicators, [043] Shared policy module used in TicketActions (status transitions), [044] Apply org/role helper to comments API, [045] Add ticket search index on title/description/category, [046] Improve ticket list pagination with cursor, [047] Add audit logging for attachment uploads/deletes
- Labels: priority `P0`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause..

**[049] Enforce attachment visibility on ticket detail UI/API**
- Goal / Why: Enforce attachment visibility on ticket detail UI/API
- Scope: Included—Enforce attachment visibility on ticket detail UI/API; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - requesters cannot see internal files
- Test Proof: integration/E2E
- Dependencies: [029] UI attachment picker with progress + public/internal toggle, [027] Implement attachment upload API with presigned URL generation
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - access control
- Rollback/Recovery: hide files..

**[050] Add team membership management API**
- Goal / Why: Add team membership management API
- Scope: Included—Add team membership management API; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - add/remove users from teams
- Test Proof: integration
- Dependencies: [031] Add category taxonomy table + seeds
- Labels: priority `P0`, area `backend`, type `feature`.
- Risk/Edge cases:
  - admin-only
- Rollback/Recovery: disable endpoints..

**[051] Admin UI for users/teams CRUD**
- Goal / Why: Admin UI for users/teams CRUD
- Scope: Included—Admin UI for users/teams CRUD; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - create/update/delete works
- Test Proof: E2E
- Dependencies: [050] Add team membership management API
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - guard by role
- Rollback/Recovery: hide nav..

**[052] Enforce file size/type limits server-side**
- Goal / Why: Enforce file size/type limits server-side
- Scope: Included—Enforce file size/type limits server-side; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - rejects oversized/disallowed types
- Test Proof: integration
- Dependencies: [027] Implement attachment upload API with presigned URL generation
- Labels: priority `P0`, area `security`, type `feature`.
- Risk/Edge cases:
  - prevents abuse
- Rollback/Recovery: relax limits..

**[053] Add checksum verification for uploads**
- Goal / Why: Add checksum verification for uploads
- Scope: Included—Add checksum verification for uploads; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - checksum stored
  - validated
- Test Proof: unit
- Dependencies: [052] Enforce file size/type limits server-side
- Labels: priority `P0`, area `backend`, type `feature`.
- Risk/Edge cases:
  - tamper detection
- Rollback/Recovery: bypass check..

**[054] Apply org/role helper to admin routes**
- Goal / Why: Apply org/role helper to admin routes
- Scope: Included—Apply org/role helper to admin routes; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - all admin endpoints enforce org scope
- Test Proof: integration
- Dependencies: [014] Introduce shared authorization helper (org/role checks)
- Labels: priority `P0`, area `api`, type `feature`.
- Risk/Edge cases:
  - tenant isolation
- Rollback/Recovery: revert helper usage..

**[055] Notification rate limiting/dedup service**
- Goal / Why: Notification rate limiting/dedup service
- Scope: Included—Notification rate limiting/dedup service; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - duplicate alerts suppressed
- Test Proof: unit
- Dependencies: [035] Implement basic notification service interface
- Labels: priority `P0`, area `backend`, type `feature`.
- Risk/Edge cases:
  - prevents spam
- Rollback/Recovery: bypass dedup..

**[056] Notification templates (localizable)**
- Goal / Why: Notification templates (localizable)
- Scope: Included—Notification templates (localizable); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - templates stored
  - rendered
- Test Proof: unit snapshot
- Dependencies: [035] Implement basic notification service interface
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - sanitize variables
- Rollback/Recovery: revert templates..

**[057] Add @mentions parsing to comments**
- Goal / Why: Add @mentions parsing to comments
- Scope: Included—Add @mentions parsing to comments; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - mentions stored
  - used to notify
- Test Proof: unit/integration
- Dependencies: [038] Sanitize Markdown on API ingest (tickets/comments)
- Labels: priority `P0`, area `backend`, type `feature`.
- Risk/Edge cases:
  - validate user existence
- Rollback/Recovery: disable mentions..

**[058] Add Kanban board view for tickets**
- Goal / Why: Add Kanban board view for tickets
- Scope: Included—Add Kanban board view for tickets; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - drag/drop updates status respecting policy
- Test Proof: E2E
- Dependencies: [046] Improve ticket list pagination with cursor
- Labels: priority `P0`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - role checks
- Rollback/Recovery: disable board..

**[059] Admin governance for tags/categories cleanup (merge/archive)**
- Goal / Why: Admin governance for tags/categories cleanup (merge/archive)
- Scope: Included—Admin governance for tags/categories cleanup (merge/archive); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - archive/merge works
- Test Proof: integration
- Dependencies: [031] Add category taxonomy table + seeds
- Labels: priority `P0`, area `backend`, type `feature`.
- Risk/Edge cases:
  - admin-only
- Rollback/Recovery: revert changes..

**[060] Contract tests UI vs API permissions**
- Goal / Why: Contract tests UI vs API permissions
- Scope: Included—Contract tests UI vs API permissions; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - matrix tests green
- Test Proof: automated contract suite
- Dependencies: [018] Define permission matrix doc (UI vs API), [043] Shared policy module used in TicketActions (status transitions)
- Labels: priority `P0`, area `qa`, type `chore`.
- Risk/Edge cases:
  - ensures consistency
- Rollback/Recovery: disable suite..

**[061] Stop/Go Checkpoint 5 (tasks 049–060)**
- Goal / Why: Stop/Go Checkpoint 5 (tasks 049–060)
- Scope: Included—Stop/Go Checkpoint 5 (tasks 049–060); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [049] Enforce attachment visibility on ticket detail UI/API, [050] Add team membership management API, [051] Admin UI for users/teams CRUD, [052] Enforce file size/type limits server-side, [053] Add checksum verification for uploads, [054] Apply org/role helper to admin routes, [055] Notification rate limiting/dedup service, [056] Notification templates (localizable), [057] Add @mentions parsing to comments, [058] Add Kanban board view for tickets, [059] Admin governance for tags/categories cleanup (merge/archive), [060] Contract tests UI vs API permissions
- Labels: priority `P0`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause..

# Milestone: V1 (P1)

**[062] Audit coverage for admin CRUD (users/teams/tags/SLA)**
- Goal / Why: Audit coverage for admin CRUD (users/teams/tags/SLA)
- Scope: Included—Audit coverage for admin CRUD (users/teams/tags/SLA); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - audit rows created
- Test Proof: integration
- Dependencies: [051] Admin UI for users/teams CRUD, [039] Add SLA policy admin CRUD API (priority/category overrides)
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - immutable logs
- Rollback/Recovery: disable hook..

**[063] Audit viewer UI for admins**
- Goal / Why: Audit viewer UI for admins
- Scope: Included—Audit viewer UI for admins; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - paginated audit list filterable by actor/date/action
- Test Proof: E2E
- Dependencies: [062] Audit coverage for admin CRUD (users/teams/tags/SLA)
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - admin-only
- Rollback/Recovery: hide page..

**[064] Add assignment auto-suggest (load-based) in TicketActions**
- Goal / Why: Add assignment auto-suggest (load-based) in TicketActions
- Scope: Included—Add assignment auto-suggest (load-based) in TicketActions; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - suggestion displayed
- Test Proof: unit
- Dependencies: [046] Improve ticket list pagination with cursor
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - avoid revealing other org data
- Rollback/Recovery: disable suggest..

**[065] Enhance search with tag/category filters**
- Goal / Why: Enhance search with tag/category filters
- Scope: Included—Enhance search with tag/category filters; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - filters applied
- Test Proof: integration
- Dependencies: [031] Add category taxonomy table + seeds, [059] Admin governance for tags/categories cleanup (merge/archive)
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - org scope
- Rollback/Recovery: remove filters..

**[066] Add reopen reason capture form**
- Goal / Why: Add reopen reason capture form
- Scope: Included—Add reopen reason capture form; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - reason saved on reopen
- Test Proof: integration
- Dependencies: [043] Shared policy module used in TicketActions (status transitions)
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - validate length
- Rollback/Recovery: optional field..

**[067] Reopen throttling (cooldown)**
- Goal / Why: Reopen throttling (cooldown)
- Scope: Included—Reopen throttling (cooldown); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - repeated reopen blocked
- Test Proof: integration
- Dependencies: [066] Add reopen reason capture form
- Labels: priority `P1`, area `api`, type `feature`.
- Risk/Edge cases:
  - prevent abuse
- Rollback/Recovery: disable throttle..

**[068] Attachment download logging**
- Goal / Why: Attachment download logging
- Scope: Included—Attachment download logging; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - audit on download
- Test Proof: unit
- Dependencies: [049] Enforce attachment visibility on ticket detail UI/API
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - includes actor
- Rollback/Recovery: disable logging..

**[069] Set up Redis/BullMQ worker service**
- Goal / Why: Set up Redis/BullMQ worker service
- Scope: Included—Set up Redis/BullMQ worker service; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - worker connects
  - processes dummy job
- Test Proof: integration
- Dependencies: [005] Add infra IaC stub (Docker compose for Postgres/Redis/MinIO), [035] Implement basic notification service interface
- Labels: priority `P1`, area `ops`, type `feature`.
- Risk/Edge cases:
  - restrict network
- Rollback/Recovery: disable worker..

**[070] Queue job schema for SLA timers (first response/resolve)**
- Goal / Why: Queue job schema for SLA timers (first response/resolve)
- Scope: Included—Queue job schema for SLA timers (first response/resolve); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - job payload defined
- Test Proof: unit
- Dependencies: [033] Add SLA pause/resume fields and logic placeholders, [069] Set up Redis/BullMQ worker service
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - validate org id
- Rollback/Recovery: remove job type..

**[071] Schedule SLA jobs on ticket creation/update**
- Goal / Why: Schedule SLA jobs on ticket creation/update
- Scope: Included—Schedule SLA jobs on ticket creation/update; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - jobs enqueued with due timestamps
- Test Proof: integration
- Dependencies: [070] Queue job schema for SLA timers (first response/resolve), [033] Add SLA pause/resume fields and logic placeholders
- Labels: priority `P1`, area `api`, type `feature`.
- Risk/Edge cases:
  - org scoping
- Rollback/Recovery: stop enqueue..

**[072] Worker processes SLA breach -> audit + notifications**
- Goal / Why: Worker processes SLA breach -> audit + notifications
- Scope: Included—Worker processes SLA breach -> audit + notifications; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - breach sets flag
  - sends notification
- Test Proof: integration
- Dependencies: [071] Schedule SLA jobs on ticket creation/update
- Labels: priority `P1`, area `api`, type `feature`.
- Risk/Edge cases:
  - avoid duplicate send
- Rollback/Recovery: mark job failed..

**[073] Add SLA pause/resume handling in worker (waiting on requester)**
- Goal / Why: Add SLA pause/resume handling in worker (waiting on requester)
- Scope: Included—Add SLA pause/resume handling in worker (waiting on requester); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - clock stops/starts on status change
- Test Proof: unit/integration
- Dependencies: [067] Reopen throttling (cooldown), [072] Worker processes SLA breach -> audit + notifications
- Labels: priority `P1`, area `api`, type `feature`.
- Risk/Edge cases:
  - validate transitions
- Rollback/Recovery: disable pause logic..

**[074] Stop/Go Checkpoint 6 (tasks 062–073)**
- Goal / Why: Stop/Go Checkpoint 6 (tasks 062–073)
- Scope: Included—Stop/Go Checkpoint 6 (tasks 062–073); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [062] Audit coverage for admin CRUD (users/teams/tags/SLA), [063] Audit viewer UI for admins, [064] Add assignment auto-suggest (load-based) in TicketActions, [065] Enhance search with tag/category filters, [066] Add reopen reason capture form, [067] Reopen throttling (cooldown), [068] Attachment download logging, [069] Set up Redis/BullMQ worker service, [070] Queue job schema for SLA timers (first response/resolve), [071] Schedule SLA jobs on ticket creation/update, [072] Worker processes SLA breach -> audit + notifications, [073] Add SLA pause/resume handling in worker (waiting on requester)
- Labels: priority `P1`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause..

**[075] Implement notification channels (email adapter stub + in-app feed)**
- Goal / Why: Implement notification channels (email adapter stub + in-app feed)
- Scope: Included—Implement notification channels (email adapter stub + in-app feed); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - message stored + email logged
- Test Proof: unit/integration
- Dependencies: [035] Implement basic notification service interface
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - secret handling
- Rollback/Recovery: disable email..

**[076] Health checks for worker queues (lag, failures)**
- Goal / Why: Health checks for worker queues (lag, failures)
- Scope: Included—Health checks for worker queues (lag, failures); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - endpoint exposes metrics
- Test Proof: integration
- Dependencies: [069] Set up Redis/BullMQ worker service
- Labels: priority `P1`, area `ops`, type `feature`.
- Risk/Edge cases:
  - protect endpoint
- Rollback/Recovery: disable metrics..

**[077] Dashboard SLA widgets (open tickets by breach state)**
- Goal / Why: Dashboard SLA widgets (open tickets by breach state)
- Scope: Included—Dashboard SLA widgets (open tickets by breach state); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - widget renders counts
- Test Proof: integration
- Dependencies: [042] Add ticket list SLA breach indicators, [072] Worker processes SLA breach -> audit + notifications
- Labels: priority `P1`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: hide widget..

**[078] Add automation rule engine (trigger/action config)**
- Goal / Why: Add automation rule engine (trigger/action config)
- Scope: Included—Add automation rule engine (trigger/action config); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - rules persisted
  - executed on events
- Test Proof: unit
- Dependencies: [035] Implement basic notification service interface, [039] Add SLA policy admin CRUD API (priority/category overrides)
- Labels: priority `P1`, area `api`, type `feature`.
- Risk/Edge cases:
  - validate actions
- Rollback/Recovery: disable rules..

**[079] Retry/backoff strategy for failed jobs with DLQ**
- Goal / Why: Retry/backoff strategy for failed jobs with DLQ
- Scope: Included—Retry/backoff strategy for failed jobs with DLQ; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - retries configured, DLQ table/log
- Test Proof: unit
- Dependencies: [069] Set up Redis/BullMQ worker service
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - avoid infinite loops
- Rollback/Recovery: disable retries..

**[080] Worker deployment runbook (restart, drain, rollback)**
- Goal / Why: Worker deployment runbook (restart, drain, rollback)
- Scope: Included—Worker deployment runbook (restart, drain, rollback); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - runbook published
- Test Proof: tabletop
- Dependencies: [076] Health checks for worker queues (lag, failures)
- Labels: priority `P1`, area `ops`, type `feature`.
- Risk/Edge cases:
  - access control noted
- Rollback/Recovery: revise runbook..

**[081] SLA reminder notifications before breach**
- Goal / Why: SLA reminder notifications before breach
- Scope: Included—SLA reminder notifications before breach; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - reminder sent at threshold
- Test Proof: integration
- Dependencies: [072] Worker processes SLA breach -> audit + notifications
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - dedup
- Rollback/Recovery: disable reminder flag..

**[082] Add CSAT request trigger on resolution/closure**
- Goal / Why: Add CSAT request trigger on resolution/closure
- Scope: Included—Add CSAT request trigger on resolution/closure; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - CSAT notification dispatched once
- Test Proof: integration
- Dependencies: [073] Add SLA pause/resume handling in worker (waiting on requester)
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - one-per-ticket
- Rollback/Recovery: disable trigger..

**[083] Notification preference enforcement in sender**
- Goal / Why: Notification preference enforcement in sender
- Scope: Included—Notification preference enforcement in sender; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - respects toggles
- Test Proof: unit
- Dependencies: [034] Notification preference schema (email/in-app toggles), [075] Implement notification channels (email adapter stub + in-app feed)
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - defaults safe
- Rollback/Recovery: bypass enforcement..

**[084] SLA escalation logic (team escalation path)**
- Goal / Why: SLA escalation logic (team escalation path)
- Scope: Included—SLA escalation logic (team escalation path); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - escalation triggers reassignment/audit
- Test Proof: integration
- Dependencies: [078] Add automation rule engine (trigger/action config), [072] Worker processes SLA breach -> audit + notifications
- Labels: priority `P1`, area `backend`, type `feature`.
- Risk/Edge cases:
  - role checks
- Rollback/Recovery: disable escalation..

**[085] Update OpenAPI to include new worker-driven events and notification contracts**
- Goal / Why: Update OpenAPI to include new worker-driven events and notification contracts
- Scope: Included—Update OpenAPI to include new worker-driven events and notification contracts; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - spec updated, lint green
- Test Proof: openapi lint
- Dependencies: [075] Implement notification channels (email adapter stub + in-app feed), [076] Health checks for worker queues (lag, failures), [077] Dashboard SLA widgets (open tickets by breach state), [078] Add automation rule engine (trigger/action config), [079] Retry/backoff strategy for failed jobs with DLQ, [080] Worker deployment runbook (restart, drain, rollback), [081] SLA reminder notifications before breach, [082] Add CSAT request trigger on resolution/closure, [083] Notification preference enforcement in sender, [084] SLA escalation logic (team escalation path)
- Labels: priority `P1`, area `api`, type `feature`.
- Risk/Edge cases:
  - exclude secrets
- Rollback/Recovery: revert spec change..

**[086] Stop/Go Checkpoint 7 (tasks 075–085)**
- Goal / Why: Stop/Go Checkpoint 7 (tasks 075–085)
- Scope: Included—Stop/Go Checkpoint 7 (tasks 075–085); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [075] Implement notification channels (email adapter stub + in-app feed), [076] Health checks for worker queues (lag, failures), [077] Dashboard SLA widgets (open tickets by breach state), [078] Add automation rule engine (trigger/action config), [079] Retry/backoff strategy for failed jobs with DLQ, [080] Worker deployment runbook (restart, drain, rollback), [081] SLA reminder notifications before breach, [082] Add CSAT request trigger on resolution/closure, [083] Notification preference enforcement in sender, [084] SLA escalation logic (team escalation path), [085] Update OpenAPI to include new worker-driven events and notification contracts
- Labels: priority `P1`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause..

# Milestone: V2 (P2)

**[087] In-app notification center UI**
- Goal / Why: In-app notification center UI
- Scope: Included—In-app notification center UI; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - list with read/unread, filters
- Test Proof: E2E
- Dependencies: [075] Implement notification channels (email adapter stub + in-app feed), [083] Notification preference enforcement in sender
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - user scoped
- Rollback/Recovery: hide UI..

**[088] Bulk actions on ticket list (assign, status change)**
- Goal / Why: Bulk actions on ticket list (assign, status change)
- Scope: Included—Bulk actions on ticket list (assign, status change); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - bulk operation executes with audit
- Test Proof: integration
- Dependencies: [043] Shared policy module used in TicketActions (status transitions)
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - permission check per item
- Rollback/Recovery: disable bulk..

**[089] Saved views for ticket filters (personal/team)**
- Goal / Why: Saved views for ticket filters (personal/team)
- Scope: Included—Saved views for ticket filters (personal/team); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - save/load works
- Test Proof: integration
- Dependencies: [046] Improve ticket list pagination with cursor
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - org scoping
- Rollback/Recovery: disable feature..

**[090] Reporting job table and async export endpoints**
- Goal / Why: Reporting job table and async export endpoints
- Scope: Included—Reporting job table and async export endpoints; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - report request returns job id
- Test Proof: integration
- Dependencies: [069] Set up Redis/BullMQ worker service
- Labels: priority `P2`, area `api`, type `feature`.
- Risk/Edge cases:
  - org scope
- Rollback/Recovery: disable endpoint..

**[091] Dashboard KPI cards (MTTR, MTTA, reopen rate)**
- Goal / Why: Dashboard KPI cards (MTTR, MTTA, reopen rate)
- Scope: Included—Dashboard KPI cards (MTTR, MTTA, reopen rate); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - metrics calculated accurately
- Test Proof: unit
- Dependencies: [090] Reporting job table and async export endpoints
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: hide cards..

**[092] Export to CSV for tickets and comments**
- Goal / Why: Export to CSV for tickets and comments
- Scope: Included—Export to CSV for tickets and comments; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - downloadable file generated asynchronously
- Test Proof: integration
- Dependencies: [090] Reporting job table and async export endpoints
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - scrub internal-only fields for requesters
- Rollback/Recovery: disable export..

**[093] Internal vs public attachment download URLs (signed, time-bound)**
- Goal / Why: Internal vs public attachment download URLs (signed, time-bound)
- Scope: Included—Internal vs public attachment download URLs (signed, time-bound); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - generates scoped URLs
- Test Proof: integration
- Dependencies: [049] Enforce attachment visibility on ticket detail UI/API, [052] Enforce file size/type limits server-side
- Labels: priority `P2`, area `security`, type `feature`.
- Risk/Edge cases:
  - expiry + scope
- Rollback/Recovery: revert to server proxy..

**[094] CSAT submission endpoint and schema**
- Goal / Why: CSAT submission endpoint and schema
- Scope: Included—CSAT submission endpoint and schema; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - one response per ticket, signed token verified
- Test Proof: integration
- Dependencies: [082] Add CSAT request trigger on resolution/closure
- Labels: priority `P2`, area `api`, type `feature`.
- Risk/Edge cases:
  - token validation
- Rollback/Recovery: disable endpoint..

**[095] CSAT UI for requester (email link/page)**
- Goal / Why: CSAT UI for requester (email link/page)
- Scope: Included—CSAT UI for requester (email link/page); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - form submits score/comment
- Test Proof: E2E
- Dependencies: [094] CSAT submission endpoint and schema
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - token required
- Rollback/Recovery: disable page..

**[096] SLA calibration tool (what-if simulator)**
- Goal / Why: SLA calibration tool (what-if simulator)
- Scope: Included—SLA calibration tool (what-if simulator); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - simulator returns projected breaches
- Test Proof: unit
- Dependencies: [072] Worker processes SLA breach -> audit + notifications
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: remove tool..

**[097] Knowledge base link injection based on category**
- Goal / Why: Knowledge base link injection based on category
- Scope: Included—Knowledge base link injection based on category; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - suggestions shown in form
- Test Proof: unit
- Dependencies: [032] Extend ticket form to select category from taxonomy
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - safe content
- Rollback/Recovery: hide suggestions..

**[098] Contract tests for reporting/exports and CSAT against OpenAPI**
- Goal / Why: Contract tests for reporting/exports and CSAT against OpenAPI
- Scope: Included—Contract tests for reporting/exports and CSAT against OpenAPI; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - suite passes
- Test Proof: contract suite
- Dependencies: [085] Update OpenAPI to include new worker-driven events and notification contracts, [090] Reporting job table and async export endpoints, [094] CSAT submission endpoint and schema
- Labels: priority `P2`, area `qa`, type `chore`.
- Risk/Edge cases:
  - sanitize fixtures
- Rollback/Recovery: disable suite..

**[099] Stop/Go Checkpoint 8 (tasks 087–098)**
- Goal / Why: Stop/Go Checkpoint 8 (tasks 087–098)
- Scope: Included—Stop/Go Checkpoint 8 (tasks 087–098); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [087] In-app notification center UI, [088] Bulk actions on ticket list (assign, status change), [089] Saved views for ticket filters (personal/team), [090] Reporting job table and async export endpoints, [091] Dashboard KPI cards (MTTR, MTTA, reopen rate), [092] Export to CSV for tickets and comments, [093] Internal vs public attachment download URLs (signed, time-bound), [094] CSAT submission endpoint and schema, [095] CSAT UI for requester (email link/page), [096] SLA calibration tool (what-if simulator), [097] Knowledge base link injection based on category, [098] Contract tests for reporting/exports and CSAT against OpenAPI
- Labels: priority `P2`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause..

**[100] Accessibility audit and fixes (axe)**
- Goal / Why: Accessibility audit and fixes (axe)
- Scope: Included—Accessibility audit and fixes (axe); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - axe report zero critical issues
- Test Proof: automated axe
- Dependencies: [029] UI attachment picker with progress + public/internal toggle, [087] In-app notification center UI
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: log issues..

**[101] Localization framework (i18n keys) groundwork**
- Goal / Why: Localization framework (i18n keys) groundwork
- Scope: Included—Localization framework (i18n keys) groundwork; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - keys extracted for major screens
- Test Proof: unit
- Dependencies: [056] Notification templates (localizable)
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: keep Polish strings..

**[102] Captcha fallback for suspicious comment/ticket submissions**
- Goal / Why: Captcha fallback for suspicious comment/ticket submissions
- Scope: Included—Captcha fallback for suspicious comment/ticket submissions; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - captcha triggered after threshold
- Test Proof: integration
- Dependencies: [037] Comment spam guard (cooldown per user)
- Labels: priority `P2`, area `security`, type `feature`.
- Risk/Edge cases:
  - protect keys
- Rollback/Recovery: disable captcha..

**[103] Reopen approvals for high-priority tickets (agent/admin)**
- Goal / Why: Reopen approvals for high-priority tickets (agent/admin)
- Scope: Included—Reopen approvals for high-priority tickets (agent/admin); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - approval required for WYSOKI/KRYTYCZNY
- Test Proof: integration
- Dependencies: [067] Reopen throttling (cooldown)
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - role checks
- Rollback/Recovery: bypass approvals..

**[104] Report job performance optimizations (indexes, batching)**
- Goal / Why: Report job performance optimizations (indexes, batching)
- Scope: Included—Report job performance optimizations (indexes, batching); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - job completes within SLA
- Test Proof: load test
- Dependencies: [090] Reporting job table and async export endpoints
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: revert index..

**[105] Export scheduling (email reports)**
- Goal / Why: Export scheduling (email reports)
- Scope: Included—Export scheduling (email reports); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - schedule creates jobs, emails on completion
- Test Proof: integration
- Dependencies: [089] Saved views for ticket filters (personal/team), [092] Export to CSV for tickets and comments
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - unsubscribe support
- Rollback/Recovery: disable scheduler..

**[106] `/metrics` endpoint with Prometheus format (API + worker)**
- Goal / Why: `/metrics` endpoint with Prometheus format (API + worker)
- Scope: Included—`/metrics` endpoint with Prometheus format (API + worker); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - metrics exposed for key KPIs
- Test Proof: curl output
- Dependencies: [076] Health checks for worker queues (lag, failures)
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - auth or IP allowlist
- Rollback/Recovery: disable endpoint..

**[107] Alerting rules for SLA breaches/queue lag**
- Goal / Why: Alerting rules for SLA breaches/queue lag
- Scope: Included—Alerting rules for SLA breaches/queue lag; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - alerts fire in staging
- Test Proof: simulated breach
- Dependencies: [106] `/metrics` endpoint with Prometheus format (API + worker)
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - avoid alert storm
- Rollback/Recovery: mute alerts..

**[108] Disaster recovery drill (DB backup/restore)**
- Goal / Why: Disaster recovery drill (DB backup/restore)
- Scope: Included—Disaster recovery drill (DB backup/restore); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - backup restored in staging
- Test Proof: runbook
- Dependencies: [005] Add infra IaC stub (Docker compose for Postgres/Redis/MinIO)
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - encrypt backups
- Rollback/Recovery: rollback restore..

**[109] Environment parity checklist (dev/stage/prod)**
- Goal / Why: Environment parity checklist (dev/stage/prod)
- Scope: Included—Environment parity checklist (dev/stage/prod); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - checklist approved
- Test Proof: review
- Dependencies: [002] Create env validation script (Node 22, pnpm, Postgres)
- Labels: priority `P2`, area `ops`, type `feature`.
- Risk/Edge cases:
  - secrets handled
- Rollback/Recovery: update doc..

**[110] Performance budget for ticket list/detail**
- Goal / Why: Performance budget for ticket list/detail
- Scope: Included—Performance budget for ticket list/detail; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - render under threshold
- Test Proof: Lighthouse
- Dependencies: [046] Improve ticket list pagination with cursor, [088] Bulk actions on ticket list (assign, status change)
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: adjust budget..

**[111] Stop/Go Checkpoint 9 (tasks 100–110)**
- Goal / Why: Stop/Go Checkpoint 9 (tasks 100–110)
- Scope: Included—Stop/Go Checkpoint 9 (tasks 100–110); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [100] Accessibility audit and fixes (axe), [101] Localization framework (i18n keys) groundwork, [102] Captcha fallback for suspicious comment/ticket submissions, [103] Reopen approvals for high-priority tickets (agent/admin), [104] Report job performance optimizations (indexes, batching), [105] Export scheduling (email reports), [106] `/metrics` endpoint with Prometheus format (API + worker), [107] Alerting rules for SLA breaches/queue lag, [108] Disaster recovery drill (DB backup/restore), [109] Environment parity checklist (dev/stage/prod), [110] Performance budget for ticket list/detail
- Labels: priority `P2`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause..

**[112] Offline-friendly drafts for ticket/comment forms**
- Goal / Why: Offline-friendly drafts for ticket/comment forms
- Scope: Included—Offline-friendly drafts for ticket/comment forms; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - drafts stored locally
  - restored
- Test Proof: unit/E2E
- Dependencies: [029] UI attachment picker with progress + public/internal toggle
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - redact sensitive data
- Rollback/Recovery: disable drafts..

**[113] Data retention policies (attachments/comments)**
- Goal / Why: Data retention policies (attachments/comments)
- Scope: Included—Data retention policies (attachments/comments); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - policy stored
  - enforced
- Test Proof: unit
- Dependencies: [068] Attachment download logging
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - irreversible deletions noted
- Rollback/Recovery: disable enforcement..

**[114] Session security enhancements (2FA stub, login attempt logging)**
- Goal / Why: Session security enhancements (2FA stub, login attempt logging)
- Scope: Included—Session security enhancements (2FA stub, login attempt logging); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - logs recorded
  - 2FA flag stored
- Test Proof: unit
- Dependencies: [030] Apply rate limiting middleware to comment/ticket/attachment POST routes
- Labels: priority `P2`, area `security`, type `feature`.
- Risk/Edge cases:
  - protect secrets
- Rollback/Recovery: disable 2FA flag..

**[115] CSAT anti-gaming safeguards (token binding, expiry)**
- Goal / Why: CSAT anti-gaming safeguards (token binding, expiry)
- Scope: Included—CSAT anti-gaming safeguards (token binding, expiry); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - expired tokens rejected
- Test Proof: integration
- Dependencies: [095] CSAT UI for requester (email link/page)
- Labels: priority `P2`, area `security`, type `feature`.
- Risk/Edge cases:
  - protect tokens
- Rollback/Recovery: extend expiry..

**[116] Feature flag system for gradual rollouts**
- Goal / Why: Feature flag system for gradual rollouts
- Scope: Included—Feature flag system for gradual rollouts; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - flags stored
  - evaluated
- Test Proof: unit
- Dependencies: [006] CI pipeline skeleton (lint, typecheck placeholder)
- Labels: priority `P2`, area `frontend`, type `feature`.
- Risk/Edge cases:
  - default safe
- Rollback/Recovery: disable flags..

**[117] End-to-end regression suite expansion (cover new flows)**
- Goal / Why: End-to-end regression suite expansion (cover new flows)
- Scope: Included—End-to-end regression suite expansion (cover new flows); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - suite passes
- Test Proof: `pnpm test:e2e`
- Dependencies: [085] Update OpenAPI to include new worker-driven events and notification contracts, [098] Contract tests for reporting/exports and CSAT against OpenAPI
- Labels: priority `P2`, area `qa`, type `chore`.
- Risk/Edge cases:
  - run in isolated env
- Rollback/Recovery: mark flaky..

**[118] Performance/load test suite for API + worker**
- Goal / Why: Performance/load test suite for API + worker
- Scope: Included—Performance/load test suite for API + worker; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - targets met
- Test Proof: k6/JMeter results
- Dependencies: [110] Performance budget for ticket list/detail
- Labels: priority `P2`, area `backend`, type `chore`.
- Risk/Edge cases:
  - avoid prod data
- Rollback/Recovery: tune limits..

**[119] Documentation hub update (blueprint, runbooks, FAQs)**
- Goal / Why: Documentation hub update (blueprint, runbooks, FAQs)
- Scope: Included—Documentation hub update (blueprint, runbooks, FAQs); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - docs published
- Test Proof: review
- Dependencies: [117] End-to-end regression suite expansion (cover new flows)
- Labels: priority `P2`, area `docs`, type `chore`.
- Risk/Edge cases:
  - no secrets
- Rollback/Recovery: revert docs..

**[120] Release checklist for GA**
- Goal / Why: Release checklist for GA
- Scope: Included—Release checklist for GA; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - checklist approved
- Test Proof: review
- Dependencies: [111] Stop/Go Checkpoint 9 (tasks 100–110), [119] Documentation hub update (blueprint, runbooks, FAQs)
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - include rollback plan
- Rollback/Recovery: update checklist..

**[121] Production smoke test script (post-deploy)**
- Goal / Why: Production smoke test script (post-deploy)
- Scope: Included—Production smoke test script (post-deploy); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - script exits green
- Test Proof: run script
- Dependencies: [117] End-to-end regression suite expansion (cover new flows)
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - safe creds
- Rollback/Recovery: disable script..

**[122] Worker failover plan and chaos test**
- Goal / Why: Worker failover plan and chaos test
- Scope: Included—Worker failover plan and chaos test; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - failover succeeds in test
- Test Proof: chaos drill
- Dependencies: [076] Health checks for worker queues (lag, failures)
- Labels: priority `P2`, area `ops`, type `chore`.
- Risk/Edge cases:
  - ensure safeguards
- Rollback/Recovery: document gaps..

**[123] Final risk review against mitigation map**
- Goal / Why: Final risk review against mitigation map
- Scope: Included—Final risk review against mitigation map; Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - risks closed/accepted
- Test Proof: review
- Dependencies: [120] Release checklist for GA
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: update map..

**[124] Stop/Go Checkpoint 10 (tasks 112–123)**
- Goal / Why: Stop/Go Checkpoint 10 (tasks 112–123)
- Scope: Included—Stop/Go Checkpoint 10 (tasks 112–123); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [112] Offline-friendly drafts for ticket/comment forms, [113] Data retention policies (attachments/comments), [114] Session security enhancements (2FA stub, login attempt logging), [115] CSAT anti-gaming safeguards (token binding, expiry), [116] Feature flag system for gradual rollouts, [117] End-to-end regression suite expansion (cover new flows), [118] Performance/load test suite for API + worker, [119] Documentation hub update (blueprint, runbooks, FAQs), [120] Release checklist for GA, [121] Production smoke test script (post-deploy), [122] Worker failover plan and chaos test, [123] Final risk review against mitigation map
- Labels: priority `P2`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: pause release..

**[125] Definition of Done confirmation for P2 (all phases)**
- Goal / Why: Definition of Done confirmation for P2 (all phases)
- Scope: Included—Definition of Done confirmation for P2 (all phases); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - DoD checklist signed
  - monitoring on
  - runbooks ready
- Test Proof: checklist
- Dependencies: [124] Stop/Go Checkpoint 10 (tasks 112–123)
- Labels: priority `P2`, area `backend`, type `feature`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: block release until ready..

**[126] Stop/Go Checkpoint 11 (final release gate)**
- Goal / Why: Stop/Go Checkpoint 11 (final release gate)
- Scope: Included—Stop/Go Checkpoint 11 (final release gate); Excluded—Anything beyond the stated goal or unrelated features.
- Acceptance Criteria:
  - final approval recorded
  - release authorized
- Test Proof: checklist
- Dependencies: [125] Definition of Done confirmation for P2 (all phases)
- Labels: priority `P2`, area `backend`, type `chore`.
- Risk/Edge cases:
  - none
- Rollback/Recovery: delay launch. - **Phase 0**: Env validation, contract conventions/OpenAPI recreated, auth/policy helpers, sanitizer in place, contract + unit tests passing, checkpoints 1–2 approved. - **MVP (P0)**: Attachments with visibility, categories, SLA fields, admin SLA CRUD, rate limits, notification stubs, audits for files, checkpoints 3–5 approved, contract tests gating merges. - **V1 (P1)**: Workers running SLA/notification flows, automation rules, dashboards/widgets, audit coverage, checkpoints 6–7 approved, OpenAPI updated for automation features. - **V2 (P2)**: Reporting/CSAT, advanced security/perf features, localization groundwork, metrics/alerts, regression and load suites passing, checkpoints 8–11 approved, final release gate cleared.. - **Phase 0**: Env validation, contract conventions/OpenAPI recreated, auth/policy helpers, sanitizer in place, contract + unit tests passing, checkpoints 1–2 approved. - **MVP (P0)**: Attachments with visibility, categories, SLA fields, admin SLA CRUD, rate limits, notification stubs, audits for files, checkpoints 3–5 approved, contract tests gating merges. - **V1 (P1)**: Workers running SLA/notification flows, automation rules, dashboards/widgets, audit coverage, checkpoints 6–7 approved, OpenAPI updated for automation features. - **V2 (P2)**: Reporting/CSAT, advanced security/perf features, localization groundwork, metrics/alerts, regression and load suites passing, checkpoints 8–11 approved, final release gate cleared.
>>>>>>> theirs

## WBS Coverage Map
- total WBS tasks counted: 126
- total issues created: 126
- unmapped WBS tasks: none
- duplicate mappings: none
<<<<<<< ours
- 001 -> Inventory missing specialist + Agent 5 contract docs
- 002 -> Create environment validation script
- 003 -> Add `.env.example` completeness check
- 004 -> Document local dev bootstrap steps
- 005 -> Add infra IaC stub (Docker compose for Postgres/Redis/MinIO)
- 006 -> CI pipeline skeleton (lint, typecheck placeholder)
- 007 -> Publish coding standards doc
- 008 -> Introduce shared error/response schema
- 009 -> Add Markdown sanitization utility
- 010 -> Stop/Go Checkpoint 1 (tasks 001–009)
- 011 -> Add shared authorization helper
- 012 -> Apply auth helper to ticket GET/POST routes
- 013 -> Add rate limiting middleware skeleton
- 014 -> Wire Markdown sanitizer to ticket/comment display
- 015 -> Define permission matrix doc (UI vs API)
- 016 -> Add base test harness (Vitest config)
- 017 -> Add unit tests for auth helper and sanitizer
- 018 -> Audit internal/public comment visibility
- 019 -> Add logging baseline (request IDs, user id)
- 020 -> Stop/Go Checkpoint 2 (tasks 011–019)
- 021 -> Migrate attachment visibility/metadata columns
- 022 -> Backfill seed with attachment sample rows
- 023 -> Implement attachment upload API with presigned URLs
- 024 -> Add AV scanning hook (stub) post-upload
- 025 -> Build UI attachment picker with progress + visibility toggle
- 026 -> Apply rate limiting middleware to POST routes
- 027 -> Add category taxonomy table and seeds
- 028 -> Extend ticket form to select category
- 029 -> Add SLA pause/resume fields and placeholders
- 030 -> Stop/Go Checkpoint 3 (tasks 021–029)
- 031 -> Add notification preference schema
- 032 -> Implement basic notification service interface
- 033 -> Add comment spam guard (cooldown per user)
- 034 -> Sanitize Markdown on API ingest
- 035 -> Stop/Go Checkpoint 4 (tasks 031–034)
- 036 -> Add SLA policy admin CRUD API
- 037 -> Admin UI for SLA policies
- 038 -> Ticket creation shows SLA preview
- 039 -> Add ticket list SLA breach indicators
- 040 -> Shared policy module in TicketActions
- 041 -> Apply auth helper to comments API
- 042 -> Add ticket search index
- 043 -> Improve ticket list pagination with cursor
- 044 -> Audit logging for attachment uploads/deletes
- 045 -> Enforce attachment visibility on ticket detail
- 046 -> Add team membership management API
- 047 -> Admin UI for users/teams CRUD
- 048 -> Enforce file size/type limits server-side
- 049 -> Add checksum verification for uploads
- 050 -> Stop/Go Checkpoint 5 (tasks 036–049)
- 051 -> Set up Redis/BullMQ worker service
- 052 -> Define queue job schema for SLA timers
- 053 -> Schedule SLA jobs on ticket create/update
- 054 -> Process SLA breach -> audit + notifications
- 055 -> Add SLA pause/resume handling in worker
- 056 -> Implement notification channels (email stub + in-app feed)
- 057 -> Health checks for worker queues
- 058 -> Dashboard SLA widgets
- 059 -> Add automation rule engine (trigger/action config)
- 060 -> Stop/Go Checkpoint 6 (tasks 051–059)
- 061 -> Retry/backoff strategy with DLQ
- 062 -> Worker deployment runbook
- 063 -> SLA reminder notifications before breach
- 064 -> CSAT request trigger on resolution/closure
- 065 -> Stop/Go Checkpoint 7 (tasks 061–064)
- 066 -> Notification rate limiting/dedup service
- 067 -> Notification templates (localizable)
- 068 -> Add @mentions parsing to comments
- 069 -> Add Kanban board view for tickets
- 070 -> Admin governance for tags/categories cleanup
- 071 -> Audit coverage for admin CRUD
- 072 -> Audit viewer UI for admins
- 073 -> Assignment auto-suggest in TicketActions
- 074 -> Enhance search with tag/category filters
- 075 -> Add reopen reason capture form
- 076 -> Reopen throttling (cooldown)
- 077 -> Attachment download logging
- 078 -> Apply auth helper to admin routes
- 079 -> Contract tests UI vs API permissions
- 080 -> Stop/Go Checkpoint 8 (tasks 066–079)
- 081 -> Reporting job table and async export endpoints
- 082 -> Internal vs public attachment download URLs (signed, time-bound)
- 083 -> In-app notification center UI
- 084 -> Bulk actions on ticket list
- 085 -> Saved views for ticket filters
- 086 -> Dashboard KPI cards (MTTR, MTTA, reopen rate)
- 087 -> CSAT submission endpoint and schema
- 088 -> CSAT UI for requester
- 089 -> Export to CSV for tickets and comments
- 090 -> SLA calibration tool (what-if simulator)
- 091 -> Stop/Go Checkpoint 9 (tasks 081–090)
- 092 -> Accessibility audit and fixes (axe)
- 093 -> Localization framework groundwork
- 094 -> Captcha fallback for suspicious submissions
- 095 -> Reopen approvals for high-priority tickets
- 096 -> Knowledge base link injection based on category
- 097 -> CSAT analytics dashboards
- 098 -> Report job performance optimizations
- 099 -> Export scheduling (email reports)
- 100 -> Stop/Go Checkpoint 10 (tasks 092–099)
- 101 -> `/metrics` endpoint with Prometheus format
- 102 -> Alerting rules for SLA breaches/queue lag
- 103 -> Disaster recovery drill (DB backup/restore)
- 104 -> Environment parity checklist (dev/stage/prod)
- 105 -> Performance budget for ticket list/detail
- 106 -> Offline-friendly drafts for ticket/comment forms
- 107 -> Data retention policies (attachments/comments)
- 108 -> Session security enhancements (2FA stub, login attempt logging)
- 109 -> CSAT anti-gaming safeguards
- 110 -> Stop/Go Checkpoint 11 (tasks 101–109)
- 111 -> Data cleanup cron (stale drafts/temp uploads)
- 112 -> Feature flag system for gradual rollouts
- 113 -> End-to-end regression suite expansion
- 114 -> Performance/load test suite for API + worker
- 115 -> Documentation hub update (blueprint, runbooks, FAQs)
- 116 -> Release checklist for GA
- 117 -> Production smoke test script (post-deploy)
- 118 -> Worker failover plan and chaos test
- 119 -> Final risk review against mitigation map
- 120 -> Stop/Go Checkpoint 12 (tasks 111–119) & P2 Definition of Done
- 121 -> Production smoke test script (post-deploy) – duplicate governance check
- 122 -> Worker failover plan and chaos test – final alignment
- 123 -> Final risk review against mitigation map – final numbering
- 124 -> Stop/Go Checkpoint 13 (tasks 112–123 alignment)
- 125 -> Definition of Done confirmation for P2
- 126 -> Stop/Go Checkpoint 13 (final release gate)
=======
- 001 -> Inventory missing specialist + Agent 5 contract docs and confirm scope
- 002 -> Create env validation script (Node 22, pnpm, Postgres)
- 003 -> Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET)
- 004 -> Document local dev bootstrap steps in README addendum
- 005 -> Add infra IaC stub (Docker compose for Postgres/Redis/MinIO)
- 006 -> CI pipeline skeleton (lint, typecheck placeholder)
- 007 -> Establish coding standards doc (lint/format/commit)
- 008 -> Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers)
- 009 -> Define shared error/response schema aligned to conventions
- 010 -> Recreate OpenAPI baseline in `docs/openapi.yaml` for current routes
- 011 -> Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI
- 012 -> Stop/Go Checkpoint 1 (tasks 001–011)
- 013 -> Add Markdown sanitization utility
- 014 -> Introduce shared authorization helper (org/role checks)
- 015 -> Apply org/role helper to ticket GET/POST routes
- 016 -> Add rate limiting middleware skeleton
- 017 -> Wire Markdown sanitizer to ticket/comment display
- 018 -> Define permission matrix doc (UI vs API)
- 019 -> Add base test harness (Vitest config)
- 020 -> Add initial unit tests for auth helper, sanitizer, and error schema
- 021 -> Add logging baseline (request IDs, user id)
- 022 -> Audit internal/public comment visibility in UI and API
- 023 -> Wire CI job to block merges on OpenAPI lint + contract tests
- 024 -> Stop/Go Checkpoint 2 (tasks 013–023)
- 025 -> Migration for attachment visibility/metadata columns
- 026 -> Backfill seed to include attachment sample rows
- 027 -> Implement attachment upload API with presigned URL generation
- 028 -> Add AV scanning hook (stub) post-upload
- 029 -> UI attachment picker with progress + public/internal toggle
- 030 -> Apply rate limiting middleware to comment/ticket/attachment POST routes
- 031 -> Add category taxonomy table + seeds
- 032 -> Extend ticket form to select category from taxonomy
- 033 -> Add SLA pause/resume fields and logic placeholders
- 034 -> Notification preference schema (email/in-app toggles)
- 035 -> Implement basic notification service interface
- 036 -> Stop/Go Checkpoint 3 (tasks 025–035)
- 037 -> Comment spam guard (cooldown per user)
- 038 -> Sanitize Markdown on API ingest (tickets/comments)
- 039 -> Add SLA policy admin CRUD API (priority/category overrides)
- 040 -> Admin UI for SLA policies with validation
- 041 -> Ticket creation shows SLA preview (due times)
- 042 -> Add ticket list SLA breach indicators
- 043 -> Shared policy module used in TicketActions (status transitions)
- 044 -> Apply org/role helper to comments API
- 045 -> Add ticket search index on title/description/category
- 046 -> Improve ticket list pagination with cursor
- 047 -> Add audit logging for attachment uploads/deletes
- 048 -> Stop/Go Checkpoint 4 (tasks 037–047)
- 049 -> Enforce attachment visibility on ticket detail UI/API
- 050 -> Add team membership management API
- 051 -> Admin UI for users/teams CRUD
- 052 -> Enforce file size/type limits server-side
- 053 -> Add checksum verification for uploads
- 054 -> Apply org/role helper to admin routes
- 055 -> Notification rate limiting/dedup service
- 056 -> Notification templates (localizable)
- 057 -> Add @mentions parsing to comments
- 058 -> Add Kanban board view for tickets
- 059 -> Admin governance for tags/categories cleanup (merge/archive)
- 060 -> Contract tests UI vs API permissions
- 061 -> Stop/Go Checkpoint 5 (tasks 049–060)
- 062 -> Audit coverage for admin CRUD (users/teams/tags/SLA)
- 063 -> Audit viewer UI for admins
- 064 -> Add assignment auto-suggest (load-based) in TicketActions
- 065 -> Enhance search with tag/category filters
- 066 -> Add reopen reason capture form
- 067 -> Reopen throttling (cooldown)
- 068 -> Attachment download logging
- 069 -> Set up Redis/BullMQ worker service
- 070 -> Queue job schema for SLA timers (first response/resolve)
- 071 -> Schedule SLA jobs on ticket creation/update
- 072 -> Worker processes SLA breach -> audit + notifications
- 073 -> Add SLA pause/resume handling in worker (waiting on requester)
- 074 -> Stop/Go Checkpoint 6 (tasks 062–073)
- 075 -> Implement notification channels (email adapter stub + in-app feed)
- 076 -> Health checks for worker queues (lag, failures)
- 077 -> Dashboard SLA widgets (open tickets by breach state)
- 078 -> Add automation rule engine (trigger/action config)
- 079 -> Retry/backoff strategy for failed jobs with DLQ
- 080 -> Worker deployment runbook (restart, drain, rollback)
- 081 -> SLA reminder notifications before breach
- 082 -> Add CSAT request trigger on resolution/closure
- 083 -> Notification preference enforcement in sender
- 084 -> SLA escalation logic (team escalation path)
- 085 -> Update OpenAPI to include new worker-driven events and notification contracts
- 086 -> Stop/Go Checkpoint 7 (tasks 075–085)
- 087 -> In-app notification center UI
- 088 -> Bulk actions on ticket list (assign, status change)
- 089 -> Saved views for ticket filters (personal/team)
- 090 -> Reporting job table and async export endpoints
- 091 -> Dashboard KPI cards (MTTR, MTTA, reopen rate)
- 092 -> Export to CSV for tickets and comments
- 093 -> Internal vs public attachment download URLs (signed, time-bound)
- 094 -> CSAT submission endpoint and schema
- 095 -> CSAT UI for requester (email link/page)
- 096 -> SLA calibration tool (what-if simulator)
- 097 -> Knowledge base link injection based on category
- 098 -> Contract tests for reporting/exports and CSAT against OpenAPI
- 099 -> Stop/Go Checkpoint 8 (tasks 087–098)
- 100 -> Accessibility audit and fixes (axe)
- 101 -> Localization framework (i18n keys) groundwork
- 102 -> Captcha fallback for suspicious comment/ticket submissions
- 103 -> Reopen approvals for high-priority tickets (agent/admin)
- 104 -> Report job performance optimizations (indexes, batching)
- 105 -> Export scheduling (email reports)
- 106 -> `/metrics` endpoint with Prometheus format (API + worker)
- 107 -> Alerting rules for SLA breaches/queue lag
- 108 -> Disaster recovery drill (DB backup/restore)
- 109 -> Environment parity checklist (dev/stage/prod)
- 110 -> Performance budget for ticket list/detail
- 111 -> Stop/Go Checkpoint 9 (tasks 100–110)
- 112 -> Offline-friendly drafts for ticket/comment forms
- 113 -> Data retention policies (attachments/comments)
- 114 -> Session security enhancements (2FA stub, login attempt logging)
- 115 -> CSAT anti-gaming safeguards (token binding, expiry)
- 116 -> Feature flag system for gradual rollouts
- 117 -> End-to-end regression suite expansion (cover new flows)
- 118 -> Performance/load test suite for API + worker
- 119 -> Documentation hub update (blueprint, runbooks, FAQs)
- 120 -> Release checklist for GA
- 121 -> Production smoke test script (post-deploy)
- 122 -> Worker failover plan and chaos test
- 123 -> Final risk review against mitigation map
- 124 -> Stop/Go Checkpoint 10 (tasks 112–123)
- 125 -> Definition of Done confirmation for P2 (all phases)
- 126 -> Stop/Go Checkpoint 11 (final release gate)
>>>>>>> theirs
