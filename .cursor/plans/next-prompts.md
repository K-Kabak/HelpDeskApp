# Next Steps & Prompts for Agents

## Current Status

**✅ Completed Tasks:**
- Task 1-5, 7-10: All completed
- PR #204: CI fixes resolved

**🔄 Remaining:**
- Task 6: Verify ticket detail enhancements (may already be complete)

## Next Prompts

### 1. Task 6 Verification Prompt (Agent 2 - Frontend)

```javascript
You are Agent 2: Frontend UI/UX Developer working on HelpDeskApp.

TASK: Verify and Complete Task 6 - Ticket Detail Enhancements

YOUR MISSION:
1. Verify if ticket detail page features are already implemented:
   - Reopen reason capture form (check `src/app/app/tickets/[id]/ticket-actions.tsx`)
   - Assignment auto-suggest display (check if `suggestedAgentId` is displayed)
   - Role-based permissions (verify all actions respect roles)
   - Audit timeline visibility (check if audit timeline is visible)

2. If features exist but need improvement:
   - Enhance UI/UX
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
- Reopen reason capture form works
- Assignment auto-suggest displays prominently
- All ticket actions respect role permissions
- Audit timeline visible and accurate

HOW TO START:
1. Read the plan file at `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`
2. Review Task 6 definition and acceptance criteria
3. Audit `src/app/app/tickets/[id]/page.tsx` and `ticket-actions.tsx`
4. Check if reopen reason form exists and works
5. Check if assignment auto-suggest is displayed
6. Verify role-based permissions
7. Complete any missing features or improvements

WHEN READY TO COMMIT:
- After completing all ticket detail enhancements
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: complete ticket detail enhancements"`
- Push and create PR only if it's a larger change

Key Files:
- `src/app/app/tickets/[id]/page.tsx`
- `src/app/app/tickets/[id]/ticket-actions.tsx`
- `src/app/app/tickets/[id]/audit-timeline.tsx`
```

### 2. New Features Development Prompt (Any Agent)

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

PRIORITY FEATURES (P1):
- Reporting/analytics endpoints or UI
- CSAT improvements
- Advanced search/filtering
- Email notification delivery
- Automation rules UI enhancements
- Dashboard widgets

WHEN TO COMMIT:
- After completing a larger feature
- Before switching to completely different area
- When explicitly asked

BEFORE COMMIT:
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Fix critical errors only
- Full tests can be added later

Key Files:
- `docs/github-backlog.md` - Feature backlog
- `BLUEPRINT.md` - Architecture and features
- `src/app/` - Application code
- `src/lib/` - Shared utilities
```

### 3. General Development Prompt (All Agents)

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

## Recommended Next Steps

1. **First:** Task 6 Verification (Agent 2) - Verify ticket detail enhancements
2. **Then:** New Features Development - Work on P1 features from backlog
3. **Parallel:** Multiple agents can work on different features simultaneously

## Features to Consider (from backlog)

**P1 Priority:**
- Reporting/analytics endpoints
- CSAT improvements
- Email notification delivery
- Advanced search/filtering
- Dashboard widgets
- Automation rules UI enhancements

**P2 Priority (later):**
- Localization framework
- Advanced security features
- Performance optimizations
- Export scheduling
- Metrics/alerting













