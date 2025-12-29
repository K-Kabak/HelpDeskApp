import fs from "node:fs";
import { describe, expect, beforeEach, vi, test } from "vitest";
import { GET as listTickets, POST as createTicket } from "@/app/api/tickets/route";
import { PATCH as updateTicket } from "@/app/api/tickets/[id]/route";
import { POST as createComment } from "@/app/api/tickets/[id]/comments/route";
import { POST as uploadAttachment, DELETE as deleteAttachment } from "@/app/api/tickets/[id]/attachments/route";
import { GET as getAttachment } from "@/app/api/tickets/[id]/attachments/[attachmentId]/route";
import { GET as getAudit } from "@/app/api/tickets/[id]/audit/route";
import { POST as submitCsat } from "@/app/api/tickets/[id]/csat/route";
import { PATCH as bulkUpdateTickets } from "@/app/api/tickets/bulk/route";
import { GET as listUsers, POST as createUser } from "@/app/api/admin/users/route";
import { GET as getUser, PATCH as updateUser, DELETE as deleteUser } from "@/app/api/admin/users/[id]/route";
import { GET as listTeams, POST as createTeam } from "@/app/api/admin/teams/route";
import { GET as getTeam, PATCH as updateTeam, DELETE as deleteTeam } from "@/app/api/admin/teams/[id]/route";
import { GET as listMemberships, POST as addMember, DELETE as removeMember } from "@/app/api/admin/teams/[id]/memberships/route";
import { GET as listAuditEvents } from "@/app/api/admin/audit-events/route";
import { GET as listAutomationRules, POST as createAutomationRule } from "@/app/api/admin/automation-rules/route";
import { PATCH as updateAutomationRule, DELETE as deleteAutomationRule } from "@/app/api/admin/automation-rules/[id]/route";
import { GET as listSlaPolicies, POST as createSlaPolicy } from "@/app/api/admin/sla-policies/route";
import { PATCH as updateSlaPolicy, DELETE as deleteSlaPolicy } from "@/app/api/admin/sla-policies/[id]/route";
import { GET as listNotifications } from "@/app/api/notifications/route";
import { PATCH as markNotificationRead } from "@/app/api/notifications/[id]/read/route";
import { GET as listViews, POST as createView } from "@/app/api/views/route";
import { PATCH as updateView, DELETE as deleteView } from "@/app/api/views/[id]/route";
import { POST as setDefaultView } from "@/app/api/views/[id]/set-default/route";
import { GET as getKpi } from "@/app/api/reports/kpi/route";
import { GET as getAnalytics } from "@/app/api/reports/analytics/route";
import { GET as getCsat } from "@/app/api/reports/csat/route";
import { GET as exportTickets } from "@/app/api/reports/export/tickets/route";
import { GET as exportComments } from "@/app/api/reports/export/comments/route";
import { GET as listCategories } from "@/app/api/categories/route";
import { GET as listTags } from "@/app/api/tags/route";
import { POST as previewSla } from "@/app/api/sla/preview/route";
import { GET as healthCheck } from "@/app/api/health/route";
import { resetMockPrisma } from "../test-utils/prisma-mocks";

interface MockUser {
  id: string;
  role: string;
  organizationId?: string | null;
}

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  slaPolicy: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
  team: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
  adminAudit: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  auditEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  comment: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  automationRule: {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
  },
  tag: {
    findMany: vi.fn(),
  },
  attachment: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  savedView: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  csatRequest: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  csatResponse: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  inAppNotification: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  teamMembership: {
    findMany: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
  $queryRaw: vi.fn(),
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
  isAgentOrAdmin: (user: MockUser) => user.role === "AGENT" || user.role === "ADMIN",
  isSameOrganization: (user: MockUser, orgId: string) => Boolean(user.organizationId) && user.organizationId === orgId,
}));

// Mock rate limiting
const mockCheckRateLimit = vi.hoisted(() => vi.fn());
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
}));

