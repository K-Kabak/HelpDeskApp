import { requireAuth } from "@/lib/authorization";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";

// Helper function to determine notification type from data/subject
function getNotificationType(notification: {
  data: unknown;
  subject: string | null;
  body: string | null;
}): "ticketUpdate" | "commentUpdate" | "assignment" | "slaBreach" {
  const data = notification.data as Record<string, unknown> | null;
  
  // Check if notificationType is stored in data
  if (data?.notificationType) {
    const type = data.notificationType as string;
    if (type === "commentUpdate") return "commentUpdate";
    if (type === "assignment") return "assignment";
    if (type === "slaBreach") return "slaBreach";
    if (type === "ticketUpdate") return "ticketUpdate";
  }
  
  // Infer from subject/body for backward compatibility
  const subject = (notification.subject?.toLowerCase() || "");
  const body = (notification.body?.toLowerCase() || "");
  const combined = `${subject} ${body}`;
  
  // Check for SLA breaches/reminders
  if (combined.includes("sla") && (combined.includes("breach") || combined.includes("reminder") || data?.jobType)) {
    return "slaBreach";
  }
  
  // Check for assignments
  if (combined.includes("assigned") || combined.includes("przypisano") || combined.includes("przypisany")) {
    return "assignment";
  }
  
  // Check for comments
  if (combined.includes("comment") || combined.includes("komentarz") || combined.includes("dodał komentarz")) {
    return "commentUpdate";
  }
  
  // Default to ticketUpdate
  return "ticketUpdate";
}

export async function GET(req: Request) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/notifications",
    method: "GET",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit(req, "notifications:list", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type");

  const notifications = await prisma.inAppNotification.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Filter by type if specified
  let filteredNotifications = notifications;
  if (typeFilter && typeFilter !== "all") {
    filteredNotifications = notifications.filter((notif) => {
      const notifType = getNotificationType({
        data: notif.data,
        subject: notif.subject,
        body: notif.body,
      });
      return notifType === typeFilter;
    });
  }

  return NextResponse.json({ notifications: filteredNotifications });
}

