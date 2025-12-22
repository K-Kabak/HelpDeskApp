import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AuditViewer } from "./audit-viewer";

export default async function AuditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/app");
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-500">Admin</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Historia zmian
        </h1>
        <p className="text-sm text-slate-600">
          Przeglądaj historię zmian w systemie administracyjnym.
        </p>
      </div>
      <AuditViewer />
    </div>
  );
}

