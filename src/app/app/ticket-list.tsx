"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { getSlaStatus } from "@/lib/sla-status";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";

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
      {initialTickets.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          Brak zgłoszeń spełniających kryteria
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialTickets.map((ticket) => {
            const isSelected = selectedTickets.includes(ticket.id);

            return (
              <div
                key={ticket.id}
                className={`relative rounded-xl border bg-white p-4 shadow-sm transition ${
                  isSelected
                    ? "border-sky-500 ring-2 ring-sky-100"
                    : "border-slate-200 hover:shadow-md"
                }`}
              >
                {/* Checkbox for selection */}
                {isAgentOrAdmin && (
                  <div className="absolute top-3 right-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleTicketSelect(ticket.id, e.target.checked)}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                      aria-label={`Zaznacz zgłoszenie #${ticket.number}`}
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
                  <div className="mb-2 flex items-center justify-between pr-8">
                    <span className="text-xs font-semibold text-slate-500">
                      #{ticket.number}
                    </span>
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
                  <h3 className="line-clamp-2 font-semibold text-slate-900">
                    {ticket.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    {statusLabels[ticket.status]}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Zgłaszający: {ticket.requester?.name ?? "N/A"}
                  </p>
                  {ticket.assigneeUser && (
                    <p className="text-xs text-slate-500">
                      Przypisany: {ticket.assigneeUser.name}
                    </p>
                  )}
                  {ticket.assigneeTeam && (
                    <p className="text-xs text-slate-500">
                      Zespół: {ticket.assigneeTeam.name}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-slate-400">
                    Utworzono: {ticket.createdAt.toLocaleString()}
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
