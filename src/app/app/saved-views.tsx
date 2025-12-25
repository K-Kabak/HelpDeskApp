"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { TicketStatus, TicketPriority } from "@prisma/client";

type SavedView = {
  id: string;
  name: string;
  filters: {
    status?: TicketStatus;
    priority?: TicketPriority;
    search?: string;
    category?: string;
    tagIds?: string[];
  };
  isShared: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type SavedViewsProps = {
  initialViews: SavedView[];
};

type FilterParams = {
  status?: string;
  priority?: string;
  q?: string;
  category?: string;
  tags?: string | string[];
};

export function SavedViews({ initialViews }: SavedViewsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [views, setViews] = useState<SavedView[]>(initialViews);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [viewName, setViewName] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Get current filters from URL params
  const getCurrentFilters = (): FilterParams => {
    const params: FilterParams = {};
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const tags = searchParams.getAll("tags");

    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (q) params.q = q;
    if (category) params.category = category;
    if (tags.length > 0) params.tags = tags.length === 1 ? tags[0] : tags;

    return params;
  };

  // Convert URL params to API filter format
  const paramsToFilters = (params: FilterParams) => {
    const filters: SavedView["filters"] = {};
    if (params.status) filters.status = params.status as TicketStatus;
    if (params.priority) filters.priority = params.priority as TicketPriority;
    if (params.q) filters.search = params.q;
    if (params.category) filters.category = params.category;
    if (params.tags) {
      filters.tagIds = Array.isArray(params.tags) ? params.tags : [params.tags];
    }
    return filters;
  };

  // Convert API filters to URL params
  const filtersToParams = (filters: SavedView["filters"]): FilterParams => {
    const params: FilterParams = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.q = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.tagIds && filters.tagIds.length > 0) {
      params.tags = filters.tagIds.length === 1 ? filters.tagIds[0] : filters.tagIds;
    }
    return params;
  };

  // Check if current filters match a saved view
  const getActiveViewId = (): string | null => {
    const currentFilters = paramsToFilters(getCurrentFilters());
    const activeView = views.find((view) => {
      const viewFilters = view.filters;
      return (
        viewFilters.status === currentFilters.status &&
        viewFilters.priority === currentFilters.priority &&
        viewFilters.search === currentFilters.search &&
        viewFilters.category === currentFilters.category &&
        JSON.stringify(viewFilters.tagIds?.sort() || []) ===
          JSON.stringify(currentFilters.tagIds?.sort() || [])
      );
    });
    return activeView?.id || null;
  };

  const activeViewId = getActiveViewId();

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      toast.error("Nazwa widoku jest wymagana");
      return;
    }

    const currentFilters = paramsToFilters(getCurrentFilters());

    startTransition(async () => {
      try {
        const res = await fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: viewName.trim(),
            filters: currentFilters,
            isShared,
          }),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.error ?? "Nie udało się zapisać widoku");
        }

        const { view } = await res.json();
        setViews((prev) => [...prev, view]);
        setShowSaveDialog(false);
        setViewName("");
        setIsShared(false);
        toast.success("Widok zapisany");
      } catch (error) {
        console.error("Błąd podczas zapisywania widoku:", error);
        toast.error(
          error instanceof Error ? error.message : "Nie udało się zapisać widoku"
        );
      }
    });
  };

  const handleLoadView = (view: SavedView) => {
    const params = filtersToParams(view.filters);
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => urlParams.append(key, v));
        } else {
          urlParams.set(key, value);
        }
      }
    });

    router.push(`/app?${urlParams.toString()}`);
  };

  const handleDeleteView = async (viewId: string, viewName: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć widok "${viewName}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/views/${viewId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Nie udało się usunąć widoku");
        }

        setViews((prev) => prev.filter((v) => v.id !== viewId));
        toast.success("Widok usunięty");
      } catch (error) {
        console.error("Błąd podczas usuwania widoku:", error);
        toast.error("Nie udało się usunąć widoku");
      }
    });
  };

  const handleEditView = async () => {
    if (!editingView || !viewName.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/views/${editingView.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: viewName.trim(),
            isShared,
          }),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.error ?? "Nie udało się zaktualizować widoku");
        }

        const { view } = await res.json();
        setViews((prev) => prev.map((v) => (v.id === view.id ? view : v)));
        setShowEditDialog(false);
        setEditingView(null);
        setViewName("");
        setIsShared(false);
        toast.success("Widok zaktualizowany");
      } catch (error) {
        console.error("Błąd podczas aktualizacji widoku:", error);
        toast.error(
          error instanceof Error ? error.message : "Nie udało się zaktualizować widoku"
        );
      }
    });
  };

  const openEditDialog = (view: SavedView) => {
    setEditingView(view);
    setViewName(view.name);
    setIsShared(view.isShared);
    setShowEditDialog(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setOpenMenuId(null);
              router.push("/app");
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              !activeViewId
                ? "bg-sky-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
            }`}
            disabled={isPending}
          >
            Wszystkie zgłoszenia
          </button>
          {views.map((view) => (
            <div key={view.id} className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setOpenMenuId(null);
                  handleLoadView(view);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  activeViewId === view.id
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
                }`}
                disabled={isPending}
              >
                {view.name}
                {view.isShared && (
                  <span className="ml-1.5 text-xs" title="Widok udostępniony">
                    👥
                  </span>
                )}
                {view.isDefault && (
                  <span className="ml-1.5 text-xs" title="Domyślny widok">
                    ⭐
                  </span>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === view.id ? null : view.id);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={isPending}
                  aria-label={`Zarządzaj widokiem ${view.name}`}
                  aria-haspopup="true"
                  aria-expanded={openMenuId === view.id}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
                {openMenuId === view.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        openEditDialog(view);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:bg-slate-50"
                      disabled={isPending}
                    >
                      Edytuj nazwę
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        handleDeleteView(view.id, view.name);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                      disabled={isPending}
                    >
                      Usuń
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setViewName("");
            setIsShared(false);
            setShowSaveDialog(true);
          }}
          className="rounded-lg border border-sky-600 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          disabled={isPending}
        >
          Zapisz bieżący widok
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Zapisz bieżący widok
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="view-name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Nazwa widoku
                </label>
                <input
                  id="view-name"
                  type="text"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  disabled={isPending}
                  placeholder="np. Moje zgłoszenia"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is-shared"
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-500"
                />
                <label
                  htmlFor="is-shared"
                  className="text-sm text-slate-700"
                >
                  Udostępnij widok zespołowi
                </label>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setViewName("");
                    setIsShared(false);
                  }}
                  disabled={isPending}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSaveView}
                  disabled={isPending || !viewName.trim()}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
                >
                  {isPending ? "Zapisywanie..." : "Zapisz"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && editingView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Edytuj widok
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-view-name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Nazwa widoku
                </label>
                <input
                  id="edit-view-name"
                  type="text"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit-is-shared"
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-500"
                />
                <label
                  htmlFor="edit-is-shared"
                  className="text-sm text-slate-700"
                >
                  Udostępnij widok zespołowi
                </label>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingView(null);
                    setViewName("");
                    setIsShared(false);
                  }}
                  disabled={isPending}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleEditView}
                  disabled={isPending || !viewName.trim()}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
                >
                  {isPending ? "Zapisywanie..." : "Zapisz"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
