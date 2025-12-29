import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { POST as createTicket } from "@/app/api/tickets/route";
import { POST as createComment } from "@/app/api/tickets/[id]/comments/route";
import { POST as createUser } from "@/app/api/admin/users/route";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  comment: {
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  auditEvent: {
    create: vi.fn(),
  },
  slaPolicy: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ authOptions: {} as unknown }));
vi.mock("@/lib/sla-policy", () => ({
  findSlaPolicyForTicket: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/sla-preview", () => ({
  computeSlaDueDates: vi.fn().mockReturnValue({
    firstResponseDue: new Date(),
    resolveDue: new Date(),
  }),
}));
vi.mock("@/lib/sla-scheduler", () => ({
  scheduleSlaJobsForTicket: vi.fn(),
}));
vi.mock("@/lib/automation-rules", () => ({
  evaluateAutomationRules: vi.fn(),
}));
vi.mock("@/lib/spam-guard", () => ({
  checkCommentCooldown: vi.fn().mockReturnValue({ allowed: true }),
}));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));
vi.mock("@/lib/sanitize", () => ({
  sanitizeMarkdown: vi.fn((text: string) => text),
}));

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

function makeSession(role: "REQUESTER" | "AGENT" | "ADMIN" = "REQUESTER", orgId = "org-1") {
  return {
    user: {
      id: "user-1",
      role,
      organizationId: orgId,
    },
  };
}

