import { NextRequest, NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

type CheckResult =
  | { allowed: true }
  | { allowed: false; response: NextResponse };

type RateLimitLogger = {
  info?: (message: string, meta?: Record<string, unknown>) => void;
  warn?: (message: string, meta?: Record<string, unknown>) => void;
};

type CheckOptions = {
  identifier?: string;
  logger?: RateLimitLogger;
};

const buckets = new Map<string, Bucket>();

function getConfig() {
  return {
    enabled: process.env.RATE_LIMIT_ENABLED === "true",
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10),
    maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "20", 10),
    disabledRoutes: (process.env.RATE_LIMIT_DISABLED_ROUTES ?? "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean),
  };
}

function getIdentifier(req: Request | NextRequest) {
  const xf = req.headers.get("x-forwarded-for");
  if ("ip" in req && typeof req.ip === "string" && req.ip) {
    return req.ip;
  }
  if (xf) {
    return xf.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}

export function resetRateLimitBuckets() {
  buckets.clear();
}

export function checkRateLimit(req: Request | NextRequest, routeId: string, options?: CheckOptions): CheckResult {
  const { enabled, windowMs, maxRequests, disabledRoutes } = getConfig();

  if (!enabled || disabledRoutes.includes(routeId)) {
    return { allowed: true };
  }

  const identifier = options?.identifier ?? getIdentifier(req);
  const key = `${routeId}:${identifier}`;

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    options?.logger?.warn?.("rate_limit.blocked", {
      routeId,
      identifier,
      retryAfterSeconds,
      resetAt: existing.resetAt,
    });
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": `${retryAfterSeconds}`,
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": `${existing.resetAt}`,
            "X-RateLimit-Limit": `${maxRequests}`,
          },
        }
      ),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true };
}