// Mock storage
const mockCreatePresignedUpload = vi.hoisted(() => vi.fn());
vi.mock("@/lib/storage", () => ({
  createPresignedUpload: mockCreatePresignedUpload,
}));

// Mock attachment validation
const mockUploadRequestSchema = vi.hoisted(() => ({
  safeParse: vi.fn(),
}));
vi.mock("@/lib/attachment-validation", () => ({
  uploadRequestSchema: mockUploadRequestSchema,
  isSizeAllowed: vi.fn(() => true),
  isMimeAllowed: vi.fn(() => true),
}));

// Mock AV scanner
vi.mock("@/lib/av-scanner", () => ({
  runAttachmentScan: vi.fn(),
}));

// Mock audit
vi.mock("@/lib/audit", () => ({
  recordAttachmentAudit: vi.fn(),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  createRequestLogger: vi.fn(() => ({
    warn: vi.fn(),
    info: vi.fn(),
    securityEvent: vi.fn(),
  })),
}));

// Mock CSAT token
vi.mock("@/lib/csat-token", () => ({
  generateCsatToken: vi.fn(() => "mock-token"),
}));

// Mock notification service
vi.mock("@/lib/notification", () => ({
  notificationService: {
    send: vi.fn(),
  },
}));

// Mock SLA scheduler
vi.mock("@/lib/sla-scheduler", () => ({
  scheduleSlaJobsForTicket: vi.fn(),
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

    // Default mock for rate limiting
    mockCheckRateLimit.mockReturnValue({ allowed: true });

    // Default mock for presigned upload
    mockCreatePresignedUpload.mockReturnValue({
      uploadUrl: "https://example.com/upload",
      storagePath: "path/to/file",
    });

    // Default mock for attachment validation schema
    mockUploadRequestSchema.safeParse.mockImplementation((data) => {
      if (!data || !data.filename || !data.sizeBytes || !data.mimeType) {
        return { success: false, error: { flatten: () => ({}) } };
      }
      return {
        success: true,
        data: {
          fileName: data.filename,
          sizeBytes: data.sizeBytes,
          mimeType: data.mimeType,
          visibility: data.visibility || "public",
        },
      };
    });
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
    expect(createArgs?.data?.bodyMd).toBe("<img src=\"1\" />hello");
  });
});

describe("GET /api/admin/users", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await listUsers();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "user-1",
        role: "AGENT",
        organizationId: "org-1",
      },
    });
    const res = await listUsers();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("returns users list for admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findMany.mockResolvedValueOnce([
      {
        id: "user-1",
        email: "user@example.com",
        name: "Test User",
        role: "AGENT",
        emailVerified: new Date("2024-01-01T00:00:00Z"),
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
        _count: {
          ticketsCreated: 5,
          ticketsOwned: 3,
        },
      },
    ]);

    const res = await listUsers();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.users[0].id).toBe("user-1");
    expect(body.users[0].email).toBe("user@example.com");
    expect(body.users[0].ticketCount).toBe(5);
    expect(body.users[0].activeTicketCount).toBe(3);
  });
});

describe("POST /api/admin/users", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "user-1",
        role: "AGENT",
        organizationId: "org-1",
      },
    });
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "new@example.com",
        name: "New User",
        role: "AGENT",
        password: "password123",
      }),
    });
    const res = await createUser(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("returns validation error for missing fields", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await createUser(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toContain("Missing required fields");
  });

  test("returns validation error for invalid role", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "new@example.com",
        name: "New User",
        role: "INVALID_ROLE",
        password: "password123",
      }),
    });
    const res = await createUser(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toContain("Invalid role");
  });

  test("returns error when email already exists", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "existing-user",
      email: "existing@example.com",
    });

    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "existing@example.com",
        name: "New User",
        role: "AGENT",
        password: "password123",
      }),
    });
    const res = await createUser(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toContain("Email already exists");
  });

  test("creates user successfully", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce({
      id: "new-user-1",
      email: "new@example.com",
      name: "New User",
      role: "AGENT",
      emailVerified: new Date("2024-01-01T00:00:00Z"),
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    });
    mockPrisma.adminAudit.create.mockResolvedValueOnce({ id: "audit-1" });

    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "new@example.com",
        name: "New User",
        role: "AGENT",
        password: "password123",
      }),
    });
    const res = await createUser(req);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.user.id).toBe("new-user-1");
    expect(body.user.email).toBe("new@example.com");
  });
});

