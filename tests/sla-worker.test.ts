import { describe, expect, it, vi } from "vitest";
import { TicketPriority, TicketStatus } from "@prisma/client";

import { NotificationService } from "@/lib/notification";
import { createSlaJobPayload } from "@/lib/sla-jobs";
import { handleSlaJob } from "@/lib/sla-worker";

const mockTicket = {
  id: "00000000-0000-0000-0000-000000000000",
  number: 100,
  requesterId: "user-1",
  assigneeUserId: "agent-1",
  organizationId: "org-1",
  status: TicketStatus.W_TOKU,
  firstResponseAt: null,
  firstResponseDue: new Date(Date.now() - 1000),
  resolveDue: new Date(Date.now() - 1000),
  resolvedAt: null,
  closedAt: null,
  slaPausedAt: null,
  slaResumedAt: null,
  slaPauseTotalSeconds: 0,
};

const prismaMock = {
  ticket: {
    findUnique: vi.fn(async () => mockTicket),
  },
  auditEvent: {
    create: vi.fn(async () => ({ id: "audit-1" })),
  },
};

describe("SLA worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.ticket.findUnique.mockResolvedValue(mockTicket);
  });

  it("creates audit + notification when breach job fires", async () => {
    const notifier: NotificationService = {
      send: vi.fn(async () => ({ id: "notif-1", status: "queued", deduped: false })),
    };

    const payload = createSlaJobPayload({
      jobType: "resolve",
      ticketId: mockTicket.id,
      organizationId: mockTicket.organizationId,
      dueAt: mockTicket.resolveDue.toISOString(),
      priority: TicketPriority.SREDNI,
    });

    const result = await handleSlaJob(payload, { notifier, client: prismaMock, now: new Date() });

    expect(result.skipped).toBe(false);
    expect(prismaMock.auditEvent.create).toHaveBeenCalled();
    expect(notifier.send).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "inapp",
        to: mockTicket.requesterId,
      }),
    );
  });

  it("skips when ticket already has first response", async () => {
    prismaMock.ticket.findUnique.mockResolvedValueOnce({
      ...mockTicket,
      firstResponseAt: new Date(),
    });
    const notifier: NotificationService = {
      send: vi.fn(),
    };
    const payload = createSlaJobPayload({
      jobType: "first-response",
      ticketId: mockTicket.id,
      organizationId: mockTicket.organizationId,
      dueAt: mockTicket.firstResponseDue!.toISOString(),
      priority: TicketPriority.SREDNI,
    });

    const result = await handleSlaJob(payload, { notifier, client: prismaMock, now: new Date() });

    expect(result.skipped).toBe(true);
    expect(result.reason).toBe("first response already recorded");
    expect(notifier.send).not.toHaveBeenCalled();
  });

  it("skips when ticket is waiting on requester", async () => {
    const waitingTicket = {
      ...mockTicket,
      status: TicketStatus.OCZEKUJE_NA_UZYTKOWNIKA,
      slaPausedAt: new Date(Date.now() - 5000),
    };
    prismaMock.ticket.findUnique.mockResolvedValueOnce(waitingTicket);
    const notifier: NotificationService = {
      send: vi.fn(),
    };

    const payload = createSlaJobPayload({
      jobType: "resolve",
      ticketId: mockTicket.id,
      organizationId: mockTicket.organizationId,
      dueAt: waitingTicket.resolveDue!.toISOString(),
      priority: TicketPriority.SREDNI,
    });

    const result = await handleSlaJob(payload, { notifier, client: prismaMock, now: new Date() });

    expect(result.skipped).toBe(true);
    expect(result.reason).toBe("waiting on requester");
    expect(notifier.send).not.toHaveBeenCalled();
  });
});
