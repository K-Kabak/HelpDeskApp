# OpenAPI Validation Report (2025-12-20)

## Scope validated
- `docs/openapi.yaml`
- `docs/api-contracts-target.md`
- `docs/api-contracts-as-is.md`
- `docs/error-model.md`
- `docs/contract-conventions.md`
- Implemented handlers: `src/app/api/tickets/route.ts`, `src/app/api/tickets/[id]/route.ts`, `src/app/api/tickets/[id]/comments/route.ts`
- Data model reference: `prisma/schema.prisma`

## Findings (as-is alignment)
1. **GET /api/tickets has no pagination/filtering**
   - Evidence: Handler fetches all scoped tickets ordered by `createdAt desc` with no query params.
   - Spec/tests: OpenAPI documents list without pagination/filters; contract tests cover 401 and 200 list with expanded relations.

2. **Ticket responses include expanded relations and sensitive user fields**
   - Evidence: `findMany` includes `requester`, `assigneeUser`, `assigneeTeam`, returning full Prisma models (includes `passwordHash`).
   - Spec/tests: OpenAPI models expanded relations and allows extra properties on user/team. Tests assert presence of expanded requester; sanitization still needed in handlers.

3. **POST /api/tickets ignores idempotency/tags**
   - Evidence: Create schema omits `tags`; handler never reads `Idempotency-Key`.
   - Spec/tests: OpenAPI omits idempotency/tags. Contract tests cover validation failure and 200 creation.

4. **PATCH/PUT /api/tickets/{id} lack ETag/If-Match**
   - Evidence: Handler does role/org checks and updates without concurrency headers.
   - Spec: OpenAPI documents basic update only; no etag headers present. Tests not added for update path.

5. **Comment creation missing organization check**
   - Evidence: Handler fetches ticket by id and enforces role rules but does not verify `organizationId` against session.
   - Spec/tests: OpenAPI description calls out missing org enforcement. Contract tests cover 404 missing ticket and 200 creation for requester; org-gap remains.

6. **Error envelope not normalized**
   - Evidence: Handlers return `{ error: string }` or Zod flatten objects.
   - Spec/tests: OpenAPI uses `ErrorAsIs` schema; error model lists target envelope. Tests assert AS-IS shapes for auth, validation, not-found.

## Contract test coverage
- Tests load `docs/openapi.yaml` for presence of implemented paths.
- `GET /api/tickets`: 401 missing session; 200 list with expanded requester.
- `POST /api/tickets`: 400 validation error shape; 200 creation flow.
- `POST /api/tickets/{id}/comments`: 404 when ticket missing; 200 creation as requester.
- All contract tests pass locally (`cmd /c "npm run test:contract"`, 9 assertions) after this schema validation.

## Fixes
- `TicketUpdate` now keeps its `description` at the schema level so `docs/openapi.yaml` remains parseable and still communicates the requirement that updates include at least one field; `npm run openapi:lint` now succeeds for the spec.

## Validation runs
- `cmd /c "npm run openapi:lint"` (OpenAPI spec validation; successful after indentation fix)
- `cmd /c "npm run test:contract"` (contract tests as before; 9 tests, all passing)

## Unknowns / verification steps
- Confirm whether relation expansion should omit sensitive fields (e.g., `passwordHash`) or be limited to summaries; update handlers/OpenAPI accordingly if sanitized later.
- Decide on idempotency and optimistic locking strategy before introducing related headers to contracts; idempotency tests remain TBD once implemented.
- Add organization scoping to comment creation to align with other endpoints.
- Add server-side pagination/sorting for ticket lists when product requires it.
