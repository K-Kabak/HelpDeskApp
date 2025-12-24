import { describe, expect, it, vi, beforeEach } from "vitest";
import { PATCH } from "@/app/api/tickets/bulk/route";
import { TicketStatus, Role } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAgentOrAdmin: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  jsonMock: vi.fn((body, init?: { status?: number }) => ({
    status: init?.status ?? 200,
    json: async () => body,
  })),
  scheduleSlaJobsForTicket: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: mocks.jsonMock,
  },
}));

vi.mock("@/lib/authorization", () => ({
  requireAuth: () => mocks.requireAuth(),
  isAgentOrAdmin: (user: { role: string }) => mocks.isAgentOrAdmin(user),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ticket: {
      findMany: mocks.findMany,
      update: mocks.update,
    },
    user: {
      findFirst: mocks.findFirst,
    },
    team: {
      findFirst: mocks.findFirst,
    },
    auditEvent: {
      create: mocks.create,
    },
    $transaction: vi.fn(async (queries: unknown[]) => {
      const results = [];
      for (const query of queries) {
        if (typeof query === "function") {
          results.push(await query());
        } else {
          results.push(await query);
        }
      }
      return results;
    }),
  },
}));

vi.mock("@/lib/sla-scheduler", () => ({
  scheduleSlaJobsForTicket: mocks.scheduleSlaJobsForTicket,
}));

vi.mock("@/lib/sla-pause", () => ({
  deriveSlaPauseUpdates: vi.fn(() => ({})),
}));

