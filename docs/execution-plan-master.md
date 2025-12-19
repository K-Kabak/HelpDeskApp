# Execution Plan Master

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
Phases: Phase 0 (foundation/readiness), MVP (P0), V1 (P1), V2 (P2). Tasks are dependency-ordered; stop/go checkpoints appear every 10–15 tasks. Each task lists goal, dependencies, impacted areas, acceptance, test proof, security/edge cases, and rollback.

## Definition of Done per phase
- **Phase 0:** Tooling, test harness, and failing regressions captured; no prod changes; CI green on lint/test skeleton.
- **MVP (P0):** Comment API live, search/pagination fixed, SLA stamping wired, audits/logging in place, core E2E green.
- **V1 (P1):** Attachments, admin CRUD, queues/notifications, SLA jobs live with tests and monitoring.
- **V2 (P2):** Reporting/analytics, retention/compliance, DR/observability, UX polish for scalability.

## Phase 0 tasks (15)
- PH0-01 Setup toolchain — deps: none; impacted: tooling/docs; acceptance: `pnpm install` succeeds and versions pinned; test proof: install log + `pnpm -v`; security/edge: keep `.env.local` gitignored; rollback: remove temp PATH notes.
- PH0-02 Verify Postgres connectivity/seed — deps: PH0-01; impacted: DB; acceptance: `pnpm prisma migrate dev --create-only` dry-run + `pnpm prisma db seed` succeed; test proof: prisma exit 0 and sample ticket present; security/edge: no production DB touched; rollback: drop local DB.
- PH0-03 Baseline lint/unit run — deps: PH0-01; impacted: CI; acceptance: `pnpm lint` and `pnpm test` executed with results recorded; test proof: command output; security/edge: none; rollback: n/a.
- PH0-04 Add `.env.example` with safe placeholders — deps: PH0-02; impacted: docs/onboarding; acceptance: example contains required keys without secrets; test proof: diff reviewed; security/edge: verify no real secrets; rollback: delete file.
- PH0-05 Add API test harness with auth/session helper — deps: PH0-03; impacted: tests/lib; acceptance: helper can issue authenticated requests in tests; test proof: sample test using helper passes; security/edge: ensure mock secrets; rollback: revert helper.
- PH0-06 Add failing regression test for dashboard search column bug — deps: PH0-05; impacted: tests/dashboard; acceptance: test asserts `descriptionMd` search and currently fails; test proof: red test documented; security/edge: none; rollback: skip test.
- PH0-07 Add failing regression test for missing comments API — deps: PH0-05; impacted: tests/comments; acceptance: POST to `/api/tickets/:id/comments` returns 404 expectation; test proof: red test; security/edge: none; rollback: skip test.
- PH0-08 Add failing regression test for unbounded ticket list (missing pagination) — deps: PH0-05; impacted: tests/api; acceptance: test expects pagination metadata; test proof: red test; security/edge: none; rollback: skip test.
- PH0-09 Create SLA fixtures (tickets with varying priorities/status) — deps: PH0-02; impacted: tests/seed; acceptance: fixture factory generates tickets/comments with SLA fields; test proof: factory used in tests; security/edge: keep fixture creds fake; rollback: remove fixtures.
- PH0-10 Create test data factory for users/teams/tickets — deps: PH0-09; impacted: tests; acceptance: reusable factory functions exist; test proof: sample test uses factory; security/edge: none; rollback: remove factory.
- PH0-11 Add CI pipeline stub (lint + unit) — deps: PH0-03; impacted: CI; acceptance: workflow file runs lint/test; test proof: CI dry-run or local act run; security/edge: no secrets hardcoded; rollback: remove workflow.
- PH0-12 Add coding standards doc (validation, auth, audit expectations) — deps: PH0-03; impacted: docs; acceptance: doc checked in; test proof: doc present; security/edge: none; rollback: delete doc.
- PH0-13 Add accessibility lint rule baseline for forms — deps: PH0-03; impacted: lint config/UI; acceptance: lint warns on missing labels; test proof: lint output; security/edge: none; rollback: revert config.
- PH0-14 Validate NextAuth env keys present locally — deps: PH0-04; impacted: env; acceptance: checklist updated; test proof: doc update; security/edge: avoid real values; rollback: revert doc.
- PH0-15 Stop/Go checkpoint — deps: PH0-01…PH0-14; impacted: planning; acceptance: red tests captured, tooling ready; test proof: checkpoint note; security/edge: none; rollback: n/a.

## MVP (P0) tasks (35)
- P0-01 Fix dashboard search to use `descriptionMd`/title with safe validation — deps: PH0-06; impacted: dashboard/API; acceptance: search returns matching tickets without Prisma error; test proof: PH0-06 turns green; security/edge: avoid SQL wildcards; rollback: restore previous query.
- P0-02 Add pagination parameters (take/skip, defaults/max) to `/api/tickets` — deps: PH0-08; impacted: API; acceptance: API responds with `meta.total` and bounded page size; test proof: pagination tests pass; security/edge: cap max page; rollback: remove pagination logic.
- P0-03 Implement POST `/api/tickets/[id]/comments` with Zod validation and org/role scoping — deps: PH0-07, P0-05; impacted: API/DB; acceptance: agents/admins can add internal/public, requesters public only; test proof: unit + integration; security/edge: body length limits, HTML sanitize Markdown; rollback: disable route.
- P0-04 Stamp SLA fields on comment/status changes (firstResponseAt, resolveDue recalculation) — deps: P0-03; impacted: API/DB; acceptance: first agent/internal comment sets firstResponseAt once; test proof: SLA tests; security/edge: timezone-safe; rollback: feature flag to bypass stamping.
- P0-05 Introduce shared authorization helper enforcing org ownership + role permissions — deps: PH0-05; impacted: API; acceptance: tickets/comments use helper; test proof: permission tests; security/edge: default deny; rollback: revert helper wiring.
- P0-06 Implement GET `/api/tickets/[id]/comments` with role-based filtering of internal notes — deps: P0-05; impacted: API; acceptance: requesters see only public; test proof: role tests; security/edge: org check; rollback: disable route.
- P0-07 Refactor ticket detail loader to consume comments API and handle loading/error states — deps: P0-06; impacted: UI; acceptance: detail page renders comments via API with skeleton/error toast; test proof: E2E; security/edge: hide internal notes for requesters; rollback: switch back to direct include.
- P0-08 Update comment form to new API with optimistic state + 401/403/429 handling — deps: P0-03, P0-06; impacted: UI; acceptance: double-submit blocked, toasts on errors; test proof: E2E; security/edge: debounce; rollback: revert form handler.
- P0-09 Add dashboard pagination UI + meta display; wire query params to API — deps: P0-02; impacted: UI; acceptance: paginated results with navigation; test proof: E2E pagination; security/edge: validate params server-side; rollback: hide pagination controls.
- P0-10 Add audit events for comment create/edit/delete and assignment changes — deps: P0-03, P0-05; impacted: DB/API; acceptance: audit records stored with actor and data; test proof: audit tests; security/edge: redact bodies? keep Markdown sanitized; rollback: bypass audit for comments.
- P0-11 Add DB indexes on ticket createdAt/status/priority for pagination — deps: P0-02; impacted: DB; acceptance: migration applied; test proof: Prisma migration; security/edge: downtime window noted; rollback: drop index migration.
- P0-12 Add structured logging/metrics on ticket/comment routes (latency, status codes) — deps: P0-02, P0-03; impacted: observability; acceptance: logs emit fields, metrics recorded; test proof: log sample; security/edge: avoid PII; rollback: disable logger.
- P0-13 Add rate limiting on ticket/comment mutations — deps: P0-12; impacted: API; acceptance: bursts limited with 429; test proof: rate limit test; security/edge: IP/user scope; rollback: disable limiter.
- P0-14 Add unit tests for comment validation and authorization — deps: P0-03, P0-05; impacted: tests; acceptance: tests cover requester vs agent paths; test proof: passing tests; security/edge: none; rollback: skip tests.
- P0-15 Add integration tests for ticket pagination/search filters — deps: P0-01, P0-02; impacted: tests; acceptance: endpoints verified with fixtures; test proof: green tests; security/edge: none; rollback: skip tests.
- P0-16 Add E2E for ticket create + comment (public/internal) and visibility rules — deps: P0-06, P0-08; impacted: tests/UI; acceptance: Playwright flow passes; test proof: E2E run; security/edge: reset DB per test; rollback: quarantine test.
- P0-17 Render SLA badges (due/breach) on dashboard and detail — deps: P0-04; impacted: UI; acceptance: SLA chips show due timestamps/breach; test proof: snapshot/E2E; security/edge: avoid leaking other org data; rollback: hide badges.
- P0-18 Hook firstResponseAt stamping from comments route (idempotent) — deps: P0-03, P0-04; impacted: API; acceptance: first agent/internal/public comment sets timestamp once; test proof: SLA tests; security/edge: none; rollback: guard to skip stamping.
- P0-19 Add requester close/reopen tests on update API — deps: P0-05; impacted: tests; acceptance: requester cannot change priority/assignee; test proof: green tests; security/edge: none; rollback: skip test.
- P0-20 Stop/Go checkpoint after comment/pagination rollout — deps: P0-01…P0-19; impacted: release; acceptance: stakeholders approve moving to attachments/admin; test proof: checkpoint note; security/edge: none; rollback: stay on MVP fixes.
- P0-21 Harden unauthenticated handling (401 redirects + toast) for protected pages — deps: P0-07; impacted: UI; acceptance: unauthenticated redirected to `/login` with message; test proof: E2E; security/edge: no open redirect; rollback: revert middleware handling.
- P0-22 Document API contract for tickets/comments (OpenAPI/README) — deps: P0-06; impacted: docs; acceptance: doc published; test proof: doc exists; security/edge: avoid secrets; rollback: remove doc.
- P0-23 Expand seed data to include 50+ tickets/comments for pagination tests — deps: P0-02; impacted: seed; acceptance: seed creates additional data; test proof: seed run; security/edge: synthetic data only; rollback: revert seed.
- P0-24 Add search parameter sanitization and length limits — deps: P0-01; impacted: API; acceptance: q length capped and trimmed; test proof: unit tests; security/edge: avoid regex DoS; rollback: loosen limits.
- P0-25 Expose search/pagination filters in API (status, priority, q) consistently — deps: P0-02; impacted: API; acceptance: filters documented and enforced; test proof: integration tests; security/edge: validate enums; rollback: revert schema.
- P0-26 Align dashboard filters with API (status/priority select) and preserve selections — deps: P0-25; impacted: UI; acceptance: filters persist across navigation; test proof: E2E; security/edge: encode params; rollback: remove persistence.
- P0-27 Publish client collection (Postman/Insomnia) for ticket/comment endpoints — deps: P0-22; impacted: docs/devex; acceptance: collection exported; test proof: file present; security/edge: scrub tokens; rollback: delete collection.
- P0-28 Add empty/error state designs for comments/pagination — deps: P0-07; impacted: UI; acceptance: UX reviewed; test proof: snapshots; security/edge: none; rollback: revert components.
- P0-29 Add `meta` pagination block to API responses and adapt UI — deps: P0-02; impacted: API/UI; acceptance: responses include count/hasNext; test proof: contract tests; security/edge: none; rollback: remove meta.
- P0-30 Stop/Go checkpoint after stability/perf validation — deps: P0-21…P0-29; impacted: release; acceptance: metrics and E2E green; test proof: checkpoint note; security/edge: none; rollback: stay on MVP.
- P0-31 Add response redaction middleware for errors (no stack/PII) — deps: P0-12; impacted: API; acceptance: 500 responses sanitized; test proof: error tests; security/edge: ensure logging still captures stack; rollback: remove middleware.
- P0-32 Add concurrency test to prevent duplicate comment submissions — deps: P0-03; impacted: tests/API; acceptance: double-post creates single comment; test proof: integration; security/edge: use idempotency token; rollback: disable token check.
- P0-33 Update user-facing docs for MVP workflows (create/update/comment) — deps: P0-08; impacted: docs; acceptance: README/docs updated; test proof: doc exists; security/edge: no credentials; rollback: revert doc.
- P0-34 Add accessibility review for new pagination/comment UI — deps: P0-28; impacted: UI; acceptance: labels/focus order fixed; test proof: lint/E2E; security/edge: none; rollback: revert tweaks.
- P0-35 MVP Definition of Done review/sign-off — deps: P0-01…P0-34; impacted: release; acceptance: DoD checklist met; test proof: sign-off note; security/edge: none; rollback: reopen tasks.

