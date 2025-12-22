import { TicketStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { getSlaStatus } from "./sla-status";

const baseTicket = {
  status: TicketStatus.NOWE,
  firstResponseAt: null,
  firstResponseDue: null,
  resolveDue: null,
  closedAt: null,
  resolvedAt: null,
};

describe("getSlaStatus", () => {
  it("returns healthy when resolved", () => {
    const status = getSlaStatus({
      ...baseTicket,
      status: TicketStatus.ROZWIAZANE,
      resolvedAt: new Date(),
    });
    expect(status.state).toBe("healthy");
  });

  it("flags breach on resolveDue past now", () => {
    const past = new Date(Date.now() - 10_000);
    const status = getSlaStatus({
      ...baseTicket,
      resolveDue: past,
    });
    expect(status.state).toBe("breached");
    expect(status.label).toContain("resolution");
  });

  it("flags breach on firstResponseDue past now without response", () => {
    const past = new Date(Date.now() - 10_000);
    const status = getSlaStatus({
      ...baseTicket,
      firstResponseDue: past,
    });
    expect(status.state).toBe("breached");
    expect(status.label).toContain("first response");
  });

  it("returns healthy with countdown when first response due upcoming", () => {
    const future = new Date(Date.now() + 30 * 60 * 1000);
    const status = getSlaStatus({
      ...baseTicket,
      firstResponseDue: future,
    });
    expect(status.state).toBe("healthy");
    expect(status.label).toContain("SLA za");
  });

  it("returns healthy with countdown when resolve due upcoming after first response", () => {
    const future = new Date(Date.now() + 90 * 60 * 1000);
    const status = getSlaStatus({
      ...baseTicket,
      firstResponseAt: new Date(),
      resolveDue: future,
    });
    expect(status.state).toBe("healthy");
    expect(status.label).toContain("SLA za");
  });
});
