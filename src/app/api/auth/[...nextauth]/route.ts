import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";

const authHandler = NextAuth(authOptions);

async function rateLimitedHandler(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isLoginAttempt = req.method === "POST" && (path.includes("/callback/credentials") || path.includes("/signin"));

  if (isLoginAttempt) {
    const logger = createRequestLogger({
      route: "/api/auth/signin",
      method: req.method,
    });

    const rate = checkRateLimit(req, "auth:login", { logger });
    if (!rate.allowed) {
      return rate.response;
    }
  }

  return authHandler(req);
}

export { rateLimitedHandler as GET, rateLimitedHandler as POST };
