import { TicketPriority } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { computeSlaDueDates, toIsoDueDates } from "@/lib/sla-preview";

describe("SLA due date calculation", () => {
  it("computes due dates based on policy hours", () => {
    const now = new Date("2024-01-01T00:00:00Z");
    const result = computeSlaDueDates(
      {
        priority: TicketPriority.SREDNI,
        firstResponseHours: 2,
        resolveHours: 6,
        category: null,
      },
      now,
    );

    const iso = toIsoDueDates(result);
    expect(iso.firstResponseDue).toBe("2024-01-01T02:00:00.000Z");
    expect(iso.resolveDue).toBe("2024-01-01T06:00:00.000Z");
  });

  it("returns null due dates when policy is missing", () => {
    const result = computeSlaDueDates(null);

    expect(result.firstResponseDue).toBeNull();
    expect(result.resolveDue).toBeNull();
  });
});
