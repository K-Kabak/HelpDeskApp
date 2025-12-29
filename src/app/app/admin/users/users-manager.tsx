"use client";

import { Role } from "@prisma/client";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { FormField } from "@/components/form-field";

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
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!form.email.trim()) {
      errors.email = "Email jest wymagany.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Podaj prawidłowy adres email.";
    }
    
    if (!form.name.trim()) {
      errors.name = "Imię i nazwisko jest wymagane.";
    }
    
    if (!form.password) {
      errors.password = "Hasło jest wymagane.";
    } else if (form.password.length < 8) {
      errors.password = "Hasło musi mieć przynajmniej 8 znaków.";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!validateForm()) {
      const firstError = Object.values(fieldErrors)[0];
      if (firstError) toast.error(firstError);
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
    setFieldErrors({});
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

  const handleDeleteClick = (id: string, name: string) => {
    const user = users.find((u) => u.id === id);
    if (user && (user.activeTicketCount ?? 0) > 0) {
      toast.error("Nie można usunąć użytkownika z aktywnymi zgłoszeniami.");
      return;
    }
    setDeleteConfirm({ id, name });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się usunąć użytkownika.";
      toast.error(message);
      setDeleteConfirm(null);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteConfirm(null);
    toast.success("Użytkownik usunięty.");
  };

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [users]
  );

  return (
    <div className="space-y-6">
      {/* Create User Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold">Dodaj nowego użytkownika</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-lg bg-sky-600 px-4 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-sky-700 min-h-[44px] w-full sm:w-auto"
          >
            {showCreateForm ? "Anuluj" : "Dodaj użytkownika"}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreate} className="mt-4 space-y-4" aria-label="Formularz dodawania użytkownika">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Email"
                htmlFor="user-email"
                required
                error={fieldErrors.email}
              >
                <input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, email: e.target.value }));
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-300"
                  }`}
                  required
                  aria-required="true"
                  autoComplete="email"
                />
              </FormField>
              <FormField
                label="Imię i nazwisko"
                htmlFor="user-name"
                required
                error={fieldErrors.name}
              >
                <input
                  id="user-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, name: e.target.value }));
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: "" }));
                    }
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    fieldErrors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-300"
                  }`}
                  required
                  aria-required="true"
                  autoComplete="name"
                />
              </FormField>
              <FormField
                label="Rola"
                htmlFor="user-role"
                required
              >
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as Role }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  aria-label="Rola użytkownika"
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="Hasło"
                htmlFor="user-password"
                required
                error={fieldErrors.password}
                helpText="Minimum 8 znaków"
              >
                <input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, password: e.target.value }));
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-300"
                  }`}
                  required
                  minLength={8}
                  aria-required="true"
                  autoComplete="new-password"
                />
              </FormField>
            </div>
            {formError && (
              <p className="text-sm text-red-600" role="alert" aria-live="polite">{formError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                aria-label={loading ? "Dodawanie użytkownika..." : "Dodaj użytkownika"}
                aria-busy={loading}
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
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                aria-label="Anuluj dodawanie użytkownika"
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
          <h2 className="text-lg font-semibold" id="users-heading">
            Użytkownicy ({users.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-200" role="list" aria-labelledby="users-heading">
          {sortedUsers.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="Brak użytkowników"
                description="W organizacji nie ma jeszcze żadnych użytkowników."
                icon={
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
                action={{
                  label: "Dodaj pierwszego użytkownika",
                  onClick: () => setShowCreateForm(true),
                }}
              />
            </div>
          ) : (
            sortedUsers.map((user) => {
              const editState = editing[user.id];
              const isEditing = !!editState;

              return (
                <div key={user.id} className="p-6" role="listitem">
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
                      aria-label={`Formularz edycji użytkownika ${user.name}`}
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 flex-shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-slate-900 truncate">{user.name}</h3>
                            <p className="text-xs sm:text-sm text-slate-600 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
                          <span className={`rounded-full px-2 py-1 font-semibold whitespace-nowrap ${roleColors[user.role]}`}>
                            {roleLabels[user.role]}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>{user.ticketCount} zgłoszeń</span>
                          {user.activeTicketCount > 0 && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="font-medium text-amber-700">
                                {user.activeTicketCount} aktywnych
                              </span>
                            </>
                          )}
                          {user.emailVerified && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-green-600">✓ Zweryfikowany</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <button
                          onClick={() => startEditing(user)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm font-semibold hover:bg-slate-50 min-h-[44px] flex-1 sm:flex-initial whitespace-nowrap"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user.id, user.name)}
                          disabled={user.activeTicketCount > 0}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs sm:text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px] flex-1 sm:flex-initial whitespace-nowrap"
                          aria-label={
                            user.activeTicketCount > 0
                              ? `Nie można usunąć użytkownika ${user.name} z aktywnymi zgłoszeniami`
                              : `Usuń użytkownika ${user.name}`
                          }
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

      <ConfirmationDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Usuń użytkownika"
        message={`Czy na pewno chcesz usunąć użytkownika "${deleteConfirm?.name}"? Tej akcji nie można cofnąć.`}
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        variant="danger"
      />
    </div>
  );
}