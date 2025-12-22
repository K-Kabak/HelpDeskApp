import { describe, expect, it } from "vitest";
import { createSlaJobPayload, enqueueSlaJob, slaJobPayloadSchema } from "@/lib/sla-jobs";

describe("SLA job schema", () => {
  it("validates a complete payload", () => {
    const payload = createSlaJobPayload({
      jobType: "first-response",
      ticketId: "00000000-0000-0000-0000-000000000000",
      organizationId: "org",
      dueAt: new Date().toISOString(),
      priority: "WYSOKI",
    });

    const parsed = slaJobPayloadSchema.parse(payload);
    expect(parsed.jobType).toBe("first-response");
    expect(parsed.jobId).toBeTruthy();
  });

  it("rejects invalid dueAt", () => {
    expect(() =>
      slaJobPayloadSchema.parse({
        jobId: "22222222-2222-2222-2222-222222222222",
        jobType: "resolve",
      ticketId: "00000000-0000-0000-0000-000000000000",
        organizationId: "org",
        dueAt: "not-a-date",
        priority: "NISKI",
        categoryId: null,
      })
    ).toThrow();
  });
});

describe("enqueue helper stub", () => {
  it("returns queue result", async () => {
    const payload = createSlaJobPayload({
      jobType: "resolve",
      ticketId: "00000000-0000-0000-0000-000000000000",
      organizationId: "org",
      dueAt: new Date().toISOString(),
      priority: "SREDNI",
    });

    const result = await enqueueSlaJob(payload);
    expect(result.enqueued).toBe(true);
    expect(result.deduped).toBe(false);
    expect(result.jobType).toBe("resolve");
  });
});
