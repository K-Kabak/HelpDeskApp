import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export default withAuth(
  async function middleware(req: NextRequest) {
    // HTTPS enforcement in production
    if (process.env.NODE_ENV === "production") {
      const proto = req.headers.get("x-forwarded-proto");
      if (proto && proto !== "https") {
        const url = req.nextUrl.clone();
        url.protocol = "https:";
        return NextResponse.redirect(url, 301);
      }
    }

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
