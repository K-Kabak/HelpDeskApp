import { describe, expect, it, vi, beforeEach } from "vitest";
import { PATCH } from "@/app/api/tickets/[id]/route";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { NotificationService } from "@/lib/notification";

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  csatRequest: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  auditEvent: {
    create: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
  team: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: () => mockGetServerSession(),
  authOptions: {},
}));

const mockScheduleSlaJobs = vi.fn();
vi.mock("@/lib/sla-scheduler", () => ({
  scheduleSlaJobsForTicket: mockScheduleSlaJobs,
}));

const mockNotificationService: NotificationService = {
  send: vi.fn(async () => ({ id: "notif-1", status: "queued", deduped: false })),
};

vi.mock("@/lib/notification", () => ({
  notificationService: mockNotificationService,
}));

const makeSession = (role: "REQUESTER" | "AGENT" | "ADMIN") => ({
  user: {
    id: "user-1",
    email: "user@example.com",
    role,
    organizationId: "org-1",
  },
});

describe("CSAT trigger on resolution/closure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScheduleSlaJobs.mockResolvedValue(undefined);
  });

  it("creates CSAT request on first transition to ROZWIAZANE", async () => {
    const ticketId = "ticket-1";
    const mockTicket = {
      id: ticketId,
      number: 1,
      status: TicketStatus.W_TOKU,
      priority: TicketPriority.SREDNI,
      requesterId: "user-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      organizationId: "org-1",
      resolvedAt: null,
      closedAt: null,
      firstResponseDue: null,
      resolveDue: null,
    };

    const updatedTicket = {
      ...mockTicket,
      status: TicketStatus.ROZWIAZANE,
      resolvedAt: new Date(),
      requester: { email: "requester@example.com" },
      assigneeUser: null,
      assigneeTeam: null,
    };

    mockGetServerSession.mockResolvedValue(makeSession("AGENT"));
    mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
    mockPrisma.csatRequest.findUnique.mockResolvedValue(null);
    mockPrisma.csatRequest.create.mockResolvedValue({
      id: "csat-1",
      ticketId,
      createdAt: new Date(),
    });
    mockPrisma.$transaction.mockImplementation(async (queries) => {
      if (Array.isArray(queries)) {
        return [updatedTicket, { id: "audit-1" }];
      }
      return queries(mockPrisma);
    });

    const req = new Request(`http://localhost/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: TicketStatus.ROZWIAZANE }),
    });

    const res = await PATCH(req, { params: { id: ticketId } });
    expect(res.status).toBe(200);

    expect(mockPrisma.csatRequest.findUnique).toHaveBeenCalledWith({
      where: { ticketId },
    });
    expect(mockPrisma.csatRequest.create).toHaveBeenCalledWith({
      data: { ticketId },
    });
    expect(mockNotificationService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "email",
        to: "requester@example.com",
        idempotencyKey: `csat-${ticketId}`,
      })
    );
  });

  it("creates CSAT request on first transition to ZAMKNIETE", async () => {
    const ticketId = "ticket-2";
    const mockTicket = {
      id: ticketId,
      number: 2,
      status: TicketStatus.W_TOKU,
      priority: TicketPriority.SREDNI,
      requesterId: "user-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      organizationId: "org-1",
      resolvedAt: null,
      closedAt: null,
      firstResponseDue: null,
      resolveDue: null,
    };

    const updatedTicket = {
      ...mockTicket,
      status: TicketStatus.ZAMKNIETE,
      closedAt: new Date(),
      requester: { email: "requester@example.com" },
      assigneeUser: null,
      assigneeTeam: null,
    };

    mockGetServerSession.mockResolvedValue(makeSession("AGENT"));
    mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
    mockPrisma.csatRequest.findUnique.mockResolvedValue(null);
    mockPrisma.csatRequest.create.mockResolvedValue({
      id: "csat-2",
      ticketId,
      createdAt: new Date(),
    });
    mockPrisma.$transaction.mockImplementation(async (queries) => {
      if (Array.isArray(queries)) {
        return [updatedTicket, { id: "audit-1" }];
      }
      return queries(mockPrisma);
    });

    const req = new Request(`http://localhost/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: TicketStatus.ZAMKNIETE }),
    });

    const res = await PATCH(req, { params: { id: ticketId } });
    expect(res.status).toBe(200);

    expect(mockPrisma.csatRequest.findUnique).toHaveBeenCalledWith({
      where: { ticketId },
    });
    expect(mockPrisma.csatRequest.create).toHaveBeenCalledWith({
      data: { ticketId },
    });
    expect(mockNotificationService.send).toHaveBeenCalled();
  });

  it("does not create duplicate CSAT request on repeated transitions", async () => {
    const ticketId = "ticket-3";
    const mockTicket = {
      id: ticketId,
      number: 3,
      status: TicketStatus.ROZWIAZANE,
      priority: TicketPriority.SREDNI,
      requesterId: "user-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      organizationId: "org-1",
      resolvedAt: new Date(),
      closedAt: null,
      firstResponseDue: null,
      resolveDue: null,
    };

    const updatedTicket = {
      ...mockTicket,
      requester: { email: "requester@example.com" },
      assigneeUser: null,
      assigneeTeam: null,
    };

    const existingCsat = {
      id: "csat-3",
      ticketId,
      createdAt: new Date(),
    };

    mockGetServerSession.mockResolvedValue(makeSession("AGENT"));
    mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
    mockPrisma.csatRequest.findUnique.mockResolvedValue(existingCsat);
    mockPrisma.$transaction.mockImplementation(async (queries) => {
      if (Array.isArray(queries)) {
        return [updatedTicket, { id: "audit-1" }];
      }
      return queries(mockPrisma);
    });

    const req = new Request(`http://localhost/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: TicketStatus.ROZWIAZANE }),
    });

    const res = await PATCH(req, { params: { id: ticketId } });
    expect(res.status).toBe(200);

    expect(mockPrisma.csatRequest.findUnique).toHaveBeenCalledWith({
      where: { ticketId },
    });
    expect(mockPrisma.csatRequest.create).not.toHaveBeenCalled();
    expect(mockNotificationService.send).not.toHaveBeenCalled();
  });

  it("does not create CSAT request on non-final status transitions", async () => {
    const ticketId = "ticket-4";
    const mockTicket = {
      id: ticketId,
      number: 4,
      status: TicketStatus.NOWE,
      priority: TicketPriority.SREDNI,
      requesterId: "user-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      organizationId: "org-1",
      resolvedAt: null,
      closedAt: null,
      firstResponseDue: null,
      resolveDue: null,
    };

    const updatedTicket = {
      ...mockTicket,
      status: TicketStatus.W_TOKU,
      requester: { email: "requester@example.com" },
      assigneeUser: null,
      assigneeTeam: null,
    };

    mockGetServerSession.mockResolvedValue(makeSession("AGENT"));
    mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
    mockPrisma.$transaction.mockImplementation(async (queries) => {
      if (Array.isArray(queries)) {
        return [updatedTicket, { id: "audit-1" }];
      }
      return queries(mockPrisma);
    });

    const req = new Request(`http://localhost/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: TicketStatus.W_TOKU }),
    });

    const res = await PATCH(req, { params: { id: ticketId } });
    expect(res.status).toBe(200);

    expect(mockPrisma.csatRequest.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.csatRequest.create).not.toHaveBeenCalled();
    expect(mockNotificationService.send).not.toHaveBeenCalled();
  });
});

