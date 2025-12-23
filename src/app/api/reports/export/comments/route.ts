import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ticketScope } from "@/lib/authorization";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * Export comments to CSV
 * GET /api/reports/export/comments
 * Query params:
 *   - ticketId (optional): filter by specific ticket
 *   - startDate (optional): ISO date string
 *   - endDate (optional): ISO date string
 *   - internal (optional): "true" to include internal comments (agents/admins only)
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ticketIdParam = searchParams.get("ticketId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const internalParam = searchParams.get("internal");

  // Requesters cannot see internal comments
  const isRequester = session.user.role === "REQUESTER";
  const includeInternal = internalParam === "true" && !isRequester;

  // Build where clause
  const where: any = {
    internal: includeInternal ? undefined : false, // Requesters only see public comments
  };

  // Build ticket scope for filtering
  const ticketScopeClause = ticketScope({
    id: session.user.id,
    role: session.user.role ?? "REQUESTER",
    organizationId: session.user.organizationId,
  });

  // Ticket filter - must respect organization scoping
  if (ticketIdParam) {
    // Verify ticket belongs to user's organization
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketIdParam,
        ...ticketScopeClause,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found or access denied" }, { status: 404 });
    }

    where.ticketId = ticketIdParam;
  } else {
    // Get all tickets user has access to
    const accessibleTickets = await prisma.ticket.findMany({
      where: ticketScopeClause,
      select: { id: true },
    });

    if (accessibleTickets.length === 0) {
      // No tickets, return empty CSV
      const headers = ["Ticket Number", "Ticket Title", "Comment", "Author", "Author Email", "Internal", "Created At"];
      return new NextResponse(headers.join(",") + "\n", {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="comments-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    where.ticketId = {
      in: accessibleTickets.map((t) => t.id),
    };
  }

  // Date range filter
  if (startDateParam || endDateParam) {
    where.createdAt = {};
    if (startDateParam) {
      where.createdAt.gte = new Date(startDateParam);
    }
    if (endDateParam) {
      where.createdAt.lte = new Date(endDateParam);
    }
  }

  // Fetch comments with related data
  const comments = await prisma.comment.findMany({
    where,
    include: {
      author: {
        select: { name: true, email: true },
      },
      ticket: {
        select: {
          number: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV content
  const headers = ["Ticket Number", "Ticket Title", "Comment", "Author", "Author Email", "Internal", "Created At"];

  const rows = comments.map((comment) => {
    // For requesters, scrub internal comment content
    const commentBody = comment.internal && isRequester ? "[Internal Comment - Hidden]" : comment.body;

    return [
      comment.ticket.number.toString(),
      `"${(comment.ticket.title || "").replace(/"/g, '""')}"`,
      `"${(commentBody || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      comment.author?.name || "",
      comment.author?.email || "",
      comment.internal ? "Yes" : "No",
      comment.createdAt.toISOString(),
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  // Return CSV file
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="comments-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

