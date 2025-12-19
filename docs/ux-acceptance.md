# UX Acceptance Criteria (role-based)

1. Given a user enters valid credentials, when submitting `/login`, then they are redirected to `/app` and see their role in the header.
2. Given an unauthenticated visitor hits `/app`, when middleware runs, then they are redirected to `/login`.
3. Given a requester session, when loading `/app`, then only tickets where requesterId equals the session user id are returned.
4. Given an agent/admin session, when loading `/app`, then tickets are scoped to the user's organization and include requester/assignee relations.
5. Given the dashboard list loads, when there are no tickets, then an empty state appears with a CTA linking to `/app/tickets/new`.
6. Given a status filter is selected, when the list reloads, then only tickets matching that status render and the select shows the applied value.
7. Given a priority filter is selected, when the list reloads, then only tickets matching that priority render and the select shows the applied value.
8. Given a search query is provided, when tickets are fetched, then the server filters by title or `descriptionMd` (not `description`) case-insensitively without throwing errors.
9. (Proposed) Given more than 20 tickets exist, when loading `/app`, then pagination controls appear and limit results to 20 per page by default.
10. Given a requester clicks "Nowe zgloszenie" on `/app`, when `/app/tickets/new` loads, then the form shows title, description, priority, category, and Markdown preview toggle.
11. Given a requester submits the new ticket form with fields shorter than 3 characters, when submitting, then inline validation errors appear and no request is sent.
12. Given valid ticket data is submitted, when the server responds 201, then the user is redirected to `/app/tickets/[id]` and sees a success toast.
13. Given ticket data fails server validation, when the response returns 400, then the form shows an error banner and preserves user input.
14. Given a requester opens `/app/tickets/[id]` for another requester's ticket, when the server checks ownership, then a 404/not authorized view is shown.
15. Given an agent opens `/app/tickets/[id]`, when the page renders, then internal comments are visible and labeled, and requester name/assignee/team are shown.
16. Given a requester opens `/app/tickets/[id]`, when comments render, then internal comments are omitted from the timeline.
17. (Proposed) Given an agent submits a public comment, when the `/api/tickets/[id]/comments` call succeeds, then the comment appears in the timeline with their name and timestamp.
18. (Proposed) Given an agent marks a comment as internal, when saved, then only non-requester roles can see it and an "Internal" badge is displayed.
19. (Proposed) Given a comment post fails (network/server), when the client receives the error, then a toast appears and any optimistic comment is rolled back.
20. Given an agent changes ticket status via `ticket-actions` controls, when the PATCH succeeds, then the status label updates and the button becomes enabled again.
21. Given a requester attempts to set assignee on their ticket, when submitting, then the server responds 403 and the UI shows an error without applying the change.
22. Given an agent sets an assignee user outside their organization, when submitting, then the server responds 404/403 and no assignment change is shown.
23. Given a ticket moves to RESOLVED or CLOSED, when the PATCH succeeds, then `resolvedAt`/`closedAt` timestamps are populated and surfaced on the page.
24. Given a user signs out from the topbar, when the action completes, then the session cookies are cleared and they are redirected to `/login`.
25. (Proposed) Given an agent uploads an attachment within a comment, when file type or size is invalid, then the UI blocks upload with a clear message and no server call is made.
26. (Proposed) Given an agent uploads a valid attachment, when saved, then a download link with filename and size appears in the timeline item.
27. (Proposed) Given SLA due times are set, when the ticket first comment by an agent is saved, then `firstResponseAt` is set and the SLA badge updates to "Met" or "Breached".
28. (Proposed) Given an SLA breach occurs, when loading ticket detail, then the SLA badge shows "Breached" with elapsed time in red text and a tooltip describing the missed target.
29. (Proposed) Given an admin visits `/app/admin/users`, when they attempt to demote the last remaining admin, then the UI blocks the change and shows a warning.
30. (Proposed) Given an admin creates a new team in `/app/admin/teams`, when the form submits valid data, then the team appears in the list without full page reload.
31. (Proposed) Given an admin merges two tags in `/app/admin/tags`, when confirmed, then the source tag is disabled and affected tickets now reference the target tag.
32. (Proposed) Given an admin edits SLA policy on `/app/admin/sla`, when saving, then the new targets are applied to subsequent tickets and a confirmation toast appears.
33. (Proposed) Given an agent opens `/app/reports`, when selecting a date range, then all widgets and tables refresh to reflect the range and show the active filter.
34. (Proposed) Given a report widget is clicked, when drilldown occurs, then the user is taken to a ticket list with filters matching the widget context.
35. (Proposed) Given an export is triggered from reports, when processing finishes, then a download starts and the UI records an audit entry for the export action.
36. Given the app is viewed on mobile width (<768px), when opening filters on `/app`, then filter controls stack vertically and remain usable without horizontal scroll.
37. Given keyboard-only navigation, when focusing the dashboard, then all interactive elements (filters, cards, actions) are reachable in logical order and visible focus styles render.
38. Given a network error while loading `/app/tickets/[id]`, when detected, then an error banner with retry option appears instead of a blank screen.
# UX Acceptance Criteria