describe("GET /api/admin/users/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "user-1",
        role: "AGENT",
        organizationId: "org-1",
      },
    });
    const res = await getUser({} as unknown as Request, { params: { id: "user-1" } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("returns 404 when user not found", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findFirst.mockResolvedValueOnce(null);

    const res = await getUser({} as unknown as Request, { params: { id: "nonexistent" } });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error).toContain("User not found");
  });

  test("returns user details for admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      role: "AGENT",
      emailVerified: new Date("2024-01-01T00:00:00Z"),
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      _count: {
        ticketsCreated: 5,
        ticketsOwned: 3,
      },
    });

    const res = await getUser({} as unknown as Request, { params: { id: "user-1" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.user.id).toBe("user-1");
    expect(body.user.ticketCount).toBe(5);
  });
});

describe("PATCH /api/admin/users/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "user-1",
        role: "AGENT",
        organizationId: "org-1",
      },
    });
    const req = new Request("http://localhost/api/admin/users/user-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Updated Name" }),
    });
    const res = await updateUser(req, { params: { id: "user-1" } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("returns 404 when user not found", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/admin/users/nonexistent", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Updated Name" }),
    });
    const res = await updateUser(req, { params: { id: "nonexistent" } });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error).toContain("User not found");
  });

  test("updates user successfully", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      id: "user-1",
      email: "user@example.com",
      organizationId: "org-1",
    });
    mockPrisma.user.update.mockResolvedValueOnce({
      id: "user-1",
      email: "updated@example.com",
      name: "Updated User",
      role: "AGENT",
      emailVerified: new Date("2024-01-01T00:00:00Z"),
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    });
    mockPrisma.adminAudit.create.mockResolvedValueOnce({ id: "audit-2" });

    const req = new Request("http://localhost/api/admin/users/user-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "updated@example.com",
        name: "Updated User"
      }),
    });
    const res = await updateUser(req, { params: { id: "user-1" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.user.email).toBe("updated@example.com");
    expect(body.user.name).toBe("Updated User");
  });
});

