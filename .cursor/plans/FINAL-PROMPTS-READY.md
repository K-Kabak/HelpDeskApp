# ✅ GOTOWE PROMPTY DO WKLEJENIA - SKOPIUJ JEDNYM KLIKNIĘCIEM

## 📊 Status po Analizie Kodu

**✅ WSZYSTKO ZROBIONE oprócz:**
- Real Email Notification Delivery (EmailAdapterReal używa console.log - potrzebuje nodemailer)

---

## 🚀 PROMPT 1: Agent 1 (Backend) - Real Email Delivery

**SKOPIUJ CAŁOŚĆ PONIŻEJ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Implement Real Email Notification Delivery

**Status:** EmailAdapterReal exists but uses console.log instead of real SMTP sending. This is the LAST remaining P1 task.

**YOUR MISSION:**
1. Install nodemailer: `pnpm add nodemailer` and `pnpm add -D @types/nodemailer`
2. Implement real email sending in `src/lib/email-adapter-real.ts`:
   - Replace console.log (around line 74) with actual nodemailer implementation
   - Use the commented example in the file (lines 48-71) as reference
   - Configure transporter with SMTP settings from constructor
   - Send emails (HTML or text based on body parameter)
   - Handle errors properly (try/catch)
   - Return proper email ID from nodemailer response (use messageId or generate UUID)
3. Test email sending:
   - Ensure EMAIL_ENABLED=true in .env.local
   - Configure SMTP settings: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
   - Test with real SMTP server or use nodemailer test account
4. Update tests if needed (check `tests/email-adapter.test.ts` for existing tests)
5. Run checks: `pnpm lint && pnpm exec tsc --noEmit`

**Files to modify:**
- `src/lib/email-adapter-real.ts` - main implementation
- `package.json` - dependencies (already handled in step 1)

**ACCEPTANCE CRITERIA:**
- ✅ nodemailer installed in package.json
- ✅ EmailAdapterReal.send() sends real emails via SMTP
- ✅ Errors handled gracefully (logged, not thrown to caller)
- ✅ Existing tests still pass
- ✅ Email sending works when EMAIL_ENABLED=true

**HOW TO START:**
1. Read `src/lib/email-adapter-real.ts` to understand current structure
2. Check the commented nodemailer example (lines 48-71)
3. Install nodemailer: `pnpm add nodemailer @types/nodemailer -D`
4. Replace the console.log implementation with real nodemailer code
5. Test locally with SMTP settings
6. Run checks and commit

**SIMPLIFIED WORKFLOW:**
- Focus on implementation first
- Test locally after implementation
- Write/update tests at the end if needed
- Commit after completing everything

**WHEN READY TO COMMIT:**
- After implementation works and tests pass
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: implement real email sending with nodemailer"`
- Push and create PR with auto-merge enabled
```

---

## 🚀 PROMPT 2: Agent 3 (QA/Documentation) - Test & Docs Updates

**SKOPIUJ CAŁOŚĆ PONIŻEJ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Test Coverage & Documentation Updates

**YOUR MISSION:**
1. **Test Coverage for Email Adapter:**
   - Review `tests/email-adapter.test.ts` - check existing tests
   - Add tests for real email sending (mock nodemailer transporter)
   - Ensure email adapter tests cover success and error cases
   - Run test suite: `pnpm test`

2. **Documentation Updates:**
   - Update `BLUEPRINT.md` gap analysis - mark email delivery as complete after Agent 1 finishes
   - Update `docs/current-state.md` - document email sending implementation
   - Mark completed backlog items in `docs/github-backlog.md`:
     - Task 6 (Ticket Detail Enhancements) - ✅
     - Reporting/Analytics - ✅
     - CSAT - ✅
     - Export functionality - ✅
     - Automation Rules UI - ✅
     - Dashboard Widgets - ✅
   - Update README.md if email configuration section needs changes

3. **Contract Tests:**
   - Ensure OpenAPI spec is up to date with all endpoints
   - Run: `pnpm openapi:lint`
   - Run contract tests: `pnpm test:contract`
   - Fix any failures

**SIMPLIFIED WORKFLOW:**
- Work on tests and docs together
- Focus on critical paths first (email adapter tests)
- Commit after completing logical groups

**ACCEPTANCE CRITERIA:**
- ✅ Email adapter has proper test coverage
- ✅ Documentation reflects current state
- ✅ Backlog items marked complete
- ✅ OpenAPI spec up to date
- ✅ Contract tests pass

**WHEN READY TO COMMIT:**
- After completing tests and docs updates
- Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
- Commit: `git commit -m "test: add email adapter tests and update documentation"`
- Push and create PR with auto-merge enabled
```

---

## 🚀 PROMPT 3: Agent 2 (Frontend) - Optional UI Improvements

**SKOPIUJ CAŁOŚĆ PONIŻEJ (opcjonalnie):**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Optional Frontend Improvements

**Status:** All major frontend features are complete. This is OPTIONAL work for polish/improvements.

**YOUR MISSION (choose what to work on):**

1. **Notification Center Filters** (mentioned as pending in Task 5):
   - Add filters for notification types in `src/app/app/notifications/notifications-list.tsx`
   - Filter by: ticketUpdate, commentUpdate, assignment, slaBreach, etc.
   - UI: Add dropdown or filter buttons
   - Update API call to support filtering (check `/api/notifications` endpoint)

2. **Dashboard Polish:**
   - Improve SLA widgets styling/layout in `src/app/app/page.tsx`
   - Add tooltips to KPI cards in `src/app/app/kpi-cards.tsx`
   - Add refresh button for real-time updates
   - Enhance responsive design for mobile

3. **General UX Improvements:**
   - Loading states improvements across components
   - Better error messages
   - Accessibility improvements (ARIA labels, keyboard navigation)
   - Mobile responsiveness polish

**SIMPLIFIED WORKFLOW:**
- Choose improvements you want to work on
- Implement multiple related improvements together
- Test in browser
- Commit after completing group of improvements

**WHEN READY TO COMMIT:**
- After completing improvements
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Test in browser
- Commit: `git commit -m "feat: improve [description of improvements]"`
- Push and create PR with auto-merge enabled
```

---

## 📝 FINAL COMMIT PROMPT (dla wszystkich agentów po zakończeniu pracy)

**SKOPIUJ I WKLEJ NA KOŃCU PRACY KAŻDEGO AGENTA:**

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

## 🎯 REKOMENDACJA URUCHOMIENIA

**Priorytet:**
1. **Agent 1** - Real Email Delivery ⭐ (JEDYNA pozostała rzecz P1)
2. **Agent 3** - Test & Docs (dobra praktyka, może równolegle z Agent 1)
3. **Agent 2** - Optional UI improvements (opcjonalnie, jeśli chcesz)

**Można uruchomić równolegle:**
- Agent 1 + Agent 3 (różne pliki, brak konfliktów)

