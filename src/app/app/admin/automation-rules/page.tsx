import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import type { SessionWithUser } from "@/lib/session-types";
import { AutomationRulesManager } from "./automation-rules-manager";

export default async function AutomationRulesPage() {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/app");
  }

  const [rules, users, teams] = await Promise.all([
    prisma.automationRule.findMany({
      where: { organizationId: session.user.organizationId ?? "" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { organizationId: session.user.organizationId ?? "" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.team.findMany({
      where: { organizationId: session.user.organizationId ?? "" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const mappedRules = rules.map((rule) => ({
    id: rule.id,
    name: rule.name,
    enabled: rule.enabled,
    triggerConfig: rule.triggerConfig as Record<string, unknown>, // Will be validated on use
    actionConfig: rule.actionConfig as Record<string, unknown>, // Will be validated on use
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  }));

  const mappedUsers = users.map((user) => ({
    id: user.id,
    name: user.name ?? user.email,
  }));

  const mappedTeams = teams.map((team) => ({
    id: team.id,
    name: team.name,
  }));

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-500">Admin</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Reguły Automatyzacji
        </h1>
        <p className="text-sm text-slate-600">
          Zarządzaj regułami automatyzacji dla zgłoszeń.
        </p>
      </div>
      <AutomationRulesManager
        initialRules={mappedRules}
        users={mappedUsers}
        teams={mappedTeams}
      />
    </div>
  );
}
