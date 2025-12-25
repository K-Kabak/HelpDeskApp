# 🔧 PROMPT 15 FIX: Saved Views UI - Agent 2 (Frontend)

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Complete Saved Views UI (Prompt 15)

**Status:** Backend API is complete (Prompt 14), but UI is missing. Need to build the frontend for saved views.

**YOUR MISSION:**
1. **Create saved views component:**
   - Create `src/app/app/saved-views.tsx` component
   - Display saved views as tabs or dropdown above ticket list
   - Show "All Tickets" as default view
   - Highlight active view
   - Show view count

2. **Add "Save Current View" functionality:**
   - Add button/dialog to save current filters/search as view
   - Dialog should have:
     - Input for view name
     - Option: Personal or Team view (checkbox)
     - Save button
   - Call `POST /api/views` with current filters
   - Show success/error toasts

3. **Implement view loading:**
   - When user clicks saved view, apply its filters
   - Update URL query params to match view filters
   - Refresh ticket list with applied filters
   - Highlight selected view

4. **Add view management:**
   - Edit view name (inline or dialog)
   - Delete view (with confirmation)
   - Show view metadata (created date, isTeam flag)

5. **Integrate with dashboard:**
   - Add saved views component to `src/app/app/page.tsx`
   - Place it above ticket list (before filters)
   - Ensure it works with existing filter system

**Current State:**
- ✅ Backend API exists: `/api/views` (GET, POST), `/api/views/[id]` (PATCH, DELETE)
- ✅ SavedView model exists in Prisma
- ❌ No UI components for saved views
- ❌ No integration with dashboard page

**Files to create/modify:**
- `src/app/app/saved-views.tsx` - NEW component for saved views UI
- `src/app/app/page.tsx` - MODIFY to integrate saved views component
- May need to modify `src/lib/ticket-list.ts` if filters need adjustment

**API Endpoints Available:**
- `GET /api/views` - Returns `{ views: SavedView[] }`
- `POST /api/views` - Body: `{ name: string, filters: FilterObject, isTeam?: boolean }`
- `PATCH /api/views/[id]` - Body: `{ name?: string, filters?: FilterObject }`
- `DELETE /api/views/[id]` - Deletes view

**Filter Structure (from API):**
```typescript
{
  status?: TicketStatus,
  priority?: TicketPriority,
  search?: string,
  category?: string,
  tagIds?: string[]
}
```

**SIMPLIFIED WORKFLOW:**
- Create saved-views component first
- Add save dialog functionality
- Implement view loading/applying filters
- Add edit/delete functionality
- Integrate with page.tsx
- Test in browser
- Commit when done

**ACCEPTANCE CRITERIA:**
- Saved views visible as tabs/dropdown above ticket list
- Can save current view with name
- Can load saved view (applies filters)
- Can edit view name
- Can delete view
- Works with existing filter system
- UI is clean and user-friendly

**WHEN READY TO COMMIT:**
- After UI works completely
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: add saved views UI"`
- Push and create PR with auto-merge

**IMPORTANT NOTES:**
- Backend is already complete - don't modify API endpoints
- Focus only on frontend UI
- Use existing patterns from codebase (check other components)
- Ensure filters from saved view map correctly to URL params
- Test with real data if possible
```

---

## 📝 FINAL COMMIT PROMPT (używaj po zakończeniu)

```
Jeśli po zakończeniu wszystkich zmian i wszystko działa, wykonaj:

### 1. Check & Commit
git status
pnpm lint && pnpm exec tsc --noEmit
git checkout -b feature/saved-views-ui
git add .
git commit -m "feat: add saved views UI"
git push origin feature/saved-views-ui

### 2. Create PR with AUTO-MERGE (RECOMMENDED)

**GitHub CLI (fastest):**
gh pr create --title "feat: add saved views UI" --body "Completes Prompt 15 - adds UI for saved views feature. Backend was already complete." --fill

**GitHub UI:**
1. Click "Compare & pull request"
2. Enable "Auto-merge" → "Squash and merge"
3. Create PR

**PR will auto-merge after CI passes! ✅**

**Commit format:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `perf:`
```

