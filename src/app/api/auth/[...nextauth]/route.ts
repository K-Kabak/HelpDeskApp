import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { NextRequest } from "next/server";

// NextAuth is a function that returns a handler compatible with Next.js App Router
// Using type assertion through unknown for better type safety than 'as any'
// This is necessary due to NextAuth's type definitions not fully supporting App Router
const NextAuthHandler = NextAuth as unknown as (options: typeof authOptions) => {
  (req: Request): Promise<Response>;
};
const baseHandler = NextAuthHandler(authOptions);

// Wrap handler with rate limiting for login attempts
async function rateLimitedHandler(req: NextRequest) {
  const url = new URL(req.url);
  // NextAuth signin endpoint is typically /api/auth/callback/credentials or /api/auth/signin
  const isLoginAttempt = 
    (url.pathname.includes("/callback/credentials") || url.pathname.includes("/signin")) && 
    req.method === "POST";
  
  if (isLoginAttempt) {
    const logger = createRequestLogger({
      route: "/api/auth/signin",
      method: req.method,
    });
    
    // For login attempts, use IP-based rate limiting
    // Note: Per-user+email limiting would require parsing the body, which consumes it
    // IP-based limiting is still effective for preventing brute force attacks
    const rate = checkRateLimit(req, "auth:login", {
      logger,
    });
    
    if (!rate.allowed) {
      return rate.response;
    }
  }
  
  return baseHandler(req);
}

export async function GET(req: NextRequest) {
  return rateLimitedHandler(req);
}

export async function POST(req: NextRequest) {
  return rateLimitedHandler(req);
}
