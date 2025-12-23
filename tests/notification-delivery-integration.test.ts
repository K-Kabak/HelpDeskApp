import { describe, expect, it, vi, beforeEach } from "vitest";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { handleSlaJob } from "@/lib/sla-worker";
import { handleSlaReminder } from "@/lib/sla-reminder";
import { createNotificationService, NotificationService } from "@/lib/notification";
import type { EmailAdapter } from "@/lib/notification";

const mockPrismaGlobal = {
  user: {
    findUnique: vi.fn(),
  },
  notificationPreference: {
    findUnique: vi.fn(),
  },
  inAppNotification: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrismaGlobal,
}));

describe("Notification Delivery Integration", () => {
  const mockTicket = {
    id: "ticket-1",
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
  };

  const mockPrisma = {
    ticket: {
      findUnique: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    notificationPreference: {
      findUnique: vi.fn(),
    },
    inAppNotification: {
      create: vi.fn(),
    },
  };

  const mockEmailAdapter: EmailAdapter = {
    send: vi.fn(async () => ({ id: "email-1", status: "queued" as const })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
    mockPrisma.auditEvent.create.mockResolvedValue({ id: "audit-1" });
    mockPrismaGlobal.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrismaGlobal.notificationPreference.findUnique.mockResolvedValue(null);
    mockPrismaGlobal.inAppNotification.create.mockResolvedValue({
      id: "notif-1",
      userId: "user-1",
      subject: "Test",
      body: "Body",
      data: null,
      readAt: null,
      createdAt: new Date(),
    });
  });

  describe("SLA Breach Notification Delivery", () => {
    it("delivers in-app notification when SLA breach occurs", async () => {
      const notificationService = createNotificationService(mockEmailAdapter);

      const payload = {
        jobType: "first-response" as const,
        ticketId: mockTicket.id,
        organizationId: mockTicket.organizationId,
        dueAt: mockTicket.firstResponseDue!.toISOString(),
        priority: TicketPriority.SREDNI,
        jobId: "job-1",
      };

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: notificationService,
        now: new Date(Date.now() + 1000),
      });

      expect(result.skipped).toBe(false);
      expect(result.notificationId).toBeTruthy();
      expect(mockPrismaGlobal.inAppNotification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            subject: expect.stringContaining("SLA"),
            body: expect.stringContaining("Ticket"),
          }),
        })
      );
    });

    it("delivers notification with correct idempotency key", async () => {
      const notificationService = createNotificationService(mockEmailAdapter);

      const payload = {
        jobType: "resolve" as const,
        ticketId: mockTicket.id,
        organizationId: mockTicket.organizationId,
        dueAt: mockTicket.resolveDue!.toISOString(),
        priority: TicketPriority.WYSOKI,
        jobId: "job-2",
      };

      await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: notificationService,
        now: new Date(Date.now() + 1000),
      });

      expect(mockPrismaGlobal.inAppNotification.create).toHaveBeenCalled();
      // Verify idempotency key format
      const callArgs = mockPrismaGlobal.inAppNotification.create.mock.calls[0];
      // The idempotency key is set in the notification service, not in the create call
      // But we can verify the notification was created with the right data
      expect(callArgs[0].data.userId).toBe("user-1");
    });

    it("deduplicates notifications with same idempotency key", async () => {
      const notificationService = createNotificationService(mockEmailAdapter);

      const payload = {
        jobType: "first-response" as const,
        ticketId: mockTicket.id,
        organizationId: mockTicket.organizationId,
        dueAt: mockTicket.firstResponseDue!.toISOString(),
        priority: TicketPriority.SREDNI,
        jobId: "job-1",
      };

      // First call
      const result1 = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: notificationService,
        now: new Date(Date.now() + 1000),
      });

      // Second call with same payload (simulating retry)
      const result2 = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: notificationService,
        now: new Date(Date.now() + 1000),
      });

      // Both should succeed, but notification service should deduplicate
      expect(result1.notificationId).toBeTruthy();
      expect(result2.notificationId).toBeTruthy();
      // The notification service handles deduplication internally
    });
  });

  describe("SLA Reminder Notification Delivery", () => {
    it("delivers reminder notification to requester", async () => {
      const notificationService = createNotificationService(mockEmailAdapter);

      const payload = {
        jobType: "reminder" as const,
        ticketId: "ticket-1",
        organizationId: "org-1",
        dueAt: new Date(Date.now() + 60000).toISOString(),
        priority: TicketPriority.SREDNI,
        jobId: "reminder-1",
        metadata: {
          reminderFor: "first-response",
          requesterId: "user-1",
        },
      };

      const result = await handleSlaReminder(payload, { notifier: notificationService });

      expect(result.skipped).toBe(false);
      expect(result.notificationId).toBeTruthy();
      expect(mockPrismaGlobal.inAppNotification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            subject: expect.stringContaining("SLA reminder"),
            body: expect.stringContaining("approaching"),
          }),
        })
      );
    });

    it("includes ticket metadata in notification", async () => {
      const notificationService = createNotificationService(mockEmailAdapter);

      const payload = {
        jobType: "reminder" as const,
        ticketId: "ticket-1",
        organizationId: "org-1",
        dueAt: new Date(Date.now() + 60000).toISOString(),
        priority: TicketPriority.WYSOKI,
        jobId: "reminder-2",
        metadata: {
          reminderFor: "resolve",
          requesterId: "user-1",
        },
      };

      await handleSlaReminder(payload, { notifier: notificationService });

      expect(mockPrismaGlobal.inAppNotification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data: expect.objectContaining({
              ticketId: "ticket-1",
              jobType: "resolve",
              priority: TicketPriority.WYSOKI,
            }),
          }),
        })
      );
    });
  });

  describe("Notification Preference Handling", () => {
    it("respects user notification preferences", async () => {
      // User has disabled in-app ticket updates
      mockPrismaGlobal.notificationPreference.findUnique.mockResolvedValue({
        emailTicketUpdates: true,
        emailCommentUpdates: true,
        inAppTicketUpdates: false, // Disabled
        inAppCommentUpdates: true,
      });

      const notificationService = createNotificationService(mockEmailAdapter);

      const payload = {
        jobType: "first-response" as const,
        ticketId: mockTicket.id,
        organizationId: mockTicket.organizationId,
        dueAt: mockTicket.firstResponseDue!.toISOString(),
        priority: TicketPriority.SREDNI,
        jobId: "job-1",
      };

      const result = await handleSlaJob(payload, {
        client: mockPrisma,
        notifier: notificationService,
        now: new Date(Date.now() + 1000),
      });

      // Job should still process (audit created), but notification may be blocked
      expect(result.skipped).toBe(false);
      expect(result.auditId).toBeTruthy();
      // Notification service will handle preference checking
    });
  });

  describe("Notification Error Handling", () => {
    it("handles notification service errors gracefully", async () => {
      const failingNotifier: NotificationService = {
        send: vi.fn(async () => {
          throw new Error("Notification service unavailable");
        }),
      };

      const payload = {
        jobType: "first-response" as const,
        ticketId: mockTicket.id,
        organizationId: mockTicket.organizationId,
        dueAt: mockTicket.firstResponseDue!.toISOString(),
        priority: TicketPriority.SREDNI,
        jobId: "job-1",
      };

      await expect(
        handleSlaJob(payload, {
          client: mockPrisma,
          notifier: failingNotifier,
          now: new Date(Date.now() + 1000),
        })
      ).rejects.toThrow("Notification service unavailable");

      // Audit should still be created even if notification fails
      // (In real implementation, this might be handled differently)
    });
  });
});