describe("DELETE /api/admin/users/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "user-1",
        role: "AGENT",
        organizationId: "org-1",
      },
    });
    const req = new Request("http://localhost/api/admin/users/user-1", {
      method: "DELETE",
    });
    const res = await deleteUser(req, { params: { id: "user-1" } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("returns 400 when trying to delete self", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      id: "admin-1",
      email: "admin@example.com",
      organizationId: "org-1",
      _count: { ticketsOwned: 0 },
    });

    const req = new Request("http://localhost/api/admin/users/admin-1", {
      method: "DELETE",
    });
    const res = await deleteUser(req, { params: { id: "admin-1" } });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toContain("Cannot delete your own account");
  });

  test("returns 400 when user has active tickets", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      id: "user-1",
      email: "user@example.com",
      organizationId: "org-1",
      _count: { ticketsOwned: 2 },
    });

    const req = new Request("http://localhost/api/admin/users/user-1", {
      method: "DELETE",
    });
    const res = await deleteUser(req, { params: { id: "user-1" } });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toContain("Cannot delete user with active tickets");
  });

  test("deletes user successfully", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: {
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      },
    });
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      id: "user-1",
      email: "user@example.com",
      organizationId: "org-1",
      _count: { ticketsOwned: 0 },
    });
    mockPrisma.adminAudit.create.mockResolvedValueOnce({ id: "audit-3" });

    const req = new Request("http://localhost/api/admin/users/user-1", {
      method: "DELETE",
    });
    const res = await deleteUser(req, { params: { id: "user-1" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

// ========== Additional Endpoint Tests ==========

describe("PATCH /api/tickets/{id}", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "W_TOKU" }),
    });
    const res = await updateTicket(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when ticket not found", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/tickets/missing", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "W_TOKU" }),
    });
    const res = await updateTicket(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });

  test("returns 403 when requester tries to update other's ticket", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-2", role: "REQUESTER", organizationId: "org-1" },
    });
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
      status: "NOWE",
      priority: "SREDNI",
      assigneeUserId: null,
      assigneeTeamId: null,
    });
    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "ZAMKNIETE" }),
    });
    const res = await updateTicket(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(403);
  });

  test("returns 400 when no updates provided", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
      status: "NOWE",
      priority: "SREDNI",
      assigneeUserId: null,
      assigneeTeamId: null,
    });
    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await updateTicket(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(400);
  });

  test("updates ticket successfully", async () => {
    const ticket = {
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
      status: "NOWE",
      priority: "SREDNI",
      assigneeUserId: null,
      assigneeTeamId: null,
      firstResponseDue: null,
      resolveDue: null,
      lastReopenedAt: null,
    };
    mockPrisma.ticket.findUnique.mockResolvedValueOnce(ticket);
    mockPrisma.ticket.update.mockResolvedValueOnce({
      ...ticket,
      status: "W_TOKU",
      requester: { id: "user-1", email: "user@example.com", name: "User" },
      assigneeUser: null,
      assigneeTeam: null,
    });
    mockPrisma.auditEvent.create.mockResolvedValueOnce({ id: "audit-1" });
    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "W_TOKU" }),
    });
    const res = await updateTicket(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ticket.status).toBe("W_TOKU");
  });
});

describe("POST /api/tickets/{id}/attachments", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/tickets/t1/attachments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: "test.pdf", sizeBytes: 1000, mimeType: "application/pdf" }),
    });
    const res = await uploadAttachment(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when ticket not found", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/tickets/missing/attachments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: "test.pdf", sizeBytes: 1000, mimeType: "application/pdf" }),
    });
    const res = await uploadAttachment(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });

  test("returns 403 when requester tries to upload to other's ticket", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-2", role: "REQUESTER", organizationId: "org-1" },
    });
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
    });
    const req = new Request("http://localhost/api/tickets/t1/attachments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: "test.pdf", sizeBytes: 1000, mimeType: "application/pdf" }),
    });
    const res = await uploadAttachment(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(403);
  });

  test("creates attachment successfully", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
    });
    mockUploadRequestSchema.safeParse.mockReturnValueOnce({
      success: true,
      data: {
        fileName: "test.pdf",
        sizeBytes: 1000,
        mimeType: "application/pdf",
        visibility: "public",
      },
    });
    mockPrisma.attachment.create.mockResolvedValueOnce({
      id: "att-1",
      ticketId: "t1",
      uploaderId: "user-1",
      fileName: "test.pdf",
      filePath: "path/to/file",
      mimeType: "application/pdf",
      sizeBytes: 1000,
      visibility: "PUBLIC",
    });
    const req = new Request("http://localhost/api/tickets/t1/attachments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: "test.pdf", sizeBytes: 1000, mimeType: "application/pdf" }),
    });
    const res = await uploadAttachment(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.attachment.id).toBe("att-1");
  });
});

