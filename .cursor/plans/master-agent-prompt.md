# Master Agent Prompt - HelpDeskApp Development

**Purpose:** This prompt provides essential context for any AI coding assistant (Agent 1-6) working on the HelpDeskApp repository. Paste this as a startup prompt before each task to ensure consistent context and workflow understanding.

You are an AI coding assistant working on the **HelpDeskApp** repository. This prompt contains all critical information about the project, workflow, code editing rules, status, priorities, and quick references.

---

## PROJECT CONTEXT

### Application Overview
**HelpDeskApp** is a full-featured Help Desk / Service Desk platform built with:
- **Framework:** Next.js 16 (App Router) with React 19, TypeScript, Tailwind CSS
- **Authentication:** NextAuth with JWT sessions, Prisma adapter, credential-based login
- **Database:** PostgreSQL with Prisma ORM
- **Background Jobs:** BullMQ with Redis for SLA processing
- **Storage:** MinIO for file attachments
- **Testing:** Vitest (unit/integration), Playwright (E2E)
- **CI/CD:** GitHub Actions workflows

### Repository Structure
```
src/
├── app/
│   ├── api/              # API routes (REST endpoints)
│   │   ├── admin/        # Admin endpoints (users, teams, audit, SLA policies)
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── tickets/      # Ticket CRUD, comments, attachments
│   │   ├── notifications/ # In-app notifications
│   │   └── ...
│   ├── app/              # Authenticated UI pages
│   │   ├── admin/        # Admin UI (users, teams, audit, automation, SLA)
│   │   ├── tickets/      # Ticket list, detail, create
│   │   ├── notifications/ # Notification center
│   │   └── ...
│   └── ...
├── lib/                  # Shared utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── authorization.ts  # RBAC helpers (requireAuth, ticketScope, etc.)
│   ├── prisma.ts         # Prisma client singleton
│   ├── sla-worker.ts     # SLA breach handler
│   ├── sla-reminder.ts   # SLA reminder handler
│   └── ...
├── components/           # Shared React components
└── worker/               # BullMQ worker (background jobs)
prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
tests/                    # Unit/integration tests
e2e/                      # Playwright E2E tests
docs/                     # Documentation
```

### Key Technologies & Patterns
- **Role-Based Access Control (RBAC):** `REQUESTER`, `AGENT`, `ADMIN` roles
- **Organization Scoping:** All data is scoped by `organizationId`
- **Audit Logging:** All changes logged to `AuditEvent` and `AdminAudit` tables
- **SLA Tracking:** Response/resolution due dates with breach detection
- **Cursor-based Pagination:** For large lists (tickets, audit events)
- **Markdown Sanitization:** XSS protection for user-generated content
- **Rate Limiting:** API protection against abuse

---

## WORKFLOW PRINCIPLES

### ⚠️ SIMPLIFIED WORKFLOW - Focus on Development Velocity

**Core Philosophy:** Code first, optimize process later. Batch related changes. Tests at the end.

### 1. Work on Multiple Related Tasks Together
- **Don't stop after each small task**
- Group related changes (e.g., all ticket detail improvements together)
- Complete features before committing
- Continue working without stopping unless explicitly asked

### 2. Code First, Tests Later
- **Focus on implementation first**
- Write tests at the end of features
- Don't block development on test writing
- Basic tests for critical paths, full suite later

### 3. Batch Commits
- **Commit after larger features**, not after every small task
- Group related changes together
- Logical commit messages (e.g., `feat: complete ticket detail enhancements`)
- Don't create PRs for every single task - only for larger features

### 4. Basic Checks Before Commit
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Fix critical errors only
- Full test suite can run later in CI

### 5. Continue Working
- **Don't stop after each task**
- Work on related features together
- Stop only when explicitly asked by user

---

## CODE EDITING RULES

### When Making Changes
1. **ALWAYS read files before editing** - Use `read_file` to understand context
2. **Preserve exact indentation** - Match tabs/spaces as they appear
3. **Prefer editing existing files** - Only create new files when explicitly required
4. **Add necessary imports** - Include all required dependencies
5. **Follow existing patterns** - Match code style and architecture

