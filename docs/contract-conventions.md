# Contract Conventions

These conventions describe how the HelpDesk API behaves today and what clients should expect across documented REST endpoints.

## Versioning
- **Path style**: Current endpoints live under `/api` without an explicit version.
- **Breaking changes**: Introduce a new prefix (e.g., `/api/v1`) if a breaking change is required; avoid silent behavior changes on existing paths.

## Authentication & Authorization
- **Mechanism**: NextAuth JWT session stored in secure HTTP-only cookies; handlers call `getServerSession` and return 401 when missing.
- **Claims**: Session includes `user.id`, `user.role`, and `user.organizationId` for authorization checks.
- **Scope model**: Requesters operate on their own tickets; agents/admins operate within their organization. Organization checks are present on ticket list/update; comment creation currently lacks an org check.

## Request/Response Shape
- **Media type**: `application/json` for requests and responses.
- **Timestamps**: ISO-8601 UTC strings in responses. Inputs accept ISO strings where applicable.
- **IDs**: UUID strings for database-backed entities (ticket/user/team/comment/tag).
- **Numbers**: Integers for counters and enum-like fields; enums are uppercase strings matching Prisma enums.
- **Boolean flags**: JSON `true`/`false`; defaults documented per endpoint.
- **Error envelope**: AS-IS handlers return `{ error: string | object }`. Target/desired shape is `{ error: { code, message, details?, traceId? } }` (see `docs/error-model.md`).

## Pagination, Filtering, Sorting
- **AS-IS**: GET `/api/tickets` supports cursor pagination with `limit` (default 10, max 50), `cursor` (base64 payload of `id` + `createdAt`), and `direction` (`next` default, `prev`), plus optional filters `status`, `priority`, `q` (title/descriptionMd contains).
- **Planned**: Add stable total counts and sort options; align cursor format with OpenAPI and expose pagination metadata in responses.

## Idempotency & Concurrency
- **AS-IS**: No idempotency headers or deduplication; repeated POSTs create duplicates. No ETag/If-Match enforcement; updates are last-write-wins.
- **Planned**: Require `Idempotency-Key` on POSTs and `If-Match` on ticket updates when optimistic locking is introduced.

## Error Handling
- **AS-IS**: Handlers return `{ error: "Unauthorized" | "Forbidden" | "Not found" | ZodFlattenedError }` with appropriate HTTP status.
- **Desired**: Use the normalized envelope and code catalog in `docs/error-model.md`.

## Attachments
- **AS-IS**: Attachment model exists; no upload/download routes are implemented.
- **Planned**: Signed-URL upload/download with MIME/size enforcement (max 25MB), AV scan hook, and org-based access checks.

## Webhooks & Events
- No webhooks currently. Target design deferred until an event model exists.

## Localization & Encoding
- UTF-8 throughout; text accepts Markdown for descriptions/comments. No translation APIs.

## Rate Limiting
- None implemented. Future work may add a per-user sliding window (for example, 100 requests/5 min) if required.

## Logging & Audit
- **AS-IS**: Audit events recorded on ticket create/update; not exposed via API.
- **Planned**: Emit audit entries on all mutations and expose a scoped audit listing endpoint.
