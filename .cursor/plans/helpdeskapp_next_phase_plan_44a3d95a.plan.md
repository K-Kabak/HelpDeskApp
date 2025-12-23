---
name: HelpDeskApp Next Phase Plan
overview: This plan addresses critical gaps and high-value improvements for the HelpDeskApp repository. The codebase is more advanced than documentation suggests—many features are implemented but the worker needs job routing, CI/CD is missing, and some admin features need completion. The plan prioritizes blockers, then high-value user workflows, then debt reduction.
todos: []
---

# HelpDeskApp Next Phase E

xecution Plan

## Executive Summary

After systematic analysis of the repository, the codebase is significantly more advanced than documentation indicates. Many features from the backlog are already implemented (pagination, attachments, audit timeline, admin UI, SLA logic). Critical gaps identified:

## Progress Update (Latest - Post Agent Execution)
## Progress Update (Latest)

**Phase 1 Status:**

- ✅ **Task 1 (Worker Job Handlers)** - COMPLETED by Agent 1
                                                                                                                                - Worker routing implemented in `src/worker/index.ts`
                                                                                                                                - Routes `sla:breach` → `handleSlaJob` and `sla:reminder` → `handleSlaReminder`
                                                                                                                                - Integration tests added in `tests/worker-integration.test.ts`
- ✅ **Task 2 (CI/CD Pipeline)** - COMPLETED by Agent 2
                                                                                                                                - CI workflow created at `.github/workflows/ci.yml`
                                                                                                                                - Includes: lint, typecheck, test, contract-tests, openapi-lint, worker-smoke
                                                                                                                                - Runs on PR and push to main
- ✅ **Task 3 (Worker Health Check)** - COMPLETED by Agent 1
                                                                                                                                - Health check implemented in `src/worker/health.ts`
                                                                                                                                - Function `getQueueHealth` returns status, counts, failed jobs
                                                                                                                                - CLI script available via `pnpm worker:health`
- ✅ **Task 4 (Admin Users/Teams Management UI)** - COMPLETED by Agent 2
                                                                                                                                - Admin users UI implemented: `src/app/app/admin/users/page.tsx`, `users-manager.tsx`
                                                                                                                                - Admin teams UI implemented: `src/app/app/admin/teams/page.tsx`, `teams-manager.tsx`
                                                                                                                                - API endpoints created: `/api/admin/users/`, `/api/admin/teams/`
                                                                                                                                - Full CRUD operations with org-scoping and role guards
- ✅ **Task 5 (In-App Notification Center UI)** - COMPLETED by Agent 2
                                                                                                                                - Notification center UI: `src/app/app/notifications/page.tsx`, `notifications-list.tsx`
                                                                                                                                - Read/unread state management implemented
                                                                                                                                - Mark as read functionality working
                                                                                                                                - Empty states and UI polish complete
- ✅ **Task 7 (Documentation Updates)** - COMPLETED by Agent 3
                                                                                                                                - `docs/contradictions.md` updated - removed false claims about missing comments API
                                                                                                                                - `docs/current-state.md` updated - added organization boundary enforcement notes
                                                                                                                                - `BLUEPRINT.md` gap analysis updated
                                                                                                                                - Backlog items marked complete
- ✅ **Task 8 (Integration Tests)** - COMPLETED by Agent 1
                                                                                                                                - Worker job processing tests added
                                                                                                                                - Admin CRUD operation tests added
                                                                                                                                - Notification delivery tests added
                                                                                                                                - Test coverage >70% for critical paths
- ✅ **Task 9 (Performance Optimization)** - COMPLETED by Agent 5
                                                                                                                                - Database indexes added via migration: `20251223020000_add_performance_indexes`
                                                                                                                                - Indexes on Ticket, Comment, Attachment, AuditEvent, User, Team, Tag, Category tables
                                                                                                                                - Search index optimized: `Ticket_search_idx` on `(organizationId, title, descriptionMd, category)`
                                                                                                                                - Performance monitoring hooks added
- ✅ **Security Audit** - COMPLETED by Agent 4
                                                                                                                                - Authorization vulnerabilities fixed
                                                                                                                                - Security tests added
                                                                                                                                - Security hardening implemented
- ✅ **OpenAPI Specification Update** - COMPLETED by Agent 6
                                                                                                                                - OpenAPI spec updated with missing admin, notification, and utility endpoints
                                                                                                                                - All endpoints documented
                                                                                                                                - OpenAPI lint passes

**Current Issues:**

- ⚠️ **PR #204 CI Failures** - TypeScript type errors in `src/app/app/page.tsx` (NextAuth session handling)
                                                                                                                                - 8 linter errors related to NextAuth session types
                                                                                                                                - Property access issues: `organizationId`, `id`, `role` on session.user
                                                                                                                                - Constant assignment error on line 115
                                                                                                                                - **Status:** CI Fix Agent assigned to resolve

**Next Steps:**

- Fix PR #204 CI failures (TypeScript errors in dashboard page)
- Complete Task 6: Enhance Ticket Detail with Missing Features (if not done)
- Start Phase 4: Production Deployment Documentation (Task 10)
- ✅ **Task 7 (Documentation Updates)** - PARTIALLY COMPLETED by Agent 3
                                                                                                                                - `docs/contradictions.md` updated - removed false claims about missing comments API
                                                                                                                                - `docs/current-state.md` updated - added organization boundary enforcement notes
                                                                                                                                - Still needed: Update `BLUEPRINT.md` gap analysis, mark completed backlog items

**Next Steps:**

- Continue with Phase 2 tasks (Frontend work)
- Complete remaining documentation updates
- Start Phase 3 tasks (testing, performance)

1. **Worker job routing** - SLA handlers exist but worker has placeholder processor
2. **CI/CD pipeline** - No GitHub Actions workflows found
3. **Documentation drift** - Docs claim features are missing that actually exist
4. **Admin feature completeness** - Some admin UIs may need polish/completion

## Evidence-Based Current State

### ✅ Implemented (Verified in Code)

- Comments API with org boundary checks (`src/app/api/tickets/[id]/comments/route.ts`)
- Cursor-based pagination (`src/lib/ticket-list.ts`)
- Search uses `descriptionMd` correctly (bug appears fixed)
- Authorization helpers (`src/lib/authorization.ts`)
- Admin UI: audit viewer, automation rules, SLA policies (`src/app/app/admin/`)
- Audit timeline UI (`src/app/app/tickets/[id]/audit-timeline.tsx`)
- Attachment upload UI (`src/app/app/tickets/[id]/attachment-picker.tsx`)
- SLA worker logic (`src/lib/sla-worker.ts`, `src/lib/sla-scheduler.ts`)
- Comprehensive test suite (39 test files)
- Rate limiting, sanitization, spam guards

### ❌ Critical Gaps

- **Worker job processor** - `src/worker/index.ts` has placeholder; SLA handlers exist but not wired
- **CI/CD pipeline** - No `.github/workflows/*.yml` files found
- **Documentation accuracy** - `docs/contradictions.md` and `docs/current-state-delta.md` are outdated

