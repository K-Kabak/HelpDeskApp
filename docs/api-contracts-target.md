# API Contracts (Target)

Target-state contracts derived from current implementation and product goals, emphasizing backward-compatible evolution with explicit migrations.

## Validation Findings (2025-12-19)
- **GET /api/tickets**: Current handler returns `{ tickets }` scoped by requester/organization with no pagination, filtering, or sorting, and always 200.【F:src/app/api/tickets/route.ts†L16-L38】 Target contract adds pagination/filtering and metadata.
- **POST /api/tickets**: Implementation validates title/description/priority/category, computes SLA due dates, writes an audit event, and returns 200 without idempotency headers.【F:src/app/api/tickets/route.ts†L40-L89】 Target requires `Idempotency-Key` and may change status code to 201.
- **PATCH/PUT /api/tickets/{id}**: Supports status/priority/assignee updates with role-based guards; rejects missing status for requesters, invalid assignee/team, or no changes; no `If-Match`/etag logic present (header ignored).【F:src/app/api/tickets/[id]/route.ts†L8-L197】 Target adds optimistic locking and 412 handling.
- **GET /api/tickets/{id}**: No handler exists; target endpoint remains planned.
- **POST /api/tickets/{id}/comments**: Validates `bodyMd` (min 1), optional `isInternal`, enforces role checks but does not verify organization scope, stamps `firstResponseAt` for first public agent comment, and returns 200; no idempotency or listing endpoint implemented.【F:src/app/api/tickets/[id]/comments/route.ts†L7-L59】 Target adds org scoping, optional idempotency, and comment listing.
- **Attachments/Webhooks**: No handlers implemented; models exist only in Prisma. Target design stays marked as planned until storage/scan/webhook plumbing exists.

## Goals
- Stabilize ticketing APIs with pagination, idempotency, and org-safe access controls.
- Introduce attachment handling and audit visibility while preserving existing ticket/comment flows.
- Normalize errors, authentication, and field semantics for predictable clients.

## Authentication & Authorization (Target)
- **Mechanism**: Continue NextAuth session cookies; require `session.user` with `id`, `role`, `organizationId` claims on all endpoints.
- **Roles**: `REQUESTER` (self-service), `AGENT`, `ADMIN`. Admin inherits agent permissions plus org configuration endpoints.
- **Org scope**: All resources (tickets, comments, attachments, audit events) require organization match to session user; unauthorized mismatch returns 404 to avoid leakage.
- **Admin endpoints**: Future CRUD for users/teams/tags/SLA; scoped to organization.

## Endpoint Contracts (Target)
### `GET /api/tickets`
- **Query**: `status`, `priority`, `q` (search `title` + `descriptionMd`), `limit` (default 20, max 100), `offset` (default 0), `sort` (e.g., `createdAt:desc`).
- **AuthZ**: Requester → own tickets; agent/admin → organization tickets.
- **Response**: `{ tickets: Ticket[], page: { limit, offset, total } }`.

### `POST /api/tickets`
- **Idempotency**: Require `Idempotency-Key` header; duplicates return original response for 24h.
- **Body**: `{ title, descriptionMd, priority, category?, tags? }`; enforce min/max lengths (title 3-140, description 3-8000).
- **Logic**: Apply org scope from session; compute SLA due; write audit `TICKET_CREATED`.

### `GET /api/tickets/{id}` (new)
- **Lookup**: Require organization match; 404 otherwise.
- **Response**: Ticket with requester, assignees, comments (paginated), attachments, SLA fields, audit summary counts.

### `PATCH /api/tickets/{id}`
- **Concurrency**: Require `If-Match` with ticket `etag` (hash of updatedAt). Return 412 on mismatch.
- **AuthZ**: Requester may close/reopen own tickets; agent/admin manage status/priority/assignees.
- **Logic**: Recalculate SLA fields on resolution; emit audit with change set.

