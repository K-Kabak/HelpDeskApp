import { describe, expect, it, beforeEach } from "vitest";
import { scheduleSlaJobsForTicket } from "@/lib/sla-scheduler";
import { resetSlaJobDedupe } from "@/lib/sla-jobs";

beforeEach(() => {
  resetSlaJobDedupe();
});

describe("SLA scheduler", () => {
  it("enqueues only future timers", async () => {
    const ticket = {
      id: "55555555-5555-5555-5555-555555555555",
      organizationId: "org",
      priority: "SREDNI",
      firstResponseDue: new Date(Date.now() + 60000).toISOString(),
      resolveDue: new Date(Date.now() - 60000).toISOString(),
    };

    const result = await scheduleSlaJobsForTicket(ticket);
    expect(result).toHaveLength(1);
    expect(result[0].jobType).toBe("first-response");
  });

  it("dedupes repeated schedules", async () => {
    const ticket = {
      id: "66666666-6666-6666-6666-666666666666",
      organizationId: "org",
      priority: "WYSOKI",
      firstResponseDue: new Date(Date.now() + 60000).toISOString(),
      resolveDue: null,
    };

    const first = await scheduleSlaJobsForTicket(ticket);
    const second = await scheduleSlaJobsForTicket(ticket);

    expect(first[0].deduped).toBe(false);
    expect(second[0].deduped).toBe(true);
  });
});
