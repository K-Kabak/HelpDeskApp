import { describe, expect, test } from "vitest";
import { getOpenTicketSlaCounts } from "@/lib/sla-summary";
import { Ticket, TicketStatus } from "@prisma/client";

type TicketFields = Pick<
  Ticket,
  "status" | "firstResponseAt" | "firstResponseDue" | "resolveDue" | "resolvedAt" | "closedAt"
>;

function makeTicket(overrides: Partial<TicketFields> = {}): TicketFields {
  return {
    status: TicketStatus.NOWE,
    firstResponseAt: null,
    firstResponseDue: new Date(Date.now() + 10 * 60 * 1000),
    resolveDue: new Date(Date.now() + 60 * 60 * 1000),
    resolvedAt: null,
    closedAt: null,
    ...overrides,
  };
}

describe("getOpenTicketSlaCounts", () => {
  test("counts breached and healthy states", () => {
    const healthy = makeTicket();
    const breached = makeTicket({ resolveDue: new Date(Date.now() - 60 * 1000) });
    const counts = getOpenTicketSlaCounts([healthy, breached]);
    expect(counts.healthy).toBe(1);
    expect(counts.breached).toBe(1);
  });

  test("ignores closed tickets", () => {
    const closed = makeTicket({
      status: TicketStatus.ROZWIAZANE,
      closedAt: new Date(),
      resolvedAt: new Date(),
    });
    const counts = getOpenTicketSlaCounts([closed]);
    expect(counts.healthy).toBe(0);
    expect(counts.breached).toBe(0);
  });
});
