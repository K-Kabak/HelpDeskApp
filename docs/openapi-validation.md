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
   - Spec: OpenAPI documents list without pagination or filters and marks security via cookieAuth.

2. **Ticket responses include expanded relations and sensitive user fields**
   - Evidence: `findMany` includes `requester`, `assigneeUser`, `assigneeTeam`, returning full Prisma models (includes `passwordHash`).
   - Spec: OpenAPI models expanded relations and allows extra properties on user/team. Keep verification to sanitize in code if desired.

3. **POST /api/tickets ignores idempotency/tags**
   - Evidence: Create schema omits `tags`; handler never reads `Idempotency-Key`.
   - Spec: OpenAPI omits idempotency and tags from request, matching implementation.

4. **PATCH/PUT /api/tickets/{id} lack ETag/If-Match**
   - Evidence: Handler does role/org checks and updates without concurrency headers.
   - Spec: OpenAPI documents basic update only; no etag headers present.

5. **Comment creation missing organization check**
   - Evidence: Handler fetches ticket by id and enforces role rules but does not verify `organizationId` against session.
   - Spec: OpenAPI description calls out missing org enforcement.

6. **Error envelope not normalized**
   - Evidence: Handlers return `{ error: string }` or Zod flatten objects.
   - Spec: OpenAPI uses `ErrorAsIs` and error model notes target envelope separately.

## Unknowns / verification steps
- Confirm whether relation expansion should omit sensitive fields (e.g., `passwordHash`) or be limited to summaries; update handlers/OpenAPI accordingly if sanitized later.
- Decide on idempotency and optimistic locking strategy before introducing related headers to contracts.
- Add organization scoping to comment creation to align with other endpoints.
- Add server-side pagination/sorting for ticket lists when product requires it.
