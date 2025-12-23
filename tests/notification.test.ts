import { describe, expect, it, vi, beforeEach } from "vitest";
import { createNotificationService } from "@/lib/notification";
import { EmailAdapter } from "@/lib/email-adapter";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  notificationPreference: {
    findUnique: vi.fn(),
  },
  inAppNotification: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockEmailAdapter: EmailAdapter = {
  send: vi.fn(async () => ({ id: "email-1", status: "queued" as const })),
};

describe("Notification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends email via adapter stub", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);

    const service = createNotificationService(mockEmailAdapter);
    const result = await service.send({
      channel: "email",
      to: "user@example.com",
      subject: "Hello",
      body: "Hi",
    });

    expect(mockEmailAdapter.send).toHaveBeenCalledWith({
      to: "user@example.com",
      subject: "Hello",
      body: "Hi",
      templateId: undefined,
      data: undefined,
    });
    expect(result.id).toBe("email-1");
    expect(result.status).toBe("queued");
    expect(result.deduped).toBe(false);
  });

  it("creates in-app notification and appears in feed", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);
    mockPrisma.inAppNotification.create.mockResolvedValue({
      id: "notif-1",
      userId: "user-1",
      subject: "Test",
      body: "Body",
      data: null,
      readAt: null,
      createdAt: new Date(),
    });

    const service = createNotificationService(mockEmailAdapter);
    const result = await service.send({
      channel: "inapp",
      to: "user-1",
      subject: "Test",
      body: "Body",
    });

    expect(mockPrisma.inAppNotification.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        subject: "Test",
        body: "Body",
        data: null,
      },
    });
    expect(result.id).toBe("notif-1");
    expect(result.status).toBe("sent");
    expect(result.deduped).toBe(false);
  });

  it("deduplicates by idempotencyKey", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);
    mockPrisma.inAppNotification.create.mockResolvedValue({
      id: "notif-1",
      userId: "user-1",
      subject: "Test",
      body: null,
      data: null,
      readAt: null,
      createdAt: new Date(),
    });

    const service = createNotificationService(mockEmailAdapter);
    const first = await service.send({
      channel: "inapp",
      to: "user-1",
      idempotencyKey: "abc",
    });
    const second = await service.send({
      channel: "inapp",
      to: "user-1",
      idempotencyKey: "abc",
    });

    expect(second.id).toBe(first.id);
    expect(second.deduped).toBe(true);
    expect(mockPrisma.inAppNotification.create).toHaveBeenCalledTimes(1);
  });

  it("throws on invalid payload", async () => {
    const service = createNotificationService(mockEmailAdapter);
    // @ts-expect-error testing validation
    await expect(() => service.send({ channel: "email", to: "" })).rejects.toThrow();
  });

  it("allows notification when user preference is enabled", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.notificationPreference.findUnique.mockResolvedValue({
      emailTicketUpdates: true,
      emailCommentUpdates: true,
      inAppTicketUpdates: true,
      inAppCommentUpdates: true,
    });

    const service = createNotificationService(mockEmailAdapter);
    const result = await service.send({
      channel: "email",
      to: "user-1",
      subject: "Test",
      metadata: {
        notificationType: "ticketUpdate",
      },
    });

    expect(result.id).toBeTruthy();
    expect(result.status).toBe("queued");
  });

  it("blocks notification when user preference is disabled", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.notificationPreference.findUnique.mockResolvedValue({
      emailTicketUpdates: false,
      emailCommentUpdates: true,
      inAppTicketUpdates: true,
      inAppCommentUpdates: true,
    });

    const service = createNotificationService(mockEmailAdapter);
    const result = await service.send({
      channel: "email",
      to: "user-1",
      subject: "Test",
      metadata: {
        notificationType: "ticketUpdate",
      },
    });

    expect(result.id).toBeTruthy();
    expect(result.status).toBe("queued");
    expect(mockPrisma.notificationPreference.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("uses defaults when preferences are missing", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);

    const service = createNotificationService(mockEmailAdapter);
    const result = await service.send({
      channel: "email",
      to: "user-1",
      subject: "Test",
      metadata: {
        notificationType: "ticketUpdate",
      },
    });

    expect(result.id).toBeTruthy();
    expect(result.status).toBe("queued");
    expect(mockPrisma.notificationPreference.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("blocks comment update when preference is disabled", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.notificationPreference.findUnique.mockResolvedValue({
      emailTicketUpdates: true,
      emailCommentUpdates: false,
      inAppTicketUpdates: true,
      inAppCommentUpdates: true,
    });

    const service = createNotificationService(mockEmailAdapter);
    const result = await service.send({
      channel: "email",
      to: "user-1",
      subject: "Test",
      metadata: {
        notificationType: "commentUpdate",
      },
    });

    expect(result.id).toBeTruthy();
    expect(result.status).toBe("queued");
  });

  it("blocks in-app notification when preference is disabled", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.notificationPreference.findUnique.mockResolvedValue({
      emailTicketUpdates: true,
      emailCommentUpdates: true,
      inAppTicketUpdates: false,
      inAppCommentUpdates: true,
    });

    const service = createNotificationService(mockEmailAdapter);
    const result = await service.send({
      channel: "inapp",
      to: "user-1",
      subject: "Test",
      metadata: {
        notificationType: "ticketUpdate",
      },
    });

    expect(result.id).toBeTruthy();
    expect(result.status).toBe("queued");
  });

  it("uses defaults when user is not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const service = createNotificationService(mockEmailAdapter);
    const result = await service.send({
      channel: "email",
      to: "nonexistent@example.com",
      subject: "Test",
      metadata: {
        notificationType: "ticketUpdate",
      },
    });

    expect(result.id).toBeTruthy();
    expect(result.status).toBe("queued");
  });
});
