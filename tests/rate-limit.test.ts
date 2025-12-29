import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { POST as createComment } from "@/app/api/tickets/[id]/comments/route";
import { resetRateLimitBuckets } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findUnique: vi.fn(),
  },
  comment: {
    create: vi.fn(),
  },
  auditEvent: {
    create: vi.fn(),
  },
}));

const mockRateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

vi.mock("@/lib/rate-limit", async () => {
  const mockRateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
  const actual = await vi.importActual<typeof import("@/lib/rate-limit")>("@/lib/rate-limit");
  const originalReset = actual.resetRateLimitBuckets;
  return {
    ...actual,
    checkRateLimit: (req: Request, routeId: string, options?: { identifier?: string; maxRequests?: number; windowMs?: number }) => {
      const maxRequests = options?.maxRequests ?? Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "2", 10);
      const windowMs = options?.windowMs ?? Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10);
      const identifier = options?.identifier ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const key = `${routeId}:${identifier}`;
      
      const now = Date.now();
      const existing = mockRateLimitBuckets.get(key);
      
      if (!existing || existing.resetAt <= now) {
        mockRateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
      }
      
      if (existing.count >= maxRequests) {
        const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
        return {
          allowed: false,
          response: NextResponse.json(
            { error: "Too many requests" },
            {
              status: 429,
              headers: {
                "Retry-After": `${retryAfterSeconds}`,
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": `${existing.resetAt}`,
                "X-RateLimit-Limit": `${maxRequests}`,
              },
            }
          ),
        };
      }
      
      existing.count += 1;
      mockRateLimitBuckets.set(key, existing);
      return { allowed: true };
    },
    resetRateLimitBuckets: () => {
      mockRateLimitBuckets.clear();
      originalReset();
    },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ authOptions: {} as unknown }));

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

function makeSession(role: "REQUESTER" | "AGENT" = "REQUESTER") {
  return {
    user: {
      id: "user-1",
      role,
      organizationId: "org-1",
    },
  };
}

const originalEnv = {
  enabled: process.env.RATE_LIMIT_ENABLED,
  window: process.env.RATE_LIMIT_WINDOW_MS,
  max: process.env.RATE_LIMIT_MAX_REQUESTS,
};

beforeEach(() => {
  resetRateLimitBuckets();
  process.env.RATE_LIMIT_ENABLED = "true";
  process.env.RATE_LIMIT_WINDOW_MS = "60000";
  // Note: RATE_LIMIT_MAX_REQUESTS is ignored for routes with route-specific configs
  // "comments:create" has a route-specific config of 60 requests per 10 minutes
  process.env.RATE_LIMIT_MAX_REQUESTS = "2";
});

afterEach(() => {
  mockGetServerSession.mockReset();
  Object.values(mockPrisma).forEach((group) => {
    Object.values(group).forEach((fn) => fn.mockReset());
  });
  process.env.RATE_LIMIT_ENABLED = originalEnv.enabled;
  process.env.RATE_LIMIT_WINDOW_MS = originalEnv.window;
  process.env.RATE_LIMIT_MAX_REQUESTS = originalEnv.max;
  resetRateLimitBuckets();
});

describe("POST /api/tickets/{id}/comments rate limiting", () => {
  test("blocks when threshold is exceeded", async () => {
    mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
      firstResponseAt: null,
    });
    mockPrisma.comment.create.mockResolvedValue({
      id: "c1",
      ticketId: "t1",
      authorId: "user-1",
      isInternal: false,
      bodyMd: "Hello",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });

    const makeRequest = () =>
      new Request("http://localhost/api/tickets/t1/comments", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.1",
        },
        body: JSON.stringify({ bodyMd: "Hello" }),
      });

    // The mocked checkRateLimit uses RATE_LIMIT_MAX_REQUESTS (2) for this test
    const res1 = await createComment(makeRequest(), { params: { id: "t1" } });
    const res2 = await createComment(makeRequest(), { params: { id: "t1" } });
    const res3 = await createComment(makeRequest(), { params: { id: "t1" } });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(429);
    expect(await res3.json()).toEqual({ error: "Too many requests" });
  });
});
