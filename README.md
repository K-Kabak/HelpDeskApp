# SerwisDesk (MVP)

Web helpdesk/ticketing app. (Next.js + Prisma + NextAuth + Tailwind).

## 📖 Instrukcja Uruchomienia

**Pełna instrukcja uruchomienia i wyłączenia aplikacji:** [`docs/setup-instructions.md`](docs/setup-instructions.md)

Zawiera gotowe komendy PowerShell, rozwiązania problemów i szczegółowe kroki konfiguracji.

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

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:seed` - Seed database with demo data
- `pnpm prisma:generate` - Generate Prisma client

### Testing
- `pnpm test` - Run unit/integration tests (Vitest)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:e2e` - Run end-to-end tests (Playwright)
- `pnpm test:contract` - Run contract tests

### Validation
- `pnpm check:env` - Validate environment setup (Node/pnpm/DATABASE_URL)
- `pnpm check:envexample` - Ensure `.env.example` has required keys
- `pnpm openapi:lint` - Validate OpenAPI specification

### Workers
- `pnpm worker:start` - Start BullMQ worker service
- `pnpm worker:smoke` - Test worker configuration (dry-run)
- `pnpm worker:health` - Check worker health status

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
- **Bulk Actions:** Multi-select tickets and perform bulk status changes and assignments (agents/admins)
- **Saved Views:** Save and manage custom filter combinations as named views for quick access
- **Filtering & Search:** Advanced filtering by status, priority, category, tags, assignees, and date ranges with full-text search

### Admin Panel
- **User Management:** Create, update, delete users with role assignment
- **Team Management:** Organize agents into teams with membership management
- **SLA Policies:** Configure SLA rules by priority and category
- **Automation Rules:** Trigger-based automation for ticket workflows
- **Audit Log:** View all system changes and events with detailed audit trail viewer
- **Categories & Tags:** Manage ticket categories and tags for organization

### Reporting & Analytics
- **Dashboard Widgets:** SLA status, ticket statistics, KPI cards with tooltips
- **Dashboard Features:** Refresh button for data updates, responsive layout
- **KPI Metrics:** MTTR (Mean Time to Resolve), MTTA (Mean Time to Acknowledge), reopen rate, SLA compliance
- **CSV Exports:** Export tickets and comments with filtering
- **Analytics:** Ticket trends, creation/resolution rates, priority distribution
- **Reports Page:** Comprehensive reporting interface with analytics and export capabilities

### Notifications
- **In-App Notifications:** Notification center with read/unread status and type filters (Ticket Updates, Comments, Assignments, SLA Breaches)
- **Email Notifications:** SMTP-based email delivery via nodemailer (optional, requires EMAIL_ENABLED=true)
- **Notification Preferences:** User-configurable notification channels

### CSAT (Customer Satisfaction)
- **CSAT Surveys:** Automated satisfaction surveys on ticket resolution
- **CSAT UI:** Requester-facing survey interface with rating and feedback collection
- **CSAT Analytics:** Track satisfaction scores and trends in reports

## Documentation

- **[User Guide](docs/user-guide.md)** - Complete guide for end users covering login, ticket management, comments, bulk actions, saved views, notifications, and CSAT surveys
- **[Developer Guide](docs/developer-guide.md)** - Technical documentation for developers including architecture, API patterns, component structure, and best practices
- **[Setup Instructions](docs/setup-instructions.md)** - Detailed setup and configuration guide
- **[Deployment Guide](docs/deployment.md)** - Production deployment instructions
- **[API Documentation](docs/openapi.yaml)** - OpenAPI specification for all API endpoints
- **[Security Audit](docs/security-audit-report.md)** - Security review and recommendations
- **[Environment Variables](docs/environment-variables.md)** - Complete list of configuration options

## Demo Credentials

After running `pnpm prisma:seed`, the following demo accounts are available:

- **Admin:** `admin@serwisdesk.local` / `Admin123!`
- **Agent:** `agent@serwisdesk.local` / `Agent123!`
- **Requester:** `requester@serwisdesk.local` / `Requester123!`

⚠️ **Security Note:** These are demo credentials for development/testing only. **Change all passwords immediately** in production environments.

## Production Deployment

For production deployment, see the comprehensive [Deployment Guide](docs/deployment.md) which covers:

- Prerequisites and environment setup
- Required and optional environment variables
- Database migration and seeding
- Worker service configuration (BullMQ/Redis)
- Email service configuration
- Object storage setup (MinIO/S3)
- SSL/HTTPS configuration
- Monitoring and logging
- Backup and restore procedures
- Worker deployment runbook

Key production requirements:
- Node.js 22+ and pnpm
- PostgreSQL 16+ database
- Redis 7+ for background job processing
- SMTP server for email notifications (optional)
- Object storage (S3-compatible) for attachments
- SSL certificate for HTTPS

## To do (next iterations)
- Advanced attachment management (upload + metadata)
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