## V1 (P1) tasks (35)
- P1-01 Enable comment edit/delete with audit trail and visibility rules — deps: P0-10; impacted: API/UI; acceptance: edit window enforced; test proof: unit/E2E; security/edge: role check; rollback: disable edit/delete.
- P1-02 Build SLA service to recompute breach flags on status/priority/comment events — deps: P0-04; impacted: API/jobs; acceptance: tickets show breach flags; test proof: SLA tests; security/edge: clock skew handled; rollback: disable recalculation.
- P1-03 Implement queue endpoints (My, Unassigned, SLA risk, Team) with filters — deps: P0-25; impacted: API/UI; acceptance: queues return paginated lists; test proof: integration; security/edge: org scoping; rollback: disable endpoints.
- P1-04 Add permission tests for queue assignment (agent/admin only) — deps: P1-03; impacted: tests; acceptance: requester blocked; test proof: green tests; security/edge: none; rollback: skip tests.
- P1-05 Enforce org scoping middleware across new endpoints (queues/comments/attachments) — deps: P0-05; impacted: API; acceptance: centralized guard used; test proof: penetration tests; security/edge: default deny; rollback: revert middleware.
- P1-06 Expand audit logging for assignment changes/admin actions — deps: P0-10; impacted: DB; acceptance: audit entries include actor/object; test proof: audit tests; security/edge: redact PII; rollback: disable audit hook.
- P1-07 Build admin CRUD APIs for users/teams/tags — deps: P0-05; impacted: API/DB; acceptance: CRUD honors role + org; test proof: integration; security/edge: prevent self-demotion issues; rollback: disable routes.
- P1-08 Add pagination/sorting to queues with SLA/priority ordering — deps: P1-03; impacted: API/UI; acceptance: queue responses sorted; test proof: integration; security/edge: cap page size; rollback: revert sorting.
- P1-09 Add migration for `lastPublicCommentAt`/`lastActivityAt` fields — deps: P0-04; impacted: DB; acceptance: columns added/backfilled; test proof: migration run; security/edge: lock time; rollback: drop columns.
- P1-10 Implement attachment upload API with size/mime validation — deps: P0-12; impacted: API/storage; acceptance: uploads limited by mime/size; test proof: integration; security/edge: limit types; rollback: disable route.
- P1-11 Implement attachment download with signed URLs and TTL — deps: P1-10; impacted: API/storage; acceptance: signed URLs expire; test proof: unit; security/edge: org check before signing; rollback: disable signing.
- P1-12 Add malware scanning hook/quarantine flow for uploads — deps: P1-10; impacted: security; acceptance: scan executed, quarantine table; test proof: mock scan test; security/edge: disallow on fail; rollback: bypass scan.
- P1-13 Add attachment delete + quota enforcement + audit — deps: P1-10; impacted: API/DB; acceptance: delete records, adjust storage usage; test proof: integration; security/edge: only uploader/agent/admin; rollback: disable delete.
- P1-14 Update UI to show attachments list/upload/delete with progress — deps: P1-10; impacted: UI; acceptance: attachments visible, upload errors surfaced; test proof: E2E; security/edge: hide internal attachments from requesters; rollback: hide UI.
- P1-15 Add E2E for attachment upload/download permissions — deps: P1-14; impacted: tests; acceptance: requester sees only allowed files; test proof: E2E; security/edge: reset storage after test; rollback: quarantine test.
- P1-16 Build job runner skeleton for SLA breach scanning and notification trigger — deps: P1-02; impacted: jobs; acceptance: cron/job executes and logs; test proof: job test; security/edge: bounded batch size; rollback: disable cron.
- P1-17 Add metrics/alerts for job execution time/failures — deps: P1-16; impacted: observability; acceptance: alerts configured; test proof: simulated failure triggers alert; security/edge: no secrets in logs; rollback: disable alerts.
- P1-18 Implement email notification templates (assignment/status/mention/SLA) — deps: P1-16; impacted: notifications; acceptance: templates rendered with placeholders; test proof: snapshot tests; security/edge: avoid PII leakage; rollback: disable notifications.
- P1-19 Add user notification preferences (channels/on-off) — deps: P1-18; impacted: DB/UI; acceptance: per-user prefs stored/enforced; test proof: integration; security/edge: default opt-in/opt-out confirmed; rollback: default to minimal notifications.
- P1-20 Add notification throttling/batching to avoid spam — deps: P1-18; impacted: jobs; acceptance: batching rules enforced; test proof: rate tests; security/edge: avoid drops; rollback: disable batching.
- P1-21 Backfill/migrate existing tickets with new SLA/activity fields — deps: P1-09; impacted: DB; acceptance: script completes; test proof: migration logs; security/edge: backup before; rollback: restore backup.
- P1-22 Load test job + API interaction to ensure no perf regressions — deps: P1-16; impacted: perf; acceptance: throughput metrics within SLO; test proof: load-test report; security/edge: use non-prod data; rollback: rollback infra configs.
- P1-23 Build admin UI for SLA policies CRUD — deps: P1-07; impacted: UI/API; acceptance: admins can add/update/delete policies; test proof: E2E; security/edge: org scoping; rollback: hide UI.
- P1-24 Build admin UI for users/teams/tags CRUD — deps: P1-07; impacted: UI; acceptance: CRUD flows working with validation; test proof: E2E; security/edge: role guard; rollback: hide UI.
- P1-25 Add saved filters for dashboards/queues (per user) — deps: P0-25; impacted: DB/UI; acceptance: user can save/apply filter; test proof: integration; security/edge: org isolation; rollback: disable feature.
- P1-26 Implement @mention detection and mention table for notifications — deps: P1-18; impacted: API; acceptance: mentions parsed, notifications sent; test proof: unit; security/edge: sanitize Markdown; rollback: disable mentions.
- P1-27 Enforce internal comment visibility in UI (badges, hide for requester) — deps: P0-06; impacted: UI; acceptance: requesters never see internal; test proof: E2E; security/edge: server-side filter; rollback: hide internal notes entirely.
- P1-28 Add agent productivity basic report (tickets closed, SLA hit) — deps: P1-02; impacted: reporting; acceptance: report endpoints return metrics; test proof: integration; security/edge: org scoping; rollback: disable endpoint.
- P1-29 Add API contract tests for attachments endpoints — deps: P1-10; impacted: tests; acceptance: tests validate mime/size/auth; test proof: green tests; security/edge: none; rollback: skip tests.
- P1-30 Stop/Go checkpoint after attachments/notifications — deps: P1-01…P1-29; impacted: release; acceptance: stakeholders approve; test proof: checkpoint note; security/edge: none; rollback: hold release.
- P1-31 Accessibility pass for new UIs (attachments/admin/queues) — deps: P1-14, P1-24; impacted: UI; acceptance: WCAG checks fixed; test proof: lint/E2E; security/edge: none; rollback: revert styling.
- P1-32 Add offline/timeout handling for uploads (resume/cancel) — deps: P1-10; impacted: UI; acceptance: cancel/resume works; test proof: integration; security/edge: ensure signed URLs refreshed; rollback: disable resume.
- P1-33 Add SLA breach banner + actions (escalate) on ticket detail — deps: P1-02; impacted: UI; acceptance: banner shows on breach; test proof: E2E; security/edge: role gate escalate; rollback: hide banner.
- P1-34 Add multi-tenant isolation tests for attachments/queues/notifications — deps: P1-05; impacted: tests; acceptance: cross-org access blocked; test proof: tests; security/edge: none; rollback: skip tests.
- P1-35 V1 Definition of Done review/sign-off — deps: P1-01…P1-34; impacted: release; acceptance: DoD checklist met; test proof: sign-off note; security/edge: none; rollback: reopen items.

