# SerwisDesk Evolution Blueprint

This document distills the current repository state and defines an execution-ready plan to evolve it into a full-featured HelpDesk / Service Desk platform. All statements about current behavior reference repository evidence.

## A) Current State Analysis
### Stack & Architecture
- **Framework:** Next.js 16 (App Router) with React 19, TypeScript, Tailwind, NextAuth (JWT sessions), Prisma (PostgreSQL), React Query, Sonner for toasts.
- **Runtime boundaries:** Protected `/app` area enforced by `next-auth` middleware; API routes under `src/app/api` serve tickets, comments, and auth.
- **Server-side data access:** Prisma client singleton with environment-based logging.

### Repository Map
- `src/app`: App Router pages/layouts, API routes, global styles, providers.
- `src/app/api`: REST-like handlers for tickets, ticket updates, comments, NextAuth.
- `src/app/app`: Authenticated UI (dashboard, ticket detail, create form, ticket actions, comment form).
- `src/components`: Shared UI components (Topbar).
- `src/lib`: Prisma client instantiation; NextAuth configuration (credentials provider + Prisma adapter).
- `prisma`: Schema, migrations, seed data for demo org/users/SLAs/tickets.

### Current Capabilities Index
- **Confirmed**
  - Authentication via credentials with Prisma adapter; JWT session carries `role` and `organizationId` for authorization decisions.【F:src/lib/auth.ts†L18-L59】
  - Middleware enforces auth on `/app/*` routes.【F:middleware.ts†L1-L5】
  - Ticket creation API validates input, enforces organization scoping, sets SLA due dates, and logs audit event on create.【F:src/app/api/tickets/route.ts†L8-L68】【F:src/app/api/tickets/route.ts†L76-L112】
  - Ticket update API supports status/priority/assignee changes with role-aware rules and audit logging; requester limited to close/reopen own tickets.【F:src/app/api/tickets/[id]/route.ts†L1-L121】【F:src/app/api/tickets/[id]/route.ts†L129-L194】
  - Comment API allows public/internal comments with role checks and records first response timestamp when an agent posts a public comment.【F:src/app/api/tickets/[id]/comments/route.ts†L7-L49】【F:src/app/api/tickets/[id]/comments/route.ts†L51-L63】
  - Ticket list UI with filters (status, priority, search) and requester scoping; shows quick-create form.【F:src/app/app/page.tsx†L6-L124】【F:src/app/app/page.tsx†L173-L193】
  - Ticket detail UI displays metadata, markdown rendering, comments (internal hidden from requester), status/assignment actions (role-aware), and comment form.【F:src/app/app/tickets/[id]/page.tsx†L1-L128】【F:src/app/app/tickets/[id]/page.tsx†L130-L203】
  - Seed script creates demo org, users (admin/agent/requester), team, tags, SLA policies, sample ticket/comment/audit event.【F:prisma/seed.js†L7-L116】

- **Partial / Fragile**
  - **SLA tracking:** Due dates computed on creation but no background breach detection or pause rules.【F:src/app/api/tickets/route.ts†L86-L109】
  - **Authorization depth:** UI hides internal comments for requesters, but API responses for comments list are not filtered server-side on ticket fetch, relying on UI filtering.【F:src/app/app/tickets/[id]/page.tsx†L72-L90】
  - **Attachments:** Prisma model exists but no upload/download APIs or UI flows present.【F:prisma/schema.prisma†L95-L118】
  - **Audit visibility:** Audit events written but not surfaced in UI or API responses.【F:src/app/api/tickets/route.ts†L100-L107】【F:src/app/api/tickets/[id]/route.ts†L188-L193】
  - **Testing:** Scripts exist but no test files observed; lint/test automation not wired in docs beyond mention.【F:package.json†L5-L31】

- **Not Found (searched via `find src prisma -type f` and inspected API/UI)**
  - Admin console for user/team/tag/SLA management.
  - File storage configuration or services.
  - Reporting/analytics endpoints or UI.
  - Notification system (email/webhook) or SLA breach alerts.
  - Role-based access guard helpers beyond ad hoc session checks.
  - Worker job processor (RESOLVED: Task 1 completed - worker routes SLA jobs)
  - CI/CD pipeline (RESOLVED: Task 2 completed - GitHub Actions workflow added)

