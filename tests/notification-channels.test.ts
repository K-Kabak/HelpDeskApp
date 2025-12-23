import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/notifications/route";
import { EmailAdapter } from "@/lib/email-adapter";
import { createNotificationService } from "@/lib/notification";

const mockPrisma = vi.hoisted(() => ({
  inAppNotification: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  notificationPreference: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
  authOptions: {},
}));

const mockEmailAdapter: EmailAdapter = {
  send: vi.fn(async () => ({ id: "email-1", status: "queued" as const })),
};

describe("Notification channels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("happy path: creating notification results in in-app feed item", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);
    const createdNotification = {
      id: "notif-1",
      userId: "user-1",
      subject: "Test",
      body: "Body",
      data: null,
      readAt: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
    };
    mockPrisma.inAppNotification.create.mockResolvedValue(createdNotification);
    const feedNotification = {
      ...createdNotification,
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    mockPrisma.inAppNotification.findMany.mockResolvedValue([feedNotification]);

    const service = createNotificationService(mockEmailAdapter);
    const result = await service.send({
      channel: "inapp",
      to: "user-1",
      subject: "Test",
      body: "Body",
    });

    expect(result.id).toBe("notif-1");
    expect(result.status).toBe("sent");
    expect(mockPrisma.inAppNotification.create).toHaveBeenCalled();

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
        role: "REQUESTER",
        organizationId: "org-1",
      },
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.notifications).toHaveLength(1);
    expect(body.notifications[0].id).toBe("notif-1");
  });

  it("retrieves in-app notifications feed", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
        role: "REQUESTER",
        organizationId: "org-1",
      },
    });

    const mockNotifications = [
      {
        id: "notif-1",
        userId: "user-1",
        subject: "Test",
        body: "Body",
        data: null,
        readAt: null,
        createdAt: new Date("2024-01-01T00:00:00Z"),
      },
    ];

    mockPrisma.inAppNotification.findMany.mockResolvedValue(mockNotifications);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.notifications).toHaveLength(1);
    expect(body.notifications[0].id).toBe("notif-1");
    expect(mockPrisma.inAppNotification.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

