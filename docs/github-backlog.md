# Label taxonomy
- priority: `P0` (must-do), `P1` (should-do), `P2` (later)
- area: `frontend`, `backend`, `api`, `data`, `auth`, `ops`, `security`, `qa`, `docs`
- type: `feature`, `bug`, `chore`, `refactor`, `spike`

# Milestone goals
- **Phase 0**: Env validation, contract conventions/OpenAPI recreated, auth/policy helpers, sanitizer in place, contract + unit tests passing, checkpoints 1-2 approved.
- **MVP (P0)**: Attachments with visibility, categories, SLA fields, admin SLA CRUD, rate limits, notification stubs, audits for files, checkpoints 3-5 approved, contract tests gating merges.
- **V1 (P1)**: Workers running SLA/notification flows, automation rules, dashboards/widgets, audit coverage, checkpoints 6-7 approved, OpenAPI updated for automation features.
- **V2 (P2)**: Reporting/CSAT, advanced security/perf features, localization groundwork, metrics/alerts, regression and load suites passing, checkpoints 8-11 approved, final release gate cleared.

# How to execute
- Triage: verify dependencies, confirm acceptance/test proof, size/assign, label, update milestone board, implement, capture test proof, request review, keep coverage map in sync.
- Definition of Ready: dependencies planned, environments available, acceptance/test proof agreed, risks/rollback understood, labels assigned.
- Definition of Done: acceptance met with passing proofs, docs/tests updated, security/edge cases addressed, rollback documented, milestone board updated.

# Milestone: Phase 0

**[001] Inventory missing specialist + Agent 5 contract docs and confirm scope**
- Goal: Inventory missing specialist + Agent 5 contract docs and confirm scope
- Acceptance Criteria:
  - list of absent inputs + owner
- Test Proof: doc review
- Dependencies: none
- Labels: priority `P0`, area `docs`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: N/A

**[002] Create env validation script (Node 22, pnpm, Postgres)**
- Goal: Create env validation script (Node 22, pnpm, Postgres)
- Acceptance Criteria:
  - script exits non-zero when unmet
- Test Proof: run script in CI
- Dependencies: [001]
- Labels: priority `P0`, area `ops`, type `chore`.
- Security/Edge cases: avoid leaking secrets
- Rollback/Recovery: delete script

**[003] Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET)**
- Goal: Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET)
- Acceptance Criteria:
  - lint passes and check fails on missing vars
- Test Proof: unit for checker
- Dependencies: [002]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: do not log secrets
- Rollback/Recovery: remove checker

**[004] Document local dev bootstrap steps in README addendum**
- Goal: Document local dev bootstrap steps in README addendum
- Acceptance Criteria:
  - steps reproducible
- Test Proof: run commands
- Dependencies: [002]
- Labels: priority `P0`, area `docs`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: revert doc

**[005] Add infra IaC stub (Docker compose for Postgres/Redis/MinIO)**
- Goal: Add infra IaC stub (Docker compose for Postgres/Redis/MinIO)
- Acceptance Criteria:
  - `docker compose up` starts services
- Test Proof: smoke connection
- Dependencies: [002]
- Labels: priority `P0`, area `ops`, type `chore`.
- Security/Edge cases: default creds scoped to local only
- Rollback/Recovery: remove compose services

**[006] CI pipeline skeleton (lint, typecheck placeholder) ✅ COMPLETED**
- Goal: CI pipeline skeleton (lint, typecheck placeholder)
- Acceptance Criteria:
  - pipeline runs on PR
- Test Proof: CI log
- Dependencies: [003]
- Labels: priority `P0`, area `ops`, type `chore`.
- Security/Edge cases: mask secrets
- Rollback/Recovery: disable workflow

**[007] Establish coding standards doc (lint/format/commit)**
- Goal: Establish coding standards doc (lint/format/commit)
- Acceptance Criteria:
  - doc merged
- Test Proof: review
- Dependencies: [004]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: revert doc

**[008] Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers)**
- Goal: Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers)
- Acceptance Criteria:
  - conventions doc approved
- Test Proof: review
- Dependencies: [007]
- Labels: priority `P0`, area `api`, type `chore`.
- Security/Edge cases: avoid leaking internal codes
- Rollback/Recovery: supersede doc

**[009] Define shared error/response schema aligned to conventions**
- Goal: Define shared error/response schema aligned to conventions
- Acceptance Criteria:
  - schema exported and reusable
- Test Proof: unit for serializer
- Dependencies: [008]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: avoid detail leakage
- Rollback/Recovery: revert module

**[010] Recreate OpenAPI baseline in `docs/openapi.yaml` for current routes**
- Goal: Recreate OpenAPI baseline in `docs/openapi.yaml` for current routes
- Acceptance Criteria:
  - spec passes lint
  - reflects current endpoints
- Test Proof: openapi lint
- Dependencies: [008], [009]
- Labels: priority `P0`, area `api`, type `chore`.
- Security/Edge cases: exclude secrets
- Rollback/Recovery: remove spec

**[011] Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI**
- Goal: Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI
- Acceptance Criteria:
  - harness runs locally
- Test Proof: `pnpm test:contract` (placeholder)
- Dependencies: [010]
- Labels: priority `P0`, area `qa`, type `chore`.
- Security/Edge cases: redacts tokens
- Rollback/Recovery: disable harness