describe("GET /api/tickets/{id}/attachments/{attachmentId}", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await getAttachment({} as Request, { params: Promise.resolve({ id: "t1", attachmentId: "att-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when attachment not found", async () => {
    mockPrisma.attachment.findUnique.mockResolvedValueOnce(null);
    const res = await getAttachment({} as Request, { params: Promise.resolve({ id: "t1", attachmentId: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tickets/{id}/attachments", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/tickets/t1/attachments", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ attachmentId: "att-1" }),
    });
    const res = await deleteAttachment(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when attachment not found", async () => {
    mockPrisma.attachment.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/tickets/t1/attachments", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ attachmentId: "missing" }),
    });
    const res = await deleteAttachment(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/tickets/{id}/audit", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await getAudit({} as Request, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when ticket not found", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce(null);
    const res = await getAudit({} as Request, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });

  test("returns 403 when requester tries to access other's ticket", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-2", role: "REQUESTER", organizationId: "org-1" },
    });
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
    });
    const res = await getAudit({} as Request, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(403);
  });

  test("returns audit events successfully", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
    });
    mockPrisma.auditEvent.findMany.mockResolvedValueOnce([
      {
        id: "audit-1",
        action: "STATUS_CHANGE",
        actorId: "user-1",
        actor: { id: "user-1", name: "User", email: "user@example.com", role: "AGENT" },
        data: {},
        createdAt: new Date("2024-01-01T00:00:00Z"),
      },
    ]);
    const res = await getAudit({} as Request, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.auditEvents)).toBe(true);
  });
});

describe("POST /api/tickets/{id}/csat", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/tickets/t1/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 5 }),
    });
    const res = await submitCsat(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when ticket not found", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/tickets/missing/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 5 }),
    });
    const res = await submitCsat(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });

  test("returns 400 when score is invalid", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({
      id: "t1",
      requesterId: "user-1",
      organizationId: "org-1",
    });
    const req = new Request("http://localhost/api/tickets/t1/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 10 }),
    });
    const res = await submitCsat(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/tickets/bulk", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/tickets/bulk", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ticketIds: ["t1"], action: "status", value: "W_TOKU" }),
    });
    const res = await bulkUpdateTickets(req);
    expect(res.status).toBe(401);
  });

  test("returns 403 when user is not agent/admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "REQUESTER", organizationId: "org-1" },
    });
    const req = new Request("http://localhost/api/tickets/bulk", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ticketIds: ["t1"], action: "status", value: "W_TOKU" }),
    });
    const res = await bulkUpdateTickets(req);
    expect(res.status).toBe(403);
  });

  test("returns 400 when validation fails", async () => {
    const req = new Request("http://localhost/api/tickets/bulk", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await bulkUpdateTickets(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/admin/teams", () => {
  test("returns 401 when session is missing", async () => {
    mockGetServerSession.mockResolvedValueOnce(null);
    const res = await listTeams();
    expect(res.status).toBe(401);
  });

  test("returns 401 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const res = await listTeams();
    expect(res.status).toBe(401);
  });

  test("returns teams list for admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("ADMIN"));
    mockPrisma.team.findMany.mockResolvedValueOnce([
      {
        id: "team-1",
        name: "Team 1",
        organizationId: "org-1",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
        _count: { memberships: 2, tickets: 5 },
      },
    ]);
    const res = await listTeams();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.teams)).toBe(true);
  });
});

describe("POST /api/admin/teams", () => {
  test("returns 401 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const req = new Request("http://localhost/api/admin/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "New Team" }),
    });
    const res = await createTeam(req);
    expect(res.status).toBe(401);
  });

  test("returns 400 when name is missing", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("ADMIN"));
    const req = new Request("http://localhost/api/admin/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await createTeam(req);
    expect(res.status).toBe(400);
  });

  test("creates team successfully", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("ADMIN"));
    mockPrisma.team.findFirst.mockResolvedValueOnce(null);
    mockPrisma.team.create.mockResolvedValueOnce({
      id: "team-1",
      name: "New Team",
      organizationId: "org-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    });
    mockPrisma.adminAudit.create.mockResolvedValueOnce({ id: "audit-1" });
    const req = new Request("http://localhost/api/admin/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "New Team" }),
    });
    const res = await createTeam(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.team.name).toBe("New Team");
  });
});

