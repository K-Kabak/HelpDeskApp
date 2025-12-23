import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import type { SessionWithUser } from "@/lib/session-types";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notificationId = params.id;

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
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
