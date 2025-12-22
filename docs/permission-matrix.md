# Permission Matrix (UI vs API)

Sources: `docs/openapi.yaml`, `docs/ui-api-mapping.md`, `src/lib/auth.ts`, `middleware.ts`, `src/lib/authorization.ts`, API routes in `src/app/api/tickets/route.ts`, `src/app/api/tickets/[id]/route.ts`, `src/app/api/tickets/[id]/comments/route.ts`, and UI enforcement in `src/app/app/tickets/[id]/page.tsx` plus `comment-form.tsx`.

## Roles & Context
- Roles: `REQUESTER`, `AGENT`, `ADMIN` (populated in session/JWT callbacks, `src/lib/auth.ts`).
- Org scope: session carries `organizationId`; list scoping via `ticketScope` helper (`src/lib/authorization.ts`).
- Route protection: `/app/*` guarded by NextAuth middleware with rate limit (`middleware.ts`). APIs enforce auth per handler (no global API middleware).

## Action Matrix (current implementation)
| Action | UI visibility | API enforcement | Notes |
| --- | --- | --- | --- |
| View ticket list (`/app`) | Authenticated; requester sees own tickets, agent/admin see org tickets (server fetch). | `GET /api/tickets` uses `requireAuth` + `ticketScope` (`src/app/api/tickets/route.ts`). | No pagination yet (target in OpenAPI). |
| View ticket detail | Requester only own ticket; agent/admin any org ticket (server checks in `src/app/app/tickets/[id]/page.tsx`). | No GET detail endpoint; server query enforces ownership/org before render. | Target detail endpoint unimplemented. |
| Create ticket | Form shown to signed-in users. | `POST /api/tickets` requires auth; requesterId forced to session user, organization set from session (`src/app/api/tickets/route.ts`). | No role gating beyond auth. |
| Update status (agent/admin) | Status control shown/enabled for agent/admin. | `PATCH /api/tickets/{id}` allows status when role is AGENT/ADMIN (`src/app/api/tickets/[id]/route.ts`). | Audit event recorded. |
| Update status (requester close/reopen) | UI limits requester to close/reopen on own ticket. | `PATCH /api/tickets/{id}` allows requester only on own ticket and only ZAMKNIETE/PONOWNIE_OTWARTE. | |
| Change priority | UI control hidden for requester. | `PATCH /api/tickets/{id}` rejects non-agent/admin before applying priority. | |
| Assign user/team | UI control hidden for requester. | `PATCH /api/tickets/{id}` rejects non-agent/admin; validates assignee/team within org. | |
| Comment public | Composer shown to all; requester lacks internal checkbox (`comment-form.tsx`). | `POST /api/tickets/{id}/comments` requires auth; allows requester (own ticket) or agent/admin; org mismatch -> 404 (`src/app/api/tickets/[id]/comments/route.ts`). | First agent public comment stamps `firstResponseAt`. |
| Comment internal | Internal checkbox only for agent/admin. | Same endpoint rejects requester when `isInternal=true`; allows agent/admin within org. | |
| View internal comments | Requester view filters out internal (`visibleComments` in `page.tsx`). | No list endpoint; server render filters; creation endpoint enforces org + role. | |
| View assignment options | Hidden for requester; shown for agent/admin. | API also blocks requester updates; validates org membership for assignees. | |
| Admin screens | Not present in UI. | No admin API endpoints implemented. | |
| Auth-required redirect | `/app/*` redirects unauthenticated via middleware. | API routes return 401 when session missing (via `requireAuth` or direct checks). | |

## Unknown / To Verify
- `GET /api/tickets/{id}` and `GET /api/tickets/{id}/comments` not implemented; confirm planned scopes match UI (requester = own + public comments; agent/admin = org + internal) when built.
- Ticket list currently server-rendered; if moved client-side, ensure use of `ticketScope` for parity.
- Admin permissions: endpoints/routes absent; clarify before adding matrix rows.
- Rate limiting currently middleware-only for `/app/*`; API routes lack rate limiting—decide policy and enforce consistently.

## Recommended Next Steps
1. Implement list/detail comment and ticket read endpoints with org/role scoping matching UI, then update matrix.
2. Add tests covering requester vs agent/admin for ticket updates and comment creation/visibility.
3. Define admin surface (routes/endpoints) and extend matrix once implemented.
