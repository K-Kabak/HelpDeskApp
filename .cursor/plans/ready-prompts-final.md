# Gotowe Prompty do Wklejenia Agentom

## 📋 Status po Analizie Kodu

**✅ COMPLETED:**
- Task 6 (Ticket Detail Enhancements) - wszystkie funkcje zaimplementowane
- Reporting/Analytics - endpoints + UI
- CSAT - pełna implementacja
- Export (CSV) - tickets + comments
- Automation Rules UI - full CRUD
- Dashboard Widgets - KPI cards + SLA status widgets

**🔄 REMAINING (P1):**
- Real Email Notification Delivery - EmailAdapterReal używa console.log zamiast nodemailer

---

## 🚀 PROMPT 1: Agent 1 (Backend) - Real Email Delivery

```
[Wklej zawartość .cursor/plans/master-agent-prompt.md]

---

## TASK: Implement Real Email Notification Delivery

**Status:** EmailAdapterReal exists but uses console.log instead of real SMTP sending

**YOUR MISSION:**
1. Install nodemailer package: `pnpm add nodemailer` and `pnpm add -D @types/nodemailer`
2. Implement real email sending in `src/lib/email-adapter-real.ts`
   - Replace console.log (line 74) with actual nodemailer implementation
   - Use commented example (lines 48-71) as reference
   - Configure transporter with SMTP settings from constructor
   - Send HTML emails (convert body to HTML if needed)
   - Handle errors properly
   - Return proper email ID from nodemailer response
3. Test email sending:
   - Ensure EMAIL_ENABLED=true in .env
   - Configure SMTP settings (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM)
   - Test with real SMTP server or mock
4. Update tests if needed (check `tests/email-adapter.test.ts`)
5. Update documentation if email configuration changed

**Files to modify:**
- `src/lib/email-adapter-real.ts` - implement real sending
- `package.json` - nodemailer dependencies (already handled in step 1)

**SIMPLIFIED WORKFLOW:**
- Work on implementation
- Test locally with SMTP server
- Commit after completing implementation
- Write tests if needed (at the end)

**ACCEPTANCE CRITERIA:**
- nodemailer installed
- EmailAdapterReal sends real emails via SMTP
- Errors handled gracefully
- Existing tests still pass
- Email sending works with EMAIL_ENABLED=true

**HOW TO START:**
1. Read `src/lib/email-adapter-real.ts` - understand current implementation
2. Check commented nodemailer example in the file
3. Install nodemailer package
4. Implement real sending method
5. Test locally
6. Run: `pnpm lint && pnpm exec tsc --noEmit`
7. Commit changes

**WHEN READY TO COMMIT:**
- After completing implementation and testing
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: implement real email sending with nodemailer"`
- Push and create PR with auto-merge
```

---

## 🚀 PROMPT 2: Agent 2 (Frontend) - Optional Improvements

```
[Wklej zawartość .cursor/plans/master-agent-prompt.md]

---

## TASK: Optional Frontend Improvements

**Status:** All major frontend features are complete. Optional improvements available.

**YOUR MISSION:**
Choose one or more optional improvements:

1. **Dashboard Enhancements**
   - Improve SLA widgets styling/layout
   - Add tooltips to KPI cards
   - Add refresh button for real-time updates
   - Enhance responsive design

2. **Ticket Detail UI Polish**
   - Improve assignment suggestion UI prominence
   - Better visual hierarchy in ticket actions
   - Enhance audit timeline display

3. **Reports UI Enhancements**
   - Add more chart types
   - Improve date range selector
   - Add export buttons to reports page

4. **Notification Center**
   - Add filters for notification types (mentioned as pending)
   - Improve empty states
   - Add mark all as read

5. **General UX Improvements**
   - Loading states improvements
   - Error messages polish
   - Accessibility improvements
   - Mobile responsiveness

**SIMPLIFIED WORKFLOW:**
- Choose improvements to work on
- Implement multiple related improvements together
- Test in browser
- Commit after completing group of improvements

**WHEN READY TO COMMIT:**
- After completing improvements
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: improve [description of improvements]"`
- Push and create PR with auto-merge
```

---

## 🚀 PROMPT 3: Agent 3 (QA/Documentation) - Test & Docs Updates

```
[Wklej zawartość .cursor/plans/master-agent-prompt.md]

---

## TASK: Test Coverage & Documentation Updates

**YOUR MISSION:**
1. **Test Coverage:**
   - Review test coverage for email adapter
   - Add tests for real email sending (mock nodemailer)
   - Ensure all new features have tests
   - Run test suite and fix any failures

2. **Documentation Updates:**
   - Update `BLUEPRINT.md` gap analysis (mark completed features)
   - Update `docs/current-state.md` with latest implementations
   - Mark completed backlog items in `docs/github-backlog.md`
   - Update README if needed

3. **Contract Tests:**
   - Ensure OpenAPI spec is up to date
   - Run contract tests
   - Fix any contract test failures

**SIMPLIFIED WORKFLOW:**
- Work on tests and docs together
- Focus on critical paths first
- Commit after completing logical groups

**WHEN READY TO COMMIT:**
- After completing tests/docs updates
- Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
- Commit: `git commit -m "test: add email adapter tests and update docs"`
- Push and create PR with auto-merge
```

---

## 📝 FINAL COMMIT PROMPT (dla wszystkich agentów)

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

## 🎯 Rekomendacja Uruchomienia

**Priorytet:**
1. **Agent 1** - Real Email Delivery (jedyna rzecz która została - P1)
2. **Agent 2** - Opcjonalne UI improvements (jeśli chcesz)
3. **Agent 3** - Test & Docs updates (dobra praktyka)

**Można uruchomić:**
- Agent 1 + Agent 3 równolegle (różne pliki)
- Agent 2 może pracować równolegle lub później

