import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SlaPoliciesManager } from "./sla-policies-manager";

export default async function SlaPoliciesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/app");
  }

  const [policies, categories] = await Promise.all([
    prisma.slaPolicy.findMany({
      where: { organizationId: session.user.organizationId ?? "" },
      orderBy: [{ priority: "asc" }, { categoryId: "asc" }],
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.category.findMany({
      where: { organizationId: session.user.organizationId ?? "" },
      orderBy: { name: "asc" },
    }),
  ]);

  const mappedPolicies = policies.map((p) => ({
    id: p.id,
    priority: p.priority,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    firstResponseHours: p.firstResponseHours,
    resolveHours: p.resolveHours,
  }));

  const mappedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-500">Admin</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Polityki SLA
        </h1>
        <p className="text-sm text-slate-600">
          Zarządzaj czasami pierwszej reakcji i rozwiązania dla priorytetów i
          kategorii.
        </p>
      </div>
      <SlaPoliciesManager
        initialPolicies={mappedPolicies}
        categories={mappedCategories}
      />
    </div>
  );
}
