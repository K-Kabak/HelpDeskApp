# Current State

## Stack (evidence-backed)
- Next.js 16 app router with TypeScript, React 19, Tailwind CSS, and ESLint tooling; package scripts include Next dev/build/start and Prisma/Vitest/Playwright helpers.—«…F:package.json‘«·L5-L63—«≈
- NextAuth credential-based authentication using Prisma adapter and JWT sessions; credentials provider hashes validated with bcrypt and session tokens carry role and organizationId claims.—«…F:src/lib/auth.ts‘«·L21-L77—«≈
- Prisma ORM targeting PostgreSQL with defined enums for Role/TicketStatus/TicketPriority and relational models for organizations, users, tickets, comments, attachments, tags, audit events, SLAs, and NextAuth tables.—«…F:prisma/schema.prisma‘«·L5-L230—«≈
- Middleware enforces authentication on all `/app/*` routes via NextAuth middleware matcher.—«…F:middleware.ts‘«·L1-L5—«≈

## Repository Map
- `src/app` ‘«Ù Next.js routes and layouts.
  - `layout.tsx`, `providers.tsx` ‘«Ù global fonts/providers (SessionProvider, React Query).—«…F:src/app/layout.tsx‘«·L1-L23—«≈—«…F:src/app/providers.tsx‘«·L1-L17—«≈
  - `page.tsx` ‘«Ù root redirect to login/app based on session.—«…F:src/app/page.tsx‘«·L1-L10—«≈
  - `login/` ‘«Ù credential login form posting to NextAuth.—«…F:src/app/login/page.tsx‘«·L1-L55—«≈
  - `app/` ‘«Ù authenticated area layout, dashboard, ticket views, forms, actions.—«…F:src/app/app/layout.tsx‘«·L1-L16—«≈—«…F:src/app/app/page.tsx‘«·L25-L218—«≈—«…F:src/app/app/tickets/[id]/page.tsx‘«·L1-L210—«≈
  - `api/` ‘«Ù Next.js API routes (auth, tickets CRUD, ticket comments).—«…F:src/app/api/auth/[...nextauth]/route.ts‘«·L1-L6—«≈—«…F:src/app/api/tickets/route.ts‘«·L1-L89—«≈—«…F:src/app/api/tickets/[id]/route.ts‘«·L1-L210—«≈—«…F:src/app/api/tickets/[id]/comments/route.ts‘«·L1-L58—«≈
- `src/components` ‘«Ù shared UI (top bar with sign-out).—«…F:src/components/topbar.tsx‘«·L1-L17—«≈
- `src/lib` ‘«Ù Prisma client configuration and NextAuth options.—«…F:src/lib/prisma.ts‘«·L1-L12—«≈—«…F:src/lib/auth.ts‘«·L21-L77—«≈
- `src/types` ‘«Ù NextAuth session/JWT typings extending user fields.—«…F:src/types/next-auth.d.ts‘«·L1-L20—«≈
- `prisma/` ‘«Ù schema, seed script establishing demo org/users/teams/SLA/tag/ticket/comment/audit event.—«…F:prisma/schema.prisma‘«·L5-L230—«≈—«…F:prisma/seed.js‘«·L1-L99—«≈
- Root configs: lint/tailwind/postcss/tsconfig/next config; README with setup instructions.—«…F:package.json‘«·L5-L63—«≈—«…F:README.md‘«·L1-L67—«≈

