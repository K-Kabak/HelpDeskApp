import { describe, expect, it, vi } from "vitest";
import { getTicketPage } from "@/lib/ticket-list";
import { prisma } from "@/lib/prisma";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    ticket: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findMany: vi.fn() as any,
    },
  },
}));

describe("ticket search", () => {
  it("searches in title and descriptionMd fields", async () => {
    const mockTickets = [
      {
        id: "1",
        title: "Test Ticket",
        descriptionMd: "This is a test description",
        status: "NOWE",
        priority: "SREDNI",
        requesterId: "user1",
        organizationId: "org1",
        createdAt: new Date(),
        requester: { id: "user1", name: "Test User" },
        assigneeUser: null,
        assigneeTeam: null,
      },
    ];

    // Mock the prisma call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma.ticket.findMany.mockResolvedValue(mockTickets as any);

    const result = await getTicketPage(
      { id: "user1", role: "AGENT", organizationId: "org1" },
      { search: "test", limit: 10 }
    );

    // Verify the search was called with correct filters
    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
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

  it("searches only in title when descriptionMd doesn't match", async () => {
    const mockTickets = [
      {
        id: "2",
        title: "Matching Title",
        descriptionMd: "Non-matching content",
        status: "NOWE",
        priority: "SREDNI",
        requesterId: "user1",
        organizationId: "org1",
        createdAt: new Date(),
        requester: { id: "user1", name: "Test User" },
        assigneeUser: null,
        assigneeTeam: null,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma.ticket.findMany.mockResolvedValue(mockTickets as any);

    await getTicketPage(
      { id: "user1", role: "AGENT", organizationId: "org1" },
      { search: "Matching", limit: 10 }
    );

    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: "Matching", mode: "insensitive" } },
            { descriptionMd: { contains: "Matching", mode: "insensitive" } },
          ],
        }),
      })
    );
  });

  it("searches only in descriptionMd when title doesn't match", async () => {
    const mockTickets = [
      {
        id: "3",
        title: "Non-matching title",
        descriptionMd: "This has the search term",
        status: "NOWE",
        priority: "SREDNI",
        requesterId: "user1",
        organizationId: "org1",
        createdAt: new Date(),
        requester: { id: "user1", name: "Test User" },
        assigneeUser: null,
        assigneeTeam: null,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma.ticket.findMany.mockResolvedValue(mockTickets as any);

    await getTicketPage(
      { id: "user1", role: "AGENT", organizationId: "org1" },
      { search: "search term", limit: 10 }
    );

    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: "search term", mode: "insensitive" } },
            { descriptionMd: { contains: "search term", mode: "insensitive" } },
          ],
        }),
      })
    );
  });
});
