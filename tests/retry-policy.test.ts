import { describe, expect, test } from "vitest";
import { decideRetry } from "@/worker/retry-policy";

describe("decideRetry", () => {
  test("retries until maxAttempts is reached", () => {
    expect(decideRetry(0, 3, 500)).toEqual({ action: "retry", delayMs: 500 });
    expect(decideRetry(1, 3, 500)).toEqual({ action: "retry", delayMs: 500 });
  });

  test("sends to dlq when attempts exhausted", () => {
    expect(decideRetry(2, 3, 500)).toEqual({ action: "dlq" });
  });

  test("drops when maxAttempts is zero", () => {
    expect(decideRetry(0, 0, 100)).toEqual({ action: "drop" });
  });
});
