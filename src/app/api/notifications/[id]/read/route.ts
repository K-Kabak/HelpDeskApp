import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import type { SessionWithUser } from "@/lib/session-types";
import { createRequestLogger } from "@/lib/logger";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notificationId = resolvedParams.id;

  try {
    // First check if the notification belongs to the user
    const notification = await prisma.inAppNotification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Mark as read
    const updatedNotification = await prisma.inAppNotification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    const logger = createRequestLogger({
      route: `/api/notifications/${resolvedParams.id}/read`,
      method: "PATCH",
      userId: session?.user?.id,
    });
    logger.error("notification.read.error", { error, notificationId: resolvedParams.id });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
