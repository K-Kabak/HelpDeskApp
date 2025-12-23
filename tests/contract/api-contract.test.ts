import fs from "node:fs";
import { describe, expect, beforeEach, vi, test } from "vitest";
import { GET as listTickets, POST as createTicket } from "@/app/api/tickets/route";
import { POST as createComment } from "@/app/api/tickets/[id]/comments/route";
import { resetMockPrisma } from "../test-utils/prisma-mocks";

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  slaPolicy: {
    findFirst: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
  team: {
    findFirst: vi.fn(),
  },
  auditEvent: {
    create: vi.fn(),
  },
  comment: {
    create: vi.fn(),
  },
  automationRule: {
    findMany: vi.fn().mockResolvedValue([]),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

// Mock automation rules evaluation
const mockEvaluateAutomationRules = vi.hoisted(() => vi.fn());
vi.mock("@/lib/automation-rules", () => ({
  evaluateAutomationRules: mockEvaluateAutomationRules,
}));

// Mock getServerSession to avoid Next.js context issues
const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

// Mock Next.js headers to provide required context
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map([["next-auth.session-token", "mock-token"]])),
}));

// Mock the authorization module to bypass Next.js context issues
const mockRequireAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/authorization", () => ({
  requireAuth: mockRequireAuth,
  ticketScope: vi.fn(),
  isAgentOrAdmin: (user: any) => user.role === "AGENT" || user.role === "ADMIN",
  isSameOrganization: (user: any, orgId: string) => Boolean(user.organizationId) && user.organizationId === orgId,
}));

function makeSession(role: "REQUESTER" | "AGENT" | "ADMIN" = "AGENT") {
  return {
    user: {
      id: "user-1",
      role,
      organizationId: "org-1",
    },
  };
}

  beforeEach(() => {
    vi.clearAllMocks();
    resetMockPrisma(mockPrisma);

    // Default mock implementation for requireAuth - returns authenticated user
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: {
        id: "user-1",
        role: "AGENT",
        organizationId: "org-1",
      },
    });

    // Default mock for automation rules evaluation
    mockEvaluateAutomationRules.mockResolvedValue(undefined);
  });

describe("OpenAPI baseline", () => {
  test("docs/openapi.yaml is present and contains implemented paths", () => {
    const text = fs.readFileSync("docs/openapi.yaml", "utf-8");
    expect(text).toContain("/api/tickets:");
    expect(text).toContain("/api/tickets/{id}:");
    expect(text).toContain("/api/tickets/{id}/comments:");
  });
});

describe("GET /api/tickets", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await listTickets();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("returns tickets with expanded relations for authenticated agent", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    mockPrisma.ticket.findMany.mockResolvedValueOnce([
      {
        id: "t1",
        number: 1,
        title: "Test ticket",
        descriptionMd: "Body",
        status: "NOWE",
        priority: "SREDNI",
        category: null,
        requesterId: "user-1",
        assigneeUserId: null,
        assigneeTeamId: null,
        organizationId: "org-1",
        firstResponseAt: null,
        firstResponseDue: null,
        resolveDue: null,
        resolvedAt: null,
        closedAt: null,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
        requester: {
          id: "user-1",
          email: "user@example.com",
          name: "User",
          role: "REQUESTER",
          organizationId: "org-1",
        },
        assigneeUser: null,
        assigneeTeam: null,
      },
    ]);

    const res = await listTickets();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body.tickets)).toBe(true);
    expect(body.tickets[0].requester.id).toBe("user-1");
  });
});

