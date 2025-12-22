import { authOptions } from "@/lib/auth";
import { getTicketPage } from "@/lib/ticket-list";
import { getSlaStatus } from "@/lib/sla-status";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import TicketForm from "./ticket-form";

const statusLabels: Record<TicketStatus, string> = {
  NOWE: "Nowe",
  W_TOKU: "W toku",
  OCZEKUJE_NA_UZYTKOWNIKA: "Oczekuje na uzytkownika",
  WSTRZYMANE: "Wstrzymane",
  ROZWIAZANE: "Rozwiazane",
  ZAMKNIETE: "Zamkniete",
  PONOWNIE_OTWARTE: "Ponownie otwarte",
};

const priorityLabels: Record<TicketPriority, string> = {
  NISKI: "Niski",
  SREDNI: "Sredni",
  WYSOKI: "Wysoki",
  KRYTYCZNY: "Krytyczny",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    priority?: string;
    q?: string;
    cursor?: string;
    direction?: "next" | "prev";
  };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const statusFilter =
    searchParams?.status && (Object.keys(statusLabels) as string[]).includes(searchParams.status)
      ? (searchParams.status as TicketStatus)
      : undefined;
  const priorityFilter =
    searchParams?.priority && (Object.keys(priorityLabels) as string[]).includes(searchParams.priority)
      ? (searchParams.priority as TicketPriority)
      : undefined;
  const searchQuery = searchParams?.q?.trim();

  const { tickets, nextCursor, prevCursor } = await getTicketPage(session.user, {
    status: statusFilter,
    priority: priorityFilter,
    search: searchQuery,
    cursor: searchParams?.cursor,
    direction: searchParams?.direction === "prev" ? "prev" : "next",
    limit: 10,
  });

  const baseParams = new URLSearchParams();
  if (statusFilter) baseParams.set("status", statusFilter);
  if (priorityFilter) baseParams.set("priority", priorityFilter);
  if (searchQuery) baseParams.set("q", searchQuery);
  const nextParams = new URLSearchParams(baseParams.toString());
  if (nextCursor) {
    nextParams.set("cursor", nextCursor);
    nextParams.set("direction", "next");
  }
  const prevParams = new URLSearchParams(baseParams.toString());
  if (prevCursor) {
    prevParams.set("cursor", prevCursor);
    prevParams.set("direction", "prev");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Zgloszenia</h1>
          <p className="text-sm text-slate-600">
            Role: {session.user.role} - Wyswietlane {tickets.length} zgloszenia
          </p>
        </div>
        <Link
          href="/app/tickets/new"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Nowe zgloszenie
        </Link>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4" method="get">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
            <div
              className={`flex flex-1 min-w-[220px] flex-col rounded-lg border p-3 shadow-sm ${
                statusFilter ? "border-sky-500 ring-2 ring-sky-100" : "border-slate-200"
              }`}
            >
              <label htmlFor="status" className="text-xs font-semibold text-slate-600">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={statusFilter ?? ""}
                className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Wszystkie statusy</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`flex flex-1 min-w-[220px] flex-col rounded-lg border p-3 shadow-sm ${
                priorityFilter ? "border-sky-500 ring-2 ring-sky-100" : "border-slate-200"
              }`}
            >
              <label htmlFor="priority" className="text-xs font-semibold text-slate-600">
                Priorytet
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue={priorityFilter ?? ""}
                className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Wszystkie priorytety</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`flex flex-1 min-w-[240px] flex-col rounded-lg border p-3 shadow-sm ${
                searchQuery ? "border-sky-500 ring-2 ring-sky-100" : "border-slate-200"
              }`}
            >
              <label htmlFor="q" className="text-xs font-semibold text-slate-600">
                Wyszukaj
              </label>
              <input
                id="q"
                name="q"
                defaultValue={searchQuery ?? ""}
                placeholder="Tytul lub opis"
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="self-end rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Zastosuj
          </button>
        </div>
      </form>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Brak zgloszen</h2>
          <p className="mt-1 text-sm text-slate-600">Brak zgloszen - utworz pierwsze.</p>
          <Link
            href="/app/tickets/new"
            className="mt-4 inline-flex rounded-lg border border-sky-600 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
          >
            Utworz zgloszenie
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/app/tickets/${ticket.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">#{ticket.number}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    {priorityLabels[ticket.priority]}
                  </span>
                  {(() => {
                    const sla = getSlaStatus(ticket);
                    return (
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                          sla.state === "breached"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {sla.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <h3 className="line-clamp-2 font-semibold text-slate-900">{ticket.title}</h3>
              <p className="mt-1 text-xs text-slate-600">{statusLabels[ticket.status]}</p>
              <p className="mt-2 text-xs text-slate-500">Zglaszajacy: {ticket.requester.name}</p>
              {ticket.assigneeUser && (
                <p className="text-xs text-slate-500">Przypisany: {ticket.assigneeUser.name}</p>
              )}
              {ticket.assigneeTeam && (
                <p className="text-xs text-slate-500">Zespol: {ticket.assigneeTeam.name}</p>
              )}
              <p className="mt-2 text-[11px] text-slate-400">Utworzono: {ticket.createdAt.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Wyswietlane: {tickets.length} {nextCursor ? "+" : ""} zgloszenia
        </p>
        <div className="flex items-center gap-2">
          <Link
            aria-disabled={!prevCursor}
            tabIndex={!prevCursor ? -1 : undefined}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              prevCursor
                ? "border-slate-300 text-slate-700 hover:border-sky-500 hover:text-sky-700"
                : "cursor-not-allowed border-slate-200 text-slate-400"
            }`}
            href={prevCursor ? `/app?${prevParams.toString()}` : "#"}
          >
            Poprzednie
          </Link>
          <Link
            aria-disabled={!nextCursor}
            tabIndex={!nextCursor ? -1 : undefined}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              nextCursor
                ? "border-sky-600 text-sky-700 hover:bg-sky-50"
                : "cursor-not-allowed border-slate-200 text-slate-400"
            }`}
            href={nextCursor ? `/app?${nextParams.toString()}` : "#"}
          >
            Nastepne
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Szybkie zgloszenie</h2>
        <TicketForm />
      </div>
    </div>
  );
}
