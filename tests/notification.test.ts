import { describe, expect, it } from "vitest";
import { createNotificationService } from "@/lib/notification";

describe("Notification service", () => {
  it("sends and returns an id", async () => {
    const service = createNotificationService();
    const result = await service.send({
      channel: "email",
      to: "user@example.com",
      subject: "Hello",
      body: "Hi",
    });

    expect(result.id).toBeTruthy();
    expect(result.status).toBe("queued");
    expect(result.deduped).toBe(false);
  });

  it("deduplicates by idempotencyKey", async () => {
    const service = createNotificationService();
    const first = await service.send({
      channel: "inapp",
      to: "user-1",
      idempotencyKey: "abc",
    });
    const second = await service.send({
      channel: "inapp",
      to: "user-1",
      idempotencyKey: "abc",
    });

    expect(second.id).toBe(first.id);
    expect(second.deduped).toBe(true);
  });

  it("throws on invalid payload", async () => {
    const service = createNotificationService();
    // @ts-expect-error testing validation
    await expect(() => service.send({ channel: "email", to: "" })).rejects.toThrow();
  });
});