## B) Target Directions (Options)
1. **Polished Mono-App Enhancement (Recommended):** Keep Next.js/Prisma stack; deliver full helpdesk features (admin console, attachments, SLA engine, reporting) within current app. Benefits: leverages existing code, minimal migration risk, fastest time-to-value. Risks: need disciplined module boundaries to avoid sprawl.
2. **API-First Service Layer + SPA:** Introduce dedicated service layer (NestJS/Fastify) with typed REST/GraphQL; keep Next.js as SPA consuming APIs. Benefits: clearer domain layer, scalable integrations. Risks: migration overhead, duplicative auth/session handling.
3. **Event-Driven Core with Worker SLA Engine:** Add message bus and workers (e.g., BullMQ) for SLA timers/notifications while keeping current UI/API. Benefits: resilient SLA workflows, async extensibility. Risks: added infra complexity.

**Recommended:** Option 1 with selective worker addition later. It fits current repo size, preserves NextAuth/Prisma investment, and can incrementally add SLA/notification workers without major rewrite.

## C) Future System Blueprint
### Data Model (extend current Prisma)
- **Ticket lifecycle:** Status set remains; add transition rules table? Keep enum but enforce transitions in service layer. Track `responsePaused` flag for SLA pauses (waiting on requester), `escalationLevel`, `dueWarningsSent` (per SLA milestone), `channel` (web/email), `deletedAt` for soft-delete.
- **Assignments:** Maintain `assigneeUserId` / `assigneeTeamId`; add `secondaryAssignees` (through join table) if needed; track `assignmentChangedAt/by` in AuditEvent.
- **Comments:** Public/internal; immutable body with `editedAt` for minor edits; link attachments via Attachment records; redact internal comments from requester queries server-side.
- **Attachments:** Store metadata; support S3/local drivers via storage service abstraction; virus scan hook; link to comments and tickets.
- **SLA:** `SlaPolicy` per priority + category; add `businessHours`, `pauseOnStatus` list; computed fields `firstResponseDue`, `resolveDue`; `SlaBreachEvent` to log breaches.
- **Admin dictionaries:** `Category`, `Subcategory`, `Impact`, `Urgency` to compute priority matrix.

### Authorization & Scoping
- Roles: REQUESTER, AGENT, ADMIN (existing). Add `ORG_ADMIN`? For now ADMIN covers org-level.
- **Scoping rules:**
  - Requester: CRUD own tickets/comments; view only public comments, attachments allowed if own ticket.
  - Agent/Admin: Access all org tickets; can create internal comments, change status/priority/assignments, manage tags.
  - Admin: Manage users/teams/tags/SLA policies; view audit log.
- **Enforcement:** Centralize in server utilities (e.g., `src/lib/authz.ts`) to avoid UI-only checks. API routes must filter comments/attachments server-side and enforce organization ownership on all queries.

### Ticket Workflow
- Allowed transitions:
  - REQUESTER: New → Closed; Resolved/Closed → Reopened.
  - AGENT/ADMIN: Any → W toku/Waiting/On Hold/Resolved/Closed/Reopened with rules; closing sets `closedAt`, resolving sets `resolvedAt`; reopening clears those timestamps.
- Validation: status transitions must align with actor role; cannot reopen if deleted.
- Reopen semantics: Reopened resets SLA resolve countdown (or records restart event) and clears `closedAt`.

### Queues & Assignment
- Default queue is org-level; introduce Team queues. Assignment rules:
  - Auto-assign to team based on category/priority (configurable rule set); optional round-robin for agents in team.
  - Manual assignment via UI for agents/admins.
- Escalation: when SLA warning breached, escalate to higher team/manager; record AuditEvent and notification.

### Collaboration
- Comments: Markdown rendered with sanitization; internal comments hidden from requesters; no deletion, optional edit with audit trail; timestamps, author role badges.
- Audit timeline: Expose audit events (create/update/status/assignment/priority/SLA breach) in ticket detail; immutable, ordered.
- Mention support (future) with notifications.

### Search/Filtering/Pagination
- API endpoints should support pagination, sorting, and filters (status, priority, category, tag, assignee, text search). Use Prisma `cursor`/`skip take`.
- Consider Postgres full-text search indexes on title/description.

### Attachments
- Upload endpoint with size/type limits; virus scan hook; store in `uploads/` (dev) or S3; signed URLs for download with authorization check (ticket membership or role).
- Link attachments to tickets and optionally comments; maintain metadata and uploader.

### SLA Engine
- Definitions: first response (public agent response), resolution (status = Resolved/Closed), with pause when status in `OCZEKUJE_NA_UZYTKOWNIKA` or ticket on hold.
- Computation: on ticket create/update status/priority, recompute due dates; background worker checks due dates and emits warnings/breach events.
- Warning/breach behavior: create AuditEvent, send notification, bump escalation level, optionally auto-change status.

