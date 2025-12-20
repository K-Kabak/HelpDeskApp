# Contract Conventions

These conventions govern API requests/responses, versioning, and cross-cutting behaviors for the HelpDesk app. They apply to REST endpoints documented in this repo.

## Versioning
- **Path style**: Target APIs remain under `/api` with optional future prefix `/api/v1` when breaking changes are needed. AS-IS endpoints are unversioned.
- **Backward compatibility**: Additive changes only for AS-IS; breaking changes require new versioned path and migration notes.

## Authentication & Authorization
- **Session mechanism**: NextAuth JWT session stored in secure HTTP-only cookies; APIs require authenticated session (`session.user` present).【F:src/lib/auth.ts†L18-L77】
- **Role claims**: Session exposes `user.id`, `user.role`, and `user.organizationId` for scoping checks.【F:src/lib/auth.ts†L60-L77】
- **Scopes model**: Organization-level isolation; requesters limited to their own tickets, agents/admins operate within their organization by default.【F:src/app/api/tickets/route.ts†L16-L38】【F:src/app/api/tickets/[id]/route.ts†L35-L82】

## Request/Response Shape
- **Media type**: `application/json` for all documented endpoints.
- **Timestamps**: ISO-8601 UTC strings in responses. Inputs accept ISO strings where applicable.
- **IDs**: UUID strings for database-backed entities (ticket/user/team/comment/tag).
- **Numbers**: Integers for counters and enum-like fields; enums conveyed as uppercase strings matching Prisma enums.
- **Boolean flags**: JSON `true`/`false`; defaults documented per endpoint.

## Pagination, Filtering, Sorting
- **AS-IS**: Ticket list endpoints have no pagination; filtering limited to status/priority/search in dashboard, and none server-side for GET `/api/tickets` beyond role scope.【F:src/app/api/tickets/route.ts†L16-L38】【F:src/app/app/page.tsx†L37-L73】
- **Target**: Standard `limit` (default 20, max 100), `offset`, `sort` (e.g., `createdAt:desc`) query params; filters `status`, `priority`, `q` using `descriptionMd` and `title` with case-insensitive match.

## Idempotency & Concurrency
- **AS-IS**: No idempotency keys or concurrency controls; repeated POSTs create duplicates, and last-write-wins updates.
- **Target**: Require `Idempotency-Key` header on POST ticket/comment/attachment. Store keyed hashes with 24h TTL. Use `ETag`/`If-Match` for ticket updates to prevent lost updates.

## Error Handling
- **AS-IS**: Errors returned as `{ error: string | object }` with HTTP status (401/403/404/400) per handler.【F:src/app/api/tickets/route.ts†L16-L88】【F:src/app/api/tickets/[id]/comments/route.ts†L16-L59】
- **Target**: Standard envelope `{ error: { code, message, details?, traceId? } }`; see `docs/error-model.md`.

## Attachments
- **AS-IS**: Attachment model exists but no upload/download endpoints implemented.【F:prisma/schema.prisma†L134-L145】
- **Target**: Signed-URL upload/download with MIME/size enforcement (max 25MB), AV scan hook, and org-based access checks.

## Webhooks & Events
- No webhooks currently. Target design defers until event model exists.

## Localization & Encoding
- UTF-8 throughout; text accepts Markdown for descriptions/comments. No translation APIs.

## Rate Limiting
- None implemented. Target convention: per-user sliding window (e.g., 100 requests/5 min) configurable per route.

## Logging & Audit
- **AS-IS**: Audit events on ticket create/update only.【F:src/app/api/tickets/route.ts†L64-L88】【F:src/app/api/tickets/[id]/route.ts†L172-L197】 Not exposed via API.
- **Target**: All mutating endpoints emit audit entries with actor, action, change set, and correlation IDs; audit listing endpoint scoped to organization.
