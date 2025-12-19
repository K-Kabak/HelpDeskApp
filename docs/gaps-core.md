<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
# Core gaps toward HelpDesk baseline

| Area | Gap | Why it matters | Current evidence | Suggested direction | Dependencies | Complexity | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Comments | No `/api/tickets/[id]/comments` implementation while UI posts to it, causing 404s and blocking collaboration. | Breaks primary workflow of adding updates to tickets. | UI posts to missing endpoint; API directory lacks route. | Add authenticated comments API supporting public/internal flags, validating org ownership and author role. | Prisma comment model; auth session. | M | P0 |
| Ticket search | Dashboard uses non-existent `description` field in Prisma query. | Requests with `q` crash at runtime, preventing search/filter use. | Query references `description`; schema only has `descriptionMd`. | Adjust search to use `descriptionMd` (and optionally comments) with safe pagination. | None. | S | P0 |
| Scalability | Ticket list API returns unbounded results with no pagination/limits. | Large orgs will fetch all tickets, risking timeouts and data leakage via client payload size. | `findMany` without take/skip/filters beyond role. | Introduce pagination params with validation; enforce sane defaults/maximums server-side. | Search filter fix. | M | P1 |
| SLA tracking | SLA due fields set on create but not updated on first response/resolution events. | SLA reports/timers will be inaccurate; cannot detect breaches. | Create sets due times; update API changes status but never sets `firstResponseAt` or recalculates due times. | Add SLA service to stamp first response/resolution timestamps and compute breach flags during comments/status changes. | Comment API; status workflow. | M | P1 |
| Attachments | No upload/download handling or storage abstraction. | Users cannot share diagnostics; security of files undefined. | No attachment code found in app/API search. | Add attachment service (streaming upload, mime/size validation, signed download URLs) using storage provider abstraction. | Auth/session; ticket ownership checks. | L | P2 |
| Admin setup | No admin endpoints/UI to manage teams, users, tags, SLA policies beyond seed data. | Operational setup stuck at seed defaults; cannot onboard new org data. | API folder contains only auth/tickets handlers. | Deliver admin CRUD APIs/pages with org scoping and audit logs. | Auth roles; Prisma models. | M | P2 |
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
# Core Gaps (Repo → Baseline HelpDesk)

| Priority | Area | Gap | Why it matters | Current evidence | Suggested direction | Dependencies | Complexity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | Search/filter | Dashboard searches `description` field that does not exist, causing Prisma error when `q` used. | Breaks search UX and API call when query provided. | Code queries `description` while schema uses `descriptionMd`.【F:src/app/app/page.tsx†L52-L66】【F:prisma/schema.prisma†L94-L120】 | Update search to use `descriptionMd` (or full-text) and add validation tests. | Prisma client, dashboard page. | M |
| P0 | Org isolation | Comment API lacks organization check; agent/admin from other org could comment if ID known. | Cross-tenant data leakage/modification risk. | Ticket fetched without org comparison before authZ checks.【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】 | Enforce ticket.organizationId == session.user.organizationId before proceeding. | Auth/session context. | S |
| P1 | Pagination | Ticket list endpoints return unbounded results. | Large datasets will slow UI and risk timeouts/memory. | `findMany` without take/skip in dashboard and API GET.【F:src/app/app/page.tsx†L52-L73】【F:src/app/api/tickets/route.ts†L27-L35】 | Add limit/offset with cursor params; surface UI controls. | Depends on API contract update. | M |
| P1 | Audit visibility | Audit events written but never exposed. | Lacks traceability for changes. | Audit writes on create/update only.【F:src/app/api/tickets/route.ts†L75-L88】【F:src/app/api/tickets/[id]/route.ts†L172-L197】 | Add audit query API and UI timeline. | Requires secure org scoping. | M |
| P1 | Attachments | Models exist but no upload/download API or UI. | Users cannot add evidence to tickets. | No routes under `src/app/api` for attachments; schema defines model.【F:prisma/schema.prisma†L134-L145】【F:src/app/api/tickets/route.ts†L1-L89】 | Implement storage-backed attachment endpoints with authZ. | Storage provider, auth. | L |
| P2 | Validation | Comment form lacks length/sanitization enforcement beyond min 1 char. | Risk of oversized/abusive content and inconsistent UX. | Client requires only `required`; server min length 1, no size limit.【F:src/app/app/tickets/[id]/comment-form.tsx†L14-L49】【F:src/app/api/tickets/[id]/comments/route.ts†L7-L30】 | Add stricter length limits and sanitization. | None. | S |
| P2 | Reporting/metrics | No reporting endpoints/UI. | Missing operational insight. | No reporting code in app routes/components.【F:src/app/app/page.tsx†L25-L218】 | Define basic KPIs and endpoints later. | Depends on data completeness. | M |
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
