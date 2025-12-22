import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const auth = withAuth({});

export default async function middleware(req: NextRequest) {
  const rate = checkRateLimit(req, "app");
  if (!rate.allowed) {
    return rate.response;
  }

  return auth(req);
}

export const config = {
  matcher: ["/app/:path*"],
};
