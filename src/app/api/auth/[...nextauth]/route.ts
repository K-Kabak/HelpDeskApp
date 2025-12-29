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

/**
 * Adapts NextRequest to a format compatible with NextAuth
 * NextAuth expects a Request object with query and body properties
 * that are compatible with Pages Router format
 */
function adaptRequest(req: NextRequest): Request {
  const url = req.nextUrl;
  const query: Record<string, string | string[]> = {};
  
  // Extract query parameters from URL
  url.searchParams.forEach((value, key) => {
    if (query[key]) {
      // If key already exists, convert to array
      const existing = query[key];
      query[key] = Array.isArray(existing) 
        ? [...existing, value] 
        : [existing as string, value];
    } else {
      query[key] = value;
    }
  });
  
  // Extract nextauth route from pathname (e.g., /api/auth/signin -> ['signin'])
  // The catch-all route [...nextauth] captures everything after /api/auth/
  const pathParts = url.pathname.split('/');
  const authIndex = pathParts.indexOf('auth');
  if (authIndex >= 0 && pathParts[authIndex + 1]) {
    query.nextauth = pathParts.slice(authIndex + 1).filter(Boolean);
  }
  
  // Create a Request object compatible with NextAuth
  // NextAuth expects a Request with query and body properties
  const adaptedUrl = new URL(url.toString());
  
  // Create a Request object and extend it with query property
  // This is needed because NextAuth internally accesses req.query
  // When body exists, we need to add duplex option for fetch API compatibility
  const requestInit: RequestInit = {
    method: req.method,
    headers: req.headers,
  };
  
  if (req.body) {
    requestInit.body = req.body;
    requestInit.duplex = 'half';
  }
  
  const adaptedReq = new Request(adaptedUrl.toString(), requestInit);
  
  // Extend the Request object with query property for NextAuth compatibility
  (adaptedReq as any).query = query;
  
  return adaptedReq;
}

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
  
  // Use adapter before calling baseHandler to convert NextRequest to format expected by NextAuth
  const adaptedReq = adaptRequest(req);
  return baseHandler(adaptedReq);
}

export async function GET(req: NextRequest) {
  return rateLimitedHandler(req);
}

export async function POST(req: NextRequest) {
  return rateLimitedHandler(req);
}