### ⚠️ Needs Verification

- Admin UI completeness (users/teams management)
- Notification system full implementation
- Worker health checks operational

## Execution Plan

### Phase 1: Critical Blockers (Week 1-2)

#### Task 1: Wire Worker Job Handlers

**Owner:** Backend Developer 1**Priority:** P0 (blocker)**Dependencies:** None**Files:** `src/worker/index.ts`, `src/lib/sla-worker.ts`, `src/lib/sla-reminder.ts`**What:** Replace placeholder worker processor with job routing to SLA handlers.**Why:** SLA jobs are scheduled but never processed, breaking SLA breach detection.**Acceptance:**

- Worker routes `sla:breach` jobs to `handleSlaJob`
- Worker routes `sla:reminder` jobs to `handleSlaReminder`
- Integration tests verify jobs process correctly
- Worker health check passes

**Definition of Done:**

- [x] Worker processor routes jobs by `job.name` to appropriate handlers ✅
- [x] SLA breach jobs create audit events and notifications ✅
- [x] SLA reminder jobs send notifications before breach ✅
- [x] Tests pass: `tests/sla-worker.test.ts`, `tests/sla-reminder.test.ts`, `tests/worker-integration.test.ts` ✅
- [ ] Manual test: create ticket, wait for SLA due, verify breach detected (pending verification)

**Status:** ✅ COMPLETED**Concurrency:** Can run parallel with Task 2 (different files)---

#### Task 2: Set Up CI/CD Pipeline

**Owner:** Backend Developer 2**Priority:** P0 (blocker)**Dependencies:** None**Files:** `.github/workflows/ci.yml` (new)**What:** Create GitHub Actions workflow for lint, typecheck, tests, OpenAPI validation.**Why:** No automated quality gates; regressions can slip through.**Acceptance:**

- Workflow runs on PR and push to main
- Runs: `pnpm lint`, `pnpm exec tsc -p tsconfig.ci.json --noEmit`, `pnpm test`, `pnpm test:contract`, `pnpm openapi:lint`
- Fails PR merge if any step fails
- Secrets masked in logs

**Definition of Done:**

- [x] `.github/workflows/ci.yml` created ✅
- [x] All quality gates run and pass on test PR ✅
- [x] Workflow blocks merge on failure ✅
- [x] Secrets (DATABASE_URL, etc.) masked ✅
- [x] Worker smoke test included: `pnpm worker:smoke` ✅

**Status:** ✅ COMPLETED**Concurrency:** Can run parallel with Task 1---

#### Task 3: Fix Worker Health Check

**Owner:** Backend Developer 3**Priority:** P0 (blocker)**Dependencies:** Task 1**Files:** `src/worker/health.ts`, `package.json`**What:** Ensure worker health check script validates Redis connection and queue status.**Why:** Required for production monitoring and checkpoint 7.**Acceptance:**

- `pnpm worker:health` connects to Redis and reports queue metrics
- Returns non-zero exit code on failure
- Reports queue lag, active jobs, failed jobs

**Definition of Done:**

- [x] Health script validates Redis connection ✅
- [x] Reports queue metrics (lag, active, failed) ✅
- [x] Exits with appropriate codes ✅
- [ ] Documented in `docs/worker-deployment-runbook.md` (pending)

**Status:** ✅ COMPLETED (documentation pending)**Concurrency:** Blocks on Task 1 completion---

### Phase 2: High-Value User Workflows (Week 2-3)

#### Task 4: Complete Admin Users/Teams Management UI

**Owner:** Frontend Developer 1**Priority:** P1**Dependencies:** Verify API completeness**Files:** `src/app/app/admin/users/` (new), `src/app/app/admin/teams/` (new)**What:** Build admin UI for user and team CRUD operations.**Why:** Admin APIs may exist but UI is missing; manual DB edits are error-prone.**Acceptance:**

- Admin can list/create/update/delete users (org-scoped)
- Admin can manage team memberships
- Validation prevents deleting users with active tickets
- Actions logged in admin audit

**Definition of Done:**

- [x] Users list page with create/edit forms ✅
- [x] Teams management page with membership assignment ✅
- [x] Role-based access guards (ADMIN only) ✅
- [x] Integration tests for CRUD flows ✅
- [x] E2E test: admin creates user, assigns to team ✅

**Status:** ✅ COMPLETED**Concurrency:** Can start after verifying APIs exist (parallel investigation)---
- [ ] Users list page with create/edit forms
- [ ] Teams management page with membership assignment
- [ ] Role-based access guards (ADMIN only)
- [ ] Integration tests for CRUD flows
- [ ] E2E test: admin creates user, assigns to team

**Concurrency:** Can start after verifying APIs exist (parallel investigation)---

#### Task 5: In-App Notification Center UI

**Owner:** Frontend Developer 2**Priority:** P1**Dependencies:** Verify notification API exists**Files:** `src/app/app/notifications/` (may exist, verify completeness)**What:** Build notification center with read/unread states and filters.**Why:** Users need visibility into ticket updates and SLA breaches.**Acceptance:**

- Notification list shows unread count
- Mark as read functionality
- Filter by type (ticket update, SLA breach, etc.)
- Real-time updates (polling or SSE)

**Definition of Done:**

- [x] Notification list UI with read/unread badges ✅
- [x] Mark as read API integration ✅
- [ ] Filters for notification types (pending - can be added later)
- [x] Empty state when no notifications ✅
- [x] E2E test: receive notification, mark as read ✅

**Status:** ✅ COMPLETED (filters can be added in future iteration)**Concurrency:** Can run parallel with Task 4---
- [ ] Notification list UI with read/unread badges
- [ ] Mark as read API integration
- [ ] Filters for notification types
- [ ] Empty state when no notifications
- [ ] E2E test: receive notification, mark as read

**Concurrency:** Can run parallel with Task 4---

#### Task 6: Enhance Ticket Detail with Missing Features

**Owner:** Frontend Developer 3**Priority:** P1**Dependencies:** None**Files:** `src/app/app/tickets/[id]/page.tsx`, related components**What:** Verify and complete ticket detail page features (reopen reason, assignment suggestions, etc.).**Why:** Some features from backlog may be partially implemented.**Acceptance:**

- Reopen reason capture form works
- Assignment auto-suggest displays
- All ticket actions respect role permissions
- Audit timeline visible and accurate

**Definition of Done:**

- [ ] Audit existing ticket detail implementation
- [ ] Complete any missing features (reopen reason, assignment suggest)
- [ ] Verify all role-based permissions enforced
- [ ] E2E test: requester reopens ticket with reason

**Concurrency:** Can run parallel with Tasks 4-5---

### Phase 3: Documentation & Debt Reduction (Week 3-4)

#### Task 7: Update Documentation to Match Reality

**Owner:** Backend Developer 1**Priority:** P1**Dependencies:** None**Files:** `docs/contradictions.md`, `docs/current-state.md`, `docs/current-state-delta.md`, `BLUEPRINT.md`**What:** Fix documentation that claims features are missing when they're implemented.**Why:** Misleading docs cause confusion and wasted effort.**Acceptance:**

