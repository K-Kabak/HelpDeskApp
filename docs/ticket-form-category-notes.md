# Ticket form category selection (Issue #55)

## Manual checklist
- Load `/app/tickets/new`; verify category dropdown shows seeded taxonomy (Hardware/Network/Software).
- Switch to manual entry via link and submit a ticket with a custom category; confirm request succeeds.
- Simulate category API failure (network/offline) and confirm the form falls back to manual input with an inline message.
- Observe loading state text while categories are fetched.
- Ensure requester vs agent behaves the same (category select is not role-gated).

## Integration notes
- Categories load from `GET /api/categories` (org-scoped). If none or error, form falls back to free-text input.
- Payload still submits `category` string; selection populates the same field.