**[012] Stop/Go Checkpoint 1 (tasks 001-011)**
- Goal: Stop/Go Checkpoint 1 (tasks 001-011)
- Acceptance Criteria:
  - sign-off notes
- Test Proof: checklist
- Dependencies: [001], [002], [003], [004], [005], [006], [007], [008], [009], [010], [011]
- Labels: priority `P0`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause next tasks

**[013] Add Markdown sanitization utility**
- Goal: Add Markdown sanitization utility
- Acceptance Criteria:
  - sanitizer used in comment render
- Test Proof: unit with XSS strings
- Dependencies: [011]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: ensure whitelist
- Rollback/Recovery: remove util

**[014] Introduce shared authorization helper (org/role checks)**
- Goal: Introduce shared authorization helper (org/role checks)
- Acceptance Criteria:
  - helper used in one endpoint
- Test Proof: unit matrix
- Dependencies: [011]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: enforce role gates
- Rollback/Recovery: remove helper

**[015] Apply org/role helper to ticket GET/POST routes**
- Goal: Apply org/role helper to ticket GET/POST routes
- Acceptance Criteria:
  - tests pass for requester/agent/admin
- Test Proof: integration
- Dependencies: [014]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: ensure org scope
- Rollback/Recovery: revert usage

**[016] Add rate limiting middleware skeleton**
- Goal: Add rate limiting middleware skeleton
- Acceptance Criteria:
  - middleware exported, not yet wired
- Test Proof: unit
- Dependencies: [014]
- Labels: priority `P0`, area `security`, type `feature`.
- Security/Edge cases: denial-of-service protection
- Rollback/Recovery: disable middleware

**[017] Wire Markdown sanitizer to ticket/comment display**
- Goal: Wire Markdown sanitizer to ticket/comment display
- Acceptance Criteria:
  - sanitized output observed
- Test Proof: integration snapshot
- Dependencies: [013]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: XSS blocked
- Rollback/Recovery: remove call

**[018] Define permission matrix doc (UI vs API)**
- Goal: Define permission matrix doc (UI vs API)
- Acceptance Criteria:
  - matrix published
- Test Proof: review
- Dependencies: [014]
- Labels: priority `P0`, area `docs`, type `chore`.
- Security/Edge cases: clarifies gating
- Rollback/Recovery: revert doc

**[019] Add base test harness (Vitest config)**
- Goal: Add base test harness (Vitest config)
- Acceptance Criteria:
  - `pnpm test` runs placeholder
- Test Proof: run command
- Dependencies: [006]
- Labels: priority `P0`, area `qa`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: remove config

**[020] Add initial unit tests for auth helper, sanitizer, and error schema**
- Goal: Add initial unit tests for auth helper, sanitizer, and error schema
- Acceptance Criteria:
  - tests green
- Test Proof: `pnpm test`
- Dependencies: [013], [014], [019]
- Labels: priority `P0`, area `qa`, type `chore`.
- Security/Edge cases: covers edge strings
- Rollback/Recovery: drop tests

**[021] Add logging baseline (request IDs, user id)**
- Goal: Add logging baseline (request IDs, user id)
- Acceptance Criteria:
  - middleware outputs IDs
- Test Proof: unit for logger
- Dependencies: [014]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: avoid PII
- Rollback/Recovery: disable logger

**[022] Audit internal/public comment visibility in UI and API**
- Goal: Audit internal/public comment visibility in UI and API
- Acceptance Criteria:
  - checklist of visibility rules
- Test Proof: manual review
- Dependencies: [018]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: ensure hidden to requesters
- Rollback/Recovery: none

**[023] Wire CI job to block merges on OpenAPI lint + contract tests**
- Goal: Wire CI job to block merges on OpenAPI lint + contract tests
- Acceptance Criteria:
  - failing spec blocks PR
- Test Proof: CI run
- Dependencies: [006], [011]
- Labels: priority `P0`, area `qa`, type `chore`.
- Security/Edge cases: no secrets
- Rollback/Recovery: make job optional

**[024] Stop/Go Checkpoint 2 (tasks 013-023)**
- Goal: Stop/Go Checkpoint 2 (tasks 013-023)
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [013], [014], [015], [016], [017], [018], [019], [020], [021], [022], [023]
- Labels: priority `P0`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause next tasks

# Milestone: MVP (P0)

**[025] Migration for attachment visibility/metadata columns**
- Goal: Migration for attachment visibility/metadata columns
- Acceptance Criteria:
  - migration applied locally
- Test Proof: prisma migrate
- Dependencies: [005], [015]
- Labels: priority `P0`, area `data`, type `feature`.
- Security/Edge cases: nullable defaults
- Rollback/Recovery: prisma migrate reset

**[026] Backfill seed to include attachment sample rows**
- Goal: Backfill seed to include attachment sample rows
- Acceptance Criteria:
  - seed succeeds
- Test Proof: pnpm prisma:seed
- Dependencies: [025]
- Labels: priority `P0`, area `data`, type `feature`.
- Security/Edge cases: sample uses safe files
- Rollback/Recovery: revert seed

**[027] Implement attachment upload API with presigned URL generation**
- Goal: Implement attachment upload API with presigned URL generation
- Acceptance Criteria:
  - returns URL + metadata entry
- Test Proof: integration
- Dependencies: [025]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: size/type enforced
- Rollback/Recovery: disable route

**[028] Add AV scanning hook (stub) post-upload**
- Goal: Add AV scanning hook (stub) post-upload
- Acceptance Criteria:
  - AV status recorded
