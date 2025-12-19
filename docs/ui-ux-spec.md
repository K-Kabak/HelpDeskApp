<<<<<<< ours
<<<<<<< ours
# UI/UX Spec (HelpDesk)

## End-to-end journeys
- Requester: Login (`/login`) -> redirected to `/app` with ticket list scoped to requester (`src/app/app/page.tsx`) -> apply filters/search -> open ticket detail `/app/tickets/[id]` -> add public comment (currently posts to missing API) -> close/reopen when allowed by ownership (`src/app/app/tickets/[id]/ticket-actions.tsx`) -> sign out from topbar.
- Agent: Login -> `/app` shows org tickets with filters/search -> open ticket -> adjust status/priority/assignee (allowed for non-requesters) -> add public/internal note (API missing) -> return to list or create new ticket via dashboard CTA or quick form (`src/app/app/ticket-form.tsx`).
- Admin (Proposed): Login -> `/app/admin` hub -> manage users/teams/tags/SLA -> return to `/app` to monitor queues -> visit `/app/reports` (Proposed) for metrics and drilldowns.

## Ticket lists / queues
- Data source: `src/app/app/page.tsx` queries Prisma without pagination; scope by requester vs organization from session.
- Filters: status select, priority select, text search (title + currently incorrect `description` field). Show applied filters in inputs; clearing returns all. Recommended: fix search to use `descriptionMd`, add pagination (page size 20 default, max 100), and persistent query params for deep links.
- Layout: Card grid with ticket number, priority pill, title, status label, requester, assignee user/team, created timestamp. Empty state rendered when no results with CTA to create ticket.
- Bulk ops (Proposed): Add multi-select with bulk status change and assignment for agents/admins; show confirmation dialogs and per-item failure toasts.
- Saved views (Proposed): Allow saving filter/search combos as named views per user; expose as tabs above list.

## Ticket detail / timeline
- Data: Ticket with requester/assignee/team/comments, audit fields, SLA timestamps; requester visibility hides internal notes (`src/app/app/tickets/[id]/page.tsx`).
- Timeline composition: Ordered newest-first stream of comments (public/internal) and audit events (Proposed surface) with timestamps, author, role badge, attachment chips (Proposed).
- Public vs internal: Requesters see only public comments; agents/admins can toggle public/internal on compose (UI present; API missing).
- Actions: Status and priority selects plus assignee user/team controls gated by role/ownership (`ticket-actions.tsx`); requester limited to close/reopen. Show success/error toasts and disable controls during submit.
- Attachments UX (Proposed): Inline uploader with size/type validation, per-comment association, download links with icons; previews for images/markdown.
- SLA display (Proposed): Badges for response/resolve due vs achieved, breach indicators, and relative timers.

## Admin console IA (Proposed)
- Navigation: Left rail with Users, Teams, Tags, SLA, Settings.
- CRUD patterns: Table list with pagination, search, and inline filters; modal or side panel for create/edit; destructive actions require confirmation with explicit copy; soft delete preferred for users/tags.
- Role/permission rules: Only ADMIN sees admin nav and endpoints. Validation to keep at least one admin active. Team membership edits limited to same org.
- Safety: Optimistic UI only after server ack; show audit log snippet per entity with who/when/what changed.

## Reporting UX (Proposed)
- Dashboard widgets: Ticket volume by status/priority, SLA compliance, aging buckets, reopen rate, top tags.
- Drilldowns: Clicking a widget opens a filtered ticket list preserving filters as query params.
- Time controls: Date range picker with presets (7/30/90 days) and quick "today".
- Exports: CSV for list, PDF for charts; require user confirmation and show progress/toast; respect current filters.

## Error / empty / loading states
- Login: Inline form errors, generic auth error banner, loading state on submit.
- Dashboard list: Skeleton cards while loading; empty state with CTA; error banner with retry.
- Ticket create: Disable submit during request; show inline validation errors from server; success redirects to detail with toast.
- Ticket detail: Skeleton for header/timeline; 404 view when unauthorized/not found; action buttons disabled while patching; comment form shows posting state.
- Admin/reporting (Proposed): Section-level skeletons; "no data" placeholders per widget/table; explicit messaging when user lacks permission.

## Accessibility + performance requirements
- Keyboard: All form controls focusable; dialog/side-panel traps focus; shortcut for quick ticket (`Alt+N` Proposed).
- Semantics: Use headings, lists, buttons/links correctly; aria-live for toasts and async result counts.
- Color/contrast: Meet WCAG AA; badges/labels must pair color + text.
- Loading resilience: Avoid blocking app shell; prefer streaming/suspense for detail page; paginate lists to reduce payload.
- Responsiveness: Cards stack on mobile; filters collapse into accordion; tables scroll horizontally with sticky headers.

