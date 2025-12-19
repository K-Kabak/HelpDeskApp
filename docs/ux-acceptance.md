<<<<<<< ours
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
=======
# UX Acceptance Criteria

1. **Requester login success**: Given a requester on `/login`, when valid credentials are submitted, then the user is redirected to `/app` and sees their role in the top bar.
2. **Requester login failure**: Given invalid credentials, when the form is submitted, then an inline red error message appears and the login button shows a loading label until completion.
3. **Unauthorized redirect**: Given an unauthenticated visitor opening `/app`, when the session is missing, then they are redirected to `/login` without flashing protected content.
4. **Requester list scope**: Given a requester is authenticated, when `/app` loads, then only tickets where requesterId equals the user id are listed.
5. **Agent list scope**: Given an agent is authenticated, when `/app` loads, then tickets from the user’s organization are listed regardless of requester.
6. **Status filter**: Given tickets exist, when a status is selected and the filter form submitted, then only tickets with that status remain and the status select shows the chosen value.
7. **Priority filter**: Given tickets exist, when a priority is selected and the filter form submitted, then only tickets with that priority appear and the select keeps the value.
8. **Search filter**: Given tickets with matching text, when a query is entered and applied, then titles or descriptions containing the text (case-insensitive) are displayed.
9. **Empty list state**: Given no tickets match the filters, when `/app` renders, then an empty-state card appears with copy explaining no tickets and a link to create one.
10. **List card content**: Given tickets exist, when the list renders, then each card shows ticket number, title, status label, priority pill, requester name, optional assignee user/team, and created timestamp.
11. **Card navigation**: Given a ticket card is visible, when it is clicked, then the user is taken to `/app/tickets/[id]` for that ticket.
12. **Quick create validation**: Given the quick form on `/app`, when required fields are blank or too short, then inline error text appears and submission is blocked.
13. **Quick create success**: Given valid quick-form input, when submitted, then the button shows a loading label, a success toast appears, fields reset, and the list refreshes with the new ticket.
14. **Quick create failure**: Given the API returns an error, when submitting the quick form, then an error toast appears and user-entered values remain for retry.
15. **Full create navigation**: Given the user clicks “Nowe zgłoszenie”, when the page loads, then the full form displays identical fields and validation as the quick form.
16. **Description preview toggle**: Given text is entered, when “Podgląd” is toggled, then markdown-rendered content appears; toggling back returns to the editable textarea.
17. **Ticket detail visibility**: Given a requester opens someone else’s ticket via URL, when authorization fails, then a Not Found response is shown instead of ticket data.
18. **Ticket header data**: Given a valid ticket, when viewing `/app/tickets/[id]`, then the header shows number, title, created date, requester, assignee user/team, priority, and status.
19. **Ticket metadata grid**: Given ticket fields exist, when viewing the detail metadata, then category, assignee team, assignee user, and created date are listed in a grid.
20. **Status options by role**: Given a requester viewing their own ticket, when opening the status dropdown, then only Close or Reopen options are available depending on current status.
21. **Agent status control**: Given an agent/admin, when using the status dropdown, then all status values are available and the save button disables while a mutation is pending.
22. **Assignment control visibility**: Given a requester role, when viewing actions panel, then assignment controls are hidden; given agent/admin, they are visible with user/team options.
23. **Assignment save**: Given agent/admin selects assignee user or team, when saving, then a success toast appears and the page refreshes with updated values; invalid selections show an error toast.
24. **Comment visibility**: Given a requester, when viewing comments, then internal comments are excluded; given agent/admin, internal comments are visible with amber styling and “Wewnętrzny” tag.
25. **Public comment post**: Given any authenticated user, when submitting a public comment with body text, then the button disables during submit, a success toast appears, and the new comment shows in the timeline.
26. **Internal comment guard**: Given a requester, when attempting to mark a comment as internal, then the checkbox is absent; given agent/admin, when checked, the comment is saved as internal.
27. **Last activity indicator**: Given comments exist, when the detail page renders, then an “Ostatnia aktywność” timestamp reflects the latest visible comment or ticket update.
28. **Logout flow**: Given a signed-in user, when clicking “Wyloguj” in the top bar, then they are signed out and redirected to `/login`.
29. **Error persistence on detail actions**: Given the status or assignment API returns an error, when save is attempted, then the prior selections remain so the user can adjust without data loss.
30. **Reporting entry (Proposed)**: Given an admin, when selecting “Reports” in the future admin console, then a dashboard page opens with date/team/status filters and export controls visible.
31. **Admin CRUD safety (Proposed)**: Given an admin attempts to delete a team used by tickets, when confirming, then the UI blocks deletion and prompts reassignment before proceeding.
32. **Saved views (Proposed)**: Given an agent saves a filter/search combination, when returning later, then the saved view is selectable and re-applies filters and search text.
33. **Bulk actions (Proposed)**: Given an agent selects multiple tickets in a list, when performing a bulk status change, then all selected tickets update and a summary toast appears; invalid selections are skipped with warnings.
34. **Export feedback (Proposed)**: Given an admin triggers CSV export in reports, when processing, then a progress indicator shows and the user receives a download link or email when complete.
35. **Accessibility focus**: Given keyboard navigation, when tabbing through controls on any form, then focus rings are visible and action buttons are reachable without a mouse.
>>>>>>> theirs
