export type RetryDecision =
  | { action: "retry"; delayMs: number }
  | { action: "dlq" }
  | { action: "drop" };

export function decideRetry(attemptsMade: number, maxAttempts: number, backoffMs: number): RetryDecision {
  const attempt = Number.isFinite(attemptsMade) ? attemptsMade : 0;
  const allowed = Number.isFinite(maxAttempts) ? Math.max(0, maxAttempts) : 0;

  if (allowed === 0) {
    return { action: "drop" };
  }

  if (attempt < allowed - 1) {
    return { action: "retry", delayMs: Math.max(0, backoffMs) };
  }

  return { action: "dlq" };
}
