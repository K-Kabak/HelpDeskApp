# OpenAPI Validation Report (2025-12-19)

## Scope validated
- `docs/openapi.yaml`
- `docs/api-contracts-target.md`
- Cross-referenced with conventions (`docs/contract-conventions.md`), error handling (`docs/error-model.md`), and implemented handlers (`src/app/api/tickets/route.ts`, `src/app/api/tickets/[id]/route.ts`, `src/app/api/tickets/[id]/comments/route.ts`).

## Consistency observations
- Error envelope in OpenAPI matches target error model (object with `code`, `message`, `details`, `traceId`) and aligns with conventions; AS-IS handlers still return `{ error: string | object }` noted in contracts.
- Authentication via cookie-based NextAuth sessions is consistently documented across OpenAPI and target contracts per conventions.

## Mismatches vs. code and actions taken
1. **Ticket list lacks pagination/filters AS-IS** — code returns `{ tickets }` sorted by created date with role-based scoping only. Updated OpenAPI with `x-implementation-status` and description clarifying current vs target behavior.【F:docs/openapi.yaml†L292-L360】【F:src/app/api/tickets/route.ts†L16-L38】
2. **Ticket creation response/idempotency gap** — implementation returns 200 and ignores `Idempotency-Key`. Documented current behavior and pending change in OpenAPI description and response code; target contract now highlights the gap.【F:docs/openapi.yaml†L340-L375】【F:docs/api-contracts-target.md†L6-L12】【F:src/app/api/tickets/route.ts†L40-L89】
3. **Ticket detail endpoint missing** — no handler exists; OpenAPI now marks endpoint as planned with explicit note. Target contracts call out absence.【F:docs/openapi.yaml†L375-L405】【F:docs/api-contracts-target.md†L9-L9】
4. **Ticket update lacks etag/If-Match** — handlers allow updates with role checks but no concurrency control; OpenAPI annotated as AS-IS and target contract notes optimistic locking as future change.【F:docs/openapi.yaml†L406-L503】【F:docs/api-contracts-target.md†L8-L11】【F:src/app/api/tickets/[id]/route.ts†L8-L197】
5. **Comments endpoint only supports POST** — no list endpoint and no idempotency. OpenAPI marks GET as planned and clarifies POST returns 200 without idempotency; contracts updated accordingly.【F:docs/openapi.yaml†L504-L590】【F:docs/api-contracts-target.md†L10-L10】【F:src/app/api/tickets/[id]/comments/route.ts†L7-L59】
6. **Attachments/webhooks not implemented** — only Prisma models exist; OpenAPI endpoints marked planned to prevent overpromising. Contracts reiterate plan-only status.【F:docs/openapi.yaml†L591-L677】【F:docs/api-contracts-target.md†L11-L11】

## Remaining verification steps
- Confirm future choices for idempotency storage and etag generation before enforcing headers in code.
- Decide response status (200 vs 201) for create endpoints when upgrading handlers.
- Implement pagination/sorting in ticket list and add comment list/attachment handlers; rerun validation after implementations land.