## V2 (P2) tasks (35)
- P2-01 Build reporting endpoints (backlog, inflow/outflow, SLA compliance) with CSV export — deps: P1-28; impacted: reporting/API; acceptance: endpoints return aggregates; test proof: integration; security/edge: org scoping; rollback: disable exports.
- P2-02 Expand observability dashboards (APM/metrics for API + jobs) — deps: P0-12, P1-17; impacted: ops; acceptance: dashboards live; test proof: screenshot/logs; security/edge: scrub PII; rollback: remove dashboards.
- P2-03 Add trend reports (reopen rate, MTTA/MTTR per team) — deps: P2-01; impacted: reporting; acceptance: charts/tables render; test proof: integration; security/edge: org scoping; rollback: hide report.
- P2-04 Add notification retry/DLQ + monitoring — deps: P1-18; impacted: jobs; acceptance: failed messages retried with cap; test proof: simulated failure; security/edge: avoid infinite loops; rollback: disable retry.
- P2-05 Implement backup/restore runbook and tested restore — deps: P1-21; impacted: ops; acceptance: documented restore with success proof; test proof: restore drill; security/edge: protect backup secrets; rollback: n/a.
- P2-06 Add PII-safe export with field redaction controls — deps: P2-01; impacted: reporting; acceptance: export respects redaction; test proof: tests; security/edge: watermark exports; rollback: disable export.
- P2-07 Implement attachment retention/expiry policy per org — deps: P1-13; impacted: storage; acceptance: expired files purged after policy; test proof: job test; security/edge: legal hold respected; rollback: pause purge.
- P2-08 Add audit/comment retention + purge job with exemptions — deps: P2-07; impacted: DB; acceptance: retention policies enforced; test proof: job test; security/edge: maintain legal hold; rollback: disable job.
- P2-09 Add admin controls for report scopes (team/org/date) and roles — deps: P2-01; impacted: UI; acceptance: controls enforced; test proof: E2E; security/edge: least privilege; rollback: hide controls.
- P2-10 Add legal hold/purge hooks for attachments/comments — deps: P2-07; impacted: storage/policy; acceptance: legal hold flag blocks purge; test proof: tests; security/edge: audit hold; rollback: clear flag.
- P2-11 Implement per-org API rate limit configuration — deps: P0-13; impacted: API; acceptance: limits configurable; test proof: config test; security/edge: defaults safe; rollback: revert config.
- P2-12 Accessibility review for reporting/admin dashboards — deps: P2-03, P2-09; impacted: UI; acceptance: WCAG fixes; test proof: lint/E2E; security/edge: none; rollback: revert tweaks.
- P2-13 Add Kanban/board view for queues with drag-drop assignments — deps: P1-03; impacted: UI/API; acceptance: assignments persist; test proof: E2E; security/edge: role guard; rollback: disable board.
- P2-14 Conduct disaster recovery drill (DB + storage) — deps: P2-05; impacted: ops; acceptance: RTO/RPO met; test proof: drill log; security/edge: scrub data; rollback: schedule redo.
- P2-15 Define error budgets/SLOs for API latency and job completion — deps: P2-02; impacted: ops; acceptance: SLO docs/alerts; test proof: alert firing on breach; security/edge: none; rollback: disable SLO alerts.
- P2-16 Add multi-region attachment storage option and config — deps: P1-10; impacted: storage; acceptance: bucket config documented; test proof: upload in region; security/edge: cross-region access control; rollback: disable secondary region.
- P2-17 Add knowledge base/FAQ linking to tickets (optional) — deps: P1-24; impacted: UI; acceptance: link field stored; test proof: integration; security/edge: sanitize URLs; rollback: hide field.
- P2-18 Add advanced saved dashboards (custom widgets per user) — deps: P2-03; impacted: UI/DB; acceptance: widgets saved/applied; test proof: E2E; security/edge: org scoping; rollback: disable feature.
- P2-19 Add SSO option (OIDC/SAML) with org mapping — deps: PH0-14; impacted: auth; acceptance: SSO login works; test proof: integration; security/edge: enforce org mapping; rollback: disable SSO.
- P2-20 Mobile/responsive polish for dashboard/queues/reports — deps: P1-14; impacted: UI; acceptance: responsive tests pass; test proof: Percy/snapshots; security/edge: none; rollback: revert CSS.
- P2-21 Implement archive job for long-closed tickets (readonly) — deps: P2-08; impacted: DB; acceptance: archived tickets hidden from active queues; test proof: job test; security/edge: retrieval path defined; rollback: unarchive.
- P2-22 Optimize attachment uploads (chunked, resumable) — deps: P1-10; impacted: API/UI; acceptance: chunked upload works; test proof: integration; security/edge: checksum validation; rollback: disable chunking.
- P2-23 Add data anonymization option for exports and analytics — deps: P2-06; impacted: reporting; acceptance: anonymized export toggles; test proof: tests; security/edge: defaults to non-anonymized only for admins; rollback: disable.
- P2-24 Add backlog burn-down and forecast report — deps: P2-03; impacted: reporting; acceptance: chart renders; test proof: integration; security/edge: org scoping; rollback: hide report.
- P2-25 Stop/Go checkpoint mid-V2 — deps: P2-01…P2-24; impacted: release; acceptance: confirm readiness for compliance/DR; test proof: checkpoint note; security/edge: none; rollback: hold release.
- P2-26 Add E2E for reports/exports (CSV/PDF) with permissions — deps: P2-01; impacted: tests; acceptance: unauthorized blocked; test proof: E2E; security/edge: scrub data; rollback: skip tests.
- P2-27 Add API versioning for reports and attachments — deps: P1-29; impacted: API; acceptance: version header/query supported; test proof: contract tests; security/edge: default to latest; rollback: remove versioning.
- P2-28 Add watermarking for exports with user/time metadata — deps: P2-06; impacted: reporting; acceptance: exports watermarked; test proof: snapshot; security/edge: deter leaks; rollback: disable watermark.
- P2-29 Add real-time notifications (websocket/server-sent events) for assignments/comments — deps: P1-18; impacted: API/UI; acceptance: live updates delivered; test proof: E2E; security/edge: auth tokens validated; rollback: disable channel.
- P2-30 Create runbooks for attachments/queue/report troubleshooting — deps: P1-10, P2-01; impacted: ops; acceptance: docs checked in; test proof: doc present; security/edge: no secrets; rollback: delete doc.
- P2-31 Compliance audit (GDPR/PII) checklist and gap fixes — deps: P2-06; impacted: security/policy; acceptance: checklist completed with actions; test proof: doc; security/edge: legal review; rollback: flag open items.
- P2-32 Reliability improvements for queue processing (idempotency, retries) — deps: P1-03; impacted: API/jobs; acceptance: queue ops idempotent; test proof: tests; security/edge: dedupe tokens; rollback: disable retry.
- P2-33 Integrate error tracking (Sentry/Telemetry) with PII scrubbing — deps: P0-12; impacted: ops; acceptance: errors captured scrubbed; test proof: sample error; security/edge: no secrets; rollback: remove integration.
- P2-34 Add shared/role-based saved filter sharing with audit — deps: P1-25; impacted: UI/DB; acceptance: shareable filters with audit; test proof: integration; security/edge: org scoping; rollback: disable sharing.
- P2-35 V2 Definition of Done review/sign-off — deps: P2-01…P2-34; impacted: release; acceptance: DoD checklist met; test proof: sign-off note; security/edge: none; rollback: reopen items.
=======
=======
>>>>>>> theirs
Phases: Phase 0 (foundations), MVP (P0), V1 (P1), V2 (P2). Each task lists goal, dependencies (Deps), impacted areas, acceptance criteria (AC), test proof, security/edge cases, and rollback notes. Stop/go checkpoints appear roughly every 10–15 tasks.

