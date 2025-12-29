import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit, resetRateLimitBuckets } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

const originalEnv = {
  enabled: process.env.RATE_LIMIT_ENABLED,
  window: process.env.RATE_LIMIT_WINDOW_MS,
  max: process.env.RATE_LIMIT_MAX_REQUESTS,
  disabledRoutes: process.env.RATE_LIMIT_DISABLED_ROUTES,
};

beforeEach(() => {
  resetRateLimitBuckets();
  process.env.RATE_LIMIT_ENABLED = "true";
  process.env.RATE_LIMIT_WINDOW_MS = "60000"; // 1 minute
  process.env.RATE_LIMIT_MAX_REQUESTS = "5";
  delete process.env.RATE_LIMIT_DISABLED_ROUTES;
});

afterEach(() => {
  resetRateLimitBuckets();
  process.env.RATE_LIMIT_ENABLED = originalEnv.enabled;
  process.env.RATE_LIMIT_WINDOW_MS = originalEnv.window;
  process.env.RATE_LIMIT_MAX_REQUESTS = originalEnv.max;
  if (originalEnv.disabledRoutes === undefined) {
    delete process.env.RATE_LIMIT_DISABLED_ROUTES;
  } else {
    process.env.RATE_LIMIT_DISABLED_ROUTES = originalEnv.disabledRoutes;
  }
});

