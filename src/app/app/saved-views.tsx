"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SaveViewDialog } from "./save-view-dialog";

type SavedView = {
  id: string;
  name: string;
  filters: {
    status?: string;
    priority?: string;
    search?: string;
    category?: string;
    tagIds?: string[];
  };
  isDefault: boolean;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
};

type SavedViewsProps = {
  initialViews?: SavedView[];
  currentFilters: {
    status?: string;
    priority?: string;
    q?: string;
    category?: string;
    tags?: string[];
    slaStatus?: string;
  };
};

export function SavedViews({ initialViews = [], currentFilters }: SavedViewsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [views, setViews] = useState<SavedView[]>(initialViews);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    currentFilters.status ||
    currentFilters.priority ||
    currentFilters.q ||
    currentFilters.category ||
    (currentFilters.tags && currentFilters.tags.length > 0) ||
    currentFilters.slaStatus
  );

  // Load views on mount
  useEffect(() => {
    loadViews();
  }, []);

  // Sync active view with URL params
  useEffect(() => {
    const viewId = searchParams.get("view");
    setActiveViewId(viewId);
  }, [searchParams]);

  const loadViews = async () => {
    try {
      const response = await fetch("/api/views");
      if (response.ok) {
        const data = await response.json();
        setViews(data.views || []);
      }
    } catch {
      // Silently fail - views will use initial data
    }
  };

  const applyView = useCallback((view: SavedView) => {
    const params = new URLSearchParams();
    
    if (view.filters.status) params.set("status", view.filters.status);
    if (view.filters.priority) params.set("priority", view.filters.priority);
    if (view.filters.search) params.set("q", view.filters.search);
    if (view.filters.category) params.set("category", view.filters.category);
    if (view.filters.tagIds && view.filters.tagIds.length > 0) {
      view.filters.tagIds.forEach((tagId) => params.append("tags", tagId));
    }
    // Always include view param to preserve selection
    params.set("view", view.id);

    router.push(`/app?${params.toString()}`);
    setActiveViewId(view.id);
  }, [router]);

  const handleViewClick = (view: SavedView) => {
    applyView(view);
  };

  const handleSaveView = async (name: string, setAsDefault: boolean) => {
    setIsLoading(true);
    try {
      const filters: SavedView["filters"] = {};
      if (currentFilters.status) filters.status = currentFilters.status;
      if (currentFilters.priority) filters.priority = currentFilters.priority;
      if (currentFilters.q) filters.search = currentFilters.q;
      if (currentFilters.category) filters.category = currentFilters.category;
      if (currentFilters.tags && currentFilters.tags.length > 0) {
        filters.tagIds = currentFilters.tags;
      }

      const response = await fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          filters,
          isShared: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to save view");
      }

      const data = await response.json();
      const newView = data.view;

      // Set as default if requested
      if (setAsDefault) {
        await fetch(`/api/views/${newView.id}/set-default`, {
          method: "POST",
        });
        newView.isDefault = true;
      }

      setViews((prev) => [...prev, newView]);
      setIsSaveDialogOpen(false);
      
      // Apply the newly saved view
      applyView(newView);
      toast.success("Widok został zapisany");
    } catch {
      const message = error instanceof Error ? error.message : "Nie udało się zapisać widoku";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteView = async (viewId: string, viewName: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć widok "${viewName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/views/${viewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete view");
      }

      setViews((prev) => prev.filter((v) => v.id !== viewId));
      
      // If deleted view was active, clear filters
      if (activeViewId === viewId) {
        router.push("/app");
        setActiveViewId(null);
      }
      toast.success("Widok został usunięty");
    } catch {
      toast.error("Nie udało się usunąć widoku. Spróbuj ponownie.");
    }
  };

  const handleSetDefault = async (viewId: string) => {
    try {
      const response = await fetch(`/api/views/${viewId}/set-default`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to set default view");
      }

      // Update local state
      setViews((prev) =>
        prev.map((v) => ({
          ...v,
          isDefault: v.id === viewId,
        }))
      );
      toast.success("Domyślny widok został ustawiony");
    } catch {
      toast.error("Nie udało się ustawić domyślnego widoku. Spróbuj ponownie.");
    }
  };

  const handleEditView = async (viewId: string, newName: string) => {
    try {
      const view = views.find((v) => v.id === viewId);
      if (!view) return;

      const response = await fetch(`/api/views/${viewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update view");
      }

      setViews((prev) =>
        prev.map((v) => (v.id === viewId ? { ...v, name: newName } : v))
      );
      toast.success("Nazwa widoku została zaktualizowana");
    } catch {
      toast.error("Nie udało się zaktualizować widoku. Spróbuj ponownie.");
    }
  };

  // Don't render if no views and no active filters
  if (views.length === 0 && !hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {views.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => handleViewClick(view)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition min-h-[44px] flex items-center justify-center ${
                  activeViewId === view.id
                    ? "bg-sky-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                title={view.isDefault ? "Domyślny widok" : view.name}
                aria-label={view.isDefault ? `Domyślny widok: ${view.name}` : view.name}
              >
                {view.name}
                {view.isDefault && (
                  <span className="ml-1 text-xs">★</span>
                )}
              </button>
            ))}
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={() => setIsSaveDialogOpen(true)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            aria-label="Zapisz aktualne filtry jako widok"
          >
            Zapisz jako widok
          </button>
        )}
      </div>

      {views.length > 0 && (
        <div className="relative">
          <select
            value={activeViewId || ""}
            onChange={(e) => {
              const viewId = e.target.value;
              if (viewId) {
                const view = views.find((v) => v.id === viewId);
                if (view) handleViewClick(view);
              } else {
                router.push("/app");
                setActiveViewId(null);
              }
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Wszystkie widoki</option>
            {views.map((view) => (
              <option key={view.id} value={view.id}>
                {view.name} {view.isDefault ? "★" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeViewId && views.find((v) => v.id === activeViewId) && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const view = views.find((v) => v.id === activeViewId);
              if (view) {
                const newName = prompt("Nowa nazwa widoku:", view.name);
                if (newName && newName.trim() && newName !== view.name) {
                  handleEditView(activeViewId, newName.trim());
                }
              }
            }}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Edytuj nazwę"
            aria-label="Edytuj nazwę widoku"
          >
            ✏️
          </button>
          {!views.find((v) => v.id === activeViewId)?.isDefault && (
            <button
              onClick={() => {
                const view = views.find((v) => v.id === activeViewId);
                if (view) {
                  handleSetDefault(activeViewId);
                }
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              title="Ustaw jako domyślny"
              aria-label="Ustaw jako domyślny widok"
            >
              ⭐
            </button>
          )}
          <button
            onClick={() => {
              const view = views.find((v) => v.id === activeViewId);
              if (view) {
                handleDeleteView(activeViewId, view.name);
              }
            }}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-red-600 shadow-sm transition hover:bg-red-50"
            title="Usuń widok"
            aria-label="Usuń widok"
          >
            🗑️
          </button>
        </div>
      )}

      <SaveViewDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveView}
        isLoading={isLoading}
      />
    </div>
  );
}