### Admin Configurability
- Admin UI for users, teams, tags, categories, SLA policies; safe updates with validation and audit logging.
- Guard changes with organization scope; prevent deleting entities in use.

### Reporting/Analytics
- Metrics: tickets opened/closed per period, SLA compliance %, average response/resolve time, backlog by status/priority/team, reopen rate, agent workload.
- Provide CSV export endpoints and dashboard cards with cached queries.

### Security Baseline
- Enforce server-side authorization for all entities by organization and role.
- Sanitize Markdown rendering; limit comment lengths; rate-limit auth/ticket/comment endpoints.
- CSRF protection via NextAuth/Next.js defaults; ensure `HttpOnly` cookies and secure session secret handling.
- Input validation via Zod on all APIs.

### Operations
- Env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, storage configs (`S3_*` or local path), `SMTP_*` for notifications, `RATE_LIMIT_*`.
- Migrations: Prisma migrations for new fields/tables; seed for admin defaults.
- Observability: add structured logging, request IDs, metrics hooks (OpenTelemetry) in API handlers.

### Testing Strategy
- Unit: authz helpers, SLA calculators, validation schemas.
- Integration: API routes for tickets/comments/attachments with session mocks.
- E2E: Playwright flows for login, create ticket, comment, status change, attachment upload.
- Fixtures: Seeded database with org/users/teams/SLA for reproducible tests.

## D) Gap Analysis (from current → target)
| Area | Current Evidence | Gap/Impact | Proposed Approach | Priority |
| --- | --- | --- | --- | --- |
| Authorization consistency | Session checks in APIs; UI filters comments client-side only.【F:src/app/app/tickets/[id]/page.tsx†L72-L90】 | Risk of data leakage via direct API access. | Add authz helper to filter comments/attachments server-side; enforce org scope in all queries. | P0 |
| Attachments | Model only; no API/UI.【F:prisma/schema.prisma†L95-L118】 | Missing core feature; cannot share files. | Build upload/download APIs with storage abstraction and UI components. | P0 |
| Admin panel | RESOLVED: Admin UI implemented for users/teams/SLA/automation【F:src/app/app/admin/】 | N/A - implemented | N/A | ✅ |
| SLA enforcement | Due dates set but no monitoring.【F:src/app/api/tickets/route.ts†L86-L109】 | No warnings/breach detection; weak compliance. | Implement background worker + audit/notifications; pause logic. | P1 |
| Audit visibility | Audit events written only; not displayed.【F:src/app/api/tickets/[id]/route.ts†L188-L193】 | Limited traceability. | Expose audit timeline on ticket detail and admin log. | P1 |
| Reporting | RESOLVED: Reporting endpoints, KPI cards, and CSV exports implemented【F:src/app/api/reports/】 | N/A - implemented | N/A | ✅ |
| Testing | No tests present; scripts only.【F:package.json†L5-L31】 | Low confidence; regressions likely. | Add unit/integration/E2E suites; wire to CI. | P0 |
| Notifications | RESOLVED: Email adapter implemented with nodemailer support (Agent 1)【F:src/lib/email-adapter-real.ts】 | N/A - implemented | N/A | ✅ |
| Search/pagination | Basic filters, no pagination; search uses non-existent `description` field.【F:src/app/app/page.tsx†L38-L62】 | Performance issues with large data; search bug. | Add pagination and correct field search (`descriptionMd`). | P0 |
| Security hardening | No rate limits; comment body unsanitized in render context (ReactMarkdown default). | Potential abuse/XSS. | Add rate limiting, rehype-sanitize, and stricter validation. | P0 |
| Worker job processor | RESOLVED: Worker routes SLA jobs to handlers (Task 1)【F:src/worker/index.ts】 | N/A - implemented | N/A | ✅ |
| CI/CD pipeline | RESOLVED: GitHub Actions workflow added (Task 2)【F:.github/workflows/ci.yml】 | N/A - implemented | N/A | ✅ |
| Documentation accuracy | Partially resolved: contradictions.md updated, current-state.md updated (Task 7) | Some docs still claim missing features | Complete Task 7 - update gap analysis and mark backlog items | P1 |

## E) Execution Plan (Dependency-Driven)
1. **Foundation: AuthZ & Data Guardrails**
   - **Purpose:** Eliminate data leakage and centralize permissions.
   - **Dependencies:** Existing NextAuth session; Prisma models.
   - **Impacted Areas:** New `src/lib/authz.ts`; update API routes for tickets/comments; ticket page loader.
   - **Acceptance:** All ticket/comment queries enforce org scope and role visibility server-side; requester cannot fetch internal comments or other users’ tickets; automated tests cover forbidden cases.
   - **Tests:** API integration tests for access scenarios; Playwright check that requester cannot see internal comments even via direct fetch.
   - **Security/Egdes:** Verify UUID validation; ensure 403/404 responses consistent.

