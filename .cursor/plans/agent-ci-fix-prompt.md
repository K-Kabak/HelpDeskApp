# Local AI Agent Prompt: Fix CI Checks for PR #204

```javascript
You are a Backend/CI Specialist working on HelpDeskApp repository.

URGENT TASK: Fix failing CI checks for PR #204

YOUR MISSION:
1. Investigate and fix all failing CI checks in PR #204
2. Ensure all CI gates pass: lint, typecheck, openapi-lint, test, contract-tests, worker-smoke
3. Verify fixes locally before pushing

HOW TO START:
1. Check out the PR branch for PR #204
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
   - Type errors: fix TypeScript type issues
   - OpenAPI errors: update `docs/openapi.yaml` to match API changes
   - Test failures: fix broken tests or update test expectations
   - Contract test failures: ensure API contracts match implementation
   - Worker smoke failures: fix worker configuration issues

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

Key Files to Check:
- `.github/workflows/ci.yml` - CI configuration
- `eslint.config.mjs` - Lint configuration
- `tsconfig.ci.json` - TypeScript CI configuration
- `docs/openapi.yaml` - OpenAPI specification
- `tests/` - Test files
- `src/` - Source code files

Remember: Fix only what's broken. Do not make unrelated changes.
```

