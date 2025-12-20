# OpenAPI Validation Report (2025-12-20)

## Scope validated
- `docs/openapi.yaml`
- `docs/api-contracts-target.md`
- `docs/api-contracts-as-is.md`
- `docs/error-model.md`
- `docs/contract-conventions.md`
- Implemented handlers: `src/app/api/tickets/route.ts`, `src/app/api/tickets/[id]/route.ts`, `src/app/api/tickets/[id]/comments/route.ts`

## Mismatches and actions
1. **Idempotency header documented as required but unused in code**
   - Evidence: Ticket creation handler never reads `Idempotency-Key`; it simply parses JSON and creates the ticket.【F:src/app/api/tickets/route.ts†L40-L89】
   - Action: OpenAPI now marks `Idempotency-Key` as optional with AS-IS note; target contract continues to require it for future enforcement.【F:docs/openapi.yaml†L331-L352】【F:docs/api-contracts-target.md†L7-L12】

2. **If-Match requirement not implemented**
   - Evidence: PATCH/PUT ticket handler performs role/validation checks without reading `If-Match` or etags.【F:src/app/api/tickets/[id]/route.ts†L8-L197】
   - Action: OpenAPI headers changed to optional with explicit AS-IS caveat; target contract keeps optimistic locking as a future change.【F:docs/openapi.yaml†L393-L454】【F:docs/api-contracts-target.md†L7-L11】

3. **Comment endpoint lacks organization scoping**
   - Evidence: Comment creation checks requester/agent roles but never verifies `organizationId` against the ticket, allowing cross-org access if ticket ID is known.【F:src/app/api/tickets/[id]/comments/route.ts†L17-L51】
   - Action: OpenAPI description now calls out missing org enforcement; target contract explicitly adds org scoping and idempotency as future work.【F:docs/openapi.yaml†L523-L561】【F:docs/api-contracts-target.md†L12-L12】

4. **Ticket responses document tags/etag/page metadata not returned by code**
   - Evidence: Ticket list handler returns `{ tickets }` without pagination metadata and does not calculate `etag` or include tags relation.【F:src/app/api/tickets/route.ts†L16-L38】
   - Action: OpenAPI now labels tags/etag/page metadata as target-only; target contracts note these fields require future rollout before clients can rely on them.【F:docs/openapi.yaml†L68-L83】【F:docs/openapi.yaml†L322-L347】【F:docs/api-contracts-target.md†L10-L12】

## Remaining verification steps
- Decide idempotency storage and TTL strategy before enforcing headers.
- Define etag format (`updatedAt` hash or version) and 412 error payload before implementing optimistic locking.
- Add organization checks to comment handler and implement listing endpoint to meet documented contract.
