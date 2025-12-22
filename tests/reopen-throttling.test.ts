import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PATCH as updateTicket } from "@/app/api/tickets/[id]/route";
import { TicketStatus } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  auditEvent: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/sla-pause", () => ({
  deriveSlaPauseUpdates: () => ({}),
}));

vi.mock("@/lib/sla-scheduler", () => ({
  scheduleSlaJobsForTicket: vi.fn(),
}));

const originalEnv = {
  enabled: process.env.REOPEN_COOLDOWN_ENABLED,
  cooldown: process.env.REOPEN_COOLDOWN_MS,
};

function makeSession(role: "REQUESTER" | "AGENT" | "ADMIN" = "REQUESTER") {
  return {
    user: {
      id: "user-1",
      role,
      organizationId: "org-1",
    },
  };
}

function makeTicket(overrides: Partial<typeof baseTicket> = {}) {
  return { ...baseTicket, ...overrides };
}

const baseTicket = {
  id: "t1",
  number: 1,
  title: "Test ticket",
  descriptionMd: "Body",
  status: TicketStatus.ZAMKNIETE,
  priority: "SREDNI" as const,
  category: null,
  requesterId: "user-1",
  assigneeUserId: null,
  assigneeTeamId: null,
  organizationId: "org-1",
  firstResponseAt: null,
  firstResponseDue: null,
  resolveDue: null,
  resolvedAt: null,
  closedAt: new Date("2024-01-01T00:00:00Z"),
  slaPausedAt: null,
  slaResumedAt: null,
  slaPauseTotalSeconds: 0,
  lastReopenedAt: null,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

beforeEach(() => {
  process.env.REOPEN_COOLDOWN_ENABLED = "true";
  process.env.REOPEN_COOLDOWN_MS = "1000"; // 1 second for testing
  mockGetServerSession.mockResolvedValue(makeSession("REQUESTER"));
  mockPrisma.$transaction.mockImplementation(async (callback) => {
    return callback(mockPrisma);
  });
});

afterEach(() => {
  mockGetServerSession.mockReset();
  Object.values(mockPrisma).forEach((group) => {
    if (typeof group === "object" && group !== null) {
      Object.values(group).forEach((fn) => {
        if (typeof fn === "function") {
          fn.mockReset();
        }
      });
    }
  });
  process.env.REOPEN_COOLDOWN_ENABLED = originalEnv.enabled;
  process.env.REOPEN_COOLDOWN_MS = originalEnv.cooldown;
});

describe("Reopen throttling", () => {
  test("blocks reopen within cooldown window", async () => {
    const now = new Date();
    const recentReopen = new Date(now.getTime() - 500); // 500ms ago (within 1000ms cooldown)

    mockPrisma.ticket.findUnique.mockResolvedValue(
      makeTicket({
        status: TicketStatus.ZAMKNIETE,
        lastReopenedAt: recentReopen,
      })
    );

    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: TicketStatus.PONOWNIE_OTWARTE,
        reopenReason: "Test reason for reopening",
      }),
    });

    const res = await updateTicket(req, { params: { id: "t1" } });
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe("Reopen cooldown active");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  test("allows reopen after cooldown window", async () => {
    const now = new Date();
    const oldReopen = new Date(now.getTime() - 2000); // 2 seconds ago (outside 1000ms cooldown)

    mockPrisma.ticket.findUnique.mockResolvedValue(
      makeTicket({
        status: TicketStatus.ZAMKNIETE,
        lastReopenedAt: oldReopen,
      })
    );

    const updatedTicket = {
      ...makeTicket({
        status: TicketStatus.PONOWNIE_OTWARTE,
        lastReopenedAt: now,
        resolvedAt: null,
        closedAt: null,
      }),
      requester: { id: "user-1", name: "User", email: "user@test.com" },
      assigneeUser: null,
      assigneeTeam: null,
    };

    mockPrisma.ticket.update.mockResolvedValue(updatedTicket);
    mockPrisma.auditEvent.create.mockResolvedValue({
      id: "audit-1",
      ticketId: "t1",
      actorId: "user-1",
      action: "TICKET_UPDATED",
      data: {},
      createdAt: now,
    });

    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: TicketStatus.PONOWNIE_OTWARTE,
        reopenReason: "Test reason for reopening",
      }),
    });

    const res = await updateTicket(req, { params: { id: "t1" } });
    expect(res.status).toBe(200);
    expect(mockPrisma.ticket.update).toHaveBeenCalled();
    const updateCall = mockPrisma.ticket.update.mock.calls[0][0];
    expect(updateCall.data.lastReopenedAt).toBeInstanceOf(Date);
  });

  test("allows first reopen (no previous reopen)", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue(
      makeTicket({
        status: TicketStatus.ZAMKNIETE,
        lastReopenedAt: null,
      })
    );

    const now = new Date();
    const updatedTicket = {
      ...makeTicket({
        status: TicketStatus.PONOWNIE_OTWARTE,
        lastReopenedAt: now,
        resolvedAt: null,
        closedAt: null,
      }),
      requester: { id: "user-1", name: "User", email: "user@test.com" },
      assigneeUser: null,
      assigneeTeam: null,
    };

    mockPrisma.ticket.update.mockResolvedValue(updatedTicket);
    mockPrisma.auditEvent.create.mockResolvedValue({
      id: "audit-1",
      ticketId: "t1",
      actorId: "user-1",
      action: "TICKET_UPDATED",
      data: {},
      createdAt: now,
    });

    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: TicketStatus.PONOWNIE_OTWARTE,
        reopenReason: "Test reason for reopening",
      }),
    });

    const res = await updateTicket(req, { params: { id: "t1" } });
    expect(res.status).toBe(200);
  });

  test("allows reopen when cooldown is disabled", async () => {
    process.env.REOPEN_COOLDOWN_ENABLED = "false";

    const now = new Date();
    const recentReopen = new Date(now.getTime() - 500);

    mockPrisma.ticket.findUnique.mockResolvedValue(
      makeTicket({
        status: TicketStatus.ZAMKNIETE,
        lastReopenedAt: recentReopen,
      })
    );

    const updatedTicket = {
      ...makeTicket({
        status: TicketStatus.PONOWNIE_OTWARTE,
        lastReopenedAt: now,
        resolvedAt: null,
        closedAt: null,
      }),
      requester: { id: "user-1", name: "User", email: "user@test.com" },
      assigneeUser: null,
      assigneeTeam: null,
    };

    mockPrisma.ticket.update.mockResolvedValue(updatedTicket);
    mockPrisma.auditEvent.create.mockResolvedValue({
      id: "audit-1",
      ticketId: "t1",
      actorId: "user-1",
      action: "TICKET_UPDATED",
      data: {},
      createdAt: now,
    });

    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: TicketStatus.PONOWNIE_OTWARTE,
        reopenReason: "Test reason for reopening",
      }),
    });

    const res = await updateTicket(req, { params: { id: "t1" } });
    expect(res.status).toBe(200);
  });

  test("does not check cooldown when status is not changing to reopened", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue(
      makeTicket({
        status: TicketStatus.NOWE,
        lastReopenedAt: new Date(Date.now() - 500),
      })
    );

    const now = new Date();
    const updatedTicket = {
      ...makeTicket({
        status: TicketStatus.ZAMKNIETE,
        closedAt: now,
      }),
      requester: { id: "user-1", name: "User", email: "user@test.com" },
      assigneeUser: null,
      assigneeTeam: null,
    };

    mockPrisma.ticket.update.mockResolvedValue(updatedTicket);
    mockPrisma.auditEvent.create.mockResolvedValue({
      id: "audit-1",
      ticketId: "t1",
      actorId: "user-1",
      action: "TICKET_UPDATED",
      data: {},
      createdAt: now,
    });

    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: TicketStatus.ZAMKNIETE,
      }),
    });

    const res = await updateTicket(req, { params: { id: "t1" } });
    expect(res.status).toBe(200);
  });

  test("does not check cooldown when ticket is already reopened", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue(
      makeTicket({
        status: TicketStatus.PONOWNIE_OTWARTE,
        lastReopenedAt: new Date(Date.now() - 500),
      })
    );

    const now = new Date();
    const updatedTicket = {
      ...makeTicket({
        status: TicketStatus.PONOWNIE_OTWARTE,
      }),
      requester: { id: "user-1", name: "User", email: "user@test.com" },
      assigneeUser: null,
      assigneeTeam: null,
    };

    mockPrisma.ticket.update.mockResolvedValue(updatedTicket);
    mockPrisma.auditEvent.create.mockResolvedValue({
      id: "audit-1",
      ticketId: "t1",
      actorId: "user-1",
      action: "TICKET_UPDATED",
      data: {},
      createdAt: now,
    });

    const req = new Request("http://localhost/api/tickets/t1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: TicketStatus.PONOWNIE_OTWARTE,
      }),
    });

    const res = await updateTicket(req, { params: { id: "t1" } });
    expect(res.status).toBe(200);
  });
});

