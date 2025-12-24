"use client";

import { Role } from "@prisma/client";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  ticketCount: number;
  activeTicketCount: number;
};

type FormState = {
  email: string;
  name: string;
  role: Role;
  password: string;
};

type EditingState = {
  [id: string]: FormState & { saving: boolean; error?: string };
};

type Props = {
  initialUsers: UserRow[];
};

const defaultForm: FormState = {
  email: "",
  name: "",
  role: Role.REQUESTER,
  password: "",
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

export function UsersManager({ initialUsers }: Props) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!form.email || !form.name || !form.password) {
      const message = "Wszystkie pola są wymagane.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (form.password.length < 8) {
      const message = "Hasło musi mieć przynajmniej 8 znaków.";
      setFormError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się dodać użytkownika.";
      setFormError(message);
      toast.error(message);
      return;
    }

    const { user } = await res.json();
    setUsers((prev) => [
      {
        ...user,
        ticketCount: 0,
        activeTicketCount: 0,
      },
      ...prev,
    ]);
    setForm(defaultForm);
    setShowCreateForm(false);
    toast.success("Użytkownik dodany.");
  };

  const startEditing = (user: UserRow) => {
    setEditing((prev) => ({
      ...prev,
      [user.id]: {
        email: user.email,
        name: user.name,
        role: user.role,
        password: "", // Don't prefill password
        saving: false,
      },
    }));
  };

  const cancelEditing = (id: string) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleUpdate = async (id: string, updates: Partial<FormState>) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], saving: true, error: undefined },
    }));

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się zaktualizować użytkownika.";
      setEditing((prev) => ({
        ...prev,
        [id]: { ...prev[id], saving: false, error: message },
      }));
      toast.error(message);
      return;
    }

    const { user } = await res.json();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              email: user.email,
              name: user.name,
              role: user.role,
              updatedAt: user.updatedAt,
            }
          : u
      )
    );
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast.success("Użytkownik zaktualizowany.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego użytkownika? Tej akcji nie można cofnąć.")) {
      return;
    }

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się usunąć użytkownika.";
      toast.error(message);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("Użytkownik usunięty.");
  };

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [users]
  );

  return (
    <div className="space-y-6">
      {/* Create User Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dodaj nowego użytkownika</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 min-h-[44px]"
          >
            {showCreateForm ? "Anuluj" : "Dodaj użytkownika"}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Imię i nazwisko</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Rola</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as Role }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Hasło</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                  minLength={8}
                />
              </div>
            </div>
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 min-h-[44px]"
              >
                {loading ? "Dodawanie..." : "Dodaj użytkownika"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(defaultForm);
                  setShowCreateForm(false);
                  setFormError(null);
                }}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 min-h-[44px]"
              >
                Anuluj
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Users List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">
            Użytkownicy ({users.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-200">
          {sortedUsers.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">Brak użytkowników</h3>
              <p className="mt-1 text-sm text-slate-500">
                W organizacji nie ma jeszcze żadnych użytkowników.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Dodaj pierwszego użytkownika
              </button>
            </div>
          ) : (
            sortedUsers.map((user) => {
              const editState = editing[user.id];
              const isEditing = !!editState;

              return (
                <div key={user.id} className="p-6">
                  {isEditing ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const updates: Partial<FormState> = {};
                        if (editState.email !== user.email) updates.email = editState.email;
                        if (editState.name !== user.name) updates.name = editState.name;
                        if (editState.role !== user.role) updates.role = editState.role;
                        if (editState.password) updates.password = editState.password;
                        handleUpdate(user.id, updates);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Email</label>
                          <input
                            type="email"
                            value={editState.email}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [user.id]: { ...editState, email: e.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Imię i nazwisko</label>
                          <input
                            type="text"
                            value={editState.name}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [user.id]: { ...editState, name: e.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Rola</label>
                          <select
                            value={editState.role}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [user.id]: { ...editState, role: e.target.value as Role },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          >
                            {Object.entries(roleLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Nowe hasło (opcjonalne)</label>
                          <input
                            type="password"
                            value={editState.password}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [user.id]: { ...editState, password: e.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            placeholder="Pozostaw puste aby nie zmieniać"
                            minLength={8}
                          />
                        </div>
                      </div>
                      {editState.error && (
                        <p className="text-sm text-red-600">{editState.error}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={editState.saving}
                          className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 min-h-[44px]"
                        >
                          {editState.saving ? "Zapisywanie..." : "Zapisz"}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelEditing(user.id)}
                          className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 min-h-[44px]"
                        >
                          Anuluj
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{user.name}</h3>
                            <p className="text-sm text-slate-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className={`rounded-full px-2 py-1 font-semibold ${roleColors[user.role]}`}>
                            {roleLabels[user.role]}
                          </span>
                          <span>•</span>
                          <span>{user.ticketCount} zgłoszeń</span>
                          {user.activeTicketCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-amber-700">
                                {user.activeTicketCount} aktywnych
                              </span>
                            </>
                          )}
                          {user.emailVerified && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">✓ Zweryfikowany</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(user)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold hover:bg-slate-50"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={user.activeTicketCount > 0}
                          className="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            user.activeTicketCount > 0
                              ? "Nie można usunąć użytkownika z aktywnymi zgłoszeniami"
                              : "Usuń użytkownika"
                          }
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}