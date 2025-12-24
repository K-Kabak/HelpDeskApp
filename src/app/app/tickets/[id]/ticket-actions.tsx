"use client";

import { Role, TicketStatus } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAllowedStatuses, canUpdateStatus } from "@/lib/ticket-policy";
import { needsReopenReason, validateReopenReason } from "@/lib/reopen-reason";

const statusLabels: Record<TicketStatus, string> = {
  NOWE: "Nowe",
  W_TOKU: "W toku",
  OCZEKUJE_NA_UZYTKOWNIKA: "Oczekuje na użytkownika",
  WSTRZYMANE: "Wstrzymane",
  ROZWIAZANE: "Rozwiązane",
  ZAMKNIETE: "Zamknięte",
  PONOWNIE_OTWARTE: "Ponownie otwarte",
};

type Option = { id: string; name: string };

type TicketActionsProps = {
  ticketId: string;
  initialStatus: TicketStatus;
  initialAssigneeUserId?: string | null;
  initialAssigneeTeamId?: string | null;
  role: Role;
  isOwner: boolean;
  agents: Option[];
  teams: Option[];
  suggestedAgentId?: string | null;
};

export default function TicketActions({
  ticketId,
  initialStatus,
  initialAssigneeTeamId,
  initialAssigneeUserId,
  role,
  isOwner,
  agents,
  teams,
  suggestedAgentId,
}: TicketActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TicketStatus>(initialStatus);
  const [assigneeUserId, setAssigneeUserId] = useState(
    initialAssigneeUserId ?? ""
  );
  const [assigneeTeamId, setAssigneeTeamId] = useState(
    initialAssigneeTeamId ?? ""
  );
  const [reopenReason, setReopenReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const canManageStatus = role === "AGENT" || role === "ADMIN";
  const requesterCanUpdate = role === "REQUESTER" && isOwner;
  const canManageAssignments = canManageStatus;

  const statusOptions = useMemo(() => {
    return getAllowedStatuses({
      role,
      isOwner,
      currentStatus: initialStatus,
    });
  }, [role, isOwner, initialStatus]);

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Nie udało się zapisać zmian");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Zmiany zapisane");
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleStatusSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canManageStatus && !requesterCanUpdate) return;
    const needReason = needsReopenReason(status);
    const validation = needReason ? validateReopenReason(reopenReason) : { valid: true, message: "" };
    if (needReason && !validation.valid) {
      setReasonError(validation.message);
      toast.error(validation.message);
      return;
    }
    if (
      !canUpdateStatus(
        { role, isOwner, currentStatus: initialStatus },
        status
      )
    ) {
      toast.error("Nie możesz ustawić tego statusu.");
      return;
    }
    const payload: Record<string, unknown> = { status };
    if (needReason) {
      payload.reopenReason = reopenReason.trim();
    }
    mutation.mutate(payload);
  };

  const handleAssignmentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canManageAssignments) return;
    mutation.mutate({
      assigneeUserId: assigneeUserId || null,
      assigneeTeamId: assigneeTeamId || null,
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Akcje</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {(canManageStatus || requesterCanUpdate) && (
        <form className="space-y-3" onSubmit={handleStatusSubmit}>
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Status zgłoszenia
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
              value={status}
              onChange={(e) => {
                const next = e.target.value as TicketStatus;
                setStatus(next);
                if (!needsReopenReason(next)) {
                  setReopenReason("");
                  setReasonError("");
                }
              }}
              disabled={mutation.isPending || statusOptions.length === 0}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {statusLabels[option]}
                </option>
              ))}
            </select>
            {needsReopenReason(status) && (
              <div className="mt-3 space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Powód ponownego otwarcia
                </label>
                <textarea
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    reasonError ? "border-red-500" : "border-slate-200"
                  }`}
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => {
                    setReopenReason(e.target.value);
                    if (reasonError) setReasonError("");
                  }}
                  placeholder="Opisz powód ponownego otwarcia zgłoszenia (min. 10 znaków)."
                  disabled={mutation.isPending}
                />
                {reasonError && (
                  <p className="text-xs text-red-600">{reasonError}</p>
                )}
                <p className="text-xs text-slate-500">
                  Historia zmian pomaga zespołowi zrozumieć kontekst ponownego
                  otwarcia.
                </p>
              </div>
            )}
            {!canManageStatus && requesterCanUpdate && (
              <p className="mt-1 text-xs text-slate-500">
                Możesz jedynie zamykać lub ponownie otwierać własne zgłoszenie.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px]"
            disabled={
              mutation.isPending ||
              status === initialStatus ||
              (needsReopenReason(status) && !validateReopenReason(reopenReason).valid)
            }
          >
            {mutation.isPending ? "Zapisywanie..." : "Zapisz status"}
          </button>
        </form>
        )}

        {canManageAssignments && (
          <form className="space-y-3" onSubmit={handleAssignmentSubmit}>
            {suggestedAgentId && suggestedAgentId !== assigneeUserId && (
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <svg className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sky-900">Sugerowane przypisanie</p>
                      <p className="text-xs text-sky-700 mt-0.5">
                        System sugeruje przypisanie do: <span className="font-medium">{agents.find((a) => a.id === suggestedAgentId)?.name}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssigneeUserId(suggestedAgentId)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-700 transition-colors whitespace-nowrap min-h-[36px]"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    Zastosuj
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Przypisany agent
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                  value={assigneeUserId}
                  onChange={(e) => setAssigneeUserId(e.target.value)}
                  disabled={mutation.isPending}
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
                <label className="text-sm font-semibold text-slate-700">
                  Przypisany zespół
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                  value={assigneeTeamId}
                  onChange={(e) => setAssigneeTeamId(e.target.value)}
                  disabled={mutation.isPending}
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
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px]"
              disabled={
                mutation.isPending ||
                (assigneeUserId === (initialAssigneeUserId ?? "") &&
                  assigneeTeamId === (initialAssigneeTeamId ?? ""))
              }
            >
              {mutation.isPending ? "Zapisywanie..." : "Zapisz przypisanie"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