## Phase 0 – Foundations & Environment
001. Goal: Inventory missing specialist docs and confirm scope. Deps: none. Impact: documentation. AC: list of absent inputs + owner. Test: doc review. Security/Edge: none. Rollback: N/A.
=======
Phases: Phase 0 (foundations/contracts), MVP (P0), V1 (P1), V2 (P2). Each task lists goal, dependencies (Deps), impacted areas, acceptance criteria (AC), test proof, security/edge cases, and rollback notes. Stop/go checkpoints appear every ~10–12 tasks.

## Phase 0 – Foundations, Contracts, Environment
001. Goal: Inventory missing specialist + Agent 5 contract docs and confirm scope. Deps: none. Impact: documentation. AC: list of absent inputs + owner. Test: doc review. Security/Edge: none. Rollback: N/A.
>>>>>>> theirs
002. Goal: Create env validation script (Node 22, pnpm, Postgres). Deps: 001. Impact: devops. AC: script exits non-zero when unmet. Test: run script in CI. Security: avoid leaking secrets. Rollback: delete script.
003. Goal: Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET). Deps: 002. Impact: config. AC: lint passes and check fails on missing vars. Test: unit for checker. Security: do not log secrets. Rollback: remove checker.
004. Goal: Document local dev bootstrap steps in README addendum. Deps: 002. Impact: docs. AC: steps reproducible. Test: run commands. Security: none. Rollback: revert doc.
005. Goal: Add infra IaC stub (Docker compose for Postgres/Redis/MinIO). Deps: 002. Impact: infra. AC: `docker compose up` starts services. Test: smoke connection. Security: default creds scoped to local only. Rollback: remove compose services.
006. Goal: CI pipeline skeleton (lint, typecheck placeholder). Deps: 003. Impact: CI. AC: pipeline runs on PR. Test: CI log. Security: mask secrets. Rollback: disable workflow.
007. Goal: Establish coding standards doc (lint/format/commit). Deps: 004. Impact: eng. AC: doc merged. Test: review. Security: none. Rollback: revert doc.
<<<<<<< ours
008. Goal: Introduce shared error/response schema for APIs. Deps: 006. Impact: API. AC: schema exported, used in one route. Test: unit for serializer. Security: avoid detail leakage. Rollback: revert change.
009. Goal: Add Markdown sanitization utility. Deps: 008. Impact: security/UI. AC: sanitizer used in comment render. Test: unit with XSS strings. Security: ensure whitelist. Rollback: remove util.
010. Goal: Stop/Go Checkpoint 1 (tasks 001–009). Deps: 001-009. Impact: governance. AC: sign-off notes. Test: checklist. Security: none. Rollback: postpone next tasks until resolved.
011. Goal: Add shared authorization helper (org/role checks). Deps: 008. Impact: API. AC: helper used in one endpoint. Test: unit matrix. Security: enforce role gates. Rollback: remove helper.
012. Goal: Apply org/role helper to ticket GET/POST routes. Deps: 011. Impact: API. AC: tests pass for requester/agent/admin. Test: integration. Security: ensure org scope. Rollback: revert usage.
013. Goal: Add rate limiting middleware skeleton. Deps: 011. Impact: security. AC: middleware exported, not yet wired. Test: unit. Security: denial-of-service protection. Rollback: disable middleware.
014. Goal: Wire Markdown sanitizer to ticket/comment display. Deps: 009. Impact: UI. AC: sanitized output observed. Test: integration snapshot. Security: XSS blocked. Rollback: remove call.
015. Goal: Define permission matrix doc (UI vs API). Deps: 011. Impact: docs. AC: matrix published. Test: review. Security: clarifies gating. Rollback: revert doc.
016. Goal: Add base test harness (Vitest config). Deps: 006. Impact: testing. AC: `pnpm test` runs placeholder. Test: run command. Security: none. Rollback: remove config.
017. Goal: Add initial unit tests for auth helper and sanitizer. Deps: 011,009,016. Impact: testing. AC: tests green. Test: `pnpm test`. Security: covers edge strings. Rollback: drop tests.
018. Goal: Audit internal/public comment visibility in UI and API. Deps: 015. Impact: security/UI. AC: checklist of visibility rules. Test: manual review. Security: ensure hidden to requesters. Rollback: none.
019. Goal: Add logging baseline (request IDs, user id). Deps: 008. Impact: observability. AC: middleware outputs IDs. Test: unit for logger. Security: avoid PII. Rollback: disable logger.
020. Goal: Stop/Go Checkpoint 2 (tasks 011–019). Deps: 011-019. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause next tasks.

## MVP (P0) – Hardening & Attachments
021. Goal: Migration for attachment visibility/metadata columns. Deps: 005,012. Impact: DB. AC: migration applied locally. Test: prisma migrate. Security: nullable defaults. Rollback: prisma migrate reset.
022. Goal: Backfill seed to include attachment sample rows. Deps: 021. Impact: data. AC: seed succeeds. Test: pnpm prisma:seed. Security: sample uses safe files. Rollback: revert seed.
023. Goal: Implement attachment upload API with presigned URL generation. Deps: 021,005. Impact: API/storage. AC: returns URL + metadata entry. Test: integration. Security: size/type enforced. Rollback: disable route.
024. Goal: Add AV scanning hook (stub) post-upload. Deps: 023. Impact: security. AC: AV status recorded. Test: unit with mock. Security: quarantine flag. Rollback: bypass AV flag.
025. Goal: UI attachment picker with progress + public/internal toggle. Deps: 023. Impact: UI. AC: file uploaded and linked to ticket. Test: manual + E2E. Security: respects visibility. Rollback: hide UI.
026. Goal: Apply rate limiting middleware to comment/ticket/attachment POST routes. Deps: 013,023. Impact: security. AC: exceeds threshold returns 429. Test: integration. Security: prevents spam. Rollback: disable middleware.
027. Goal: Add category taxonomy table + seeds. Deps: 021. Impact: DB. AC: migration adds categories, seed populates defaults. Test: prisma migrate/seed. Security: none. Rollback: revert migration.
028. Goal: Extend ticket form to select category from taxonomy. Deps: 027. Impact: UI/API. AC: category id stored. Test: E2E. Security: validate org-scoped categories. Rollback: hide field.
029. Goal: Add SLA pause/resume fields and logic placeholders. Deps: 021. Impact: DB/API. AC: fields saved; no logic yet. Test: migrate. Security: none. Rollback: remove fields.
030. Goal: Stop/Go Checkpoint 3 (tasks 021–029). Deps: 021-029. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.
031. Goal: Notification preference schema (email/in-app toggles). Deps: 021. Impact: DB. AC: migration adds preferences. Test: migrate. Security: defaults safe. Rollback: drop table.
032. Goal: Implement basic notification service interface. Deps: 031. Impact: services. AC: service stub with send method. Test: unit. Security: redact secrets. Rollback: remove service.
033. Goal: Comment spam guard (cooldown per user). Deps: 026. Impact: API. AC: repeated posts blocked within window. Test: integration. Security: avoid DoS. Rollback: disable guard.
034. Goal: Sanitize Markdown on API ingest (tickets/comments). Deps: 009. Impact: API. AC: stored content sanitized. Test: unit/integration. Security: XSS prevention. Rollback: remove sanitization.
035. Goal: Stop/Go Checkpoint 4 (tasks 031–034). Deps: 031-034. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.
036. Goal: Add SLA policy admin CRUD API (priority/category overrides). Deps: 027,029. Impact: API. AC: create/update/delete works with org scope. Test: integration. Security: role=ADMIN enforced. Rollback: disable routes.
037. Goal: Admin UI for SLA policies with validation. Deps: 036. Impact: UI. AC: admin can CRUD policy. Test: E2E. Security: admin-only guard. Rollback: hide menu.
038. Goal: Ticket creation shows SLA preview (due times). Deps: 029,036. Impact: UI. AC: preview matches policy. Test: unit for calc. Security: none. Rollback: hide preview.
039. Goal: Add ticket list SLA breach indicators. Deps: 029. Impact: UI. AC: overdue badge shows when past due. Test: integration. Security: none. Rollback: hide badge.
040. Goal: Shared policy module used in TicketActions (status transitions). Deps: 015. Impact: UI/API. AC: transitions enforced per role map. Test: unit/integration. Security: prevents invalid statuses. Rollback: revert module usage.
041. Goal: Apply org/role helper to comments API. Deps: 012. Impact: API. AC: org mismatch rejected. Test: integration. Security: tenant isolation. Rollback: revert helper.
042. Goal: Add ticket search index on title/description/category. Deps: 021. Impact: DB/perf. AC: index created. Test: migration. Security: none. Rollback: drop index.
043. Goal: Improve ticket list pagination with cursor. Deps: 042. Impact: API/UI. AC: paginated responses. Test: integration. Security: validate inputs. Rollback: revert to offset.
044. Goal: Add audit logging for attachment uploads/deletes. Deps: 023. Impact: audit. AC: audit row created. Test: unit. Security: includes actor info. Rollback: disable audit hook.
045. Goal: Enforce attachment visibility on ticket detail UI/API. Deps: 025,023. Impact: security. AC: requesters cannot see internal files. Test: integration/E2E. Security: access control. Rollback: hide files.
046. Goal: Add team membership management API. Deps: 027. Impact: admin. AC: add/remove users from teams. Test: integration. Security: admin-only. Rollback: disable endpoints.
047. Goal: Admin UI for users/teams CRUD. Deps: 046. Impact: UI. AC: create/update/delete works. Test: E2E. Security: guard by role. Rollback: hide nav.
048. Goal: Enforce file size/type limits server-side. Deps: 023. Impact: security. AC: rejects oversized/disallowed types. Test: integration. Security: prevents abuse. Rollback: relax limits.
049. Goal: Add checksum verification for uploads. Deps: 048. Impact: integrity. AC: checksum stored and validated. Test: unit. Security: tamper detection. Rollback: bypass check.
050. Goal: Stop/Go Checkpoint 5 (tasks 036–049). Deps: 036-049. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.

