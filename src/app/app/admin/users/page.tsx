import { getAppServerSession } from "@/lib/server-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UsersManager } from "./users-manager";

export default async function UsersPage() {
  const session = await getAppServerSession();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/app");
  }

  const users = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId ?? undefined },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          ticketsCreated: true,
          ticketsOwned: {
            where: {
              status: {
                notIn: ["ROZWIAZANE", "ZAMKNIETE"]
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const mappedUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: !!user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    ticketCount: user._count.ticketsCreated,
    activeTicketCount: user._count.ticketsOwned,
  }));

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-500">Admin</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Zarządzanie użytkownikami
        </h1>
        <p className="text-sm text-slate-600">
          Zarządzaj użytkownikami w organizacji, przypisuj role i kontroluj dostęp.
        </p>
      </div>
      <UsersManager initialUsers={mappedUsers} />
    </div>
  );
}