## Auth & Scoping Model (as implemented)
- Authentication: NextAuth credentials provider; login form calls `signIn("credentials")` and redirects on success.—«…F:src/app/login/page.tsx‘«·L3-L53—«≈
- Session strategy: JWT with custom `role` and `organizationId` claims injected during `jwt` callback and exposed on `session.user`.—«…F:src/lib/auth.ts‘«·L60-L77—«≈
- Protected routes: middleware restricts `/app/*`; server pages explicitly redirect to `/login` when session missing.—«…F:middleware.ts‘«·L1-L5—«≈—«…F:src/app/app/layout.tsx‘«·L1-L13—«≈—«…F:src/app/page.tsx‘«·L1-L10—«≈
- Authorization:
  - Ticket listing scopes to requester‘«÷s own tickets or entire organization for agent/admin via `where` clause.—«…F:src/app/api/tickets/route.ts‘«·L22-L35—«≈
  - Ticket detail fetch rejects when requester access does not match ticket requester; org boundary enforced during updates but not during comment creation (see Known Issues).—«…F:src/app/app/tickets/[id]/page.tsx‘«·L43-L72—«≈—«…F:src/app/api/tickets/[id]/route.ts‘«·L35-L81—«≈—«…F:src/app/api/tickets/[id]/comments/route.ts‘«·L21-L39—«≈
  - Status/assignment update permissions: requesters limited to closing/reopening their tickets; agent/admin required for priority/assignee changes with org-validity checks and audit logging.—«…F:src/app/api/tickets/[id]/route.ts‘«·L59-L197—«≈
  - Comment permissions: public comments allowed for requester or agent/admin; internal comments blocked for requester but no organization check on ticket lookup.—«…F:src/app/api/tickets/[id]/comments/route.ts‘«·L21-L39—«≈

## Current Capabilities Index
### Confirmed
- Credential-based login with demo account seeded via Prisma seed script (admin/requester/agent).—«…F:src/lib/auth.ts‘«·L21-L77—«≈—«…F:prisma/seed.js‘«·L13-L67—«≈
- Authenticated dashboard listing tickets with status/priority filters and free-text search (see fragile note).—«…F:src/app/app/page.tsx‘«·L37-L164—«≈
- Ticket creation via API with Zod validation, SLA due time calculation from `SlaPolicy`, default status `NOWE`, and audit event creation.—«…F:src/app/api/tickets/route.ts‘«·L9-L89—«≈
- Ticket detail page with Markdown rendering, requester visibility check, comment timeline, and action panel for status/assignment changes.—«…F:src/app/app/tickets/[id]/page.tsx‘«·L11-L210—«≈
- Ticket status/priority/assignee updates with role-based rules and audit event logging in transaction.—«…F:src/app/api/tickets/[id]/route.ts‘«·L59-L197—«≈
- Comment creation endpoint with internal flag support and first-response timestamp setting for agent public replies.—«…F:src/app/api/tickets/[id]/comments/route.ts‘«·L7-L58—«≈

### Partial/Fragile
- Dashboard search filter queries `description` column that does not exist (schema uses `descriptionMd`), causing runtime error on search usage.—«…F:src/app/app/page.tsx‘«·L52-L66—«≈—«…F:prisma/schema.prisma‘«·L94-L120—«≈
- Comment endpoint lacks organization boundary enforcement; any authenticated user knowing ticket ID and having agent/admin role could comment across orgs.—«…F:src/app/api/tickets/[id]/comments/route.ts‘«·L21-L39—«≈
- Comment form posts without client-side validation beyond required attribute; server accepts empty whitespace except min length 1, no Markdown sanitization beyond ReactMarkdown usage on display.—«…F:src/app/app/tickets/[id]/comment-form.tsx‘«·L1-L49—«≈—«…F:src/app/app/tickets/[id]/page.tsx‘«·L183-L204—«≈
- No pagination on ticket lists; `findMany` returns all tickets ordered by createdAt.—«…F:src/app/app/page.tsx‘«·L52-L73—«≈—«…F:src/app/api/tickets/route.ts‘«·L27-L35—«≈
- Audit events created but never surfaced in UI or additional endpoints (only writes).—«…F:src/app/api/tickets/route.ts‘«·L75-L88—«≈—«…F:src/app/api/tickets/[id]/route.ts‘«·L172-L197—«≈

