"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { TicketStatus, TicketPriority, Role } from "@prisma/client";
import { getSlaStatus } from "@/lib/sla-status";

type Ticket = {
  id: string;
  number: number;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  firstResponseAt: string | null;
  firstResponseDue: string | null;
  resolveDue: string | null;
  closedAt: string | null;
  resolvedAt: string | null;
  requester: { name: string } | null;
  assigneeUser: { name: string } | null;
  assigneeTeam: { name: string } | null;
};

type Agent = {
  id: string;
  name: string;
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

type TicketListBulkProps = {
  tickets: Ticket[];
  role: Role;
  agents: Agent[];
  nextCursor: string | null;
  prevCursor: string | null;
  nextParams: string;
  prevParams: string;
};

export function TicketListBulk({
  tickets,
  role,
  agents,
  nextCursor,
  prevCursor,
  nextParams,
  prevParams,
}: TicketListBulkProps) {
  const router = useRouter();
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(TicketStatus.NOWE);
  const [isPending, startTransition] = useTransition();

  const canUseBulkActions = role === "AGENT" || role === "ADMIN";
  const selectedCount = selectedTicketIds.size;

  const toggleSelection = (ticketId: string) => {
    setSelectedTicketIds((prev) => {
      const next = new Set(prev);
      if (next.has(ticketId)) {
        next.delete(ticketId);
      } else {
        next.add(ticketId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTicketIds.size === tickets.length) {
      setSelectedTicketIds(new Set());
    } else {
      setSelectedTicketIds(new Set(tickets.map((t) => t.id)));
    }
  };

  const clearSelection = () => {
    setSelectedTicketIds(new Set());
  };

  const handleBulkAssign = async () => {
    if (selectedTicketIds.size === 0) return;

    const ticketIds = Array.from(selectedTicketIds);
    const agentId = selectedAgentId || null;

    if (!confirm(`Czy na pewno chcesz przypisać ${ticketIds.length} zgłoszeń do wybranego agenta?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/tickets/bulk", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketIds,
            action: "assign",
            value: agentId || "",
          }),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.error ?? "Nie udało się przypisać zgłoszeń");
        }

        const result = await res.json();
        
        if (result.failed > 0) {
          toast.warning(
            `Przypisano ${result.success} zgłoszeń. ${result.failed} nie powiodło się.`
          );
        } else {
          toast.success(`Przypisano ${result.success} zgłoszeń.`);
        }

        clearSelection();
        setShowAssignDialog(false);
        router.refresh();
      } catch (error) {
        console.error("Błąd podczas przypisywania zgłoszeń:", error);
        toast.error(
          error instanceof Error ? error.message : "Nie udało się przypisać zgłoszeń"
        );
      }
    });
  };

  const handleBulkStatusChange = async () => {
    if (selectedTicketIds.size === 0) return;

    const ticketIds = Array.from(selectedTicketIds);
    const statusLabel = statusLabels[selectedStatus];

    if (!confirm(`Czy na pewno chcesz zmienić status ${ticketIds.length} zgłoszeń na "${statusLabel}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/tickets/bulk", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketIds,
            action: "status",
            value: selectedStatus,
          }),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.error ?? "Nie udało się zmienić statusu zgłoszeń");
        }

        const result = await res.json();
        
        if (result.failed > 0) {
          toast.warning(
            `Zmieniono status ${result.success} zgłoszeń. ${result.failed} nie powiodło się.`
          );
        } else {
          toast.success(`Zmieniono status ${result.success} zgłoszeń.`);
        }

        clearSelection();
        setShowStatusDialog(false);
        router.refresh();
      } catch (error) {
        console.error("Błąd podczas zmiany statusu zgłoszeń:", error);
        toast.error(
          error instanceof Error ? error.message : "Nie udało się zmienić statusu zgłoszeń"
        );
      }
    });
  };

  if (tickets.length === 0) {
    return (
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
    );
  }

  return (
    <>
      {/* Bulk Actions Toolbar */}
      {canUseBulkActions && selectedCount > 0 && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-sky-900">
                Zaznaczono: {selectedCount} {selectedCount === 1 ? "zgłoszenie" : "zgłoszeń"}
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-sky-700 underline hover:text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded"
                disabled={isPending}
              >
                Odznacz wszystkie
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAssignDialog(true)}
                className="rounded-lg border border-sky-600 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
                disabled={isPending}
              >
                Przypisz do agenta
              </button>
              <button
                onClick={() => setShowStatusDialog(true)}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
                disabled={isPending}
              >
                Zmień status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      {canUseBulkActions && tickets.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={selectedTicketIds.size === tickets.length && tickets.length > 0}
            onChange={toggleSelectAll}
            disabled={isPending}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-500"
            aria-label="Zaznacz wszystkie zgłoszenia"
          />
          <label className="text-sm font-medium text-slate-700">
            Zaznacz wszystkie ({tickets.length})
          </label>
        </div>
      )}

      {/* Ticket Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => {
          const isSelected = selectedTicketIds.has(ticket.id);
          const sla = getSlaStatus({
            status: ticket.status,
            firstResponseAt: ticket.firstResponseAt ? new Date(ticket.firstResponseAt) : null,
            firstResponseDue: ticket.firstResponseDue ? new Date(ticket.firstResponseDue) : null,
            resolveDue: ticket.resolveDue ? new Date(ticket.resolveDue) : null,
            closedAt: ticket.closedAt ? new Date(ticket.closedAt) : null,
            resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : null,
          });

          return (
            <div
              key={ticket.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                isSelected
                  ? "border-sky-500 ring-2 ring-sky-200"
                  : "border-slate-200 hover:shadow-md"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {canUseBulkActions && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(ticket.id)}
                      disabled={isPending}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-500"
                      aria-label={`Zaznacz zgłoszenie #${ticket.number}`}
                    />
                  )}
                  <Link
                    href={`/app/tickets/${ticket.id}`}
                    className="text-xs font-semibold text-slate-500 hover:text-sky-700 flex-1 min-w-0"
                  >
                    #{ticket.number}
                  </Link>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                    {priorityLabels[ticket.priority]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${
                      sla.state === "breached"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {sla.label}
                  </span>
                </div>
              </div>
              <Link
                href={`/app/tickets/${ticket.id}`}
                className="block"
              >
                <h3 className="line-clamp-2 font-semibold text-slate-900">{ticket.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{statusLabels[ticket.status]}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Zglaszajacy: {ticket.requester?.name ?? "N/A"}
                </p>
                {ticket.assigneeUser && (
                  <p className="text-xs text-slate-500">
                    Przypisany: {ticket.assigneeUser.name}
                  </p>
                )}
                {ticket.assigneeTeam && (
                  <p className="text-xs text-slate-500">Zespol: {ticket.assigneeTeam.name}</p>
                )}
                <p className="mt-2 text-[11px] text-slate-400">
                  Utworzono: {new Date(ticket.createdAt).toLocaleString("pl-PL")}
                </p>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
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
            href={prevCursor ? `/app?${prevParams}` : "#"}
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
            href={nextCursor ? `/app?${nextParams}` : "#"}
          >
            Nastepne
          </Link>
        </div>
      </div>

      {/* Assign Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Przypisz {selectedCount} {selectedCount === 1 ? "zgłoszenie" : "zgłoszeń"} do agenta
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="assign-agent" className="block text-sm font-semibold text-slate-700 mb-2">
                  Agent
                </label>
                <select
                  id="assign-agent"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">Brak (usuń przypisanie)</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAssignDialog(false);
                    setSelectedAgentId("");
                  }}
                  disabled={isPending}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleBulkAssign}
                  disabled={isPending}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
                >
                  {isPending ? "Przypisywanie..." : "Przypisz"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Dialog */}
      {showStatusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Zmień status {selectedCount} {selectedCount === 1 ? "zgłoszenia" : "zgłoszeń"}
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="status-select" className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  id="status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
                  disabled={isPending}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowStatusDialog(false);
                    setSelectedStatus(TicketStatus.NOWE);
                  }}
                  disabled={isPending}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleBulkStatusChange}
                  disabled={isPending}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
                >
                  {isPending ? "Zmienianie..." : "Zmień status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

