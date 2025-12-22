export type RetryDecision =
  | { action: "retry"; delayMs: number }
  | { action: "dlq" }
  | { action: "drop" };

export function decideRetry(attemptsMade: number, maxAttempts: number, backoffMs: number): RetryDecision {
  const attempt = Number.isFinite(attemptsMade) ? attemptsMade : 0;
  const allowed = Math.max(1, maxAttempts);

  if (attempt < allowed - 1) {
    return { action: "retry", delayMs: Math.max(0, backoffMs) };
  }

  if (allowed > 0) {
    return { action: "dlq" };
  }

  return { action: "drop" };
}
