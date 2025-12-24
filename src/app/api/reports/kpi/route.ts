import { authOptions } from "@/lib/auth";
import { calculateKpiMetrics, DateRange } from "@/lib/kpi-metrics";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin (KPIs are typically admin-only)
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  const organizationId = session.user.organizationId;

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
    console.error("Error calculating KPI metrics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