## Top 10 UX risks and mitigations
- Missing comment API breaks compose -> Add `/api/tickets/[id]/comments` with optimistic UI rollback.
- Search uses `description` field -> Fix to `descriptionMd` and add defensive try/catch with empty result fallback.
- No pagination -> Enforce take/skip and UI pager to avoid timeouts.
- Requester visibility leakage -> Re-check role scoping server-side for comments/attachments before rendering.
- Status/assignee controls fail silently -> Standardize toast/error handling and disabled states.
- Attachments not validated (Proposed) -> Enforce MIME/size server-side, virus scanning, and signed URLs.
- Admin actions could lock out all admins -> Prevent removing last admin and surface warning.
- SLA clocks inaccurate -> Compute on status/comment events and show "unknown" when timestamps missing.
- Saved views/bulk ops (Proposed) could surprise -> Require confirmation, show preview of affected count, allow undo where possible.
- Reporting exports could include unauthorized data -> Apply org scoping and logged-in user role on export requests; include audit trail.
=======
# UI/UX Specification

## End-to-End Journeys
### Requester
1. **Login**: land on `/login`, submit credentials, view inline error on failure, redirect to `/app` on success.
2. **Browse tickets**: on `/app`, see only own tickets with status/priority/search filters, card grid, and empty state CTA if none.
3. **Create ticket (quick)**: use in-page form on `/app` with markdown edit/preview toggle, priority/category fields, inline validation, loading state, toast success/error, and list refresh.
4. **Create ticket (full page)**: navigate via “Nowe zgłoszenie” or empty-state link to `/app/tickets/new`, complete same form in focused layout.
5. **View ticket**: open `/app/tickets/[id]` showing header metadata, markdown description, category/assignee fields, status & priority pills, and requester-only visible public comments.
6. **Respond / close**: add public comments; change status only to Close or Reopen when allowed; see confirmation toast and refreshed timeline.

### Agent
1. **Login**: same as requester.
2. **Queue review**: `/app` shows all organization tickets with filters; cards reveal requester, priority, status, and assignment; open detail.
3. **Ticket triage**: on detail, update status to any state, assign user/team, add public or internal comments (highlighted), with toasts and refresh.
4. **Follow-up**: monitor last activity timestamp, continue conversation via comments, and adjust assignment/status as work progresses.

### Admin
- Currently same as Agent for ticketing. **Proposed**: dedicated admin console for org settings (users, teams, SLAs, taxonomies) and reporting with dashboards and exports.

## Ticket List / Queues / Views
- **Filters**: status, priority drop-downs plus text search across title/description; filter selection highlights with ring and persists via query params.
- **Results layout**: card grid with ticket number, priority pill, title, status label, requester, assignee (user/team), created timestamp. Card click opens detail.
- **Empty state**: dashed card with headline, helper text, and “Utwórz zgłoszenie” link.
- **Pagination**: not implemented; **Proposed** add cursor-based pagination with page size selector to avoid large queries.
- **Bulk operations**: not implemented; **Proposed** multi-select for mass status change/assignment limited to agent/admin roles.
- **Saved views**: not implemented; **Proposed** allow saving filter/search combinations with personal vs team visibility.
- **Quick create**: in-page form at list bottom for fast submission with validation and markdown toggle.

## Ticket Detail Composition
- **Header**: ticket number, title, created date, requester name, assignee user/team, priority pill, status pill.
- **Description**: markdown-rendered body with GFM support.
- **Metadata**: category, assignee team, assignee user, created date displayed in definition list.
- **Actions panel**: status dropdown respecting role rules; assignment form for agent/admin; helper text for requester limits; buttons disabled while pending.
- **Timeline (comments)**: chronological with avatar initials badge, author name + role chip, created timestamp, markdown body. Internal comments highlighted in amber with “Wewnętrzny” tag and hidden from requesters.
- **Composer**: textarea with required validation; internal checkbox shown only to agents/admins; button reflects loading state.
- **Navigation**: “Powrót” link to list.

## Admin Console IA (Proposed)
- **Sections**: Organization overview, Users, Teams, SLA Policies, Categories/Tags, Audit logs, Reports.
- **CRUD Patterns**: list with search/filter, inline add/edit drawers, destructive actions gated by confirmation modal; role-based visibility (admin-only). Changes should surface toast feedback and optimistic UI where safe.
- **Safety Rules**: prevent deletion of entities linked to tickets; require reassignment; audit events captured on changes.

## Reporting UX (Proposed)
- **Dashboards**: KPIs for new/closed tickets, SLA compliance, backlog by priority/status, agent workload.
- **Drilldowns**: click-through from widgets to filtered ticket lists or agent performance pages.
- **Exports**: CSV export respecting current filters with async generation and email/download link; show progress state.

