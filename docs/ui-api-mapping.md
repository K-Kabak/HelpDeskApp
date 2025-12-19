# UI ↔ API Contract Mapping

Sources: current UI flows in `docs/ui-ux-spec.md` and acceptance rules in `docs/ux-acceptance.md`, mapped to implemented API routes in `src/app/api` (tickets, comments, auth). Each entry lists screen/flow, API usage, sample payloads, surfaced errors, permissions, and state handling. “Proposed” entries flag gaps where endpoints are not yet present.

## Authentication
1. **Login submit (`/login`)**
   - Endpoint: `POST /api/auth/[...nextauth]` via `signIn("credentials")`.
   - Request: `{ email, password, callbackUrl }`.
   - Response: redirects on success; `{ error: "Błędny email lub hasło" }` shown inline on failure.
   - Errors: wrong creds → inline message, button re-enables.
   - Permission: available to all; session created with role + organization.
   - State: button shows `Logowanie...` while request pending; page idle otherwise.

2. **Session gate for app routes (`/app`, `/app/tickets/*`)**
   - Endpoint: server `getServerSession(authOptions)`; if missing, redirect to `/login`.
   - Errors: none rendered; unauth → redirect.
   - Permission: requires authenticated user.
   - State: page does not render protected content when unauthenticated.

3. **Logout**
   - Endpoint: NextAuth `POST /api/auth/signout` (handled by `next-auth` when signOut is triggered).
   - Request: `{ callbackUrl }`.
   - Response: redirect to `/login`.
   - Errors: fallback toast/inline message if sign-out fails (UI to implement).
   - Permission: any signed-in user.
   - State: button/link triggers loading indicator until navigation completes.

## Ticket List (`/app`)
4. **Initial list load (requester)**
   - Endpoint: `GET /api/tickets` (server call uses Prisma with same rules).
   - Request: none; server restricts `where` to `requesterId = session.user.id`.
   - Response: `{ tickets: Ticket[] }` sorted `createdAt desc` with requester/assignee relations.
   - Errors: 401 → redirect to login; unexpected error → toast + empty view.
   - State: skeleton/loader during fetch; empty-state card when `tickets.length === 0`.

5. **Initial list load (agent/admin)**
   - Endpoint: `GET /api/tickets`.
   - Request: none; server `where` uses `organizationId = session.user.organizationId`.
   - Response/Errors/State: same as entry 4.

6. **Status filter**
   - Endpoint: `GET /api/tickets?status=NOWE|…` (UI submits query params; server filters).
   - Request: query param `status` validated against enum.
   - Response: filtered tickets; empty-state when none.
   - Errors: invalid status → ignored (server guard); 401 redirects.
   - State: filter select stays highlighted; list shows loader on navigation.

7. **Priority filter**
   - Endpoint: `GET /api/tickets?priority=NISKI|SREDNI|WYSOKI|KRYTYCZNY`.
   - Request/Response/State: as above, with priority dropdown highlight.
   - Errors: invalid priority ignored; other errors show toast + keep filters.

8. **Full-text search**
   - Endpoint: `GET /api/tickets?q=term` (server `OR` filter on title/description, case-insensitive).
   - Request: query string `q` trimmed.
   - Response: tickets matching; empty card otherwise.
   - Errors/State: same as entry 7.

9. **List card navigation**
   - Endpoint: none (client navigation to `/app/tickets/{id}`), but relies on list data from entry 4/5.
   - Errors: if ticket later forbidden, detail returns Not Found.
   - State: link hover/active; no loader needed beyond route transition.

10. **Empty list CTA**
   - Endpoint: none; CTA links to creation page.
   - State: rendered when `tickets.length === 0`.

11. **Proposed pagination**
   - Endpoint: `GET /api/tickets?cursor=<id>&limit=<n>` (not yet implemented).
   - Request: cursor pagination params.
   - Response: `{ tickets, nextCursor? }`.
   - Errors: validation → toast; 401 redirect.
   - State: disable next/prev while loading; show “No more results” when exhausted.

12. **Proposed saved views**
   - Endpoint: e.g., `POST /api/views` / `GET /api/views` (not implemented).
   - Request: `{ name, filters }`.
   - Response: `{ viewId, filters }`; list of saved views.
   - Errors: 400 invalid filters; 403 if role blocked.
   - State: loading indicator on save/apply; empty saved-views list shows helper copy.

