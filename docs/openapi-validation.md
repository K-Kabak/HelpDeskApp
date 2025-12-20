# OpenAPI Validation Report (2025-12-20)

## Scope validated
- `docs/openapi.yaml` against `docs/api-contracts-target.md`, `docs/api-contracts-as-is.md`, `docs/error-model.md`, and `docs/contract-conventions.md`.
- Implemented handlers: `/api/tickets` (list/create), `/api/tickets/{id}` (patch/put), `/api/tickets/{id}/comments` (post).

## Findings and actions
1. **Idempotency headers not enforced in code** — Create endpoints accept requests without `Idempotency-Key`. Updated OpenAPI to make the header optional with an AS-IS note and kept target contracts calling out the requirement plus the current gap; future change will flip to required once storage exists.
2. **No etag/If-Match handling in ticket updates** — PATCH/PUT handlers ignore concurrency headers. OpenAPI now marks `If-Match` optional and documents the planned optimistic locking; target contracts continue to require it for the future state.
3. **Comment creation misses organization scoping** — Handler only checks authentication and ticket existence, enabling cross-organization posts when IDs are known. OpenAPI description and target validation findings now flag the gap; target contract mandates org check before role rules.
4. **Pagination/filtering still absent for ticket list** — Confirmed OpenAPI and contracts already describe pagination as target-only and document AS-IS behavior of returning `{ tickets }` without limits; no further change needed.
5. **Error envelope difference** — Target model expects `{ error: { code, message, details?, traceId? } }`, while handlers return `{ error: string | object }`. Recorded as an implementation gap; no OpenAPI change to keep target error standard consistent with conventions.

## Remaining verification steps
- Add idempotency persistence (per conventions/error model), enforce required headers, and update OpenAPI to reflect implementation once shipped.
- Introduce etag generation on tickets and enforce `If-Match` with 412 handling.
- Add organization scoping to comment creation before role checks; retest to confirm cross-org requests are blocked.
- Implement pagination/filtering on ticket list and rerun validation to align responses and parameter defaults.