- Remove contradictions about missing comments API
- Update current-state docs to reflect pagination, attachments, admin UI
- Mark completed backlog items as done
- Add notes about worker wiring gap

**Definition of Done:**

- [x] `docs/contradictions.md` updated (remove false claims) ✅
- [x] `docs/current-state.md` reflects actual implementation ✅
- [x] `BLUEPRINT.md` gap analysis updated ✅
- [x] Backlog items marked complete where applicable ✅

**Status:** ✅ COMPLETED**Concurrency:** Can run parallel with other tasks---
- [ ] `BLUEPRINT.md` gap analysis updated (pending)
- [ ] Backlog items marked complete where applicable (pending)

**Status:** 🔄 PARTIALLY COMPLETED (2/4 items done)**Concurrency:** Can run parallel with other tasks---

#### Task 8: Add Missing Integration Tests

**Owner:** Backend Developer 1**Priority:** P1**Dependencies:** Task 1 (for worker tests)**Files:** `tests/` (new or enhance existing)**What:** Add integration tests for worker job processing, admin CRUD, notification flows.**Why:** Test coverage gaps in critical paths increase regression risk.**Acceptance:**

- Worker job processing integration tests
- Admin CRUD operation tests
- Notification delivery tests
- Test coverage >70% for critical paths

**Definition of Done:**

- [x] Worker job processing tests pass ✅
- [x] Admin CRUD tests cover all operations ✅
- [x] Notification tests verify delivery ✅
- [x] Coverage report shows >70% for `src/lib/` and `src/app/api/` ✅

**Status:** ✅ COMPLETED**Concurrency:** Blocks on Task 1---

#### Task 9: Performance Optimization & Monitoring

**Owner:** Backend Developer 3**Priority:** P2**Dependencies:** Task 2 (CI)**Files:** Various**What:** Add performance budgets, optimize slow queries, add monitoring hooks.**Why:** Prevent performance degradation as data grows.**Acceptance:**

- Ticket list pagination performance acceptable (<200ms for 20 items)
- Database indexes verified for common queries
- Request logging includes timing metrics
- Performance budget documented

**Definition of Done:**

- [x] Database indexes reviewed and optimized ✅
                                                                                                                                - Migration `20251223020000_add_performance_indexes` created
                                                                                                                                - Indexes on all major tables (Ticket, Comment, Attachment, AuditEvent, User, Team, Tag, Category)
                                                                                                                                - Search index optimized: `Ticket_search_idx`
- [ ] Ticket list query <200ms (measured - pending verification)
- [x] Request timing logged ✅
- [ ] Performance budget doc created (pending)

**Status:** 🔄 MOSTLY COMPLETED (indexes done, measurement pending)**Concurrency:** Can run parallel with other tasks---
- [ ] Ticket list query <200ms (measured)
- [ ] Database indexes reviewed and optimized
- [ ] Request timing logged
- [ ] Performance budget doc created

**Concurrency:** Can run parallel with other tasks---

### Phase 4: Polish & Production Readiness (Week 4+)

#### Task 10: Production Deployment Documentation

**Owner:** Backend Developer 1**Priority:** P1**Dependencies:** Tasks 1-3**Files:** `docs/deployment.md` (new), `docker-compose.prod.yml` (new)**What:** Create production deployment guide and Docker Compose for production.**Why:** Enable reliable production deployments.**Acceptance:**

- Deployment runbook with step-by-step instructions
- Production docker-compose with health checks
- Environment variable documentation
- Rollback procedures documented

**Definition of Done:**

- [ ] Deployment guide created
- [ ] Production docker-compose tested
- [ ] Environment vars documented
- [ ] Rollback procedure tested

**Concurrency:** Can start after Phase 1 complete---

## Risk Mitigation

1. **Worker not processing jobs** - Task 1 addresses this immediately
2. **CI failures blocking development** - Task 2 establishes quality gates
3. **Documentation confusion** - Task 7 aligns docs with reality
4. **Missing admin features** - Task 4 completes critical admin workflows

## Success Metrics

- Worker processes SLA jobs successfully (Task 1)
- CI pipeline green on all PRs (Task 2)
- Admin can manage users/teams via UI (Task 4)
- Documentation accurately reflects codebase (Task 7)
- Test coverage >70% for critical paths (Task 8)

## Parallelization Strategy

**Week 1:**

- Backend Dev 1: Task 1 (Worker wiring)
- Backend Dev 2: Task 2 (CI/CD)
- Backend Dev 3: Task 3 (Health check) - starts after Task 1
- Frontend Dev 1: Investigate admin APIs for Task 4
- Frontend Dev 2: Audit notification API for Task 5
- Frontend Dev 3: Audit ticket detail for Task 6

**Week 2:**

- Backend Dev 1: Task 7 (Docs) - can start early
- Backend Dev 2: Task 8 (Tests) - after Task 1
- Backend Dev 3: Task 9 (Performance)
- Frontend Devs 1-3: Tasks 4-6 implementation

**Week 3-4:**

- All developers: Complete remaining tasks, polish, testing

## Dependencies Graph

```javascript
Task 1 (Worker) → Task 3 (Health) → Task 8 (Tests)
Task 1 (Worker) → Task 10 (Deployment)
Task 2 (CI) → Task 9 (Performance)
Task 4-6 (Frontend) → Can start in parallel after API verification
Task 7 (Docs) → No dependencies, can start immediately
```

---

## AI Agent Start Prompts

### Agent 1: Backend Infrastructure Developer

**Role:** Backend/Infrastructure Developer**Focus Areas:** Worker systems, CI/CD, deployment, infrastructure, API backend**⚠️ CRITICAL WORKFLOW RULE: After completing each task, you MUST STOP and ask the user for explicit approval before proceeding to the next task. Do not proceed automatically.Your Mission:**You are a backend infrastructure developer working on the HelpDeskApp repository. Your primary responsibilities are:

1. **Worker System (Tasks 1, 3)**

- Wire the BullMQ worker to process SLA jobs (`sla:breach`, `sla:reminder`)
- Implement job routing in `src/worker/index.ts` to call `handleSlaJob` and `handleSlaReminder`
- Fix worker health check script (`src/worker/health.ts`)
- Ensure Redis connection validation and queue metrics reporting

2. **CI/CD Pipeline (Task 2)**

- Create `.github/workflows/ci.yml` with quality gates
- Configure lint, typecheck, tests, OpenAPI validation
- Ensure secrets are masked and workflow blocks merges on failure

3. **Documentation Updates (Task 7)**

- Update `docs/contradictions.md` to remove false claims about missing APIs
- Update `docs/current-state.md` to reflect actual implementation
- Update `BLUEPRINT.md` gap analysis

4. **Testing & Quality (Task 8)**

- Add integration tests for worker job processing
- Add tests for admin CRUD operations
- Ensure test coverage >70% for `src/lib/` and `src/app/api/`

5. **Performance & Monitoring (Task 9)**

- Optimize database queries and verify indexes
- Add request timing metrics to logging
- Create performance budget documentation

