# 🚀 Następne Prompty (12-15) - Po Zakończeniu 8-11

## ✅ Status: Prompty 8-11 Zakończone

**Wykonane:**
- PR #221: Notification filters, dashboard polish, docs
- PR #223: Accessibility improvements
- PR #224: Error messages and UX polish
- PROMPT 8: Mobile responsiveness (commit: 04f6d9c)
- PROMPT 9: Error messages & UX polish (commit: 4761a25)
- PROMPT 10: Accessibility improvements (commits: 331958c, aa67641, ad62412)
- PROMPT 11: Code comments & documentation (commit: 3d4a4da)

---

## PROMPT 12: Agent 1 + Agent 2 (Backend + Frontend) - Bulk Actions on Ticket List

**UWAGA: To zadanie wymaga współpracy Agent 1 (Backend) i Agent 2 (Frontend). Można zacząć od backendu (Agent 1), a potem frontend (Agent 2), lub pracować równolegle jeśli backend API jest gotowe.**

**SKOPIUJ CAŁOŚĆ (dla Agent 1 - Backend):**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Bulk Actions API for Ticket List

**Status:** Ticket list exists but no bulk operations (assign, status change) for multiple tickets at once.

**YOUR MISSION (Backend - Agent 1):**
1. **Create bulk actions API endpoint:**
   - Endpoint: `PATCH /api/tickets/bulk`
   - Accept: `{ ticketIds: string[], status?: TicketStatus, assigneeUserId?: string | null, assigneeTeamId?: string | null }`
   - Validate: All tickets must be in user's organization
   - Enforce: Role-based permissions (AGENT/ADMIN only)
   - Update: Multiple tickets in transaction
   - Audit: Create audit events for each ticket update
   - Return: `{ updated: number, errors?: Array<{ ticketId: string, error: string }> }`

2. **Authorization:**
   - Only AGENT/ADMIN can use bulk actions
   - Verify all ticketIds belong to user's organization
   - Validate assignee exists and is in same organization
   - Validate team exists and is in same organization

3. **Error handling:**
   - Return partial success (some tickets updated, some failed)
   - Include error details for each failed ticket
   - Log failures for monitoring

**SIMPLIFIED WORKFLOW:**
- Create API endpoint with validation
- Add authorization checks
- Implement bulk update logic with transaction
- Create audit events for each update
- Test with multiple tickets
- Commit when done

**ACCEPTANCE CRITERIA:**
- API endpoint accepts array of ticket IDs
- Updates multiple tickets in single request
- Returns count of updated tickets and errors
- Creates audit events for each update
- Enforces organization scoping and role permissions

**WHEN READY TO COMMIT:**
- After bulk actions API is complete
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: add bulk actions API for tickets"`
- Push and create PR with auto-merge

**Files to create/modify:**
- `src/app/api/tickets/bulk/route.ts` (new)
- Add tests if needed
```

---

**SKOPIUJ CAŁOŚĆ (dla Agent 2 - Frontend):**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Bulk Actions UI for Ticket List

**Status:** Ticket list exists but no UI for selecting and bulk-updating multiple tickets.

**YOUR MISSION (Frontend - Agent 2):**
1. **Add checkbox selection to ticket list:**
   - Add checkbox to each ticket card (only for AGENT/ADMIN roles)
   - Add "Select all" checkbox in header
   - Show count of selected tickets
   - Store selected ticket IDs in state

2. **Add bulk actions toolbar:**
   - Show toolbar when tickets are selected
   - Actions: "Change Status", "Assign to Agent", "Assign to Team"
   - Disable toolbar if no tickets selected
   - Position: Above ticket list or sticky at top

3. **Implement bulk action dialogs:**
   - Status change dialog: dropdown to select status
   - Assignment dialog: dropdowns for agent/team
   - Show confirmation: "Update X tickets?"
   - Display loading state during operation
   - Show success/error toast with results

4. **Error handling:**
   - Display which tickets succeeded/failed
   - Clear selection after successful update
   - Keep selection if partial failure (so user can retry)

**SIMPLIFIED WORKFLOW:**
- Add checkbox selection UI to ticket cards
- Add bulk actions toolbar
- Implement status change dialog
- Implement assignment dialog
- Add API integration
- Test with multiple tickets
- Commit when done

**ACCEPTANCE CRITERIA:**
- Users can select multiple tickets with checkboxes
- Bulk actions toolbar appears when tickets selected
- Status change works for selected tickets
- Assignment works for selected tickets
- Success/error messages are clear
- Only AGENT/ADMIN see bulk action UI

**WHEN READY TO COMMIT:**
- After bulk actions UI is complete
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: add bulk actions UI for ticket list"`
- Push and create PR with auto-merge

