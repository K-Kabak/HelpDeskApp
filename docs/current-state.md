# Current state (evidence-first)

## Stack and runtime
- Next.js 16 app router with TypeScript, TailwindCSS, eslint tooling, NextAuth, Prisma, React Query, Zod, Vitest/Playwright (see package.json scripts and deps).
- Middleware enforces NextAuth session on `/app/*` paths via middleware export and matcher config (`middleware.ts`).

## Repository map (implementation touchpoints)
- `src/lib/auth.ts`  NextAuth credential configuration with Prisma adapter, JWT session strategy, and role/org claims injection.
- `src/lib/prisma.ts`  Prisma client singleton with dev logging.
- `src/types/next-auth.d.ts`  Session/JWT type augmentation for role and organization fields.
- `src/app`  App Router pages: root redirect to `/app`, login form, protected layout with topbar, dashboard (`/app`) with ticket listing/filters/quick-create, ticket creation page, ticket detail page with actions/comments, API routes for tickets and auth.
- `src/components/topbar.tsx`  signed-in header with sign-out action.
- `prisma/schema.prisma`  database schema for organizations, users (roles), teams, tickets (status/priority, SLA timestamps), comments (internal flag), attachments, tags, audit events, SLA policies, and NextAuth tables.
- `prisma/seed.js`  demo seed creating org, users (admin/agent/requester), team with membership, tags, SLA policies, sample ticket/comment/audit event.
- `README.md`  setup steps, scripts, described MVP scope and models.

## Current Capabilities Index
### Confirmed
- Credential-based login with Prisma user lookup, bcrypt verification, JWT sessions, and session surface of role/org IDs.
- Auth gate on `/app/*` via middleware plus server-side session checks on dashboard and ticket pages (redirect to `/login`).
- Ticket listing endpoint returns tickets scoped to requester or organization with requester/assignee relations and created-at ordering.
- Ticket creation endpoint validates title/description/priority via Zod, applies organization scoping from session, computes first-response/resolve due from SLA policy, and writes audit event on create.
- Dashboard page renders filters (status/priority/query) and ticket cards with counts, requester/assignee labels, and a quick ticket form component.
- Ticket form enforces client-side min/max lengths, toggles edit/preview Markdown, disables UI during submission, and posts to `/api/tickets`.
- Ticket detail page enforces requester visibility, loads requester/assignee/team/comments, renders Markdown description, shows comment timeline, and mounts actions/comment form.
- Ticket update API enforces organization ownership, restricts requester updates (close/reopen only), validates assignee targets by org/role, updates resolved/closed timestamps, and records audit events in a transaction.
- Seed data provides demo org, admin/agent/requester accounts, IT Support team membership, tags, SLA policies, sample ticket/comment/audit event, enabling immediate login/testing.

### Partial / Fragile
- Comment submission UI posts to `/api/tickets/{id}/comments`, but no matching API route exists, so submissions 404 despite UI controls.
- Ticket dashboard search filter queries a non-existent `description` field (schema only defines `descriptionMd`), which will cause Prisma runtime errors when `q` is provided.
- SLA timestamps are set on ticket create, but no logic updates `firstResponseAt`/`resolveDue` on comments or status transitions, leaving SLA tracking incomplete.
- Comments rendered for requesters hide internal notes, but without a comment creation API there is no server-side validation of `isInternal` or length; UI-only constraints are fragile.

### Not Found (searched with `rg "attachment" src/app/api src/app/app` and directory listing of `src/app/api`)
- No API handlers for comment creation/listing beyond ticket fetch includes; missing `/api/tickets/[id]/comments` despite UI usage.
- No attachment upload/download logic or UI hooks; no matches for "attachment" in app or API code.
- No admin configuration endpoints (users/teams/SLA) beyond seed data; nothing under `src/app/api` besides auth/tickets.

