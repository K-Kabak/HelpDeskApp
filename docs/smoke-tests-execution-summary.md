# Smoke Tests Execution Summary

## Overview

Automated smoke tests have been created to verify all critical paths as specified in `docs/smoke-tests.md`. The tests are implemented using Playwright E2E testing framework.

## Created Files

1. **`e2e/smoke-tests.spec.ts`** - Comprehensive Playwright E2E tests covering all 6 critical smoke test scenarios:
   - Test 1: Application Health Check
   - Test 2: Login Functionality (All Roles)
   - Test 3: Ticket Creation
   - Test 4: Ticket Viewing and Filtering
   - Test 5: Comment Creation
   - Test 6: Basic Admin Functions

2. **Updated `package.json`** - Added `test:smoke` script for easy execution

## Prerequisites

Before running smoke tests, ensure:

1. **Database is running and migrated:**
   ```powershell
   docker compose up -d db
   pnpm prisma:migrate
   pnpm prisma:seed
   ```

2. **Environment variables are set:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - NextAuth secret key
   - `NEXTAUTH_URL` - Application URL (default: http://localhost:3000)
   - (Optional) `REDIS_URL` - Redis connection for worker
   - (Optional) `MINIO_ENDPOINT` - MinIO endpoint for storage

3. **Demo users exist in database:**
   - Admin: `admin@serwisdesk.local` / `Admin123!`
   - Agent: `agent@serwisdesk.local` / `Agent123!`
   - Requester: `requester@serwisdesk.local` / `Requester123!`

   These should be created by running `pnpm prisma:seed`.

## Running Smoke Tests

### Option 1: Using npm script (Recommended)

```powershell
pnpm test:smoke
```

This will:
- Automatically start the dev server (if not already running)
- Run all smoke tests
- Generate HTML report in `playwright-report/`

### Option 2: Using Playwright directly

```powershell
npx playwright test e2e/smoke-tests.spec.ts
```

### Option 3: Run specific test

```powershell
npx playwright test e2e/smoke-tests.spec.ts -g "Test 1: Application Health Check"
```

## Test Coverage

The smoke tests verify the following critical paths:

### ✅ Test 1: Application Health Check
- Health endpoint (`/api/health`) returns 200 OK
- Database connectivity is working
- Application loads in browser

### ✅ Test 2: Login Functionality
- All three user roles can login (Admin, Agent, Requester)
- Users are redirected to dashboard after login
- Logout works correctly

### ✅ Test 3: Ticket Creation
- Ticket creation form loads
- Form validation works
- Ticket is created successfully
- Ticket appears in ticket list
- Ticket detail page shows correct information

### ✅ Test 4: Ticket Viewing
- Ticket list loads with organization-scoped tickets
- Filters work (status, priority)
- Search works (if implemented)
- Ticket detail page loads correctly

### ✅ Test 5: Comment Creation
- Public comments can be created
- Internal comments can be created (by agents/admins)
- Internal comments are hidden from requesters
- Comment permissions are enforced

### ✅ Test 6: Basic Admin Functions
- Admin can access admin panel
- Admin pages load correctly
- Non-admin users are blocked from admin pages
- Organization scoping is enforced

## Expected Results

When all tests pass, you should see output similar to:

```
Running 6 tests using 3 workers

✓ [chromium] › e2e/smoke-tests.spec.ts:42:7 › Smoke Tests - Critical Paths › Test 1: Application Health Check (5.2s)
✓ [chromium] › e2e/smoke-tests.spec.ts:59:7 › Smoke Tests - Critical Paths › Test 2: Login Functionality - All Roles (12.3s)
✓ [chromium] › e2e/smoke-tests.spec.ts:84:7 › Smoke Tests - Critical Paths › Test 3: Ticket Creation (8.7s)
✓ [chromium] › e2e/smoke-tests.spec.ts:136:7 › Smoke Tests - Critical Paths › Test 4: Ticket Viewing and Filtering (6.1s)
✓ [chromium] › e2e/smoke-tests.spec.ts:184:7 › Smoke Tests - Critical Paths › Test 5: Comment Creation (10.4s)
✓ [chromium] › e2e/smoke-tests.spec.ts:262:7 › Smoke Tests - Critical Paths › Test 6: Basic Admin Functions (7.8s)

6 passed (50.5s)
```

## Troubleshooting

### Health Check Fails

If Test 1 (Health Check) fails:
- Verify database is running: `docker compose ps`
- Check database connection: `pnpm prisma migrate status`
- Verify `DATABASE_URL` environment variable is set correctly

### Login Tests Fail

If login tests fail:
- Verify demo users exist: Run `pnpm prisma:seed`
- Check password hashes are correct
- Verify `NEXTAUTH_SECRET` is set correctly
- Check application logs for authentication errors

### Tests Timeout

If tests timeout:
- Increase timeout in `playwright.config.ts`
- Check if application server is starting correctly
- Verify network connectivity
- Check for slow database queries

### Database Connection Errors

If you see database connection errors:
- Ensure PostgreSQL is running: `docker compose up -d db`
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Check database is accessible from host
- Run migrations: `pnpm prisma:migrate`

## Manual Verification

If automated tests cannot be run, refer to `docs/smoke-tests.md` for manual step-by-step verification procedures.

## Next Steps

After smoke tests pass:
1. Review test results in `playwright-report/`
2. Document any failures and their resolution
3. Update this document if test scenarios change
4. Consider adding smoke tests to CI/CD pipeline

## Related Documentation

- `docs/smoke-tests.md` - Detailed manual smoke test procedures
- `docs/production-readiness-checklist.md` - Production readiness verification
- `docs/deployment.md` - Deployment and verification guide
- `playwright.config.ts` - Playwright configuration