6. **Production Deployment (Task 10)**

- Create deployment runbook (`docs/deployment.md`)
- Create production docker-compose configuration
- Document environment variables and rollback procedures

**How to Use This Plan:**

1. Read the full plan file to understand context and dependencies
2. Focus on your assigned tasks (1, 2, 3, 7, 8, 9, 10)
3. Check task dependencies before starting (e.g., Task 3 depends on Task 1)
4. Follow the Definition of Done checklists for each task
5. **CRITICAL: After completing each task:**

- Create branch, commit, push, and create PR (see Git Workflow section)
- Enable auto-merge in PR settings
- **STOP and inform user: "Task NN completed. PR #XXX created. Waiting for CI and your approval."**
- **DO NOT proceed to next task** - wait for explicit user approval

6. Update the plan file to mark tasks as complete when done
7. Coordinate with Frontend Agent if API changes are needed

**Key Files You'll Work With:**

- `src/worker/index.ts` - Worker job processor
- `src/worker/health.ts` - Health check script
- `src/lib/sla-worker.ts` - SLA breach handler
- `src/lib/sla-reminder.ts` - SLA reminder handler
- `.github/workflows/ci.yml` - CI/CD pipeline (new)
- `docs/` - Documentation files
- `tests/` - Test files

**Success Criteria:**

- Worker processes SLA jobs successfully
- CI pipeline green on all PRs
- Test coverage >70% for critical paths
- Documentation accurately reflects codebase
- Production deployment guide complete

---

### Agent 2: Frontend UI/UX Developer

**Role:** Frontend/UI Developer**Focus Areas:** React components, user interfaces, UX flows, admin panels, notifications**⚠️ CRITICAL WORKFLOW RULE: After completing each task, you MUST STOP and ask the user for explicit approval before proceeding to the next task. Do not proceed automatically.Your Mission:**You are a frontend UI/UX developer working on the HelpDeskApp repository. Your primary responsibilities are:

1. **Admin Users/Teams Management UI (Task 4)**

- Build admin UI for user CRUD operations (`src/app/app/admin/users/`)
- Build admin UI for team management (`src/app/app/admin/teams/`)
- Implement role-based access guards (ADMIN only)
- Ensure org-scoping is enforced in UI
- Add validation to prevent deleting users with active tickets

2. **In-App Notification Center (Task 5)**

- Enhance or build notification center UI (`src/app/app/notifications/`)
- Implement read/unread state management
- Add filters for notification types
- Implement real-time updates (polling or SSE)
- Create empty states and loading states

3. **Ticket Detail Enhancements (Task 6)**

- Audit existing ticket detail page implementation
- Complete reopen reason capture form
- Implement assignment auto-suggest display
- Verify all role-based permissions are enforced in UI
- Ensure audit timeline is visible and accurate

**How to Use This Plan:**

1. Read the full plan file to understand context and user workflows
2. Focus on your assigned tasks (4, 5, 6)
3. Verify API endpoints exist before building UI (check `src/app/api/`)
4. Follow existing UI patterns in the codebase (check `src/app/app/` and `src/components/`)
5. Use Tailwind CSS for styling (existing pattern)
6. Ensure accessibility and responsive design
7. Write E2E tests for critical user flows
8. **CRITICAL: After completing each task:**

- Create branch, commit, push, and create PR (see Git Workflow section)
- Enable auto-merge in PR settings
- **STOP and inform user: "Task NN completed. PR #XXX created. Waiting for CI and your approval."**
- **DO NOT proceed to next task** - wait for explicit user approval

9. Update the plan file to mark tasks as complete when done

**Key Files You'll Work With:**

- `src/app/app/admin/users/` - User management pages (new)
- `src/app/app/admin/teams/` - Team management pages (new)
- `src/app/app/notifications/` - Notification center (may exist, verify)
- `src/app/app/tickets/[id]/page.tsx` - Ticket detail page
- `src/app/app/tickets/[id]/ticket-actions.tsx` - Ticket actions component
- `src/components/` - Shared components
- `tests/` - E2E tests (Playwright)

**Design Guidelines:**

- Follow existing design patterns (see `src/app/app/admin/` for admin UI patterns)
- Use consistent spacing, colors, and typography (Tailwind classes)
- Ensure mobile responsiveness
- Implement proper loading and error states
- Use Sonner for toast notifications (existing pattern)

**Success Criteria:**

- Admin can manage users/teams via UI
- Notification center shows unread count and filters work
- Ticket detail page has all required features
- All UI respects role-based permissions
- E2E tests pass for critical flows

---

### Agent 3: Quality Assurance & Documentation Specialist

**Role:** QA/Documentation Specialist**Focus Areas:** Testing, documentation accuracy, quality gates, verification**⚠️ CRITICAL WORKFLOW RULE: After completing each task or verification milestone, you MUST STOP and ask the user for explicit approval before proceeding. Do not proceed automatically.Your Mission:**You are a QA and documentation specialist working on the HelpDeskApp repository. Your primary responsibilities are:

1. **Documentation Verification & Updates (Task 7)**

- Audit all documentation files against actual codebase
- Update `docs/contradictions.md` to remove false claims
- Update `docs/current-state.md` to reflect actual implementation
- Update `BLUEPRINT.md` gap analysis
- Mark completed backlog items in `docs/github-backlog.md`

2. **Test Coverage & Quality (Task 8)**

- Review existing test suite (39 test files)
- Identify gaps in test coverage
- Add integration tests for worker job processing
- Add tests for admin CRUD operations
- Add tests for notification delivery
- Ensure coverage >70% for critical paths (`src/lib/`, `src/app/api/`)

3. **Quality Gate Verification**

- Verify CI/CD pipeline runs all quality gates
- Ensure contract tests cover API behaviors
- Verify OpenAPI spec matches actual API
- Check that all security validations are tested

4. **Cross-Feature Verification**

- Verify worker health check works correctly
- Verify admin UI APIs are complete and tested
- Verify notification system is fully implemented
- Create verification checklists for each phase

**How to Use This Plan:**

1. Read the full plan file to understand all tasks and dependencies
2. Work across all phases to ensure quality and documentation accuracy
3. Verify implementations match acceptance criteria
4. Create test cases for new features
5. Update documentation as features are completed
6. **CRITICAL: After completing each task or verification milestone:**

- Create branch, commit, push, and create PR (see Git Workflow section)
- Enable auto-merge in PR settings
- **STOP and inform user: "Task NN completed. PR #XXX created. Waiting for CI and your approval."**
- **DO NOT proceed to next task** - wait for explicit user approval

7. Coordinate with Backend and Frontend agents to verify their work
8. Update the plan file to mark verification tasks as complete

**Key Files You'll Work With:**

- `docs/` - All documentation files
- `tests/` - All test files
- `tests/contract/` - Contract tests
- `.github/workflows/ci.yml` - CI pipeline
- `docs/openapi.yaml` - API specification
- `vitest.config.ts` - Test configuration

**Verification Checklist:**

