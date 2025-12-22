import { prisma } from "@/lib/prisma";
import { TicketPriority } from "@prisma/client";

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
