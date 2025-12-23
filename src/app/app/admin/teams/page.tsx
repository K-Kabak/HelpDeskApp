import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { TeamsManager } from "./teams-manager";

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/app");
  }

  const teams = await prisma.team.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      _count: {
        select: {
          memberships: true,
          tickets: {
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

  const mappedTeams = teams.map(team => ({
    id: team.id,
    name: team.name,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    memberCount: team._count.memberships,
    activeTicketCount: team._count.tickets,
  }));

  // Get all users for team assignment
  const users = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });

  const mappedUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-500">Admin</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Zarządzanie zespołami
        </h1>
        <p className="text-sm text-slate-600">
          Twórz zespoły i zarządzaj członkostwem użytkowników.
        </p>
      </div>
      <TeamsManager initialTeams={mappedTeams} users={mappedUsers} />
    </div>
  );
}