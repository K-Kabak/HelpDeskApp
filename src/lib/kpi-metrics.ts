import { prisma } from "./prisma";
import { TicketStatus } from "@prisma/client";

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type KpiMetrics = {
  // Mean Time To Resolution
  mttr: {
    averageHours: number;
    averageMinutes: number;
    totalResolved: number;
  } | null;
  // Mean Time To Answer (first response)
  mtta: {
    averageHours: number;
    averageMinutes: number;
    totalWithResponse: number;
  } | null;
  // Reopen rate
  reopenRate: {
    percentage: number;
    reopenedCount: number;
    totalClosedCount: number;
  } | null;
  // SLA Compliance
  slaCompliance: {
    percentage: number;
    compliantCount: number;
    totalResolvedCount: number;
  } | null;
  // Date range used for calculation
  dateRange?: {
    startDate: string;
    endDate: string;
  };
};

/**
 * Calculates KPI metrics for an organization within a date range.
 * 
 * Computes four key performance indicators:
 * - MTTR (Mean Time to Resolve): Average time from ticket creation to resolution
 * - MTTA (Mean Time to Acknowledge): Average time to first agent response
 * - Reopen Rate: Percentage of closed tickets that were reopened
 * - SLA Compliance: Percentage of tickets resolved within SLA deadlines
 * 
 * @param organizationId - Organization ID to calculate metrics for
 * @param dateRange - Optional date range to filter tickets (defaults to last 30 days)
 * @returns KPI metrics object with calculated values or null if insufficient data
 */
export async function calculateKpiMetrics(
  organizationId: string,
  dateRange?: DateRange
): Promise<KpiMetrics> {
  // Default to last 30 days if no date range provided
  const endDate = dateRange?.endDate ?? new Date();
  const startDate = dateRange?.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get all tickets in the date range (created within period)
  const tickets = await prisma.ticket.findMany({
    where: {
      organizationId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      createdAt: true,
      firstResponseAt: true,
      resolvedAt: true,
      closedAt: true,
      status: true,
      lastReopenedAt: true,
    },
  });

  // Calculate MTTR (Mean Time To Resolution)
  // Only count tickets that were resolved (have resolvedAt or closedAt)
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.resolvedAt || ticket.closedAt
  );

  let mttr: KpiMetrics["mttr"] = null;
  if (resolvedTickets.length > 0) {
    const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => {
      const resolvedTime = ticket.resolvedAt || ticket.closedAt;
      if (!resolvedTime) return sum;
      const resolutionTime = resolvedTime.getTime() - ticket.createdAt.getTime();
      return sum + resolutionTime;
    }, 0);
    // Convert milliseconds to hours and minutes
    const averageMs = totalResolutionTime / resolvedTickets.length;
    const averageHours = averageMs / (1000 * 60 * 60);
    const averageMinutes = averageMs / (1000 * 60);
    
    mttr = {
      averageHours: Math.round(averageHours * 100) / 100,
      averageMinutes: Math.round(averageMinutes * 100) / 100,
      totalResolved: resolvedTickets.length,
    };
  }

  // Calculate MTTA (Mean Time To Answer/First Response)
  const ticketsWithFirstResponse = tickets.filter(
    (ticket) => ticket.firstResponseAt !== null
  );

  let mtta: KpiMetrics["mtta"] = null;
  if (ticketsWithFirstResponse.length > 0) {
    const totalFirstResponseTime = ticketsWithFirstResponse.reduce((sum, ticket) => {
      if (!ticket.firstResponseAt) return sum;
      const firstResponseTime = ticket.firstResponseAt.getTime() - ticket.createdAt.getTime();
      return sum + firstResponseTime;
    }, 0);
    // Convert milliseconds to hours and minutes
    const averageMs = totalFirstResponseTime / ticketsWithFirstResponse.length;
    const averageHours = averageMs / (1000 * 60 * 60);
    const averageMinutes = averageMs / (1000 * 60);
    
    mtta = {
      averageHours: Math.round(averageHours * 100) / 100,
      averageMinutes: Math.round(averageMinutes * 100) / 100,
      totalWithResponse: ticketsWithFirstResponse.length,
    };
  }

  // Calculate Reopen Rate
  // Reopen rate = (reopened tickets / closed tickets) * 100
  // A ticket is considered reopened if:
  // 1. It has lastReopenedAt set, OR
  // 2. Current status is PONOWNIE_OTWARTE
  // A ticket is considered closed if it has been resolved or closed (resolvedAt or closedAt set)
  const closedTickets = tickets.filter(
    (ticket) => ticket.resolvedAt !== null || ticket.closedAt !== null
  );
  const reopenedTickets = closedTickets.filter(
    (ticket) =>
      ticket.lastReopenedAt !== null || ticket.status === TicketStatus.PONOWNIE_OTWARTE
  );

  let reopenRate: KpiMetrics["reopenRate"] = null;
  if (closedTickets.length > 0) {
    reopenRate = {
      percentage: Math.round((reopenedTickets.length / closedTickets.length) * 100 * 100) / 100,
      reopenedCount: reopenedTickets.length,
      totalClosedCount: closedTickets.length,
    };
  }

  // Calculate SLA Compliance
  // SLA compliance = (tickets resolved before resolveDue / total resolved tickets) * 100
  // We need to fetch tickets with resolveDue to check compliance
  const ticketsWithSla = await prisma.ticket.findMany({
    where: {
      organizationId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      resolveDue: {
        not: null,
      },
      OR: [
        { resolvedAt: { not: null } },
        { closedAt: { not: null } },
      ],
    },
    select: {
      id: true,
      resolveDue: true,
      resolvedAt: true,
      closedAt: true,
    },
  });

  let slaCompliance: KpiMetrics["slaCompliance"] = null;
  if (ticketsWithSla.length > 0) {
    const compliantTickets = ticketsWithSla.filter((ticket) => {
      const resolvedTime = ticket.resolvedAt || ticket.closedAt;
      if (!resolvedTime || !ticket.resolveDue) return false;
      return resolvedTime <= ticket.resolveDue;
    });

    slaCompliance = {
      percentage: Math.round((compliantTickets.length / ticketsWithSla.length) * 100 * 100) / 100,
      compliantCount: compliantTickets.length,
      totalResolvedCount: ticketsWithSla.length,
    };
  }

  return {
    mttr,
    mtta,
    reopenRate,
    slaCompliance,
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  };
}

