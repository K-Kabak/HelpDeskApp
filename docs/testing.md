# Testing Guide

This document provides comprehensive guidance on testing in the SerwisDesk application, including how to run tests, write new tests, understand test structure, and manage test data.

## Table of Contents

- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Mocking Guidelines](#mocking-guidelines)
- [Test Data Management](#test-data-management)
- [CI/CD Test Execution](#cicd-test-execution)

## Running Tests

### Unit and Integration Tests (Vitest)

Run all unit and integration tests:

```bash
pnpm test
```

Run tests in watch mode (useful during development):

```bash
pnpm test:watch
```

Run tests with coverage:

```bash
pnpm test -- --coverage
```

Run a specific test file:

```bash
pnpm test tests/ticket-search.test.ts
```

### End-to-End Tests (Playwright)

Run all E2E tests:

```bash
pnpm test:e2e
```

Run E2E tests in headed mode (see browser):

```bash
pnpm test:e2e --headed
```

Run a specific E2E test file:

```bash
pnpm test:e2e e2e/saved-views.spec.ts
```

Run E2E tests in debug mode:

```bash
pnpm test:e2e --debug
```

### Contract Tests

Run contract tests to verify API consistency:

```bash
pnpm test:contract
```

Contract tests verify that API endpoints match their expected contracts and behavior.

## Test Structure

### Directory Organization

```
tests/
├── test-utils/          # Shared test utilities and helpers
│   └── prisma-mocks.ts  # Prisma mocking utilities
├── contract/            # API contract tests
│   └── api-contract.test.ts
├── security/            # Security-focused tests
│   ├── input-validation.test.ts
│   └── rate-limiting.test.ts
└── [feature].test.ts    # Unit and integration tests for features

e2e/                     # End-to-end tests (Playwright)
├── saved-views.spec.ts
├── bulk-actions.spec.ts
├── admin-users.spec.ts
└── admin-teams.spec.ts
```

### Test Types

1. **Unit Tests**: Test individual functions and utilities in isolation
   - Location: `tests/[feature].test.ts`
   - Examples: `tests/automation-rules.test.ts`, `tests/ticket-search.test.ts`

2. **Integration Tests**: Test API endpoints with mocked dependencies
   - Location: `tests/[feature]-integration.test.ts`
   - Examples: `tests/admin-users-integration.test.ts`, `tests/sla-policies.route.test.ts`

3. **E2E Tests**: Test complete user workflows in a browser
   - Location: `e2e/[feature].spec.ts`
   - Examples: `e2e/saved-views.spec.ts`, `e2e/bulk-actions.spec.ts`

4. **Contract Tests**: Verify API contracts and consistency
   - Location: `tests/contract/api-contract.test.ts`

5. **Security Tests**: Test security features and vulnerabilities
   - Location: `tests/security/`
   - Examples: `tests/security/rate-limiting.test.ts`, `tests/security/input-validation.test.ts`

## Writing Tests

### Unit Test Example

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { validateTicketTitle } from "@/lib/validation";

describe("validateTicketTitle", () => {
  it("should accept valid titles", () => {
    expect(validateTicketTitle("Valid Title")).toBe(true);
  });

  it("should reject empty titles", () => {
    expect(validateTicketTitle("")).toBe(false);
  });
});
```

### Integration Test Example

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/tickets/route";
import { resetMockPrisma } from "../test-utils/prisma-mocks";

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findMany: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("GET /api/tickets", () => {
  beforeEach(() => {
    resetMockPrisma(mockPrisma);
  });

  it("should return tickets for authenticated user", async () => {
    // Test implementation
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test.describe("Ticket Creation", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.getByLabel("Email").fill("agent@serwisdesk.local");
    await page.getByLabel("Hasło").fill("Agent123!");
    await page.getByRole("button", { name: "Zaloguj" }).click();
    await page.waitForURL("/app");
  });

  test("should create a new ticket", async ({ page }) => {
    await page.goto("/app");
    // Test implementation
  });
});
```

### Test Naming Conventions

- Use descriptive test names that explain what is being tested
- Use `describe` blocks to group related tests
- Use `it` or `test` for individual test cases
- Follow the pattern: "should [expected behavior] when [condition]"

Example:
```typescript
describe("Ticket API", () => {
  it("should return 401 when user is not authenticated", async () => {
    // Test
  });

  it("should return tickets scoped to user's organization", async () => {
    // Test
  });
});
```

## Test Utilities

The `tests/test-utils/` directory contains shared utilities for writing tests. These utilities help reduce boilerplate and ensure consistency across test files.

### Prisma Mocks

The `tests/test-utils/prisma-mocks.ts` file provides utilities for mocking Prisma in tests.

#### MockPrisma Type

The `MockPrisma` type defines the structure for mock Prisma instances. It includes commonly used models and their methods:

- `ticket` - findMany, create, findUnique, update, groupBy, count
- `user` - findFirst, findUnique, findMany, create, update, delete
- `team` - findFirst, findUnique, findMany, create, update, delete
- `slaPolicy` - findFirst, findUnique, findMany, create, update, delete
- `comment` - create, findMany, findUnique
- `auditEvent` - create, findMany
- `automationRule` - findMany, findFirst, create, update, delete
- `category` - findUnique, findMany, create
- `tag` - findMany, findUnique
- `attachment` - findUnique, create, delete
- `notificationPreference` - findUnique, create, update
- `inAppNotification` - create, findMany, findUnique, update
- `csatResponse` - findUnique, create
- `adminAudit` - create, findMany
- `teamMembership` - createMany, deleteMany, findMany
- `slaEscalationLevel` - findMany
- `$transaction` - for transaction mocking

#### resetMockPrisma()

Resets all mocks in a Prisma mock object. Useful for `beforeEach` hooks to ensure test isolation.

```typescript
import { resetMockPrisma, type MockPrisma } from "../test-utils/prisma-mocks";

const mockPrisma: MockPrisma = vi.hoisted(() => ({
  ticket: {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  // ... other models as needed
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("My Test", () => {
  beforeEach(() => {
    resetMockPrisma(mockPrisma);
  });
});
```

#### createMockPrisma()

Creates a complete mock Prisma instance with all common models pre-configured. Useful as a starting point for tests that need multiple models.

```typescript
import { createMockPrisma, resetMockPrisma } from "../test-utils/prisma-mocks";

const mockPrisma = vi.hoisted(() => createMockPrisma(vi));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("My Test", () => {
  beforeEach(() => {
    resetMockPrisma(mockPrisma);
  });

  it("should work with all models", async () => {
    mockPrisma.ticket.findMany.mockResolvedValue([]);
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    // ... test implementation
  });
});
```

#### Best Practices

1. **Always use `vi.hoisted()`** for Prisma mocks to ensure they're available before module imports
2. **Use `resetMockPrisma()` in `beforeEach`** to ensure test isolation
3. **Type your mocks** with `MockPrisma` for better type safety and IDE support
4. **Only mock what you need** - you don't need to include all models if your test only uses a few
5. **Use `createMockPrisma()`** when you need many models to reduce boilerplate

### Vitest Setup

The `vitest.setup.ts` file configures global test settings:

- Imports `@testing-library/jest-dom` for DOM matchers
- Configures test environment (jsdom for React components)

### Test Configuration

- **Vitest config**: `vitest.config.ts`
  - Environment: `jsdom` for React component testing
  - Coverage thresholds: 70% for lines, functions, branches, statements
  - Setup file: `vitest.setup.ts`

- **Playwright config**: `playwright.config.ts`
  - Base URL: `http://localhost:3000`
  - Test directory: `./e2e`
  - Retries: 2 on CI, 0 locally

## Mocking Guidelines

### When to Mock

1. **External Dependencies**: Mock database (Prisma), external APIs, file system
2. **Authentication**: Mock session/auth for API route tests
3. **Time-dependent Code**: Mock dates/timers for time-sensitive tests
4. **Random Values**: Mock random generators for deterministic tests

### Mocking Prisma

Always use `vi.hoisted()` for Prisma mocks to ensure they're available before module imports:

```typescript
const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
```

### Mocking Authentication

For API route tests, mock the authorization module:

```typescript
const mockRequireAuth = vi.fn();

vi.mock("@/lib/authorization", () => ({
  requireAuth: mockRequireAuth,
  isSameOrganization: vi.fn(() => true),
}));

// In test
mockRequireAuth.mockResolvedValue({
  ok: true,
  user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
});
```

### Mocking Next.js APIs

For testing Next.js API routes, import the route handler directly:

```typescript
import { GET, POST } from "@/app/api/tickets/route";

// Create mock request
const req = new Request("http://localhost:3000/api/tickets");

// Call handler
const response = await GET(req);
```

### Reset Mocks

Always reset mocks in `beforeEach` to avoid test pollution:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  resetMockPrisma(mockPrisma);
});
```

## Test Data Management

### Demo Credentials

The application uses seeded demo credentials for testing:

- **Admin**: `admin@serwisdesk.local` / `Admin123!`
- **Agent**: `agent@serwisdesk.local` / `Agent123!`
- **Requester**: `requester@serwisdesk.local` / `Requester123!`

**⚠️ Security Note**: These credentials are for development/testing only. Change them in production!

### Seeding Test Data

The Prisma seed script (`prisma/seed.js`) creates:
- Demo organization
- Demo users (admin, agent, requester)
- Demo teams
- SLA policies
- Sample tickets and comments
- Audit events

Run seed:

```bash
pnpm prisma:seed
```

### Test Data Isolation

1. **Unit Tests**: Use mocks, no database required
2. **Integration Tests**: Use isolated test database or schema per test suite
3. **E2E Tests**: Use seeded database with cleanup between tests

### Creating Test Fixtures

For reusable test data, create factory functions:

```typescript
export function createMockTicket(overrides = {}) {
  return {
    id: "ticket-1",
    title: "Test Ticket",
    descriptionMd: "Test description",
    status: "NOWE",
    priority: "SREDNI",
    organizationId: "org-1",
    requesterId: "user-1",
    ...overrides,
  };
}
```

### Test Database Setup

For integration tests requiring a real database:

1. Use a separate test database (e.g., `helpdesk_test`)
2. Run migrations before tests: `pnpm prisma:migrate`
3. Seed minimal test data
4. Clean up after tests (transactions or truncate)

## CI/CD Test Execution

### GitHub Actions Workflow

The CI pipeline (`.github/workflows/ci.yml`) runs tests in the following order:

1. **Lint**: `pnpm lint` - Code style checks
2. **Typecheck**: `pnpm exec tsc --noEmit` - TypeScript validation
3. **OpenAPI Lint**: `pnpm openapi:lint` - API documentation validation
4. **Contract Tests**: `pnpm test:contract` - API contract verification

### Adding Test Jobs to CI

To add unit/integration and E2E tests to CI:

```yaml
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: helpdesk_test
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm prisma:generate
    - run: pnpm prisma:migrate deploy
    - run: pnpm test
    - run: pnpm test:e2e
```

### Test Coverage Reporting

Vitest can generate coverage reports:

```bash
pnpm test -- --coverage
```

Coverage reports are generated in:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format
- `coverage/coverage-final.json` - JSON format

### CI Test Environment Variables

Required environment variables for CI tests:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/ci
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000
CI=true
```

### Test Artifacts

On CI failure, upload test artifacts:

- Playwright traces: `playwright-report/`
- Test coverage: `coverage/`
- Screenshots: `test-results/`

## Best Practices

1. **Keep Tests Fast**: Unit tests should be fast (< 100ms each)
2. **Test Behavior, Not Implementation**: Focus on what the code does, not how
3. **Use Descriptive Names**: Test names should clearly describe what's being tested
4. **One Assertion Per Test**: When possible, test one thing per test case
5. **Clean Up**: Always clean up test data and reset mocks
6. **Test Edge Cases**: Don't just test happy paths
7. **Mock External Dependencies**: Don't rely on external services in tests
8. **Use TypeScript**: Leverage type safety in tests
9. **Group Related Tests**: Use `describe` blocks to organize tests
10. **Document Complex Tests**: Add comments for non-obvious test logic

## Troubleshooting

### Tests Failing Locally

1. **Check Database**: Ensure database is running and accessible
2. **Check Environment**: Verify `.env.local` has correct `DATABASE_URL`
3. **Run Migrations**: Ensure database schema is up to date: `pnpm prisma:migrate`
4. **Clear Cache**: Try clearing test cache: `pnpm test -- --no-cache`

### E2E Tests Failing

1. **Check Dev Server**: Ensure `pnpm dev` is running on port 3000
2. **Check Browser**: Ensure Playwright browsers are installed: `pnpm exec playwright install`
3. **Check Timeouts**: Increase timeout if tests are slow
4. **Check Selectors**: Verify UI selectors haven't changed

### Mock Issues

1. **Hoisting**: Ensure mocks use `vi.hoisted()` if needed before imports
2. **Reset**: Always reset mocks in `beforeEach`
3. **Type Safety**: Use `MockPrisma` type for Prisma mocks

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