## Error / Empty / Loading States
- **Login**: inline red message on authentication failure; submit button disabled with spinner text during login.
- **List**: empty-state card; filters always visible; quick form disabled during submit with spinner and toast feedback.
- **Detail**: `notFound` handling for unauthorized or missing tickets; status/assignment buttons disabled while mutations pending; comment form disables during post.
- **API errors**: toast error messages on ticket create/update/comment failures; forms keep user inputs for retry.
- **Loading**: server-rendered pages load with skeleton-free layout; **Proposed** add skeletons for list cards and detail header to reduce perceived wait.

## Accessibility Requirements
- Inputs and selects include labels; error text links via `aria-describedby` on form fields; focus rings on interactive controls.
- Ensure keyboard access for toggles (edit/preview), filters, and action buttons; maintain visible focus outline even when disabled states exist.
- Color usage: maintain contrast on pills and role badges; internal comments use both color and label for non-reliance on color.
- **Proposed**: add skip-to-content link in layout and announce toast messages via ARIA live region.

## Performance Requirements
- List queries ordered by created date; **Proposed** cursor-based pagination and server-side caching of filter queries to reduce payload.
- Markdown rendering limited to scoped prose container; **Proposed** debounce search input before submit to cut needless queries.

## Top 10 UX Risks & Mitigations
1. **Unbounded ticket lists** – Add pagination and item count to prevent slow loads.
2. **Requester confusion on status limits** – Keep helper text and disable unauthorized status options; consider tooltip explaining permissions.
3. **Internal comment leakage** – Maintain strict role gating and visual amber banner; add confirmation before posting internal notes.
4. **Assignment errors with stale data** – Refresh agent/team options on page load and after updates; show validation errors from API.
5. **Markdown misuse** – Keep preview toggle defaulted to Edit with clear preview state; add markdown helper link.
6. **Form abandonment after errors** – Preserve user input on failed submit; surface specific error text from API.
7. **Accessibility gaps** – Enforce focus states and aria attributes; run automated checks on forms and timeline components.
8. **Timezone ambiguity** – Display timestamps with locale string and tooltip for absolute time; **Proposed** add relative time chips.
9. **Navigation loss after logout** – Sign-out redirects to `/login`; **Proposed** add session timeout warning before auto-logout.
10. **Reporting overload (future)** – Provide filter presets and export queues; avoid blocking UI during heavy computations.
>>>>>>> theirs
=======
# UI/UX Specification

## Core Journeys
### Create → Track → Comment → Close/Reopen (Requester)
1. Start at `/login`, submit credentials with inline error handling and loading label; redirect to `/app` on success.  
2. On `/app`, requester sees only own tickets (filterable by status/priority/search) and can create via quick form or the “Nowe zgłoszenie” CTA.  
3. Quick form enforces min/max length for title/description/category, priority selection, inline errors, edit/preview toggle, and spinner while submitting.  
4. Successful submit toasts success, resets fields to defaults, and refreshes the list; failures surface API message without clearing inputs.  
5. Opening `/app/tickets/[id]` shows ticket metadata, markdown description, and only public comments; unauthorized access returns Not Found.  
6. Requester can add public comments and change status only to close/reopen when allowed; helper text explains limits, buttons disable during mutation, and toasts confirm outcomes.

### Triage → Assign → Internal Notes → Resolve → Close (Agent/Admin)
1. After login, `/app` lists organization tickets with filters/search and request/assignee metadata on cards.  
2. Detail view allows full status changes, assignment of agent or team, and viewing both public and internal comments.  
3. Action panel uses dedicated forms for status and assignment with disabled states during save, toasts on success/error, and refreshed data.  
4. Internal comments are flagged amber with role chips; agents/admins can toggle internal checkbox on the composer, while requesters never see the option.  
5. Last activity indicator tracks latest visible comment or ticket update to guide follow-up.

### Admin Configuration → Effects on Workflow (Proposed)
- Add `/app/admin` with IA for Users, Teams, SLA Policies, Categories/Tags, and Audit Logs. Changes should flow into ticket creation (options in forms), assignment dropdowns, and reporting scopes. 
- Safeguards: block deletion of entities in use, require reassignment flows, and log changes with user/time metadata.

## Ticket List / Queues / Views
- **Filters/search**: status and priority dropdowns with highlight when active, plus text search across title/description; controlled via query params so state persists on reload. 
- **Results**: card grid shows number, priority pill, title, status, requester, optional assignee user/team, and created timestamp; click opens detail. 
- **Empty state**: dashed card with CTA to create when no tickets match. 
- **Quick create**: inline form at bottom of list uses same validation, markdown preview, loading/disabled controls, and success/error toasts. 
- **Proposed**: cursor-based pagination to cap result count, bulk select for agent/admin to apply status/assignment updates, and saved views (personal/team) storing filter/search combinations.

