import { prisma } from "@/lib/prisma";
import { TicketPriority } from "@prisma/client";

/**
 * Finds the applicable SLA policy for a ticket.
 * 
 * Policy resolution order:
 * 1. Category-specific policy (if category provided)
 * 2. Priority-specific policy (fallback)
 * 
 * Returns the first matching policy or null if none found.
 * 
 * @param organizationId - Organization to search policies for
 * @param priority - Ticket priority level
 * @param categoryName - Optional category name for category-specific policy
 * @returns SLA policy with category relation, or null if not found
 */
export async function findSlaPolicyForTicket(
  organizationId: string,
  priority: TicketPriority,
  categoryName?: string,
) {
  const trimmedCategory = categoryName?.trim();

  if (trimmedCategory) {
    const categoryPolicy = await prisma.slaPolicy.findFirst({
      where: {
        organizationId,
        priority,
        category: { name: { equals: trimmedCategory, mode: "insensitive" } },
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
    if (categoryPolicy) return categoryPolicy;
  }

  return prisma.slaPolicy.findFirst({
    where: {
      organizationId,
      priority,
      categoryId: null,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });
}
