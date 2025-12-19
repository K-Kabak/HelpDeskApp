# UI/UX Spec (HelpDesk)

## End-to-end journeys
- Requester: Login (`/login`) -> redirected to `/app` with ticket list scoped to requester (`src/app/app/page.tsx`) -> filters/search -> open ticket detail `/app/tickets/[id]` -> add public comment (currently posts to missing API) -> close/reopen when allowed by ownership (`src/app/app/tickets/[id]/ticket-actions.tsx`) -> sign out from topbar.
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
- Time controls: Date range picker with presets (7/30/90 days) and quick “today”.
- Exports: CSV for list, PDF for charts; require user confirmation and show progress/toast; respect current filters.

## Error / empty / loading states
- Login: Inline form errors, generic auth error banner, loading state on submit.
- Dashboard list: Skeleton cards while loading; empty state with CTA; error banner with retry.
- Ticket create: Disable submit during request; show inline validation errors from server; success redirects to detail with toast.
- Ticket detail: Skeleton for header/timeline; 404 view when unauthorized/not found; action buttons disabled while patching; comment form shows posting state.
- Admin/reporting (Proposed): Section-level skeletons; “no data” placeholders per widget/table; explicit messaging when user lacks permission.

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
- SLA clocks inaccurate -> Compute on status/comment events and show “unknown” when timestamps missing.
- Saved views/bulk ops (Proposed) could surprise -> Require confirmation, show preview of affected count, allow undo where possible.
- Reporting exports could include unauthorized data -> Apply org scoping and logged-in user role on export requests; include audit trail.