describe("GET /api/admin/teams/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const res = await getTeam({} as Request, { params: Promise.resolve({ id: "team-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when team not found", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("ADMIN"));
    mockPrisma.team.findFirst.mockResolvedValueOnce(null);
    const res = await getTeam({} as Request, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/admin/teams/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const req = new Request("http://localhost/api/admin/teams/team-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Updated Team" }),
    });
    const res = await updateTeam(req, { params: Promise.resolve({ id: "team-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when team not found", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("ADMIN"));
    mockPrisma.team.findFirst.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/admin/teams/missing", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Updated Team" }),
    });
    const res = await updateTeam(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/admin/teams/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const req = new Request("http://localhost/api/admin/teams/team-1", {
      method: "DELETE",
    });
    const res = await deleteTeam(req, { params: Promise.resolve({ id: "team-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when team not found", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("ADMIN"));
    mockPrisma.team.findFirst.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/admin/teams/missing", {
      method: "DELETE",
    });
    const res = await deleteTeam(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/admin/teams/[id]/memberships", () => {
  test("returns 401 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const res = await listMemberships({} as Request, { params: Promise.resolve({ id: "team-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when team not found", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("ADMIN"));
    mockPrisma.team.findFirst.mockResolvedValueOnce(null);
    const res = await listMemberships({} as Request, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/admin/teams/[id]/memberships", () => {
  test("returns 401 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const req = new Request("http://localhost/api/admin/teams/team-1/memberships", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "user-1" }),
    });
    const res = await addMember(req, { params: Promise.resolve({ id: "team-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when team not found", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("ADMIN"));
    mockPrisma.team.findFirst.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/admin/teams/missing/memberships", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "user-1" }),
    });
    const res = await addMember(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/admin/teams/[id]/memberships", () => {
  test("returns 401 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const req = new Request("http://localhost/api/admin/teams/team-1/memberships?userId=user-1", {
      method: "DELETE",
    });
    const res = await removeMember(req, { params: Promise.resolve({ id: "team-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when team not found", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("ADMIN"));
    mockPrisma.team.findFirst.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/admin/teams/missing/memberships?userId=user-1", {
      method: "DELETE",
    });
    const res = await removeMember(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/admin/audit-events", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await listAuditEvents({} as Request);
    expect(res.status).toBe(401);
  });

  test("returns 403 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
    });
    const res = await listAuditEvents({} as Request);
    expect(res.status).toBe(403);
  });

  test("returns audit events for admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "admin-1", role: "ADMIN", organizationId: "org-1" },
    });
    mockPrisma.adminAudit.findMany.mockResolvedValueOnce([
      {
        id: "audit-1",
        action: "CREATE",
        resource: "USER",
        resourceId: "user-1",
        actorId: "admin-1",
        actor: { id: "admin-1", name: "Admin", email: "admin@example.com" },
        data: {},
        createdAt: new Date("2024-01-01T00:00:00Z"),
      },
    ]);
    const res = await listAuditEvents({} as Request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.events)).toBe(true);
  });
});

describe("GET /api/admin/automation-rules", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await listAutomationRules();
    expect(res.status).toBe(401);
  });

  test("returns 403 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
    });
    const res = await listAutomationRules();
    expect(res.status).toBe(403);
  });
});

describe("POST /api/admin/automation-rules", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
    });
    const req = new Request("http://localhost/api/admin/automation-rules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Rule 1", triggerConfig: {}, actionConfig: {} }),
    });
    const res = await createAutomationRule(req);
    expect(res.status).toBe(403);
  });

  test("returns 400 when validation fails", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "admin-1", role: "ADMIN", organizationId: "org-1" },
    });
    const req = new Request("http://localhost/api/admin/automation-rules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await createAutomationRule(req);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/admin/automation-rules/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
    });
    const req = new Request("http://localhost/api/admin/automation-rules/rule-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Updated Rule" }),
    });
    const res = await updateAutomationRule(req, { params: Promise.resolve({ id: "rule-1" }) });
    expect(res.status).toBe(403);
  });

  test("returns 404 when rule not found", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "admin-1", role: "ADMIN", organizationId: "org-1" },
    });
    mockPrisma.automationRule.findFirst.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/admin/automation-rules/missing", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Updated Rule" }),
    });
    const res = await updateAutomationRule(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/admin/automation-rules/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
    });
    const req = new Request("http://localhost/api/admin/automation-rules/rule-1", {
      method: "DELETE",
    });
    const res = await deleteAutomationRule(req, { params: Promise.resolve({ id: "rule-1" }) });
    expect(res.status).toBe(403);
  });

  test("returns 404 when rule not found", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "admin-1", role: "ADMIN", organizationId: "org-1" },
    });
    mockPrisma.automationRule.findFirst.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/admin/automation-rules/missing", {
      method: "DELETE",
    });
    const res = await deleteAutomationRule(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/admin/sla-policies", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await listSlaPolicies();
    expect(res.status).toBe(401);
  });

  test("returns 403 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
    });
    const res = await listSlaPolicies();
    expect(res.status).toBe(403);
  });
});

