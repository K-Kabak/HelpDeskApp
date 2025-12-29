"use client";

import { useEffect, useState } from "react";
import type { KpiMetrics } from "@/lib/kpi-metrics";

type KpiCardsProps = {
  initialMetrics?: KpiMetrics;
};

export function KpiCards({ initialMetrics }: KpiCardsProps) {
  const [metrics, setMetrics] = useState<KpiMetrics | null>(initialMetrics || null);
  const [loading, setLoading] = useState(!initialMetrics);

  useEffect(() => {
    if (!initialMetrics) {
      // Fetch metrics on client side if not provided server-side
      fetch("/api/reports/kpi")
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Failed to fetch KPI metrics");
        })
        .then((data) => {
          setMetrics(data);
          setLoading(false);
        })
        .catch(() => {
          // Silently fail - metrics are optional
          setLoading(false);
        });
    }
  }, [initialMetrics]);

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatTime = (hours: number, minutes: number) => {
    if (hours > 0) {
      return `${Math.round(hours)}h ${Math.round(minutes % 60)}m`;
    }
    return `${Math.round(minutes)}m`;
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* MTTR Card */}
      {metrics.mttr && (
        <div 
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"
          title="Średni czas rozwiązania (MTTR) - średni czas od utworzenia zgłoszenia do jego rozwiązania. Niższa wartość oznacza szybsze rozwiązywanie problemów."
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Średni czas rozwiązania (MTTR)</p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                {formatTime(metrics.mttr.averageHours, metrics.mttr.averageMinutes)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {metrics.mttr.totalResolved} {metrics.mttr.totalResolved === 1 ? "zgłoszenie" : "zgłoszeń"}
              </p>
            </div>
          <div className="rounded-full bg-blue-100 p-2 sm:p-3 flex-shrink-0">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
      )}

      {/* MTTA Card */}
      {metrics.mtta && (
        <div 
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"
          title="Średni czas odpowiedzi (MTTA) - średni czas od utworzenia zgłoszenia do pierwszej odpowiedzi agenta. Niższa wartość oznacza szybszą reakcję na zgłoszenia."
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Średni czas odpowiedzi (MTTA)</p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                {formatTime(metrics.mtta.averageHours, metrics.mtta.averageMinutes)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {metrics.mtta.totalWithResponse} {metrics.mtta.totalWithResponse === 1 ? "odpowiedź" : "odpowiedzi"}
              </p>
            </div>
          <div className="rounded-full bg-green-100 p-2 sm:p-3 flex-shrink-0">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-green-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>
      </div>
      )}

      {/* Reopen Rate Card */}
      {metrics.reopenRate && (
        <div 
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"
          title="Wskaźnik ponownych otwarć - procent zamkniętych zgłoszeń, które zostały ponownie otwarte. Niższa wartość oznacza lepszą jakość rozwiązań."
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Wskaźnik ponownych otwarć</p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">{metrics.reopenRate.percentage.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-slate-500">
                {metrics.reopenRate.reopenedCount} z {metrics.reopenRate.totalClosedCount} zamkniętych
              </p>
            </div>
          <div className="rounded-full bg-amber-100 p-2 sm:p-3 flex-shrink-0">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-amber-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>
      </div>
      )}

      {/* SLA Compliance Card */}
      {metrics.slaCompliance && (
        <div 
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"
          title="Zgodność z SLA - procent rozwiązanych zgłoszeń, które zostały rozwiązane zgodnie z ustalonymi terminami SLA. Wyższa wartość oznacza lepszą zgodność z umowami."
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Zgodność z SLA</p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">{metrics.slaCompliance.percentage.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-slate-500">
                {metrics.slaCompliance.compliantCount} z {metrics.slaCompliance.totalResolvedCount} rozwiązanych
              </p>
            </div>
          <div className="rounded-full bg-emerald-100 p-2 sm:p-3 flex-shrink-0">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-700"
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
      </div>
      )}
    </div>
  );
}