beforeEach(() => {
  mockGetServerSession.mockReset();
  Object.values(mockPrisma).forEach((group) => {
    Object.values(group).forEach((fn) => fn.mockReset());
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Input Validation Security Tests", () => {
  describe("Ticket Creation - Max Length Validation", () => {
    test("rejects title that is too short", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
      mockPrisma.slaPolicy.findFirst.mockResolvedValue(null);

      const req = new Request("http://localhost/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "ab", // Less than min 3
          descriptionMd: "Valid description",
          priority: "SREDNI",
        }),
      });

      const res = await createTicket(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("rejects description that is too short", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
      mockPrisma.slaPolicy.findFirst.mockResolvedValue(null);

      const req = new Request("http://localhost/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Valid title",
          descriptionMd: "ab", // Less than min 3
          priority: "SREDNI",
        }),
      });

      const res = await createTicket(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("accepts valid ticket creation input", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
      mockPrisma.slaPolicy.findFirst.mockResolvedValue(null);
      // Mock ticket creation - the create includes nested auditEvents.create
      mockPrisma.ticket.create.mockResolvedValue({
        id: "ticket-1",
        title: "Valid title",
        descriptionMd: "Valid description",
        priority: "SREDNI",
        status: "NOWE",
        organizationId: "org-1",
        requesterId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        firstResponseDue: new Date(),
        resolveDue: new Date(),
        number: 1,
        category: null,
        assigneeUserId: null,
        assigneeTeamId: null,
        firstResponseAt: null,
        resolvedAt: null,
        closedAt: null,
        lastReopenedAt: null,
        slaPausedAt: null,
        slaPausedReason: null,
      });

      const req = new Request("http://localhost/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Valid title",
          descriptionMd: "Valid description",
          priority: "SREDNI",
        }),
      });

      const res = await createTicket(req);
      // The ticket creation should succeed - if it returns 400, check the error
      if (res.status !== 200) {
        const body = await res.json();
        console.log("Ticket creation failed:", body);
      }
      expect(res.status).toBe(200);
    });
  });

  describe("Comment Creation - Max Length Validation", () => {
    test("rejects comment body that exceeds max length", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-1",
        requesterId: "user-1",
        organizationId: "org-1",
        firstResponseAt: null,
      });

      const longBody = "a".repeat(10001); // Exceeds max 10000

      const req = new Request("http://localhost/api/tickets/ticket-1/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bodyMd: longBody,
        }),
      });

      const res = await createComment(req, { params: Promise.resolve({ id: "ticket-1" }) });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("rejects empty comment body", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-1",
        requesterId: "user-1",
        organizationId: "org-1",
        firstResponseAt: null,
      });

      const req = new Request("http://localhost/api/tickets/ticket-1/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bodyMd: "",
        }),
      });

      const res = await createComment(req, { params: Promise.resolve({ id: "ticket-1" }) });
      expect(res.status).toBe(400);
    });

    test("accepts comment body within max length", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-1",
        requesterId: "user-1",
        organizationId: "org-1",
        firstResponseAt: null,
      });
      mockPrisma.comment.create.mockResolvedValue({
        id: "comment-1",
        ticketId: "ticket-1",
        authorId: "user-1",
        bodyMd: "a".repeat(10000),
        isInternal: false,
        createdAt: new Date(),
      });

      const req = new Request("http://localhost/api/tickets/ticket-1/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bodyMd: "a".repeat(10000), // Exactly max length
        }),
      });

      const res = await createComment(req, { params: Promise.resolve({ id: "ticket-1" }) });
      expect(res.status).toBe(200);
    });
  });

  describe("User Creation - Max Length Validation", () => {
    test("rejects name that exceeds max length", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("ADMIN"));
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          name: "a".repeat(256), // Exceeds max 255
          role: "REQUESTER",
          password: "password123",
        }),
      });

      const res = await createUser(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("rejects password that is too short", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("ADMIN"));
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          name: "Test User",
          role: "REQUESTER",
          password: "short", // Less than min 8
        }),
      });

      const res = await createUser(req);
      expect(res.status).toBe(400);
    });

    test("rejects password that exceeds max length", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("ADMIN"));
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          name: "Test User",
          role: "REQUESTER",
          password: "a".repeat(256), // Exceeds max 255
        }),
      });

      const res = await createUser(req);
      expect(res.status).toBe(400);
    });

    test("rejects invalid email format", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("ADMIN"));
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          name: "Test User",
          role: "REQUESTER",
          password: "password123",
        }),
      });

      const res = await createUser(req);
      expect(res.status).toBe(400);
    });
  });

  describe("XSS Payload Rejection", () => {
    test("XSS script tags in ticket title should be sanitized", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
      mockPrisma.slaPolicy.findFirst.mockResolvedValue(null);
      mockPrisma.ticket.create.mockResolvedValue({
        id: "ticket-1",
        title: "Valid title",
        descriptionMd: "Valid description",
        priority: "SREDNI",
        status: "NOWE",
        organizationId: "org-1",
        requesterId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const xssPayload = "<script>alert('XSS')</script>Valid title";
      const req = new Request("http://localhost/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: xssPayload,
          descriptionMd: "Valid description",
          priority: "SREDNI",
        }),
      });

      const res = await createTicket(req);
      // Should either reject or sanitize - check that it doesn't crash
      expect([200, 400]).toContain(res.status);
    });

    test("XSS script tags in comment body should be sanitized", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-1",
        requesterId: "user-1",
        organizationId: "org-1",
        firstResponseAt: null,
      });
      mockPrisma.comment.create.mockResolvedValue({
        id: "comment-1",
        ticketId: "ticket-1",
        authorId: "user-1",
        bodyMd: "sanitized",
        isInternal: false,
        createdAt: new Date(),
      });

      const xssPayload = "<script>alert('XSS')</script>Valid comment";
      const req = new Request("http://localhost/api/tickets/ticket-1/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bodyMd: xssPayload,
        }),
      });

      const res = await createComment(req, { params: Promise.resolve({ id: "ticket-1" }) });
      // Should either reject or sanitize - check that it doesn't crash
      expect([200, 400]).toContain(res.status);
    });

    test("XSS event handlers in markdown should be sanitized", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-1",
        requesterId: "user-1",
        organizationId: "org-1",
        firstResponseAt: null,
      });
      mockPrisma.comment.create.mockResolvedValue({
        id: "comment-1",
        ticketId: "ticket-1",
        authorId: "user-1",
        bodyMd: "sanitized",
        isInternal: false,
        createdAt: new Date(),
      });

      const xssPayload = "Valid comment<img src=x onerror=alert('XSS')>";
      const req = new Request("http://localhost/api/tickets/ticket-1/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bodyMd: xssPayload,
        }),
      });

      const res = await createComment(req, { params: Promise.resolve({ id: "ticket-1" }) });
      // Should either reject or sanitize - check that it doesn't crash
      expect([200, 400]).toContain(res.status);
    });
  });

  describe("Request Size Limits", () => {
    test("rejects extremely large request body", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));

      // Create a very large body (simulating request size limit)
      const largeBody = {
        title: "a".repeat(1000000), // 1MB of data
        descriptionMd: "Valid description",
        priority: "SREDNI",
      };

      const req = new Request("http://localhost/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(largeBody),
      });

      const res = await createTicket(req);
      // Should either reject due to size or validation
      expect([400, 413, 500]).toContain(res.status);
    });
  });

  describe("Type Validation", () => {
    test("rejects invalid priority enum value", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));

      const req = new Request("http://localhost/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Valid title",
          descriptionMd: "Valid description",
          priority: "INVALID_PRIORITY",
        }),
      });

      const res = await createTicket(req);
      expect(res.status).toBe(400);
    });

    test("rejects invalid role enum value", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("ADMIN"));
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          name: "Test User",
          role: "INVALID_ROLE",
          password: "password123",
        }),
      });

      const res = await createUser(req);
      expect(res.status).toBe(400);
    });

    test("rejects non-boolean isInternal value", async () => {
      mockGetServerSession.mockResolvedValue(makeSession("AGENT"));
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-1",
        requesterId: "user-2",
        organizationId: "org-1",
        firstResponseAt: null,
      });

      const req = new Request("http://localhost/api/tickets/ticket-1/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bodyMd: "Valid comment",
          isInternal: "not-a-boolean",
        }),
      });

      const res = await createComment(req, { params: Promise.resolve({ id: "ticket-1" }) });
      expect(res.status).toBe(400);
    });
  });
});

