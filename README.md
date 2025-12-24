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
   # Optional: Set EMAIL_ENABLED=true and SMTP_* variables for email notifications
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
   # Optional: Set EMAIL_ENABLED=true and SMTP_* variables for email notifications
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

## Features

### Core Functionality
- **Authentication:** NextAuth credentials with Prisma adapter, JWT sessions
- **Tickets:** Create, view, update with role-based permissions
- **Comments:** Public/internal comments with markdown support
- **SLA Tracking:** Automatic due date calculation and breach detection
- **Audit Logging:** Complete audit trail for all ticket changes

### Admin Panel
- **User Management:** Create, update, delete users with role assignment
- **Team Management:** Organize agents into teams
- **SLA Policies:** Configure SLA rules by priority and category
- **Automation Rules:** Trigger-based automation for ticket workflows
- **Audit Log:** View all system changes and events

### Reporting & Analytics
- **Dashboard Widgets:** SLA status, ticket statistics, KPI cards
- **KPI Metrics:** MTTR (Mean Time to Resolve), MTTA (Mean Time to Acknowledge), reopen rate
- **CSV Exports:** Export tickets and comments with filtering
- **Analytics:** Ticket trends, creation/resolution rates, priority distribution

### Notifications
- **In-App Notifications:** Notification center with read/unread status
- **Email Notifications:** SMTP-based email delivery (optional, requires EMAIL_ENABLED=true)
- **Notification Preferences:** User-configurable notification channels

### CSAT (Customer Satisfaction)
- **CSAT Surveys:** Automated satisfaction surveys on ticket resolution
- **CSAT UI:** Requester-facing survey interface
- **CSAT Analytics:** Track satisfaction scores and trends

## To do (next iterations)
- Attachments (upload + metadata)
- Advanced search and pagination
- Knowledge base integration
- Localization (i18n)

## Email Configuration
- Email notifications are optional and controlled by `EMAIL_ENABLED` environment variable.
- When `EMAIL_ENABLED=true`, configure SMTP settings:
  - `SMTP_HOST` - SMTP server hostname
  - `SMTP_PORT` - SMTP port (587 for STARTTLS, 465 for SSL)
  - `SMTP_USER` - SMTP username
  - `SMTP_PASSWORD` - SMTP password
  - `SMTP_FROM` - From email address (defaults to `noreply@helpdesk.local`)
- If `EMAIL_ENABLED` is not set or `false`, the application uses a stub adapter that queues emails without sending.

## Operations runbooks
- `docs/worker-deployment-runbook.md`: Restart, drain, rollback guidance for BullMQ workers along with failure mode troubleshooting.