## V1 (P1) – Automation, SLA Workers, Notifications
051. Goal: Set up Redis/BullMQ worker service. Deps: 005,032. Impact: infra. AC: worker connects and processes dummy job. Test: integration. Security: restrict network. Rollback: disable worker.
052. Goal: Queue job schema for SLA timers (first response/resolve). Deps: 029,051. Impact: worker. AC: job payload defined. Test: unit. Security: validate org id. Rollback: remove job type.
053. Goal: Schedule SLA jobs on ticket creation/update. Deps: 052,029. Impact: API. AC: jobs enqueued with due timestamps. Test: integration. Security: org scoping. Rollback: stop enqueue.
054. Goal: Worker processes SLA breach -> audit + notifications. Deps: 053. Impact: worker/API. AC: breach sets flag and sends notification. Test: integration. Security: avoid duplicate send. Rollback: mark job failed.
055. Goal: Add SLA pause/resume handling in worker (waiting on requester). Deps: 054. Impact: worker/API. AC: clock stops/starts on status change. Test: unit/integration. Security: validate transitions. Rollback: disable pause logic.
056. Goal: Implement notification channels (email adapter stub + in-app feed). Deps: 032. Impact: comms. AC: message stored + email logged. Test: unit/integration. Security: secret handling. Rollback: disable email.
057. Goal: Health checks for worker queues (lag, failures). Deps: 051. Impact: ops. AC: endpoint exposes metrics. Test: integration. Security: protect endpoint. Rollback: disable metrics.
058. Goal: Dashboard SLA widgets (open tickets by breach state). Deps: 039,054. Impact: UI. AC: widget renders counts. Test: integration. Security: none. Rollback: hide widget.
059. Goal: Add automation rule engine (trigger/action config). Deps: 032,036. Impact: backend. AC: rules persisted and executed on events. Test: unit. Security: validate actions. Rollback: disable rules.
060. Goal: Stop/Go Checkpoint 6 (tasks 051–059). Deps: 051-059. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.
061. Goal: Retry/backoff strategy for failed jobs with DLQ. Deps: 051. Impact: worker. AC: retries configured, DLQ table/log. Test: unit. Security: avoid infinite loops. Rollback: disable retries.
062. Goal: Worker deployment runbook (restart, drain, rollback). Deps: 057. Impact: ops. AC: runbook published. Test: tabletop. Security: access control noted. Rollback: revise runbook.
063. Goal: SLA reminder notifications before breach. Deps: 054. Impact: worker/comms. AC: reminder sent at threshold. Test: integration. Security: dedup. Rollback: disable reminder flag.
064. Goal: Add CSAT request trigger on resolution/closure. Deps: 055. Impact: comms. AC: CSAT notification dispatched once. Test: integration. Security: one-per-ticket. Rollback: disable trigger.
065. Goal: Stop/Go Checkpoint 7 (tasks 061–064). Deps: 061-064. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.
066. Goal: Notification rate limiting/dedup service. Deps: 056. Impact: comms. AC: duplicate alerts suppressed. Test: unit. Security: prevents spam. Rollback: bypass dedup.
067. Goal: Notification templates (localizable). Deps: 056. Impact: UX/comms. AC: templates stored and rendered. Test: unit snapshot. Security: sanitize variables. Rollback: revert templates.
068. Goal: Add @mentions parsing to comments. Deps: 034. Impact: collab. AC: mentions stored and used to notify. Test: unit/integration. Security: validate user existence. Rollback: disable mentions.
069. Goal: Add Kanban board view for tickets. Deps: 043. Impact: UI. AC: drag/drop updates status respecting policy. Test: E2E. Security: role checks. Rollback: disable board.
070. Goal: Admin governance for tags/categories cleanup (merge/archive). Deps: 027. Impact: admin. AC: archive/merge works. Test: integration. Security: admin-only. Rollback: revert changes.
071. Goal: Audit coverage for admin CRUD (users/teams/tags/SLA). Deps: 047,036. Impact: audit. AC: audit rows created. Test: integration. Security: immutable logs. Rollback: disable hook.
072. Goal: Audit viewer UI for admins. Deps: 071. Impact: UI. AC: paginated audit list filterable by actor/date/action. Test: E2E. Security: admin-only. Rollback: hide page.
073. Goal: Add assignment auto-suggest (load-based) in TicketActions. Deps: 059. Impact: UX. AC: suggestion displayed. Test: unit. Security: avoid revealing other org data. Rollback: disable suggest.
074. Goal: Enhance search with tag/category filters. Deps: 027,070. Impact: UI/API. AC: filters applied. Test: integration. Security: org scope. Rollback: remove filters.
075. Goal: Add reopen reason capture form. Deps: 040. Impact: UI/API. AC: reason saved on reopen. Test: integration. Security: validate length. Rollback: optional field.
076. Goal: Reopen throttling (cooldown). Deps: 075. Impact: API. AC: repeated reopen blocked. Test: integration. Security: prevent abuse. Rollback: disable throttle.
077. Goal: Attachment download logging. Deps: 045. Impact: audit. AC: audit on download. Test: unit. Security: includes actor. Rollback: disable logging.
078. Goal: Apply org/role helper to admin routes. Deps: 011. Impact: API. AC: all admin endpoints enforce org scope. Test: integration. Security: tenant isolation. Rollback: revert helper usage.
079. Goal: Contract tests UI vs API permissions. Deps: 015,040. Impact: QA. AC: matrix tests green. Test: automated contract suite. Security: ensures consistency. Rollback: disable suite.
080. Goal: Stop/Go Checkpoint 8 (tasks 066–079). Deps: 066-079. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.

