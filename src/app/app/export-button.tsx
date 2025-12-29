"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ExportButtonProps = {
  label: string;
  endpoint: "tickets" | "comments";
  className?: string;
};

export function ExportButton({ label, endpoint, className }: ExportButtonProps) {
  const searchParams = useSearchParams();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Build query string from current filters
      const params = new URLSearchParams();
      
      // Copy relevant filter parameters
      const status = searchParams.get("status");
      const priority = searchParams.get("priority");
      const search = searchParams.get("q");
      const category = searchParams.get("category");
      const tags = searchParams.get("tags");

      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (tags) params.set("tags", tags);

      // Build export URL
      const exportUrl = `/api/reports/export/${endpoint}?${params.toString()}`;

      // Trigger download
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${endpoint}-export-${new Date().toISOString().split("T")[0]}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Eksport zakończony pomyślnie");
    } catch (error) {
      toast.error("Nie udało się wyeksportować danych. Spróbuj ponownie.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${className || ""}`}
      aria-label={exporting ? `Eksportowanie ${endpoint === "tickets" ? "zgłoszeń" : "komentarzy"}...` : label}
      aria-busy={exporting}
    >
      {exporting ? "Eksportowanie..." : label}
    </button>
  );
}

