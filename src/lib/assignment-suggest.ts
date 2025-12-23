import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";

export type AssignmentSuggestion = {
  suggestedAgentId: string | null;
  agentLoads: Array<{ agentId: string; load: number }>;
};

/**
 * Suggests an agent based on current ticket load (open tickets per agent).
 * Returns agent with lowest load, or null if no agents available.
 * Strictly enforces organization isolation.
 */
export async function suggestAssigneeByLoad(
  organizationId: string,
  excludeTicketId?: string
): Promise<AssignmentSuggestion> {
  const agents = await prisma.user.findMany({
    where: {
      organizationId,
      role: { in: ["AGENT", "ADMIN"] },
    },
    select: { id: true },
  });

  if (agents.length === 0) {
    return { suggestedAgentId: null, agentLoads: [] };
  }

  const agentIds = agents.map((a) => a.id);

  // Count open tickets per agent, excluding closed/resolved tickets
  const ticketCounts = await prisma.ticket.groupBy({
    by: ["assigneeUserId"],
    where: {
      organizationId,
      assigneeUserId: { in: agentIds },
      status: { notIn: [TicketStatus.ROZWIAZANE, TicketStatus.ZAMKNIETE] },
      ...(excludeTicketId ? { id: { not: excludeTicketId } } : {}),
    },
    _count: { id: true },
  });

  // Map ticket counts to agent IDs
  const loadMap = new Map<string, number>();
  agentIds.forEach((id) => loadMap.set(id, 0));
  ticketCounts.forEach((item) => {
    if (item.assigneeUserId) {
      loadMap.set(item.assigneeUserId, item._count.id);
    }
  });

  const agentLoads = Array.from(loadMap.entries()).map(([agentId, load]) => ({
    agentId,
    load,
  }));

  // Find agent with minimum load
  const minLoad = Math.min(...agentLoads.map((a) => a.load));
  const suggestedAgent = agentLoads.find((a) => a.load === minLoad);

  return {
    suggestedAgentId: suggestedAgent?.agentId ?? null,
    agentLoads,
  };
}
