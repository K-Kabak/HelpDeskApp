# OpenAPI Validation Report (2025-12-20)

## Scope validated
- `docs/openapi.yaml`
- `docs/api-contracts-target.md`
- `docs/api-contracts-as-is.md`
- `docs/error-model.md`
- `docs/contract-conventions.md`
- Implemented handlers: `src/app/api/tickets/route.ts`, `src/app/api/tickets/[id]/route.ts`, `src/app/api/tickets/[id]/comments/route.ts`
- Data model reference: `prisma/schema.prisma`

## Mismatches and actions
1. **Idempotency header documented as required but unused in code**
   - Evidence: Ticket creation handler never reads `Idempotency-Key`; it simply parses JSON and creates the ticket.【F:src/app/api/tickets/route.ts†L40-L88】
   - Action: OpenAPI keeps `Idempotency-Key` optional with AS-IS note; target contract continues to require it for future enforcement.【F:docs/openapi.yaml†L345-L359】【F:docs/api-contracts-target.md†L6-L7】

2. **If-Match requirement not implemented**
   - Evidence: PATCH/PUT ticket handler performs role/validation checks without reading `If-Match` or etags.【F:src/app/api/tickets/[id]/route.ts†L8-L197】
   - Action: OpenAPI headers remain optional with explicit AS-IS caveat; target contract keeps optimistic locking as a future change.【F:docs/openapi.yaml†L414-L457】【F:docs/api-contracts-target.md†L8-L11】

3. **Comment endpoint lacks organization scoping**
   - Evidence: Comment creation checks requester/agent roles but never verifies `organizationId` against the ticket, allowing cross-org access if ticket ID is known.【F:src/app/api/tickets/[id]/comments/route.ts†L16-L39】
   - Action: OpenAPI description calls out missing org enforcement; target contract explicitly adds org scoping and idempotency as future work.【F:docs/openapi.yaml†L511-L561】【F:docs/api-contracts-target.md†L10-L10】

4. **Error envelope not aligned with code**
   - Evidence: Handlers return `{ error: string | ZodFlattenedError }` instead of the documented `ErrorResponse` shape.【F:src/app/api/tickets/route.ts†L17-L38】【F:src/app/api/tickets/[id]/route.ts†L25-L110】
   - Action: Shared OpenAPI responses note the AS-IS error payloads while retaining the normalized target envelope requirement in contracts.【F:docs/openapi.yaml†L63-L76】【F:docs/api-contracts-target.md†L11-L11】

5. **GET /api/tickets payload shape diverges from schema**
   - Evidence: Handler includes expanded `requester`, `assigneeUser`, and `assigneeTeam` objects and omits `tags`, which differs from the documented Ticket schema.【F:src/app/api/tickets/route.ts†L20-L38】
   - Action: OpenAPI description flags the expanded/omitted fields as AS-IS; target contract keeps the flattened Ticket representation with tags.【F:docs/openapi.yaml†L295-L303】【F:docs/api-contracts-target.md†L12-L13】

6. **Ticket creation ignores `tags`**
   - Evidence: Create schema omits `tags`, and the handler never persists or returns them.【F:src/app/api/tickets/route.ts†L9-L88】
   - Action: OpenAPI marks `tags` as target-only in the schema and POST description; target contract retains tag assignment as a requirement.【F:docs/openapi.yaml†L169-L190】【F:docs/openapi.yaml†L345-L359】【F:docs/api-contracts-target.md†L6-L7】

7. **Attachment contract exceeds current data model**
   - Evidence: Prisma attachment model lacks `status` and `url` fields assumed by the target Attachment schema; no handlers exist.【F:prisma/schema.prisma†L122-L140】
   - Action: OpenAPI Attachment schema notes target-only fields until storage/scan support exists; target contract notes the pending work.【F:docs/openapi.yaml†L239-L270】【F:docs/api-contracts-target.md†L13-L14】

8. **GET /api/tickets/{id} OpenAPI previously advertised pagination params**
   - Evidence: There is no GET handler, and the planned single-resource endpoint should not accept `limit`/`offset`.【F:src/app/api/tickets/[id]/route.ts†L1-L197】
   - Action: Removed `limit`/`offset` query parameters from the OpenAPI spec to align with target behavior and current code reality (endpoint still planned).【F:docs/openapi.yaml†L380-L410】

## Remaining verification steps
- Decide idempotency storage and TTL strategy before enforcing headers.
- Define etag format (`updatedAt` hash or version) and 412 error payload before implementing optimistic locking.
- Add organization checks to comment handler and implement listing endpoint to meet documented contract.
- Normalize error responses to the documented `ErrorResponse` envelope or update the contract if the simple `{ error }` shape is retained.
- Implement tag parsing/persistence on ticket create and return tags in ticket list responses to match the target schema.
- Implement `GET /api/tickets/{id}` with org-scoped detail response per target contract.
- Confirm whether ticket list responses should include requester/assignee summaries or be flattened to IDs, then align schema and handlers accordingly.
- Extend Prisma Attachment model (status/url) and implement upload/download handlers or revise the target attachment contract.
