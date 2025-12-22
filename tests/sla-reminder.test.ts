import { describe, expect, it, vi } from "vitest";

import { createSlaJobPayload } from "@/lib/sla-jobs";
import { handleSlaReminder } from "@/lib/sla-reminder";

describe("SLA reminder handler", () => {
  it("sends notification for reminder jobs with metadata", async () => {
    const notifier = {
      send: vi.fn(async () => ({ id: "notif-1", status: "queued", deduped: false })),
    };

    const payload = createSlaJobPayload({
      jobType: "reminder",
      ticketId: "11111111-1111-1111-1111-111111111111",
      organizationId: "org-1",
      dueAt: new Date(Date.now() + 60000).toISOString(),
      priority: "SREDNI",
      idempotencyKey: "reminder-1",
      metadata: { reminderFor: "first-response", requesterId: "user-1" },
    });

    const result = await handleSlaReminder(payload, { notifier });

    expect(result.skipped).toBe(false);
    expect(result.notificationId).toBe("notif-1");
    expect(notifier.send).toHaveBeenCalled();
    expect(notifier.send).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "sla-reminder-notif:11111111-1111-1111-1111-111111111111:first-response",
      }),
    );
  });

  it("skips when recipient missing", async () => {
    const notifier = {
      send: vi.fn(),
    };

    const payload = createSlaJobPayload({
      jobType: "reminder",
      ticketId: "22222222-2222-2222-2222-222222222222",
      organizationId: "org-1",
      dueAt: new Date(Date.now() + 60000).toISOString(),
      priority: "SREDNI",
    });

    const result = await handleSlaReminder(payload, { notifier });
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe("no recipient");
    expect(notifier.send).not.toHaveBeenCalled();
  });
});
