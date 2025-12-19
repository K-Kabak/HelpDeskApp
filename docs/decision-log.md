# Decision Log (Orchestrator)

| Date | Decision | Rationale | Impact |
| --- | --- | --- | --- |
| 2025-12-19 | Use repository evidence (src/prisma/seed) as canonical current state; missing docs (`data-as-is`, `runbooks`, etc.) treated as unavailable | Only four source docs present; avoid inventing data | Blueprint current-state cites file paths; execution plan assumes gaps |
| 2025-12-19 | Fix dashboard search to target `descriptionMd`/title and add pagination as first MVP changes | UI currently errors on missing `description` field and loads all tickets | Prioritizes stability before new features; tasks PH0-06, P0-01, P0-02, P0-09 |
| 2025-12-19 | Deliver comments via dedicated API with org/role scoping and audits; remove client-only flow | UI posts to missing endpoint causing 404; collaboration blocked | Defines MVP core; tasks P0-03, P0-06, P0-08, P0-10 |
| 2025-12-19 | Stamp SLA times on comment/status transitions and expose badges; defer breach jobs to V1 | SLA timestamps only set on create; breach detection absent | MVP adds accuracy for MTTA/MTTR; jobs arrive in P1-16 |
| 2025-12-19 | Adopt signed-URL attachment strategy with scan/quarantine; store blobs in object storage | No attachment handling exists; security risk if naive upload | Attachments scoped to V1 tasks P1-10..P1-15 with scan/quarantine |
| 2025-12-19 | Centralize org/role authorization helper and audit coverage | Permissions duplicated; risk of drift | Helper applied to tickets/comments/admin; tracked via P0-05, P0-10, P1-05 |
| 2025-12-19 | Observability baseline: structured logs/metrics in MVP, full dashboards later | No logging/metrics; need visibility for new work | MVP tasks P0-12; dashboards/alerts in P1-17 and P2-02 |
| 2025-12-19 | Reporting/analytics postponed to V2 with strict PII controls and watermarks | Current scope lacks requirements; high compliance risk | Reporting tasks P2-01..P2-28 with redaction/watermark policies |
| 2025-12-19 | Stop/Go checkpoints after each major cluster (MVP, V1, V2 midpoints) | Control risk and regressions before larger releases | Checkpoints defined across plans (PH0-15, P0-20, P0-30, P1-30, P2-25) |
