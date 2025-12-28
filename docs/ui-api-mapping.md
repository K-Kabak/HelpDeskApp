# UI <-> API Contract Mapping

Sources: `docs/ui-ux-spec.md`, `docs/ux-acceptance.md`, `docs/openapi.yaml`, `docs/api-contracts-target.md`, `docs/error-model.md`, `docs/blueprint-master.md`. Target error envelope: `{ "error": { code, message, details?, traceId? } }`. "Proposed" marks target endpoints/flows not yet implemented; unknown details are called out.

## Authentication and Session
1) **Login submit (`/login`)** — Purpose: authenticate and redirect to `/app`.
   - Endpoint: `POST /api/auth/[...nextauth]` (NextAuth credentials).
   - Request: `{"email":"user@org.com","password":"***","callbackUrl":"/app"}`.
   - Response: 302 to `/app` on success; `{ error: "Invalid credentials" }` (AS-IS) or `{ error:{ code:"AUTH_REQUIRED", message } }` target.
   - Errors shown: inline form message for bad creds; network/500 -> banner.
   - Permissions/Auth: public; establishes session with role + organization.
   - Loading/Empty/Error states: button shows loading label during submit; cleared on error.

2) **Protected route guard (`/app`, `/app/tickets/*`)** — Purpose: block unauthenticated users.
   - Endpoint: server `getServerSession` (middleware).
   - Request: cookie `next-auth.session-token`.
   - Response: redirect to `/login` when missing session.
   - Errors shown: none in-page; redirect handles 401.
   - Permissions/Auth: requires authenticated session.
   - Loading/Empty/Error states: protected content not rendered until session resolved.

3) **Logout** — Purpose: end session and return to login.
   - Endpoint: `POST /api/auth/signout` (NextAuth).
   - Request: `{"callbackUrl":"/login"}`.
   - Response: redirect to `/login`.
   - Errors shown: toast/banner on failure (UI to surface).
   - Permissions/Auth: any signed-in user.
   - Loading/Empty/Error states: sign-out control disabled while pending.

## Dashboard List (`/app`)
4) **Initial list load (requester scope)** — Purpose: show only requester tickets.
   - Endpoint: `GET /api/tickets`.
   - Request: none (AS-IS); target supports `status`, `priority`, `q`, `limit`, `offset`, `sort`.
   - Response: `{ tickets:[{ id, number, title, status, priority, requester, assigneeUser, assigneeTeam, createdAt }] }` (AS-IS lacks page meta).
   - Errors shown: 401 redirect; 500 toast/banner.
   - Permissions/Auth: role REQUESTER; server enforces `requesterId = session.user.id`.
   - Loading/Empty/Error states: skeleton cards while fetching; empty card CTA when none; error banner with retry on failure.

5) **Initial list load (agent/admin scope)** — Purpose: show organization tickets.
   - Endpoint: `GET /api/tickets`.
   - Request: none (AS-IS); same target filters/pagination as entry 4.
   - Response: `{ tickets:[...org tickets...] }`.
   - Errors shown: 401 redirect; 500 toast.
   - Permissions/Auth: AGENT or ADMIN; scoped by `organizationId`.
   - Loading/Empty/Error states: same as entry 4.

6) **Status filter** — Purpose: narrow list by status.
   - Endpoint: `GET /api/tickets?status=NOWE` (target also allows pagination params).
   - Request: query `status` enum.
   - Response: filtered tickets; target adds `{ page:{ limit, offset, total } }`.
   - Errors shown: 400 `VALIDATION_FAILED` (target) or ignored value AS-IS; 401 redirect.
   - Permissions/Auth: authenticated per role scope.
   - Loading/Empty/Error states: select shows active value; loader on refetch; empty CTA when no matches.

7) **Priority filter** — Purpose: narrow list by priority.
   - Endpoint: `GET /api/tickets?priority=WYSOKI`.
   - Request/Response: same pattern as status filter.
   - Errors shown: 400 `VALIDATION_FAILED` (target) or ignored AS-IS; 401 redirect.
   - Permissions/Auth: authenticated.
   - Loading/Empty/Error states: dropdown retains selection; empty CTA when none.

