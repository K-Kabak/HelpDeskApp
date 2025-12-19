<<<<<<< ours
# Screen Map (by persona/role)

## Requester
- `/login`
  - Purpose: Authenticate with email/password and reach protected app space.
  - Entry points: Direct link, redirect from `/` or `/app` when unauthenticated.
  - Required data: None before submit; email/password fields on form.
  - Primary actions: Submit credentials, view auth error, link to retry.
- `/app` (dashboard list)
  - Purpose: See own tickets with filters and counts.
  - Entry points: Redirect from `/` after login, topbar home link, successful ticket create redirect.
  - Required data: Session (role=requester, org id), ticket list scoped to requester with requester/assignee relations.
  - Primary actions: Filter by status/priority, text search, open ticket detail, start new ticket via button or quick form.
- `/app/tickets/new`
  - Purpose: Compose a full ticket with Markdown description.
  - Entry points: Dashboard "Nowe zgloszenie" button, manual URL.
  - Required data: Session, SLA policy for due calculations (server), validation rules (title/description/priority).
  - Primary actions: Enter title/description/priority/category, toggle Markdown preview, submit or cancel via nav/back.
- `/app/tickets/[id]`
  - Purpose: Read ticket details/timeline and track status.
  - Entry points: Dashboard card link, shared deep link.
  - Required data: Session, ticket with requester/assignee/team/comments (public only), audit fields, status/priority.
  - Primary actions: Add public comment (currently posts to missing API), close/reopen own ticket when allowed, download attachments (Proposed), view SLA/dates (Proposed).

## Agent (also Admin for operational UI)
- `/login`
  - Purpose: Same as requester; surfaces role after success.
  - Entry points: Direct link, redirect when session missing.
  - Required data: None pre-submit.
  - Primary actions: Submit credentials, handle errors.
- `/app` (dashboard list)
  - Purpose: Manage organization tickets.
  - Entry points: Redirect after login, topbar home.
  - Required data: Session (agent/admin), ticket list scoped to organization with requester/assignee/team relations.
  - Primary actions: Filter by status/priority, search, open detail, start new ticket, quick create on behalf of org (currently self as requester).
- `/app/tickets/new`
  - Purpose: Create tickets (for now on own user; Proposed: choose requester).
  - Entry points: Dashboard CTA, manual URL.
  - Required data: Session, validation schema, org SLA.
  - Primary actions: Enter ticket fields, preview Markdown, submit; Proposed: select requester/team/assignee.
- `/app/tickets/[id]`
  - Purpose: Triage and update tickets with timeline context.
  - Entry points: Dashboard card, deep link.
  - Required data: Session, full ticket with requester/assignee/team/comments (internal+public for non-requester), audit fields, SLA timestamps.
  - Primary actions: Change status, priority, assignee user/team; add public/internal comment (API missing), attach files (Proposed), update tags (Proposed), view SLA clocks (Proposed).
- `/app/tickets/[id]/edit` (Proposed)
  - Purpose: Structured edit of fields that are cumbersome inline (tags, category, requester reassignment).
  - Entry points: Edit link from detail.
  - Required data: Ticket data, tag catalogue, team/user lists.
  - Primary actions: Bulk field edits, save/cancel.

## Admin (Proposed console)
- `/app/admin`
  - Purpose: Landing/index for admin controls.
  - Entry points: Topbar/admin link visible to role=ADMIN, manual URL.
  - Required data: Session role=ADMIN, counts of users/teams/SLA policies.
  - Primary actions: Navigate to sub-sections, view recent audits (Proposed).
- `/app/admin/users`
  - Purpose: CRUD for org users/roles.
  - Entry points: Admin index, nav.
  - Required data: User list with roles/org, invite form fields.
  - Primary actions: Invite/create user, edit role/team membership, deactivate/reactivate (soft delete).
- `/app/admin/teams`
  - Purpose: Manage teams and membership.
  - Entry points: Admin nav.
  - Required data: Teams list, membership, backlog size per team.
  - Primary actions: Create/edit team, assign members, set default assignment rules (Proposed).
- `/app/admin/tags`
  - Purpose: Tag taxonomy maintenance.
  - Entry points: Admin nav.
  - Required data: Tag list.
  - Primary actions: Create/rename/disable tags, merge tags (Proposed).
- `/app/admin/sla`
  - Purpose: SLA policy configuration.
  - Entry points: Admin nav.
  - Required data: SLA policies with response/resolve targets per priority.
  - Primary actions: Create/edit policies, set default per org/team, preview timers.
- `/app/reports` (Proposed)
  - Purpose: Operational reporting and exports.
  - Entry points: Topbar/reporting link for agent/admin, dashboard links.
  - Required data: Ticket metrics (volume, SLA, aging), filters by time/team/priority.
  - Primary actions: Change filters, drill into lists, export CSV/PDF.
=======
# Screen Map by Persona/Role

## Requester
- **/login** – Authenticate to access requester workspace. Entry via unauthenticated visits or explicit logout. Requires no preloaded data. Primary actions: submit credentials, view error feedback, navigate to app on success.
- **/app** – Ticket list and quick-create. Entry after login redirect or topbar home link. Requires user session (id, role) and ticket query filtered by requester id, status/priority/search params. Primary actions: filter tickets, open ticket detail, start new ticket, submit quick ticket form.
- **/app/tickets/new** – Full new-ticket form. Entry via “Nowe zgłoszenie” button or empty-state CTA. Requires session, validation rules, SLA-derived defaults. Primary actions: enter title/description markdown/priority/category, toggle edit/preview, submit.
- **/app/tickets/[id]** – Ticket detail with comments. Entry from list cards, deep link, or post-submit refresh. Requires ticket record with requester, assignees, comments (public-only for requester), status/priority/category metadata. Primary actions: read markdown description, view timeline, add public comment, request close or reopen depending on status options.

## Agent
- **/login** – Same as requester.
- **/app** – Organization-wide ticket grid. Entry after login. Requires session and ticket query scoped to organization. Primary actions: filter by status/priority/search, open ticket detail, create ticket on behalf of organization via quick form.
- **/app/tickets/[id]** – Full ticket workspace. Requires ticket with requester, assignee user/team, ordered comments (public+internal). Primary actions: change status, assign user/team, add public or internal comment, review timeline metadata, navigate back to list.

## Admin
- **/login** – Same authentication pattern.
- **/app** – Same as agent with organization-wide visibility.
- **/app/tickets/[id]** – Same as agent, with elevated authority identical to agent in current build.
- **(Proposed) /app/admin** – Admin console landing. Entry from topbar or nav (to be added). Requires organization context. Primary actions: navigate to user, team, SLA, and taxonomy management.
- **(Proposed) /app/admin/reports** – Reporting/dashboard view. Entry from admin console. Requires aggregated metrics and export endpoint. Primary actions: filter by date/team/status, drill into queues, export CSV.
>>>>>>> theirs
