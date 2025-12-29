"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface AnalyticsData {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: {
    totalCreated: number;
    totalResolved: number;
    avgCreatedPerDay: number;
    avgResolvedPerDay: number;
  };
  trends: Array<{
    date: string;
    created: number;
    resolved: number;
    byPriority: Record<string, number>;
  }>;
}

interface KpiMetrics {
  mttr?: {
    averageHours: number;
    averageMinutes: number;
    totalResolved: number;
  };
  mtta?: {
    averageHours: number;
    averageMinutes: number;
    totalWithResponse: number;
  };
  reopenRate?: {
    percentage: number;
    reopenedCount: number;
    totalClosedCount: number;
  };
  slaCompliance?: {
    percentage: number;
    compliantCount: number;
    totalResolvedCount: number;
  };
}

interface ReportsClientProps {
  initialAnalytics: AnalyticsData | null;
  initialKpi: KpiMetrics | null;
  initialDays: number;
}

export function ReportsClient({ initialAnalytics, initialKpi, initialDays }: ReportsClientProps) {
  const [days, setDays] = useState(initialDays);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(initialAnalytics);
  const [kpi, setKpi] = useState<KpiMetrics | null>(initialKpi);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, kpiRes] = await Promise.all([
        fetch(`/api/reports/analytics?days=${days}`),
        fetch(`/api/reports/kpi?days=${days}`),
      ]);

      if (!analyticsRes.ok || !kpiRes.ok) {
        throw new Error("Failed to fetch reports data");
      }

      const [analyticsData, kpiData] = await Promise.all([
        analyticsRes.json(),
        kpiRes.json(),
      ]);

      setAnalytics(analyticsData);
      setKpi(kpiData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (days !== initialDays) {
      fetchData();
    }
  }, [days, initialDays, fetchData]);

  const formatTime = (hours: number, minutes: number) => {
    if (hours > 0) {
      return `${Math.round(hours)}h ${Math.round(minutes % 60)}m`;
    }
    return `${Math.round(minutes)}m`;
  };

  const getExportUrl = (type: "tickets" | "comments") => {
    const params = new URLSearchParams();
    if (analytics) {
      params.set("startDate", analytics.period.startDate);
      params.set("endDate", analytics.period.endDate);
    }
    return `/api/reports/export/${type}?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">Error loading reports: {error}</p>
          <button
            onClick={fetchData}
            className="mt-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Raporty i analityka</h1>
          <p className="text-sm text-slate-600">Analiza wydajności i metryki zgłoszeń</p>
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm"
          >
            <option value={7}>Ostatnie 7 dni</option>
            <option value={30}>Ostatnie 30 dni</option>
            <option value={90}>Ostatnie 90 dni</option>
            <option value={365}>Ostatni rok</option>
          </select>
          <a
            href={getExportUrl("tickets")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            download
          >
            Eksportuj zgłoszenia
          </a>
          <a
            href={getExportUrl("comments")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            download
          >
            Eksportuj komentarze
          </a>
          <Link
            href="/app"
            className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Powrót do zgłoszeń
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {kpi && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Metryki wydajności</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpi.mttr && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600">Średni czas rozwiązania (MTTR)</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {formatTime(kpi.mttr.averageHours, kpi.mttr.averageMinutes)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {kpi.mttr.totalResolved} {kpi.mttr.totalResolved === 1 ? "zgłoszenie" : "zgłoszeń"}
                </p>
              </div>
            )}
            {kpi.mtta && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600">Średni czas odpowiedzi (MTTA)</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {formatTime(kpi.mtta.averageHours, kpi.mtta.averageMinutes)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {kpi.mtta.totalWithResponse} {kpi.mtta.totalWithResponse === 1 ? "odpowiedź" : "odpowiedzi"}
                </p>
              </div>
            )}
            {kpi.reopenRate && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600">Wskaźnik ponownych otwarć</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{kpi.reopenRate.percentage.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-slate-500">
                  {kpi.reopenRate.reopenedCount} z {kpi.reopenRate.totalClosedCount} zamkniętych
                </p>
              </div>
            )}
            {kpi.slaCompliance && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600">Zgodność z SLA</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{kpi.slaCompliance.percentage.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-slate-500">
                  {kpi.slaCompliance.compliantCount} z {kpi.slaCompliance.totalResolvedCount} rozwiązanych
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {analytics && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Podsumowanie</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Utworzone zgłoszenia</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.summary.totalCreated}</p>
              <p className="mt-1 text-xs text-slate-500">
                Średnio {analytics.summary.avgCreatedPerDay.toFixed(1)} dziennie
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Rozwiązane zgłoszenia</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.summary.totalResolved}</p>
              <p className="mt-1 text-xs text-slate-500">
                Średnio {analytics.summary.avgResolvedPerDay.toFixed(1)} dziennie
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Wskaźnik rozwiązania</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {analytics.summary.totalCreated > 0
                  ? ((analytics.summary.totalResolved / analytics.summary.totalCreated) * 100).toFixed(1)
                  : 0}
                %
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {analytics.summary.totalResolved} z {analytics.summary.totalCreated}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Okres analizy</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{analytics.period.days} dni</p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(analytics.period.startDate).toLocaleDateString("pl-PL")} -{" "}
                {new Date(analytics.period.endDate).toLocaleDateString("pl-PL")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trends Table */}
      {analytics && analytics.trends.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Trendy dzienne</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Data</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Utworzone</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Rozwiązane</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Niski</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Średni</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Wysoki</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Krytyczny</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {analytics.trends.map((trend) => (
                  <tr key={trend.date} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {new Date(trend.date).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{trend.created}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{trend.resolved}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {trend.byPriority.NISKI || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {trend.byPriority.SREDNI || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {trend.byPriority.WYSOKI || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {trend.byPriority.KRYTYCZNY || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {analytics && analytics.trends.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-600">Brak danych dla wybranego okresu</p>
        </div>
      )}
    </div>
  );
}

