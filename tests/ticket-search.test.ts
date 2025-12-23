import { describe, expect, it, vi } from "vitest";
import { getTicketPage } from "@/lib/ticket-list";

const prismaMock = vi.hoisted(() => ({
  ticket: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("ticket search", () => {
  const mockUser = {
    id: "user-1",
    role: "AGENT" as const,
    organizationId: "org-1",
  };

  it("searches in both title and descriptionMd fields", async () => {
    const mockTickets = [
      {
        id: "ticket-1",
        title: "Test Ticket",
        descriptionMd: "This is a test description",
        status: "NOWE" as const,
        priority: "SREDNI" as const,
        requesterId: "requester-1",
        organizationId: "org-1",
        createdAt: new Date(),
        requester: { name: "John Doe" },
        assigneeUser: null,
        assigneeTeam: null,
      },
    ];

    // Mock the prisma call
    prismaMock.ticket.findMany.mockResolvedValue(mockTickets);

    const result = await getTicketPage(mockUser, {
      search: "test",
      limit: 10,
    });

    // Verify that findMany was called with the correct search query
    expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: "test", mode: "insensitive" } },
            { descriptionMd: { contains: "test", mode: "insensitive" } },
          ],
        }),
      })
    );

    expect(result.tickets).toEqual(mockTickets);
  });

  it("does not include search conditions when no search query provided", async () => {
    const mockTickets = [
      {
        id: "ticket-1",
        title: "Test Ticket",
        descriptionMd: "Description",
        status: "NOWE" as const,
        priority: "SREDNI" as const,
        requesterId: "requester-1",
        organizationId: "org-1",
        createdAt: new Date(),
        requester: { name: "John Doe" },
        assigneeUser: null,
        assigneeTeam: null,
      },
    ];

    prismaMock.ticket.findMany.mockResolvedValue(mockTickets);

    await getTicketPage(mockUser, { limit: 10 });

    // Verify that findMany was called without OR conditions for search
    expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          OR: expect.anything(),
        }),
      })
    );
  });
});
