"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

type AuditEvent = {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  actorId: string;
  actor: {
    id: string;
    name: string | null;
    email: string;
  };
  data: unknown;
  createdAt: string;
};

type PageInfo = {
  limit: number;
  offset: number;
  total: number;
};

type AuditResponse = {
  events: AuditEvent[];
  page: PageInfo;
};

export function AuditViewer() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchEvents = async (currentOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString(),
      });
      const res = await fetch(`/api/admin/audit-events?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body?.error === "string" ? body.error : "Nie udało się załadować historii.");
      }
      const json: AuditResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(offset);
  }, [offset]);

  const handlePrev = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNext = () => {
    if (data && offset + limit < data.page.total) {
      setOffset(offset + limit);
    }
  };

  if (loading && !data) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Ładowanie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-800">Błąd</p>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => fetchEvents(offset)}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">Brak zdarzeń w historii</h3>
        <p className="mt-1 text-sm text-slate-500">
          Historia audytu będzie wyświetlana tutaj, gdy wystąpią zdarzenia w systemie.
        </p>
      </div>
    );
  }

  const resourceLabels: Record<string, string> = {
    USER: "Użytkownik",
    TEAM: "Zespół",
    TAG: "Tag",
    SLA: "Polityka SLA",
  };

  const actionLabels: Record<string, string> = {
    CREATE: "Utworzono",
    UPDATE: "Zaktualizowano",
    DELETE: "Usunięto",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-200">
          {data.events.map((event) => (
            <div key={event.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {resourceLabels[event.resource] ?? event.resource}
                    </span>
                    <span className="rounded bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                      {actionLabels[event.action] ?? event.action}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold">{event.actor.name ?? event.actor.email}</span>
                    {" - "}
                    {format(new Date(event.createdAt), "PPp", { locale: pl })}
                  </p>
                  {event.data != null && typeof event.data === "object" && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                        Szczegóły
                      </summary>
                      <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-xs">
                        {String(JSON.stringify(event.data, null, 2))}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button
          onClick={handlePrev}
          disabled={offset === 0 || loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Poprzednia
        </button>
        <p className="text-sm text-slate-600">
          {offset + 1}-{Math.min(offset + limit, data.page.total)} z {data.page.total}
        </p>
        <button
          onClick={handleNext}
          disabled={offset + limit >= data.page.total || loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Następna
        </button>
      </div>
    </div>
  );
}

