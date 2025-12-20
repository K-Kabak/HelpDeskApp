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
   - Evidence: Ticket creation handler never reads `Idempotency-Key`; it simply parses JSON and creates the ticket.—«…F:src/app/api/tickets/route.ts‘«·L40-L89—«≈
   - Action: OpenAPI keeps `Idempotency-Key` optional with AS-IS note; target contract continues to require it for future enforcement.—«…F:docs/openapi.yaml‘«·L312-L352—«≈—«…F:docs/api-contracts-target.md‘«·L7-L12—«≈

2. **If-Match requirement not implemented**
   - Evidence: PATCH/PUT ticket handler performs role/validation checks without reading `If-Match` or etags.—«…F:src/app/api/tickets/[id]/route.ts‘«·L8-L197—«≈
   - Action: OpenAPI headers remain optional with explicit AS-IS caveat; target contract keeps optimistic locking as a future change.—«…F:docs/openapi.yaml‘«·L374-L454—«≈—«…F:docs/api-contracts-target.md‘«·L7-L11—«≈

3. **Comment endpoint lacks organization scoping**
   - Evidence: Comment creation checks requester/agent roles but never verifies `organizationId` against the ticket, allowing cross-org access if ticket ID is known.—«…F:src/app/api/tickets/[id]/comments/route.ts‘«·L17-L51—«≈
   - Action: OpenAPI description calls out missing org enforcement; target contract explicitly adds org scoping and idempotency as future work.—«…F:docs/openapi.yaml‘«·L507-L561—«≈—«…F:docs/api-contracts-target.md‘«·L12-L12—«≈

4. **Error envelope not aligned with code**
   - Evidence: Handlers return `{ error: string | ZodFlattenedError }` instead of the documented `ErrorResponse` shape.—«…F:src/app/api/tickets/route.ts‘«·L17-L38—«≈—«…F:src/app/api/tickets/[id]/route.ts‘«·L25-L110—«≈
   - Action: Shared OpenAPI responses now note the AS-IS error payloads while retaining the normalized target envelope requirement in contracts.—«…F:docs/openapi.yaml‘«·L57-L71—«≈—«…F:docs/api-contracts-target.md‘«·L7-L12—«≈

5. **GET /api/tickets payload shape diverges from schema**
   - Evidence: Handler includes full `requester`, `assigneeUser`, and `assigneeTeam` objects via Prisma `include`, which are not modeled in the Ticket schema.—«…F:src/app/api/tickets/route.ts‘«·L20-L38—«≈
   - Action: OpenAPI description now flags the expanded payload as AS-IS; target contract keeps the flattened Ticket representation and scoping requirement.—«…F:docs/openapi.yaml‘«·L275-L303—«≈—«…F:docs/api-contracts-target.md‘«·L7-L12—«≈

6. **Attachment contract exceeds current data model**
   - Evidence: Prisma attachment model lacks `status` and `url` fields assumed by the target Attachment schema; no handlers exist.—«…F:prisma/schema.prisma‘«·L122-L140—«≈
   - Action: OpenAPI Attachment schema now explicitly notes it is target-only until storage/scan support exists; target contract notes the pending work.—«…F:docs/openapi.yaml‘«·L110-L137—«≈—«…F:docs/api-contracts-target.md‘«·L13-L14—«≈

## Remaining verification steps
- Decide idempotency storage and TTL strategy before enforcing headers.
- Define etag format (`updatedAt` hash or version) and 412 error payload before implementing optimistic locking.
- Add organization checks to comment handler and implement listing endpoint to meet documented contract.
- Normalize error responses to the documented `ErrorResponse` envelope or update the contract if the simple `{ error }` shape is retained.
- Confirm whether ticket list responses should include requester/assignee summaries or be flattened to IDs, then align schema and handlers accordingly.
- Extend Prisma Attachment model (status/url) and implement upload/download handlers or revise the target attachment contract.