vi.mock("@/lib/logger", () => ({
  createRequestLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe("Bulk Actions API", () => {
  const mockAgent = {
    id: "agent-1",
    role: "AGENT" as Role,
    organizationId: "org-1",
  };

  const mockAdmin = {
    id: "admin-1",
    role: "ADMIN" as Role,
    organizationId: "org-1",
  };

  const mockRequester = {
    id: "requester-1",
    role: "REQUESTER" as Role,
    organizationId: "org-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({
      ok: true,
      user: mockAgent,
    });
    mocks.isAgentOrAdmin.mockReturnValue(true);
  });

  describe("Authorization", () => {
    it("rejects unauthenticated requests", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: false,
        response: { status: 401, json: async () => ({ error: "Unauthorized" }) },
      });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({ ticketIds: ["ticket-1"] }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(401);
    });

    it("rejects REQUESTER role", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: true,
        user: mockRequester,
      });
      mocks.isAgentOrAdmin.mockReturnValue(false);

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          status: TicketStatus.W_TOKU,
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(403);
    });

    it("allows AGENT role", async () => {
      mocks.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
      ]);
      mocks.update.mockResolvedValue({
        id: "ticket-1",
        status: TicketStatus.W_TOKU,
        organizationId: "org-1",
        priority: "SREDNI" as const,
        requesterId: "requester-1",
        firstResponseDue: null,
        resolveDue: null,
      });
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          status: TicketStatus.W_TOKU,
        }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.updated).toBe(1);
    });

    it("allows ADMIN role", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: true,
        user: mockAdmin,
      });
      mocks.isAgentOrAdmin.mockReturnValue(true);
      mocks.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
      ]);
      mocks.update.mockResolvedValue({
        id: "ticket-1",
        status: TicketStatus.W_TOKU,
        organizationId: "org-1",
        priority: "SREDNI" as const,
        requesterId: "requester-1",
        firstResponseDue: null,
        resolveDue: null,
      });
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          status: TicketStatus.W_TOKU,
        }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.updated).toBe(1);
    });
  });

  describe("Organization Scoping", () => {
    it("only updates tickets in user's organization", async () => {
      mocks.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
        // ticket-2 is in different org, should not be found
      ]);

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1", "ticket-2"],
          status: TicketStatus.W_TOKU,
        }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(mocks.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["ticket-1", "ticket-2"] },
          organizationId: "org-1",
        },
        select: expect.any(Object),
      });

      // Only ticket-1 should be updated
      expect(body.updated).toBe(1);
      expect(body.errors).toHaveLength(1);
      expect(body.errors[0].ticketId).toBe("ticket-2");
    });
  });

  describe("Bulk Status Update", () => {
    it("updates multiple tickets status", async () => {
      mocks.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
        {
          id: "ticket-2",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "WYSOKI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
      ]);
      mocks.update
        .mockResolvedValueOnce({
          id: "ticket-1",
          status: TicketStatus.W_TOKU,
          organizationId: "org-1",
          priority: "SREDNI" as const,
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
        })
        .mockResolvedValueOnce({
          id: "ticket-2",
          status: TicketStatus.W_TOKU,
          organizationId: "org-1",
          priority: "WYSOKI" as const,
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
        });
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1", "ticket-2"],
          status: TicketStatus.W_TOKU,
        }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.updated).toBe(2);
      expect(body.errors).toBeUndefined();
      expect(mocks.update).toHaveBeenCalledTimes(2);
      expect(mocks.create).toHaveBeenCalledTimes(2);
    });

    it("handles status change to RESOLVED", async () => {
      const now = new Date();
      mocks.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          status: TicketStatus.W_TOKU,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
      ]);
      mocks.update.mockResolvedValue({
        id: "ticket-1",
        status: TicketStatus.ROZWIAZANE,
        organizationId: "org-1",
        priority: "SREDNI" as const,
        requesterId: "requester-1",
        firstResponseDue: null,
        resolveDue: null,
        resolvedAt: now,
        closedAt: null,
      });
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          status: TicketStatus.ROZWIAZANE,
        }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.updated).toBe(1);
      expect(mocks.update).toHaveBeenCalledWith({
        where: { id: "ticket-1" },
        data: expect.objectContaining({
          status: TicketStatus.ROZWIAZANE,
          resolvedAt: expect.any(Date),
          closedAt: null,
        }),
      });
    });
  });

  describe("Bulk Assignment", () => {
    it("assigns multiple tickets to user", async () => {
      mocks.findFirst.mockResolvedValueOnce({
        id: "agent-2",
        organizationId: "org-1",
        role: "AGENT",
      });
      mocks.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
        {
          id: "ticket-2",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
      ]);
      mocks.update.mockResolvedValue({
        id: "ticket-1",
        status: TicketStatus.NOWE,
        organizationId: "org-1",
        priority: "SREDNI" as const,
        requesterId: "requester-1",
        firstResponseDue: null,
        resolveDue: null,
      });
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1", "ticket-2"],
          assigneeUserId: "agent-2",
        }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.updated).toBe(2);
      expect(mocks.findFirst).toHaveBeenCalledWith({
        where: {
          id: "agent-2",
          organizationId: "org-1",
          role: { in: ["AGENT", "ADMIN"] },
        },
      });
    });

    it("assigns multiple tickets to team", async () => {
      mocks.findFirst.mockResolvedValueOnce({
        id: "team-1",
        organizationId: "org-1",
        name: "Support Team",
      });
      mocks.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
      ]);
      mocks.update.mockResolvedValue({
        id: "ticket-1",
        status: TicketStatus.NOWE,
        organizationId: "org-1",
        priority: "SREDNI" as const,
        requesterId: "requester-1",
        firstResponseDue: null,
        resolveDue: null,
      });
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          assigneeTeamId: "team-1",
        }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.updated).toBe(1);
      expect(mocks.findFirst).toHaveBeenCalledWith({
        where: {
          id: "team-1",
          organizationId: "org-1",
        },
      });
    });

    it("rejects invalid assignee", async () => {
      mocks.findFirst.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          assigneeUserId: "invalid-agent",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });
  });

  describe("Partial Failures", () => {
    it("returns partial success when some tickets fail", async () => {
      mocks.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
        {
          id: "ticket-2",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
      ]);
      mocks.update
        .mockResolvedValueOnce({
          id: "ticket-1",
          status: TicketStatus.W_TOKU,
          organizationId: "org-1",
          priority: "SREDNI" as const,
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
        })
        .mockRejectedValueOnce(new Error("Database error"));
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1", "ticket-2"],
          status: TicketStatus.W_TOKU,
        }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.updated).toBe(1);
      expect(body.errors).toHaveLength(1);
      expect(body.errors[0].ticketId).toBe("ticket-2");
      expect(body.errors[0].error).toBe("Database error");
    });
  });

  describe("Audit Event Creation", () => {
    it("creates audit event for each ticket update", async () => {
      mocks.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          status: TicketStatus.NOWE,
          assigneeUserId: null,
          assigneeTeamId: null,
          priority: "SREDNI" as const,
          organizationId: "org-1",
          requesterId: "requester-1",
          firstResponseDue: null,
          resolveDue: null,
          resolvedAt: null,
          closedAt: null,
          lastReopenedAt: null,
        },
      ]);
      mocks.update.mockResolvedValue({
        id: "ticket-1",
        status: TicketStatus.W_TOKU,
        organizationId: "org-1",
        priority: "SREDNI" as const,
        requesterId: "requester-1",
        firstResponseDue: null,
        resolveDue: null,
      });
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          status: TicketStatus.W_TOKU,
        }),
      });

      await PATCH(req);

      expect(mocks.create).toHaveBeenCalledWith({
        data: {
          ticketId: "ticket-1",
          actorId: "agent-1",
          action: "TICKET_UPDATED",
          data: expect.objectContaining({
            changes: expect.objectContaining({
              status: { from: TicketStatus.NOWE, to: TicketStatus.W_TOKU },
            }),
            bulkUpdate: true,
          }),
        },
      });
    });
  });

  describe("Validation", () => {
    it("requires at least one update field", async () => {
      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });

    it("validates ticketIds array", async () => {
      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: [],
          status: TicketStatus.W_TOKU,
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });

    it("validates ticketIds max length", async () => {
      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: Array(101).fill("ticket-1"),
          status: TicketStatus.W_TOKU,
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });
  });
});

