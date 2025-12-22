# Comment Visibility Audit

## Findings
- UI (ticket detail) hides internal comments from requesters by filtering `ticket.comments` before render and only passes `allowInternal` when role is not REQUESTER (`src/app/app/tickets/[id]/page.tsx`).
- Comment form does not render the "internal" checkbox for requesters (`src/app/app/tickets/[id]/comment-form.tsx` via `allowInternal` prop).
- API creation endpoint previously lacked organization scoping. Added 404 guard when the ticket org does not match the session (`src/app/api/tickets/[id]/comments/route.ts`).
- No comment listing API exists; ticket detail uses server-side Prisma query and UI-side filtering to exclude internal comments for requesters.

## Recommended Next Steps
1. Add `GET /api/tickets/{id}/comments` with org/role scoping (public-only for requesters) to align with target OpenAPI.
2. Extend visibility tests (requester vs agent/admin) covering create + detail render to prevent regressions.
3. Consider surfacing a user-facing message when an internal comment is hidden (e.g., count with tooltip) if product requires transparency.