## Authentication & Access
1. **Login success**: Given a user on `/login` with valid credentials, when the form is submitted, then the button shows a loading label and the user is redirected to `/app` with the top bar showing their role.
2. **Login failure**: Given invalid credentials, when submitting `/login`, then an inline red error appears and the login button returns to normal state after the request.
3. **Unauthorized redirect**: Given an unauthenticated visitor requesting `/app`, when the session is missing, then they are redirected to `/login` without rendering list content.
4. **Logout flow**: Given an authenticated user, when “Wyloguj” is clicked, then they are signed out and routed to `/login`.
5. **Unauthorized ticket access**: Given a requester trying to open another user’s `/app/tickets/[id]`, when the ticket requesterId does not match, then the response is Not Found instead of partial data.

## Ticket List & Filtering
6. **Requester scope**: Given a requester on `/app`, when tickets load, then only tickets where requesterId equals the user id are shown.
7. **Agent/Admin scope**: Given an agent or admin on `/app`, when tickets load, then tickets from the user’s organization are shown regardless of requester.
8. **Status filter**: Given multiple statuses exist, when a status is selected and the filter form submitted, then only tickets with that status render and the select stays highlighted.
9. **Priority filter**: Given multiple priorities exist, when a priority is selected and applied, then only matching tickets render and the select retains the value.
10. **Search filter**: Given tickets containing a query in title or description, when text is entered and applied, then only matching tickets (case-insensitive) are displayed.
11. **Empty state**: Given no tickets match filters, when `/app` renders, then a dashed empty-state card appears with copy and a link to create a ticket.
12. **Card data**: Given tickets render, when viewing a card, then it shows ticket number, title, status label, priority pill, requester, optional assignee user/team, and created timestamp.
13. **Card navigation**: Given a ticket card is visible, when clicked, then the user navigates to `/app/tickets/[id]` for that ticket.
14. **Proposed pagination**: Given more tickets than the page size, when pagination controls are used, then tickets load in pages without duplicating items.
15. **Proposed saved views**: Given a user saves current filters/search as a view, when selecting that view later, then filters and search text reapply automatically.

## Ticket Creation
16. **Quick create validation**: Given the inline form on `/app`, when required fields violate length rules, then inline errors appear and submission is blocked.
17. **Quick create success**: Given valid inputs, when submitting the inline form, then the button shows a spinner, a success toast appears, fields reset, and the list refreshes with the new ticket.
18. **Quick create failure**: Given the API returns an error, when submitting the inline form, then an error toast appears and all user-entered values remain.
19. **Full create navigation**: Given a user clicks “Nowe zgłoszenie”, when `/app/tickets/new` loads, then the full form displays the same fields and validation rules.
20. **Markdown preview toggle**: Given description text exists, when toggling to preview, then markdown-rendered content appears; toggling back returns to editable textarea without loss.

## Ticket Detail & Actions
21. **Header completeness**: Given a valid ticket, when `/app/tickets/[id]` renders, then header shows number, title, created date, requester, assignee user/team, priority, and status pills.
22. **Metadata grid**: Given ticket fields exist, when viewing metadata, then category, assignee team, assignee user, and created date display in the grid.
23. **Requester status limits**: Given a requester viewing their own ticket, when opening status dropdown, then only Close and/or Reopen options appear based on current state.
24. **Agent/Admin status control**: Given an agent/admin, when opening status dropdown, then all statuses are available and the save button disables while pending or unchanged.
25. **Assignment controls visibility**: Given a requester, when viewing the actions panel, then assignment selects are hidden; given agent/admin, they are visible.
26. **Assignment save**: Given an agent/admin selects an assignee user/team, when saving, then a success toast appears and refreshed data shows new assignee; errors surface as toasts without clearing selections.
27. **Comment visibility by role**: Given comments exist, when a requester views them, then internal comments are absent; when an agent/admin views, internal comments display with amber styling and the “Wewnętrzny” tag.
28. **Public comment submission**: Given any authenticated user, when submitting a public comment with text, then the button disables during submit, a success toast appears, and the comment appears in timeline after refresh.
29. **Internal comment guard**: Given a requester, when composing, then the internal checkbox is not rendered; given agent/admin, toggling the checkbox saves the comment as internal.
30. **Last activity indicator**: Given comments exist, when the detail page renders, then “Ostatnia aktywność” reflects the latest visible comment date or ticket update.
31. **Empty comments state**: Given no visible comments, when the timeline renders, then the message “Brak komentarzy.” appears in the stream area.

## Reporting & Admin (Proposed)
32. **Reporting filters**: Given an admin on `/app/admin/reports`, when adjusting date/team/status filters, then all dashboard widgets update and indicate applied filters.
33. **Export UX**: Given an admin triggers CSV export, when processing, then a progress indicator appears and a download link/email is provided on completion.
34. **Entity delete safeguards**: Given an admin attempts to delete a team or category in use, when confirming, then the UI blocks deletion and prompts reassignment instead.
35. **Audit visibility**: Given an admin edits a configuration item, when saved, then an audit log entry is created showing actor, time, and old/new values.

## Accessibility & Resilience
36. **Keyboard navigation**: Given keyboard-only navigation, when tabbing through forms and action buttons, then focus rings are visible and all controls are reachable without a mouse.
37. **Error persistence**: Given a failed status/assignment/comment action, when returning to the form, then previous input selections remain for retry without refresh.
38. **Session messaging**: Given an automatic logout (timeout), when redirected to `/login`, then the UI explains the reason and offers re-login. (Proposed)
