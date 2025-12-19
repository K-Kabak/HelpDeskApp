<<<<<<< ours
# API surface (as implemented)

## /api/auth/[...nextauth] (GET, POST)
- NextAuth handler wiring to credential provider + Prisma adapter; supports sign-in and session callbacks (src/app/api/auth/[...nextauth]/route.ts, src/lib/auth.ts).
- Auth: credential verification via email lowercasing + bcrypt password check against Prisma User; successful auth injects `role` and `organizationId` into JWT/session.
- Side effects: none beyond NextAuth session issuance; no custom logging or audit added.

## /api/tickets (GET)
- Auth required: rejects when no session user.
- Authorization: requesters limited to their own tickets; agents/admins scoped to session organization.
- Behavior: returns all matching tickets ordered by `createdAt desc` including requester, assignee user, assignee team relations; no pagination/limits or filtering params supported server-side.
- Validation: none for query parameters; relies solely on session filtering.
- Side effects: read-only.

## /api/tickets (POST)
- Auth required: rejects when no session user.
- Validation: Zod schema requires `title` min length 3, `descriptionMd` min length 3, `priority` enum, optional `category`.
- Authorization/scoping: always writes ticket to session organization and requester ID from session (no ability to set for others).
- Side effects: computes SLA due timestamps from organization SLA policy; creates audit event `TICKET_CREATED` with status/priority payload; ticket status set to NOWE.
- Failure modes: returns 400 on validation failure, 401 on missing session; no rate limiting or CSRF beyond NextAuth defaults.

## /api/tickets/[id] (PATCH, PUT)
- Auth required: rejects when no session user.
- Lookup: fetches ticket by id then verifies organization match; returns 404 otherwise.
- Validation: Zod schema requires at least one of status/priority/assigneeUserId/assigneeTeamId; validates UUID/nullability for assignee fields.
- Authorization rules:
  - Requesters cannot change priority/assignees and may only close or reopen their own tickets per allowed status set; forbidden if not owner.
  - Agents/admins can change status/priority/assignees; assignee changes validated against org membership and agent/admin role for users.
- Side effects: adjusts `resolvedAt`/`closedAt` timestamps based on status, records `changes` payload in `TICKET_UPDATED` audit event within transaction, and returns updated ticket with requester/assignee relations.
- Failure modes: 400 on invalid payload or no changes, 403 on forbidden updates, 404 on missing/other-org ticket, 401 on missing auth.

## Not implemented but referenced
- `/api/tickets/[id]/comments` is called by the ticket comment form but no route exists under `src/app/api`; submissions will 404.
=======
# API Surface (as implemented)

## /api/auth/[...nextauth]
- **Methods**: GET, POST (NextAuth handler).【F:src/app/api/auth/[...nextauth]/route.ts†L1-L6】
- **Auth**: Handles login/session via credentials provider (see auth options).【F:src/lib/auth.ts†L21-L77】
- **Notes**: Relies on Prisma adapter; credentials must match seeded users or DB state. No custom validation beyond NextAuth provider.

## /api/tickets
- **GET**: Lists tickets scoped by role (requester → own tickets; agent/admin → organization tickets). Requires authenticated session; returns 401 otherwise.【F:src/app/api/tickets/route.ts†L16-L38】
  - **Authorization**: Role-based scoping only; no pagination.
  - **Side effects**: None.
  - **Failure**: 401 when unauthenticated.
- **POST**: Creates ticket with Zod validation (`title`, `descriptionMd`, `priority`, optional `category`). Requires auth; 401 if missing.【F:src/app/api/tickets/route.ts†L9-L50】
  - **Authorization**: Any authenticated user; organizationId taken from session.
  - **Logic**: Looks up SLA policy by organization/priority to set `firstResponseDue`/`resolveDue`; sets default status NOWE and requesterId; writes audit event `TICKET_CREATED`.【F:src/app/api/tickets/route.ts†L52-L88】
  - **Failure modes**: 400 on validation errors; 401 when unauthenticated.

## /api/tickets/[id]
- **PATCH/PUT**: Updates ticket status/priority/assignee with Zod validation requiring at least one field present.【F:src/app/api/tickets/[id]/route.ts†L8-L24】【F:src/app/api/tickets/[id]/route.ts†L199-L210】
  - **Auth**: Requires session; 401 if missing.【F:src/app/api/tickets/[id]/route.ts†L30-L33】
  - **Authorization**: Ticket must belong to same organization or 404 returned; requester must be ticket owner and may only close or reopen; agent/admin required for priority/assignee changes with org validation of assignee/team.【F:src/app/api/tickets/[id]/route.ts†L35-L166】
  - **Side effects**: Updates resolved/closed timestamps based on status; creates `AuditEvent` with changes in transaction.【F:src/app/api/tickets/[id]/route.ts†L87-L197】
  - **Failure modes**: 400 when no changes or validation errors; 403 on forbidden status/priority/assignee changes; 404 if ticket not found or org mismatch.

## /api/tickets/[id]/comments
- **POST**: Adds comment with `bodyMd` (min length 1) and `isInternal` flag defaulting to false.【F:src/app/api/tickets/[id]/comments/route.ts†L7-L58】
  - **Auth**: Requires session; 401 if missing.【F:src/app/api/tickets/[id]/comments/route.ts†L16-L19】
  - **Authorization**: Allows requester or agent/admin for public comments; only agent/admin for internal comments. No organization validation on ticket lookup (risk).【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】
  - **Side effects**: Creates comment; sets `firstResponseAt` when first public agent reply on ticket without prior first response.【F:src/app/api/tickets/[id]/comments/route.ts†L41-L58】
  - **Failure modes**: 400 on validation errors; 403 on forbidden internal/public conditions; 404 when ticket not found.
>>>>>>> theirs