describe("POST /api/tickets", () => {
  test("returns validation error for missing fields", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("REQUESTER"));
    const req = new Request("http://localhost/api/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await createTicket(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.fieldErrors.title?.length).toBeGreaterThan(0);
  });

  test("creates ticket with authenticated requester", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("REQUESTER"));
    mockPrisma.slaPolicy.findFirst.mockResolvedValueOnce(null);
    mockPrisma.ticket.create.mockResolvedValueOnce({
      id: "t1",
      number: 1,
      title: "Test ticket",
      descriptionMd: "Body",
      status: "NOWE",
      priority: "SREDNI",
      category: null,
      requesterId: "user-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      organizationId: "org-1",
      firstResponseAt: null,
      firstResponseDue: null,
      resolveDue: null,
      resolvedAt: null,
      closedAt: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    });

    const req = new Request("http://localhost/api/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Test ticket",
        descriptionMd: "Body",
        priority: "SREDNI",
      }),
    });

    const res = await createTicket(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ticket.id).toBe("t1");
  });

  test("sanitizes markdown before storing ticket", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("REQUESTER"));
    mockPrisma.slaPolicy.findFirst.mockResolvedValueOnce(null);
    mockPrisma.ticket.create.mockResolvedValueOnce({
      id: "t2",
      number: 2,
      title: "Another",
      descriptionMd: "clean content",
      status: "NOWE",
      priority: "SREDNI",
      category: null,
      requesterId: "user-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      organizationId: "org-1",
      firstResponseAt: null,
      firstResponseDue: null,
      resolveDue: null,
      resolvedAt: null,
      closedAt: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    });

    const req = new Request("http://localhost/api/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Another",
        descriptionMd: "<script>alert(1)</script>clean content",
        priority: "SREDNI",
      }),
    });

    const res = await createTicket(req);
    expect(res.status).toBe(200);
    const createArgs = mockPrisma.ticket.create.mock.calls[0]?.[0];
    expect(createArgs?.data?.descriptionMd).toBe("clean content");
  });

  test("triggers automation hook with ticketCreated event", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("REQUESTER"));
    mockPrisma.slaPolicy.findFirst.mockResolvedValueOnce(null);
    const createdTicket = {
      id: "t3",
      number: 3,
      title: "Auto test",
      descriptionMd: "Body",
      status: "NOWE",
      priority: "SREDNI",
      category: null,
      requesterId: "user-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      organizationId: "org-1",
      firstResponseAt: null,
      firstResponseDue: null,
      resolveDue: null,
      resolvedAt: null,
      closedAt: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    mockPrisma.ticket.create.mockResolvedValueOnce(createdTicket);

    const req = new Request("http://localhost/api/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Auto test",
        descriptionMd: "Body",
        priority: "SREDNI",
      }),
    });

    const res = await createTicket(req);
    expect(res.status).toBe(200);

    expect(mockEvaluateAutomationRules).toHaveBeenCalledTimes(1);
    expect(mockEvaluateAutomationRules).toHaveBeenCalledWith({
      type: "ticketCreated",
      ticket: createdTicket,
    });
  });
});

describe("POST /api/tickets/{id}/comments", () => {
  test("returns 404 when ticket is missing", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    mockPrisma.ticket.findUnique.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/tickets/id/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bodyMd: "hi" }),
    });

    const res = await createComment(req, { params: { id: "missing" } });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
  });

  test("creates comment for requester", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "user-1",
        role: "REQUESTER",
        organizationId: "org-1",
      },
    });
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
      firstResponseAt: null,
    });
    mockPrisma.comment.create.mockResolvedValueOnce({
      id: "c1",
      ticketId: "t1",
      authorId: "user-1",
      isInternal: false,
      bodyMd: "Hello",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });

    const req = new Request("http://localhost/api/tickets/t1/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bodyMd: "Hello" }),
    });

    const res = await createComment(req, { params: { id: "t1" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.comment.id).toBe("c1");
  });

  test("sanitizes comment body on ingest", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "user-1",
        role: "AGENT",
        organizationId: "org-1",
      },
    });
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
      firstResponseAt: null,
    });
    mockPrisma.comment.create.mockResolvedValueOnce({
      id: "c2",
      ticketId: "t1",
      authorId: "user-1",
      isInternal: false,
      bodyMd: "hello",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });

    const req = new Request("http://localhost/api/tickets/t1/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bodyMd: "<img src=\"javascript:1\" onerror=\"x\" />hello" }),
    });

    const res = await createComment(req, { params: { id: "t1" } });
    expect(res.status).toBe(200);
    const createArgs = mockPrisma.comment.create.mock.calls[0]?.[0];
    expect(createArgs?.data?.bodyMd).toBe('<img src="1" />hello');
  });
});
