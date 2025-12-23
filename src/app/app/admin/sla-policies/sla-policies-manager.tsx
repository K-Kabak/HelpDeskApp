"use client";

import { TicketPriority } from "@prisma/client";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { validateSlaInput } from "./validation";

type SlaPolicyRow = {
  id: string;
  priority: TicketPriority;
  categoryId: string | null;
  categoryName: string | null;
  firstResponseHours: number;
  resolveHours: number;
};

type CategoryOption = { id: string; name: string };

type FormState = {
  priority: TicketPriority;
  categoryId: string;
  firstResponseHours: string;
  resolveHours: string;
};

type EditingState = {
  [id: string]: FormState & { saving: boolean; error?: string };
};

type Props = {
  initialPolicies: SlaPolicyRow[];
  categories: CategoryOption[];
};

const defaultForm = (categories: CategoryOption[]): FormState => ({
  priority: TicketPriority.NISKI,
  categoryId: categories[0]?.id ?? "",
  firstResponseHours: "24",
  resolveHours: "72",
});

export function SlaPoliciesManager({ initialPolicies, categories }: Props) {
  const [policies, setPolicies] = useState<SlaPolicyRow[]>(initialPolicies);
  const [form, setForm] = useState<FormState>(defaultForm(categories));
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>({});

  const categoriesWithNone = useMemo(
    () => [{ id: "", name: "Wszystkie kategorie" }, ...categories],
    [categories],
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = validateSlaInput({
      priority: form.priority,
      categoryId: form.categoryId || null,
      firstResponseHours: Number(form.firstResponseHours),
      resolveHours: Number(form.resolveHours),
    });
    if (!parsed.success) {
      const message =
        parsed.error.flatten().formErrors[0] ?? "Wprowadź poprawne wartości.";
      setFormError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/sla-policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się dodać polityki.";
      setFormError(message);
      toast.error(message);
      return;
    }

    const { policy } = await res.json();
    setPolicies((prev) => [
      ...prev,
      {
        id: policy.id,
        priority: policy.priority,
        categoryId: policy.categoryId,
        categoryName: policy.category?.name ?? null,
        firstResponseHours: policy.firstResponseHours,
        resolveHours: policy.resolveHours,
      },
    ]);
    setForm(defaultForm(categories));
    toast.success("Polityka dodana.");
  };

  const startEdit = (p: SlaPolicyRow) => {
    setEditing((prev) => ({
      ...prev,
      [p.id]: {
        priority: p.priority,
        categoryId: p.categoryId ?? "",
        firstResponseHours: String(p.firstResponseHours),
        resolveHours: String(p.resolveHours),
        saving: false,
      },
    }));
  };

  const cancelEdit = (id: string) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const saveEdit = async (id: string) => {
    const state = editing[id];
    if (!state) return;
    const parsed = validateSlaInput({
      priority: state.priority,
      categoryId: state.categoryId || null,
      firstResponseHours: Number(state.firstResponseHours),
      resolveHours: Number(state.resolveHours),
    });
    if (!parsed.success) {
      toast.error(parsed.error.flatten().formErrors[0] ?? "Błąd walidacji.");
      return;
    }

    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], saving: true, error: undefined },
    }));

    const res = await fetch(`/api/admin/sla-policies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body?.error ?? "Nie udało się zapisać zmian.";
      setEditing((prev) => ({
        ...prev,
        [id]: { ...prev[id], saving: false, error: message },
      }));
      toast.error(message);
      return;
    }

    const { policy } = await res.json();
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              id: policy.id,
              priority: policy.priority,
              categoryId: policy.categoryId,
              categoryName: policy.category?.name ?? null,
              firstResponseHours: policy.firstResponseHours,
              resolveHours: policy.resolveHours,
            }
          : p
      )
    );
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast.success("Zapisano zmiany.");
  };

  const deletePolicy = async (id: string) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? defaultForm(categories)), saving: true },
    }));
    const res = await fetch(`/api/admin/sla-policies/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Nie udało się usunąć polityki.");
      setEditing((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? defaultForm(categories)), saving: false },
      }));
      return;
    }
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast.success("Polityka usunięta.");
  };

  const priorities = Object.values(TicketPriority);

  return (
    <div className="space-y-6">
      <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={handleCreate}>
        <h2 className="text-lg font-semibold text-slate-900">Dodaj politykę SLA</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Priorytet</label>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as TicketPriority }))}
              disabled={loading}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Kategoria (opcjonalnie)</label>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.categoryId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  categoryId: e.target.value,
                }))
              }
              disabled={loading || categoriesWithNone.length === 0}
            >
              {categoriesWithNone.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Czas pierwszej reakcji (h)</label>
            <input
              type="number"
              min={1}
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.firstResponseHours}
              onChange={(e) => setForm((prev) => ({ ...prev, firstResponseHours: e.target.value }))}
              disabled={loading}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Czas rozwiązania (h)</label>
            <input
              type="number"
              min={1}
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.resolveHours}
              onChange={(e) => setForm((prev) => ({ ...prev, resolveHours: e.target.value }))}
              disabled={loading}
            />
          </div>
        </div>
        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Zapisywanie..." : "Dodaj politykę"}
          </button>
          <p className="text-xs text-slate-500">
            Walidacja: priorytet wymagany, czasy &gt; 0, kategoria musi należeć do organizacji.
          </p>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Istniejące polityki</h2>
          <span className="text-xs text-slate-500">{policies.length} pozycji</span>
        </div>
        {policies.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Brak polityk SLA.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {policies.map((p) => {
              const edit = editing[p.id];
              return (
                <div
                  key={p.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm"
                >
                  {!edit && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {p.priority} • {p.categoryName ?? "Wszystkie kategorie"}
                        </p>
                        <p className="text-xs text-slate-600">
                          Pierwsza reakcja: {p.firstResponseHours}h • Rozwiązanie: {p.resolveHours}h
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-xs font-semibold text-sky-700 underline"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => deletePolicy(p.id)}
                          className="text-xs font-semibold text-red-700 underline"
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  )}
                  {edit && (
                    <div className="space-y-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-1">
                          <label className="text-xs text-slate-700">Priorytet</label>
                          <select
                            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                            value={edit.priority}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [p.id]: { ...prev[p.id], priority: e.target.value as TicketPriority },
                              }))
                            }
                            disabled={edit.saving}
                          >
                            {priorities.map((prio) => (
                              <option key={prio} value={prio}>
                                {prio}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-1">
                          <label className="text-xs text-slate-700">Kategoria</label>
                          <select
                            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                            value={edit.categoryId}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [p.id]: { ...prev[p.id], categoryId: e.target.value },
                              }))
                            }
                            disabled={edit.saving}
                          >
                            {categoriesWithNone.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-1">
                          <label className="text-xs text-slate-700">Pierwsza reakcja (h)</label>
                          <input
                            type="number"
                            min={1}
                            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                            value={edit.firstResponseHours}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [p.id]: { ...prev[p.id], firstResponseHours: e.target.value },
                              }))
                            }
                            disabled={edit.saving}
                          />
                        </div>
                        <div className="grid gap-1">
                          <label className="text-xs text-slate-700">Rozwiązanie (h)</label>
                          <input
                            type="number"
                            min={1}
                            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                            value={edit.resolveHours}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [p.id]: { ...prev[p.id], resolveHours: e.target.value },
                              }))
                            }
                            disabled={edit.saving}
                          />
                        </div>
                      </div>
                      {edit.error && <p className="text-xs text-red-600">{edit.error}</p>}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => saveEdit(p.id)}
                          className="rounded-lg bg-sky-600 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
                          disabled={edit.saving}
                        >
                          {edit.saving ? "Zapisywanie..." : "Zapisz"}
                        </button>
                        <button
                          onClick={() => cancelEdit(p.id)}
                          className="text-xs font-semibold text-slate-600 underline"
                          disabled={edit.saving}
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
