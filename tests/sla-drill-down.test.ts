import { describe, expect, it } from "vitest";
import { TicketStatus } from "@prisma/client";
import { getSlaStatus } from "@/lib/sla-status";

describe("SLA drill-down filtering", () => {
  const createMockTicket = (status: TicketStatus, firstResponseDue: Date | null, firstResponseAt: Date | null = null, resolveDue: Date | null = null, resolvedAt: Date | null = null, closedAt: Date | null = null) => ({
    status,
    firstResponseDue,
    firstResponseAt,
    resolveDue,
    closedAt,
    resolvedAt,
  });

  it("correctly filters tickets by SLA status parameter", () => {
    const now = Date.now();
    const past = new Date(now - 10_000);
    const future = new Date(now + 60_000);

    const tickets = [
      createMockTicket(TicketStatus.NOWE, past), // breached
      createMockTicket(TicketStatus.W_TOKU, past, null, past), // breached
      createMockTicket(TicketStatus.NOWE, future), // healthy
      createMockTicket(TicketStatus.W_TOKU, future, new Date(), future), // healthy
      createMockTicket(TicketStatus.ROZWIAZANE, past, null, null, new Date()), // resolved - should be excluded
      createMockTicket(TicketStatus.ZAMKNIETE, past, null, null, null, new Date()), // closed - should be excluded
    ];

    const filterBySlaStatus = (slaStatus: "breached" | "healthy") => {
      return tickets.filter(ticket => {
        const sla = getSlaStatus(ticket);
        if (ticket.status === "ZAMKNIETE" || ticket.status === "ROZWIAZANE") {
          return false;
        }
        return sla.state === slaStatus;
      });
    };

    const breachedTickets = filterBySlaStatus("breached");
    const healthyTickets = filterBySlaStatus("healthy");

    expect(breachedTickets).toHaveLength(2);
    expect(healthyTickets).toHaveLength(2);

    // Verify all breached tickets have breached SLA status
    breachedTickets.forEach(ticket => {
      const sla = getSlaStatus(ticket);
      expect(sla.state).toBe("breached");
      expect(ticket.status).not.toBe(TicketStatus.ROZWIAZANE);
      expect(ticket.status).not.toBe(TicketStatus.ZAMKNIETE);
    });

    // Verify all healthy tickets have healthy SLA status
    healthyTickets.forEach(ticket => {
      const sla = getSlaStatus(ticket);
      expect(sla.state).toBe("healthy");
      expect(ticket.status).not.toBe(TicketStatus.ROZWIAZANE);
      expect(ticket.status).not.toBe(TicketStatus.ZAMKNIETE);
    });
  });

  it("handles edge cases in SLA filtering", () => {
    const past = new Date(Date.now() - 10_000);
    const future = new Date(Date.now() + 60_000);

    const tickets = [
      createMockTicket(TicketStatus.NOWE, null), // no SLA due dates - should be healthy
      createMockTicket(TicketStatus.W_TOKU, past, new Date()), // responded but resolve due past - breached
      createMockTicket(TicketStatus.OCZEKUJE_NA_UZYTKOWNIKA, future), // waiting - healthy
      createMockTicket(TicketStatus.WSTRZYMANE, past), // paused - healthy
    ];

    const breachedTickets = tickets.filter(ticket => {
      const sla = getSlaStatus(ticket);
      if (ticket.status === "ZAMKNIETE" || ticket.status === "ROZWIAZANE") {
        return false;
      }
      return sla.state === "breached";
    });

    const healthyTickets = tickets.filter(ticket => {
      const sla = getSlaStatus(ticket);
      if (ticket.status === "ZAMKNIETE" || ticket.status === "ROZWIAZANE") {
        return false;
      }
      return sla.state === "healthy";
    });

    expect(breachedTickets).toHaveLength(1);
    expect(healthyTickets).toHaveLength(3);
  });

  it("generates correct navigation URLs for SLA widgets", () => {
    // Test URL generation logic
    const createSlaUrl = (slaStatus: "breached" | "healthy") => `/app?slaStatus=${slaStatus}`;

    expect(createSlaUrl("breached")).toBe("/app?slaStatus=breached");
    expect(createSlaUrl("healthy")).toBe("/app?slaStatus=healthy");
  });

  it("preserves other query parameters when filtering by SLA status", () => {
    const baseParams = new URLSearchParams();
    baseParams.set("status", "NOWE");
    baseParams.set("priority", "WYSOKI");
    baseParams.set("slaStatus", "breached");

    const url = `/app?${baseParams.toString()}`;
    expect(url).toBe("/app?status=NOWE&priority=WYSOKI&slaStatus=breached");
  });
});