- Test Proof: unit with mock
- Dependencies: [027]
- Labels: priority `P0`, area `security`, type `feature`.
- Security/Edge cases: quarantine flag
- Rollback/Recovery: bypass AV flag

**[029] UI attachment picker with progress + public/internal toggle**
- Goal: UI attachment picker with progress + public/internal toggle
- Acceptance Criteria:
  - file uploaded and linked to ticket
- Test Proof: manual + E2E
- Dependencies: [027]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: respects visibility
- Rollback/Recovery: hide UI

**[030] Apply rate limiting middleware to comment/ticket/attachment POST routes**
- Goal: Apply rate limiting middleware to comment/ticket/attachment POST routes
- Acceptance Criteria:
  - exceeds threshold returns 429
- Test Proof: integration
- Dependencies: [016], [027]
- Labels: priority `P0`, area `security`, type `feature`.
- Security/Edge cases: prevents spam
- Rollback/Recovery: disable middleware

**[031] Add category taxonomy table + seeds**
- Goal: Add category taxonomy table + seeds
- Acceptance Criteria:
  - migration adds categories, seed populates defaults
- Test Proof: prisma migrate/seed
- Dependencies: [025]
- Labels: priority `P0`, area `data`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: revert migration

**[032] Extend ticket form to select category from taxonomy**
- Goal: Extend ticket form to select category from taxonomy
- Acceptance Criteria:
  - category id stored
- Test Proof: E2E
- Dependencies: [031]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: validate org-scoped categories
- Rollback/Recovery: hide field

**[033] Add SLA pause/resume fields and logic placeholders**
- Goal: Add SLA pause/resume fields and logic placeholders
- Acceptance Criteria:
  - fields saved
  - no logic yet
- Test Proof: migrate
- Dependencies: [025]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: remove fields

**[034] Notification preference schema (email/in-app toggles)**
- Goal: Notification preference schema (email/in-app toggles)
- Acceptance Criteria:
  - migration adds preferences
- Test Proof: migrate
- Dependencies: [025]
- Labels: priority `P0`, area `data`, type `feature`.
- Security/Edge cases: defaults safe
- Rollback/Recovery: drop table

**[035] Implement basic notification service interface**
- Goal: Implement basic notification service interface
- Acceptance Criteria:
  - service stub with send method
- Test Proof: unit
- Dependencies: [034]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: redact secrets
- Rollback/Recovery: remove service

**[036] Stop/Go Checkpoint 3 (tasks 025-035)**
- Goal: Stop/Go Checkpoint 3 (tasks 025-035)
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [025], [026], [027], [028], [029], [030], [031], [032], [033], [034], [035]
- Labels: priority `P0`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause

**[037] Comment spam guard (cooldown per user)**
- Goal: Comment spam guard (cooldown per user)
- Acceptance Criteria:
  - repeated posts blocked within window
- Test Proof: integration
- Dependencies: [030]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: avoid DoS
- Rollback/Recovery: disable guard

**[038] Sanitize Markdown on API ingest (tickets/comments)**
- Goal: Sanitize Markdown on API ingest (tickets/comments)
- Acceptance Criteria:
  - stored content sanitized
- Test Proof: unit/integration
- Dependencies: [013]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: XSS prevention
- Rollback/Recovery: remove sanitization

**[039] Add SLA policy admin CRUD API (priority/category overrides)**
- Goal: Add SLA policy admin CRUD API (priority/category overrides)
- Acceptance Criteria:
  - create/update/delete works with org scope
- Test Proof: integration
- Dependencies: [031], [033]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: role=ADMIN enforced
- Rollback/Recovery: disable routes

**[040] Admin UI for SLA policies with validation**
- Goal: Admin UI for SLA policies with validation
- Acceptance Criteria:
  - admin can CRUD policy
- Test Proof: E2E
- Dependencies: [039]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: admin-only guard
- Rollback/Recovery: hide menu

**[041] Ticket creation shows SLA preview (due times)**
- Goal: Ticket creation shows SLA preview (due times)
- Acceptance Criteria:
  - preview matches policy
- Test Proof: unit for calc
- Dependencies: [033], [039]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: hide preview

**[042] Add ticket list SLA breach indicators**
- Goal: Add ticket list SLA breach indicators
- Acceptance Criteria:
  - overdue badge shows when past due
- Test Proof: integration
- Dependencies: [033]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: hide badge

**[043] Shared policy module used in TicketActions (status transitions)**
- Goal: Shared policy module used in TicketActions (status transitions)
- Acceptance Criteria:
  - transitions enforced per role map
- Test Proof: unit/integration
- Dependencies: [018]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: prevents invalid statuses
- Rollback/Recovery: revert module usage

**[044] Apply org/role helper to comments API**
- Goal: Apply org/role helper to comments API
- Acceptance Criteria:
  - org mismatch rejected
- Test Proof: integration
- Dependencies: [014]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: tenant isolation
- Rollback/Recovery: revert helper

**[045] Add ticket search index on title/description/category**
- Goal: Add ticket search index on title/description/category
- Acceptance Criteria:
  - index created
- Test Proof: migration
- Dependencies: [025]
- Labels: priority `P0`, area `data`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: drop index

**[046] Improve ticket list pagination with cursor**
- Goal: Improve ticket list pagination with cursor
- Acceptance Criteria:
  - paginated responses
- Test Proof: integration
- Dependencies: [045]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: validate inputs
- Rollback/Recovery: revert to offset

