import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { POST as createComment } from "@/app/api/tickets/[id]/comments/route";
import { resetRateLimitBuckets } from "@/lib/rate-limit";

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

    const res1 = await createComment(makeRequest(), { params: { id: "t1" } });
    const res2 = await createComment(makeRequest(), { params: { id: "t1" } });
    const res3 = await createComment(makeRequest(), { params: { id: "t1" } });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(429);
    expect(await res3.json()).toEqual({ error: "Too many requests" });
  });
});
