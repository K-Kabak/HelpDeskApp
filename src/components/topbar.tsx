"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export function Topbar({ userName, role }: { userName?: string | null; role?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div>
        <p className="text-sm text-slate-500">SerwisDesk</p>
        <h1 className="text-lg font-semibold text-slate-900">Witaj, {userName ?? "Użytkowniku"}</h1>
        <p className="text-xs text-slate-500">Rola: {role ?? "brak"}</p>
      </div>
      <nav className="flex items-center gap-3" aria-label="Główne nawigacja">
        <Link
          href="/app"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Zgłoszenia
        </Link>
        {role === "ADMIN" && (
          <Link
            href="/app/reports"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Raporty
          </Link>
        )}
        {role === "ADMIN" && (
          <Link
            href="/app/admin"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Admin
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          aria-label="Wyloguj się z systemu"
        >
          Wyloguj
        </button>
      </nav>
    </header>
  );
}