describe("POST /api/admin/sla-policies", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
    });
    const req = new Request("http://localhost/api/admin/sla-policies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ priority: "WYSOKI", firstResponseHours: 2, resolveHours: 8 }),
    });
    const res = await createSlaPolicy(req);
    expect(res.status).toBe(403);
  });

  test("returns 400 when validation fails", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "admin-1", role: "ADMIN", organizationId: "org-1" },
    });
    const req = new Request("http://localhost/api/admin/sla-policies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await createSlaPolicy(req);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/admin/sla-policies/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
    });
    const req = new Request("http://localhost/api/admin/sla-policies/policy-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ firstResponseHours: 4 }),
    });
    const res = await updateSlaPolicy(req, { params: Promise.resolve({ id: "policy-1" }) });
    expect(res.status).toBe(403);
  });

  test("returns 404 when policy not found", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "admin-1", role: "ADMIN", organizationId: "org-1" },
    });
    mockPrisma.slaPolicy.findFirst.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/admin/sla-policies/missing", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ firstResponseHours: 4 }),
    });
    const res = await updateSlaPolicy(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/admin/sla-policies/[id]", () => {
  test("returns 401 when user is not admin", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "AGENT", organizationId: "org-1" },
    });
    const req = new Request("http://localhost/api/admin/sla-policies/policy-1", {
      method: "DELETE",
    });
    const res = await deleteSlaPolicy(req, { params: Promise.resolve({ id: "policy-1" }) });
    expect(res.status).toBe(403);
  });

  test("returns 404 when policy not found", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "admin-1", role: "ADMIN", organizationId: "org-1" },
    });
    mockPrisma.slaPolicy.findFirst.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/admin/sla-policies/missing", {
      method: "DELETE",
    });
    const res = await deleteSlaPolicy(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/notifications", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await listNotifications();
    expect(res.status).toBe(401);
  });

  test("returns notifications successfully", async () => {
    mockPrisma.inAppNotification.findMany.mockResolvedValueOnce([
      {
        id: "notif-1",
        userId: "user-1",
        type: "ticketUpdate",
        title: "Ticket Updated",
        message: "Your ticket has been updated",
        readAt: null,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        metadata: {},
      },
    ]);
    const res = await listNotifications();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.notifications)).toBe(true);
  });
});

describe("PATCH /api/notifications/[id]/read", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/notifications/notif-1/read", {
      method: "PATCH",
    });
    const res = await markNotificationRead(req, { params: Promise.resolve({ id: "notif-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when notification not found", async () => {
    mockPrisma.inAppNotification.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/notifications/missing/read", {
      method: "PATCH",
    });
    const res = await markNotificationRead(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/views", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await listViews();
    expect(res.status).toBe(401);
  });

  test("returns views successfully", async () => {
    mockPrisma.savedView.findMany.mockResolvedValueOnce([
      {
        id: "view-1",
        userId: "user-1",
        organizationId: "org-1",
        name: "My View",
        filters: {},
        isDefault: false,
        isShared: false,
        isTeam: false,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      },
    ]);
    const res = await listViews();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.views)).toBe(true);
  });
});