## Ticket Creation (inline + full form)
13. **Inline ticket create success**
   - Endpoint: `POST /api/tickets`.
   - Request: `{ title, descriptionMd, priority, category }` (validated: min lengths, priority enum).
   - Response: `{ ticket }` with SLA due dates computed; toast “Zgłoszenie utworzone”.
   - Errors: 401 unauthorized; 400 zod errors returned as `{ error: flatten }` → toast keeps inputs.
   - State: submit button shows spinner text `Zapisywanie...`; fields disabled while pending.

14. **Inline ticket create validation failure**
   - Endpoint: `POST /api/tickets`.
   - Request: invalid/missing fields.
   - Response: `{ error: { fieldErrors } }` with HTTP 400.
   - Errors: inline field errors + toast; inputs preserved.
   - State: loading cleared after error.

15. **Inline ticket create unauthorized**
   - Endpoint: `POST /api/tickets`.
   - Response: `{ error: "Unauthorized" }` with 401.
   - Errors: toast explains auth issue; consider redirect to login.
   - State: form disabled during request; re-enabled on error.

16. **Full ticket create page (`/app/tickets/new`)**
   - Endpoint: same as entry 13 (uses shared component).
   - Request/Response/Errors/State: identical; navigation back link unaffected.

## Ticket Detail (`/app/tickets/{id}`)
17. **Detail load (owner requester)**
   - Endpoint: server Prisma query; authorization mimics GET `/api/tickets/{id}` (not exposed).
   - Request: route param `{id}`.
   - Response: ticket with requester, assignees, comments; filters out internal comments for requester.
   - Errors: missing or unauthorized → `notFound()` (404 page).
   - State: page renders once server data ready; last-activity label derived from comments/updatedAt.

18. **Detail load (agent/admin)**
   - Endpoint: same data load; includes internal comments and agent/team lists via Prisma.
   - Errors/State: as entry 17; additional selects populated.

19. **Status update (agent/admin)**
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: `{ status: <TicketStatus> }` (must differ from current).
   - Response: `{ ticket }` updated; audit event recorded.
   - Errors: 401 unauth; 404 cross-org; 400 `{ error: "No changes" }`; 403 if requester tries non-allowed.
   - Permission: role `AGENT|ADMIN` can set any status.
   - State: button shows `Zapisywanie...` while pending; toast success/error; select disabled when pending.

20. **Status update (requester close/reopen)**
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: `{ status: ZAMKNIETE | PONOWNIE_OTWARTE }` when allowed by current state.
   - Response/Errors: as entry 19; additional guard sends 400 `{ error: "Status update required" }` if missing; 403 for disallowed status.
   - Permission: only ticket owner requester; enforced before update.
   - State: helper text clarifies limits; button disabled when unchanged.

21. **Priority change (agent/admin)**
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: `{ priority: <TicketPriority> }`.
   - Response: `{ ticket }` with new priority.
   - Errors: 403 if not agent/admin; 400 `{ error: "No changes" }` when unchanged.
   - State: reuses mutation loading flag and toast feedback.

22. **Assign agent/team**
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: `{ assigneeUserId: uuid|null, assigneeTeamId: uuid|null }` (null clears).
   - Response: `{ ticket }`.
   - Errors: 403 non-agent; 400 `{ error: "Invalid assignee" }` or `{ error: "Invalid team" }` when id not in org.
   - State: save button disabled until change; loading text during mutation.

23. **Validation guard (no updates)**
   - Endpoint: `PATCH /api/tickets/{id}`.
   - Request: empty body.
   - Response: 400 `{ error: "No updates provided" }` (zod refine) or `{ error: "No changes" }`.
   - Errors: toast surfaces message; form stays filled.

## Comments
24. **Public comment (any role)**
   - Endpoint: `POST /api/tickets/{id}/comments`.
   - Request: `{ bodyMd: string, isInternal: false }`.
   - Response: `{ comment }`; sets `firstResponseAt` if first public agent comment.
   - Errors: 401 unauth; 403 if user not requester/agent; 400 validation.
   - State: submit button `Zapisywanie...`; toast success/error; textarea cleared on success.

