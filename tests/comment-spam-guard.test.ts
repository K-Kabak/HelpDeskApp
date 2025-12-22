import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { POST as createComment } from "@/app/api/tickets/[id]/comments/route";
import { resetSpamGuard } from "@/lib/spam-guard";

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findUnique: vi.fn(),
  },
  comment: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockRequireAuth = vi.fn();
vi.mock("@/lib/authorization", async () => {
  const actual = await vi.importActual<typeof import("@/lib/authorization")>("@/lib/authorization");
  return {
    ...actual,
    requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  };
});

const originalEnv = {
  enabled: process.env.SPAM_GUARD_ENABLED,
  window: process.env.SPAM_GUARD_COOLDOWN_MS,
};

beforeEach(() => {
  resetSpamGuard();
  process.env.SPAM_GUARD_ENABLED = "true";
  process.env.SPAM_GUARD_COOLDOWN_MS = "1000";
  mockRequireAuth.mockResolvedValue({
    ok: true,
    user: { id: "user-1", role: "REQUESTER", organizationId: "org-1" },
  });
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
});

afterEach(() => {
  mockRequireAuth.mockReset();
  Object.values(mockPrisma).forEach((group) => {
    Object.values(group).forEach((fn) => fn.mockReset());
  });
  process.env.SPAM_GUARD_ENABLED = originalEnv.enabled;
  process.env.SPAM_GUARD_COOLDOWN_MS = originalEnv.window;
  resetSpamGuard();
});

describe("Comment spam guard", () => {
  test("blocks rapid consecutive comments", async () => {
    const makeRequest = () =>
      new Request("http://localhost/api/tickets/t1/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bodyMd: "Hello" }),
      });

    const res1 = await createComment(makeRequest(), { params: { id: "t1" } });
    const res2 = await createComment(makeRequest(), { params: { id: "t1" } });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(429);
    expect(await res2.json()).toEqual({ error: "Too many requests" });
  });
});