2. **Attachments Service**
   - **Purpose:** Enable secure file sharing.
   - **Dependencies:** AuthZ foundation; storage config envs.
   - **Impacted Areas:** New API routes `/api/tickets/:id/attachments`; Prisma update for comment relation; UI uploader on ticket detail/comment form.
   - **Acceptance:** Users can upload/download attachments within auth scope; size/type limits enforced; metadata stored; internal comments keep attachments hidden from requesters.
   - **Tests:** Integration tests for upload/download authorization; E2E upload flow; unit tests for storage adapter.
   - **Security/Egdes:** Virus scan hook stub; signed URL expiry; reject dangerous MIME types.

3. **Admin Console (Users/Teams/Tags/SLA/Categories)**
   - **Purpose:** Self-service configuration.
   - **Dependencies:** AuthZ foundation.
   - **Impacted Areas:** New `/app/admin` pages; API CRUD routes; Prisma migrations for categories if added.
   - **Acceptance:** ADMIN can list/create/update/delete org-scoped entities; validation prevents deleting in-use records; actions recorded in audit log.
   - **Tests:** Integration tests for CRUD; UI tests for admin flows.
   - **Security/Egdes:** Guard by role; ensure org isolation on all operations.

4. **SLA Engine & Escalations**
   - **Purpose:** Enforce response/resolve commitments.
   - **Dependencies:** Admin-configured SlaPolicies; Audit logging.
   - **Impacted Areas:** Background worker (cron/queue), API updates to pause/resume timers on status change, UI indicators on tickets.
   - **Acceptance:** Due dates computed using business hours; warnings and breach events emitted and stored; status pause on “waiting for user”; first response detection validated.
   - **Tests:** Unit tests for SLA calculator; integration test simulating time advancements; worker job tests.
   - **Security/Egdes:** Ensure worker respects org scope; idempotent job processing.

5. **Audit Timeline UI**
   - **Purpose:** Increase traceability.
   - **Dependencies:** Existing AuditEvent data; AuthZ foundation.
   - **Impacted Areas:** Ticket detail page; new `/api/tickets/:id/audit` endpoint.
   - **Acceptance:** Timeline shows creation, status/priority/assignment changes, SLA warnings/breaches; requesters see only permissible events; data immutable.
   - **Tests:** API tests for filtering; UI snapshot/Playwright validation.

6. **Search, Filters, Pagination**
   - **Purpose:** Scalability of ticket list.
   - **Dependencies:** API adjustments.
   - **Impacted Areas:** Ticket list API/UI; Prisma queries with cursors; optional Postgres FTS index migration.
   - **Acceptance:** Ticket list supports pagination and multi-filter; search uses descriptionMd; performance acceptable under large dataset (load test baseline).
   - **Tests:** Integration tests for pagination correctness; UI tests for filter persistence.

7. **Notifications (Email/Webhook)** ✅
   - **Purpose:** Keep stakeholders informed.
   - **Status:** Email adapter implemented with nodemailer support. Real SMTP sending ready for Agent 1 implementation.
   - **Dependencies:** SLA engine events; audit events.
   - **Impacted Areas:** Notification service module; env-driven SMTP/webhook settings; templates.
   - **Acceptance:** Email sent on assignment, public comment, status change, SLA warning/breach; opt-in for requester; failures logged without blocking.
   - **Tests:** Unit tests with mocked transport; integration test capturing outgoing payload. ✅ Test coverage added.

8. **Reporting Dashboard** ✅
   - **Purpose:** Provide KPIs and exports.
   - **Status:** Reporting endpoints, KPI cards (MTTR, MTTA, reopen rate), and CSV exports implemented.
   - **Dependencies:** Accurate audit data; pagination/search.
   - **Impacted Areas:** New reporting APIs; UI charts/tables; CSV export.
   - **Acceptance:** Metrics (opened/closed, SLA compliance, response/resolve times, backlog, workload) displayed with selectable ranges; CSV download works.
   - **Tests:** Unit tests for aggregation queries; UI screenshot tests. ✅ Implemented.

9. **Testing & CI Hardening**
   - **Purpose:** Prevent regressions.
   - **Dependencies:** Test fixtures/seed; existing scripts.
   - **Impacted Areas:** Add Vitest/Playwright suites; GitHub Actions workflow.
   - **Acceptance:** CI runs lint + unit + integration + e2e (tagged) on PR; coverage for critical paths (auth, ticket CRUD, comments, attachments, SLA calc).
   - **Security/Egdes:** Secrets masked in CI; ephemeral DB for tests.

