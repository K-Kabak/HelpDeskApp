import { NextResponse } from "next/server";

type CheckResult =
  | { allowed: true }
  | { allowed: false; response: NextResponse };

type Logger = {
  warn?: (message: string, meta?: Record<string, unknown>) => void;
};

const lastCommentAt = new Map<string, number>();

function getConfig() {
  return {
    // Disable spam guard in tests to avoid noisy timing-dependent failures.
    enabled:
      process.env.NODE_ENV !== "test" &&
      process.env.SPAM_GUARD_ENABLED !== "false",
    cooldownMs: Number.parseInt(process.env.SPAM_GUARD_COOLDOWN_MS ?? "10000", 10),
  };
}

export function resetSpamGuard() {
  lastCommentAt.clear();
}

export function checkCommentCooldown(userId: string, logger?: Logger): CheckResult {
  const { enabled, cooldownMs } = getConfig();
  if (!enabled) return { allowed: true };

  const now = Date.now();
  const previous = lastCommentAt.get(userId);

  if (previous && now - previous < cooldownMs) {
    const retryAfterSeconds = Math.max(1, Math.ceil((cooldownMs - (now - previous)) / 1000));
    logger?.warn?.("comment.cooldown.blocked", { userId, retryAfterSeconds });
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": `${retryAfterSeconds}`,
          },
        }
      ),
    };
  }

  lastCommentAt.set(userId, now);
  return { allowed: true };
}
