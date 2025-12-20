# Label taxonomy
- **priority:** `P0` (must-do), `P1` (should-do), `P2` (later)
- **area:** `frontend`, `backend`, `api`, `data`, `auth`, `ops`, `security`, `qa`, `docs`
- **type:** `feature`, `bug`, `chore`, `refactor`, `spike`

# Milestone goals
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

## WBS Coverage Map
- total WBS tasks counted: 126
- total issues created: 126
- unmapped WBS tasks: none
- duplicate mappings: none
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

