# Current state (evidence-first)

## Stack and runtime
- Next.js 16 app router with TypeScript, TailwindCSS, eslint tooling, NextAuth, Prisma, React Query, Zod, Vitest/Playwright (see package.json scripts and deps).
- Middleware enforces NextAuth session on `/app/*` paths via middleware export and matcher config (`middleware.ts`).

## Repository map (implementation touchpoints)
- `src/lib/auth.ts` – NextAuth credential configuration with Prisma adapter, JWT session strategy, and role/org claims injection.
- `src/lib/prisma.ts` – Prisma client singleton with dev logging.
- `src/types/next-auth.d.ts` – Session/JWT type augmentation for role and organization fields.
- `src/app` – App Router pages: root redirect to `/app`, login form, protected layout with topbar, dashboard (`/app`) with ticket listing/filters/quick-create, ticket creation page, ticket detail page with actions/comments, API routes for tickets and auth.
- `src/components/topbar.tsx` – signed-in header with sign-out action.
- `prisma/schema.prisma` – database schema for organizations, users (roles), teams, tickets (status/priority, SLA timestamps), comments (internal flag), attachments, tags, audit events, SLA policies, and NextAuth tables.
- `prisma/seed.js` – demo seed creating org, users (admin/agent/requester), team with membership, tags, SLA policies, sample ticket/comment/audit event.
- `README.md` – setup steps, scripts, described MVP scope and models.

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