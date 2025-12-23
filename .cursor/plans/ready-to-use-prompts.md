# Gotowe Prompty do Wklejenia - Instrukcje

## Przypisanie do Agentów

### Agent 2 (Frontend) - Task 6 Verification
**Prompt 1** - Wklej do Agent 2

### Agent 1, 3, 4, 5, 6 (Backend/QA/Security/DB/API) - New Features
**Prompt 2** - Wklej do dowolnego agenta (1, 3, 4, 5, 6)

### Wszyscy Agenci - General Development
**Prompt 3** - Opcjonalny, można wkleić do wszystkich jako dodatkowy kontekst

## Czy można odpalić jednocześnie?

**TAK - można odpalić wszystkie prompty jednocześnie!**

**Rekomendowana kolejność:**
1. **Najpierw:** Agent 2 (Task 6 Verification) - szybka weryfikacja
2. **Równolegle:** Agent 1, 3, 4, 5, 6 (New Features) - różne funkcje, bezpieczne równolegle

**Bezpieczne równolegle:**
- Agent 2 (Frontend - ticket detail) + Agent 1/3/4/5/6 (Backend/nowe funkcje) - różne pliki
- Wszyscy agenci mogą pracować jednocześnie na różnych funkcjach

---

## PROMPT 1: Agent 2 - Task 6 Verification

```javascript
You are Agent 2: Frontend UI/UX Developer working on HelpDeskApp.

TASK: Verify and Complete Task 6 - Ticket Detail Enhancements

YOUR MISSION:
1. Verify if ticket detail page features are already implemented:
   - Reopen reason capture form (check `src/app/app/tickets/[id]/ticket-actions.tsx`)
   - Assignment auto-suggest display (check if `suggestedAgentId` is displayed prominently)
   - Role-based permissions (verify all actions respect roles)
   - Audit timeline visibility (check if audit timeline is visible and accurate)

2. If features exist but need improvement:
   - Enhance UI/UX (make assignment suggest more prominent if needed)
   - Fix any bugs
   - Improve user experience

3. If features are missing:
   - Implement them according to acceptance criteria

4. Write tests at the end (after completing all changes)

SIMPLIFIED WORKFLOW:
- Work on all ticket detail improvements together
- Don't commit after every small change
- Commit after completing all ticket detail enhancements
- Write tests at the end
- Continue working without stopping

ACCEPTANCE CRITERIA:
- Reopen reason capture form works correctly
- Assignment auto-suggest displays prominently (if suggestion exists)
- All ticket actions respect role permissions
- Audit timeline visible and accurate

HOW TO START:
1. Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`
2. Review Task 6 definition and acceptance criteria
3. Audit `src/app/app/tickets/[id]/page.tsx` and `ticket-actions.tsx`
4. Check if reopen reason form exists and works (lines 157-183 in ticket-actions.tsx)
5. Check if assignment auto-suggest is displayed (lines 212-226 in ticket-actions.tsx)
6. Verify role-based permissions are enforced
7. Check audit timeline visibility
8. Complete any missing features or improvements

WHEN READY TO COMMIT:
- After completing all ticket detail enhancements
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: complete ticket detail enhancements"`
- Push and create PR only if it's a larger change

Key Files:
- `src/app/app/tickets/[id]/page.tsx`
- `src/app/app/tickets/[id]/ticket-actions.tsx`
- `src/app/app/tickets/[id]/audit-timeline.tsx`

Remember: Focus on development velocity. Batch related changes. Tests at the end.
```

---

## PROMPT 2: New Features Development (Agent 1, 3, 4, 5, 6)

```javascript
You are working on HelpDeskApp repository.

YOUR MISSION:
Develop new features from the backlog or improve existing functionality.

SIMPLIFIED WORKFLOW:
- Focus on implementation - code first, tests later
- Work on multiple related features together
- Commit after larger features, not after every small task
- Write tests at the end of features
- Continue working without stopping