## Auth & scoping model (as implemented)
- Session enforcement: NextAuth middleware protects `/app/*`; server components also redirect unauthenticated users to `/login`.
- Identity & roles: Credentials provider lowercases email, compares bcrypt hash, and injects `role` and `organizationId` into JWT/session for downstream checks.
- API scoping: Ticket list and create endpoints scope queries by requester vs organization from session; update endpoint additionally requires organization match to the ticket and enforces requester/agent permissions on fields.
- UI scoping: Ticket detail returns 404 when requester is not owner; comment visibility hides internal notes from requesters; ticket actions determine allowed status transitions and assignment controls from role/ownership flags.

---
## Quality gate: evidence-backed claims
1. package.json defines Next.js, NextAuth, Prisma, React Query, Tailwind, Vitest/Playwright stack and scripts.
2. middleware routes `/app/*` through NextAuth middleware for auth enforcement.
3. NextAuth uses credential provider with Prisma adapter and bcrypt password check.
4. JWT callback stores role and organizationId for session consumption.
5. Prisma schema defines roles REQUESTER/AGENT/ADMIN and ticket statuses/priorities enums.
6. Ticket model includes descriptionMd, SLA timestamps, assignee fields, and audit relations.
7. Comment model tracks `isInternal` flag for public vs internal notes.
8. Seed script provisions demo org, three users with roles, team membership, tags, SLA policies, ticket, comment, and audit event.
9. Root page redirects authenticated users to `/app`, unauthenticated to `/login`.
10. App layout re-validates session server-side and renders topbar with user info and sign-out control.
11. Dashboard fetches tickets filtered by requester or organization, with optional status/priority/search filters, and orders by createdAt.
12. Dashboard search uses `description` field not present in schema, risking runtime errors.
13. Quick ticket form enforces length validations client-side and posts to `/api/tickets`.
14. Ticket create API validates payload, scopes to session org, sets SLA due times, and writes audit event on create.
15. Ticket update API restricts requesters to close/reopen and agents/admins to priority/assignment changes, validating org membership of assignees/teams.
16. Ticket update API sets resolved/closed timestamps based on status transitions.
17. Ticket detail hides internal comments from requesters and loads related agents/teams for actions when non-requester.
18. Ticket actions component gates status and assignment controls by role/ownership flags and submits via PATCH to ticket API.
19. Comment form posts to `/api/tickets/{id}/comments` with optional internal flag but lacks server endpoint, leading to failure.
20. No attachment handling code found in app or API directories.
21. API directory only contains auth and ticket handlers; no admin or auxiliary endpoints present.
# Current State

## Stack (evidence-backed)
- Next.js 16 app router with TypeScript, React 19, Tailwind CSS, and ESLint tooling; package scripts include Next dev/build/start and Prisma/Vitest/Playwright helpers.【F:package.json†L5-L63】
- NextAuth credential-based authentication using Prisma adapter and JWT sessions; credentials provider hashes validated with bcrypt and session tokens carry role and organizationId claims.【F:src/lib/auth.ts†L21-L77】
- Prisma ORM targeting PostgreSQL with defined enums for Role/TicketStatus/TicketPriority and relational models for organizations, users, tickets, comments, attachments, tags, audit events, SLAs, and NextAuth tables.【F:prisma/schema.prisma†L5-L230】
- Middleware enforces authentication on all `/app/*` routes via NextAuth middleware matcher.【F:middleware.ts†L1-L5】

## Repository Map
- `src/app` – Next.js routes and layouts.
  - `layout.tsx`, `providers.tsx` – global fonts/providers (SessionProvider, React Query).【F:src/app/layout.tsx†L1-L23】【F:src/app/providers.tsx†L1-L17】
  - `page.tsx` – root redirect to login/app based on session.【F:src/app/page.tsx†L1-L10】
  - `login/` – credential login form posting to NextAuth.【F:src/app/login/page.tsx†L1-L55】
  - `app/` – authenticated area layout, dashboard, ticket views, forms, actions.【F:src/app/app/layout.tsx†L1-L16】【F:src/app/app/page.tsx†L25-L218】【F:src/app/app/tickets/[id]/page.tsx†L1-L210】
  - `api/` – Next.js API routes (auth, tickets CRUD, ticket comments).【F:src/app/api/auth/[...nextauth]/route.ts†L1-L6】【F:src/app/api/tickets/route.ts†L1-L89】【F:src/app/api/tickets/[id]/route.ts†L1-L210】【F:src/app/api/tickets/[id]/comments/route.ts†L1-L58】