**[047] Add audit logging for attachment uploads/deletes**
- Goal: Add audit logging for attachment uploads/deletes
- Acceptance Criteria:
  - audit row created
- Test Proof: unit
- Dependencies: [027]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: includes actor info
- Rollback/Recovery: disable audit hook

**[048] Stop/Go Checkpoint 4 (tasks 037-047)**
- Goal: Stop/Go Checkpoint 4 (tasks 037-047)
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [037], [038], [039], [040], [041], [042], [043], [044], [045], [046], [047]
- Labels: priority `P0`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause

**[049] Enforce attachment visibility on ticket detail UI/API**
- Goal: Enforce attachment visibility on ticket detail UI/API
- Acceptance Criteria:
  - requesters cannot see internal files
- Test Proof: integration/E2E
- Dependencies: [029], [027]
- Labels: priority `P0`, area `security`, type `feature`.
- Security/Edge cases: access control
- Rollback/Recovery: hide files

**[050] Add team membership management API**
- Goal: Add team membership management API
- Acceptance Criteria:
  - add/remove users from teams
- Test Proof: integration
- Dependencies: [031]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: admin-only
- Rollback/Recovery: disable endpoints

**[051] Admin UI for users/teams CRUD**
- Goal: Admin UI for users/teams CRUD
- Acceptance Criteria:
  - create/update/delete works
- Test Proof: E2E
- Dependencies: [050]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: guard by role
- Rollback/Recovery: hide nav

**[052] Enforce file size/type limits server-side**
- Goal: Enforce file size/type limits server-side
- Acceptance Criteria:
  - rejects oversized/disallowed types
- Test Proof: integration
- Dependencies: [027]
- Labels: priority `P0`, area `security`, type `feature`.
- Security/Edge cases: prevents abuse
- Rollback/Recovery: relax limits

**[053] Add checksum verification for uploads**
- Goal: Add checksum verification for uploads
- Acceptance Criteria:
  - checksum stored and validated
- Test Proof: unit
- Dependencies: [052]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: tamper detection
- Rollback/Recovery: bypass check

**[054] Apply org/role helper to admin routes**
- Goal: Apply org/role helper to admin routes
- Acceptance Criteria:
  - all admin endpoints enforce org scope
- Test Proof: integration
- Dependencies: [014]
- Labels: priority `P0`, area `api`, type `feature`.
- Security/Edge cases: tenant isolation
- Rollback/Recovery: revert helper usage

**[055] Notification rate limiting/dedup service**
- Goal: Notification rate limiting/dedup service
- Acceptance Criteria:
  - duplicate alerts suppressed
- Test Proof: unit
- Dependencies: [035]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: prevents spam
- Rollback/Recovery: bypass dedup

**[056] Notification templates (localizable)**
- Goal: Notification templates (localizable)
- Acceptance Criteria:
  - templates stored and rendered
- Test Proof: unit snapshot
- Dependencies: [035]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: sanitize variables
- Rollback/Recovery: revert templates

**[057] Add @mentions parsing to comments**
- Goal: Add @mentions parsing to comments
- Acceptance Criteria:
  - mentions stored and used to notify
- Test Proof: unit/integration
- Dependencies: [038]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: validate user existence
- Rollback/Recovery: disable mentions

**[058] Add Kanban board view for tickets**
- Goal: Add Kanban board view for tickets
- Acceptance Criteria:
  - drag/drop updates status respecting policy
- Test Proof: E2E
- Dependencies: [046]
- Labels: priority `P0`, area `frontend`, type `feature`.
- Security/Edge cases: role checks
- Rollback/Recovery: disable board

**[059] Admin governance for tags/categories cleanup (merge/archive)**
- Goal: Admin governance for tags/categories cleanup (merge/archive)
- Acceptance Criteria:
  - archive/merge works
- Test Proof: integration
- Dependencies: [031]
- Labels: priority `P0`, area `backend`, type `feature`.
- Security/Edge cases: admin-only
- Rollback/Recovery: revert changes

**[060] Contract tests UI vs API permissions**
- Goal: Contract tests UI vs API permissions
- Acceptance Criteria:
  - matrix tests green
- Test Proof: automated contract suite
- Dependencies: [018], [043]
- Labels: priority `P0`, area `qa`, type `chore`.
- Security/Edge cases: ensures consistency
- Rollback/Recovery: disable suite

**[061] Stop/Go Checkpoint 5 (tasks 049-060)**
- Goal: Stop/Go Checkpoint 5 (tasks 049-060)
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [049], [050], [051], [052], [053], [054], [055], [056], [057], [058], [059], [060]
- Labels: priority `P0`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause

# Milestone: V1 (P1)

**[062] Audit coverage for admin CRUD (users/teams/tags/SLA)**
- Goal: Audit coverage for admin CRUD (users/teams/tags/SLA)
- Acceptance Criteria:
  - audit rows created
- Test Proof: integration
- Dependencies: [051], [039]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: immutable logs
- Rollback/Recovery: disable hook

**[063] Audit viewer UI for admins**
- Goal: Audit viewer UI for admins
- Acceptance Criteria:
  - paginated audit list filterable by actor/date/action
- Test Proof: E2E
- Dependencies: [062]
- Labels: priority `P1`, area `frontend`, type `feature`.
- Security/Edge cases: admin-only
- Rollback/Recovery: hide page

