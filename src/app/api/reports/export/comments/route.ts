import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ticketScope } from "@/lib/authorization";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import type { SessionWithUser } from "@/lib/session-types";

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
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/4c56f378-5b29-4f14-93b1-f3f61e2c3120", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "pre-fix",
      hypothesisId: "route-session",
      location: "src/app/api/reports/export/comments/route.ts:19",
      message: "Comments export session",
      data: { user: session.user, params: Object.fromEntries(new URL(req.url).searchParams.entries()) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const { searchParams } = new URL(req.url);
  const ticketIdParam = searchParams.get("ticketId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const internalParam = searchParams.get("internal");

  // Requesters cannot see internal comments - enforce security at query level
  const isRequester = session.user.role === "REQUESTER";
  const includeInternal = internalParam === "true" && !isRequester;

  // Build where clause with organization scoping and visibility rules
  const where: Prisma.CommentWhereInput = {
    isInternal: includeInternal ? undefined : false, // Requesters only see public comments
  };

  // Build ticket scope for filtering
  const ticketScopeClause = ticketScope({
    id: session.user.id,
    role: session.user.role ?? "REQUESTER",
    organizationId: session.user.organizationId,
  });

  // Handle invalid scope - if user has no organizationId and is not a requester,
  // ticketScope returns { id: { in: [] } } which will match no tickets
  // We can proceed with the query as it will naturally return empty results

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

  // Fetch comments with related ticket and author data for CSV export
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
    // Security: For requesters, scrub internal comment content even if somehow included
    const commentBody = comment.isInternal && isRequester ? "[Internal Comment - Hidden]" : comment.bodyMd;

    return [
      comment.ticket.number.toString(),
      `"${(comment.ticket.title || "").replace(/"/g, '""')}"`,
      `"${(commentBody || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      comment.author?.name || "",
      comment.author?.email || "",
      comment.isInternal ? "Yes" : "No",
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

