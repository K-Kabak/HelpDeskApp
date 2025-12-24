import { authOptions } from "@/lib/auth";
import { getTicketPage } from "@/lib/ticket-list";
import { getSlaStatus } from "@/lib/sla-status";
import { parseMultiParam, appendMultiParam } from "@/lib/search-filters";
import { prisma } from "@/lib/prisma";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import Link from "next/link";
import TicketForm from "./ticket-form";
import { KpiCards } from "./kpi-cards";
import { calculateKpiMetrics } from "@/lib/kpi-metrics";
import { ExportButton } from "./export-button";
import { RefreshButton } from "./refresh-button";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";
import { TicketList } from "./ticket-list";
import { SavedViews } from "./saved-views";

type SessionWithUser = Session & {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    organizationId?: string;
  };
};

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

type DashboardSearchParams = {
  status?: string;
  priority?: string;
  q?: string;
  cursor?: string;
  direction?: "next" | "prev";
  category?: string;
  tags?: string | string[];
  slaStatus?: "breached" | "healthy";
  view?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: DashboardSearchParams | Promise<DashboardSearchParams>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (await getServerSession(authOptions as any)) as SessionWithUser | null;
  if (!session?.user) return null;

  const params = (await searchParams) ?? {};

  // Fetch saved views
  let savedViews: Array<{
    id: string;
    name: string;
    filters: unknown;
    isDefault: boolean;
    isShared: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  let selectedView: {
    id: string;
    name: string;
    filters: {
      status?: string;
      priority?: string;
      search?: string;
      category?: string;
      tagIds?: string[];
    };
  } | null = null;

  try {
    savedViews = await prisma.savedView.findMany({
      where: {
        userId: session.user.id,
        organizationId: session.user.organizationId ?? "",
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    // If view parameter is provided, load that view's filters
    if (params.view) {
      const view = savedViews.find((v) => v.id === params.view);
      if (view) {
        selectedView = {
          id: view.id,
          name: view.name,
          filters: view.filters as {
            status?: string;
            priority?: string;
            search?: string;
            category?: string;
            tagIds?: string[];
          },
        };
      }
    } else {
      // If no view parameter and no other params, check for default view
      const hasOtherParams = Boolean(
        params.status ||
        params.priority ||
        params.q ||
        params.category ||
        params.tags ||
        params.slaStatus ||
        params.cursor
      );
      if (!hasOtherParams) {
        const defaultView = savedViews.find((v) => v.isDefault);
        if (defaultView) {
          selectedView = {
            id: defaultView.id,
            name: defaultView.name,
            filters: defaultView.filters as {
              status?: string;
              priority?: string;
              search?: string;
              category?: string;
              tagIds?: string[];
            },
          };
        }
      }
    }
  } catch (error) {
    console.error("Failed to load saved views:", error);
  }

  // Apply view filters if a view is selected, otherwise use URL params
  const statusFilter =
    selectedView?.filters.status ||
    (params.status && (Object.keys(statusLabels) as string[]).includes(params.status)
      ? (params.status as TicketStatus)
      : undefined);
  const priorityFilter =
    selectedView?.filters.priority ||
    (params.priority && (Object.keys(priorityLabels) as string[]).includes(params.priority)
      ? (params.priority as TicketPriority)
      : undefined);
  const searchQuery = selectedView?.filters.search || params.q?.trim();
  const categoryFilter = selectedView?.filters.category || params.category?.trim();
  const tagFilters = selectedView?.filters.tagIds?.length
    ? selectedView.filters.tagIds
    : parseMultiParam(params.tags);
  const slaStatusFilter = params.slaStatus;

  let categoryOptions: { id: string; name: string }[] = [];
  let tagOptions: { id: string; name: string }[] = [];
  let categoryError: string | null = null;
  let tagsError: string | null = null;
  let categoryLoading = true;
  let tagsLoading = true;
  try {
    categoryOptions = await prisma.category.findMany({
      where: { organizationId: session.user.organizationId ?? "" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  } catch {
    categoryError = "Nie udało się pobrać kategorii.";
    categoryOptions = [];
  } finally {
    categoryLoading = false;
  }
  try {
    tagOptions = await prisma.tag.findMany({
      where: { organizationId: session.user.organizationId ?? "" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  } catch {
    tagsError = "Nie udało się pobrać tagów.";
    tagOptions = [];
  } finally {
    tagsLoading = false;
  }

  const categoriesLoaded = !categoryLoading;
  const tagsLoaded = !tagsLoading;

  // Fetch agents and teams for bulk actions (only for AGENT/ADMIN)
  let agents: Array<{ id: string; name: string }> = [];
  let teams: Array<{ id: string; name: string }> = [];
  if (session.user.role === "AGENT" || session.user.role === "ADMIN") {
    [agents, teams] = await Promise.all([
      prisma.user.findMany({
        where: {
          organizationId: session.user.organizationId,
          role: { in: ["AGENT", "ADMIN"] },
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.team.findMany({
        where: { organizationId: session.user.organizationId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
  }

  const { tickets: allTickets, nextCursor, prevCursor } = await getTicketPage(
    {
      id: session.user.id,
      role: session.user.role ?? "",
      organizationId: session.user.organizationId,
    },
    {
    status: statusFilter,
    priority: priorityFilter,
    search: searchQuery,
    cursor: params.cursor,
    direction: params.direction === "prev" ? "prev" : "next",
    limit: 10,
    category: categoryFilter,
    tagIds: tagFilters,
  });

  // Apply SLA status filter if specified
  const tickets = slaStatusFilter
    ? allTickets.filter(ticket => {
        const sla = getSlaStatus(ticket);
        if (ticket.status === "ZAMKNIETE" || ticket.status === "ROZWIAZANE") {
          return false; // Closed/resolved tickets don't have active SLA status
        }
        return sla.state === slaStatusFilter;
      })
    : allTickets;

  const slaCounts = tickets.reduce(
    (acc, ticket) => {
      const sla = getSlaStatus(ticket);
      if (ticket.status !== "ZAMKNIETE" && ticket.status !== "ROZWIAZANE") {
        if (sla.state === "breached") {
          acc.breached++;
        } else {
          acc.healthy++;
        }
      }
      return acc;
    },
    { breached: 0, healthy: 0 }
  );

  // Fetch KPI metrics for admins
  let kpiMetrics = null;
  if (session.user.role === "ADMIN" && session.user.organizationId) {
    try {
      kpiMetrics = await calculateKpiMetrics(session.user.organizationId);
    } catch (error) {
      console.error("Error fetching KPI metrics:", error);
      // Continue without KPI metrics if there's an error
    }
  }

  const baseParams = new URLSearchParams();
  if (statusFilter) baseParams.set("status", statusFilter);
  if (priorityFilter) baseParams.set("priority", priorityFilter);
  if (searchQuery) baseParams.set("q", searchQuery);
  if (categoryFilter) baseParams.set("category", categoryFilter);
  appendMultiParam(baseParams, "tags", tagFilters);
  if (slaStatusFilter) baseParams.set("slaStatus", slaStatusFilter);
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
          <h1 className="text-2xl font-semibold">Zgłoszenia</h1>
          <p className="text-sm text-slate-600" aria-live="polite" aria-atomic="true">
            Role: {session.user.role} - Wyświetlane {tickets.length} zgłoszenia
          </p>
        </div>
        <div className="flex gap-2">
          <RefreshButton />
          {session.user.role !== "REQUESTER" && (
            <Suspense fallback={<button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 opacity-50" disabled>Eksportuj zgłoszenia</button>}>
              <ExportButton label="Eksportuj zgłoszenia" endpoint="tickets" />
            </Suspense>
          )}
          {session.user.role === "ADMIN" && (
            <Suspense fallback={<button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 opacity-50" disabled>Eksportuj komentarze</button>}>
              <ExportButton label="Eksportuj komentarze" endpoint="comments" />
            </Suspense>
          )}
          <Link
            href="/app/tickets/new"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            aria-label="Utwórz nowe zgłoszenie"
          >
            Nowe zgloszenie
          </Link>
        </div>
      </div>

      {/* KPI Cards for Admins */}
      {session.user.role === "ADMIN" && kpiMetrics && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Metryki wydajności</h2>
          <KpiCards initialMetrics={kpiMetrics} />
        </div>
      )}

      <SavedViews
        initialViews={savedViews.map((v) => ({
          id: v.id,
          name: v.name,
          filters: v.filters as {
            status?: string;
            priority?: string;
            search?: string;
            category?: string;
            tagIds?: string[];
          },
          isDefault: v.isDefault,
          isShared: v.isShared,
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        }))}
        currentFilters={{
          status: statusFilter,
          priority: priorityFilter,
          q: searchQuery,
          category: categoryFilter,
          tags: tagFilters,
          slaStatus: slaStatusFilter,
        }}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/app?slaStatus=breached" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Otwarte zgloszenia z naruszonym SLA</p>
              <p className="mt-2 text-3xl font-bold text-red-700">{slaCounts.breached}</p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <svg
                className="h-6 w-6 text-red-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </Link>
        <Link href="/app?slaStatus=healthy" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Otwarte zgloszenia zgodne z SLA</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{slaCounts.healthy}</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3">
              <svg
                className="h-6 w-6 text-emerald-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4" method="get" action="/app">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
            <div
              className={`flex flex-1 min-w-0 sm:min-w-[220px] flex-col rounded-lg border p-3 shadow-sm ${
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
              className={`flex flex-1 min-w-0 sm:min-w-[220px] flex-col rounded-lg border p-3 shadow-sm ${
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
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div
            className={`flex flex-col rounded-lg border p-3 shadow-sm ${
              categoryFilter ? "border-sky-500 ring-2 ring-sky-100" : "border-slate-200"
            }`}
          >
            <label htmlFor="category" className="text-xs font-semibold text-slate-600">
              Kategoria
            </label>
            {categoryError && (
              <p className="text-xs text-red-600">{categoryError}</p>
            )}
            {!categoriesLoaded && !categoryError && (
              <p className="text-xs text-slate-500">Ładowanie kategorii...</p>
            )}
            {categoriesLoaded && (categoryOptions.length === 0 && !categoryError) && (
              <p className="text-xs text-slate-500">Brak kategorii dla organizacji.</p>
            )}
            <select
              id="category"
              name="category"
              defaultValue={categoryFilter ?? ""}
              className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Wszystkie kategorie</option>
              {(categoryOptions ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`flex flex-col rounded-lg border p-3 shadow-sm ${
              tagFilters.length > 0 ? "border-sky-500 ring-2 ring-sky-100" : "border-slate-200"
            }`}
          >
            <label htmlFor="tags" className="text-xs font-semibold text-slate-600">
              Tagi
            </label>
            {tagsError && <p className="text-xs text-red-600">{tagsError}</p>}
            {!tagsLoaded && !tagsError && (
              <p className="text-xs text-slate-500">Ładowanie tagów...</p>
            )}
            {tagsLoaded && (tagOptions.length === 0 && !tagsError) && (
              <p className="text-xs text-slate-500">Brak tagów dla organizacji.</p>
            )}
            <select
              id="tags"
              name="tags"
              defaultValue={tagFilters}
              multiple
              size={4}
              className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              {(tagOptions ?? []).map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Przytrzymaj Ctrl/Cmd, aby zaznaczyć wiele tagów.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 min-h-[44px]"
          >
            Zastosuj
          </button>
          <Link
            className="text-sm font-semibold text-slate-600 underline"
            href="/app"
          >
            Wyczyść filtry
          </Link>
          {tagFilters.length > 0 && (
            <span className="text-xs text-slate-500">
              Wybrane tagi: {tagFilters.length}
            </span>
          )}
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
              <p className="mt-2 text-xs text-slate-500">Zglaszajacy: {ticket.requester?.name ?? "N/A"}</p>
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

      <TicketList
        initialTickets={tickets}
        userRole={session.user.role ?? "REQUESTER"}
        agents={agents}
        teams={teams}
      />

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