### `POST /api/tickets/{id}/comments`
- **Idempotency**: Optional `Idempotency-Key` supported for dedupe.
- **AuthZ**: Requester or agent/admin for public comments; internal comments require agent/admin; enforce organization match before checks.
- **Body**: `{ bodyMd, isInternal=false }` with length 1-4000; trim and reject blank.
- **Side effects**: Stamp `firstResponseAt` for first non-internal agent comment; optional notifications hook.

### `GET /api/tickets/{id}/comments`
- **Pagination**: `limit` (default 20, max 100), `cursor` for forward pagination.
- **Visibility**: Requesters see only public comments; agents/admins see all.

### `POST /api/tickets/{id}/attachments`
- **Flow**: Accept metadata `{ fileName, mimeType, sizeBytes }`; validate size (≤25MB) and MIME allowlist. Return signed upload URL plus attachment record in `PENDING` state.
- **Access**: Organization match required; requester allowed when ticket owner; agents/admins allowed for org.
- **Scan**: Require asynchronous AV scan hook; mark attachment status accordingly. Access to downloads only after `CLEAN`.

### `GET /api/tickets/{id}/attachments/{attachmentId}`
- **AuthZ**: Same org check; requesters must own ticket.
- **Response**: Signed download URL with time-limited access; include `mimeType`, `sizeBytes`, `fileName`.

### Audit & Admin (future-ready)
- `GET /api/tickets/{id}/audit-events`: Paginated audit events (organization-scoped). Admin/agent only; requester may see a filtered subset excluding internal notes.
- Admin CRUD endpoints (users, teams, tags, SLA policies) align with org scope and audit logging.

## Data Contracts (Target)
- **Ticket**: `{ id, number, title, descriptionMd, status, priority, category?, requesterId, assigneeUserId?, assigneeTeamId?, organizationId, tags: TagRef[], createdAt, updatedAt, resolvedAt?, closedAt?, firstResponseAt?, firstResponseDue?, resolveDue?, etag }`.
- **Comment**: `{ id, ticketId, authorId, bodyMd, isInternal, createdAt }` (public subset excludes `isInternal=true` for requester).
- **Attachment**: `{ id, ticketId, uploaderId, fileName, mimeType, sizeBytes, url?, status }`.
- **AuditEvent**: `{ id, ticketId, actorId, action, data?, createdAt }`.

## Pagination & Sorting Rules
- Default `limit=20`, `offset=0`; max `limit=100` for list endpoints.
- `sort` format `field:direction` with allowed fields per endpoint (`createdAt`, `priority`, `status`). Invalid sort yields 400.

## Idempotency Rules
- Header `Idempotency-Key` (UUIDv4) required for POST ticket/comment/attachment. Server stores hash + response for 24h keyed by user+path+body hash.
- Replay with same key returns original 2xx response; conflicting body returns 409 `CONFLICT_IDEMPOTENCY_BODY_MISMATCH`.

## Concurrency & Locking
- Ticket resource returns `etag` (hash of `updatedAt`). `PATCH`/`PUT` must include `If-Match`; mismatch → 412 with error code `PRECONDITION_FAILED`.
- Comment/attachment creation unaffected by etag but should reference latest ticket state when needed.

## Attachments Contract
- Max size 25MB; allowed MIME types: common images, PDFs, text logs, zip; block executables.
- Storage via signed URLs (provider-agnostic). Upload URL TTL 15 minutes; download URL TTL 5 minutes.
- Virus scanning webhook updates status `PENDING` → `CLEAN` or `REJECTED`; downloads forbidden unless `CLEAN`.

## Webhooks/Events (Future)
- Outbound webhooks optional per organization with HMAC signature (`X-Webhook-Signature`) and retry backoff (up to 3 attempts). Event types: `ticket.created`, `ticket.updated`, `comment.created`, `attachment.created`, `sla.breached`.