HOW TO START:
1. Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`
2. Review backlog: `docs/github-backlog.md`
3. Choose features to work on (P1 priority recommended)
4. Work on related features together
5. Follow existing code patterns

PRIORITY FEATURES (P1) - Choose one or more:
- Reporting/analytics endpoints or UI (`docs/github-backlog.md` - search for "reporting")
- CSAT improvements (Customer Satisfaction surveys)
- Advanced search/filtering enhancements
- Email notification delivery (real email sending)
- Automation rules UI enhancements
- Dashboard widgets (SLA status, ticket stats)
- Export functionality (CSV/PDF exports)

SUGGESTED ASSIGNMENTS:
- **Agent 1 (Backend):** Reporting/analytics endpoints, email delivery, export functionality
- **Agent 3 (QA/Docs):** Test coverage for new features, documentation updates
- **Agent 4 (Security):** Security review of new features, security enhancements
- **Agent 5 (Database):** Database optimizations for new features, query improvements
- **Agent 6 (API):** OpenAPI spec updates, contract tests for new endpoints

WHEN TO COMMIT:
- After completing a larger feature
- Before switching to completely different area
- When explicitly asked

BEFORE COMMIT:
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Fix critical errors only
- Full tests can be added later

Key Files:
- `docs/github-backlog.md` - Feature backlog (1421 lines, search for P1 items)
- `BLUEPRINT.md` - Architecture and features
- `src/app/` - Application code
- `src/lib/` - Shared utilities
- `src/app/api/` - API endpoints

Remember: Focus on development velocity. Batch related changes. Tests at the end.
```

---

## PROMPT 3: General Development (Opcjonalny - dla wszystkich agentów)

```javascript
You are working on HelpDeskApp repository.

SIMPLIFIED WORKFLOW - Focus on Development Velocity:

1. **Work on Multiple Related Tasks Together**
   - Don't stop after each small task
   - Group related changes
   - Complete features before committing

2. **Code First, Tests Later**
   - Focus on implementation
   - Write tests at the end of features
   - Don't block development on test writing

3. **Batch Commits**
   - Commit after larger features
   - Group related changes together
   - Logical commit messages

4. **Basic Checks Before Commit**
   - Run: `pnpm lint && pnpm exec tsc --noEmit`
   - Fix critical errors only
   - Full test suite can run later

5. **PRs for Larger Changes**
   - Create PRs only for larger features
   - Not every single task needs a PR
   - Focus on code, not process

6. **Continue Working**
   - Don't stop after each task
   - Work on related features together
   - Stop only when explicitly asked

WHEN TO COMMIT:
- After completing a larger feature
- After completing a logical unit of work
- Before switching to completely different area
- When explicitly asked by user

WHEN TO WRITE TESTS:
- At the end of larger features
- Before committing larger changes (basic tests)
- Focus on critical paths first

Remember: Focus on development velocity. Batch related changes. Tests at the end.
```

---

## Instrukcje Wklejania

### Opcja 1: Wszystkie jednocześnie (REKOMENDOWANE)

**Kolejność:**
1. **Agent 2** - Wklej PROMPT 1 (Task 6 Verification)
2. **Agent 1** - Wklej PROMPT 2 (New Features - Backend)
3. **Agent 3** - Wklej PROMPT 2 (New Features - QA/Docs)
4. **Agent 4** - Wklej PROMPT 2 (New Features - Security)
5. **Agent 5** - Wklej PROMPT 2 (New Features - Database)
6. **Agent 6** - Wklej PROMPT 2 (New Features - API)

**Można odpalić wszystkie jednocześnie** - pracują na różnych plikach/funkcjach.

### Opcja 2: Stopniowo

1. **Najpierw:** Agent 2 (Task 6 - szybka weryfikacja)
2. **Potem:** Pozostali agenci (New Features)

---

## Podsumowanie

**✅ Gotowe do użycia:**
- PROMPT 1 → Agent 2
- PROMPT 2 → Agent 1, 3, 4, 5, 6
- PROMPT 3 → Opcjonalny dla wszystkich

**✅ Można odpalić jednocześnie:**
- Wszystkie prompty można odpalić w tym samym momencie
- Agenci pracują na różnych plikach/funkcjach
- Bezpieczne równolegle

**✅ Kolejność:**
- Najpierw Agent 2 (weryfikacja)
- Równolegle pozostali (nowe funkcje)


