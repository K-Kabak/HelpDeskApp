import { prisma } from "@/lib/prisma";
import { AuthenticatedUser, ticketScope } from "@/lib/authorization";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { z } from "zod";

const cursorSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type TicketListDirection = "next" | "prev";

export type TicketSortField = "createdAt" | "updatedAt" | "resolvedAt" | "priority" | "status";
export type TicketSortOrder = "asc" | "desc";

export type TicketListOptions = {
  limit?: number;
  cursor?: string;
  direction?: TicketListDirection;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  category?: string;
  tagIds?: string[];
  // Date range filters
  createdAtFrom?: Date | string;
  createdAtTo?: Date | string;
  updatedAtFrom?: Date | string;
  updatedAtTo?: Date | string;
  resolvedAtFrom?: Date | string;
  resolvedAtTo?: Date | string;
  // Assignee filters
  assigneeUserId?: string;
  assigneeTeamId?: string;
  // Sorting
  sortBy?: TicketSortField;
  sortOrder?: TicketSortOrder;
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
 * Supports filtering by status, priority, search query, category, tags, date ranges, and assignees.
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
 * @param options.createdAtFrom - Filter tickets created on or after this date
 * @param options.createdAtTo - Filter tickets created on or before this date
 * @param options.updatedAtFrom - Filter tickets updated on or after this date
 * @param options.updatedAtTo - Filter tickets updated on or before this date
 * @param options.resolvedAtFrom - Filter tickets resolved on or after this date
 * @param options.resolvedAtTo - Filter tickets resolved on or before this date
 * @param options.assigneeUserId - Filter tickets assigned to a specific user
 * @param options.assigneeTeamId - Filter tickets assigned to a specific team
 * @param options.sortBy - Field to sort by (createdAt, updatedAt, resolvedAt, priority, status)
 * @param options.sortOrder - Sort order (asc or desc, default: desc)
 * @returns Paginated ticket list with next/prev cursors
 */
export async function getTicketPage(
  user: AuthenticatedUser,
  options: TicketListOptions = {},
): Promise<TicketListResult> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const direction: TicketListDirection = options.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(options.cursor);

  // Parse date strings to Date objects if needed
  const parseDate = (date: Date | string | undefined): Date | undefined => {
    if (!date) return undefined;
    return typeof date === "string" ? new Date(date) : date;
  };

  const createdAtFrom = parseDate(options.createdAtFrom);
  const createdAtTo = parseDate(options.createdAtTo);
  const updatedAtFrom = parseDate(options.updatedAtFrom);
  const updatedAtTo = parseDate(options.updatedAtTo);
  const resolvedAtFrom = parseDate(options.resolvedAtFrom);
  const resolvedAtTo = parseDate(options.resolvedAtTo);

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
    // Date range filters
    ...(createdAtFrom || createdAtTo
      ? {
          createdAt: {
            ...(createdAtFrom ? { gte: createdAtFrom } : {}),
            ...(createdAtTo ? { lte: createdAtTo } : {}),
          },
        }
      : {}),
    ...(updatedAtFrom || updatedAtTo
      ? {
          updatedAt: {
            ...(updatedAtFrom ? { gte: updatedAtFrom } : {}),
            ...(updatedAtTo ? { lte: updatedAtTo } : {}),
          },
        }
      : {}),
    ...(resolvedAtFrom || resolvedAtTo
      ? {
          resolvedAt: {
            ...(resolvedAtFrom ? { gte: resolvedAtFrom } : {}),
            ...(resolvedAtTo ? { lte: resolvedAtTo } : {}),
          },
        }
      : {}),
    // Assignee filters
    ...(options.assigneeUserId ? { assigneeUserId: options.assigneeUserId } : {}),
    ...(options.assigneeTeamId ? { assigneeTeamId: options.assigneeTeamId } : {}),
  };

  // Determine sort field and order
  const sortBy: TicketSortField = options.sortBy ?? "createdAt";
  const sortOrder: TicketSortOrder = options.sortOrder ?? "desc";

  // Build orderBy clause
  // Note: Cursor pagination works best with createdAt sorting, but we support other fields
  // For non-createdAt sorts, cursor may not work perfectly, but results will still be sorted correctly
  const orderBy: Array<Record<string, "asc" | "desc">> = [];
  
  if (sortBy === "createdAt") {
    orderBy.push({ createdAt: sortOrder }, { id: sortOrder });
  } else if (sortBy === "updatedAt") {
    orderBy.push({ updatedAt: sortOrder }, { id: sortOrder });
  } else if (sortBy === "resolvedAt") {
    orderBy.push({ resolvedAt: sortOrder }, { id: sortOrder });
  } else if (sortBy === "priority") {
    orderBy.push({ priority: sortOrder }, { createdAt: "desc" }, { id: "desc" });
  } else if (sortBy === "status") {
    orderBy.push({ status: sortOrder }, { createdAt: "desc" }, { id: "desc" });
  } else {
    // Default fallback
    orderBy.push({ createdAt: "desc" }, { id: "desc" });
  }

  const take = direction === "next" ? limit + 1 : -(limit + 1);

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy,
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
