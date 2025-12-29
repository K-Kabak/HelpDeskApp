import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export default withAuth(
  async function middleware(req) {
    const rate = checkRateLimit(req, "app");
    if (!rate.allowed) {
      return rate.response;
    }
    return NextResponse.next();
  },
  {
    callbacks: {},
  }
);

export const config = {
  matcher: ["/app/:path*"],
};
