import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import type { SessionWithUser } from "@/lib/session-types";
import { NotificationsList } from "./notifications-list";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user) {
    redirect("/login");
  }

  const notifications = await prisma.inAppNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/app" className="text-sm text-sky-700 underline">
        ← Powrót
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Powiadomienia</h1>
        <p className="text-sm text-slate-600">
          Zobacz swoje powiadomienia w aplikacji.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <NotificationsList initialNotifications={notifications} />
      </div>
    </div>
  );
}
