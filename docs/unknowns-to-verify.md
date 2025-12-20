# Unknowns To Verify

1. **Cross-organization ticket visibility for agents/admins** — Ticket detail loader fetches by ID without scoping to `organizationId`, so an agent from another org might view tickets if they know the ID, but this is unverified in a multi-org dataset.【F:src/app/app/tickets/[id]/page.tsx†L51-L70】  
   **Verification:** Seed or create tickets in two organizations, log in as an agent from org B, and request `/app/tickets/{id-of-org-A}` to confirm whether access is granted or blocked.

2. **Runtime behavior of comment submission** — The comment form posts to `/api/tickets/{id}/comments`, yet no corresponding API route exists; the exact HTTP response and UX during real usage are unknown.【F:src/app/app/tickets/[id]/comment-form.tsx†L19-L35】【79078b†L1-L4】  
   **Verification:** Run `pnpm dev`, log in, open a ticket detail page, submit a comment, and observe the network response/status and toast behavior.

3. **Migration/state alignment** — Prisma migrations exist under `prisma/migrations`, but their alignment with the current schema and any target database is not validated.【af92dc†L1-L1】  
   **Verification:** Run `pnpm prisma migrate status` against the active DATABASE_URL to check drift; review migration files for parity with `prisma/schema.prisma`.
