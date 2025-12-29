import { requireAuth } from "@/lib/authorization";
import { checkRateLimit } from "@/lib/rate-limit";
import { calculateKpiMetrics, DateRange } from "@/lib/kpi-metrics";
import { NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";

export async function GET(req: Request) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/reports/kpi",
    method: "GET",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok || !auth.user.organizationId) {
    logger.warn("auth.required");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin (KPIs are typically admin-only)
  if (auth.user.role !== "ADMIN") {
    logger.securityEvent("authorization_failure", { reason: "insufficient_role", requiredRole: "ADMIN" });
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  const rate = checkRateLimit(req, "reports:kpi", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;

  const organizationId = auth.user.organizationId;

  // Parse date range from query params (optional)
  const { searchParams } = new URL(req.url);
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  let dateRange: DateRange | undefined;
  if (startDateParam && endDateParam) {
    try {
      dateRange = {
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
      };

      // Validate dates
      if (isNaN(dateRange.startDate.getTime()) || isNaN(dateRange.endDate.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
      }

      if (dateRange.startDate > dateRange.endDate) {
        return NextResponse.json({ error: "startDate must be before endDate" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }
  }

  try {
    const metrics = await calculateKpiMetrics(organizationId, dateRange);

    return NextResponse.json(metrics);
  } catch (error) {
    logger.error("kpi.calculate.error", { error, organizationId });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

