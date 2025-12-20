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

# Screen Map by Persona/Role

## Requester
- **/login**  
  - Purpose: capture credentials and route into the workspace.  
  - Entry points: direct link or redirect after logout/session expiry.  
  - Required data: none preloaded; uses callbackUrl query for post-login redirect.  
  - Primary actions: enter email/password, submit, see inline error or loading state, continue to `/app` on success.
- **/app**  
  - Purpose: requester ticket workspace showing only self-submitted tickets with quick creation.  
  - Entry points: redirect after login or back links from detail/new.  
  - Required data: authenticated session with requester id/role; tickets filtered by requesterId plus optional status/priority/search params.  
  - Primary actions: filter/search, open ticket card to detail, start full creation, submit quick ticket form with markdown edit/preview and inline validation feedback.
- **/app/tickets/new**  
  - Purpose: focused full-screen creation using the same validated form.  
  - Entry points: “Nowe zgłoszenie” CTA or empty-state link from `/app`.  
  - Required data: session context for requester defaults.  
  - Primary actions: enter title/description markdown, select priority, add category, toggle preview, submit, return to list.
- **/app/tickets/[id]**  
  - Purpose: view a single ticket with metadata and comment timeline (public-only visibility for requester).  
  - Entry points: card click from list, link after creation, or shared deep link.  
  - Required data: ticket with requester, assignee user/team, priority/status/category, and comments filtered to public for requester.  
  - Primary actions: read markdown description, review metadata, add public comment, change status to close/reopen when allowed, navigate back.

## Agent
- **/login** – same surface as requester for credential entry.
- **/app**  
  - Purpose: organization queue with filters and quick creation.  
  - Entry points: post-login redirect or back from detail.  
  - Required data: session scoped to organization; tickets fetched across org with status/priority/search filters.  
  - Primary actions: filter/search, open detail, create on behalf of organization via quick form.
- **/app/tickets/[id]**  
  - Purpose: full workspace for updates.  
  - Entry points: list cards or deep links.  
  - Required data: ticket with requester, assignee, team, comments (public + internal), status/priority/category.  
  - Primary actions: change status, assign agent/team, add public or internal comments, review timeline and last activity, return to list.

## Admin
- **/login** – same as other roles.
- **/app** – mirrors agent visibility and actions for ticketing. 
- **/app/tickets/[id]** – same as agent with full status and assignment control.
- **Proposed: /app/admin** – admin console landing to manage users, teams, SLAs, categories, and audit/reporting links.  
- **Proposed: /app/admin/reports** – reporting dashboards with filters, drill-down links, and CSV export controls.
