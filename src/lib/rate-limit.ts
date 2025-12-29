import { NextRequest, NextResponse } from "next/server";
import type { SecurityEventType } from "@/lib/logger";

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
  securityEvent?: (event: SecurityEventType, meta?: Record<string, unknown>) => void;
};

type CheckOptions = {
  identifier?: string;
  logger?: RateLimitLogger;
  maxRequests?: number;
  windowMs?: number;
};

const buckets = new Map<string, Bucket>();

// Per-route rate limit configurations
// Format: routeId -> { maxRequests, windowMs }
const routeConfigs: Record<string, { maxRequests: number; windowMs: number }> = {
  "auth:login": { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  "tickets:create": { maxRequests: 60, windowMs: 10 * 60 * 1000 }, // 60 per 10 minutes
  "comments:create": { maxRequests: 60, windowMs: 10 * 60 * 1000 }, // 60 per 10 minutes
  "tickets:bulk": { maxRequests: 20, windowMs: 10 * 60 * 1000 }, // 20 per 10 minutes
};

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
  const { enabled, disabledRoutes } = getConfig();

  if (!enabled || disabledRoutes.includes(routeId)) {
    return { allowed: true };
  }

  // Get route-specific config or use defaults
  const routeConfig = routeConfigs[routeId];
  const windowMs = options?.windowMs ?? routeConfig?.windowMs ?? getConfig().windowMs;
  const maxRequests = options?.maxRequests ?? routeConfig?.maxRequests ?? getConfig().maxRequests;

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
    options?.logger?.securityEvent?.("rate_limit_violation", {
      routeId,
      identifier,
      retryAfterSeconds,
      resetAt: existing.resetAt,
    });
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