- [ ] All documentation matches codebase reality
- [ ] Test coverage >70% for critical paths
- [ ] CI pipeline runs all quality gates
- [ ] Contract tests verify API behaviors
- [ ] OpenAPI spec matches actual endpoints
- [ ] Security validations are tested
- [ ] Worker health check verified
- [ ] Admin APIs verified and tested
- [ ] Notification system verified

**Success Criteria:**

- Documentation accurately reflects codebase
- Test coverage >70% for critical paths
- All quality gates pass in CI
- No false claims in documentation
- All features have corresponding tests

---

## Agent Coordination Guidelines

### Running Multiple Agents in Parallel

**✅ YES, you can run 2-3 agents simultaneously!** However, follow these guidelines:**Safe Parallel Execution:**

- ✅ **Agent 1 (Backend) + Agent 2 (Frontend)** - Can work in parallel (different code areas)
- ✅ **Agent 1 (Backend) + Agent 3 (QA/Docs)** - Can work in parallel (different focus)
- ✅ **Agent 2 (Frontend) + Agent 3 (QA/Docs)** - Can work in parallel
- ✅ **Agent 4 (Security) + Agent 5 (Database)** - Can work in parallel (different focus)
- ✅ **Agent 6 (API) + Agent 1 (Backend)** - Can work in parallel (API reviews backend work)
- ✅ **All 6 agents** - Can work simultaneously if working on independent tasks and different files

**Parallel Execution Rules:**

1. **Check task dependencies first** - Don't start Task 3 if Task 1 isn't complete
2. **Different files/areas** - Agents should work on different files to avoid merge conflicts
3. **Communication** - If agents need to modify the same file, coordinate or work sequentially
4. **Plan file updates** - When multiple agents update the plan file, be careful of conflicts

**Recommended Parallel Scenarios:Week 1 (Optimal Parallel Setup):**

- **Agent 1**: Task 1 (Worker wiring) - `src/worker/index.ts`
- **Agent 2**: Task 2 (CI/CD) - `.github/workflows/ci.yml` (new file)
- **Agent 3**: Task 7 (Documentation) - `docs/*.md` files
- **Agent 4**: Security audit of existing code - Review `src/lib/authorization.ts`, `src/app/api/`
- **Agent 5**: Database performance review - `prisma/schema.prisma`, query optimization
- **Agent 6**: OpenAPI spec update - `docs/openapi.yaml`

→ All can work simultaneously (different files, no conflicts)**Week 2 (After Task 1 Complete):**

- **Agent 1**: Task 3 (Health check) - `src/worker/health.ts`
- **Agent 2**: Task 4 (Admin UI) - `src/app/app/admin/users/` (new)
- **Agent 3**: Task 5 (Notifications) - `src/app/app/notifications/` (different area)
- **Agent 4**: Security testing for new features
- **Agent 5**: Task 9 (Performance optimization) - Database queries
- **Agent 6**: Contract tests for new APIs - `tests/contract/`

→ All can work simultaneously**Avoid Parallel Execution When:**

- ❌ Task 3 depends on Task 1 (wait for Task 1 completion)
- ❌ Task 8 depends on Task 1 (wait for Task 1 completion)
- ❌ Multiple agents need to modify the same file (coordinate or sequence)
- ❌ One agent's output is required input for another (check dependencies)

**Communication:**

- Update the plan file when starting/completing tasks
- Mark dependencies as ready when prerequisites are complete
- Document any blockers or issues discovered
- Share API contract changes with Frontend Agent
- Share UI requirements with Backend Agent
- Agent 4 (Security) reviews all code changes for security issues
- Agent 5 (Database) reviews all database changes and queries
- Agent 6 (API) keeps OpenAPI spec updated and reviews API changes

**Workflow:**

1. Read the full plan file first
2. Check task dependencies before starting
3. **If running parallel: Verify no file conflicts with other active agents**
4. Verify existing code before making assumptions
5. Follow existing code patterns and conventions
6. Write tests alongside implementation
7. Update documentation as you work
8. **CRITICAL WORKFLOW:**

- After completing a task, you MUST:

a) Create a branch: `git checkout -b feature/task-NN-description`b) Commit changes: `git commit -m "type: summary"`c) Push branch: `git push origin feature/task-NN-description`d) Create PR with title `V4: <Task Description> (closes #NN)` and body `Closes #NN`e) Enable auto-merge (squash) in PR settingsf) **STOP and inform user: "Task NN completed. PR #XXX created with auto-merge enabled. Waiting for CI to pass and your approval to continue."**

- **DO NOT merge manually** - wait for auto-merge after CI passes
- **DO NOT proceed to next task** - wait for explicit user approval

9. Mark tasks complete in the plan file
10. Wait for explicit user confirmation before starting the next task

**Repository Conventions:**

- PR title format: `V4: <title> (closes #NN)`
- PR body: `Closes #NN`
- One issue per PR
- Enable auto-merge when possible
- CI must pass before merge

### Git Workflow & PR Creation

**After completing each task, follow this workflow:**

1. **Create a branch:**
   ```bash
               git checkout -b feature/task-NN-description
               # Example: git checkout -b feature/task-1-worker-job-handlers
   ```




2. **Commit your changes:**
   ```bash
               git add .
               git commit -m "type: summary description"
               # Examples:
               # git commit -m "feat: wire SLA job handlers to worker processor"
               # git commit -m "fix: update worker health check script"
               # git commit -m "docs: update contradictions.md to reflect actual state"
   ```


**Commit message format:** `type: summary`

- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
- Keep commits focused and atomic

3. **Push to remote:**
   ```bash
               git push origin feature/task-NN-description
   ```




4. **Create Pull Request:**

- **Title:** `V4: <Task Description> (closes #NN)`
                                                                                                                                                                                                                                                                - Example: `V4: Wire Worker Job Handlers (closes #1)`
- **Body:** Must contain exactly: `Closes #NN`
- **Labels:** Add appropriate labels (priority, area, type)
- **Enable auto-merge:** Check "Enable auto-merge" with squash merge
- **Delete branch after merge:** Enable this option

5. **Wait for CI to pass:**

- CI must pass before merge
- If CI fails, fix issues and push again
- Do not merge if CI is failing

6. **Automatic merge:**

- Once CI passes and auto-merge is enabled, PR will merge automatically
- Branch will be deleted automatically after merge

**Important Notes:**

- ✅ One task = One PR = One issue
- ✅ Always rebase from main before creating PR: `git rebase origin/main`
- ✅ Keep PR scope minimal and focused
- ✅ Include tests in the same PR as the feature
- ✅ Update documentation in the same PR if needed
- ❌ Do not include unrelated changes
- ❌ Do not skip CI checks
- ❌ Do not merge if tests are failing

**Automated PR Creation (Optional):**If you have GitHub CLI (`gh`) installed, you can create PR automatically:

```bash
gh pr create --title "V4: <Task Description> (closes #NN)" --body "Closes #NN" --label "priority:P0,area:backend,type:feature" --base main

```

---

## Next Steps & Agent Prompts

### Current Status Summary

**Completed Tasks:**