**[064] Add assignment auto-suggest (load-based) in TicketActions**
- Goal: Add assignment auto-suggest (load-based) in TicketActions
- Acceptance Criteria:
  - suggestion displayed
- Test Proof: unit
- Dependencies: [046]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: avoid revealing other org data
- Rollback/Recovery: disable suggest

**[065] Enhance search with tag/category filters**
- Goal: Enhance search with tag/category filters
- Acceptance Criteria:
  - filters applied
- Test Proof: integration
- Dependencies: [031], [059]
- Labels: priority `P1`, area `frontend`, type `feature`.
- Security/Edge cases: org scope
- Rollback/Recovery: remove filters

**[066] Add reopen reason capture form**
- Goal: Add reopen reason capture form
- Acceptance Criteria:
  - reason saved on reopen
- Test Proof: integration
- Dependencies: [043]
- Labels: priority `P1`, area `frontend`, type `feature`.
- Security/Edge cases: validate length
- Rollback/Recovery: optional field

**[067] Reopen throttling (cooldown)**
- Goal: Reopen throttling (cooldown)
- Acceptance Criteria:
  - repeated reopen blocked
- Test Proof: integration
- Dependencies: [066]
- Labels: priority `P1`, area `api`, type `feature`.
- Security/Edge cases: prevent abuse
- Rollback/Recovery: disable throttle

**[068] Attachment download logging**
- Goal: Attachment download logging
- Acceptance Criteria:
  - audit on download
- Test Proof: unit
- Dependencies: [049]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: includes actor
- Rollback/Recovery: disable logging

**[069] Set up Redis/BullMQ worker service ✅ COMPLETED**
- Goal: Set up Redis/BullMQ worker service
- Acceptance Criteria:
  - worker connects and processes dummy job
- Test Proof: integration
- Dependencies: [005], [035]
- Labels: priority `P1`, area `ops`, type `chore`.
- Security/Edge cases: restrict network
- Rollback/Recovery: disable worker

**[070] Queue job schema for SLA timers (first response/resolve)**
- Goal: Queue job schema for SLA timers (first response/resolve)
- Acceptance Criteria:
  - job payload defined
- Test Proof: unit
- Dependencies: [033], [069]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: validate org id
- Rollback/Recovery: remove job type

**[071] Schedule SLA jobs on ticket creation/update**
- Goal: Schedule SLA jobs on ticket creation/update
- Acceptance Criteria:
  - jobs enqueued with due timestamps
- Test Proof: integration
- Dependencies: [070], [033]
- Labels: priority `P1`, area `api`, type `feature`.
- Security/Edge cases: org scoping
- Rollback/Recovery: stop enqueue

**[072] Worker processes SLA breach -> audit + notifications ✅ COMPLETED**
- Goal: Worker processes SLA breach -> audit + notifications
- Acceptance Criteria:
  - breach sets flag and sends notification
- Test Proof: integration
- Dependencies: [071]
- Labels: priority `P1`, area `api`, type `feature`.
- Security/Edge cases: avoid duplicate send
- Rollback/Recovery: mark job failed

**[073] Add SLA pause/resume handling in worker (waiting on requester)**
- Goal: Add SLA pause/resume handling in worker (waiting on requester)
- Acceptance Criteria:
  - clock stops/starts on status change
- Test Proof: unit/integration
- Dependencies: [067], [072]
- Labels: priority `P1`, area `api`, type `feature`.
- Security/Edge cases: validate transitions
- Rollback/Recovery: disable pause logic

**[074] Stop/Go Checkpoint 6 (tasks 062-073)**
- Goal: Stop/Go Checkpoint 6 (tasks 062-073)
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [062], [063], [064], [065], [066], [067], [068], [069], [070], [071], [072], [073]
- Labels: priority `P1`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause

**[075] Implement notification channels (email adapter stub + in-app feed)**
- Goal: Implement notification channels (email adapter stub + in-app feed)
- Acceptance Criteria:
  - message stored + email logged
- Test Proof: unit/integration
- Dependencies: [035]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: secret handling
- Rollback/Recovery: disable email

**[076] Health checks for worker queues (lag, failures) ✅ COMPLETED**
- Goal: Health checks for worker queues (lag, failures)
- Acceptance Criteria:
  - endpoint exposes metrics
- Test Proof: integration
- Dependencies: [069]
- Labels: priority `P1`, area `ops`, type `chore`.
- Security/Edge cases: protect endpoint
- Rollback/Recovery: disable metrics

**[077] Dashboard SLA widgets (open tickets by breach state)**
- Goal: Dashboard SLA widgets (open tickets by breach state)
- Acceptance Criteria:
  - widget renders counts