## Quality Gate: Top 30 Contract Decisions
1. Use cookie-based session auth; no bearer tokens to stay aligned with NextAuth. *(AS-IS evidence)*
2. Enforce org match on all ticket/comment/attachment/audit accesses; 404 on mismatch to prevent leakage. *(Design choice)*
3. Require pagination (`limit`, `offset`) on ticket/comment lists with defaults; max limit 100. *(Design choice)*
4. Standardize search to `title` + `descriptionMd`; remove `description` mismatch. *(Design choice addressing bug)*
5. Add `GET /api/tickets/{id}` to return full ticket with relations. *(Design choice)*
6. Require `Idempotency-Key` on POSTs (ticket/comment/attachment). *(Design choice)*
7. Implement `etag`/`If-Match` on ticket updates to avoid lost writes. *(Design choice)*
8. Keep requester permissions limited to close/reopen own tickets; prevent priority/assignee changes. *(AS-IS evidence)*
9. Agents/admins may change status/priority/assignees within org validations. *(AS-IS evidence)*
10. Enforce organization check on comment creation before role logic. *(Addresses known gap)*
11. Public vs internal comment visibility (requester hides internal). *(AS-IS evidence)*
12. Comment body length 1-4000 with trimming; reject blank/oversized. *(Design choice)*
13. Ticket title 3-140, description 3-8000 length constraints. *(Design choice)*
14. SLA due times set on create using org `SlaPolicy`; recompute on priority change. *(AS-IS for create; design extension for update)*
15. Stamp `firstResponseAt` on first non-internal agent comment. *(AS-IS evidence)*
16. Stamp `resolvedAt`/`closedAt` when statuses reach ROZWIAZANE/ZAMKNIETE; clear on reopen. *(AS-IS evidence)*
17. Return audit entries for ticket mutations via new audit list endpoint. *(Design choice)*
18. Attachment uploads require MIME/size allowlist and scan status gating downloads. *(Design choice)*
19. Signed URLs expire quickly (upload 15m, download 5m). *(Design choice)*
20. Error envelope `{ error: { code, message, details?, traceId? } }` across APIs. *(Design choice)*
21. Validation errors use `VALIDATION_FAILED` with Zod-like `fieldErrors`. *(Design choice)*
22. Rate limit defaults (100 requests/5m per user) with 429 error; configurable. *(Design choice)*
23. Responses use ISO timestamps and UUIDs; enums uppercase per Prisma. *(AS-IS evidence)*
24. Pagination metadata returned with list endpoints (`page.total` optional when counting). *(Design choice)*
25. Sorting via `field:direction`; unsupported fields → 400. *(Design choice)*
26. Requesters may view their ticket comments/attachments only; agents/admins view org-wide. *(Design choice informed by current role checks)*
27. Audit events include actorId and before/after change set. *(AS-IS evidence for change set; design for exposure)*
28. Admin CRUD endpoints scoped to organization, audited, and rate-limited. *(Design choice)*
29. No webhook events until storage for signing keys exists; when enabled use HMAC-SHA256. *(Design choice)*
30. Maintain backward compatibility: existing routes stay valid; new constraints (pagination, idempotency, etag) return explicit errors with migration guidance. *(Design choice)*

## Known Unknowns (Verification Steps)
- **NextAuth session cookie names and lifetimes**: Inspect NextAuth config or run `npm run dev` and inspect response headers; review `.nextauth` cookies.
- **Exact login rate limits**: None implemented; verify if hosting stack adds implicit limits by checking deployment proxies/config.
- **Attachment storage provider**: Not implemented; choose provider (S3, GCS, local) after environment decision; verify available credentials.
- **Notification/Webhook infrastructure**: Determine if any message bus is planned; search repo for `webhook`/`queue` references (currently none).
- **Audit event schema details**: Confirm desired `data` shape and redaction rules by reviewing product requirements; currently free-form JSON.
