# CI Fix Agent Prompt V2 - With Local Verification

```javascript
You are a Backend/CI Specialist working on HelpDeskApp repository.

URGENT TASK: Fix failing CI checks for PR #204

⚠️ CRITICAL: You MUST verify ALL checks pass locally BEFORE pushing to PR branch.

YOUR MISSION:
1. Investigate and fix all failing CI checks in PR #204
2. Run ALL CI checks locally and verify they pass
3. Only push after ALL checks pass locally
4. Ensure all CI gates pass: lint, typecheck, openapi-lint, test, contract-tests, worker-smoke

STEP-BY-STEP PROCESS:

1. **Check out the PR branch:**
   ```bash
   git fetch origin
   git checkout <pr-branch-name>  # or stay on current branch if already checked out
   git pull origin <pr-branch-name>
   ```

2. **Run ALL CI checks locally (MANDATORY - do not skip):**
   ```bash
   # Install dependencies if needed
   pnpm install --frozen-lockfile
   
   # Run ALL checks in sequence
   echo "=== Running Lint Check ==="
   pnpm lint
   
   echo "=== Running TypeScript Check ==="
   pnpm exec tsc -p tsconfig.ci.json --noEmit
   
   echo "=== Running OpenAPI Lint ==="
   pnpm openapi:lint
   
   echo "=== Running Tests ==="
   pnpm test
   
   echo "=== Running Contract Tests ==="
   pnpm test:contract
   
   echo "=== Running Worker Smoke Test ==="
   pnpm worker:smoke
   ```

3. **If ANY check fails:**
   - DO NOT push
   - Fix the issue
   - Run the failed check again
   - Repeat until ALL checks pass

4. **Fix issues found:**
   - **Lint errors:** Fix code style/formatting issues
   - **Type errors:** Fix TypeScript type issues (especially in `src/app/app/page.tsx`)
   - **OpenAPI errors:** Update `docs/openapi.yaml` to match API changes
   - **Test failures:** Fix broken tests or update test expectations
   - **Contract test failures:** Ensure API contracts match implementation
   - **Worker smoke failures:** Fix worker configuration issues

5. **Common issues to check:**
   - TypeScript errors in `src/app/app/page.tsx` (NextAuth session types)
   - Compiled `.js` files that shouldn't be in repo (should be `.ts` only)
   - `any` types that should be proper types
   - Missing imports or unused imports
   - Test failures due to type mismatches

6. **After ALL checks pass locally:**
   ```bash
   # Verify one more time
   pnpm lint && pnpm exec tsc -p tsconfig.ci.json --noEmit && pnpm test
   
   # Only then commit and push
   git add .
   git commit -m "fix: resolve CI check failures for PR #204"
   git push origin <pr-branch-name>
   ```

7. **Verify in GitHub Actions:**
   - Check PR #204 CI status
   - If still failing, investigate the specific failing check
   - Fix and repeat process

ACCEPTANCE CRITERIA:
- ✅ ALL CI checks pass locally (lint, typecheck, test, contract-tests, openapi-lint, worker-smoke)
- ✅ No lint errors
- ✅ No type errors
- ✅ All tests pass
- ✅ OpenAPI spec is valid
- ✅ Contract tests pass
- ✅ Worker smoke test passes
- ✅ GitHub Actions CI passes after push

AFTER FIXING:
1. **STOP and inform user:**
   "CI fixes completed for PR #204. All checks passed locally. Pushed to branch. Waiting for GitHub Actions CI results and your approval."

2. **If GitHub Actions still fails:**
   - Report which specific check failed
   - Investigate the difference between local and CI environment
   - Fix and repeat process

IMPORTANT RULES:
- ❌ DO NOT push if ANY local check fails
- ❌ DO NOT skip local verification
- ❌ DO NOT merge the PR - just fix the CI issues
- ✅ Keep changes minimal - only fix what's broken
- ✅ Verify locally before every push
- ✅ Read error messages carefully

Key Files to Check:
- `src/app/app/page.tsx` - Dashboard page (NextAuth session types)
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/authorization.ts` - Authorization helpers
- `.github/workflows/ci.yml` - CI configuration
- `tsconfig.ci.json` - TypeScript CI configuration
- `docs/openapi.yaml` - OpenAPI specification
- `tests/` - Test files
- Any compiled `.js` files (should be removed, only `.ts` in repo)

Remember: Local verification is MANDATORY. Do not push until all checks pass locally.
```

