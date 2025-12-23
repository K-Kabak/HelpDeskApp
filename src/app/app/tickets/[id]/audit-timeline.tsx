"use client";

import { useEffect, useState } from "react";
import { Role } from "@prisma/client";

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

function formatAuditChange(action: string, data: Record<string, unknown> | null): string {
  switch (action) {
    case "TICKET_UPDATED": {
      const changes = data?.changes || {};
      const parts: string[] = [];

      if (changes.status) {
        parts.push(`Status: ${changes.status.old} → ${changes.status.new}`);
      }
      if (changes.priority) {
        parts.push(`Priorytet: ${changes.priority.old} → ${changes.priority.new}`);
      }
      if (changes.assigneeUserId) {
        const oldUser = changes.assigneeUserId.old ? "przypisany" : "nieprzypisany";
        const newUser = changes.assigneeUserId.new ? "przypisany" : "nieprzypisany";
        parts.push(`Agent: ${oldUser} → ${newUser}`);
      }
      if (changes.assigneeTeamId) {
        const oldTeam = changes.assigneeTeamId.old ? "przypisany" : "nieprzypisany";
        const newTeam = changes.assigneeTeamId.new ? "przypisany" : "nieprzypisany";
        parts.push(`Zespół: ${oldTeam} → ${newTeam}`);
      }

      return parts.length > 0 ? parts.join(", ") : "Zmiany w zgłoszeniu";
    }

    case "ATTACHMENT_UPLOADED": {
      const attachment = data?.attachment;
      return `Przesłano załącznik: ${attachment?.fileName || "plik"}`;
    }

    case "ATTACHMENT_DELETED": {
      const attachment = data?.attachment;
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
      } catch (_err) {
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
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <p className="text-sm text-slate-600">Ładowanie historii zmian...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (auditEvents.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Brak historii zmian.</p>
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
        <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" aria-hidden />
        <div className="space-y-6">
          {auditEvents.map((event) => (
            <div key={event.id} className="relative flex gap-3 pl-12">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm">
                {event.actor.name?.slice(0, 2).toUpperCase() || "??"}
              </div>
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {event.actor.name || event.actor.email}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${roleColors[event.actor.role]}`}>
                      {roleLabels[event.actor.role]}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-slate-700">
                    {formatAuditChange(event.action, event.data)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
