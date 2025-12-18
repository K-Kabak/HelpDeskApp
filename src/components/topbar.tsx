"use client";

import { signOut } from "next-auth/react";

export function Topbar({ userName, role }: { userName?: string | null; role?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div>
        <p className="text-sm text-slate-500">SerwisDesk</p>
        <p className="text-lg font-semibold text-slate-900">Witaj, {userName ?? "Użytkowniku"}</p>
        <p className="text-xs text-slate-500">Rola: {role ?? "brak"}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Wyloguj
      </button>
    </header>
  );
}
