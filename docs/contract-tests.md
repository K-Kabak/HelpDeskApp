# Contract Tests Plan

Covers AS-IS verification and Target regression for API contracts.

## Principles
- Test against local dev with seeded data (Prisma seed). Use authenticated sessions for requester, agent, admin.
- Prefer black-box HTTP tests using Next.js API routes.

## AS-IS Test Matrix
1. **Auth required**: GET/POST `/api/tickets` → 401 without session.【F:src/app/api/tickets/route.ts†L16-L44】
2. **Requester scope**: GET `/api/tickets` as requester returns only own tickets; verify via seeded ticket owner filter.【F:src/app/api/tickets/route.ts†L22-L35】
3. **Agent scope**: GET `/api/tickets` as agent returns org tickets (count > requester).【F:src/app/api/tickets/route.ts†L22-L35】
4. **Ticket create validation**: POST with short title/description gets 400 (Zod flatten).【F:src/app/api/tickets/route.ts†L9-L50】
5. **SLA due set**: POST ticket returns `firstResponseDue` and `resolveDue` populated when policy exists.【F:src/app/api/tickets/route.ts†L52-L88】
6. **Requester update forbidden**: PATCH ticket as requester attempting priority change returns 403.【F:src/app/api/tickets/[id]/route.ts†L59-L116】
7. **Requester status controls**: PATCH requester can close then reopen; forbidden for other statuses.【F:src/app/api/tickets/[id]/route.ts†L59-L82】
8. **Agent assignee validation**: PATCH with invalid assigneeUserId outside org returns 400.【F:src/app/api/tickets/[id]/route.ts†L118-L139】
9. **Audit creation**: POST/PATCH ticket creates audit events (validate DB rows).【F:src/app/api/tickets/route.ts†L64-L88】【F:src/app/api/tickets/[id]/route.ts†L172-L197】
10. **Comment auth**: POST comment without session returns 401.【F:src/app/api/tickets/[id]/comments/route.ts†L16-L19】
11. **Comment org gap**: Agent from other org can comment (current bug) — expect 200 demonstrating risk.【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】
12. **Comment first response stamp**: First agent public comment sets `firstResponseAt`.【F:src/app/api/tickets/[id]/comments/route.ts†L50-L55】

## Target Regression Suite
- Add pagination/idempotency/concurrency cases once implemented.
- Include schema snapshot tests against `docs/openapi.yaml` using spectral or openapi-diff.

## Test Tooling
- Use Vitest/Playwright HTTP requests or supertest against Next dev server.
- Seed database before suite; clean after.
- Capture trace IDs/logs for failed cases.
