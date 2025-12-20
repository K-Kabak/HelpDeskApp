# Decision Log

| # | Decision | Rationale | Impact |
|---|-----------|-----------|--------|
| 1 | Proceeded without source specialist docs (`docs/current-state.md`, `docs/api-as-is.md`, etc.) because they were absent in the repo; treated blueprint as consolidation of code evidence + README. | Required inputs not present; using live code avoids speculation and keeps evidence-backed statements. | Documented unknowns and added verification tasks in plan to backfill missing source intent. |
| 2 | Kept Polish UI terminology in target spec while describing new features in English. | UI copy in repo is Polish; retaining terminology avoids inconsistent localization while enabling clear planning. | Minimizes translation risk; localization work flagged as later enhancement if needed. |
| 3 | Chose S3-compatible storage with AV sidecar for attachments. | Matches cloud-agnostic needs and security baselines; not present today. | Added migration and ops tasks for storage, scanning, and signed URLs. |
| 4 | Introduced BullMQ/Redis workers for SLA/notification timers. | Current app lacks async processing; SLA and notification reliability need background jobs. | Added infra dependencies and worker health checkpoints in execution plan. |
| 5 | Added governance for admin actions (audit, rate limits) and org-scoped policies. | Current APIs already enforce org isolation for tickets; extending this pattern reduces cross-tenant risk. | Tasks created for shared policy module and audit coverage. |
| 6 | Standardized test proof expectations (unit/integration/E2E + screenshots). | Ensures delivery quality and regression safety given previous placeholders for tests. | Plan includes gates per phase to enforce coverage. |
| 7 | Added stop/go checkpoints every 10–15 tasks. | Required by brief; ensures incremental validation and scope control. | Embedded into WBS with rollback notes per task. |

# Decision Log
| # | Decision | Rationale | Impact | Follow-up |
|---|-----------|-----------|--------|-----------|
| 1 | Proceeded without specialist inputs (`docs/current-state.md`, `docs/api-as-is.md`, etc.) because they are absent in the repo. | Only README, schema, and code are available; avoiding speculation maintains evidence-backed statements. | Blueprint and plan are based on live code; unknowns captured in master-audit. | If source docs surface, re-sync blueprint and plan within 1 business day. |
| 2 | Treated README + Prisma schema + API/UI code as authoritative current-state evidence. | These files are the only consistent sources with executable semantics. | Citations in blueprint anchor to these files; execution plan tasks reference observed gaps. | Keep citations updated after major refactors. |
| 3 | Kept attachment/storage/reporting features as target-only, not assumed present. | README lists them as TODO; no implementation found. | Execution plan phases attachments in MVP, reporting in later phases. | Re-evaluate priorities after discovery/UX validation. |
| 4 | Added security hardening (sanitization, rate limiting, auth guards) to MVP scope. | API/UI currently lack sanitizer/rate-limit wiring; risk of XSS/abuse. | Dedicated tasks in MVP/V1 for mitigations and tests. | Validate with security review before GA. |
| 5 | Phased delivery (Phase 0, MVP/P0, V1/P1, V2/P2) with stop/go checkpoints every ~10 tasks. | Reduces risk given missing specs and evolving requirements. | Checkpoints embedded in execution-plan-master.md; DoD per phase defined. | Governance to enforce checkpoint reviews. |