**Files to modify:**
- `src/app/app/page.tsx` - Add checkbox selection
- `src/app/app/tickets-list.tsx` (if exists) or create new component
- Add bulk actions toolbar component
- Add bulk action dialogs
```

---

## PROMPT 13: Agent 1 + Agent 2 (Backend + Frontend) - Saved Views for Ticket Filters

**UWAGA: To zadanie wymaga współpracy Agent 1 (Backend) i Agent 2 (Frontend). Można zacząć od backendu (Agent 1), a potem frontend (Agent 2).**

**SKOPIUJ CAŁOŚĆ (dla Agent 1 - Backend):**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Saved Views API for Ticket Filters

**Status:** Ticket list has filters but users can't save filter combinations for quick access.

**YOUR MISSION (Backend - Agent 1):**
1. **Create SavedView model (Prisma migration):**
   - Fields: id, userId, organizationId, name, filters (JSON), isDefault, isShared, createdAt, updatedAt
   - Relations: User (many-to-one), Organization (many-to-one)
   - Indexes: userId, organizationId
   - Filters JSON structure: `{ status?, priority?, search?, category?, tagIds? }`

2. **Create API endpoints:**
   - `GET /api/views` - List user's saved views (org-scoped)
   - `POST /api/views` - Create new saved view
   - `PATCH /api/views/[id]` - Update saved view
   - `DELETE /api/views/[id]` - Delete saved view
   - `POST /api/views/[id]/set-default` - Set as default view

3. **Authorization:**
   - Users can only see/edit their own views (unless shared)
   - All views scoped to user's organization
   - Validate filter structure before saving

4. **Validation:**
   - Name required (1-50 characters)
   - Filters must be valid filter structure
   - Prevent duplicate names per user

**SIMPLIFIED WORKFLOW:**
- Create Prisma migration for SavedView model
- Create API endpoints
- Add authorization and validation
- Test CRUD operations
- Commit when done

**ACCEPTANCE CRITERIA:**
- SavedView model exists in database
- API endpoints support full CRUD
- Views are scoped to user and organization
- Filters are validated before saving
- Default view can be set

**WHEN READY TO COMMIT:**
- After saved views API is complete
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: add saved views API for ticket filters"`
- Push and create PR with auto-merge

**Files to create/modify:**
- `prisma/migrations/YYYYMMDDHHMMSS_add_saved_views/migration.sql` (new)
- Update `prisma/schema.prisma` with SavedView model
- `src/app/api/views/route.ts` (new)
- `src/app/api/views/[id]/route.ts` (new)
```

---

**SKOPIUJ CAŁOŚĆ (dla Agent 2 - Frontend):**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Saved Views UI for Ticket Filters

**Status:** Ticket list has filters but users can't save and quickly switch between filter combinations.

**YOUR MISSION (Frontend - Agent 2):**
1. **Add saved views dropdown/tabs:**
   - Show saved views as tabs or dropdown above ticket list
   - "Default" view (if set) loads automatically
   - Click view to apply its filters
   - Highlight currently active view

2. **Add "Save current filters as view" button:**
   - Button appears when filters are active
   - Opens dialog to name the view
   - Option to "Set as default"
   - Saves current filter state

3. **Add view management:**
   - Edit view name
   - Delete view (with confirmation)
   - Set default view
   - Show view count/name in UI

4. **Integration with existing filters:**
   - When view selected, populate filter inputs
   - When filters changed, show "Save as view" option
   - Preserve view selection in URL query params

**SIMPLIFIED WORKFLOW:**
- Add saved views dropdown/tabs component
- Add save view dialog
- Add view management (edit/delete/set default)
- Integrate with existing filter system
- Test view saving and loading
- Commit when done

**ACCEPTANCE CRITERIA:**
- Users can see list of saved views
- Users can save current filters as view
- Users can switch between saved views
- Users can manage views (edit/delete/set default)
- Default view loads automatically
- Views persist across page reloads

**WHEN READY TO COMMIT:**
- After saved views UI is complete
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: add saved views UI for ticket filters"`
- Push and create PR with auto-merge

**Files to modify:**
- `src/app/app/page.tsx` - Add saved views UI
- Create `src/app/app/saved-views.tsx` component (new)
- Create `src/app/app/save-view-dialog.tsx` component (new)
```

---

## PROMPT 14: Agent 3 (QA/Docs) - Test Coverage for New Features

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Test Coverage for Bulk Actions & Saved Views

**Status:** New features (bulk actions, saved views) need test coverage to prevent regressions.

**YOUR MISSION:**
1. **Add tests for bulk actions API:**
   - Test bulk status update
   - Test bulk assignment
   - Test authorization (AGENT/ADMIN only)
   - Test organization scoping
   - Test partial failures
   - Test audit event creation

2. **Add tests for saved views API:**
   - Test CRUD operations
   - Test organization scoping
   - Test default view setting
   - Test filter validation
   - Test duplicate name prevention

3. **Add E2E tests (Playwright):**
   - Test bulk actions UI flow
   - Test saved views UI flow
   - Test view switching
   - Test view management

4. **Update documentation:**
   - Update API docs if needed
   - Document new features in README or docs

**SIMPLIFIED WORKFLOW:**
- Add API integration tests
- Add E2E tests
- Update documentation
- Run tests and verify they pass
- Commit when done

**ACCEPTANCE CRITERIA:**
- API tests cover bulk actions and saved views
- E2E tests cover UI flows
- Test coverage >70% for new code
- Documentation updated

**WHEN READY TO COMMIT:**
- After tests are complete
- Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
- Commit: `git commit -m "test: add test coverage for bulk actions and saved views"`
- Push and create PR with auto-merge

**Files to create/modify:**
- `tests/bulk-actions.test.ts` (new)
- `tests/saved-views.test.ts` (new)
- `e2e/bulk-actions.spec.ts` (new)
- `e2e/saved-views.spec.ts` (new)
- Update docs if needed
```

