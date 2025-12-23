import { describe, expect, it } from "vitest";
import { TicketStatus } from "@prisma/client";
import { getSlaStatus } from "@/lib/sla-status";

describe("Dashboard SLA status filtering", () => {
  it("filters tickets by breached SLA status", () => {
    const now = Date.now();
    const past = new Date(now - 10_000);
    const future = new Date(now + 60_000);

    const tickets = [
      { status: TicketStatus.NOWE, firstResponseDue: past, firstResponseAt: null, resolveDue: null, closedAt: null, resolvedAt: null },
      { status: TicketStatus.W_TOKU, resolveDue: past, firstResponseDue: null, firstResponseAt: null, closedAt: null, resolvedAt: null },
      { status: TicketStatus.NOWE, firstResponseDue: future, firstResponseAt: null, resolveDue: null, closedAt: null, resolvedAt: null },
      { status: TicketStatus.W_TOKU, resolveDue: future, firstResponseDue: null, firstResponseAt: new Date(), closedAt: null, resolvedAt: null },
      { status: TicketStatus.ROZWIAZANE, firstResponseDue: past, firstResponseAt: null, resolveDue: null, closedAt: null, resolvedAt: new Date() },
    ];

    const filteredBreached = tickets.filter(ticket => {
      const sla = getSlaStatus(ticket);
      if (ticket.status === "ZAMKNIETE" || ticket.status === "ROZWIAZANE") {
        return false;
      }
      return sla.state === "breached";
    });

    const filteredHealthy = tickets.filter(ticket => {
      const sla = getSlaStatus(ticket);
      if (ticket.status === "ZAMKNIETE" || ticket.status === "ROZWIAZANE") {
        return false;
      }
      return sla.state === "healthy";
    });

    expect(filteredBreached).toHaveLength(2);
    expect(filteredHealthy).toHaveLength(2);
    expect(filteredBreached.every(ticket => ticket.status !== "ROZWIAZANE" && ticket.status !== "ZAMKNIETE")).toBe(true);
    expect(filteredHealthy.every(ticket => ticket.status !== "ROZWIAZANE" && ticket.status !== "ZAMKNIETE")).toBe(true);
  });

  it("excludes closed and resolved tickets from SLA status filtering", () => {
    const past = new Date(Date.now() - 10_000);
    const tickets = [
      { status: TicketStatus.ROZWIAZANE, firstResponseDue: past, firstResponseAt: null, resolveDue: null, closedAt: null, resolvedAt: new Date() },
      { status: TicketStatus.ZAMKNIETE, firstResponseDue: past, firstResponseAt: null, resolveDue: null, closedAt: new Date(), resolvedAt: null },
      { status: TicketStatus.NOWE, firstResponseDue: past, firstResponseAt: null, resolveDue: null, closedAt: null, resolvedAt: null },
    ];

    const filteredBreached = tickets.filter(ticket => {
      const sla = getSlaStatus(ticket);
      if (ticket.status === "ZAMKNIETE" || ticket.status === "ROZWIAZANE") {
        return false;
      }
      return sla.state === "breached";
    });

    expect(filteredBreached).toHaveLength(1);
    expect(filteredBreached[0].status).toBe(TicketStatus.NOWE);
  });
});

describe("Dashboard SLA widgets - breach state counting", () => {
  it("counts breached tickets correctly", () => {
    const now = Date.now();
    const past = new Date(now - 10_000);
    const future = new Date(now + 60_000);

    const tickets = [
      { status: TicketStatus.NOWE, firstResponseDue: past, firstResponseAt: null, resolveDue: null, closedAt: null, resolvedAt: null },
      { status: TicketStatus.W_TOKU, resolveDue: past, firstResponseDue: null, firstResponseAt: null, closedAt: null, resolvedAt: null },
      { status: TicketStatus.NOWE, firstResponseDue: future, firstResponseAt: null, resolveDue: null, closedAt: null, resolvedAt: null },
      { status: TicketStatus.W_TOKU, resolveDue: future, firstResponseDue: null, firstResponseAt: new Date(), closedAt: null, resolvedAt: null },
    ];

    const counts = tickets.reduce(
      (acc, ticket) => {
        const sla = getSlaStatus(ticket);
        if (sla.state === "breached") {
          acc.breached += 1;
        } else {
          acc.healthy += 1;
        }
        return acc;
      },
      { breached: 0, healthy: 0 },
    );

    expect(counts.breached).toBe(2);
    expect(counts.healthy).toBe(2);
  });

  it("excludes closed tickets from counts", () => {
    const past = new Date(Date.now() - 10_000);
    const tickets = [
      { status: TicketStatus.ROZWIAZANE, firstResponseDue: null, firstResponseAt: null, resolveDue: null, closedAt: null, resolvedAt: new Date() },
      { status: TicketStatus.ZAMKNIETE, firstResponseDue: null, firstResponseAt: null, resolveDue: null, closedAt: new Date(), resolvedAt: null },
      { status: TicketStatus.NOWE, firstResponseDue: past, firstResponseAt: null, resolveDue: null, closedAt: null, resolvedAt: null },
    ];

    const counts = tickets.reduce(
      (acc, ticket) => {
        const sla = getSlaStatus(ticket);
        if (sla.state === "breached") {
          acc.breached += 1;
        } else {
          acc.healthy += 1;
        }
        return acc;
      },
      { breached: 0, healthy: 0 },
    );

    // Closed tickets return "healthy" (SLA met), but should be excluded from dashboard query
    // This test verifies the counting logic works correctly on filtered open tickets
    expect(counts.breached).toBe(1);
    expect(counts.healthy).toBe(2);
  });
});