- `src/components` – shared UI (top bar with sign-out).【F:src/components/topbar.tsx†L1-L17】
- `src/lib` – Prisma client configuration and NextAuth options.【F:src/lib/prisma.ts†L1-L12】【F:src/lib/auth.ts†L21-L77】
- `src/types` – NextAuth session/JWT typings extending user fields.【F:src/types/next-auth.d.ts†L1-L20】
- `prisma/` – schema, seed script establishing demo org/users/teams/SLA/tag/ticket/comment/audit event.【F:prisma/schema.prisma†L5-L230】【F:prisma/seed.js†L1-L99】
- Root configs: lint/tailwind/postcss/tsconfig/next config; README with setup instructions.【F:package.json†L5-L63】【F:README.md†L1-L67】

## Auth & Scoping Model (as implemented)
- Authentication: NextAuth credentials provider; login form calls `signIn("credentials")` and redirects on success.【F:src/app/login/page.tsx†L3-L53】
- Session strategy: JWT with custom `role` and `organizationId` claims injected during `jwt` callback and exposed on `session.user`.【F:src/lib/auth.ts†L60-L77】
- Protected routes: middleware restricts `/app/*`; server pages explicitly redirect to `/login` when session missing.【F:middleware.ts†L1-L5】【F:src/app/app/layout.tsx†L1-L13】【F:src/app/page.tsx†L1-L10】
- Authorization:
  - Ticket listing scopes to requester’s own tickets or entire organization for agent/admin via `where` clause.【F:src/app/api/tickets/route.ts†L22-L35】
  - Ticket detail fetch rejects when requester access does not match ticket requester; org boundary enforced during updates but not during comment creation (see Known Issues).【F:src/app/app/tickets/[id]/page.tsx†L43-L72】【F:src/app/api/tickets/[id]/route.ts†L35-L81】【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】
  - Status/assignment update permissions: requesters limited to closing/reopening their tickets; agent/admin required for priority/assignee changes with org-validity checks and audit logging.【F:src/app/api/tickets/[id]/route.ts†L59-L197】
  - Comment permissions: public comments allowed for requester or agent/admin; internal comments blocked for requester but no organization check on ticket lookup.【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】

## Current Capabilities Index
### Confirmed
- Credential-based login with demo account seeded via Prisma seed script (admin/requester/agent).【F:src/lib/auth.ts†L21-L77】【F:prisma/seed.js†L13-L67】
- Authenticated dashboard listing tickets with status/priority filters and free-text search (see fragile note).【F:src/app/app/page.tsx†L37-L164】
- Ticket creation via API with Zod validation, SLA due time calculation from `SlaPolicy`, default status `NOWE`, and audit event creation.【F:src/app/api/tickets/route.ts†L9-L89】
- Ticket detail page with Markdown rendering, requester visibility check, comment timeline, and action panel for status/assignment changes.【F:src/app/app/tickets/[id]/page.tsx†L11-L210】
- Ticket status/priority/assignee updates with role-based rules and audit event logging in transaction.【F:src/app/api/tickets/[id]/route.ts†L59-L197】
- Comment creation endpoint with internal flag support and first-response timestamp setting for agent public replies.【F:src/app/api/tickets/[id]/comments/route.ts†L7-L58】

### Partial/Fragile
- Dashboard search filter queries `description` column that does not exist (schema uses `descriptionMd`), causing runtime error on search usage.【F:src/app/app/page.tsx†L52-L66】【F:prisma/schema.prisma†L94-L120】
- Comment endpoint lacks organization boundary enforcement; any authenticated user knowing ticket ID and having agent/admin role could comment across orgs.【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】
- Comment form posts without client-side validation beyond required attribute; server accepts empty whitespace except min length 1, no Markdown sanitization beyond ReactMarkdown usage on display.【F:src/app/app/tickets/[id]/comment-form.tsx†L1-L49】【F:src/app/app/tickets/[id]/page.tsx†L183-L204】
- No pagination on ticket lists; `findMany` returns all tickets ordered by createdAt.【F:src/app/app/page.tsx†L52-L73】【F:src/app/api/tickets/route.ts†L27-L35】
- Audit events created but never surfaced in UI or additional endpoints (only writes).【F:src/app/api/tickets/route.ts†L75-L88】【F:src/app/api/tickets/[id]/route.ts†L172-L197】