## V2 (P2) – Reporting, CSAT, Advanced Features
081. Goal: Reporting job table and async export endpoints. Deps: 059. Impact: backend. AC: report request returns job id. Test: integration. Security: org scope. Rollback: disable endpoint.
082. Goal: Internal vs public attachment download URLs (signed, time-bound). Deps: 045,048. Impact: security. AC: generates scoped URLs. Test: integration. Security: expiry + scope. Rollback: revert to server proxy.
083. Goal: In-app notification center UI. Deps: 056. Impact: UI. AC: list with read/unread, filters. Test: E2E. Security: user scoped. Rollback: hide UI.
084. Goal: Bulk actions on ticket list (assign, status change). Deps: 040. Impact: UX. AC: bulk operation executes with audit. Test: integration. Security: permission check per item. Rollback: disable bulk.
085. Goal: Saved views for ticket filters (personal/team). Deps: 043. Impact: UX. AC: save/load works. Test: integration. Security: org scoping. Rollback: disable feature.
086. Goal: Dashboard KPI cards (MTTR, MTTA, reopen rate). Deps: 081. Impact: reporting. AC: metrics calculated accurately. Test: unit. Security: none. Rollback: hide cards.
087. Goal: CSAT submission endpoint and schema. Deps: 064. Impact: backend. AC: one response per ticket, signed token verified. Test: integration. Security: token validation. Rollback: disable endpoint.
088. Goal: CSAT UI for requester (email link/page). Deps: 087. Impact: UX. AC: form submits score/comment. Test: E2E. Security: token required. Rollback: disable page.
089. Goal: Export to CSV for tickets and comments. Deps: 081. Impact: reporting. AC: downloadable file generated asynchronously. Test: integration. Security: scrub internal-only fields for requesters. Rollback: disable export.
090. Goal: SLA calibration tool (what-if simulator). Deps: 054. Impact: admin UX. AC: simulator returns projected breaches. Test: unit. Security: none. Rollback: remove tool.
091. Goal: Stop/Go Checkpoint 9 (tasks 081–090). Deps: 081-090. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.
092. Goal: Accessibility audit and fixes (axe). Deps: 025,037,083. Impact: UX. AC: axe report zero critical issues. Test: automated axe. Security: none. Rollback: log issues.
093. Goal: Localization framework (i18n keys) groundwork. Deps: 067. Impact: UX. AC: keys extracted for major screens. Test: unit. Security: none. Rollback: keep Polish strings.
094. Goal: Captcha fallback for suspicious comment/ticket submissions. Deps: 033. Impact: security. AC: captcha triggered after threshold. Test: integration. Security: protect keys. Rollback: disable captcha.
095. Goal: Reopen approvals for high-priority tickets (agent/admin). Deps: 076. Impact: workflow. AC: approval required for WYSOKI/KRYTYCZNY. Test: integration. Security: role checks. Rollback: bypass approvals.
096. Goal: Knowledge base link injection based on category. Deps: 028. Impact: UX. AC: suggestions shown in form. Test: unit. Security: safe content. Rollback: hide suggestions.
097. Goal: CSAT analytics dashboards. Deps: 088. Impact: reporting. AC: charts display distribution over time. Test: integration. Security: anonymize requester data. Rollback: hide dashboard.
098. Goal: Report job performance optimizations (indexes, batching). Deps: 081. Impact: perf. AC: job completes within SLA. Test: load test. Security: none. Rollback: revert index.
099. Goal: Export scheduling (email reports). Deps: 067,089. Impact: comms. AC: schedule creates jobs, emails on completion. Test: integration. Security: unsubscribe support. Rollback: disable scheduler.
100. Goal: Stop/Go Checkpoint 10 (tasks 092–099). Deps: 092-099. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.
101. Goal: `/metrics` endpoint with Prometheus format (API + worker). Deps: 057. Impact: ops. AC: metrics exposed for key KPIs. Test: curl output. Security: auth or IP allowlist. Rollback: disable endpoint.
102. Goal: Alerting rules for SLA breaches/queue lag. Deps: 101. Impact: ops. AC: alerts fire in staging. Test: simulated breach. Security: avoid alert storm. Rollback: mute alerts.
103. Goal: Disaster recovery drill (DB backup/restore). Deps: 005. Impact: ops. AC: backup restored in staging. Test: runbook. Security: encrypt backups. Rollback: rollback restore.
104. Goal: Environment parity checklist (dev/stage/prod). Deps: 002. Impact: ops. AC: checklist approved. Test: review. Security: secrets handled. Rollback: update doc.
105. Goal: Performance budget for ticket list/detail. Deps: 043,084. Impact: perf. AC: render under threshold. Test: Lighthouse. Security: none. Rollback: adjust budget.
106. Goal: Offline-friendly drafts for ticket/comment forms. Deps: 025. Impact: UX. AC: drafts stored locally and restored. Test: unit/E2E. Security: redact sensitive data. Rollback: disable drafts.
107. Goal: Data retention policies (attachments/comments). Deps: 044. Impact: compliance. AC: policy stored and enforced. Test: unit. Security: irreversible deletions noted. Rollback: disable enforcement.
108. Goal: Session security enhancements (2FA stub, login attempt logging). Deps: 030. Impact: security. AC: logs recorded; 2FA flag stored. Test: unit. Security: protect secrets. Rollback: disable 2FA flag.
109. Goal: CSAT anti-gaming safeguards (token binding, expiry). Deps: 087. Impact: security. AC: expired tokens rejected. Test: integration. Security: protect tokens. Rollback: extend expiry.
110. Goal: Stop/Go Checkpoint 11 (tasks 101–109). Deps: 101-109. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.
111. Goal: Data cleanup cron (stale drafts/temp uploads). Deps: 106. Impact: ops. AC: cron removes stale items. Test: unit. Security: avoid deleting active data. Rollback: disable cron.
112. Goal: Feature flag system for gradual rollouts. Deps: 032. Impact: ops/UX. AC: flags stored and evaluated. Test: unit. Security: default safe. Rollback: disable flags.
113. Goal: End-to-end regression suite expansion (cover new flows). Deps: 058,083,084,088. Impact: QA. AC: suite passes. Test: `pnpm test:e2e`. Security: run in isolated env. Rollback: mark flaky.
114. Goal: Performance/load test suite for API + worker. Deps: 105. Impact: perf. AC: targets met. Test: k6/JMeter results. Security: avoid prod data. Rollback: tune limits.
115. Goal: Documentation hub update (blueprint, runbooks, FAQs). Deps: 113. Impact: docs. AC: docs published. Test: review. Security: no secrets. Rollback: revert docs.
116. Goal: Release checklist for GA. Deps: 110. Impact: governance. AC: checklist approved. Test: review. Security: include rollback plan. Rollback: update checklist.
117. Goal: Production smoke test script (post-deploy). Deps: 113. Impact: QA/ops. AC: script exits green. Test: run script. Security: safe creds. Rollback: disable script.
118. Goal: Worker failover plan and chaos test. Deps: 062. Impact: ops. AC: failover succeeds in test. Test: chaos drill. Security: ensure safeguards. Rollback: document gaps.
119. Goal: Final risk review against mitigation map. Deps: 116. Impact: governance. AC: risks closed/accepted. Test: review. Security: none. Rollback: update map.
120. Goal: Stop/Go Checkpoint 12 (tasks 111–119) & Definition of Done for P2. Deps: 111-119. Impact: governance. AC: sign-off; P2 DoD met (all critical tests green, monitoring on, runbooks ready). Test: checklist. Security: none. Rollback: pause release.

## Definitions of Done
- **Phase 0**: Env validation, coding standards, auth/policy helpers, sanitizer in place, initial tests passing, checkpoints 1–2 approved.
- **MVP (P0)**: Attachments with visibility, categories, SLA fields, admin SLA CRUD, rate limits, audits for files, checkpoints 3–5 approved, unit/integration tests added, UI wires for new fields.
- **V1 (P1)**: Workers running SLA/notification flows, automation rules, dashboards/widgets, contract tests, checkpoints 6–8 approved, monitoring/health checks live.
- **V2 (P2)**: Reporting/CSAT, advanced security/perf features, localization groundwork, metrics/alerts, regression and load suites passing, checkpoints 9–12 approved.
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
008. Goal: Recreate contract conventions (request/response shape, pagination, versioning, idempotency, headers). Deps: 007. Impact: API/docs. AC: conventions doc approved. Test: review. Security: avoid leaking internal codes. Rollback: supersede doc.
009. Goal: Define shared error/response schema aligned to conventions. Deps: 008. Impact: API. AC: schema exported and reusable. Test: unit for serializer. Security: avoid detail leakage. Rollback: revert module.
010. Goal: Recreate OpenAPI baseline in `docs/openapi.yaml` for current routes. Deps: 008-009. Impact: docs/API. AC: spec passes lint; reflects current endpoints. Test: openapi lint. Security: exclude secrets. Rollback: remove spec.
011. Goal: Create contract test harness (positive/negative, error model, idempotency) wired to OpenAPI. Deps: 010. Impact: QA/CI. AC: harness runs locally. Test: `pnpm test:contract` (placeholder). Security: redacts tokens. Rollback: disable harness.
012. Goal: Stop/Go Checkpoint 1 (tasks 001–011). Deps: 001-011. Impact: governance. AC: sign-off notes. Test: checklist. Security: none. Rollback: pause next tasks.

013. Goal: Add Markdown sanitization utility. Deps: 011. Impact: security/UI. AC: sanitizer used in comment render. Test: unit with XSS strings. Security: ensure whitelist. Rollback: remove util.
014. Goal: Introduce shared authorization helper (org/role checks). Deps: 011. Impact: API. AC: helper used in one endpoint. Test: unit matrix. Security: enforce role gates. Rollback: remove helper.
015. Goal: Apply org/role helper to ticket GET/POST routes. Deps: 014. Impact: API. AC: tests pass for requester/agent/admin. Test: integration. Security: ensure org scope. Rollback: revert usage.
016. Goal: Add rate limiting middleware skeleton. Deps: 014. Impact: security. AC: middleware exported, not yet wired. Test: unit. Security: denial-of-service protection. Rollback: disable middleware.
017. Goal: Wire Markdown sanitizer to ticket/comment display. Deps: 013. Impact: UI. AC: sanitized output observed. Test: integration snapshot. Security: XSS blocked. Rollback: remove call.
018. Goal: Define permission matrix doc (UI vs API). Deps: 014. Impact: docs. AC: matrix published. Test: review. Security: clarifies gating. Rollback: revert doc.
019. Goal: Add base test harness (Vitest config). Deps: 006. Impact: testing. AC: `pnpm test` runs placeholder. Test: run command. Security: none. Rollback: remove config.
020. Goal: Add initial unit tests for auth helper, sanitizer, and error schema. Deps: 013-014,019. Impact: testing. AC: tests green. Test: `pnpm test`. Security: covers edge strings. Rollback: drop tests.
021. Goal: Add logging baseline (request IDs, user id). Deps: 014. Impact: observability. AC: middleware outputs IDs. Test: unit for logger. Security: avoid PII. Rollback: disable logger.
022. Goal: Audit internal/public comment visibility in UI and API. Deps: 018. Impact: security/UI. AC: checklist of visibility rules. Test: manual review. Security: ensure hidden to requesters. Rollback: none.
023. Goal: Wire CI job to block merges on OpenAPI lint + contract tests. Deps: 006,011. Impact: CI/QA. AC: failing spec blocks PR. Test: CI run. Security: no secrets. Rollback: make job optional.
024. Goal: Stop/Go Checkpoint 2 (tasks 013–023). Deps: 013-023. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause next tasks.