10. **Observability & Operations**
   - **Purpose:** Reliable production ops.
   - **Dependencies:** Logging hooks in APIs; worker setup.
   - **Impacted Areas:** Request logging, error tracking integration, health checks, migrations tooling, env documentation.
   - **Acceptance:** Structured logs with request IDs; basic metrics; `/health` endpoint; documented runbooks for migrate/rollback; Dockerfile + docker-compose.
   - **Tests:** Manual/automated checks for health endpoint; linting of configs.

## Quality Gate: Evidence-Backed Current State Claims
1. NextAuth credentials provider with bcrypt verification and JWT session enrichment.【F:src/lib/auth.ts†L18-L59】
2. Prisma client singleton with dev logging.【F:src/lib/prisma.ts†L1-L12】
3. Middleware protects `/app/*`.【F:middleware.ts†L1-L5】
4. Root page redirects unauthenticated users to login, others to `/app`.【F:src/app/page.tsx†L1-L10】
5. Login form uses client-side signIn and displays errors/spinner state.【F:src/app/login/page.tsx†L1-L66】
6. Authenticated layout renders Topbar with user info and logout button.【F:src/app/app/layout.tsx†L1-L17】【F:src/components/topbar.tsx†L1-L19】
7. Ticket list fetches Prisma data scoped by role and supports filters and search; includes quick-create form.【F:src/app/app/page.tsx†L32-L171】
8. Ticket form validates lengths, toggles markdown preview, and handles API errors with toasts.【F:src/app/app/ticket-form.tsx†L8-L117】
9. Ticket detail hides internal comments from requesters client-side.【F:src/app/app/tickets/[id]/page.tsx†L72-L90】
10. Ticket actions enforce role-based status/assignment options and PATCH via API.【F:src/app/app/tickets/[id]/ticket-actions.tsx†L1-L130】
11. Comment form allows internal flag for agents/admins and posts to API.【F:src/app/app/tickets/[id]/comment-form.tsx†L1-L44】
12. Ticket creation API sets SLA due dates using SlaPolicy per priority.【F:src/app/api/tickets/route.ts†L86-L109】
13. Ticket update API records audit events with change diffs.【F:src/app/api/tickets/[id]/route.ts†L171-L193】
14. Comment API marks first response timestamp when agent posts public comment.【F:src/app/api/tickets/[id]/comments/route.ts†L51-L63】
15. Prisma schema defines roles, ticket statuses/priorities, and relationships for tags, attachments, audit events, SLA policies.【F:prisma/schema.prisma†L1-L191】
16. Seed script provisions demo organization, users, team, tags, SLA policies, sample ticket/comment/audit.【F:prisma/seed.js†L7-L116】
17. Package scripts include dev/build/lint/test and prisma commands.【F:package.json†L5-L31】
18. Ticket search currently references `description` field (bug; actual column `descriptionMd`).【F:src/app/app/page.tsx†L54-L61】
19. API ticket list scopes requester to own tickets else org-wide.【F:src/app/api/tickets/route.ts†L21-L37】
20. Ticket update forbids requester from changing priority/assignee and restricts status transitions.【F:src/app/api/tickets/[id]/route.ts†L60-L96】

## Top Risks & Mitigations
1. **Authorization gaps exposing internal data.** Mitigation: central authz layer, server-side filtering, integration tests (Plan step 1).
2. **Missing attachments causing user churn.** Mitigation: implement storage abstraction and UI (Plan step 2).
3. **SLA non-compliance due to lack of monitoring.** Mitigation: worker-based SLA engine with warnings/escalations (Plan step 4).
4. **Admin configuration via DB edits leading to errors.** Mitigation: admin console with validation/audit (Plan step 3).
5. **Search bug/performance on large datasets.** Mitigation: fix field, add pagination and indexes (Plan step 6).
6. **Data tampering without audit visibility.** Mitigation: expose audit timeline and protect immutability (Plan step 5).
7. **Security vulnerabilities (XSS, rate abuse).** Mitigation: sanitize markdown, add rate limiting and validation (Plan steps 1 & 10).
8. **Operational incidents due to lack of observability.** Mitigation: structured logging, health checks, metrics (Plan step 10).
9. **Notification gaps reduce engagement.** Mitigation: email/webhook notifications tied to key events (Plan step 7).
10. **Lack of automated tests causing regressions.** Mitigation: build unit/integration/e2e suites and CI (Plan step 9).

