import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ticketScope } from "@/lib/authorization";
import { generateTicketCsv } from "@/lib/csv-export";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { z } from "zod";

const exportQuerySchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tag IDs
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only agents and admins can export (requesters see limited view)
  if (session.user.role === "REQUESTER") {
    return NextResponse.json({ error: "Forbidden - Export not available for requesters" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  // Parse and validate query parameters
  const parsed = exportQuerySchema.safeParse(queryParams);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 400 });
  }

  const filters = parsed.data;

  // Build where clause similar to ticket-list.ts
  const where = {
    ...ticketScope(session.user),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" as const } },
            { descriptionMd: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.tags
      ? {
          tags: {
            some: {
              tagId: { in: filters.tags.split(",").map((t) => t.trim()).filter(Boolean) },
            },
          },
        }
      : {}),
    ...(filters.startDate || filters.endDate
      ? {
          createdAt: {
            ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
            ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
          },
        }
      : {}),
  };

  // Fetch all matching tickets (no pagination for exports)
  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      requester: {
        select: {
          email: true,
          name: true,
        },
      },
      assigneeUser: {
        select: {
          email: true,
          name: true,
        },
      },
      assigneeTeam: {
        select: {
          name: true,
        },
      },
    },
  });

  // Generate CSV content
  const csvContent = generateTicketCsv(tickets);

  // Return CSV file
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tickets-export-${new Date().toISOString().split("T")[0]}.csv"`,
      "Cache-Control": "no-cache",
    },
  });
}
