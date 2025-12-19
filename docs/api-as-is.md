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