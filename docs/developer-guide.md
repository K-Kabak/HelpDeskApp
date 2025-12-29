# Developer Guide - SerwisDesk

This guide provides technical documentation for developers working on the SerwisDesk application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Adding New API Endpoints](#adding-new-api-endpoints)
4. [Adding New Pages](#adding-new-pages)
5. [Adding New Components](#adding-new-components)
6. [Code Patterns and Conventions](#code-patterns-and-conventions)
7. [Testing Guidelines](#testing-guidelines)
8. [Best Practices](#best-practices)
9. [Database Migrations](#database-migrations)
10. [Authentication and Authorization](#authentication-and-authorization)
11. [Error Handling](#error-handling)
12. [Logging](#logging)

---

## Architecture Overview

### Technology Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js with JWT sessions and Prisma adapter
- **Database:** PostgreSQL with Prisma ORM
- **Background Jobs:** BullMQ with Redis
- **File Storage:** MinIO (S3-compatible)
- **State Management:** React Query (TanStack Query)
- **Form Handling:** React Hook Form with Zod validation
- **UI Components:** Custom components with Tailwind CSS
- **Notifications:** Sonner (toast notifications)

### Architecture Patterns

#### Server-Side Rendering (SSR)
- Pages are server-rendered by default using Next.js App Router
- Server components fetch data directly from Prisma
- Client components are used for interactivity (forms, state management)

#### API Routes
- REST-like API endpoints under `src/app/api/`
- Each route handler is a separate file with HTTP method exports (GET, POST, PATCH, DELETE)
- Authentication required for all protected routes

#### Data Access Layer
- Prisma ORM for all database operations
- Single Prisma client instance (`@/lib/prisma`)
- Organization-scoped queries for multi-tenancy

#### Authentication Flow
1. User submits credentials via login form
2. NextAuth credentials provider validates against database
3. JWT token created with role and organizationId claims
4. Session stored in HTTP-only cookie
5. Middleware protects `/app/*` routes

---

## Project Structure

```
HelpDeskApp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API route handlers
│   │   │   ├── tickets/        # Ticket endpoints
│   │   │   ├── admin/          # Admin endpoints
│   │   │   └── auth/           # NextAuth handler
│   │   ├── app/                # Authenticated pages
│   │   │   ├── admin/          # Admin panel pages
│   │   │   ├── tickets/        # Ticket pages
│   │   │   └── page.tsx        # Dashboard
│   │   ├── login/              # Login page
│   │   ├── layout.tsx          # Root layout
│   │   └── providers.tsx       # React Query provider
│   ├── components/             # Shared UI components
│   ├── lib/                    # Utility functions
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── prisma.ts           # Prisma client
│   │   ├── authorization.ts    # Auth helpers
│   │   └── ...
│   └── types/                  # TypeScript types
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.js                 # Seed script
├── tests/                      # Unit/integration tests
├── e2e/                        # E2E tests (Playwright)
└── docs/                       # Documentation
```

---

## Adding New API Endpoints

### Step 1: Create Route File

Create a new file in `src/app/api/` following the Next.js App Router convention:

```typescript
// src/app/api/example/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorization";
import { z } from "zod";

// Define request schema
const createSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});

// GET handler
export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Your logic here
  return NextResponse.json({ data: [] });
}

// POST handler
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Your logic here
  return NextResponse.json({ success: true });
}
```

### Step 2: Add Authentication

Always use `requireAuth()` for protected endpoints:

```typescript
import { requireAuth } from "@/lib/authorization";

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  
  // auth.user contains: { id, role, organizationId }
}
```

### Step 3: Add Authorization

Check user role and organization:

```typescript
import { requireAuth, isAgentOrAdmin, isSameOrganization } from "@/lib/authorization";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Check role
  if (!isAgentOrAdmin(auth.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check organization
  const resource = await prisma.resource.findUnique({
    where: { id: params.id },
  });

  if (!isSameOrganization(auth.user, resource.organizationId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete resource
}
```

### Step 4: Add Validation

Use Zod for request validation:

```typescript
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

export async function PATCH(req: Request) {
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
}
```

### Step 5: Add Rate Limiting

Use rate limiting for mutation endpoints:

```typescript
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const logger = createRequestLogger({
    route: "/api/example",
    method: "POST",
    userId: auth.user.id,
  });

  const rate = checkRateLimit(req, "example:create", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;
}
```

### Step 6: Add Logging

Log important events:

```typescript
import { createRequestLogger } from "@/lib/logger";

export async function POST(req: Request) {
  const logger = createRequestLogger({
    route: "/api/example",
    method: "POST",
    userId: auth.user.id,
  });

  logger.info("example.create.success", { id: result.id });
  logger.warn("example.create.validation_failed");
  logger.error("example.create.database_error", { error: err.message });
}
```

### Step 7: Update OpenAPI Specification

Add your endpoint to `docs/openapi.yaml`:

```yaml
/api/example:
  get:
    summary: List examples
    security:
      - bearerAuth: []
    responses:
      200:
        description: Success
      401:
        description: Unauthorized
```

---

## Adding New Pages

### Server Component Page

Create a page file in `src/app/app/`:

```typescript
// src/app/app/example/page.tsx
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ExamplePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch data
  const data = await prisma.example.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Example Page</h1>
      {/* Render data */}
    </div>
  );
}
```

### Dynamic Route Page

For dynamic routes, use `[id]` folder:

```typescript
// src/app/app/example/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function ExampleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const item = await prisma.example.findUnique({
    where: { id: params.id },
  });

  if (!item || item.organizationId !== session.user.organizationId) {
    return notFound();
  }

  return <div>{/* Render item */}</div>;
}
```

### Client Component Page

If you need interactivity, create a client component:

```typescript
// src/app/app/example/page.tsx
import ExampleClient from "./example-client";

export default async function ExamplePage() {
  // Server-side data fetching
  const initialData = await fetchData();
  
  return <ExampleClient initialData={initialData} />;
}
```

```typescript
// src/app/app/example/example-client.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ExampleClient({ initialData }: { initialData: any }) {
  const [state, setState] = useState(initialData);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/example", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["example"] });
    },
  });

  return <div>{/* Your UI */}</div>;
}
```

---

## Adding New Components

### Shared Component

Create reusable components in `src/components/`:

```typescript
// src/components/example-button.tsx
import { ButtonHTMLAttributes } from "react";

interface ExampleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export function ExampleButton({
  variant = "primary",
  loading = false,
  children,
  ...props
}: ExampleButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded ${
        variant === "primary"
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-800"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
```

### Page-Specific Component

Create components in the same directory as the page:

```typescript
// src/app/app/example/example-form.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ExampleForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Submit logic
      toast.success("Success!");
    } catch (error) {
      toast.error("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

---

## Code Patterns and Conventions

### File Naming

- **Pages:** `page.tsx`, `layout.tsx`
- **API Routes:** `route.ts`
- **Components:** `kebab-case.tsx` (e.g., `ticket-form.tsx`)
- **Utilities:** `kebab-case.ts` (e.g., `ticket-list.ts`)

### TypeScript

- Use TypeScript for all files
- Define interfaces/types in `src/types/` or at the top of files
- Use Prisma types: `import { Ticket, User } from "@prisma/client"`
- Use type assertions sparingly; prefer type guards

### Import Order

1. React/Next.js imports
2. Third-party libraries
3. Internal utilities (`@/lib/*`)
4. Components (`@/components/*`)
5. Types
6. Relative imports

```typescript
import { useState } from "react";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { ExampleButton } from "@/components/example-button";
import type { Ticket } from "@prisma/client";
```

### Error Handling Pattern

```typescript
try {
  const result = await operation();
  return NextResponse.json({ data: result });
} catch (error) {
  logger.error("operation.failed", { error: error.message });
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

### Organization Scoping Pattern

Always scope queries by organization:

```typescript
const items = await prisma.item.findMany({
  where: {
    organizationId: auth.user.organizationId,
    // Additional filters
  },
});
```

### Transaction Pattern

Use transactions for multi-step operations:

```typescript
const result = await prisma.$transaction(async (tx) => {
  const item = await tx.item.create({ data: {...} });
  await tx.auditEvent.create({
    data: {
      action: "ITEM_CREATED",
      actorId: auth.user.id,
      // ...
    },
  });
  return item;
});
```

---

## Testing Guidelines

### Unit Tests

Create unit tests in `tests/` directory:

```typescript
// tests/example.test.ts
import { describe, it, expect } from "vitest";
import { exampleFunction } from "@/lib/example";

describe("exampleFunction", () => {
  it("should return expected result", () => {
    const result = exampleFunction("input");
    expect(result).toBe("expected");
  });
});
```

### Integration Tests

Test API endpoints:

```typescript
// tests/api/example.test.ts
import { describe, it, expect } from "vitest";
import { createTestServer } from "@/tests/test-utils";

describe("GET /api/example", () => {
  it("should return 401 when not authenticated", async () => {
    const res = await fetch("/api/example");
    expect(res.status).toBe(401);
  });

  it("should return data when authenticated", async () => {
    const session = await createTestSession();
    const res = await fetch("/api/example", {
      headers: { Cookie: `next-auth.session-token=${session.token}` },
    });
    expect(res.status).toBe(200);
  });
});
```

### E2E Tests

Use Playwright for E2E tests:

```typescript
// e2e/example.spec.ts
import { test, expect } from "@playwright/test";

test("should create example", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');
  
  await page.goto("/app/example");
  await page.click("text=Create");
  // ... test flow
});
```

### Running Tests

```bash
# Unit/integration tests
pnpm test

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e

# Contract tests
pnpm test:contract
```

---

## Best Practices

### Security

1. **Always validate input** with Zod schemas
2. **Always check authentication** with `requireAuth()`
3. **Always scope by organization** in database queries
4. **Sanitize user input** (especially Markdown content)
5. **Use rate limiting** for mutation endpoints
6. **Log security events** (failed logins, unauthorized access)
7. **Never expose sensitive data** in error messages

### Performance

1. **Use database indexes** for frequently queried fields
2. **Implement pagination** for large lists
3. **Use cursor-based pagination** for better performance
4. **Cache frequently accessed data** (React Query)
5. **Optimize database queries** (avoid N+1 queries)
6. **Use server components** when possible (less JavaScript)

### Error Handling

1. **Return appropriate HTTP status codes**
   - 200: Success
   - 201: Created
   - 400: Bad Request (validation errors)
   - 401: Unauthorized (not authenticated)
   - 403: Forbidden (not authorized)
   - 404: Not Found
   - 500: Internal Server Error

2. **Provide clear error messages** (but don't expose internals)
3. **Log errors** with context
4. **Handle Prisma errors** gracefully

### Code Quality

1. **Follow TypeScript strict mode**
2. **Use ESLint** and fix all warnings
3. **Write self-documenting code** (clear variable names)
4. **Add JSDoc comments** for complex functions
5. **Keep functions small** and focused
6. **Avoid code duplication** (extract shared logic)

### Database

1. **Always use Prisma** (never raw SQL unless necessary)
2. **Use transactions** for multi-step operations
3. **Create indexes** for foreign keys and frequently queried fields
4. **Use migrations** for schema changes (never edit migrations)
5. **Test migrations** in development before production

---

## Database Migrations

### Creating a Migration

1. **Modify `prisma/schema.prisma`** with your changes
2. **Create migration:**
   ```bash
   pnpm prisma migrate dev --name descriptive_name
   ```
3. **Review the generated SQL** in `prisma/migrations/`
4. **Test the migration** locally
5. **Commit both schema and migration files**

### Migration Best Practices

1. **Never edit existing migrations** - create new ones
2. **Make migrations reversible** when possible
3. **Add indexes** for performance
4. **Use safe defaults** for new columns
5. **Test migrations** on a copy of production data

### Applying Migrations

**Development:**
```bash
pnpm prisma migrate dev
```

**Production:**
```bash
pnpm prisma migrate deploy
```

### Rollback Strategy

1. **Prefer forward fixes** - create a new migration to fix issues
2. **Emergency rollback:**
   - Restore database from backup
   - Mark bad migration as applied: `prisma migrate resolve --applied <migration_name>`
   - Document the incident

### Example Migration

```prisma
// prisma/schema.prisma
model Example {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```bash
pnpm prisma migrate dev --name add_example_table
```

---

## Authentication and Authorization

### Authentication Flow

1. User submits credentials via `/login`
2. NextAuth credentials provider validates
3. JWT token created with `role` and `organizationId`
4. Session stored in HTTP-only cookie
5. Middleware protects `/app/*` routes

### Checking Authentication

**In API routes:**
```typescript
import { requireAuth } from "@/lib/authorization";

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  // auth.user contains: { id, role, organizationId }
}
```

**In server components:**
```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
}
```

### Authorization Helpers

```typescript
import {
  requireAuth,
  isAgentOrAdmin,
  isSameOrganization,
  ticketScope,
} from "@/lib/authorization";

// Check role
if (!isAgentOrAdmin(auth.user)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Check organization
if (!isSameOrganization(auth.user, resource.organizationId)) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

// Get ticket scope filter
const where = ticketScope(auth.user);
```

### Role-Based Access

- **REQUESTER:** Can view/close/reopen own tickets, add public comments
- **AGENT:** Can view all org tickets, update status/priority, assign, add internal comments
- **ADMIN:** Full access + user/team/SLA management

---

## Error Handling

### API Error Responses

```typescript
// Validation error
return NextResponse.json(
  { error: parsed.error.flatten() },
  { status: 400 }
);

// Authentication error
return NextResponse.json(
  { error: "Unauthorized" },
  { status: 401 }
);

// Authorization error
return NextResponse.json(
  { error: "Forbidden" },
  { status: 403 }
);

// Not found
return NextResponse.json(
  { error: "Not found" },
  { status: 404 }
);

// Server error
return NextResponse.json(
  { error: "Internal server error" },
  { status: 500 }
);
```

### Client-Side Error Handling

```typescript
"use client";

import { toast } from "sonner";

const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await fetch("/api/example", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed");
    }
    
    return res.json();
  },
  onError: (error: Error) => {
    toast.error(error.message);
  },
  onSuccess: () => {
    toast.success("Success!");
  },
});
```

---

## Logging

### Request Logger

```typescript
import { createRequestLogger } from "@/lib/logger";

const logger = createRequestLogger({
  route: "/api/example",
  method: "POST",
  userId: auth.user.id,
});

// Info logs
logger.info("example.create.success", { id: result.id });

// Warning logs
logger.warn("example.create.validation_failed");

// Error logs
logger.error("example.create.database_error", { error: err.message });

// Security events
logger.securityEvent("unauthorized_access", {
  resource: "example",
  action: "create",
});
```

### Log Levels

- **info:** Normal operations (successful requests, data operations)
- **warn:** Warning conditions (validation failures, rate limit warnings)
- **error:** Error conditions (database errors, exceptions)
- **securityEvent:** Security-related events (failed logins, unauthorized access)

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev)
- [OpenAPI Specification](docs/openapi.yaml)
- [Security Audit Report](docs/security-audit-report.md)

---

*Last updated: 2025*


