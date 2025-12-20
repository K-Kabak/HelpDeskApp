<<<<<<< ours
# OpenAPI Validation Report (2025-12-19)
=======
# OpenAPI Validation Report (2025-12-20)
>>>>>>> theirs

## Scope validated
- `docs/openapi.yaml`
- `docs/api-contracts-target.md`
<<<<<<< ours
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
=======
- `docs/api-contracts-as-is.md`
- `docs/error-model.md`
- `docs/contract-conventions.md`
- Implemented handlers: `src/app/api/tickets/route.ts`, `src/app/api/tickets/[id]/route.ts`, `src/app/api/tickets/[id]/comments/route.ts`
- Data model reference: `prisma/schema.prisma`

## Mismatches and actions
1. **Idempotency header documented as required but unused in code**
   - Evidence: Ticket creation handler never reads `Idempotency-Key`; it simply parses JSON and creates the ticket.【F:src/app/api/tickets/route.ts†L40-L89】
   - Action: OpenAPI keeps `Idempotency-Key` optional with AS-IS note; target contract continues to require it for future enforcement.【F:docs/openapi.yaml†L312-L352】【F:docs/api-contracts-target.md†L7-L12】

2. **If-Match requirement not implemented**
   - Evidence: PATCH/PUT ticket handler performs role/validation checks without reading `If-Match` or etags.【F:src/app/api/tickets/[id]/route.ts†L8-L197】
   - Action: OpenAPI headers remain optional with explicit AS-IS caveat; target contract keeps optimistic locking as a future change.【F:docs/openapi.yaml†L374-L454】【F:docs/api-contracts-target.md†L7-L11】

3. **Comment endpoint lacks organization scoping**
   - Evidence: Comment creation checks requester/agent roles but never verifies `organizationId` against the ticket, allowing cross-org access if ticket ID is known.【F:src/app/api/tickets/[id]/comments/route.ts†L17-L51】
   - Action: OpenAPI description calls out missing org enforcement; target contract explicitly adds org scoping and idempotency as future work.【F:docs/openapi.yaml†L507-L561】【F:docs/api-contracts-target.md†L12-L12】

4. **Error envelope not aligned with code**
   - Evidence: Handlers return `{ error: string | ZodFlattenedError }` instead of the documented `ErrorResponse` shape.【F:src/app/api/tickets/route.ts†L17-L38】【F:src/app/api/tickets/[id]/route.ts†L25-L110】
   - Action: Shared OpenAPI responses now note the AS-IS error payloads while retaining the normalized target envelope requirement in contracts.【F:docs/openapi.yaml†L57-L71】【F:docs/api-contracts-target.md†L7-L12】

5. **GET /api/tickets payload shape diverges from schema**
   - Evidence: Handler includes full `requester`, `assigneeUser`, and `assigneeTeam` objects via Prisma `include`, which are not modeled in the Ticket schema.【F:src/app/api/tickets/route.ts†L20-L38】
   - Action: OpenAPI description now flags the expanded payload as AS-IS; target contract keeps the flattened Ticket representation and scoping requirement.【F:docs/openapi.yaml†L275-L303】【F:docs/api-contracts-target.md†L7-L12】

6. **Attachment contract exceeds current data model**
   - Evidence: Prisma attachment model lacks `status` and `url` fields assumed by the target Attachment schema; no handlers exist.【F:prisma/schema.prisma†L122-L140】
   - Action: OpenAPI Attachment schema now explicitly notes it is target-only until storage/scan support exists; target contract notes the pending work.【F:docs/openapi.yaml†L110-L137】【F:docs/api-contracts-target.md†L13-L14】

## Remaining verification steps
- Decide idempotency storage and TTL strategy before enforcing headers.
- Define etag format (`updatedAt` hash or version) and 412 error payload before implementing optimistic locking.
- Add organization checks to comment handler and implement listing endpoint to meet documented contract.
- Normalize error responses to the documented `ErrorResponse` envelope or update the contract if the simple `{ error }` shape is retained.
- Confirm whether ticket list responses should include requester/assignee summaries or be flattened to IDs, then align schema and handlers accordingly.
- Extend Prisma Attachment model (status/url) and implement upload/download handlers or revise the target attachment contract.
>>>>>>> theirs
