# API Contracts (AS-IS)

Evidence-backed summary of current endpoints and behaviors.

## Authentication & Session Model
- NextAuth credentials provider with Prisma adapter; bcrypt password check against `User.passwordHash`. Session uses JWT strategy with `role` and `organizationId` claims stored in cookies.【F:src/lib/auth.ts†L18-L77】
- Middleware protects `/app/*` paths, but API routes rely on explicit `getServerSession` checks inside handlers.【F:middleware.ts†L1-L5】【F:src/app/api/tickets/route.ts†L16-L38】

## Endpoints
### `GET /api/tickets`
- **Auth**: Requires authenticated session; 401 otherwise.【F:src/app/api/tickets/route.ts†L16-L44】
- **Scope**: Requester sees only their tickets; agent/admin sees all tickets in their organization via `where` clause.【F:src/app/api/tickets/route.ts†L22-L35】
- **Data**: Includes requester, assignee user, assignee team; ordered by `createdAt desc`. No pagination or filters.【F:src/app/api/tickets/route.ts†L27-L35】

### `POST /api/tickets`
- **Auth**: Requires session; 401 otherwise.【F:src/app/api/tickets/route.ts†L40-L44】
- **Validation**: Zod schema for `title` (min 3), `descriptionMd` (min 3), `priority` enum, optional `category`.【F:src/app/api/tickets/route.ts†L9-L14】【F:src/app/api/tickets/route.ts†L46-L50】
- **Logic**: Looks up SLA policy by organization/priority; sets `firstResponseDue` and `resolveDue` via `addHours`. Default status `NOWE`; requester/organization from session; audit event `TICKET_CREATED` recorded.【F:src/app/api/tickets/route.ts†L52-L88】
- **Errors**: 400 on validation failure, 401 on missing session (error payload `{ error: string|object }`).【F:src/app/api/tickets/route.ts†L16-L50】

### `PATCH/PUT /api/tickets/{id}`
- **Auth**: Requires session; 401 otherwise.【F:src/app/api/tickets/[id]/route.ts†L30-L33】
- **Lookup**: Ticket fetched by id; must match session organization or 404 returned.【F:src/app/api/tickets/[id]/route.ts†L35-L41】
- **Validation**: Zod schema requires at least one of status/priority/assigneeUserId/assigneeTeamId; UUID/null allowed for assignees.【F:src/app/api/tickets/[id]/route.ts†L8-L24】【F:src/app/api/tickets/[id]/route.ts†L51-L57】
- **Authorization**: Requesters must own ticket and may only close or reopen (specific status set); cannot change priority or assignees. Agent/admin required for priority or assignee changes; assignee must belong to same org and be agent/admin when user.【F:src/app/api/tickets/[id]/route.ts†L59-L166】
- **Logic**: Updates status, priority, assignees; stamps `resolvedAt`/`closedAt` based on status; records `changes` in `TICKET_UPDATED` audit event within transaction.【F:src/app/api/tickets/[id]/route.ts†L87-L197】
- **Errors**: 400 on validation/no changes or missing status for requester, 403 on forbidden updates, 404 on missing/other-org ticket.【F:src/app/api/tickets/[id]/route.ts†L35-L170】

### `POST /api/tickets/{id}/comments`
- **Auth**: Requires session; 401 otherwise.【F:src/app/api/tickets/[id]/comments/route.ts†L16-L19】
- **Lookup**: Fetches ticket by id but does **not** verify organization matches session; returns 404 if ticket missing.【F:src/app/api/tickets/[id]/comments/route.ts†L21-L25】
- **Validation**: Zod schema `bodyMd` min 1, `isInternal` boolean default false.【F:src/app/api/tickets/[id]/comments/route.ts†L7-L30】
- **Authorization**: Internal comments require agent/admin; public comments allowed for requester or agent/admin. No org boundary enforcement on ticket fetch.【F:src/app/api/tickets/[id]/comments/route.ts†L32-L39】
- **Logic**: Creates comment; when first agent public reply sets `firstResponseAt`. No audit event or SLA recalculation beyond first response stamp.【F:src/app/api/tickets/[id]/comments/route.ts†L41-L58】
- **Errors**: 400 on validation, 403 on permission checks, 404 on missing ticket, 401 on missing session (payload `{ error: string|object }`).【F:src/app/api/tickets/[id]/comments/route.ts†L16-L59】

### `GET/POST /api/auth/[...nextauth]`
- Handled by NextAuth; credential provider verifies bcrypt hash; session JWT includes role/org. No custom REST semantics beyond NextAuth defaults.【F:src/app/api/auth/[...nextauth]/route.ts†L1-L6】【F:src/lib/auth.ts†L18-L77】

## Data Contracts (Surface)
- Ticket fields: `id`, `number`, `title`, `descriptionMd`, `status`, `priority`, optional `category`, `requesterId`, `assigneeUserId`, `assigneeTeamId`, SLA timestamps, and organization linkage (Prisma model).【F:prisma/schema.prisma†L94-L121】 Responses include requester/assignee relations as full objects in current APIs.【F:src/app/api/tickets/route.ts†L27-L35】【F:src/app/api/tickets/[id]/route.ts†L176-L197】
- Comment fields: `id`, `ticketId`, `authorId`, `isInternal`, `bodyMd`, `createdAt`. No pagination or edit/delete endpoints.【F:prisma/schema.prisma†L123-L132】【F:src/app/api/tickets/[id]/comments/route.ts†L41-L59】
- Attachment model present but unused in APIs.【F:prisma/schema.prisma†L134-L145】

## AuthN/AuthZ Summary
- Session cookie-based auth (NextAuth). Roles: REQUESTER, AGENT, ADMIN (Prisma enum).【F:prisma/schema.prisma†L10-L31】
- Organization scoping applied to ticket list and update; missing on comment creation (risk).【F:src/app/api/tickets/route.ts†L16-L38】【F:src/app/api/tickets/[id]/route.ts†L35-L82】【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】

## Observed Gaps
- No pagination on list endpoints; dashboard search queries nonexistent `description` field (UI layer).【F:src/app/app/page.tsx†L52-L66】
- Attachment, audit read, admin management endpoints absent.
- Concurrency/idempotency not implemented.
- Error payloads inconsistent and unstructured.
