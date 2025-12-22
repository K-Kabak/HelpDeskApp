import { prisma } from "@/lib/prisma";
import { TicketPriority } from "@prisma/client";

export type EscalationLevel = {
  level: number;
  teamId: string;
};

export async function fetchEscalationLevels(params: {
  organizationId: string;
  priority: TicketPriority;
  categoryId?: string | null;
}): Promise<EscalationLevel[]> {
  const { organizationId, priority, categoryId } = params;

  const levels = await prisma.slaEscalationLevel.findMany({
    where: {
      organizationId,
      priority,
      categoryId: categoryId ?? null,
    },
    orderBy: { level: "asc" },
  });

  if (levels.length) {
    return levels.map((entry) => ({
      level: entry.level,
      teamId: entry.teamId,
    }));
  }

  if (categoryId) {
    const fallback = await prisma.slaEscalationLevel.findMany({
      where: {
        organizationId,
        priority,
        categoryId: null,
      },
      orderBy: { level: "asc" },
    });
    return fallback.map((entry) => ({
      level: entry.level,
      teamId: entry.teamId,
    }));
  }

  return [];
}

export function nextEscalationLevel(
  levels: EscalationLevel[],
  currentLevel?: number | null
): EscalationLevel | null {
  if (levels.length === 0) return null;
  if (currentLevel == null) return levels[0];
  return levels.find((l) => l.level > currentLevel) ?? null;
}

export async function deriveNextEscalation(params: {
  organizationId: string;
  priority: TicketPriority;
  categoryId?: string | null;
  currentLevel?: number | null;
}) {
  const levels = await fetchEscalationLevels(params);
  return nextEscalationLevel(levels, params.currentLevel);
}