### File Organization
- **API Routes:** `src/app/api/[resource]/route.ts` or `src/app/api/[resource]/[id]/route.ts`
- **UI Pages:** `src/app/app/[page]/page.tsx`
- **Components:** `src/components/` (shared) or co-located with pages
- **Utilities:** `src/lib/[utility].ts`
- **Tests:** `tests/[feature].test.ts` (unit/integration) or `e2e/[feature].spec.ts` (E2E)

### TypeScript & Type Safety
- **No `any` types** - Use proper types (`AuthenticatedUser`, `Prisma.UserUpdateInput`, etc.)
- **Strict type checking** - Ensure all types are correct
- **NextAuth Session:** Use `SessionWithUser` type for session with user data

### Security & Authorization
- **Always enforce organization scoping** - Use `ticketScope` helper
- **Role-based checks** - Use `requireAuth` with role requirements
- **Validate input** - Use Zod schemas for API validation
- **Sanitize user content** - Markdown sanitization for XSS protection

---

## KEY FILES & DOCUMENTATION

### Planning & Status
- **`.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`** - Master execution plan
- **`BLUEPRINT.md`** - High-level architecture and features
- **`docs/github-backlog.md`** - Feature backlog (1421 lines, search for P1 items)
- **`docs/current-state.md`** - Current implementation status
- **`docs/contradictions.md`** - Documentation vs code discrepancies

### API & Contracts
- **`docs/openapi.yaml`** - OpenAPI specification (must keep updated)
- **`tests/contract/api-contract.test.ts`** - Contract tests for API consistency

### Database
- **`prisma/schema.prisma`** - Database schema (models, enums, indexes)
- **`prisma/migrations/`** - Migration files (never edit manually)

### Configuration
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`vitest.config.ts`** - Test configuration
- **`playwright.config.ts`** - E2E test configuration
- **`.github/workflows/ci.yml`** - CI/CD pipeline

### Standards & Conventions
- **`docs/coding-standards.md`** - Coding standards (lint/format/commit conventions)
- **`docs/contract-conventions.md`** - API contract conventions
- **`docs/glossary.md`** - Shared terminology

---

## CURRENT STATUS

### ✅ Completed Tasks (Phase 1)
- Task 1: Worker job routing (SLA breach/reminder handlers)
- Task 2: CI/CD pipeline (GitHub Actions)
- Task 3: Worker health checks
- Task 4: Admin Users/Teams Management UI
- Task 5: In-App Notification Center UI
- Task 7: Documentation updates
- Task 8: Integration tests
- Task 9: Performance optimization (indexes, budget)
- Task 10: Production deployment documentation
- PR #204: CI fixes (TypeScript, ESLint errors)

### 🔄 Remaining Tasks
- ✅ **Task 6:** Ticket detail enhancements - COMPLETED (all features implemented)
- ✅ **Real Email Notification Delivery:** EmailAdapterReal uses nodemailer - COMPLETED
- ✅ **Mobile Responsiveness (Prompt 8):** Mobile improvements - COMPLETED
- ✅ **Error Messages & UX Polish (Prompt 9):** UX improvements - COMPLETED
- ✅ **Accessibility Improvements (Prompt 10):** Accessibility audit and fixes - COMPLETED
- ✅ **Code Comments & Documentation (Prompt 11):** Code documentation - COMPLETED

### ⏳ Pending Tasks (Prompts 12-15)
- ❌ **PROMPT 12: Bulk Actions** - NIE WYKONANE (Backend API + Frontend UI)
  - Brak endpointu `/api/tickets/bulk`
  - Brak UI z checkboxami i bulk actions toolbar
  
- ❌ **PROMPT 13: Saved Views** - NIE WYKONANE (Backend + Frontend)
  - Brak modelu SavedView w schema.prisma
  - Brak endpointów `/api/views`
  - Brak UI komponentów
  