- ✅ Task 1: Worker Job Handlers (Agent 1)
- ✅ Task 2: CI/CD Pipeline (Agent 2)  
- ✅ Task 3: Worker Health Check (Agent 1)
- 🔄 Task 7: Documentation Updates (Agent 3) - 50% complete

**Ready to Start:**

- Task 4: Admin Users/Teams Management UI (Frontend)
- Task 5: In-App Notification Center UI (Frontend)
- Task 6: Enhance Ticket Detail Features (Frontend)
- Task 8: Add Missing Integration Tests (Backend)
- Task 9: Performance Optimization (Backend)
- Task 10: Production Deployment Documentation (Backend)

**Remaining Documentation:**

- Update `BLUEPRINT.md` gap analysis
- Mark completed backlog items in `docs/github-backlog.md`
- Document worker health check in `docs/worker-deployment-runbook.md`

### Next Action Prompt (For Agents 1-3)

**For Agent 1 (Backend Infrastructure):**

```javascript
You are Agent 1: Backend Infrastructure Developer working on HelpDeskApp.

CURRENT STATUS:
- ✅ Task 1 (Worker Job Handlers) - COMPLETED
- ✅ Task 3 (Worker Health Check) - COMPLETED

NEXT TASKS (choose one based on priority):
1. Task 8: Add Missing Integration Tests - Add integration tests for worker job processing, admin CRUD operations, notification flows
2. Task 9: Performance Optimization - Optimize database queries, add indexes, create performance budgets
3. Task 10: Production Deployment Documentation - Create deployment runbook and production docker-compose

YOUR ASSIGNMENT:
Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md` and:
1. Review the completed tasks (1, 3) to understand what was done
2. Choose your next task (8, 9, or 10) based on dependencies and priority
3. Follow the task definition, acceptance criteria, and Definition of Done checklist
4. **AFTER COMPLETING THE TASK:**
   a) Create branch: `git checkout -b feature/task-NN-description`
   b) Commit: `git commit -m "feat: task description"`
   c) Push: `git push origin feature/task-NN-description`
   d) Create PR with title `V4: <Task Description> (closes #NN)` and body `Closes #NN`
   e) Enable auto-merge (squash) in PR settings
   f) **STOP and inform user: "Task NN completed. PR #XXX created with auto-merge enabled. Waiting for CI to pass and your approval to continue."**
5. **DO NOT merge manually** - wait for auto-merge after CI passes
6. **DO NOT proceed to next task** - wait for explicit user approval

Remember: After each task, you MUST create PR, enable auto-merge, STOP, and wait for approval.
```

**For Agent 2 (Frontend UI/UX):**

```javascript
You are Agent 2: Frontend UI/UX Developer working on HelpDeskApp.

CURRENT STATUS:
- ✅ Task 2 (CI/CD Pipeline) - COMPLETED

NEXT TASKS (can start immediately):
1. Task 4: Complete Admin Users/Teams Management UI - Build admin UI for user and team CRUD operations
2. Task 5: In-App Notification Center UI - Enhance notification center with read/unread states and filters
3. Task 6: Enhance Ticket Detail with Missing Features - Complete reopen reason, assignment suggestions, etc.

YOUR ASSIGNMENT:
Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md` and:
1. Verify API endpoints exist before building UI (check `src/app/api/`)
2. Choose your next task (4, 5, or 6) - you can work on any of them
3. Follow existing UI patterns in the codebase (check `src/app/app/` and `src/components/`)
4. Use Tailwind CSS for styling
5. Ensure accessibility and responsive design
6. Write E2E tests for critical user flows
7. **AFTER COMPLETING THE TASK:**
   a) Create branch: `git checkout -b feature/task-NN-description`
   b) Commit: `git commit -m "feat: task description"`
   c) Push: `git push origin feature/task-NN-description`
   d) Create PR with title `V4: <Task Description> (closes #NN)` and body `Closes #NN`
   e) Enable auto-merge (squash) in PR settings
   f) **STOP and inform user: "Task NN completed. PR #XXX created with auto-merge enabled. Waiting for CI to pass and your approval to continue."**
8. **DO NOT merge manually** - wait for auto-merge after CI passes
9. **DO NOT proceed to next task** - wait for explicit user approval

Remember: After each task, you MUST create PR, enable auto-merge, STOP, and wait for approval.
```

**For Agent 3 (QA/Documentation):**

```javascript
You are Agent 3: Quality Assurance & Documentation Specialist working on HelpDeskApp.

CURRENT STATUS:
- 🔄 Task 7 (Documentation Updates) - PARTIALLY COMPLETED (2/4 items done)
                                - ✅ Updated `docs/contradictions.md`
                                - ✅ Updated `docs/current-state.md`
                                - ❌ Still need: Update `BLUEPRINT.md` gap analysis
                                - ❌ Still need: Mark completed backlog items in `docs/github-backlog.md`

NEXT TASKS:
1. Complete Task 7: Finish documentation updates (BLUEPRINT.md and github-backlog.md)
2. Task 8: Add Missing Integration Tests - Review test coverage, add tests for worker, admin CRUD, notifications

YOUR ASSIGNMENT:
Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md` and:
1. Complete the remaining Task 7 items:
                                                    - Update `BLUEPRINT.md` gap analysis to reflect completed work (Tasks 1, 2, 3)
                                                    - Mark completed backlog items in `docs/github-backlog.md` (items related to worker, CI/CD, health check)
2. Review test coverage and identify gaps
3. **AFTER COMPLETING THE TASK:**
   a) Create branch: `git checkout -b feature/task-NN-description`
   b) Commit: `git commit -m "docs: task description"`
   c) Push: `git push origin feature/task-NN-description`
   d) Create PR with title `V4: <Task Description> (closes #NN)` and body `Closes #NN`
   e) Enable auto-merge (squash) in PR settings
   f) **STOP and inform user: "Task NN completed. PR #XXX created with auto-merge enabled. Waiting for CI to pass and your approval to continue."**
4. **DO NOT merge manually** - wait for auto-merge after CI passes
5. **DO NOT proceed to next task** - wait for explicit user approval

Remember: After each task, you MUST create PR, enable auto-merge, STOP, and wait for approval.
```



### Start Prompts for Agents 4-6

**Agent 4: Security & Compliance Specialist - Start Prompt**

```javascript
You are Agent 4: Security & Compliance Specialist working on HelpDeskApp.

YOUR MISSION:
Conduct security audits and ensure compliance across the HelpDeskApp repository.

IMMEDIATE TASKS:
1. Security Audit of Existing Code:
                                                - Review `src/lib/authorization.ts` for authorization vulnerabilities
                                                - Review all API endpoints in `src/app/api/` for security issues
                                                - Check for SQL injection, XSS, CSRF vulnerabilities
                                                - Verify rate limiting is properly implemented
                                                - Audit file upload security (attachments)

2. Security Hardening:
                                                - Ensure all secrets are properly masked in logs
                                                - Verify session security (JWT expiration, refresh tokens)
                                                - Check input validation and sanitization
                                                - Verify organization scoping is enforced everywhere

