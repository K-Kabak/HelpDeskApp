import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin (analytics are typically admin-only)
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  const organizationId = session.user.organizationId;
  const { searchParams } = new URL(req.url);
  
  // Support both days parameter and custom date range
  const daysParam = searchParams.get("days");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  
  let startDate: Date;
  let endDate: Date;
  let days: number;
  
  if (startDateParam && endDateParam) {
    // Custom date range
    startDate = new Date(startDateParam);
    endDate = new Date(endDateParam);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }
    
    if (startDate > endDate) {
      return NextResponse.json({ error: "startDate must be before endDate" }, { status: 400 });
    }
    
    days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // Use days parameter (default 30)
    const daysValue = daysParam ? parseInt(daysParam, 10) : 30;
    days = Math.min(Math.max(daysValue, 7), 365);
    
    endDate = new Date();
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
  }

  // Get daily ticket creation and resolution trends
  const tickets = await prisma.ticket.findMany({
    where: {
      organizationId,
      OR: [
        { createdAt: { gte: startDate } },
        { resolvedAt: { gte: startDate, not: null } },
      ],
    },
    select: {
      createdAt: true,
      resolvedAt: true,
      status: true,
      priority: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const dailyStats: Record<string, { created: number; resolved: number; byPriority: Record<string, number> }> = {};

  tickets.forEach((ticket) => {
    const createdDate = ticket.createdAt.toISOString().split("T")[0];
    if (!dailyStats[createdDate]) {
      dailyStats[createdDate] = { created: 0, resolved: 0, byPriority: {} };
    }
    dailyStats[createdDate].created++;
    if (!dailyStats[createdDate].byPriority[ticket.priority]) {
      dailyStats[createdDate].byPriority[ticket.priority] = 0;
    }
    dailyStats[createdDate].byPriority[ticket.priority]++;

    if (ticket.resolvedAt) {
      const resolvedDate = ticket.resolvedAt.toISOString().split("T")[0];
      if (!dailyStats[resolvedDate]) {
        dailyStats[resolvedDate] = { created: 0, resolved: 0, byPriority: {} };
      }
      dailyStats[resolvedDate].resolved++;
    }
  });

  // Convert to array format for easier charting
  const trends = Object.entries(dailyStats)
    .map(([date, stats]) => ({
      date,
      created: stats.created,
      resolved: stats.resolved,
      byPriority: stats.byPriority,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate summary statistics
  const totalCreated = tickets.length;
  const totalResolved = tickets.filter((t) => t.resolvedAt).length;
  const avgCreatedPerDay = totalCreated / days;
  const avgResolvedPerDay = totalResolved / days;

  return NextResponse.json({
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      days,
    },
    summary: {
      totalCreated,
      totalResolved,
      avgCreatedPerDay: Math.round(avgCreatedPerDay * 10) / 10,
      avgResolvedPerDay: Math.round(avgResolvedPerDay * 10) / 10,
    },
    trends,
  });
}