describe("Rate Limiting Security Tests", () => {
  describe("Rate Limit Enforcement", () => {
    test("allows requests within limit", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(req, "test:route");
        expect(result.allowed).toBe(true);
      }
    });

    test("blocks requests exceeding limit", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Make requests up to the limit (5 requests allowed)
      // Request 1: creates bucket with count: 1
      // Request 2-5: increments count to 5
      // Request 6: count is 5, which equals maxRequests (5), so should be blocked
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(req, "test:route", { maxRequests: 5 });
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked (count is now 5, which equals maxRequests)
      const blocked = checkRateLimit(req, "test:route", { maxRequests: 5 });
      expect(blocked.allowed).toBe(false);
      expect(blocked.response?.status).toBe(429);
    });

    test("uses per-route configuration for auth:login", () => {
      const req = new NextRequest("http://localhost/api/auth/login", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // auth:login has maxRequests: 5, windowMs: 15 minutes
      // Make 5 requests - should all pass
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(req, "auth:login");
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const blocked = checkRateLimit(req, "auth:login");
      expect(blocked.allowed).toBe(false);
      expect(blocked.response?.status).toBe(429);
    });

    test("uses per-route configuration for tickets:create", () => {
      const req = new NextRequest("http://localhost/api/tickets", {
        method: "POST",
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // tickets:create has maxRequests: 60, windowMs: 10 minutes
      // Make 60 requests - should all pass
      for (let i = 0; i < 60; i++) {
        const result = checkRateLimit(req, "tickets:create");
        expect(result.allowed).toBe(true);
      }

      // 61st request should be blocked
      const blocked = checkRateLimit(req, "tickets:create");
      expect(blocked.allowed).toBe(false);
      expect(blocked.response?.status).toBe(429);
    });

    test("uses per-route configuration for comments:create", () => {
      const req = new NextRequest("http://localhost/api/tickets/1/comments", {
        method: "POST",
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // comments:create has maxRequests: 60, windowMs: 10 minutes
      // Make 60 requests - should all pass
      for (let i = 0; i < 60; i++) {
        const result = checkRateLimit(req, "comments:create");
        expect(result.allowed).toBe(true);
      }

      // 61st request should be blocked
      const blocked = checkRateLimit(req, "comments:create");
      expect(blocked.allowed).toBe(false);
      expect(blocked.response?.status).toBe(429);
    });

    test("uses per-route configuration for tickets:bulk", () => {
      const req = new NextRequest("http://localhost/api/tickets/bulk", {
        method: "POST",
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // tickets:bulk has maxRequests: 20, windowMs: 10 minutes
      // Make 20 requests - should all pass
      for (let i = 0; i < 20; i++) {
        const result = checkRateLimit(req, "tickets:bulk");
        expect(result.allowed).toBe(true);
      }

      // 21st request should be blocked
      const blocked = checkRateLimit(req, "tickets:bulk");
      expect(blocked.allowed).toBe(false);
      expect(blocked.response?.status).toBe(429);
    });

    test("tracks different IPs separately", () => {
      const req1 = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });
      const req2 = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.2" },
      });

      // Exhaust limit for IP 1
      for (let i = 0; i < 5; i++) {
        checkRateLimit(req1, "test:route");
      }

      // IP 2 should still be able to make requests
      const result = checkRateLimit(req2, "test:route");
      expect(result.allowed).toBe(true);
    });

    test("tracks different routes separately", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Exhaust limit for route1
      for (let i = 0; i < 5; i++) {
        checkRateLimit(req, "route1");
      }

      // route2 should still be available
      const result = checkRateLimit(req, "route2");
      expect(result.allowed).toBe(true);
    });

    test("allows requests when rate limiting is disabled", () => {
      process.env.RATE_LIMIT_ENABLED = "false";
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Make many requests - all should pass
      for (let i = 0; i < 100; i++) {
        const result = checkRateLimit(req, "test:route");
        expect(result.allowed).toBe(true);
      }
    });

    test("allows requests for disabled routes", () => {
      process.env.RATE_LIMIT_DISABLED_ROUTES = "test:route";
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Make many requests - all should pass
      for (let i = 0; i < 100; i++) {
        const result = checkRateLimit(req, "test:route");
        expect(result.allowed).toBe(true);
      }
    });

    test("uses custom identifier when provided", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Use custom identifier (e.g., user ID)
      const result1 = checkRateLimit(req, "test:route", { identifier: "user-1" });
      expect(result1.allowed).toBe(true);

      // Different identifier should have separate limit
      const result2 = checkRateLimit(req, "test:route", { identifier: "user-2" });
      expect(result2.allowed).toBe(true);
    });
  });

  describe("Rate Limit Headers", () => {
    test("includes Retry-After header when blocked", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Exhaust limit (5 requests allowed, so make 5 requests to reach limit)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked (count is now 5, which equals maxRequests)
      const blocked = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
      expect(blocked.allowed).toBe(false);
      if (!blocked.allowed) {
        expect(blocked.response?.headers.get("Retry-After")).toBeDefined();
        expect(Number.parseInt(blocked.response?.headers.get("Retry-After") || "0", 10)).toBeGreaterThan(0);
      }
    });

    test("includes X-RateLimit-Remaining header when blocked", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Exhaust limit (5 requests allowed, so make 5 requests to reach limit)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked (count is now 5, which equals maxRequests)
      const blocked = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
      expect(blocked.allowed).toBe(false);
      if (!blocked.allowed) {
        expect(blocked.response?.headers.get("X-RateLimit-Remaining")).toBe("0");
      }
    });

    test("includes X-RateLimit-Reset header when blocked", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Exhaust limit (5 requests allowed, so make 5 requests to reach limit)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked (count is now 5, which equals maxRequests)
      const blocked = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
      expect(blocked.allowed).toBe(false);
      if (!blocked.allowed) {
        const resetHeader = blocked.response?.headers.get("X-RateLimit-Reset");
        expect(resetHeader).toBeDefined();
        const resetTime = Number.parseInt(resetHeader || "0", 10);
        expect(resetTime).toBeGreaterThan(Date.now());
      }
    });

    test("includes X-RateLimit-Limit header when blocked", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Exhaust limit (5 requests allowed, so make 5 requests to reach limit)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked (count is now 5, which equals maxRequests)
      const blocked = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
      expect(blocked.allowed).toBe(false);
      if (!blocked.allowed) {
        expect(blocked.response?.headers.get("X-RateLimit-Limit")).toBe("5");
      }
    });

    test("Retry-After is calculated correctly", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Exhaust limit (5 requests allowed, so make 5 requests to reach limit)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked (count is now 5, which equals maxRequests)
      const blocked = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 60000 });
      expect(blocked.allowed).toBe(false);
      if (!blocked.allowed) {
        const retryAfter = Number.parseInt(blocked.response?.headers.get("Retry-After") || "0", 10);
        // Should be between 1 and 60 seconds (window is 60 seconds)
        expect(retryAfter).toBeGreaterThanOrEqual(1);
        expect(retryAfter).toBeLessThanOrEqual(60);
      }
    });
  });

  describe("Rate Limit Window Management", () => {
    test("resets count after window expires", async () => {
      vi.useFakeTimers();
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Set window to 1 second for testing
      process.env.RATE_LIMIT_WINDOW_MS = "1000";
      resetRateLimitBuckets(); // Reset to apply new window

      // Exhaust limit (5 requests)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 1000 });
      }

      // 6th request should be blocked
      let blocked = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 1000 });
      expect(blocked.allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(1001);

      // Should be allowed again (new window)
      const allowed = checkRateLimit(req, "test:route", { maxRequests: 5, windowMs: 1000 });
      expect(allowed.allowed).toBe(true);

      vi.useRealTimers();
    });

    test("maintains separate windows for different routes", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // Exhaust limit for route1
      for (let i = 0; i < 5; i++) {
        checkRateLimit(req, "route1");
      }

      // route2 should still be available
      const result = checkRateLimit(req, "route2");
      expect(result.allowed).toBe(true);
    });
  });

  describe("Per-User Rate Limiting", () => {
    test("tracks rate limits per user identifier", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      // User 1 exhausts their limit (5 requests)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(req, "test:route", { identifier: "user-1", maxRequests: 5 });
      }

      // User 1's 6th request should be blocked
      const blocked = checkRateLimit(req, "test:route", { identifier: "user-1", maxRequests: 5 });
      expect(blocked.allowed).toBe(false);

      // User 2 should still be allowed (separate bucket)
      const allowed = checkRateLimit(req, "test:route", { identifier: "user-2", maxRequests: 5 });
      expect(allowed.allowed).toBe(true);
    });

    test("per-user limits are independent of IP limits", () => {
      const req1 = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });
      const req2 = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.2" },
      });

      // User 1 from IP 1 exhausts limit (5 requests)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(req1, "test:route", { identifier: "user-1", maxRequests: 5 });
      }

      // User 1's 6th request from IP 2 should still be blocked (same user identifier)
      const blocked = checkRateLimit(req2, "test:route", { identifier: "user-1", maxRequests: 5 });
      expect(blocked.allowed).toBe(false);

      // User 2 from IP 1 should be allowed (different user identifier, same IP)
      const allowed = checkRateLimit(req1, "test:route", { identifier: "user-2", maxRequests: 5 });
      expect(allowed.allowed).toBe(true);
    });
  });
});
