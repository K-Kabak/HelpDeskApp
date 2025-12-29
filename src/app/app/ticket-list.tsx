"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { getSlaStatus } from "@/lib/sla-status";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";
import { SkeletonTicketCard } from "@/components/ui/skeleton";
import { EmptyTicketsList } from "@/components/ui/empty-state";
import { getPriorityColors } from "@/lib/priority-colors";

type Ticket = {
  id: string;
  number: number;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  requester?: { name: string } | null;
  assigneeUser?: { name: string } | null;
  assigneeTeam?: { name: string } | null;
  createdAt: Date;
  firstResponseAt: Date | null;
  firstResponseDue: Date | null;
  resolveDue: Date | null;
  closedAt: Date | null;
  resolvedAt: Date | null;
};

type TicketListProps = {
  initialTickets: Ticket[];
  userRole: string;
  agents: Array<{ id: string; name: string }>;
  teams: Array<{ id: string; name: string }>;
  onRefresh?: () => void;
  loading?: boolean;
  hasFilters?: boolean;
};

const statusLabels: Record<TicketStatus, string> = {
  NOWE: "Nowe",
  W_TOKU: "W toku",
  OCZEKUJE_NA_UZYTKOWNIKA: "Oczekuje na użytkownika",
  WSTRZYMANE: "Wstrzymane",
  ROZWIAZANE: "Rozwiązane",
  ZAMKNIETE: "Zamknięte",
  PONOWNIE_OTWARTE: "Ponownie otwarte",
};

const priorityLabels: Record<TicketPriority, string> = {
  NISKI: "Niski",
  SREDNI: "Średni",
  WYSOKI: "Wysoki",
  KRYTYCZNY: "Krytyczny",
};

export function TicketList({
  initialTickets,
  userRole,
  agents,
  teams,
  onRefresh,
  loading = false,
  hasFilters = false,
}: TicketListProps) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const router = useRouter();

  const isAgentOrAdmin = userRole === "AGENT" || userRole === "ADMIN";

  const handleTicketSelect = useCallback((ticketId: string, checked: boolean) => {
    setSelectedTickets(prev =>
      checked
        ? [...prev, ticketId]
        : prev.filter(id => id !== ticketId)
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedTickets(checked ? initialTickets.map(t => t.id) : []);
  }, [initialTickets]);

  const handleClearSelection = useCallback(() => {
    setSelectedTickets([]);
  }, []);

  const handleTicketsUpdated = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  }, [onRefresh, router]);

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {isAgentOrAdmin && (
        <BulkActionsToolbar
          selectedTickets={selectedTickets}
          tickets={initialTickets}
          onClearSelection={handleClearSelection}
          onTicketsUpdated={handleTicketsUpdated}
          agents={agents}
          teams={teams}
        />
      )}

      {/* Select All Checkbox */}
      {isAgentOrAdmin && initialTickets.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedTickets.length === initialTickets.length && initialTickets.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 text-sky-600 focus:ring-sky-500"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-slate-700">
            Zaznacz wszystkie ({initialTickets.length})
          </label>
          {selectedTickets.length > 0 && (
            <span className="ml-auto text-sm text-slate-600">
              Zaznaczonych: {selectedTickets.length}
            </span>
          )}
        </div>
      )}

      {/* Tickets Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonTicketCard key={i} />
          ))}
        </div>
      ) : initialTickets.length === 0 ? (
        <EmptyTicketsList hasFilters={hasFilters} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialTickets.map((ticket) => {
            const isSelected = selectedTickets.includes(ticket.id);

            const sla = getSlaStatus(ticket);
            return (
              <div
                key={ticket.id}
                className={`group relative rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 ${
                  isSelected
                    ? "border-sky-500 ring-2 ring-sky-100"
                    : "border-slate-200 hover:border-sky-300 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {/* Checkbox for selection */}
                {isAgentOrAdmin && (
                  <div className="absolute top-3 right-3 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleTicketSelect(ticket.id, e.target.checked)}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                      aria-label={`Zaznacz zgłoszenie #${ticket.number}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                <Link
                  href={`/app/tickets/${ticket.id}`}
                  className="block"
                  onClick={(e) => {
                    // Prevent navigation if checkbox was clicked
                    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="mb-3 flex items-start justify-between gap-2 pr-8">
                    <span className="text-xs font-semibold text-slate-500">
                      #{ticket.number}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getPriorityColors(ticket.priority)}`}>
                        {priorityLabels[ticket.priority]}
                      </span>
                      {ticket.status !== "ZAMKNIETE" && ticket.status !== "ROZWIAZANE" && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            sla.state === "breached"
                              ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                              : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                          }`}
                          title={sla.label}
                        >
                          {sla.state === "breached" ? "⚠️" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-sky-700 transition-colors mb-2">
                    {ticket.title}
                  </h3>
                  <div className="mb-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {statusLabels[ticket.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">Zgłaszający:</span> {ticket.requester?.name ?? "N/A"}
                    </p>
                    {ticket.assigneeUser && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Przypisany:</span> {ticket.assigneeUser.name}
                      </p>
                    )}
                    {ticket.assigneeTeam && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Zespół:</span> {ticket.assigneeTeam.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400">
                      {ticket.createdAt.toLocaleString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {sla.state === "breached" && ticket.status !== "ZAMKNIETE" && ticket.status !== "ROZWIAZANE" && (
                      <span className="text-[10px] font-medium text-red-600 animate-pulse">
                        SLA naruszone
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
