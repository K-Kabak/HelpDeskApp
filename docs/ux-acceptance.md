# UX Acceptance Criteria (role-based)

1. Given a user enters valid credentials, when submitting `/login`, then they are redirected to `/app` and see their role in the header.
2. Given an unauthenticated visitor hits `/app`, when middleware runs, then they are redirected to `/login`.
3. Given a requester session, when loading `/app`, then only tickets where requesterId = session user id are returned.
4. Given an agent/admin session, when loading `/app`, then tickets are scoped to the user’s organization and include requester/assignee relations.
5. Given the dashboard list loads, when there are no tickets, then an empty state appears with a CTA linking to `/app/tickets/new`.
6. Given a status filter is selected, when the list reloads, then only tickets matching that status render and the select shows the applied value.
7. Given a priority filter is selected, when the list reloads, then only tickets matching that priority render and the select shows the applied value.
8. Given a search query is provided, when tickets are fetched, then the server filters by title or descriptionMd (not description) case-insensitively without throwing errors.
9. (Proposed) Given more than 20 tickets exist, when loading `/app`, then pagination controls appear and limit results to 20 per page by default.
10. Given a requester clicks “Nowe zgloszenie” on `/app`, when `/app/tickets/new` loads, then the form shows title, description, priority, category, and Markdown preview toggle.
11. Given a requester submits the new ticket form with fields shorter than 3 characters, when submitting, then inline validation errors appear and no request is sent.
12. Given valid ticket data is submitted, when the server responds 201, then the user is redirected to `/app/tickets/[id]` and sees a success toast.
13. Given ticket data fails server validation, when the response returns 400, then the form shows an error banner and preserves user input.
14. Given a requester opens `/app/tickets/[id]` for another requester’s ticket, when the server checks ownership, then a 404/not authorized view is shown.
15. Given an agent opens `/app/tickets/[id]`, when the page renders, then internal comments are visible and labeled, and requester name/assignee/team are shown.
16. Given a requester opens `/app/tickets/[id]`, when comments render, then internal comments are omitted from the timeline.
17. (Proposed) Given an agent submits a public comment, when the `/api/tickets/[id]/comments` call succeeds, then the comment appears in the timeline with their name and timestamp.
18. (Proposed) Given an agent marks a comment as internal, when saved, then only non-requester roles can see it and a “Internal” badge is displayed.
19. (Proposed) Given a comment post fails (network/server), when the client receives the error, then a toast appears and any optimistic comment is rolled back.
20. Given an agent changes ticket status via `ticket-actions` controls, when the PATCH succeeds, then status label updates and the button becomes enabled again.
21. Given a requester attempts to set assignee on their ticket, when submitting, then the server responds 403 and the UI shows an error without applying the change.
22. Given an agent sets an assignee user outside their organization, when submitting, then the server responds 404/403 and no assignment change is shown.
23. Given a ticket moves to RESOLVED or CLOSED, when the PATCH succeeds, then resolvedAt/closedAt timestamps are populated and surfaced on the page.
24. Given a user signs out from the topbar, when the action completes, then the session cookies are cleared and they are redirected to `/login`.
25. (Proposed) Given an agent uploads an attachment within a comment, when file type/size is invalid, then the UI blocks upload with a clear message and no server call is made.
26. (Proposed) Given an agent uploads a valid attachment, when saved, then a download link with filename and size appears in the timeline item.
27. (Proposed) Given SLA due times are set, when the ticket first comment by agent is saved, then firstResponseAt is set and SLA badge updates to “Met” or “Breached”.
28. (Proposed) Given an SLA breach occurs, when loading ticket detail, then the SLA badge shows “Breached” with elapsed time in red text and a tooltip describing the missed target.
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