8) **Text search** — Purpose: search title + descriptionMd.
   - Endpoint: `GET /api/tickets?q=network` (AS-IS incorrectly uses `description`; target corrects to `descriptionMd`).
   - Request: query `q`.
   - Response: filtered tickets; target paginated.
   - Errors shown: 400 `VALIDATION_FAILED` (target) for bad params; 500 toast; AS-IS bug may return empty due to wrong field.
   - Permissions/Auth: authenticated per scope.
   - Loading/Empty/Error states: input retains query; loader during fetch; empty card when no matches; retry on error.

9) **Pagination controls (Proposed)** — Purpose: bound result size.
   - Endpoint: `GET /api/tickets?limit=20&offset=20&sort=createdAt:desc`.
   - Request: `limit` default 20 (max 100), `offset` >=0.
   - Response: `{ tickets:[...], page:{ limit, offset, total } }` (target only).
   - Errors shown: 400 `VALIDATION_FAILED` for out-of-range; 401 redirect.
   - Permissions/Auth: authenticated per scope.
   - Loading/Empty/Error states: next/prev disabled while loading; "No more results" at end; empty CTA when total zero.

10) **Empty-state CTA** — Purpose: guide creation when no tickets.
   - Endpoint: navigation to `/app/tickets/new` (no API until submit).
   - Request/Response: depends on list entries above.
   - Errors shown: none beyond list errors.
   - Permissions/Auth: authenticated.
   - Loading/Empty/Error states: CTA visible only when list empty; hide on fetch error until resolved.

11) **Quick create submit (success)** — Purpose: inline ticket creation.
   - Endpoint: `POST /api/tickets`.
   - Request: `{"title":"VPN reset","descriptionMd":"Need access","priority":"SREDNI","category":"IT"}`.
   - Response: `{ ticket:{ id, number, status:"NOWE", priority, requesterId, createdAt, firstResponseDue, resolveDue } }` (AS-IS 200; target 201 + `etag`).
   - Errors shown: 400 `VALIDATION_FAILED` with fieldErrors; 401 `AUTH_REQUIRED`.
   - Permissions/Auth: any authenticated role.
   - Loading/Empty/Error states: submit shows spinner text; fields disabled; success toast + reset + list refresh; on error, values preserved.

12) **Quick create validation failure** — Purpose: block bad input.
   - Endpoint: client guard plus `POST /api/tickets` returning 400 when server detects invalid.
   - Request: too-short title/description or missing priority.
   - Response: `{ error:{ code:"VALIDATION_FAILED", details:{ fieldErrors } } }`.
   - Errors shown: inline messages and toast/banner.
   - Permissions/Auth: authenticated.
   - Loading/Empty/Error states: loading cleared; inputs preserved.

13) **Quick create unauthorized/session expired** — Purpose: handle expired auth.
   - Endpoint: `POST /api/tickets`.
   - Response: 401 `{ error:"Unauthorized" }` AS-IS or `{ error:{ code:"AUTH_REQUIRED" } }` target.
   - Errors shown: toast and prompt to re-login.
   - Permissions/Auth: session required.
   - Loading/Empty/Error states: form re-enabled after failure; no clear of fields.

14) **Full create page (`/app/tickets/new`)** — Purpose: same creation with full form/preview.
   - Endpoint: `POST /api/tickets`.
   - Request/Response: same as entry 11.
   - Errors shown: 400 validation; 401 auth required.
   - Permissions/Auth: authenticated.
   - Loading/Empty/Error states: preview toggle; submit disables form; success redirects to detail with toast; error banner preserves input.

## Ticket Detail (`/app/tickets/{id}`)
15) **Detail load (owner requester)** — Purpose: view own ticket without internal notes.
   - Endpoint: planned `GET /api/tickets/{id}` (server fetch mimics).
   - Request: path `{id}`; target supports comment pagination params.
   - Response: `{ ticket:{ ..., comments:[public only], requester, assigneeUser, assigneeTeam } }`.
   - Errors shown: 404 `NOT_FOUND` on other users' ticket or cross-org; 401 redirect.
   - Permissions/Auth: REQUESTER must own ticket.
   - Loading/Empty/Error states: skeleton header/timeline; empty comments message; 404 page when not allowed.