3. Security Testing:
                                                - Add security-focused tests
                                                - Test authentication bypass attempts
                                                - Test authorization boundary violations
                                                - Test rate limiting effectiveness

HOW TO START:
1. Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`
2. Review your agent section (Agent 4) for full responsibilities
3. Start with security audit of existing code (Task 1 above)
4. Document findings and create security test cases
5. **AFTER COMPLETING EACH SECURITY REVIEW:**
   a) Create branch: `git checkout -b feature/security-audit-NN`
   b) Commit: `git commit -m "security: audit findings and fixes"`
   c) Push: `git push origin feature/security-audit-NN`
   d) Create PR with title `V4: Security Audit - <Area> (closes #NN)` and body `Closes #NN`
   e) Enable auto-merge (squash) in PR settings
   f) **STOP and inform user: "Security audit NN completed. PR #XXX created with auto-merge enabled. Waiting for CI to pass and your approval to continue."**
6. **DO NOT merge manually** - wait for auto-merge after CI passes
7. **DO NOT proceed to next audit** - wait for explicit user approval

Key Files to Review:
- `src/lib/authorization.ts`
- `src/lib/rate-limit.ts`
- `src/lib/sanitize.ts`
- `src/app/api/` (all endpoints)
- `src/lib/auth.ts`
- `tests/` (add security tests)

Remember: After each task, you MUST create PR, enable auto-merge, STOP, and wait for approval.
```

**Agent 5: Database & Performance Specialist - Start Prompt**

```javascript
You are Agent 5: Database & Performance Specialist working on HelpDeskApp.

YOUR MISSION:
Optimize database performance, review migrations, and ensure data integrity.

IMMEDIATE TASKS:
1. Database Performance Review (Task 9):
                                                - Review Prisma schema for optimization opportunities
                                                - Profile slow queries in `src/lib/ticket-list.ts` and API endpoints
                                                - Verify indexes are properly created and used
                                                - Review N+1 query problems
                                                - Add database query performance monitoring

2. Migration & Schema Review:
                                                - Review all Prisma migrations for safety
                                                - Ensure migrations are additive and reversible
                                                - Verify foreign key constraints
                                                - Check data integrity constraints

3. Performance Monitoring:
                                                - Add query timing to logs
                                                - Create performance budgets
                                                - Monitor ticket list query performance (target: <200ms for 20 items)
                                                - Optimize search queries

HOW TO START:
1. Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`
2. Review your agent section (Agent 5) for full responsibilities
3. Start with database performance review:
                                                    - Profile ticket list queries
                                                    - Check existing indexes in `prisma/schema.prisma`
                                                    - Review query patterns in `src/lib/ticket-list.ts`
4. Document findings and create optimization plan
5. **AFTER COMPLETING EACH OPTIMIZATION:**
   a) Create branch: `git checkout -b feature/performance-optimization-NN`
   b) Commit: `git commit -m "perf: optimization description"`
   c) Push: `git push origin feature/performance-optimization-NN`
   d) Create PR with title `V4: Performance Optimization - <Area> (closes #NN)` and body `Closes #NN`
   e) Enable auto-merge (squash) in PR settings
   f) **STOP and inform user: "Performance optimization NN completed. PR #XXX created with auto-merge enabled. Waiting for CI to pass and your approval to continue."**
6. **DO NOT merge manually** - wait for auto-merge after CI passes
7. **DO NOT proceed to next optimization** - wait for explicit user approval

Key Files to Review:
- `prisma/schema.prisma`
- `prisma/migrations/`
- `src/lib/ticket-list.ts`
- `src/lib/prisma.ts`
- `src/app/api/` (all endpoints with queries)

Remember: After each task, you MUST create PR, enable auto-merge, STOP, and wait for approval.
```

**Agent 6: API & Integration Specialist - Start Prompt**

```javascript
You are Agent 6: API & Integration Specialist working on HelpDeskApp.

YOUR MISSION:
Maintain OpenAPI specification, ensure API consistency, and manage contract testing.

IMMEDIATE TASKS:
1. OpenAPI Specification Update:
                                                - Review `docs/openapi.yaml` against actual API endpoints
                                                - Add any missing endpoints (worker health, new admin endpoints)
                                                - Verify all endpoints are documented
                                                - Ensure OpenAPI lint passes
                                                - Update API contracts as features are added

2. Contract Testing (Task 8):
                                                - Review existing contract tests in `tests/contract/`
                                                - Add contract tests for worker endpoints (if any)
                                                - Add contract tests for admin endpoints
                                                - Verify API contracts match implementation
                                                - Test error responses match spec

3. API Design & Consistency:
                                                - Ensure consistent request/response formats
                                                - Verify error model is consistent across all endpoints
                                                - Check pagination is implemented correctly
                                                - Review API versioning strategy
                                                - Ensure proper HTTP status codes

HOW TO START:
1. Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`
2. Review your agent section (Agent 6) for full responsibilities
3. Start with OpenAPI specification review:
                                                    - Compare `docs/openapi.yaml` with actual endpoints in `src/app/api/`
                                                    - Identify missing or outdated documentation
                                                    - Update OpenAPI spec to match reality
4. Run `pnpm openapi:lint` to verify spec is valid
5. **AFTER COMPLETING EACH UPDATE:**
   a) Create branch: `git checkout -b feature/api-docs-update-NN`
   b) Commit: `git commit -m "docs: update OpenAPI spec"`
   c) Push: `git push origin feature/api-docs-update-NN`
   d) Create PR with title `V4: Update OpenAPI Specification (closes #NN)` and body `Closes #NN`
   e) Enable auto-merge (squash) in PR settings
   f) **STOP and inform user: "API documentation update NN completed. PR #XXX created with auto-merge enabled. Waiting for CI to pass and your approval to continue."**
6. **DO NOT merge manually** - wait for auto-merge after CI passes
7. **DO NOT proceed to next update** - wait for explicit user approval

Key Files to Review:
- `docs/openapi.yaml`
- `tests/contract/api-contract.test.ts`
- `src/app/api/` (all endpoints)
- `src/lib/error-schema.ts`
- `docs/contract-conventions.md`

Remember: After each task, you MUST create PR, enable auto-merge, STOP, and wait for approval.

---

## Next Steps & Immediate Actions

### Current Status (Post Agent Execution)

**✅ Completed Tasks:**
- Task 1: Worker Job Handlers
- Task 2: CI/CD Pipeline
- Task 3: Worker Health Check
- Task 4: Admin Users/Teams Management UI
- Task 5: In-App Notification Center UI
- Task 7: Documentation Updates
- Task 8: Integration Tests
- Task 9: Performance Optimization (indexes done)
- Security Audit (Agent 4)
- OpenAPI Specification Update (Agent 6)

**⚠️ Current Blocker:**
- **PR #204 CI Failures** - TypeScript type errors in `src/app/app/page.tsx`
  - 8 linter errors related to NextAuth session handling
  - Property access issues: `organizationId`, `id`, `role` on session.user
  - Constant assignment error on line 115
  - **Action Required:** CI Fix Agent needs to resolve these errors

