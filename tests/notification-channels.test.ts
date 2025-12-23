import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/notifications/route";
import { EmailAdapter } from "@/lib/email-adapter";

const mockPrisma = vi.hoisted(() => ({
  inAppNotification: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: () => mockGetServerSession(),
  authOptions: {},
}));

describe("Notification channels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const req = new Request("http://localhost/api/notifications");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.notifications).toEqual(mockNotifications);
    expect(mockPrisma.inAppNotification.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = new Request("http://localhost/api/notifications");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

