import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import type { SessionWithUser } from "@/lib/session-types";

/**
 * GET /api/reports/csat
 * Returns CSAT analytics for the organization
 * Query params:
 *   - startDate (optional): ISO date string
 *   - endDate (optional): ISO date string
 */
export async function GET(req: Request) {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins can view CSAT analytics
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  const organizationId = session.user.organizationId;
  const { searchParams } = new URL(req.url);
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  // Parse date range
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateParam) {
    startDate = new Date(startDateParam);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Invalid startDate format" }, { status: 400 });
    }
  } else {
    // Default to last 30 days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
  }

  if (endDateParam) {
    endDate = new Date(endDateParam);
    if (isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid endDate format" }, { status: 400 });
    }
  } else {
    endDate = new Date();
  }

  if (startDate > endDate) {
    return NextResponse.json({ error: "startDate must be before endDate" }, { status: 400 });
  }

  // Get CSAT responses with ticket data
  const csatResponses = await prisma.csatResponse.findMany({
    where: {
      ticket: {
        organizationId,
        resolvedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      ticket: {
        select: {
          id: true,
          number: true,
          priority: true,
          category: true,
          resolvedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate statistics
  const totalResponses = csatResponses.length;
  if (totalResponses === 0) {
    return NextResponse.json({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalResponses: 0,
        averageScore: null,
        responseRate: null,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      },
      responses: [],
    });
  }

  // Calculate average score
  const sumScores = csatResponses.reduce((sum, response) => sum + response.score, 0);
  const averageScore = Math.round((sumScores / totalResponses) * 100) / 100;

  // Score distribution
  const distribution = {
    5: csatResponses.filter((r) => r.score === 5).length,
    4: csatResponses.filter((r) => r.score === 4).length,
    3: csatResponses.filter((r) => r.score === 3).length,
    2: csatResponses.filter((r) => r.score === 2).length,
    1: csatResponses.filter((r) => r.score === 1).length,
  };

  // Calculate response rate
  // Get total resolved tickets in period
  const totalResolvedTickets = await prisma.ticket.count({
    where: {
      organizationId,
      resolvedAt: {
        gte: startDate,
        lte: endDate,
      },
      OR: [
        { status: "ROZWIAZANE" },
        { status: "ZAMKNIETE" },
      ],
    },
  });

  const responseRate = totalResolvedTickets > 0
    ? Math.round((totalResponses / totalResolvedTickets) * 100 * 100) / 100
    : null;

  // Group by priority
  const byPriority: Record<string, { count: number; average: number }> = {};
  csatResponses.forEach((response) => {
    const priority = response.ticket.priority;
    if (!byPriority[priority]) {
      byPriority[priority] = { count: 0, average: 0 };
    }
    byPriority[priority].count++;
  });

  // Calculate averages by priority
  Object.keys(byPriority).forEach((priority) => {
    const responses = csatResponses.filter((r) => r.ticket.priority === priority);
    const sum = responses.reduce((s, r) => s + r.score, 0);
    byPriority[priority].average = Math.round((sum / responses.length) * 100) / 100;
  });

  // Group by category
  const byCategory: Record<string, { count: number; average: number }> = {};
  csatResponses.forEach((response) => {
    const category = response.ticket.category || "Uncategorized";
    if (!byCategory[category]) {
      byCategory[category] = { count: 0, average: 0 };
    }
    byCategory[category].count++;
  });

  // Calculate averages by category
  Object.keys(byCategory).forEach((category) => {
    const responses = csatResponses.filter(
      (r) => (r.ticket.category || "Uncategorized") === category
    );
    const sum = responses.reduce((s, r) => s + r.score, 0);
    byCategory[category].average = Math.round((sum / responses.length) * 100) / 100;
  });

  return NextResponse.json({
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalResponses,
      averageScore,
      responseRate,
      totalResolvedTickets,
      distribution,
      byPriority,
      byCategory,
    },
    responses: csatResponses.map((response) => ({
      id: response.id,
      ticketNumber: response.ticket.number,
      ticketId: response.ticket.id,
      score: response.score,
      comment: response.comment,
      createdAt: response.createdAt.toISOString(),
      ticketPriority: response.ticket.priority,
      ticketCategory: response.ticket.category,
    })),
  });
}