## MVP (P0) – Hardening & Attachments
025. Goal: Migration for attachment visibility/metadata columns. Deps: 005,015. Impact: DB. AC: migration applied locally. Test: prisma migrate. Security: nullable defaults. Rollback: prisma migrate reset.
026. Goal: Backfill seed to include attachment sample rows. Deps: 025. Impact: data. AC: seed succeeds. Test: pnpm prisma:seed. Security: sample uses safe files. Rollback: revert seed.
027. Goal: Implement attachment upload API with presigned URL generation. Deps: 025. Impact: API/storage. AC: returns URL + metadata entry. Test: integration. Security: size/type enforced. Rollback: disable route.
028. Goal: Add AV scanning hook (stub) post-upload. Deps: 027. Impact: security. AC: AV status recorded. Test: unit with mock. Security: quarantine flag. Rollback: bypass AV flag.
029. Goal: UI attachment picker with progress + public/internal toggle. Deps: 027. Impact: UI. AC: file uploaded and linked to ticket. Test: manual + E2E. Security: respects visibility. Rollback: hide UI.
030. Goal: Apply rate limiting middleware to comment/ticket/attachment POST routes. Deps: 016,027. Impact: security. AC: exceeds threshold returns 429. Test: integration. Security: prevents spam. Rollback: disable middleware.
031. Goal: Add category taxonomy table + seeds. Deps: 025. Impact: DB. AC: migration adds categories, seed populates defaults. Test: prisma migrate/seed. Security: none. Rollback: revert migration.
032. Goal: Extend ticket form to select category from taxonomy. Deps: 031. Impact: UI/API. AC: category id stored. Test: E2E. Security: validate org-scoped categories. Rollback: hide field.
033. Goal: Add SLA pause/resume fields and logic placeholders. Deps: 025. Impact: DB/API. AC: fields saved; no logic yet. Test: migrate. Security: none. Rollback: remove fields.
034. Goal: Notification preference schema (email/in-app toggles). Deps: 025. Impact: DB. AC: migration adds preferences. Test: migrate. Security: defaults safe. Rollback: drop table.
035. Goal: Implement basic notification service interface. Deps: 034. Impact: services. AC: service stub with send method. Test: unit. Security: redact secrets. Rollback: remove service.
036. Goal: Stop/Go Checkpoint 3 (tasks 025–035). Deps: 025-035. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.

037. Goal: Comment spam guard (cooldown per user). Deps: 030. Impact: API. AC: repeated posts blocked within window. Test: integration. Security: avoid DoS. Rollback: disable guard.
038. Goal: Sanitize Markdown on API ingest (tickets/comments). Deps: 013. Impact: API. AC: stored content sanitized. Test: unit/integration. Security: XSS prevention. Rollback: remove sanitization.
039. Goal: Add SLA policy admin CRUD API (priority/category overrides). Deps: 031,033. Impact: API. AC: create/update/delete works with org scope. Test: integration. Security: role=ADMIN enforced. Rollback: disable routes.
040. Goal: Admin UI for SLA policies with validation. Deps: 039. Impact: UI. AC: admin can CRUD policy. Test: E2E. Security: admin-only guard. Rollback: hide menu.
041. Goal: Ticket creation shows SLA preview (due times). Deps: 033,039. Impact: UI. AC: preview matches policy. Test: unit for calc. Security: none. Rollback: hide preview.
042. Goal: Add ticket list SLA breach indicators. Deps: 033. Impact: UI. AC: overdue badge shows when past due. Test: integration. Security: none. Rollback: hide badge.
043. Goal: Shared policy module used in TicketActions (status transitions). Deps: 018. Impact: UI/API. AC: transitions enforced per role map. Test: unit/integration. Security: prevents invalid statuses. Rollback: revert module usage.
044. Goal: Apply org/role helper to comments API. Deps: 014. Impact: API. AC: org mismatch rejected. Test: integration. Security: tenant isolation. Rollback: revert helper.
045. Goal: Add ticket search index on title/description/category. Deps: 025. Impact: DB/perf. AC: index created. Test: migration. Security: none. Rollback: drop index.
046. Goal: Improve ticket list pagination with cursor. Deps: 045. Impact: API/UI. AC: paginated responses. Test: integration. Security: validate inputs. Rollback: revert to offset.
047. Goal: Add audit logging for attachment uploads/deletes. Deps: 027. Impact: audit. AC: audit row created. Test: unit. Security: includes actor info. Rollback: disable audit hook.
048. Goal: Stop/Go Checkpoint 4 (tasks 037–047). Deps: 037-047. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.

049. Goal: Enforce attachment visibility on ticket detail UI/API. Deps: 029,027. Impact: security. AC: requesters cannot see internal files. Test: integration/E2E. Security: access control. Rollback: hide files.
050. Goal: Add team membership management API. Deps: 031. Impact: admin. AC: add/remove users from teams. Test: integration. Security: admin-only. Rollback: disable endpoints.
051. Goal: Admin UI for users/teams CRUD. Deps: 050. Impact: UI. AC: create/update/delete works. Test: E2E. Security: guard by role. Rollback: hide nav.
052. Goal: Enforce file size/type limits server-side. Deps: 027. Impact: security. AC: rejects oversized/disallowed types. Test: integration. Security: prevents abuse. Rollback: relax limits.
053. Goal: Add checksum verification for uploads. Deps: 052. Impact: integrity. AC: checksum stored and validated. Test: unit. Security: tamper detection. Rollback: bypass check.
054. Goal: Apply org/role helper to admin routes. Deps: 014. Impact: API. AC: all admin endpoints enforce org scope. Test: integration. Security: tenant isolation. Rollback: revert helper usage.
055. Goal: Notification rate limiting/dedup service. Deps: 035. Impact: comms. AC: duplicate alerts suppressed. Test: unit. Security: prevents spam. Rollback: bypass dedup.
056. Goal: Notification templates (localizable). Deps: 035. Impact: UX/comms. AC: templates stored and rendered. Test: unit snapshot. Security: sanitize variables. Rollback: revert templates.
057. Goal: Add @mentions parsing to comments. Deps: 038. Impact: collab. AC: mentions stored and used to notify. Test: unit/integration. Security: validate user existence. Rollback: disable mentions.
058. Goal: Add Kanban board view for tickets. Deps: 046. Impact: UI. AC: drag/drop updates status respecting policy. Test: E2E. Security: role checks. Rollback: disable board.
059. Goal: Admin governance for tags/categories cleanup (merge/archive). Deps: 031. Impact: admin. AC: archive/merge works. Test: integration. Security: admin-only. Rollback: revert changes.
060. Goal: Contract tests UI vs API permissions. Deps: 018,043. Impact: QA. AC: matrix tests green. Test: automated contract suite. Security: ensures consistency. Rollback: disable suite.
061. Goal: Stop/Go Checkpoint 5 (tasks 049–060). Deps: 049-060. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.

## V1 (P1) – Automation, SLA Workers, Notifications
062. Goal: Audit coverage for admin CRUD (users/teams/tags/SLA). Deps: 051,039. Impact: audit. AC: audit rows created. Test: integration. Security: immutable logs. Rollback: disable hook.
063. Goal: Audit viewer UI for admins. Deps: 062. Impact: UI. AC: paginated audit list filterable by actor/date/action. Test: E2E. Security: admin-only. Rollback: hide page.
064. Goal: Add assignment auto-suggest (load-based) in TicketActions. Deps: 046. Impact: UX. AC: suggestion displayed. Test: unit. Security: avoid revealing other org data. Rollback: disable suggest.
065. Goal: Enhance search with tag/category filters. Deps: 031,059. Impact: UI/API. AC: filters applied. Test: integration. Security: org scope. Rollback: remove filters.
066. Goal: Add reopen reason capture form. Deps: 043. Impact: UI/API. AC: reason saved on reopen. Test: integration. Security: validate length. Rollback: optional field.
067. Goal: Reopen throttling (cooldown). Deps: 066. Impact: API. AC: repeated reopen blocked. Test: integration. Security: prevent abuse. Rollback: disable throttle.
068. Goal: Attachment download logging. Deps: 049. Impact: audit. AC: audit on download. Test: unit. Security: includes actor. Rollback: disable logging.
069. Goal: Set up Redis/BullMQ worker service. Deps: 005,035. Impact: infra. AC: worker connects and processes dummy job. Test: integration. Security: restrict network. Rollback: disable worker.
070. Goal: Queue job schema for SLA timers (first response/resolve). Deps: 033,069. Impact: worker. AC: job payload defined. Test: unit. Security: validate org id. Rollback: remove job type.
071. Goal: Schedule SLA jobs on ticket creation/update. Deps: 070,033. Impact: API. AC: jobs enqueued with due timestamps. Test: integration. Security: org scoping. Rollback: stop enqueue.
072. Goal: Worker processes SLA breach -> audit + notifications. Deps: 071. Impact: worker/API. AC: breach sets flag and sends notification. Test: integration. Security: avoid duplicate send. Rollback: mark job failed.
073. Goal: Add SLA pause/resume handling in worker (waiting on requester). Deps: 067,072. Impact: worker/API. AC: clock stops/starts on status change. Test: unit/integration. Security: validate transitions. Rollback: disable pause logic.
074. Goal: Stop/Go Checkpoint 6 (tasks 062–073). Deps: 062-073. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.

075. Goal: Implement notification channels (email adapter stub + in-app feed). Deps: 035. Impact: comms. AC: message stored + email logged. Test: unit/integration. Security: secret handling. Rollback: disable email.
076. Goal: Health checks for worker queues (lag, failures). Deps: 069. Impact: ops. AC: endpoint exposes metrics. Test: integration. Security: protect endpoint. Rollback: disable metrics.
077. Goal: Dashboard SLA widgets (open tickets by breach state). Deps: 042,072. Impact: UI. AC: widget renders counts. Test: integration. Security: none. Rollback: hide widget.
078. Goal: Add automation rule engine (trigger/action config). Deps: 035,039. Impact: backend. AC: rules persisted and executed on events. Test: unit. Security: validate actions. Rollback: disable rules.
079. Goal: Retry/backoff strategy for failed jobs with DLQ. Deps: 069. Impact: worker. AC: retries configured, DLQ table/log. Test: unit. Security: avoid infinite loops. Rollback: disable retries.
080. Goal: Worker deployment runbook (restart, drain, rollback). Deps: 076. Impact: ops. AC: runbook published. Test: tabletop. Security: access control noted. Rollback: revise runbook.
081. Goal: SLA reminder notifications before breach. Deps: 072. Impact: worker/comms. AC: reminder sent at threshold. Test: integration. Security: dedup. Rollback: disable reminder flag.
082. Goal: Add CSAT request trigger on resolution/closure. Deps: 073. Impact: comms. AC: CSAT notification dispatched once. Test: integration. Security: one-per-ticket. Rollback: disable trigger.
083. Goal: Notification preference enforcement in sender. Deps: 034,075. Impact: comms. AC: respects toggles. Test: unit. Security: defaults safe. Rollback: bypass enforcement.
084. Goal: SLA escalation logic (team escalation path). Deps: 078,072. Impact: workflow. AC: escalation triggers reassignment/audit. Test: integration. Security: role checks. Rollback: disable escalation.
085. Goal: Update OpenAPI to include new worker-driven events and notification contracts. Deps: 075-084. Impact: docs/API. AC: spec updated, lint green. Test: openapi lint. Security: exclude secrets. Rollback: revert spec change.
086. Goal: Stop/Go Checkpoint 7 (tasks 075–085). Deps: 075-085. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.