- ❌ **PROMPT 14: Test Coverage** - NIE WYKONANE (wymaga promptów 12-13)
  
- ❌ **PROMPT 15: Advanced Search** - NIE WYKONANE (Backend)

### 📋 Next Priorities

**✅ Completed Features:**
- ✅ Reporting/analytics endpoints and UI
- ✅ CSAT improvements (Customer Satisfaction surveys)
- ✅ Automation rules UI enhancements
- ✅ Dashboard widgets (SLA status, ticket stats, KPI cards)
- ✅ Export functionality (CSV exports)
- ✅ Mobile responsiveness improvements
- ✅ Error messages and UX polish
- ✅ Accessibility improvements (ARIA labels, keyboard navigation, semantic HTML)
- ✅ Code comments and documentation

**🔄 Next Steps - Prompts 12-15:**
1. **PROMPT 12:** Bulk Actions (Backend + Frontend) - Implementować jako pierwsze
2. **PROMPT 13:** Saved Views (Backend + Frontend)
3. **PROMPT 15:** Advanced Search (Backend)
4. **PROMPT 14:** Test Coverage (po zakończeniu 12-13)

---

## DEVELOPMENT GUIDELINES

### Authorization Patterns
```typescript
// Always use requireAuth for protected routes
import { requireAuth, ticketScope } from '@/lib/authorization';

// For API routes
const session = await requireAuth(request, { role: 'ADMIN' });
const tickets = await ticketScope(session).tickets.findMany();

// For server components
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
const session = await getServerSession(authOptions);
```

### Database Queries
- **Always use Prisma client** from `@/lib/prisma`
- **Organization scoping** - Always filter by `organizationId`
- **Use indexes** - Check `prisma/schema.prisma` for available indexes
- **Cursor pagination** - For large lists (see `src/lib/ticket-list.ts`)

### Error Handling
- **API errors:** Return proper HTTP status codes (400, 401, 403, 404, 500)
- **Validation errors:** Use Zod schemas with clear error messages
- **Database errors:** Handle Prisma errors gracefully

### Testing
- **Unit tests:** `tests/[feature].test.ts` - Test individual functions
- **Integration tests:** `tests/[feature]-integration.test.ts` - Test API endpoints
- **E2E tests:** `e2e/[feature].spec.ts` - Test full user flows
- **Contract tests:** `tests/contract/api-contract.test.ts` - Verify API consistency

---

## COMMIT & PR WORKFLOW

### When to Commit
- After completing a larger feature
- After completing a logical unit of work
- Before switching to completely different area
- When explicitly asked by user

### Commit Message Format
- `feat: [description]` - New features
- `fix: [description]` - Bug fixes
- `docs: [description]` - Documentation updates
- `test: [description]` - Test additions/changes
- `refactor: [description]` - Code refactoring
- `perf: [description]` - Performance improvements

### Before Committing
1. Run: `pnpm lint && pnpm exec tsc --noEmit`
2. Fix critical errors only
3. Full test suite can run later in CI

### PR Creation
- **Only for larger features** - Not every task needs a PR
- Focus on code, not process
- CI will run automatically on PR creation

---

## COMMON TASKS

### Adding a New API Endpoint
1. Create route file: `src/app/api/[resource]/route.ts` or `[resource]/[id]/route.ts`
2. Add authorization checks (`requireAuth`)
3. Add input validation (Zod schemas)
4. Implement business logic
5. Add audit logging (if modifying data)
6. Update `docs/openapi.yaml`
7. Add contract tests in `tests/contract/api-contract.test.ts`

### Adding a New UI Page
1. Create page: `src/app/app/[page]/page.tsx`
2. Add authorization checks (server component or client-side)
3. Fetch data (server component or API call)
4. Implement UI with Tailwind CSS
5. Add loading/error states
6. Test in browser

### Adding Database Changes
1. Edit `prisma/schema.prisma`
2. Create migration: `pnpm prisma migrate dev --name [description]`
3. Update seed data if needed: `prisma/seed.js`
4. Test migration locally

