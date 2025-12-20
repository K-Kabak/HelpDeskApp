# Known Issues (evidence-backed)

1. **Dashboard search throws Prisma error**: Query filters `description` field not in schema; any `q` param triggers runtime failure when Prisma translates filter.【F:src/app/app/page.tsx†L52-L66】【F:prisma/schema.prisma†L94-L120】
   - *Repro*: Open `/app?q=test` while logged in; request attempts to query nonexistent column.
   - *Fix direction*: Replace `description` filter with `descriptionMd` (or remove search until corrected) and add test coverage.

2. **Comment API allows cross-organization writes**: Endpoint fetches ticket by ID without verifying organization matches session before permitting comments.【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】
   - *Repro*: Authenticate as agent/admin from Org A, post to `/api/tickets/{id}/comments` for ticket from Org B (if ID known); comment succeeds.
   - *Fix direction*: Add organization comparison similar to ticket update endpoint before authorization rules.

3. **Unbounded ticket queries**: Dashboard and API GET return all tickets with no pagination or limits.【F:src/app/app/page.tsx†L52-L73】【F:src/app/api/tickets/route.ts†L27-L35】
   - *Repro*: Populate many tickets; page load returns entire dataset causing slow render.
   - *Fix direction*: Add pagination parameters (`take/skip`) and enforce defaults server-side.

4. **Audit events invisible**: Audit records written on create/update but not exposed to UI or API consumers.【F:src/app/api/tickets/route.ts†L75-L88】【F:src/app/api/tickets/[id]/route.ts†L172-L197】
   - *Repro*: Create/update ticket; no audit listing available in UI/routes.
   - *Fix direction*: Provide audited timeline endpoint/UI with org scoping.

5. **Comment validation weak**: Client only requires non-empty textarea; server minimum length 1 with no max or sanitization safeguards.【F:src/app/app/tickets/[id]/comment-form.tsx†L14-L49】【F:src/app/api/tickets/[id]/comments/route.ts†L7-L30】
   - *Repro*: Submit extremely long or whitespace-only content; server accepts lengths ≥1 char even if mostly whitespace.
   - *Fix direction*: Add length limits, trim/normalize input, and sanitize Markdown server-side.