## V2 (P2) – Reporting, CSAT, Advanced Features
087. Goal: In-app notification center UI. Deps: 075,083. Impact: UI. AC: list with read/unread, filters. Test: E2E. Security: user scoped. Rollback: hide UI.
088. Goal: Bulk actions on ticket list (assign, status change). Deps: 043. Impact: UX. AC: bulk operation executes with audit. Test: integration. Security: permission check per item. Rollback: disable bulk.
089. Goal: Saved views for ticket filters (personal/team). Deps: 046. Impact: UX. AC: save/load works. Test: integration. Security: org scoping. Rollback: disable feature.
090. Goal: Reporting job table and async export endpoints. Deps: 069. Impact: backend. AC: report request returns job id. Test: integration. Security: org scope. Rollback: disable endpoint.
091. Goal: Dashboard KPI cards (MTTR, MTTA, reopen rate). Deps: 090. Impact: reporting. AC: metrics calculated accurately. Test: unit. Security: none. Rollback: hide cards.
092. Goal: Export to CSV for tickets and comments. Deps: 090. Impact: reporting. AC: downloadable file generated asynchronously. Test: integration. Security: scrub internal-only fields for requesters. Rollback: disable export.
093. Goal: Internal vs public attachment download URLs (signed, time-bound). Deps: 049,052. Impact: security. AC: generates scoped URLs. Test: integration. Security: expiry + scope. Rollback: revert to server proxy.
094. Goal: CSAT submission endpoint and schema. Deps: 082. Impact: backend. AC: one response per ticket, signed token verified. Test: integration. Security: token validation. Rollback: disable endpoint.
095. Goal: CSAT UI for requester (email link/page). Deps: 094. Impact: UX. AC: form submits score/comment. Test: E2E. Security: token required. Rollback: disable page.
096. Goal: SLA calibration tool (what-if simulator). Deps: 072. Impact: admin UX. AC: simulator returns projected breaches. Test: unit. Security: none. Rollback: remove tool.
097. Goal: Knowledge base link injection based on category. Deps: 032. Impact: UX. AC: suggestions shown in form. Test: unit. Security: safe content. Rollback: hide suggestions.
098. Goal: Contract tests for reporting/exports and CSAT against OpenAPI. Deps: 085,090,094. Impact: QA. AC: suite passes. Test: contract suite. Security: sanitize fixtures. Rollback: disable suite.
099. Goal: Stop/Go Checkpoint 8 (tasks 087–098). Deps: 087-098. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.

100. Goal: Accessibility audit and fixes (axe). Deps: 029,087. Impact: UX. AC: axe report zero critical issues. Test: automated axe. Security: none. Rollback: log issues.
101. Goal: Localization framework (i18n keys) groundwork. Deps: 056. Impact: UX. AC: keys extracted for major screens. Test: unit. Security: none. Rollback: keep Polish strings.
102. Goal: Captcha fallback for suspicious comment/ticket submissions. Deps: 037. Impact: security. AC: captcha triggered after threshold. Test: integration. Security: protect keys. Rollback: disable captcha.
103. Goal: Reopen approvals for high-priority tickets (agent/admin). Deps: 067. Impact: workflow. AC: approval required for WYSOKI/KRYTYCZNY. Test: integration. Security: role checks. Rollback: bypass approvals.
104. Goal: Report job performance optimizations (indexes, batching). Deps: 090. Impact: perf. AC: job completes within SLA. Test: load test. Security: none. Rollback: revert index.
105. Goal: Export scheduling (email reports). Deps: 089,092. Impact: comms. AC: schedule creates jobs, emails on completion. Test: integration. Security: unsubscribe support. Rollback: disable scheduler.
106. Goal: `/metrics` endpoint with Prometheus format (API + worker). Deps: 076. Impact: ops. AC: metrics exposed for key KPIs. Test: curl output. Security: auth or IP allowlist. Rollback: disable endpoint.
107. Goal: Alerting rules for SLA breaches/queue lag. Deps: 106. Impact: ops. AC: alerts fire in staging. Test: simulated breach. Security: avoid alert storm. Rollback: mute alerts.
108. Goal: Disaster recovery drill (DB backup/restore). Deps: 005. Impact: ops. AC: backup restored in staging. Test: runbook. Security: encrypt backups. Rollback: rollback restore.
109. Goal: Environment parity checklist (dev/stage/prod). Deps: 002. Impact: ops. AC: checklist approved. Test: review. Security: secrets handled. Rollback: update doc.
110. Goal: Performance budget for ticket list/detail. Deps: 046,088. Impact: perf. AC: render under threshold. Test: Lighthouse. Security: none. Rollback: adjust budget.
111. Goal: Stop/Go Checkpoint 9 (tasks 100–110). Deps: 100-110. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause.

112. Goal: Offline-friendly drafts for ticket/comment forms. Deps: 029. Impact: UX. AC: drafts stored locally and restored. Test: unit/E2E. Security: redact sensitive data. Rollback: disable drafts.
113. Goal: Data retention policies (attachments/comments). Deps: 068. Impact: compliance. AC: policy stored and enforced. Test: unit. Security: irreversible deletions noted. Rollback: disable enforcement.
114. Goal: Session security enhancements (2FA stub, login attempt logging). Deps: 030. Impact: security. AC: logs recorded; 2FA flag stored. Test: unit. Security: protect secrets. Rollback: disable 2FA flag.
115. Goal: CSAT anti-gaming safeguards (token binding, expiry). Deps: 095. Impact: security. AC: expired tokens rejected. Test: integration. Security: protect tokens. Rollback: extend expiry.
116. Goal: Feature flag system for gradual rollouts. Deps: 006. Impact: ops/UX. AC: flags stored and evaluated. Test: unit. Security: default safe. Rollback: disable flags.
117. Goal: End-to-end regression suite expansion (cover new flows). Deps: 085,098. Impact: QA. AC: suite passes. Test: `pnpm test:e2e`. Security: run in isolated env. Rollback: mark flaky.
118. Goal: Performance/load test suite for API + worker. Deps: 110. Impact: perf. AC: targets met. Test: k6/JMeter results. Security: avoid prod data. Rollback: tune limits.
119. Goal: Documentation hub update (blueprint, runbooks, FAQs). Deps: 117. Impact: docs. AC: docs published. Test: review. Security: no secrets. Rollback: revert docs.
120. Goal: Release checklist for GA. Deps: 111,119. Impact: governance. AC: checklist approved. Test: review. Security: include rollback plan. Rollback: update checklist.
121. Goal: Production smoke test script (post-deploy). Deps: 117. Impact: QA/ops. AC: script exits green. Test: run script. Security: safe creds. Rollback: disable script.
122. Goal: Worker failover plan and chaos test. Deps: 076. Impact: ops. AC: failover succeeds in test. Test: chaos drill. Security: ensure safeguards. Rollback: document gaps.
123. Goal: Final risk review against mitigation map. Deps: 120. Impact: governance. AC: risks closed/accepted. Test: review. Security: none. Rollback: update map.
124. Goal: Stop/Go Checkpoint 10 (tasks 112–123). Deps: 112-123. Impact: governance. AC: sign-off. Test: checklist. Security: none. Rollback: pause release.
125. Goal: Definition of Done confirmation for P2 (all phases). Deps: 124. Impact: governance. AC: DoD checklist signed; monitoring on; runbooks ready. Test: checklist. Security: none. Rollback: block release until ready.
126. Goal: Stop/Go Checkpoint 11 (final release gate). Deps: 125. Impact: governance. AC: final approval recorded; release authorized. Test: checklist. Security: none. Rollback: delay launch.

## Definitions of Done
- **Phase 0**: Env validation, contract conventions/OpenAPI recreated, auth/policy helpers, sanitizer in place, contract + unit tests passing, checkpoints 1–2 approved.
- **MVP (P0)**: Attachments with visibility, categories, SLA fields, admin SLA CRUD, rate limits, notification stubs, audits for files, checkpoints 3–5 approved, contract tests gating merges.
- **V1 (P1)**: Workers running SLA/notification flows, automation rules, dashboards/widgets, audit coverage, checkpoints 6–7 approved, OpenAPI updated for automation features.
- **V2 (P2)**: Reporting/CSAT, advanced security/perf features, localization groundwork, metrics/alerts, regression and load suites passing, checkpoints 8–11 approved, final release gate cleared.
>>>>>>> theirs