### Not Found (search steps in docs/search-log.md)
- No API endpoints for attachments or tag management beyond seed; no upload handlers located under `src/app/api` (find results limited to auth/tickets/comments).—«…F:src/app/api/tickets/route.ts‘«·L1-L89—«≈—«…F:src/app/api/tickets/[id]/route.ts‘«·L1-L210—«≈—«…F:src/app/api/tickets/[id]/comments/route.ts‘«·L1-L58—«≈
- No reporting/metrics endpoints or UI; repository contains only dashboard and ticket detail views (checked `src/app/app` files).—«…F:src/app/app/page.tsx‘«·L25-L218—«≈—«…F:src/app/app/tickets/[id]/page.tsx‘«·L1-L210—«≈
- No automated tests implemented despite scripts; `tests` directory absent and `test` scripts not referenced elsewhere (search log notes).—«…F:package.json‘«·L5-L64—«≈

## Quality Gate: Evidence-Backed Claims (20)
1. Stack uses Next.js 16 with TypeScript and Tailwind per dependencies/scripts.—«…F:package.json‘«·L5-L63—«≈
2. Auth uses NextAuth credentials provider with Prisma adapter and bcrypt verification.—«…F:src/lib/auth.ts‘«·L21-L56—«≈
3. JWT sessions enriched with role and organizationId claims via callbacks.—«…F:src/lib/auth.ts‘«·L60-L77—«≈
4. Middleware protects `/app/*` routes using NextAuth middleware export/matcher.—«…F:middleware.ts‘«·L1-L5—«≈
5. Root page redirects unauthenticated users to `/login`, authenticated to `/app`.—«…F:src/app/page.tsx‘«·L1-L10—«≈
6. Auth layout redirects missing session to login inside `/app` area.—«…F:src/app/app/layout.tsx‘«·L1-L13—«≈
7. Dashboard filters tickets by status/priority search params and organization/requester scope.—«…F:src/app/app/page.tsx‘«·L37-L73—«≈
8. Dashboard search attempts to filter on nonexistent `description` field (schema uses `descriptionMd`).—«…F:src/app/app/page.tsx‘«·L52-L65—«≈—«…F:prisma/schema.prisma‘«·L94-L120—«≈
9. Tickets API GET scopes requester vs organization tickets and requires authentication.—«…F:src/app/api/tickets/route.ts‘«·L16-L38—«≈
10. Tickets API POST validates payload with Zod and sets SLA due dates from `SlaPolicy`.—«…F:src/app/api/tickets/route.ts‘«·L9-L88—«≈
11. Ticket creation writes audit event `TICKET_CREATED`.—«…F:src/app/api/tickets/route.ts‘«·L75-L88—«≈
12. Ticket detail page hides tickets from other requesters (returns notFound).—«…F:src/app/app/tickets/[id]/page.tsx‘«·L43-L72—«≈
13. Ticket detail includes Markdown rendering of `descriptionMd`.—«…F:src/app/app/tickets/[id]/page.tsx‘«·L69-L94—«≈
14. Ticket actions allow requester close/reopen only; agent/admin can manage status/assignees.—«…F:src/app/api/tickets/[id]/route.ts‘«·L59-L166—«≈
15. Update endpoint validates assignee belongs to same org and has AGENT/ADMIN role.—«…F:src/app/api/tickets/[id]/route.ts‘«·L118-L156—«≈
16. Update endpoint records audit event `TICKET_UPDATED` with change payload.—«…F:src/app/api/tickets/[id]/route.ts‘«·L172-L197—«≈
17. Comment endpoint validates auth, allows internal flag, and sets firstResponseAt for first public agent reply.—«…F:src/app/api/tickets/[id]/comments/route.ts‘«·L16-L58—«≈
18. Comment endpoint does not enforce organization boundary on ticket fetch (no org comparison).—«…F:src/app/api/tickets/[id]/comments/route.ts‘«·L21-L39—«≈
19. Seed script provisions demo org, users, team, SLA policies, ticket, comment, audit event.—«…F:prisma/seed.js‘«·L7-L99—«≈
20. Prisma schema defines enums for Role/TicketStatus/TicketPriority and ticket relations (requester, assignee, org, tags, comments).—«…F:prisma/schema.prisma‘«·L10-L168—«≈
