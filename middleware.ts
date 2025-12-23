import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export default async function middleware(req: NextRequest) {
  const rate = checkRateLimit(req, "app");
  if (!rate.allowed) {
    return rate.response;
  }

  return withAuth(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (_req) => {
      return NextResponse.next();
    },
    {
      callbacks: {},
    }
  )(req);
}

export const config = {
  matcher: ["/app/:path*"],
};
