import { describe, expect, it, vi, beforeEach } from "vitest";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { createSlaJobPayload } from "@/lib/sla-jobs";
import { handleSlaJob } from "@/lib/sla-worker";
import { handleSlaReminder } from "@/lib/sla-reminder";
import { NotificationService } from "@/lib/notification";

describe("Worker Job Processing Integration", () => {
  const mockTicket = {
    id: "ticket-1",
    number: 100,
    requesterId: "user-1",
    assigneeUserId: "agent-1",
    organizationId: "org-1",
    status: TicketStatus.W_TOKU,
    firstResponseAt: null,
    firstResponseDue: new Date(Date.now() - 1000), // Past due
    resolveDue: new Date(Date.now() - 1000), // Past due
    resolvedAt: null,
    closedAt: null,
  };

  const mockPrisma = {
    ticket: {
      findUnique: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    },
  };

  const mockNotifier: NotificationService = {
    send: vi.fn(async () => ({ id: "notif-1", status: "sent" as const, deduped: false })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
    mockPrisma.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  });

  describe("SLA Breach Job Processing", () => {
    it("processes first-response breach job successfully", async () => {
      const payload = createSlaJobPayload({
        jobType: "first-response",
        ticketId: mockTicket.id,
        organizationId: mockTicket.organizationId,
        dueAt: mockTicket.firstResponseDue!.toISOString(),
        priority: TicketPriority.SREDNI,
      });

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: mockNotifier,
        now: new Date(Date.now() + 1000), // After due date
      });

      expect(result.skipped).toBe(false);
      expect(result.auditId).toBe("audit-1");
      expect(result.notificationId).toBe("notif-1");
      expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ticketId: mockTicket.id,
            action: "SLA_BREACHED",
            data: expect.objectContaining({
              jobType: "first-response",
            }),
          }),
        })
      );
      expect(mockNotifier.send).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: "inapp",
          to: mockTicket.requesterId,
          subject: expect.stringContaining("SLA response breached"),
        })
      );
    });

    it("processes resolve breach job successfully", async () => {
      const payload = createSlaJobPayload({
        jobType: "resolve",
        ticketId: mockTicket.id,
        organizationId: mockTicket.organizationId,
        dueAt: mockTicket.resolveDue!.toISOString(),
        priority: TicketPriority.WYSOKI,
      });

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: mockNotifier,
        now: new Date(Date.now() + 1000),
      });

      expect(result.skipped).toBe(false);
      expect(result.auditId).toBe("audit-1");
      expect(result.notificationId).toBe("notif-1");
      expect(mockNotifier.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("SLA resolution breached"),
        })
      );
    });

    it("skips job when ticket is closed", async () => {
      const closedTicket = {
        ...mockTicket,
        status: TicketStatus.ZAMKNIETE,
      };
      mockPrisma.ticket.findUnique.mockResolvedValue(closedTicket);

      const payload = createSlaJobPayload({
        jobType: "resolve",
        ticketId: closedTicket.id,
        organizationId: closedTicket.organizationId,
        dueAt: closedTicket.resolveDue!.toISOString(),
        priority: TicketPriority.SREDNI,
      });

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: mockNotifier,
      });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("ticket closed/resolved");
      expect(mockPrisma.auditEvent.create).not.toHaveBeenCalled();
      expect(mockNotifier.send).not.toHaveBeenCalled();
    });

    it("skips job when ticket is waiting on requester", async () => {
      const waitingTicket = {
        ...mockTicket,
        status: TicketStatus.OCZEKUJE_NA_UZYTKOWNIKA,
      };
      mockPrisma.ticket.findUnique.mockResolvedValue(waitingTicket);

      const payload = createSlaJobPayload({
        jobType: "resolve",
        ticketId: waitingTicket.id,
        organizationId: waitingTicket.organizationId,
        dueAt: waitingTicket.resolveDue!.toISOString(),
        priority: TicketPriority.SREDNI,
      });

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: mockNotifier,
      });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("waiting on requester");
    });

    it("skips job when first response already recorded", async () => {
      const respondedTicket = {
        ...mockTicket,
        firstResponseAt: new Date(),
      };
      mockPrisma.ticket.findUnique.mockResolvedValue(respondedTicket);

      const payload = createSlaJobPayload({
        jobType: "first-response",
        ticketId: respondedTicket.id,
        organizationId: respondedTicket.organizationId,
        dueAt: respondedTicket.firstResponseDue!.toISOString(),
        priority: TicketPriority.SREDNI,
      });

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: mockNotifier,
      });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("first response already recorded");
    });

    it("skips job when ticket is already resolved", async () => {
      const resolvedTicket = {
        ...mockTicket,
        resolvedAt: new Date(),
      };
      mockPrisma.ticket.findUnique.mockResolvedValue(resolvedTicket);

      const payload = createSlaJobPayload({
        jobType: "resolve",
        ticketId: resolvedTicket.id,
        organizationId: resolvedTicket.organizationId,
        dueAt: resolvedTicket.resolveDue!.toISOString(),
        priority: TicketPriority.SREDNI,
      });

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: mockNotifier,
      });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("already resolved");
    });

    it("skips job when due date not reached", async () => {
      const futureDue = new Date(Date.now() + 60000); // 1 minute in future
      const futureTicket = {
        ...mockTicket,
        resolveDue: futureDue,
      };
      mockPrisma.ticket.findUnique.mockResolvedValue(futureTicket);

      const payload = createSlaJobPayload({
        jobType: "resolve",
        ticketId: futureTicket.id,
        organizationId: futureTicket.organizationId,
        dueAt: futureDue.toISOString(),
        priority: TicketPriority.SREDNI,
      });

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: mockNotifier,
        now: new Date(), // Current time, before due
      });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("due date not reached");
    });

    it("skips job when ticket not found", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      const payload = createSlaJobPayload({
        jobType: "resolve",
        ticketId: "non-existent",
        organizationId: "org-1",
        dueAt: new Date().toISOString(),
        priority: TicketPriority.SREDNI,
      });

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: mockNotifier,
      });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("ticket not found");
    });

    it("skips job when due date was rescheduled", async () => {
      const rescheduledTicket = {
        ...mockTicket,
        resolveDue: new Date(Date.now() + 60000), // New due date
      };
      mockPrisma.ticket.findUnique.mockResolvedValue(rescheduledTicket);

      const payload = createSlaJobPayload({
        jobType: "resolve",
        ticketId: rescheduledTicket.id,
        organizationId: rescheduledTicket.organizationId,
        dueAt: mockTicket.resolveDue!.toISOString(), // Old due date
        priority: TicketPriority.SREDNI,
      });

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: mockNotifier,
      });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("due rescheduled");
    });
  });

  describe("SLA Reminder Job Processing", () => {
    it("processes reminder job successfully", async () => {
      const payload = createSlaJobPayload({
        jobType: "reminder",
        ticketId: "ticket-1",
        organizationId: "org-1",
        dueAt: new Date(Date.now() + 60000).toISOString(),
        priority: TicketPriority.SREDNI,
        metadata: {
          reminderFor: "first-response",
          requesterId: "user-1",
        },
      });

      const result = await handleSlaReminder(payload, { notifier: mockNotifier });

      expect(result.skipped).toBe(false);
      expect(result.notificationId).toBe("notif-1");
      expect(mockNotifier.send).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: "inapp",
          to: "user-1",
          subject: expect.stringContaining("SLA reminder"),
          idempotencyKey: expect.stringContaining("sla-reminder-notif"),
        })
      );
    });

    it("skips reminder when no recipient provided", async () => {
      const payload = createSlaJobPayload({
        jobType: "reminder",
        ticketId: "ticket-1",
        organizationId: "org-1",
        dueAt: new Date(Date.now() + 60000).toISOString(),
        priority: TicketPriority.SREDNI,
        // No metadata.requesterId
      });

      const result = await handleSlaReminder(payload, { notifier: mockNotifier });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("no recipient");
      expect(mockNotifier.send).not.toHaveBeenCalled();
    });

    it("skips reminder when job type is not reminder", async () => {
      const payload = createSlaJobPayload({
        jobType: "resolve", // Wrong type
        ticketId: "ticket-1",
        organizationId: "org-1",
        dueAt: new Date(Date.now() + 60000).toISOString(),
        priority: TicketPriority.SREDNI,
        metadata: {
          reminderFor: "first-response",
          requesterId: "user-1",
        },
      });

      const result = await handleSlaReminder(payload, { notifier: mockNotifier });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("not a reminder job");
      expect(mockNotifier.send).not.toHaveBeenCalled();
    });
  });
});