## Ticket Detail UX
- **Header**: ticket number, title, created timestamp, requester, assignee team/user, priority pill, and status pill. 
- **Description**: markdown rendered with GFM in a prose container. 
- **Metadata grid**: category, assignee team/user, and created date displayed in definition list layout. 
- **Action panel**: 
  - Status dropdown: all statuses for agent/admin; requester (owner) limited to close or reopen options; disabled while mutation pending; helper text explains restrictions. 
  - Assignment form: agent/admin only; separate selects for agent/team; disabled when unchanged or pending. 
- **Timeline**: chronological comments with avatar initials, author name, role badge, timestamp, and markdown body; internal comments use amber border/background and “Wewnętrzny” chip and are hidden from requesters. 
- **Composer**: textarea with required validation; internal checkbox visible only to agent/admin; button shows loading text and disables while posting. 
- **Navigation**: link back to `/app` list.

## Admin UX (Proposed)
- **Information architecture**: Admin home (metrics + shortcuts) → Users → Teams → SLAs → Categories/Tags → Audit Logs → Reports. 
- **CRUD patterns**: searchable lists with inline add/edit drawers; destructive actions require confirmation modal and block if linked to tickets; edits show optimistic UI where safe and always toast results. 
- **Safeguards**: prevent deletion of in-use categories/teams/SLA policies; require reassignment flows; keep audit entries for user, time, previous value.

## Reporting UX (Proposed)
- Dashboard with KPIs (new/closed volume, SLA breach rate, backlog by status/priority, agent workload). 
- Widgets drill down to filtered ticket lists; breadcrumbs allow return to dashboard. 
- Exports (CSV) respect current filters; show progress indicator and deliver download link or email on completion.

## Permission-Driven UX Rules
- Unauthenticated users are redirected to `/login`; top bar shows current role and logout control. 
- Requesters see only their own tickets and public comments; status control is restricted to closing/reopening own tickets. 
- Agents/Admins can view organization tickets, manage all statuses and assignments, and post internal comments. 
- Unauthorized ticket access returns Not Found instead of partial data. 
- Future admin console gated to admin role; UI should state why an action is unavailable (e.g., tooltip or helper text near disabled controls).

## Error, Empty, and Loading States
- **Login**: inline red error for failed authentication; button shows loading label during request. 
- **Ticket list**: empty-state card when no results; filter controls always available; quick form and filter submit buttons disable during submission. 
- **Ticket detail**: Not Found for missing/unauthorized tickets; status/assignment buttons disable during mutation; comment button disables while posting; timelines show “Brak komentarzy” when empty. 
- **API errors**: ticket creation, status/assignment updates, and comments surface toast errors without clearing user input. 
- **Proposed**: skeleton loading for list cards/detail header and retry actions for failed API calls.

## Accessibility Requirements
- All form inputs/selects carry visible labels; validation errors connect via `aria-describedby`; focus rings maintained on interactive controls. 
- Markdown preview toggle uses buttons; ensure keyboard operability and focus indication. 
- Internal comment distinction uses both color and text badge; priority/status pills maintain readable contrast. 
- **Proposed**: add skip-to-content link, aria-live region for toast messages, and keyboard shortcuts for filter submission.

## Performance Requirements
- Ticket list queries ordered by creation date; filters/search run server-side. 
- **Proposed**: cursor pagination and caching of common list queries; debounce search input before submission; stream markdown rendering for long descriptions if needed.

## Top 10 UX Risks & Mitigations
1. **Unbounded lists causing slow loads** – add pagination and item counts; keep filters server-side. 
2. **Requester confusion over limited status options** – show helper text near dropdown and disable unavailable statuses. 
3. **Internal comment leakage** – keep requester views filtered to public comments and visually flag internal notes; require explicit checkbox. 
4. **Stale assignment options** – reload agent/team options after save and on page load; surface API validation errors. 
5. **Form abandonment after errors** – preserve inputs on failure and display specific API message; allow re-submit without refresh. 
6. **Markdown misuse** – default to Edit mode with clear Preview toggle; include helper copy for Markdown basics. 
7. **Accessibility regressions** – enforce labels, focus states, and aria links; add automated a11y checks in CI. 
8. **Timezone ambiguity** – pair locale timestamps with relative-time tooltip; standardize display format. 
9. **Navigation loss on logout** – redirect to `/login` with message; consider session timeout warning before forced logout. 
10. **Reporting overload (future)** – offer preset filters and async export queue with progress; avoid blocking UI during heavy queries.
>>>>>>> theirs