- Test Proof: integration
- Dependencies: [042], [072]
- Labels: priority `P1`, area `frontend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: hide widget

**[078] Add automation rule engine (trigger/action config)**
- Goal: Add automation rule engine (trigger/action config)
- Acceptance Criteria:
  - rules persisted and executed on events
- Test Proof: unit
- Dependencies: [035], [039]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: validate actions
- Rollback/Recovery: disable rules

**[079] Retry/backoff strategy for failed jobs with DLQ**
- Goal: Retry/backoff strategy for failed jobs with DLQ
- Acceptance Criteria:
  - retries configured, DLQ table/log
- Test Proof: unit
- Dependencies: [069]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: avoid infinite loops
- Rollback/Recovery: disable retries

**[080] Worker deployment runbook (restart, drain, rollback)**
- Goal: Worker deployment runbook (restart, drain, rollback)
- Acceptance Criteria:
  - runbook published
- Test Proof: tabletop
- Dependencies: [076]
- Labels: priority `P1`, area `ops`, type `chore`.
- Security/Edge cases: access control noted
- Rollback/Recovery: revise runbook

**[081] SLA reminder notifications before breach**
- Goal: SLA reminder notifications before breach
- Acceptance Criteria:
  - reminder sent at threshold
- Test Proof: integration
- Dependencies: [072]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: dedup
- Rollback/Recovery: disable reminder flag

**[082] Add CSAT request trigger on resolution/closure**
- Goal: Add CSAT request trigger on resolution/closure
- Acceptance Criteria:
  - CSAT notification dispatched once
- Test Proof: integration
- Dependencies: [073]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: one-per-ticket
- Rollback/Recovery: disable trigger

**[083] Notification preference enforcement in sender**
- Goal: Notification preference enforcement in sender
- Acceptance Criteria:
  - respects toggles
- Test Proof: unit
- Dependencies: [034], [075]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: defaults safe
- Rollback/Recovery: bypass enforcement

**[084] SLA escalation logic (team escalation path)**
- Goal: SLA escalation logic (team escalation path)
- Acceptance Criteria:
  - escalation triggers reassignment/audit
- Test Proof: integration
- Dependencies: [078], [072]
- Labels: priority `P1`, area `backend`, type `feature`.
- Security/Edge cases: role checks
- Rollback/Recovery: disable escalation

**[085] Update OpenAPI to include new worker-driven events and notification contracts**
- Goal: Update OpenAPI to include new worker-driven events and notification contracts
- Acceptance Criteria:
  - spec updated, lint green
- Test Proof: openapi lint
- Dependencies: [075], [076], [077], [078], [079], [080], [081], [082], [083], [084]
- Labels: priority `P1`, area `api`, type `chore`.
- Security/Edge cases: exclude secrets
- Rollback/Recovery: revert spec change

**[086] Stop/Go Checkpoint 7 (tasks 075-085)**
- Goal: Stop/Go Checkpoint 7 (tasks 075-085)
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [075], [076], [077], [078], [079], [080], [081], [082], [083], [084], [085]
- Labels: priority `P1`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause

# Milestone: V2 (P2)

**[087] In-app notification center UI**
- Goal: In-app notification center UI
- Acceptance Criteria:
  - list with read/unread, filters
- Test Proof: E2E
- Dependencies: [075], [083]
- Labels: priority `P2`, area `frontend`, type `feature`.
- Security/Edge cases: user scoped
- Rollback/Recovery: hide UI

**[088] Bulk actions on ticket list (assign, status change)**
- Goal: Bulk actions on ticket list (assign, status change)
- Acceptance Criteria:
  - bulk operation executes with audit
- Test Proof: integration
- Dependencies: [043]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: permission check per item
- Rollback/Recovery: disable bulk

**[089] Saved views for ticket filters (personal/team)**
- Goal: Saved views for ticket filters (personal/team)
- Acceptance Criteria:
  - save/load works
- Test Proof: integration
- Dependencies: [046]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: org scoping
- Rollback/Recovery: disable feature

**[090] Reporting job table and async export endpoints**
- Goal: Reporting job table and async export endpoints
- Acceptance Criteria:
  - report request returns job id
- Test Proof: integration
- Dependencies: [069]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: org scope
- Rollback/Recovery: disable endpoint

**[091] Dashboard KPI cards (MTTR, MTTA, reopen rate)**
- Goal: Dashboard KPI cards (MTTR, MTTA, reopen rate)
- Acceptance Criteria:
  - metrics calculated accurately
- Test Proof: unit
- Dependencies: [090]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: hide cards

**[092] Export to CSV for tickets and comments**
- Goal: Export to CSV for tickets and comments
- Acceptance Criteria:
  - downloadable file generated asynchronously
- Test Proof: integration
- Dependencies: [090]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: scrub internal-only fields for requesters
- Rollback/Recovery: disable export

**[093] Internal vs public attachment download URLs (signed, time-bound)**
- Goal: Internal vs public attachment download URLs (signed, time-bound)
- Acceptance Criteria:
  - generates scoped URLs
- Test Proof: integration
- Dependencies: [049], [052]
- Labels: priority `P2`, area `security`, type `feature`.
- Security/Edge cases: expiry + scope
- Rollback/Recovery: revert to server proxy

**[094] CSAT submission endpoint and schema**
- Goal: CSAT submission endpoint and schema
- Acceptance Criteria:
  - one response per ticket, signed token verified
- Test Proof: integration
- Dependencies: [082]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: token validation
- Rollback/Recovery: disable endpoint

**[095] CSAT UI for requester (email link/page)**
- Goal: CSAT UI for requester (email link/page)
- Acceptance Criteria:
  - form submits score/comment
- Test Proof: E2E
- Dependencies: [094]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: token required
- Rollback/Recovery: disable page

**[096] SLA calibration tool (what-if simulator)**
- Goal: SLA calibration tool (what-if simulator)
- Acceptance Criteria:
  - simulator returns projected breaches
- Test Proof: unit
- Dependencies: [072]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: remove tool

**[097] Knowledge base link injection based on category**
- Goal: Knowledge base link injection based on category
- Acceptance Criteria:
  - suggestions shown in form
- Test Proof: unit
- Dependencies: [032]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: safe content
- Rollback/Recovery: hide suggestions

**[098] Contract tests for reporting/exports and CSAT against OpenAPI**
- Goal: Contract tests for reporting/exports and CSAT against OpenAPI
- Acceptance Criteria:
  - suite passes
- Test Proof: contract suite
- Dependencies: [085], [090], [094]
- Labels: priority `P2`, area `qa`, type `chore`.
- Security/Edge cases: sanitize fixtures
- Rollback/Recovery: disable suite

**[099] Stop/Go Checkpoint 8 (tasks 087-098)**
- Goal: Stop/Go Checkpoint 8 (tasks 087-098)
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [087], [088], [089], [090], [091], [092], [093], [094], [095], [096], [097], [098]
- Labels: priority `P2`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause

**[100] Accessibility audit and fixes (axe)**
- Goal: Accessibility audit and fixes (axe)
- Acceptance Criteria:
  - axe report zero critical issues
- Test Proof: automated axe
- Dependencies: [029], [087]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: log issues

**[101] Localization framework (i18n keys) groundwork**
- Goal: Localization framework (i18n keys) groundwork
- Acceptance Criteria:
  - keys extracted for major screens
- Test Proof: unit
- Dependencies: [056]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: keep Polish strings

**[102] Captcha fallback for suspicious comment/ticket submissions**
- Goal: Captcha fallback for suspicious comment/ticket submissions
- Acceptance Criteria:
  - captcha triggered after threshold
- Test Proof: integration
- Dependencies: [037]
- Labels: priority `P2`, area `security`, type `feature`.
- Security/Edge cases: protect keys
- Rollback/Recovery: disable captcha

**[103] Reopen approvals for high-priority tickets (agent/admin)**
- Goal: Reopen approvals for high-priority tickets (agent/admin)
- Acceptance Criteria:
  - approval required for WYSOKI/KRYTYCZNY
- Test Proof: integration
- Dependencies: [067]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: role checks
- Rollback/Recovery: bypass approvals

**[104] Report job performance optimizations (indexes, batching)**
- Goal: Report job performance optimizations (indexes, batching)
- Acceptance Criteria:
  - job completes within SLA
- Test Proof: load test
- Dependencies: [090]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: revert index

**[105] Export scheduling (email reports)**
- Goal: Export scheduling (email reports)
- Acceptance Criteria:
  - schedule creates jobs, emails on completion
- Test Proof: integration
- Dependencies: [089], [092]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: unsubscribe support
- Rollback/Recovery: disable scheduler

**[106] `/metrics` endpoint with Prometheus format (API + worker)**
- Goal: `/metrics` endpoint with Prometheus format (API + worker)
- Acceptance Criteria:
  - metrics exposed for key KPIs
- Test Proof: curl output
- Dependencies: [076]
- Labels: priority `P2`, area `ops`, type `chore`.
- Security/Edge cases: auth or IP allowlist
- Rollback/Recovery: disable endpoint

**[107] Alerting rules for SLA breaches/queue lag**
- Goal: Alerting rules for SLA breaches/queue lag
- Acceptance Criteria:
  - alerts fire in staging
- Test Proof: simulated breach
- Dependencies: [106]
- Labels: priority `P2`, area `ops`, type `chore`.
- Security/Edge cases: avoid alert storm
- Rollback/Recovery: mute alerts

**[108] Disaster recovery drill (DB backup/restore)**
- Goal: Disaster recovery drill (DB backup/restore)
- Acceptance Criteria:
  - backup restored in staging
- Test Proof: runbook
- Dependencies: [005]
- Labels: priority `P2`, area `ops`, type `chore`.
- Security/Edge cases: encrypt backups
- Rollback/Recovery: rollback restore

**[109] Environment parity checklist (dev/stage/prod)**
- Goal: Environment parity checklist (dev/stage/prod)
- Acceptance Criteria:
  - checklist approved
- Test Proof: review
- Dependencies: [002]
- Labels: priority `P2`, area `ops`, type `chore`.
- Security/Edge cases: secrets handled
- Rollback/Recovery: update doc

**[110] Performance budget for ticket list/detail**
- Goal: Performance budget for ticket list/detail
- Acceptance Criteria:
  - render under threshold
- Test Proof: Lighthouse
- Dependencies: [046], [088]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: none
- Rollback/Recovery: adjust budget

**[111] Stop/Go Checkpoint 9 (tasks 100-110)**
- Goal: Stop/Go Checkpoint 9 (tasks 100-110)
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [100], [101], [102], [103], [104], [105], [106], [107], [108], [109], [110]
- Labels: priority `P2`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause

**[112] Offline-friendly drafts for ticket/comment forms**
- Goal: Offline-friendly drafts for ticket/comment forms
- Acceptance Criteria:
  - drafts stored locally and restored
- Test Proof: unit/E2E
- Dependencies: [029]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: redact sensitive data
- Rollback/Recovery: disable drafts

**[113] Data retention policies (attachments/comments)**
- Goal: Data retention policies (attachments/comments)
- Acceptance Criteria:
  - policy stored and enforced
- Test Proof: unit
- Dependencies: [068]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: irreversible deletions noted
- Rollback/Recovery: disable enforcement

**[114] Session security enhancements (2FA stub, login attempt logging)**
- Goal: Session security enhancements (2FA stub, login attempt logging)
- Acceptance Criteria:
  - logs recorded
  - 2FA flag stored
- Test Proof: unit
- Dependencies: [030]
- Labels: priority `P2`, area `security`, type `feature`.
- Security/Edge cases: protect secrets
- Rollback/Recovery: disable 2FA flag

**[115] CSAT anti-gaming safeguards (token binding, expiry)**
- Goal: CSAT anti-gaming safeguards (token binding, expiry)
- Acceptance Criteria:
  - expired tokens rejected
- Test Proof: integration
- Dependencies: [095]
- Labels: priority `P2`, area `security`, type `feature`.
- Security/Edge cases: protect tokens
- Rollback/Recovery: extend expiry

**[116] Feature flag system for gradual rollouts**
- Goal: Feature flag system for gradual rollouts
- Acceptance Criteria:
  - flags stored and evaluated
- Test Proof: unit
- Dependencies: [006]
- Labels: priority `P2`, area `ops`, type `chore`.
- Security/Edge cases: default safe
- Rollback/Recovery: disable flags

**[117] End-to-end regression suite expansion (cover new flows)**
- Goal: End-to-end regression suite expansion (cover new flows)
- Acceptance Criteria:
  - suite passes
- Test Proof: `pnpm test:e2e`
- Dependencies: [085], [098]
- Labels: priority `P2`, area `qa`, type `chore`.
- Security/Edge cases: run in isolated env
- Rollback/Recovery: mark flaky

**[118] Performance/load test suite for API + worker**
- Goal: Performance/load test suite for API + worker
- Acceptance Criteria:
  - targets met
- Test Proof: k6/JMeter results
- Dependencies: [110]
- Labels: priority `P2`, area `backend`, type `feature`.
- Security/Edge cases: avoid prod data
- Rollback/Recovery: tune limits

**[119] Documentation hub update (blueprint, runbooks, FAQs)**
- Goal: Documentation hub update (blueprint, runbooks, FAQs)
- Acceptance Criteria:
  - docs published
- Test Proof: review
- Dependencies: [117]
- Labels: priority `P2`, area `docs`, type `chore`.
- Security/Edge cases: no secrets
- Rollback/Recovery: revert docs

**[120] Release checklist for GA**
- Goal: Release checklist for GA
- Acceptance Criteria:
  - checklist approved
- Test Proof: review
- Dependencies: [111], [119]
- Labels: priority `P2`, area `backend`, type `chore`.
- Security/Edge cases: include rollback plan
- Rollback/Recovery: update checklist

**[121] Production smoke test script (post-deploy)**
- Goal: Production smoke test script (post-deploy)
- Acceptance Criteria:
  - script exits green
- Test Proof: run script
- Dependencies: [117]
- Labels: priority `P2`, area `qa`, type `chore`.
- Security/Edge cases: safe creds
- Rollback/Recovery: disable script

**[122] Worker failover plan and chaos test**
- Goal: Worker failover plan and chaos test
- Acceptance Criteria:
  - failover succeeds in test
- Test Proof: chaos drill
- Dependencies: [076]
- Labels: priority `P2`, area `ops`, type `chore`.
- Security/Edge cases: ensure safeguards
- Rollback/Recovery: document gaps

**[123] Final risk review against mitigation map**
- Goal: Final risk review against mitigation map
- Acceptance Criteria:
  - risks closed/accepted
- Test Proof: review
- Dependencies: [120]
- Labels: priority `P2`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: update map

**[124] Stop/Go Checkpoint 10 (tasks 112-123)**
- Goal: Stop/Go Checkpoint 10 (tasks 112-123)
- Acceptance Criteria:
  - sign-off
- Test Proof: checklist
- Dependencies: [112], [113], [114], [115], [116], [117], [118], [119], [120], [121], [122], [123]
- Labels: priority `P2`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: pause release

**[125] Definition of Done confirmation for P2 (all phases)**
- Goal: Definition of Done confirmation for P2 (all phases)
- Acceptance Criteria:
  - DoD checklist signed
  - monitoring on
  - runbooks ready
- Test Proof: checklist
- Dependencies: [124]
- Labels: priority `P2`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: block release until ready

**[126] Stop/Go Checkpoint 11 (final release gate)**
- Goal: Stop/Go Checkpoint 11 (final release gate)
- Acceptance Criteria:
  - final approval recorded
  - release authorized
- Test Proof: checklist
- Dependencies: [125]
- Labels: priority `P2`, area `backend`, type `chore`.
- Security/Edge cases: none
- Rollback/Recovery: delay launch

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
- 012 -> Stop/Go Checkpoint 1 (tasks 001-011)
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
- 024 -> Stop/Go Checkpoint 2 (tasks 013-023)
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
- 036 -> Stop/Go Checkpoint 3 (tasks 025-035)
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
- 048 -> Stop/Go Checkpoint 4 (tasks 037-047)
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
- 061 -> Stop/Go Checkpoint 5 (tasks 049-060)
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
- 074 -> Stop/Go Checkpoint 6 (tasks 062-073)
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
- 086 -> Stop/Go Checkpoint 7 (tasks 075-085)
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
- 099 -> Stop/Go Checkpoint 8 (tasks 087-098)
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
- 111 -> Stop/Go Checkpoint 9 (tasks 100-110)
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
- 124 -> Stop/Go Checkpoint 10 (tasks 112-123)
- 125 -> Definition of Done confirmation for P2 (all phases)
- 126 -> Stop/Go Checkpoint 11 (final release gate)
