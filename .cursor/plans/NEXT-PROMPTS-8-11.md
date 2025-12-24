# 🚀 Następne Prompty (8-11) - Po Zakończeniu 1-7

## ✅ Status: Prompty 1-7 Zakończone

**Wykonane:**
- PR #218: Email delivery
- PR #219: Tests & docs
- PR #220: Plan updates
- PR #221: Notification filters, dashboard polish, docs

---

## PROMPT 8: Agent 2 (Frontend) - Mobile Responsiveness Check

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Mobile Responsiveness Check & Improvements

**Status:** Application works on desktop but needs mobile responsiveness verification and improvements.

**YOUR MISSION:**
1. Test application on mobile viewport (use browser dev tools)
2. Check these areas:
   - Dashboard ticket list - cards stack properly?
   - Ticket detail page - forms readable?
   - Navigation - works on mobile?
   - Filters/search - usable on mobile?
   - Admin pages - tables scroll properly?
   - Forms - inputs accessible?
3. Fix any mobile issues:
   - Improve touch targets (buttons at least 44x44px)
   - Fix layout overflow issues
   - Improve spacing on mobile
   - Make tables horizontally scrollable if needed
   - Ensure filters collapse/stack properly

**SIMPLIFIED WORKFLOW:**
- Test in browser dev tools (mobile viewport)
- Fix issues as you find them
- Keep it simple - focus on major issues
- Commit when done

**ACCEPTANCE CRITERIA:**
- Application usable on mobile devices
- No horizontal scrolling issues
- Touch targets properly sized
- Forms readable and accessible

**WHEN READY TO COMMIT:**
- After mobile improvements
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: improve mobile responsiveness"`
- Push and create PR with auto-merge
```

---

## PROMPT 9: Agent 2 (Frontend) - Error Messages & UX Polish

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Error Messages & UX Polish

**Status:** Error handling exists but could be more user-friendly.

**YOUR MISSION:**
1. **Improve error messages:**
   - Make error toasts more helpful and user-friendly
   - Add context to error messages (what failed and why)
   - Use Polish language consistently
   - Show actionable messages when possible

2. **Loading states:**
   - Ensure all async operations show loading states
   - Improve loading indicators where needed
   - Add loading states to forms/buttons

3. **Empty states:**
   - Improve empty state messages
   - Add helpful CTAs in empty states

**SIMPLIFIED WORKFLOW:**
- Review current error handling
- Improve error messages
- Add missing loading states
- Polish empty states
- Commit when done

**ACCEPTANCE CRITERIA:**
- Error messages are helpful and user-friendly
- All async operations have loading states
- Empty states are informative

**WHEN READY TO COMMIT:**
- After improvements
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: improve error messages and UX polish"`
- Push and create PR with auto-merge
```

---

## PROMPT 10: Agent 3 (QA/Docs) - Accessibility Basics

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Accessibility Basics & Improvements

**Status:** Application needs basic accessibility improvements.

**YOUR MISSION:**
1. **Add ARIA labels:**
   - Add aria-label to buttons without visible text
   - Add aria-describedby to form inputs with errors
   - Add aria-live regions for dynamic content

2. **Keyboard navigation:**
   - Ensure all interactive elements are keyboard accessible
   - Test tab order
   - Add keyboard shortcuts where helpful

3. **Semantic HTML:**
   - Use proper heading hierarchy (h1, h2, h3)
   - Use semantic elements (nav, main, section)
   - Ensure forms have proper labels

4. **Focus indicators:**
   - Ensure focus rings are visible
   - Improve focus styles if needed

**SIMPLIFIED WORKFLOW:**
- Review code for accessibility issues
- Add ARIA labels and semantic HTML
- Test with keyboard navigation
- Keep it simple - focus on basics
- Commit when done

**ACCEPTANCE CRITERIA:**
- ARIA labels added where needed
- Keyboard navigation works
- Semantic HTML used properly
- Focus indicators visible

**WHEN READY TO COMMIT:**
- After accessibility improvements
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: add accessibility improvements"`
- Push and create PR with auto-merge
```

---

## PROMPT 11: Agent 1 (Backend) - Code Comments & Documentation

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Code Comments & Documentation

**Status:** Code works but complex functions need better documentation.

**YOUR MISSION:**
1. **Add code comments:**
   - Document complex functions
   - Add JSDoc comments to important functions
   - Explain business logic where needed
   - Keep it simple - just helpful comments

2. **API documentation:**
   - Ensure OpenAPI spec is up to date
   - Add descriptions to API endpoints
   - Document request/response schemas

3. **README updates:**
   - Update README with latest features
   - Ensure setup instructions are clear
   - Add any missing information

**SIMPLIFIED WORKFLOW:**
- Review code for complex functions
- Add helpful comments
- Update API docs
- Update README if needed
- Commit when done

**ACCEPTANCE CRITERIA:**
- Complex functions have comments
- API documentation is up to date
- README reflects current state

**WHEN READY TO COMMIT:**
- After documentation updates
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "docs: add code comments and update documentation"`
- Push and create PR with auto-merge
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

**Prompty 8-11 (wszystkie są proste/średnie - nie mega trudne):**

1. **Agent 2** - PROMPT 8 (Mobile) - prosty
2. **Agent 2** - PROMPT 9 (Error Messages) - prosty
3. **Agent 3** - PROMPT 10 (Accessibility) - prosty
4. **Agent 1** - PROMPT 11 (Code Comments) - prosty

**Możesz uruchomić równolegle:**
- Agent 2 może pracować na promptach 8 i 9 po kolei
- Agent 3 może pracować równolegle z Agent 2 (różne pliki)
- Agent 1 może pracować równolegle z Agent 2/3 (tylko komentarze/docs)

**Wszystkie są proste - żadnych mega trudnych rzeczy!**

