import { describe, expect, it, vi, beforeEach } from "vitest";
import { TicketStatus, TicketPriority, Role } from "@prisma/client";
import { PATCH as bulkUpdateTickets } from "@/app/api/tickets/bulk/route";

const mocks = vi.hoisted(() => ({
  jsonMock: vi.fn((body: unknown, init?: { status?: number }) => ({
    status: init?.status ?? 200,
    body,
    json: async () => body,
  })),
  requireAuth: vi.fn(),
  checkRateLimit: vi.fn(),
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    securityEvent: vi.fn(),
  })),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  scheduleSlaJobsForTicket: vi.fn(),
  evaluateAutomationRules: vi.fn(),
  deriveSlaPauseUpdates: vi.fn(() => ({})),
  $transaction: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: mocks.jsonMock,
  },
}));

vi.mock("@/lib/authorization", () => ({
  requireAuth: () => mocks.requireAuth(),
  isAgentOrAdmin: vi.fn((user: { role: string }) => user.role !== "REQUESTER"),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => mocks.checkRateLimit(),
}));

vi.mock("@/lib/logger", () => ({
  createRequestLogger: () => mocks.createLogger(),
}));

vi.mock("@/lib/sla-pause", () => ({
  deriveSlaPauseUpdates: () => mocks.deriveSlaPauseUpdates(),
}));

vi.mock("@/lib/sla-scheduler", () => ({
  scheduleSlaJobsForTicket: mocks.scheduleSlaJobsForTicket,
}));

vi.mock("@/lib/automation-rules", () => ({
  evaluateAutomationRules: mocks.evaluateAutomationRules,
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
    auditEvent: {
      create: mocks.create,
    },
    $transaction: mocks.$transaction,
  },
}));

describe("Bulk Actions Integration", () => {
  const agentUser = {
    id: "agent-1",
    role: Role.AGENT,
    organizationId: "org-1",
  };

  const mockTickets = [
    {
      id: "ticket-1",
      organizationId: "org-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      status: TicketStatus.NOWE,
      priority: TicketPriority.SREDNIE,
      requester: { id: "user-1" },
      assigneeUser: null,
      assigneeTeam: null,
    },
    {
      id: "ticket-2",
      organizationId: "org-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      status: TicketStatus.NOWE,
      priority: TicketPriority.SREDNIE,
      requester: { id: "user-1" },
      assigneeUser: null,
      assigneeTeam: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ ok: true, user: agentUser });
    mocks.checkRateLimit.mockReturnValue({ allowed: true });
    // Mock $transaction to handle array of Prisma operations (which are promises)
    mocks.$transaction.mockImplementation(async (operations: unknown[]) => {
      if (Array.isArray(operations)) {
        // Prisma $transaction receives an array of promises from Prisma operations
        // We need to await all of them
        const results = await Promise.all(operations as Promise<unknown>[]);
        return results;
      }
      return Promise.resolve(operations);
    });
  });

  describe("Bulk Assign", () => {
    it("assigns tickets to an agent", async () => {
      mocks.findMany.mockResolvedValue(mockTickets);
      mocks.findFirst.mockResolvedValue({
        id: "assignee-1",
        role: Role.AGENT,
        organizationId: "org-1",
      });
      
      const updatedTicket = {
        ...mockTickets[0],
        assigneeUserId: "assignee-1",
      };
      
      mocks.update.mockResolvedValue(updatedTicket);
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1", "ticket-2"],
          action: "assign",
          value: "assignee-1",
        }),
      });

      await bulkUpdateTickets(req);
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(mocks.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["ticket-1", "ticket-2"] },
          organizationId: "org-1",
        },
        include: {
          requester: true,
          assigneeUser: true,
          assigneeTeam: true,
        },
      });
      expect(mocks.findFirst).toHaveBeenCalledWith({
        where: {
          id: "assignee-1",
          organizationId: "org-1",
          role: { in: ["AGENT", "ADMIN"] },
        },
      });
    });

    it("rejects bulk assign from requester", async () => {
      const requesterUser = {
        id: "requester-1",
        role: Role.REQUESTER,
        organizationId: "org-1",
      };
      mocks.requireAuth.mockResolvedValue({ ok: true, user: requesterUser });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          action: "assign",
          value: "assignee-1",
        }),
      });

      await bulkUpdateTickets(req);
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(403);
      expect(mocks.findMany).not.toHaveBeenCalled();
    });

    it("rejects invalid assignee", async () => {
      mocks.findMany.mockResolvedValue(mockTickets);
      mocks.findFirst.mockResolvedValue(null); // Assignee not found

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          action: "assign",
          value: "invalid-user",
        }),
      });

      await bulkUpdateTickets(req);
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(400);
    });
  });

  describe("Bulk Status Change", () => {
    it("changes status of multiple tickets", async () => {
      mocks.findMany.mockResolvedValue(mockTickets);
      const updatedTicket = {
        ...mockTickets[0],
        status: TicketStatus.W_TOKU,
      };
      mocks.update.mockResolvedValue(updatedTicket);
      mocks.create.mockResolvedValue({ id: "audit-1" });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1", "ticket-2"],
          action: "status",
          value: TicketStatus.W_TOKU,
        }),
      });

      await bulkUpdateTickets(req);
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(mocks.update).toHaveBeenCalled();
    });

    it("rejects invalid status", async () => {
      mocks.findMany.mockResolvedValue(mockTickets);

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          action: "status",
          value: "INVALID_STATUS",
        }),
      });

      await bulkUpdateTickets(req);
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(400);
    });
  });

  describe("Error Handling", () => {
    it("returns 401 when not authenticated", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: false,
        response: { status: 401, body: { error: "Unauthorized" } },
      });

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["ticket-1"],
          action: "assign",
          value: "assignee-1",
        }),
      });

      const result = await bulkUpdateTickets(req);
      expect(result.status).toBe(401);
    });

    it("handles tickets not found", async () => {
      mocks.findMany.mockResolvedValue([]); // No tickets found

      const req = new Request("http://localhost/api/tickets/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ticketIds: ["non-existent"],
          action: "assign",
          value: "assignee-1",
        }),
      });

      await bulkUpdateTickets(req);
      const response = mocks.jsonMock.mock.results[0].value;
      const body = await response.json();

      expect(body.failed).toBe(1);
      expect(body.errors).toHaveLength(1);
    });
  });
});

