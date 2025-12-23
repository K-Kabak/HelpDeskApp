# V1 Closeout Summary

**Date:** December 2024  
**Version:** 1.0

## Shipped Features

### Authentication & Authorization
- Credential-based authentication via NextAuth with Prisma adapter
- JWT sessions with role (REQUESTER, AGENT, ADMIN) and organizationId claims
- Middleware protection for `/app/*` routes
- Role-based authorization with organization scoping

### Ticket Management
- Ticket CRUD (create, read, update, delete)
- Status management with role-based transition rules (NOWE, W_TOKU, OCZEKUJE_NA_UZYTKOWNIKA, WSTRZYMANE, ROZWIAZANE, ZAMKNIETE, PONOWNIE_OTWARTE)
- Priority management (NISKI, SREDNI, WYSOKI, KRYTYCZNY)
- Assignment to users and teams
- Ticket reopening with reasons and throttling (cooldown)
- Requester-scoped ticket lists; agent/admin see organization-wide tickets

### Comments & Collaboration
- Public and internal comments with role-based visibility
- Markdown rendering with sanitization
- First response timestamp tracking
- Comment spam guard (cooldown throttling)
- Comment validation and rate limiting

### Attachments
- File upload with size and MIME type validation
- Public/internal attachment visibility
- Presigned upload URLs
- Attachment download with signed URLs
- Antivirus scan hooks
- Attachment audit logging

### SLA Management
- SLA policies per organization/priority/category
- SLA due date calculation (first response and resolution)
- SLA pause/resume on status changes (waiting on requester)
- SLA breach detection via background workers
- SLA reminder notifications
- SLA escalation paths
- SLA preview and validation
- Dashboard SLA widgets (breach state indicators)

### Background Workers & Jobs
- BullMQ worker service for async job processing
- SLA job scheduling and processing
- Job retry/backoff strategy with dead letter queue (DLQ)
- Worker health checks
- Worker deployment runbooks

### Notifications
- Notification channels (email adapter stub, in-app feed)
- Notification preferences enforcement
- CSAT (Customer Satisfaction) request triggers on resolution/closure

### Admin Features
- Admin audit log API (pagination, filtering by resource/actor)
- SLA policy management API
- Categories API
- Tags API

### Automation
- Automation rule engine (trigger/action configuration)

### Search & Filtering
- Ticket list filtering by status, priority
- Text search (note: known issue with field mismatch)
- Assignment suggestions based on team membership

### Security & Operations
- Rate limiting (per-route configuration)
- Request logging
- Audit trail for ticket/attachment operations
- Admin audit logging
- Error schema standardization

## Running CI Locally

### Prerequisites
- Node.js 20+ (or 22+ as recommended)
- pnpm 9+
- PostgreSQL (local or Docker)
- Optional: Redis for workers, MinIO for storage

### Local CI Commands

**Linting:**
```bash
pnpm lint
```

**Type Checking:**
```bash
pnpm exec tsc -p tsconfig.ci.json --noEmit
```

**OpenAPI Validation:**
```bash
pnpm openapi:lint
```

**Unit/Integration Tests:**
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:contract     # Contract tests only
```

**E2E Tests:**
```bash
pnpm test:e2e          # Playwright tests
```

**Environment Validation:**
```bash
pnpm check:env         # Validate Node/pnpm/DATABASE_URL
pnpm check:envexample  # Ensure .env.example has required keys
```

**Full CI-like Check:**
```bash
pnpm lint && \
pnpm exec tsc -p tsconfig.ci.json --noEmit && \
pnpm openapi:lint && \
pnpm test && \
pnpm test:contract
```

**Worker Checks:**
```bash
pnpm worker:smoke      # Dry-run worker config validation
pnpm worker:health     # Worker health check (requires Redis)
```

## Key Architecture Notes

### Stack
- **Framework:** Next.js 16 (App Router) with React 19, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth (credentials provider, JWT sessions, Prisma adapter)
- **UI:** Tailwind CSS, React Query, Sonner (toasts)
- **Validation:** Zod schemas
- **Background Jobs:** BullMQ with Redis
- **Storage:** Storage abstraction (local/S3 via MinIO)

### Architecture Patterns
- **Server-side data access:** Prisma client singleton with environment-based logging
- **Authorization:** Role-based with organization scoping enforced server-side
- **API routes:** Next.js API routes under `src/app/api` with REST-like conventions
- **Middleware:** NextAuth middleware protects `/app/*` routes
- **Background processing:** BullMQ workers for SLA monitoring and notifications
- **Audit trail:** Immutable audit events for tickets, attachments, and admin actions

### Key Directories
- `src/app`: Next.js App Router pages, layouts, API routes
- `src/app/api`: REST API handlers
- `src/app/app`: Authenticated UI (dashboard, ticket views, forms)
- `src/components`: Shared UI components
- `src/lib`: Business logic, utilities (auth, authorization, SLA, storage, notifications)
- `src/worker`: BullMQ worker configuration and job processors
- `prisma`: Schema, migrations, seed data
- `tests`: Vitest unit/integration tests and Playwright E2E tests

### Data Model Highlights
- Multi-tenant organization scoping
- Role-based access control (REQUESTER, AGENT, ADMIN)
- Ticket lifecycle with status transitions
- SLA policies with priority/category matching
- Audit events (ticket operations, admin actions, attachments)
- Comments with public/internal visibility
- Attachments with visibility metadata
- Tags, categories, teams for organization
- Notification preferences
- Automation rules
- CSAT tracking

## Known Limitations

### Critical Issues
1. **Dashboard search bug:** Queries `description` field that doesn't exist in schema (should use `descriptionMd`). Triggers Prisma runtime error on search usage.
2. **Comment API organization boundary:** Comment endpoint lacks organization verification on ticket lookup, allowing potential cross-org comments if ticket ID is known.
3. **Unbounded queries:** Ticket lists return all tickets without pagination, causing performance issues with large datasets.

### Missing Features
- **Pagination:** No pagination support in ticket/comment/audit list endpoints
- **Audit visibility:** Audit events written but not exposed in UI (admin API exists but no UI)
- **Attachment UI:** Upload/download APIs exist but UI components not fully implemented
- **Admin panel UI:** Admin APIs exist but no admin console UI for managing users/teams/SLA policies
- **Reporting:** No reporting/metrics endpoints or dashboard
- **Search field bug:** See critical issues above

### Partial Implementations
- **Notifications:** Email adapter stub exists; full email delivery not implemented
- **Markdown sanitization:** Uses ReactMarkdown with rehype-sanitize; server-side validation minimal
- **Rate limiting:** Implemented but configuration may need tuning per route
- **Worker deployment:** Runbooks exist but production deployment guidance incomplete

### Technical Debt
- **Test coverage:** Unit/integration tests exist but coverage gaps remain in critical paths
- **Error handling:** Standardized error schema exists but not consistently applied across all endpoints
- **Type safety:** TypeScript strict mode may have gaps in some areas
- **Documentation:** API documentation exists but may need updates for newer endpoints

