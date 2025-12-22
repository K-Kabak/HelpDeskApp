import { describe, expect, test } from "vitest";
import { getQueueHealth } from "@/worker/health";

describe("worker health dry-run", () => {
  test("returns skip status without Redis", async () => {
    const report = await getQueueHealth({ dryRun: true });
    expect(report.status).toBe("skip");
    expect(report.queueName).toBeTruthy();
    expect(report.redisUrl).toBeTruthy();
  });
});
