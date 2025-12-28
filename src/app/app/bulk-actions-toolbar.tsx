"use client";

import { TicketStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

type Ticket = {
  id: string;
  number: number;
  title: string;
  status: TicketStatus;
  priority: string;
  requester?: { name: string } | null;
  assigneeUser?: { name: string } | null;
  assigneeTeam?: { name: string } | null;
  createdAt: Date;
};

type BulkActionsToolbarProps = {
  selectedTickets: string[];
  tickets: Ticket[];
  onClearSelection: () => void;
  onTicketsUpdated: () => void;
  agents: Array<{ id: string; name: string }>;
  teams: Array<{ id: string; name: string }>;
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

export function BulkActionsToolbar({
  selectedTickets,
  tickets,
  onClearSelection,
  onTicketsUpdated,
  agents,
  teams,
}: BulkActionsToolbarProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>(TicketStatus.W_TOKU);
  const [newAssigneeUserId, setNewAssigneeUserId] = useState("");
  const [newAssigneeTeamId, setNewAssigneeTeamId] = useState("");

  const handleBulkStatusUpdate = async () => {
    if (selectedTickets.length === 0) return;

    setIsUpdating(true);
    try {
      const response = await fetch("/api/tickets/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketIds: selectedTickets,
          action: "status",
          value: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Wystąpił błąd podczas aktualizacji statusów");
        return;
      }

      // Show success message with counts
      if (result.success > 0) {
        toast.success(`Zaktualizowano status ${result.success} zgłoszeń`);
        onTicketsUpdated();
        onClearSelection();
        setShowStatusDialog(false);
      }

      // Show failure details if any tickets failed
      if (result.failed > 0) {
        const errorDetails = result.errors
          .map((err: { ticketId: string; error: string }) => {
            const ticket = tickets.find(t => t.id === err.ticketId);
            const ticketTitle = ticket ? `#${ticket.number} ${ticket.title}` : err.ticketId;
            return `${ticketTitle}: ${err.error}`;
          })
          .join("\n");

        toast.error(`Nie udało się zaktualizować ${result.failed} zgłoszeń:\n${errorDetails}`);
      }
    } catch (error) {
      console.error("Bulk status update error:", error);
      toast.error("Wystąpił błąd podczas aktualizacji statusów");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkAssignmentUpdate = async () => {
    if (selectedTickets.length === 0) return;

    setIsUpdating(true);
    try {
      // Determine the value for bulk assignment
      // For assignment, we need to decide between user and team assignment
      // Since the UI allows selecting both, we'll prioritize user assignment
      const value = newAssigneeUserId || newAssigneeTeamId || "";

      const response = await fetch("/api/tickets/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketIds: selectedTickets,
          action: "assign",
          value,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Wystąpił błąd podczas przypisywania");
        return;
      }

      // Show success message with counts
      if (result.success > 0) {
        toast.success(`Przypisano ${result.success} zgłoszeń`);
        onTicketsUpdated();
        onClearSelection();
        setShowAssignmentDialog(false);
      }

      // Show failure details if any tickets failed
      if (result.failed > 0) {
        const errorDetails = result.errors
          .map((err: { ticketId: string; error: string }) => {
            const ticket = tickets.find(t => t.id === err.ticketId);
            const ticketTitle = ticket ? `#${ticket.number} ${ticket.title}` : err.ticketId;
            return `${ticketTitle}: ${err.error}`;
          })
          .join("\n");

        toast.error(`Nie udało się przypisać ${result.failed} zgłoszeń:\n${errorDetails}`);
      }
    } catch (error) {
      console.error("Bulk assignment update error:", error);
      toast.error("Wystąpił błąd podczas przypisywania");
    } finally {
      setIsUpdating(false);
    }
  };

  if (selectedTickets.length === 0) return null;

  return (
    <>
      <div className="sticky top-0 z-10 rounded-lg border border-sky-200 bg-sky-50 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-sky-900">
              Wybrano {selectedTickets.length} zgłoszeń
            </span>
            <button
              onClick={onClearSelection}
              className="text-xs text-sky-700 underline hover:text-sky-900"
            >
              Wyczyść wybór
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowStatusDialog(true)}
              disabled={isUpdating}
              className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              Zmień status
            </button>
            <button
              onClick={() => setShowAssignmentDialog(true)}
              disabled={isUpdating}
              className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              Przypisz
            </button>
          </div>
        </div>
      </div>

      {/* Status Change Dialog */}
      {showStatusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Zmień status {selectedTickets.length} zgłoszeń
            </h3>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">
                Nowy status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowStatusDialog(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleBulkStatusUpdate}
                disabled={isUpdating}
                className="flex-1 rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {isUpdating ? "Aktualizowanie..." : "Zaktualizuj"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Dialog */}
      {showAssignmentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Przypisz {selectedTickets.length} zgłoszeń
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Agent
                </label>
                <select
                  value={newAssigneeUserId}
                  onChange={(e) => setNewAssigneeUserId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Brak</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Zespół
                </label>
                <select
                  value={newAssigneeTeamId}
                  onChange={(e) => setNewAssigneeTeamId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Brak</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAssignmentDialog(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleBulkAssignmentUpdate}
                disabled={isUpdating || (!newAssigneeUserId && !newAssigneeTeamId)}
                className="flex-1 rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {isUpdating ? "Przypisywanie..." : "Przypisz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
