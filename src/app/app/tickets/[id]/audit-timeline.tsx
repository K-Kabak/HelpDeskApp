"use client";

import { useEffect, useState } from "react";
import { Role } from "@prisma/client";
import { SkeletonComment } from "@/components/ui/skeleton";
import { ErrorState, InlineError } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

type AuditEvent = {
  id: string;
  action: string;
  actorId: string;
  actor: {
    id: string;
    name: string | null;
    email: string;
    role: Role;
  };
  data: Record<string, unknown> | null;
  createdAt: string;
};

const roleLabels: Record<Role, string> = {
  REQUESTER: "Requester",
  AGENT: "Agent",
  ADMIN: "Admin",
};

const roleColors: Record<Role, string> = {
  REQUESTER: "bg-sky-100 text-sky-700",
  AGENT: "bg-emerald-100 text-emerald-700",
  ADMIN: "bg-indigo-100 text-indigo-700",
};

type ChangeValue = { old: unknown; new: unknown };

function formatAuditChange(action: string, data: Record<string, unknown> | null): string {
  switch (action) {
    case "TICKET_UPDATED": {
      const changes = (data?.changes as Record<string, ChangeValue | undefined>) || {};
      const parts: string[] = [];

      if (changes.status && typeof changes.status === 'object' && 'old' in changes.status && 'new' in changes.status) {
        const statusChange = `Status: ${changes.status.old} → ${changes.status.new}`;
        parts.push(statusChange);
      }
      if (changes.priority && typeof changes.priority === 'object' && 'old' in changes.priority && 'new' in changes.priority) {
        parts.push(`Priorytet: ${changes.priority.old} → ${changes.priority.new}`);
      }
      if (changes.assigneeUserId && typeof changes.assigneeUserId === 'object' && 'old' in changes.assigneeUserId && 'new' in changes.assigneeUserId) {
        const oldUser = changes.assigneeUserId.old ? "przypisany" : "nieprzypisany";
        const newUser = changes.assigneeUserId.new ? "przypisany" : "nieprzypisany";
        parts.push(`Agent: ${oldUser} → ${newUser}`);
      }
      if (changes.assigneeTeamId && typeof changes.assigneeTeamId === 'object' && 'old' in changes.assigneeTeamId && 'new' in changes.assigneeTeamId) {
        const oldTeam = changes.assigneeTeamId.old ? "przypisany" : "nieprzypisany";
        const newTeam = changes.assigneeTeamId.new ? "przypisany" : "nieprzypisany";
        parts.push(`Zespół: ${oldTeam} → ${newTeam}`);
      }

      return parts.length > 0 ? parts.join(", ") : "Zmiany w zgłoszeniu";
    }

    case "ATTACHMENT_UPLOADED": {
      const attachment = data?.attachment as { fileName?: string } | undefined;
      return `Przesłano załącznik: ${attachment?.fileName || "plik"}`;
    }

    case "ATTACHMENT_DELETED": {
      const attachment = data?.attachment as { fileName?: string } | undefined;
      return `Usunięto załącznik: ${attachment?.fileName || "plik"}`;
    }

    case "TICKET_CREATED":
      return "Utworzono zgłoszenie";

    case "COMMENT_CREATED":
      return data?.isInternal ? "Dodano wewnętrzny komentarz" : "Dodano komentarz";

    case "COMMENT_UPDATED":
      return data?.isInternal ? "Zaktualizowano wewnętrzny komentarz" : "Zaktualizowano komentarz";

    case "TICKET_REOPENED":
      return "Ponownie otwarto zgłoszenie";

    case "TICKET_CLOSED":
      return "Zamknięto zgłoszenie";

    case "TICKET_RESOLVED":
      return "Rozwiązano zgłoszenie";

    default:
      return action.replace(/_/g, " ").toLowerCase();
  }
}

export function AuditTimeline({ ticketId }: { ticketId: string }) {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuditEvents() {
      try {
        const response = await fetch(`/api/tickets/${ticketId}/audit`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit events");
        }
        const data = await response.json();
        setAuditEvents(data.auditEvents);
      } catch {
        setError("Nie udało się pobrać historii zmian");
      } finally {
        setLoading(false);
      }
    }

    fetchAuditEvents();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Historia zmian</h2>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" aria-hidden />
          <div className="space-y-6 pl-12">
            {[1, 2, 3].map((i) => (
              <SkeletonComment key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <InlineError
          message={error}
          onRetry={() => {
            setLoading(true);
            setError(null);
            fetch(`/api/tickets/${ticketId}/audit`)
              .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch audit events");
                return res.json();
              })
              .then((data) => {
                setAuditEvents(data.auditEvents);
                setLoading(false);
              })
              .catch(() => {
                setError("Nie udało się pobrać historii zmian");
                setLoading(false);
              });
          }}
        />
      </div>
    );
  }

  if (auditEvents.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Historia zmian</h2>
        </div>
        <EmptyState
          title="Brak historii zmian"
          description="Jeszcze nie ma żadnych zmian w tym zgłoszeniu."
          icon={
            <svg className="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          Historia zmian ({auditEvents.length})
        </h2>
      </div>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-300 to-indigo-200" aria-hidden />
        <div className="space-y-6">
          {auditEvents.map((event) => {
            const reopenReason =
              event.action === "TICKET_UPDATED" &&
              event.data &&
              typeof event.data === "object" &&
              "reopenReason" in event.data
                ? (event.data as { reopenReason?: unknown }).reopenReason
                : undefined;

            return (
              <div key={event.id} className="relative flex gap-4 pl-12">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-sm font-semibold text-indigo-700 shadow-md ring-2 ring-indigo-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-full rounded-lg border-2 border-indigo-200 bg-indigo-50/30 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">
                        {event.actor.name || event.actor.email}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${roleColors[event.actor.role]}`}>
                        {roleLabels[event.actor.role]}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        Audyt
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(event.createdAt).toLocaleString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {formatAuditChange(event.action, event.data)}
                    </p>
                    {Boolean(reopenReason) && (
                      <div className="mt-3 rounded-lg border-2 border-amber-300 bg-amber-50 p-3">
                        <p className="text-xs font-semibold text-amber-900 mb-1.5">Powód ponownego otwarcia:</p>
                        <p className="text-sm text-amber-900">{String(reopenReason)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
