import { describe, expect, it, beforeEach, vi } from "vitest";
import * as slaJobs from "@/lib/sla-jobs";
import { scheduleSlaJobsForTicket, scheduleSlaReminderForTicket } from "@/lib/sla-scheduler";
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
      requesterId: "user-1",
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
      requesterId: "user-1",
    };

    const first = await scheduleSlaJobsForTicket(ticket);
    const second = await scheduleSlaJobsForTicket(ticket);

    expect(first[0].deduped).toBe(false);
    expect(second[0].deduped).toBe(true);
  });

  describe("SLA reminders", () => {
    const enqueueSpy = vi.spyOn(slaJobs, "enqueueSlaJob");

    afterEach(() => {
      enqueueSpy.mockReset();
      delete process.env.SLA_REMINDER_LEAD_MINUTES;
    });

    it("schedules a reminder before due when lead time configured", async () => {
      process.env.SLA_REMINDER_LEAD_MINUTES = "20";
      const ticket = {
        id: "77777777-7777-7777-7777-777777777777",
        organizationId: "org",
        priority: "SREDNI",
        requesterId: "user-1",
        firstResponseDue: new Date(Date.now() + 3_600_000).toISOString(),
        resolveDue: null,
      };

      const result = await scheduleSlaReminderForTicket(ticket);
      expect(result).toHaveLength(1);
      expect(enqueueSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          jobType: "reminder",
          metadata: expect.objectContaining({
            reminderFor: "first-response",
            requesterId: "user-1",
          }),
        }),
      );
    });

    it("does not schedule reminder when due is within lead time", async () => {
      process.env.SLA_REMINDER_LEAD_MINUTES = "60";
      const ticket = {
        id: "88888888-8888-8888-8888-888888888888",
        organizationId: "org",
        priority: "SREDNI",
        requesterId: "user-1",
        firstResponseDue: new Date(Date.now() + 60000).toISOString(),
        resolveDue: null,
      };

      const result = await scheduleSlaReminderForTicket(ticket);
      expect(result).toHaveLength(0);
      expect(enqueueSpy).not.toHaveBeenCalled();
    });
  });
});
