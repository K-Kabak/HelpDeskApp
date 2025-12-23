# SerwisDesk (MVP)

Web helpdesk/ticketing app (Next.js + Prisma + NextAuth + Tailwind).

## Quick start (local)

### Option 1: Docker Compose (recommended)
1) Prereqs: Node 22+, pnpm, Docker Desktop.
2) Start services:
   ```powershell
   docker compose up -d
   ```
   Services: Postgres (5432), Redis (6379), MinIO (9000/9001).
3) Create env file:
   ```powershell
   Copy-Item .env.example .env.local -Force
   # Set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/helpdesk
   # Set NEXTAUTH_SECRET, NEXTAUTH_URL as needed
   ```
4) Install deps:
   ```powershell
   pnpm install
   ```
5) Prepare database:
   ```powershell
   pnpm prisma:migrate
   pnpm prisma:seed
   ```
6) Run dev server:
   ```powershell
   pnpm dev
   ```
   App: http://localhost:3000  
   Demo login: `admin@serwisdesk.local` / `Admin123!` (rotate after first run).

### Option 2: Local Postgres
1) Prereqs: Node 22+, pnpm, Postgres (local or Docker). Optional: Docker Desktop for `docker compose up -d db`.
2) Validate basics:
   ```powershell
   node scripts/validate-env.mjs
   ```
3) Create env file:
   ```powershell
   Copy-Item .env.example .env.local -Force
   # fill DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL as needed
   ```
4) Install deps (PowerShell):
   ```powershell
   pnpm install
   ```
5) Prepare database (requires DATABASE_URL):
   ```powershell
   pnpm prisma:migrate
   pnpm prisma:seed
   ```
6) Run dev server:
   ```powershell
   pnpm dev
   ```
   App: http://localhost:3000  
   Demo login: `admin@serwisdesk.local` / `Admin123!` (rotate after first run).

## Scripts
- `pnpm check:env` - basic env validation (Node/pnpm/DATABASE_URL)
- `pnpm check:envexample` - ensure `.env.example` has required keys
- `pnpm dev` - dev server
- `pnpm build` / `pnpm start` - production
- `pnpm prisma:migrate`, `pnpm prisma:seed`
- `pnpm test` - Vitest (placeholder)
- `pnpm test:e2e` - Playwright (placeholder)

## SLA indicators
- Dashboard ticket list shows SLA status badges: red when `firstResponseDue`/`resolveDue` are past due and not resolved, green countdown when upcoming.

## Models (Prisma)
- Organization, User (role: REQUESTER/AGENT/ADMIN), Team, TeamMembership
- Ticket (statuses: NOWE, W_TOKU, OCZEKUJE_NA_UZYTKOWNIKA, WSTRZYMANE, ROZWIAZANE, ZAMKNIETE, PONOWNIE_OTWARTE; priorities: NISKI, SREDNI, WYSOKI, KRYTYCZNY)
- Comment (public/internal), Attachment, Tag, TicketTag, AuditEvent, SlaPolicy

## MVP status
- Auth (NextAuth credentials, Prisma adapter)
- Ticket list (requester scoped to own tickets)
- Ticket create + SLA due (first/resolve) via SlaPolicy
- Ticket detail, public/internal comments (internal for agent/admin)
- Seed: Demo org, admin/requester/agent, IT Support team, sample ticket

## To do (next iterations)
- Admin panel (users/teams/dictionaries/SLA)
- Attachments (upload + metadata)
- Reports, Kanban, KPI dashboard
- E2E/Unit tests, Dockerfile + docker-compose

## Operations runbooks
- `docs/worker-deployment-runbook.md`: Restart, drain, rollback guidance for BullMQ workers along with failure mode troubleshooting.
