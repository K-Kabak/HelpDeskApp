import { afterEach, describe, expect, it, vi } from "vitest";

import { createRequestLogger } from "@/lib/logger";

describe("createRequestLogger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs structured output with request context", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const logger = createRequestLogger({
      route: "/tickets",
      method: "GET",
      userId: "user-1",
    });

    logger.info("hello world", { extra: "value" });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(consoleSpy.mock.calls[0][0] as string);

    expect(payload).toMatchObject({
      level: "info",
      message: "hello world",
      route: "/tickets",
      method: "GET",
      userId: "user-1",
      extra: "value",
    });
    expect(payload.requestId).toBeDefined();
  });
});
