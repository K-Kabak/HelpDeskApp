
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