describe("POST /api/views", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "New View", filters: {} }),
    });
    const res = await createView(req);
    expect(res.status).toBe(401);
  });

  test("returns 400 when validation fails", async () => {
    const req = new Request("http://localhost/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await createView(req);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/views/[id]", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/views/view-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Updated View" }),
    });
    const res = await updateView(req, { params: Promise.resolve({ id: "view-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when view not found", async () => {
    mockPrisma.savedView.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/views/missing", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Updated View" }),
    });
    const res = await updateView(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/views/[id]", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/views/view-1", {
      method: "DELETE",
    });
    const res = await deleteView(req, { params: Promise.resolve({ id: "view-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when view not found", async () => {
    mockPrisma.savedView.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/views/missing", {
      method: "DELETE",
    });
    const res = await deleteView(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/views/[id]/set-default", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/views/view-1/set-default", {
      method: "POST",
    });
    const res = await setDefaultView(req, { params: Promise.resolve({ id: "view-1" }) });
    expect(res.status).toBe(401);
  });

  test("returns 404 when view not found", async () => {
    mockPrisma.savedView.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/views/missing/set-default", {
      method: "POST",
    });
    const res = await setDefaultView(req, { params: Promise.resolve({ id: "missing" }) });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/reports/kpi", () => {
  test("returns 401 when session is missing", async () => {
    mockGetServerSession.mockResolvedValueOnce(null);
    const res = await getKpi({} as Request);
    expect(res.status).toBe(401);
  });

  test("returns 403 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const res = await getKpi({} as Request);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/reports/analytics", () => {
  test("returns 401 when session is missing", async () => {
    mockGetServerSession.mockResolvedValueOnce(null);
    const res = await getAnalytics({} as Request);
    expect(res.status).toBe(401);
  });

  test("returns 403 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const res = await getAnalytics({} as Request);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/reports/csat", () => {
  test("returns 401 when session is missing", async () => {
    mockGetServerSession.mockResolvedValueOnce(null);
    const res = await getCsat({} as Request);
    expect(res.status).toBe(401);
  });

  test("returns 403 when user is not admin", async () => {
    mockGetServerSession.mockResolvedValueOnce(makeSession("AGENT"));
    const res = await getCsat({} as Request);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/reports/export/tickets", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await exportTickets({} as Request);
    expect(res.status).toBe(401);
  });

  test("returns 403 when user is requester", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: true,
      user: { id: "user-1", role: "REQUESTER", organizationId: "org-1" },
    });
    const res = await exportTickets({} as Request);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/reports/export/comments", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await exportComments({} as Request);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/categories", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await listCategories();
    expect(res.status).toBe(401);
  });

  test("returns categories successfully", async () => {
    mockPrisma.category.findMany.mockResolvedValueOnce([
      {
        id: "cat-1",
        name: "Category 1",
        description: "Description",
        organizationId: "org-1",
        createdAt: new Date("2024-01-01T00:00:00Z"),
      },
    ]);
    const res = await listCategories();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.categories)).toBe(true);
  });
});

describe("GET /api/tags", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const res = await listTags();
    expect(res.status).toBe(401);
  });

  test("returns tags successfully", async () => {
    mockPrisma.tag.findMany.mockResolvedValueOnce([
      {
        id: "tag-1",
        name: "Tag 1",
        organizationId: "org-1",
        createdAt: new Date("2024-01-01T00:00:00Z"),
      },
    ]);
    const res = await listTags();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.tags)).toBe(true);
  });
});

describe("POST /api/sla/preview", () => {
  test("returns 401 when session is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    });
    const req = new Request("http://localhost/api/sla/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ priority: "WYSOKI" }),
    });
    const res = await previewSla(req);
    expect(res.status).toBe(401);
  });

  test("returns 400 when validation fails", async () => {
    const req = new Request("http://localhost/api/sla/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await previewSla(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/health", () => {
  test("returns health status", async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);
    const res = await healthCheck();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("database");
    expect(body).toHaveProperty("timestamp");
  });
});
