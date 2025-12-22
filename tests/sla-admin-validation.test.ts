import { describe, expect, it } from "vitest";
import { TicketPriority } from "@prisma/client";
import { validateSlaInput } from "@/app/app/admin/sla-policies/validation";

describe("SLA policy client validation", () => {
  it("accepts valid payload", () => {
    const result = validateSlaInput({
      priority: TicketPriority.SREDNI,
      categoryId: null,
      firstResponseHours: 8,
      resolveHours: 24,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive numbers", () => {
    const result = validateSlaInput({
      priority: TicketPriority.SREDNI,
      categoryId: null,
      firstResponseHours: 0,
      resolveHours: -1,
    });
    expect(result.success).toBe(false);
  });
});