16) **Detail load (agent/admin)** — Purpose: view full ticket with internal comments and controls.
   - Endpoint: planned `GET /api/tickets/{id}`.
   - Response: includes internal comments, SLA fields, assignment lists.
   - Errors shown: 404 for cross-org/missing; 401 redirect.
   - Permissions/Auth: AGENT or ADMIN scoped to organization.
   - Loading/Empty/Error states: same skeleton; controls enabled after data load.

17) **Status update (agent/admin)** — Purpose: manage lifecycle.
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: `{"status":"W_TOKU"}` with optional `If-Match` (target required).
   - Response: `{ ticket:{ status, resolvedAt?, closedAt?, etag? } }`.
   - Errors shown: 403 `FORBIDDEN` if role not allowed; 400 `VALIDATION_FAILED` for missing/unchanged status; 404 cross-org; 412 `PRECONDITION_FAILED` when `If-Match` mismatches (target).
   - Permissions/Auth: AGENT or ADMIN.
   - Loading/Empty/Error states: control disabled while pending; toast on success/error; refresh updates labels.

18) **Status update (requester close/reopen)** — Purpose: allow owner to close/reopen.
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: `{"status":"ZAMKNIETE"}` or `{"status":"PONOWNIE_OTWARTE"}`.
   - Response: same shape as entry 17.
   - Errors shown: 403 `FORBIDDEN` for disallowed status; 400 `VALIDATION_FAILED` for missing status; 404 cross-org.
   - Permissions/Auth: REQUESTER on own ticket only.
   - Loading/Empty/Error states: helper text clarifies limits; disabled when unchanged; toast on result.

19) **Priority change (agent/admin)** — Purpose: adjust urgency and SLA timers.
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: `{"priority":"KRYTYCZNY"}`.
   - Response: `{ ticket:{ priority, firstResponseDue, resolveDue } }`.
   - Errors shown: 403 requester blocked; 400 unchanged/invalid; 404 cross-org; 412 if etag mismatch (target).
   - Permissions/Auth: AGENT or ADMIN.
   - Loading/Empty/Error states: select disabled during submit; toast feedback.

20) **Assignment update (agent/admin)** — Purpose: set assignee user/team.
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: `{"assigneeUserId":"uuid|null","assigneeTeamId":"uuid|null"}` (org-validated).
   - Response: `{ ticket:{ assigneeUserId, assigneeTeamId } }`.
   - Errors shown: 403 requester blocked; 400 `INVALID_ASSIGNEE`/`INVALID_TEAM` (AS-IS string errors); 404 for ids outside org.
   - Permissions/Auth: AGENT or ADMIN.
   - Loading/Empty/Error states: save enabled only on change; loading text while pending; toast on result.

21) **No-change submission guard** — Purpose: prevent empty PATCH.
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: `{}` or unchanged values.
   - Response: 400 `{ error:"No updates provided" }` AS-IS or `{ code:"VALIDATION_FAILED" }` target.
   - Errors shown: toast/banner describing no change.
   - Permissions/Auth: authenticated per above.
   - Loading/Empty/Error states: controls stay enabled; values preserved.

22) **Detail not found/forbidden** — Purpose: render 404 when ticket missing or cross-org.
   - Endpoint: planned `GET /api/tickets/{id}` or server fetch.
   - Response: 404 `NOT_FOUND`.
   - Errors shown: 404 page; no ticket data leaked.
   - Permissions/Auth: triggered on scope violation or missing ticket.
   - Loading/Empty/Error states: shows 404 template; back link to `/app`.

## Comments
23) **Public comment submit** — Purpose: add visible timeline entry.
   - Endpoint: `POST /api/tickets/{id}/comments`.
   - Request: `{"bodyMd":"Update...","isInternal":false}` with optional `Idempotency-Key` (target optional).
   - Response: `{ comment:{ id, ticketId, bodyMd, isInternal:false, createdAt } }`; stamps `firstResponseAt` for first public agent comment.
   - Errors shown: 400 `VALIDATION_FAILED`; 401 `AUTH_REQUIRED`; 403 for role/ownership; 404 cross-org ticket.
   - Permissions/Auth: requester on own ticket; agent/admin on org ticket.
   - Loading/Empty/Error states: button shows loading; textarea cleared on success; toast on success/error; optimistic insert may roll back on failure per UX acceptance.

