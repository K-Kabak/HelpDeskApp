import { describe, expect, it, vi, beforeEach } from "vitest";
import { TicketStatus } from "@prisma/client";
import { suggestAssigneeByLoad } from "@/lib/assignment-suggest";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
  },
  ticket: {
    groupBy: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("assignment-suggest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("suggests agent with lowest load", async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "agent-1" },
      { id: "agent-2" },
      { id: "agent-3" },
    ]);

    mockPrisma.ticket.groupBy.mockResolvedValue([
      { assigneeUserId: "agent-1", _count: { id: 5 } },
      { assigneeUserId: "agent-2", _count: { id: 2 } },
      { assigneeUserId: "agent-3", _count: { id: 8 } },
    ]);

    const result = await suggestAssigneeByLoad("org-1");

    expect(result.suggestedAgentId).toBe("agent-2");
    expect(result.agentLoads).toHaveLength(3);
    expect(result.agentLoads.find((a) => a.agentId === "agent-2")?.load).toBe(2);
    expect(mockPrisma.ticket.groupBy).toHaveBeenCalledWith({
      by: ["assigneeUserId"],
      where: {
        organizationId: "org-1",
        assigneeUserId: { in: ["agent-1", "agent-2", "agent-3"] },
        status: { notIn: [TicketStatus.ROZWIAZANE, TicketStatus.ZAMKNIETE] },
      },
    });
  });

  it("suggests agent with zero load when others have tickets", async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "agent-1" },
      { id: "agent-2" },
    ]);

    mockPrisma.ticket.groupBy.mockResolvedValue([
      { assigneeUserId: "agent-1", _count: { id: 3 } },
    ]);

    const result = await suggestAssigneeByLoad("org-1");

    expect(result.suggestedAgentId).toBe("agent-2");
    expect(result.agentLoads.find((a) => a.agentId === "agent-2")?.load).toBe(0);
  });

  it("returns null when no agents available", async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);

    const result = await suggestAssigneeByLoad("org-1");

    expect(result.suggestedAgentId).toBeNull();
    expect(result.agentLoads).toEqual([]);
    expect(mockPrisma.ticket.groupBy).not.toHaveBeenCalled();
  });

  it("excludes ticket from load calculation when excludeTicketId provided", async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "agent-1" },
      { id: "agent-2" },
    ]);

    mockPrisma.ticket.groupBy.mockResolvedValue([
      { assigneeUserId: "agent-1", _count: { id: 2 } },
    ]);

    await suggestAssigneeByLoad("org-1", "ticket-123");

    expect(mockPrisma.ticket.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { not: "ticket-123" },
        }),
      }),
    );
  });

  it("enforces organization isolation", async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "agent-1" },
    ]);

    mockPrisma.ticket.groupBy.mockResolvedValue([]);

    await suggestAssigneeByLoad("org-1");

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: {
        organizationId: "org-1",
        role: { in: ["AGENT", "ADMIN"] },
      },
      select: { id: true },
    });

    expect(mockPrisma.ticket.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org-1",
        }),
      }),
    );
  });

  it("handles multiple agents with same minimum load", async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: "agent-1" },
      { id: "agent-2" },
      { id: "agent-3" },
    ]);

    mockPrisma.ticket.groupBy.mockResolvedValue([
      { assigneeUserId: "agent-1", _count: { id: 2 } },
      { assigneeUserId: "agent-2", _count: { id: 2 } },
      { assigneeUserId: "agent-3", _count: { id: 5 } },
    ]);

    const result = await suggestAssigneeByLoad("org-1");

    expect(result.suggestedAgentId).toBeTruthy();
    expect(["agent-1", "agent-2"]).toContain(result.suggestedAgentId);
  });
});
