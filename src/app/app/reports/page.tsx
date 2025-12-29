import { getAppServerSession } from "@/lib/server-session";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";
import { calculateKpiMetrics, DateRange, type KpiMetrics } from "@/lib/kpi-metrics";
import { prisma } from "@/lib/prisma";

async function fetchAnalytics(organizationId: string, days: number) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

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

  const trends = Object.entries(dailyStats)
    .map(([date, stats]) => ({
      date,
      created: stats.created,
      resolved: stats.resolved,
      byPriority: stats.byPriority,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalCreated = tickets.length;
  const totalResolved = tickets.filter((t) => t.resolvedAt).length;
  const avgCreatedPerDay = totalCreated / days;
  const avgResolvedPerDay = totalResolved / days;

  return {
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
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { days?: string } | Promise<{ days?: string }>;
}) {
  const session = await getAppServerSession();
  if (!session?.user) {
    redirect("/login");
  }

  // Only admins can access reports
  if (session.user.role !== "ADMIN") {
    redirect("/app");
  }

  if (!session.user.organizationId) {
    redirect("/app");
  }

  const params = await searchParams;
  const days = params?.days ? parseInt(params.days, 10) : 30;
  const validDays = Math.min(Math.max(days, 7), 365);

  // Fetch data server-side
  let analytics = null;
  let kpi: KpiMetrics | null = null;

  try {
    const dateRange: DateRange = {
      startDate: new Date(),
      endDate: new Date(),
    };
    dateRange.startDate.setDate(dateRange.startDate.getDate() - validDays);

    [analytics, kpi] = await Promise.all([
      fetchAnalytics(session.user.organizationId, validDays),
      calculateKpiMetrics(session.user.organizationId, dateRange),
    ]);
  } catch (error) {
    console.error("Error fetching reports data:", error);
    // Continue with null data - client will handle fetching
  }

  return <ReportsClient initialAnalytics={analytics} initialKpi={kpi} initialDays={validDays} />;
}