24) **Internal comment (agent/admin)** — Purpose: private note hidden from requester.
   - Endpoint: `POST /api/tickets/{id}/comments`.
   - Request: `{"bodyMd":"Internal note","isInternal":true}`.
   - Response: `{ comment:{ isInternal:true } }`.
   - Errors shown: 403 `FORBIDDEN` if requester attempts; 400 validation; 404 cross-org.
   - Permissions/Auth: AGENT or ADMIN only; org match required (target adds explicit check).
   - Loading/Empty/Error states: internal checkbox only for allowed roles; form disabled while pending; toast on result.

25) **Comment validation failure** — Purpose: preserve input and show errors.
   - Endpoint: `POST /api/tickets/{id}/comments`.
   - Request: `{"bodyMd":""}` or missing.
   - Response: 400 `{ error:{ code:"VALIDATION_FAILED", details:{ fieldErrors:{ bodyMd:["Required"] } } } }`.
   - Errors shown: toast/banner; inline helper near composer.
   - Permissions/Auth: authenticated.
   - Loading/Empty/Error states: loading cleared; textarea content preserved for retry.

26) **Comment listing (Proposed)** — Purpose: paginate timeline.
   - Endpoint: `GET /api/tickets/{id}/comments?limit=20&cursor=abc` (not implemented).
   - Request: `limit` default 20 (max 100), optional `cursor`.
   - Response: `{ comments:[...], page:{ limit, cursor } }`; requester sees only public comments.
   - Errors shown: 400 `VALIDATION_FAILED`; 401/403/404 per scope.
   - Permissions/Auth: requester on own ticket; agent/admin on org ticket.
   - Loading/Empty/Error states: loader on fetch; "Brak komentarzy." empty message; "Load more" disabled while pending; retry on error.

## Attachments (Proposed)
27) **Attachment upload request** — Purpose: get signed URL before upload.
   - Endpoint: `POST /api/tickets/{id}/attachments`.
   - Request: headers `Idempotency-Key` (required target); body `{"fileName":"log.txt","mimeType":"text/plain","sizeBytes":12345}`.
   - Response: 201 `{ attachment:{ id,status:"PENDING",mimeType,sizeBytes,fileName }, uploadUrl:"https://..." }`.
   - Errors shown: 400 `UNPROCESSABLE_ATTACHMENT` for size/MIME; 401/403/404 for auth/scope; 409 `CONFLICT_IDEMPOTENCY_BODY_MISMATCH` if key reused with different body (target).
   - Permissions/Auth: requester if owns ticket; agent/admin for org ticket.
   - Loading/Empty/Error states: upload control shows spinner; block client-side when file invalid per UX acceptance; toast on result.

28) **Attachment download** — Purpose: fetch signed link for viewing.
   - Endpoint: `GET /api/tickets/{id}/attachments/{attachmentId}`.
   - Request: path ids.
   - Response: `{ attachment:{ id,status,mimeType,sizeBytes,fileName,url? }, downloadUrl:"https://..." }` (allowed when status CLEAN).
   - Errors shown: 401/403/404 per scope; possible 409 if not CLEAN (behavior TBD).
   - Permissions/Auth: requester must own ticket; agent/admin within org.
   - Loading/Empty/Error states: download action shows spinner/disabled; toast on failure.

## Admin and Reporting (Proposed/Unknown)
29) **Admin users management (`/app/admin/users`)** — Purpose: list/create/edit users.
   - Endpoint: planned `GET/POST/PATCH /api/admin/users` (not in OpenAPI).
   - Request: list filters; create `{"email","name","role","teamIds":[]}`.
   - Response: `{ users:[...], page? }` or `{ user }`.
   - Errors shown: 401/403 non-admin; 400 validation; 409 duplicate email.
   - Permissions/Auth: ADMIN only.
   - Loading/Empty/Error states: table skeleton; modal save spinner; empty helper copy; error banner on failure.

30) **Admin teams management** — Purpose: manage teams/membership.
   - Endpoint: planned `GET/POST/PATCH/DELETE /api/admin/teams`.
   - Request: `{ name, memberIds }`.
   - Response: `{ teams:[...] }` or `{ team }`.
   - Errors shown: 400 when deleting team in use; 403 non-admin.
   - Permissions/Auth: ADMIN.
   - Loading/Empty/Error states: confirmation modal; disable delete on linked tickets; loader on save.