### Not Found (search steps in docs/search-log.md)
- No API endpoints for attachments or tag management beyond seed; no upload handlers located under `src/app/api` (find results limited to auth/tickets/comments).【F:src/app/api/tickets/route.ts†L1-L89】【F:src/app/api/tickets/[id]/route.ts†L1-L210】【F:src/app/api/tickets/[id]/comments/route.ts†L1-L58】
- No reporting/metrics endpoints or UI; repository contains only dashboard and ticket detail views (checked `src/app/app` files).【F:src/app/app/page.tsx†L25-L218】【F:src/app/app/tickets/[id]/page.tsx†L1-L210】
- No automated tests implemented despite scripts; `tests` directory absent and `test` scripts not referenced elsewhere (search log notes).【F:package.json†L5-L64】

## Quality Gate: Evidence-Backed Claims (20)
1. Stack uses Next.js 16 with TypeScript and Tailwind per dependencies/scripts.【F:package.json†L5-L63】
2. Auth uses NextAuth credentials provider with Prisma adapter and bcrypt verification.【F:src/lib/auth.ts†L21-L56】
3. JWT sessions enriched with role and organizationId claims via callbacks.【F:src/lib/auth.ts†L60-L77】
4. Middleware protects `/app/*` routes using NextAuth middleware export/matcher.【F:middleware.ts†L1-L5】
5. Root page redirects unauthenticated users to `/login`, authenticated to `/app`.【F:src/app/page.tsx†L1-L10】
6. Auth layout redirects missing session to login inside `/app` area.【F:src/app/app/layout.tsx†L1-L13】
7. Dashboard filters tickets by status/priority search params and organization/requester scope.【F:src/app/app/page.tsx†L37-L73】
8. Dashboard search attempts to filter on nonexistent `description` field (schema uses `descriptionMd`).【F:src/app/app/page.tsx†L52-L65】【F:prisma/schema.prisma†L94-L120】
9. Tickets API GET scopes requester vs organization tickets and requires authentication.【F:src/app/api/tickets/route.ts†L16-L38】
10. Tickets API POST validates payload with Zod and sets SLA due dates from `SlaPolicy`.【F:src/app/api/tickets/route.ts†L9-L88】
11. Ticket creation writes audit event `TICKET_CREATED`.【F:src/app/api/tickets/route.ts†L75-L88】
12. Ticket detail page hides tickets from other requesters (returns notFound).【F:src/app/app/tickets/[id]/page.tsx†L43-L72】
13. Ticket detail includes Markdown rendering of `descriptionMd`.【F:src/app/app/tickets/[id]/page.tsx†L69-L94】
14. Ticket actions allow requester close/reopen only; agent/admin can manage status/assignees.【F:src/app/api/tickets/[id]/route.ts†L59-L166】
15. Update endpoint validates assignee belongs to same org and has AGENT/ADMIN role.【F:src/app/api/tickets/[id]/route.ts†L118-L156】
16. Update endpoint records audit event `TICKET_UPDATED` with change payload.【F:src/app/api/tickets/[id]/route.ts†L172-L197】
17. Comment endpoint validates auth, allows internal flag, and sets firstResponseAt for first public agent reply.【F:src/app/api/tickets/[id]/comments/route.ts†L16-L58】
18. Comment endpoint does not enforce organization boundary on ticket fetch (no org comparison).【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】
19. Seed script provisions demo org, users, team, SLA policies, ticket, comment, audit event.【F:prisma/seed.js†L7-L99】
20. Prisma schema defines enums for Role/TicketStatus/TicketPriority and ticket relations (requester, assignee, org, tags, comments).【F:prisma/schema.prisma†L10-L168】
