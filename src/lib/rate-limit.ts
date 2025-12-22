import { NextRequest, NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

type CheckResult =
  | { allowed: true }
  | { allowed: false; response: NextResponse };

const buckets = new Map<string, Bucket>();

const envEnabled = process.env.RATE_LIMIT_ENABLED === "true";
const windowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10);
const maxRequests = Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "100", 10);
const disabledRoutes = (process.env.RATE_LIMIT_DISABLED_ROUTES ?? "")
  .split(",")
  .map((r) => r.trim())
  .filter(Boolean);

export function checkRateLimit(req: NextRequest, routeId: string): CheckResult {
  if (!envEnabled || disabledRoutes.includes(routeId)) {
    return { allowed: true };
  }

  const identifier =
    req.ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const now = Date.now();
  const existing = buckets.get(identifier);

  if (!existing || existing.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
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
          },
        }
      ),
    };
  }

  existing.count += 1;
  buckets.set(identifier, existing);
  return { allowed: true };
}
