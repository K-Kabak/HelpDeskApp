"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export function Topbar({ userName, role }: { userName?: string | null; role?: string }) {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm text-slate-500 truncate">SerwisDesk</p>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">Witaj, {userName ?? "Użytkowniku"}</h1>
        <p className="text-xs text-slate-500 truncate">Rola: {role ?? "brak"}</p>
      </div>
      <nav className="flex flex-wrap items-center gap-2 sm:flex-nowrap" aria-label="Główne nawigacja">
        <Link
          href="/app"
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px] flex items-center justify-center flex-1 sm:flex-initial whitespace-nowrap"
        >
          Zgłoszenia
        </Link>
        {role === "ADMIN" && (
          <Link
            href="/app/reports"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px] flex items-center justify-center flex-1 sm:flex-initial whitespace-nowrap"
          >
            Raporty
          </Link>
        )}
        {role === "ADMIN" && (
          <Link
            href="/app/admin"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px] flex items-center justify-center flex-1 sm:flex-initial whitespace-nowrap"
          >
            Admin
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px] flex-1 sm:flex-initial whitespace-nowrap"
          aria-label="Wyloguj się z systemu"
        >
          Wyloguj
        </button>
      </nav>
    </header>
  );
}
