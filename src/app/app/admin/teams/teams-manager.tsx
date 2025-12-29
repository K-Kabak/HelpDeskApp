"use client";

import { Role } from "@prisma/client";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type TeamRow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  activeTicketCount: number;
};

type UserOption = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type TeamWithMembers = TeamRow & {
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: Role;
    assignedAt: string;
  }>;
};

type Props = {
  initialTeams: TeamRow[];
  users: UserOption[];
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

export function TeamsManager({ initialTeams, users }: Props) {
  const [teams, setTeams] = useState<TeamRow[]>(initialTeams);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTeamName.trim()) {
      const message = "Nazwa zespołu jest wymagana.";
      setFormError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName.trim() }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się dodać zespołu.";
      setFormError(message);
      toast.error(message);
      return;
    }

    const { team } = await res.json();
    setTeams((prev) => [team, ...prev]);
    setNewTeamName("");
    setShowCreateForm(false);
    toast.success("Zespół dodany.");
  };

  const handleUpdateTeam = async (teamId: string, name: string) => {
    const res = await fetch(`/api/admin/teams/${teamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się zaktualizować zespołu.";
      toast.error(message);
      return;
    }

    const { team } = await res.json();
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              name: team.name,
              updatedAt: team.updatedAt,
            }
          : t
      )
    );
    setEditingTeam(null);
    setEditName("");
    toast.success("Zespół zaktualizowany.");
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten zespół? Tej akcji nie można cofnąć.")) {
      return;
    }

    const res = await fetch(`/api/admin/teams/${teamId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się usunąć zespołu.";
      toast.error(message);
      return;
    }

    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (selectedTeam?.id === teamId) {
      setSelectedTeam(null);
    }
    toast.success("Zespół usunięty.");
  };

  const loadTeamDetails = async (teamId: string) => {
    const res = await fetch(`/api/admin/teams/${teamId}`);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się załadować zespołu.";
      toast.error(message);
      return;
    }

    const { team } = await res.json();
    setSelectedTeam(team);
  };

  const handleAddMember = async (teamId: string, userId: string) => {
    const res = await fetch(`/api/admin/teams/${teamId}/memberships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się dodać członka.";
      toast.error(message);
      return;
    }

    const { membership } = await res.json();

    // Update the selected team
    if (selectedTeam) {
      setSelectedTeam({
        ...selectedTeam,
        memberCount: selectedTeam.memberCount + 1,
        members: [...selectedTeam.members, membership.user],
      });
    }

    // Update the teams list
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, memberCount: t.memberCount + 1 } : t
      )
    );

    toast.success("Członek dodany do zespołu.");
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    const res = await fetch(`/api/admin/teams/${teamId}/memberships?userId=${userId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.error === "string" ? body.error : "Nie udało się usunąć członka.";
      toast.error(message);
      return;
    }

    // Update the selected team
    if (selectedTeam) {
      setSelectedTeam({
        ...selectedTeam,
        memberCount: selectedTeam.memberCount - 1,
        members: selectedTeam.members.filter((m) => m.id !== userId),
      });
    }

    // Update the teams list
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, memberCount: t.memberCount - 1 } : t
      )
    );

    toast.success("Członek usunięty z zespołu.");
  };

  const availableUsers = useMemo(() => {
    if (!selectedTeam) return users;
    const memberIds = new Set(selectedTeam.members.map((m) => m.id));
    return users.filter((u) => !memberIds.has(u.id));
  }, [users, selectedTeam]);

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => a.name.localeCompare(b.name)),
    [teams]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Teams List */}
      <div className="space-y-6">
        {/* Create Team Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dodaj nowy zespół</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              {showCreateForm ? "Anuluj" : "Dodaj zespół"}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateTeam} className="mt-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Nazwa zespołu</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="np. Zespół wsparcia technicznego"
                  required
                />
              </div>
              {formError && (
                <p className="mt-2 text-sm text-red-600">{formError}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                >
                  {loading ? "Dodawanie..." : "Dodaj zespół"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTeamName("");
                    setShowCreateForm(false);
                    setFormError(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Anuluj
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Teams List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold">
              Zespoły ({teams.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-200">
            {sortedTeams.length === 0 ? (
              <div className="p-12 text-center">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">Brak zespołów</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Utwórz pierwszy zespół, aby organizować pracę i przypisywać zgłoszenia.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px] items-center justify-center"
                  aria-label="Utwórz pierwszy zespół"
                >
                  Utwórz zespół
                </button>
              </div>
            ) : (
              sortedTeams.map((team) => (
                <div key={team.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingTeam === team.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateTeam(team.id, editName);
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            required
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                          >
                            Zapisz
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTeam(null);
                              setEditName("");
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                          >
                            Anuluj
                          </button>
                        </form>
                      ) : (
                        <>
                          <h3 className="font-semibold text-slate-900">{team.name}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{team.memberCount} członków</span>
                            {team.activeTicketCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-amber-700">
                                  {team.activeTicketCount} aktywnych zgłoszeń
                                </span>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadTeamDetails(team.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold hover:bg-slate-50"
                      >
                        Zarządzaj
                      </button>
                      <button
                        onClick={() => {
                          setEditingTeam(team.id);
                          setEditName(team.name);
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold hover:bg-slate-50"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        disabled={team.activeTicketCount > 0}
                        className="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          team.activeTicketCount > 0
                            ? "Nie można usunąć zespołu z aktywnymi zgłoszeniami"
                            : "Usuń zespół"
                        }
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Members Management */}
      <div className="space-y-6">
        {selectedTeam ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold">
                Członkowie zespołu: {selectedTeam.name}
              </h2>
            </div>
            <div className="p-6">
              {/* Add Member */}
              {availableUsers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Dodaj członka</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const userId = formData.get("userId") as string;
                      if (userId) {
                        handleAddMember(selectedTeam.id, userId);
                        (e.target as HTMLFormElement).reset();
                      }
                    }}
                    className="flex gap-2"
                  >
                    <select
                      name="userId"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Wybierz użytkownika...</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email}) - {roleLabels[user.role]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Dodaj
                    </button>
                  </form>
                </div>
              )}

              {/* Members List */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Członkowie ({selectedTeam.members.length})
                </h3>
                {selectedTeam.members.length === 0 ? (
                  <p className="text-sm text-slate-500">Brak członków w tym zespole</p>
                ) : (
                  <div className="space-y-3">
                    {selectedTeam.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                            <p className="text-xs text-slate-600">{member.email}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${roleColors[member.role]}`}>
                            {roleLabels[member.role]}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(selectedTeam.id, member.id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Usuń
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-center text-slate-500">
              <p>Wybierz zespół z listy, aby zarządzać członkami</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}