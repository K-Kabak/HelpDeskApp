# 🚀 Kolejne Proste Prompty - Po Agentach 1 i 3

## 📋 Po Zakończeniu Agentów 1 i 3

Te prompty są do wklejenia **po** zakończeniu pracy przez Agent 1 i Agent 3 oraz po użyciu FINAL COMMIT prompt.

**Wszystkie zadania są PROSTE - nie ma mega ciężkich rzeczy.**

---

## PROMPT 4: Agent 2 (Frontend) - Notification Center Filters

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Add Notification Center Filters

**Status:** Notification center exists but lacks filters for notification types. Simple UI improvement.

**YOUR MISSION:**
1. Add filter dropdown/buttons to `src/app/app/notifications/notifications-list.tsx`
2. Filter by notification types:
   - All (default)
   - Ticket Updates
   - Comments
   - Assignments
   - SLA Breaches
3. Update API call to support filtering (check `/api/notifications` endpoint - may need to add query param)
4. UI: Simple dropdown or filter buttons above notification list
5. Keep it simple - just basic filtering

**Files to modify:**
- `src/app/app/notifications/notifications-list.tsx` - add filter UI
- `/api/notifications/route.ts` - add type filter support if needed

**SIMPLIFIED WORKFLOW:**
- Add filter UI first
- Then add backend filter support if needed
- Test in browser
- Commit when done

**ACCEPTANCE CRITERIA:**
- Filter dropdown/buttons visible
- Filtering by type works
- UI is clean and simple

**WHEN READY TO COMMIT:**
- After filter works
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: add notification type filters"`
- Push and create PR with auto-merge
```

---

## PROMPT 5: Agent 2 (Frontend) - Simple Dashboard Polish

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Simple Dashboard Polish & Improvements

**Status:** Dashboard works but could use some polish. Simple improvements.

**YOUR MISSION (choose what to do):**
1. **Add refresh button** to dashboard (`src/app/app/page.tsx`)
   - Simple button to refresh data
   - Use router.refresh() or refetch data

2. **Improve mobile responsiveness**
   - Check dashboard on mobile viewport
   - Fix any layout issues
   - Ensure widgets stack properly

3. **Add simple tooltips** to KPI cards (`src/app/app/kpi-cards.tsx`)
   - Use native HTML title attribute or simple tooltip library
   - Keep it simple

4. **Improve loading states**
   - Better skeleton loaders
   - Smoother transitions

**SIMPLIFIED WORKFLOW:**
- Choose 1-2 improvements to work on
- Implement together
- Test in browser
- Commit when done

**ACCEPTANCE CRITERIA:**
- Improvements work
- No breaking changes
- UI looks better

**WHEN READY TO COMMIT:**
- After improvements work
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: improve dashboard polish"`
- Push and create PR with auto-merge
```

---

## PROMPT 6: Agent 2 (Frontend) - General UX Polish

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: General UX Polish & Improvements

**Status:** Application works but could use UX improvements. Simple polish tasks.

**YOUR MISSION (choose simple improvements):**
1. **Better error messages**
   - Improve error toast messages
   - Make them more user-friendly
   - Add helpful context

2. **Loading states**
   - Improve loading spinners
   - Add skeleton loaders where missing
   - Smoother transitions

3. **Accessibility basics**
   - Add ARIA labels to buttons
   - Improve keyboard navigation
   - Better focus indicators

4. **Mobile improvements**
   - Check forms on mobile
   - Improve touch targets
   - Better mobile menu if needed

**SIMPLIFIED WORKFLOW:**
- Work on 2-3 related improvements together
- Test in browser
- Keep it simple - don't over-engineer
- Commit when done

**ACCEPTANCE CRITERIA:**
- Improvements work
- No breaking changes
- Better user experience

**WHEN READY TO COMMIT:**
- After improvements work
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: improve UX polish"`
- Push and create PR with auto-merge
```

---

## PROMPT 7: Agent 3 (QA/Docs) - Final Documentation Update

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Final Documentation Update & Polish

**YOUR MISSION:**
1. **Review and update documentation:**
   - Ensure `BLUEPRINT.md` reflects current state
   - Update `docs/current-state.md` with latest features
   - Mark all completed items in `docs/github-backlog.md`

2. **README updates:**
   - Update README.md with latest features
   - Ensure setup instructions are clear
   - Add any missing environment variables

3. **Code comments:**
   - Add helpful comments to complex functions
   - Document API endpoints if missing
   - Keep it simple - just helpful comments

**SIMPLIFIED WORKFLOW:**
- Review docs
- Update what's needed
- Keep changes minimal
- Commit when done

**WHEN READY TO COMMIT:**
- After docs updated
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "docs: final documentation updates"`
- Push and create PR with auto-merge
```

---

## 📝 FINAL COMMIT PROMPT (używaj po każdym zadaniu)

**SKOPIUJ I WKLEJ NA KOŃCU KAŻDEGO PROMPTU:**

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

**Po zakończeniu Agentów 1 i 3:**

1. **Agent 2** - PROMPT 4 (Notification Filters) - najprostsze
2. **Agent 2** - PROMPT 5 (Dashboard Polish) - prosty
3. **Agent 2** - PROMPT 6 (UX Polish) - prosty
4. **Agent 3** - PROMPT 7 (Final Docs) - opcjonalnie

**Wszystkie są proste - żadnych mega ciężkich rzeczy!**

**Możesz uruchomić równolegle:**
- Agent 2 może pracować na różnych plikach, więc można uruchamiać prompty jeden po drugim lub równolegle jeśli różne obszary

