# Execution Plan Master


Phases: Phase 0 (foundations), MVP (P0), V1 (P1), V2 (P2). Each task lists goal, dependencies (Deps), impacted areas, acceptance criteria (AC), test proof, security/edge cases, and rollback notes. Stop/go checkpoints appear roughly every 10–15 tasks.

## Phase 0 – Foundations & Environment
001. Goal: Inventory missing specialist docs and confirm scope. Deps: none. Impact: documentation. AC: list of absent inputs + owner. Test: doc review. Security/Edge: none. Rollback: N/A.
002. Goal: Create env validation script (Node 22, pnpm, Postgres). Deps: 001. Impact: devops. AC: script exits non-zero when unmet. Test: run script in CI. Security: avoid leaking secrets. Rollback: delete script.
003. Goal: Add `.env.example` completeness check (DATABASE_URL, NEXTAUTH_SECRET). Deps: 002. Impact: config. AC: lint passes and check fails on missing vars. Test: unit for checker. Security: do not log secrets. Rollback: remove checker.
004. Goal: Document local dev bootstrap steps in README addendum. Deps: 002. Impact: docs. AC: steps reproducible. Test: run commands. Security: none. Rollback: revert doc.
005. Goal: Add infra IaC stub (Docker compose for Postgres/Redis/MinIO). Deps: 002. Impact: infra. AC: `docker compose up` starts services. Test: smoke connection. Security: default creds scoped to local only. Rollback: remove compose services.
006. Goal: CI pipeline skeleton (lint, typecheck placeholder). Deps: 003. Impact: CI. AC: pipeline runs on PR. Test: CI log. Security: mask secrets. Rollback: disable workflow.
007. Goal: Establish coding standards doc (lint/format/commit). Deps: 004. Impact: eng. AC: doc merged. Test: review. Security: none. Rollback: revert doc.
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