31) **Admin tags/categories** — Purpose: manage tags with safeguards.
   - Endpoint: planned `GET/POST/PATCH/DELETE /api/admin/tags`.
   - Request: `{ name }`.
   - Response: `{ tags:[...] }` or `{ tag }`.
   - Errors shown: 400 "Tag in use" when delete blocked; 403 non-admin.
   - Permissions/Auth: ADMIN.
   - Loading/Empty/Error states: list updates after save; empty helper; delete disabled when linked.

32) **Admin SLA policies** — Purpose: configure SLA per priority.
   - Endpoint: planned `GET/POST/PATCH /api/admin/sla-policies`.
   - Request: `{"priority":"WYSOKI","firstResponseHours":1,"resolveHours":8}`.
   - Response: `{ policy }`.
   - Errors shown: 409 duplicate priority; 400 validation; 403 non-admin.
   - Permissions/Auth: ADMIN.
   - Loading/Empty/Error states: form spinner; inline errors; empty state explains impact.

33) **Audit log viewer** — Purpose: show change history.
   - Endpoint: planned `GET /api/admin/audit-events`.
   - Request: filters `?ticketId&actorId&limit&offset`.
   - Response: `{ events:[{ action, actorId, data, createdAt }], page }`.
   - Errors shown: 403 non-admin; 400 validation.
   - Permissions/Auth: ADMIN (requester/agent subset TBD).
   - Loading/Empty/Error states: pagination/infinite scroll; empty message; retry on error.

34) **Reports dashboard (`/app/reports` or admin home)** — Purpose: load KPIs/widgets.
   - Endpoint: planned `GET /api/admin/reports/summary?dateRange=2025-01-01,2025-01-31&team=IT`.
   - Request: query filters.
   - Response: `{ kpis:{...}, charts:[...] }`.
   - Errors shown: 403 non-admin; 400 invalid params.
   - Permissions/Auth: ADMIN.
   - Loading/Empty/Error states: skeleton cards; error banner + retry; "No data" placeholders.

35) **Reporting drilldown** — Purpose: open filtered ticket list from widget.
   - Endpoint: planned `GET /api/admin/reports/tickets?status=W_TOKU&dateRange=...`.
   - Request/Response: similar to ticket list with pagination `{ tickets, page }`.
   - Errors shown: 403/400 as above.
   - Permissions/Auth: ADMIN.
   - Loading/Empty/Error states: table loading; empty message when no matches; retry on error.

36) **Export request** — Purpose: queue CSV export of report/list.
   - Endpoint: planned `POST /api/admin/reports/export`.
   - Request: `{"filters":{"status":"W_TOKU"},"format":"csv"}`.
   - Response: `{ exportId, status:"queued" }`; follow-up planned `GET /api/admin/reports/export/{id}` for download.
   - Errors shown: 403 non-admin; 400 validation; 413 too large (TBD).
   - Permissions/Auth: ADMIN.
   - Loading/Empty/Error states: progress indicator; disable export button while pending; toast on completion/failure.

37) **Saved views (Implemented)** — Purpose: persist dashboard filter presets.
   - Endpoint: `POST/GET/PATCH/DELETE /api/views` (implemented).
   - Request: `{"name":"My queue","filters":{"status":"NOWE","priority":"WYSOKI"}}`.
   - Response: `{ viewId, name, filters }`.
   - Errors shown: 400 invalid filters; 403 if role restricted (TBD).
   - Permissions/Auth: authenticated, org-scoped.
   - Loading/Empty/Error states: tab/save button spinner; empty helper text; toast on save/error.

38) **CSV export delivery** — Purpose: fetch ready export link.
   - Endpoint: planned `GET /api/admin/reports/export/{id}` (Proposed).
   - Request: path `{id}`.
   - Response: `{ downloadUrl, status }` when ready.
   - Errors shown: 404 invalid id; 403 non-admin; 425/202 while processing (behavior TBD).
   - Permissions/Auth: ADMIN.
   - Loading/Empty/Error states: polling indicator; disable download until ready; error toast on failure.