---

## PROMPT 15: Agent 1 (Backend) - Advanced Search Enhancements

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Advanced Search Enhancements

**Status:** Basic search exists but could be enhanced with more options (date range, tags, assignee).

**YOUR MISSION:**
1. **Enhance search API:**
   - Add date range filter (createdAt, updatedAt, resolvedAt)
   - Add assignee filter (userId or teamId)
   - Add tag filter (already exists but verify it works well)
   - Add sorting options (by date, priority, status)
   - Keep existing text search working

2. **Update ticket list query:**
   - Add date range to `getTicketPage` function
   - Add assignee filtering
   - Add sorting parameter
   - Ensure all filters work together

3. **Performance:**
   - Ensure indexes are used for date/assignee filters
   - Test query performance with multiple filters
   - Add query logging if needed for debugging

**SIMPLIFIED WORKFLOW:**
- Enhance search API with new filters
- Update ticket list query logic
- Test with various filter combinations
- Verify performance is acceptable
- Commit when done

**ACCEPTANCE CRITERIA:**
- Date range filtering works
- Assignee filtering works (user or team)
- Sorting options work
- All filters can be combined
- Performance remains acceptable (<200ms)

**WHEN READY TO COMMIT:**
- After search enhancements are complete
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: enhance ticket search with date range and assignee filters"`
- Push and create PR with auto-merge

**Files to modify:**
- `src/lib/ticket-list.ts` - Enhance getTicketPage function
- `src/app/api/tickets/route.ts` - Add new query parameters
- Update types if needed
```

---

## 📝 FINAL COMMIT PROMPT (używaj po każdym zadaniu)

```
Jeśli po zakończeniu wszystkich zmian i wszystko działa, wykonaj:

### 1. Check & Commit
git status
pnpm lint && pnpm exec tsc --noEmit
git checkout -b feature/[nazwa-funkcji]
git add .
git commit -m "feat: [opis zmian]"
git push origin feature/[nazwa-funkcji]

### 2. Create PR with AUTO-MERGE (RECOMMENDED)

**GitHub CLI (fastest):**
gh pr create --title "feat: [opis]" --body "Implements changes. Auto-merge enabled." --fill

**GitHub UI:**
1. Click "Compare & pull request"
2. Enable "Auto-merge" → "Squash and merge"
3. Create PR

**PR will auto-merge after CI passes! ✅**

### Alternative: Direct commit (only for very small changes - 1-2 files)
git checkout main && git pull origin main
git add . && git commit -m "fix: [opis]"
git push origin main  # Only if branch protection allows

---

**RECOMMENDATION: Always use PR with auto-merge** - safer, CI checks, clean history.

**Commit format:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `perf:`
```

---

## 🎯 Kolejność Uruchamiania

**Prompty 12-15 (różne poziomy trudności):**

1. **Agent 1** - PROMPT 12 (Bulk Actions API) - średni
   - Zacznij od backendu, potem frontend

2. **Agent 2** - PROMPT 12 (Bulk Actions UI) - średni
   - Zacznij PO zakończeniu backendu (lub równolegle jeśli API gotowe)

3. **Agent 1** - PROMPT 13 (Saved Views API) - średni
   - Można równolegle z promptem 12 (backend)

4. **Agent 2** - PROMPT 13 (Saved Views UI) - średni
   - Zacznij PO zakończeniu saved views API

5. **Agent 3** - PROMPT 14 (Test Coverage) - prosty
   - Zacznij PO zakończeniu promptów 12-13

6. **Agent 1** - PROMPT 15 (Advanced Search) - prosty/średni
   - Można równolegle z innymi zadaniami (tylko backend)

**Rekomendowana kolejność:**
1. **Agent 1**: PROMPT 12 (Bulk Actions API) → PROMPT 13 (Saved Views API) → PROMPT 15 (Search)
2. **Agent 2**: PROMPT 12 (Bulk Actions UI) → PROMPT 13 (Saved Views UI)
3. **Agent 3**: PROMPT 14 (Tests) - na końcu

**Możesz uruchomić równolegle:**
- Agent 1 może pracować na promptach 12, 13, 15 równolegle (różne pliki/obszary)
- Agent 2 czeka na API, potem może pracować równolegle
- Agent 3 na końcu, gdy features są gotowe

**Uwaga:** Bulk Actions i Saved Views są średnio trudne - wymagają współpracy backend+frontend.












