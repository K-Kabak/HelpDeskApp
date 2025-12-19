# Known issues and risky patterns

- **Ticket search uses missing column (runtime error):** Dashboard query references `description` which is not in Prisma schema, so requests with `q` will throw Prisma errors and break the page.  \
  **Reproduce/verify:** Load `/app?q=test` after login; server logs should show Prisma validation error for unknown field `description`.

- **Comment submission 404:** Comment form POSTs to `/api/tickets/{id}/comments`, but no API route exists, so comment attempts fail and users cannot add updates.  \
  **Reproduce/verify:** Open a ticket detail page and submit a comment; observe 404 response in network tab.

- **Unbounded ticket queries:** Ticket list API returns all records for the requester/org without pagination or limits, risking slow responses and large payloads for sizable datasets.  \
  **Reproduce/verify:** Seed many tickets and hit `/api/tickets`; response size grows without bounds and no `take/skip` are applied.

- **SLA fields not updated post-create:** `firstResponseDue`/`resolveDue` are set on ticket creation, but `firstResponseAt`/`resolvedAt` are never stamped when comments or status changes occur, leaving SLA tracking inaccurate.  \
  **Reproduce/verify:** Create a ticket, change status to W_TOKU/ROZWIAZANE, and inspect DB; `firstResponseAt` remains null and `resolveDue` never adjusts.