25. **Internal comment (agent/admin)**
   - Endpoint: `POST /api/tickets/{id}/comments`.
   - Request: `{ bodyMd, isInternal: true }`.
   - Response: `{ comment }` flagged internal.
   - Errors: 403 when requester attempts internal; 400 validation.
   - State: checkbox only rendered when `allowInternal`; loading disables form.

26. **Comment validation failure**
   - Endpoint: same as above.
   - Request: `{ bodyMd: "" }` or missing.
   - Response: 400 `{ error: { fieldErrors } }`.
   - Errors: toast “Nie udało się dodać komentarza”; input preserved.
   - State: loading cleared after error.

27. **Unauthorized comment on foreign ticket**
   - Endpoint: `POST /api/tickets/{id}/comments`.
   - Condition: requester attempts ticket outside org/ownership.
   - Response: 404 `{ error: "Not found" }` (ticket not in org) or 403 for forbidden internal.
   - Errors: toast shows message; UI should redirect to list if 404.
   - State: form re-enabled after failure.

## List & Detail Ancillaries
28. **Last activity indicator**
   - Endpoint: none (computed on detail from comments/updatedAt).
   - State: updates after comment/status/assignment mutations via `router.refresh()`; shows “Brak komentarzy” when list empty.

29. **Assignee/Team pickers**
   - Endpoint: server-side Prisma `user.findMany` / `team.findMany` matching org; equivalent REST would be `GET /api/agents`, `GET /api/teams` (not implemented).
   - Errors: fetch failure → toast + disable selects.
   - State: selects disabled during mutation; default option “Brak”.

30. **Not Found handling**
   - Endpoint: detail load returning 404 (missing/forbidden ticket).
   - Response: `notFound()` triggers 404 page.
   - State: page shows 404; navigation back offered.

## Proposed Admin & Reporting (Endpoints TBD)
31. **Admin users CRUD (Proposed)**
   - Endpoint: `GET/POST/PATCH /api/admin/users` (not implemented).
   - Request: list filters; create `{ name, email, role, teamIds }`; update partial.
   - Response: `{ users }` / `{ user }`.
   - Errors: 403 non-admin; 400 validation; 409 on duplicates.
   - State: loading table placeholders; modal/save button spinners; empty list helper text.

32. **Admin teams CRUD (Proposed)**
   - Endpoint: `GET/POST/PATCH/DELETE /api/admin/teams`.
   - Errors: block delete when team in use → 400 `{ error: "Team in use" }`.
   - State: confirmation modal; disabled delete on linked tickets.

33. **Admin SLA policies (Proposed)**
   - Endpoint: `GET/POST/PATCH /api/admin/sla-policies`.
   - Request: `{ priority, firstResponseHours, resolveHours }`.
   - Errors: 409 duplicate priority; 403 non-admin.
   - State: inline form loading; empty state explains SLA impact.

34. **Categories/Tags management (Proposed)**
   - Endpoint: `GET/POST/PATCH/DELETE /api/admin/tags`.
   - Errors: block delete when linked to ticket → 400 `{ error: "Tag in use" }`.
   - State: list with counts; delete disabled when count >0.

35. **Audit log (Proposed)**
   - Endpoint: `GET /api/admin/audit-events`.
   - Response: `{ events: [{ action, actor, data, createdAt }] }`.
   - Errors: 403 non-admin.
   - State: infinite scroll/pagination; empty state “Brak zdarzeń”.

36. **Reporting dashboard (Proposed)**
   - Endpoint: `GET /api/admin/reports/summary?dateRange=...&team=...` (not implemented).
   - Response: `{ kpis, charts }` derived from tickets/Audit.
   - Errors: 403 non-admin; 400 invalid params.
   - State: skeleton cards while loading; “Brak danych” placeholders per widget.

37. **Reporting drill-down (Proposed)**
   - Endpoint: `GET /api/admin/reports/tickets?filters...`.
   - Response: `{ tickets, total }` using same auth rules as admin list.
   - Errors/State: as entry 36; table empty state mirrors list empty CTA.

38. **CSV export (Proposed)**
   - Endpoint: `POST /api/admin/reports/export` → queued job.
   - Request: `{ filters, format: "csv" }`.
   - Response: `{ exportId, status: "queued" }`; follow-up `GET /api/admin/reports/export/{id}` for download link.
   - Errors: 413 if too large; 403 non-admin.
   - State: progress indicator until ready; retry on failure.

