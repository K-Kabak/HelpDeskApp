import { prisma } from "@/lib/prisma";
import { AuthenticatedUser, ticketScope } from "@/lib/authorization";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { z } from "zod";

const cursorSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type TicketListDirection = "next" | "prev";

export type TicketListOptions = {
  limit?: number;
  cursor?: string;
  direction?: TicketListDirection;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  category?: string;
  tagIds?: string[];
};

export type TicketListResult = {
  tickets: Awaited<ReturnType<typeof prisma.ticket.findMany<{ include: { requester: true; assigneeUser: true; assigneeTeam: true } }>>>;
  nextCursor: string | null;
  prevCursor: string | null;
};

function encodeCursor(ticket: { id: string; createdAt: Date }) {
  return Buffer.from(
    JSON.stringify({ id: ticket.id, createdAt: ticket.createdAt.toISOString() }),
  ).toString("base64url");
}

function decodeCursor(cursor?: string | null) {
  if (!cursor) return null;
  try {
    const parsed = cursorSchema.parse(
      JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")),
    );
    return { id: parsed.id, createdAt: new Date(parsed.createdAt) };
  } catch {
    return null;
  }
}

/**
 * Retrieves a paginated list of tickets with cursor-based pagination.
 * 
 * Supports filtering by status, priority, search query, category, and tags.
 * Uses cursor-based pagination for efficient navigation through large datasets.
 * 
 * For REQUESTER role: Returns only tickets created by the user.
 * For AGENT/ADMIN roles: Returns tickets scoped to the user's organization.
 * 
 * @param user - Authenticated user with role and organization context
 * @param options - Pagination and filter options
 * @param options.limit - Number of tickets per page (1-100, default: 20)
 * @param options.cursor - Base64-encoded cursor for pagination
 * @param options.direction - Pagination direction: "next" (forward) or "prev" (backward)
 * @param options.status - Filter by ticket status
 * @param options.priority - Filter by ticket priority
 * @param options.search - Search in title and description (case-insensitive)
 * @param options.category - Filter by category ID
 * @param options.tagIds - Filter by tag IDs (tickets must have at least one matching tag)
 * @returns Paginated ticket list with next/prev cursors
 */
export async function getTicketPage(
  user: AuthenticatedUser,
  options: TicketListOptions = {},
): Promise<TicketListResult> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const direction: TicketListDirection = options.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(options.cursor);

  const where = {
    ...ticketScope(user),
    ...(options.status ? { status: options.status } : {}),
    ...(options.priority ? { priority: options.priority } : {}),
    ...(options.search
      ? {
          OR: [
            { title: { contains: options.search, mode: "insensitive" as const } },
            { descriptionMd: { contains: options.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(options.category ? { category: options.category } : {}),
    ...(options.tagIds && options.tagIds.length
      ? {
          tags: {
            some: {
              tagId: { in: options.tagIds },
            },
          },
        }
      : {}),
  };

  const take = direction === "next" ? limit + 1 : -(limit + 1);

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor.id } : undefined,
    include: {
      requester: true,
      assigneeUser: true,
      assigneeTeam: true,
    },
  });

  let items = direction === "next" ? tickets : tickets.reverse();
  const hasExtra = items.length > limit;
  if (hasExtra) {
    items = items.slice(0, limit);
  }

  const nextCursor = items.length ? encodeCursor(items[items.length - 1]) : null;
  const prevCursor = cursor ? encodeCursor(items[0]) : null;

  return { tickets: items, nextCursor, prevCursor };
}