**🔄 Pending Tasks:**
- Task 6: Enhance Ticket Detail with Missing Features (verify if completed)
- Task 9: Performance Optimization - Complete measurement and budget doc
- Task 10: Production Deployment Documentation

### Immediate Next Prompts

#### 1. CI Fix Agent Prompt (URGENT - PR #204)

```javascript
You are a Backend/CI Specialist working on HelpDeskApp repository.

URGENT TASK: Fix failing CI checks for PR #204

YOUR MISSION:
1. Investigate and fix all failing CI checks in PR #204
2. Ensure all CI gates pass: lint, typecheck, openapi-lint, test, contract-tests, worker-smoke
3. Verify fixes locally before pushing

HOW TO START:
1. Check out the PR branch for PR #204 (or work on current branch if already checked out)
2. Run CI checks locally to reproduce failures:
   ```bash
   pnpm lint
   pnpm exec tsc -p tsconfig.ci.json --noEmit
   pnpm openapi:lint
   pnpm test
   pnpm test:contract
   pnpm worker:smoke
   ```
3. Identify which checks are failing and why
4. Fix the issues:
   - Lint errors: fix code style/formatting issues
   - Type errors: fix TypeScript type issues (especially in `src/app/app/page.tsx`)
   - OpenAPI errors: update `docs/openapi.yaml` to match API changes
   - Test failures: fix broken tests or update test expectations
   - Contract test failures: ensure API contracts match implementation
   - Worker smoke failures: fix worker configuration issues

SPECIFIC ISSUES TO FIX:
- Fix TypeScript type errors in `src/app/app/page.tsx`:
  - Line 44:42: NextAuth session type mismatch
  - Line 70:45: Property 'organizationId' does not exist on session.user
  - Line 82:45: Property 'organizationId' does not exist on session.user
  - Line 98:24: Property 'id' does not exist on session.user
  - Line 99:26: Property 'role' does not exist on session.user
  - Line 100:36: Property 'organizationId' does not exist on session.user
  - Line 115:5: Cannot assign to 'tickets' because it is a constant
  - Line 163:33: Property 'role' does not exist on session.user

ACCEPTANCE CRITERIA:
- All CI checks pass locally
- No lint errors
- No type errors
- OpenAPI spec is valid
- All tests pass
- Contract tests pass
- Worker smoke test passes

AFTER FIXING:
1. Test fixes locally - run all CI commands above
2. Commit fixes: `git commit -m "fix: resolve CI check failures for PR #204"`
3. Push to PR branch: `git push origin <pr-branch-name>`
4. Verify CI passes in GitHub Actions
5. **STOP and inform user: "CI fixes completed for PR #204. All checks should pass. Waiting for CI results and your approval."**

IMPORTANT:
- Do not merge the PR - just fix the CI issues
- Keep changes minimal - only fix what's broken
- If tests are failing, understand why before changing test expectations
- If OpenAPI is failing, ensure spec accurately reflects API changes
- Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md` for context

Key Files to Check:
- `.github/workflows/ci.yml` - CI configuration
- `eslint.config.mjs` - Lint configuration
- `tsconfig.ci.json` - TypeScript CI configuration
- `docs/openapi.yaml` - OpenAPI specification
- `tests/` - Test files
- `src/app/app/page.tsx` - Dashboard page with type errors
- `src/lib/auth.ts` - NextAuth configuration

Remember: Fix only what's broken. Do not make unrelated changes.
```

#### 2. Task 6 Verification Prompt (If Not Completed)

```javascript
You are Agent 2: Frontend UI/UX Developer working on HelpDeskApp.

TASK: Verify and Complete Task 6 - Enhance Ticket Detail with Missing Features

YOUR MISSION:
1. Audit existing ticket detail page implementation
2. Verify if reopen reason capture form exists and works
3. Verify if assignment auto-suggest displays correctly
4. Ensure all role-based permissions are enforced in UI
5. Verify audit timeline is visible and accurate
6. Complete any missing features

HOW TO START:
1. Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`
2. Review Task 6 definition and acceptance criteria
3. Audit `src/app/app/tickets/[id]/page.tsx` and related components
4. Check if reopen reason form exists
5. Check if assignment auto-suggest is implemented
6. Verify role-based permissions in UI
7. Complete any missing features

ACCEPTANCE CRITERIA:
- Reopen reason capture form works
- Assignment auto-suggest displays
- All ticket actions respect role permissions
- Audit timeline visible and accurate

AFTER COMPLETING:
1. Create branch: `git checkout -b feature/task-6-ticket-detail-enhancements`
2. Commit: `git commit -m "feat: complete ticket detail enhancements"`
3. Push: `git push origin feature/task-6-ticket-detail-enhancements`
4. Create PR with title `V4: Enhance Ticket Detail with Missing Features (closes #6)` and body `Closes #6`
5. Enable auto-merge (squash) in PR settings
6. **STOP and inform user: "Task 6 completed. PR #XXX created with auto-merge enabled. Waiting for CI to pass and your approval to continue."**

Remember: After each task, you MUST create PR, enable auto-merge, STOP, and wait for approval.
```

#### 3. Task 10 Prompt (Production Deployment)

```javascript
You are Agent 1: Backend Infrastructure Developer working on HelpDeskApp.

TASK: Task 10 - Production Deployment Documentation

YOUR MISSION:
1. Create production deployment guide (`docs/deployment.md`)
2. Create production docker-compose configuration (`docker-compose.prod.yml`)
3. Document environment variables
4. Document rollback procedures
5. Test deployment process

HOW TO START:
1. Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`
2. Review Task 10 definition and acceptance criteria
3. Review existing `docker-compose.yml` for reference
4. Create production deployment documentation
5. Create production docker-compose with health checks
6. Document all required environment variables
7. Document rollback procedures

ACCEPTANCE CRITERIA:
- Deployment runbook with step-by-step instructions
- Production docker-compose with health checks
- Environment variable documentation
- Rollback procedures documented

AFTER COMPLETING:
1. Create branch: `git checkout -b feature/task-10-production-deployment`
2. Commit: `git commit -m "docs: add production deployment guide"`
3. Push: `git push origin feature/task-10-production-deployment`
4. Create PR with title `V4: Production Deployment Documentation (closes #10)` and body `Closes #10`
5. Enable auto-merge (squash) in PR settings
6. **STOP and inform user: "Task 10 completed. PR #XXX created with auto-merge enabled. Waiting for CI to pass and your approval to continue."**

Remember: After each task, you MUST create PR, enable auto-merge, STOP, and wait for approval.
```

### Recommended Execution Order

1. **FIRST (URGENT):** CI Fix Agent - Fix PR #204 CI failures
2. **SECOND:** Task 6 Verification - Verify ticket detail enhancements
3. **THIRD:** Task 10 - Production deployment documentation
4. **FOURTH:** Task 9 Completion - Performance measurement and budget doc

### Notes

- All agents should read the updated plan file before starting work
- All agents must follow the Git workflow (branch, commit, push, PR, auto-merge, STOP)
- All agents must wait for explicit user approval before proceeding to next task
- CI must pass before any merge
- Keep changes minimal and focused


```