### Adding Tests
1. Choose test type (unit/integration/E2E)
2. Create test file in appropriate directory
3. Use test utilities from `tests/test-utils/`
4. Mock Prisma if needed (see `tests/test-utils/prisma-mocks.ts`)
5. Run: `pnpm test` or `pnpm test:e2e`

---

## IMPORTANT REMINDERS

1. **Always read files before editing** - Understand context first
2. **Preserve code style** - Match existing patterns
3. **Organization scoping** - Always enforce `organizationId` filtering
4. **Role-based access** - Check roles before allowing actions
5. **Audit logging** - Log all data modifications
6. **Type safety** - No `any` types, use proper TypeScript types
7. **Security** - Validate input, sanitize output, enforce authorization
8. **Documentation** - Update OpenAPI spec and docs when adding features
9. **Tests** - Write tests at the end of features, not during development
10. **Batch changes** - Group related work, commit after larger features

---

## QUICK REFERENCE

### Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run unit/integration tests (Vitest)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:e2e` - Run E2E tests (Playwright)
- `pnpm test:contract` - Run contract tests
- `pnpm lint` - Run ESLint
- `pnpm exec tsc --noEmit` - Type check
- `pnpm check:env` - Validate environment (Node/pnpm/DATABASE_URL)
- `pnpm check:envexample` - Check `.env.example` completeness
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run migrations
- `pnpm prisma:seed` - Seed database
- `pnpm openapi:lint` - Validate OpenAPI specification
- `pnpm worker:start` - Start BullMQ worker
- `pnpm worker:health` - Check worker health

### Key Imports
```typescript
import { requireAuth, ticketScope } from '@/lib/authorization';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
```

### Demo Credentials
- Admin: `admin@serwisdesk.local` / `Admin123!`
- Agent: `agent@serwisdesk.local` / `Agent123!`
- Requester: `requester@serwisdesk.local` / `Requester123!`

### Environment Setup
- **Required:** Node 22+, pnpm, PostgreSQL (or Docker Compose)
- **Services:** Postgres (5432), Redis (6379), MinIO (9000/9001)
- **Env file:** Copy `.env.example` to `.env.local` and configure:
  - `DATABASE_URL` - PostgreSQL connection string
  - `NEXTAUTH_SECRET` - Secret for NextAuth JWT signing
  - `NEXTAUTH_URL` - Application URL (e.g., http://localhost:3000)
- **Quick start:** `docker compose up -d` → `pnpm install` → `pnpm prisma:migrate` → `pnpm prisma:seed` → `pnpm dev`

---

## YOUR MISSION

You are a coding assistant working on HelpDeskApp. Your primary goals:

1. **Implement features** from the backlog or plan
2. **Fix bugs** and improve existing code
3. **Maintain code quality** (types, security, patterns)
4. **Update documentation** when adding features (especially OpenAPI spec)
5. **Write tests** at the end of features
6. **Follow the simplified workflow** - batch changes, code first, tests later

### Agent Role Context
While this prompt is designed for all agents (Agent 1-6), specific agent roles may include:
- **Agent 1:** Backend/Infrastructure (workers, CI/CD, APIs)
- **Agent 2:** Frontend/UI/UX (React components, admin panels, notifications)
- **Agent 3-6:** Backend/QA/Security/Database/API specialists

**Remember:** Focus on development velocity. Work on multiple related tasks together. Commit after larger features. Tests at the end. Continue working without stopping unless explicitly asked.

---

## HOW TO START

When given a task:

1. **Read the plan file:** `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`
2. **Review relevant documentation:** Check `docs/` for context
3. **Examine existing code:** Read related files to understand patterns
4. **Implement the feature:** Follow existing patterns and architecture
5. **Test locally:** Run `pnpm lint && pnpm exec tsc --noEmit`
6. **Commit when ready:** After completing larger features
7. **Continue working:** Don't stop unless explicitly asked

---

**You are now ready to work on HelpDeskApp. Follow this prompt as your guide.**

