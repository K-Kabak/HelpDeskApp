"use client";

import { TicketPriority, TicketStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { TriggerConfig, ActionConfig } from "@/lib/automation-rules";

type AutomationRule = {
  id: string;
  name: string;
  enabled: boolean;
  triggerConfig: TriggerConfig;
  actionConfig: ActionConfig;
  createdAt: Date;
  updatedAt: Date;
};

type UserOption = { id: string; name: string };
type TeamOption = { id: string; name: string };

type TriggerFormData = {
  type: "ticketCreated" | "ticketUpdated" | "statusChanged" | "priorityChanged";
  status?: TicketStatus;
  priority?: TicketPriority;
};

type ActionFormData = {
  type: "assignUser" | "assignTeam" | "setPriority" | "setStatus" | "addTag";
  userId?: string;
  teamId?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  tagId?: string;
};

type RuleFormData = {
  name: string;
  trigger: TriggerFormData;
  action: ActionFormData;
};

type Props = {
  initialRules: AutomationRule[];
  users: UserOption[];
  teams: TeamOption[];
};

export function AutomationRulesManager({ initialRules, users, teams }: Props) {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultForm: RuleFormData = {
    name: "",
    trigger: { type: "ticketCreated" },
    action: { type: "setPriority", priority: TicketPriority.SREDNI },
  };

  const [form, setForm] = useState<RuleFormData>(defaultForm);

  const triggerOptions = [
    { value: "ticketCreated", label: "Zgłoszenie utworzone" },
    { value: "ticketUpdated", label: "Zgłoszenie zaktualizowane" },
    { value: "statusChanged", label: "Status zmieniony na" },
    { value: "priorityChanged", label: "Priorytet zmieniony na" },
  ];

  const actionOptions = [
    { value: "assignUser", label: "Przypisz do użytkownika" },
    { value: "assignTeam", label: "Przypisz do zespołu" },
    { value: "setPriority", label: "Ustaw priorytet" },
    { value: "setStatus", label: "Ustaw status" },
    { value: "addTag", label: "Dodaj tag" },
  ];

  const priorityOptions = [
    { value: TicketPriority.NISKI, label: "Niski" },
    { value: TicketPriority.SREDNI, label: "Średni" },
    { value: TicketPriority.WYSOKI, label: "Wysoki" },
    { value: TicketPriority.KRYTYCZNY, label: "Krytyczny" },
  ];

  const statusOptions = [
    { value: TicketStatus.NOWE, label: "Nowe" },
    { value: TicketStatus.W_TOKU, label: "W toku" },
    { value: TicketStatus.OCZEKUJE_NA_UZYTKOWNIKA, label: "Oczekuje na użytkownika" },
    { value: TicketStatus.WSTRZYMANE, label: "Wstrzymane" },
    { value: TicketStatus.ROZWIAZANE, label: "Rozwiązane" },
    { value: TicketStatus.ZAMKNIETE, label: "Zamknięte" },
    { value: TicketStatus.PONOWNIE_OTWARTE, label: "Ponownie otwarte" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build trigger config
      let triggerConfig: TriggerConfig;
      switch (form.trigger.type) {
        case "ticketCreated":
          triggerConfig = { type: "ticketCreated" };
          break;
        case "ticketUpdated":
          triggerConfig = { type: "ticketUpdated" };
          break;
        case "statusChanged":
          triggerConfig = { type: "statusChanged", status: form.trigger.status! };
          break;
        case "priorityChanged":
          triggerConfig = { type: "priorityChanged", priority: form.trigger.priority! };
          break;
        default:
          throw new Error("Invalid trigger type");
      }

      // Build action config
      let actionConfig: ActionConfig;
      switch (form.action.type) {
        case "assignUser":
          actionConfig = { type: "assignUser", userId: form.action.userId! };
          break;
        case "assignTeam":
          actionConfig = { type: "assignTeam", teamId: form.action.teamId! };
          break;
        case "setPriority":
          actionConfig = { type: "setPriority", priority: form.action.priority! };
          break;
        case "setStatus":
          actionConfig = { type: "setStatus", status: form.action.status! };
          break;
        case "addTag":
          actionConfig = { type: "addTag", tagId: form.action.tagId! };
          break;
        default:
          throw new Error("Invalid action type");
      }

      const payload = {
        name: form.name,
        triggerConfig,
        actionConfig,
      };

      if (editingId) {
        // Update existing rule
        const res = await fetch(`/api/admin/automation-rules/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update rule");

        const { rule } = await res.json();
        setRules(rules.map((r) => (r.id === editingId ? rule : r)));
        toast.success("Reguła została zaktualizowana");
      } else {
        // Create new rule
        const res = await fetch("/api/admin/automation-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create rule");

        const { rule } = await res.json();
        setRules([rule, ...rules]);
        toast.success("Reguła została utworzona");
      }

      setForm(defaultForm);
      setIsCreating(false);
      setEditingId(null);
    } catch (error) {
      toast.error("Nie udało się wykonać operacji. Sprawdź połączenie i spróbuj ponownie.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule: AutomationRule) => {
    setForm({
      name: rule.name,
      trigger: rule.triggerConfig,
      action: rule.actionConfig,
    });
    setEditingId(rule.id);
    setIsCreating(true);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/automation-rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) throw new Error("Failed to toggle rule");

      const { rule } = await res.json();
      setRules(rules.map((r) => (r.id === id ? rule : r)));
      toast.success(`Reguła została ${enabled ? "włączona" : "wyłączona"}`);
    } catch (error) {
      toast.error("Nie udało się wykonać operacji. Sprawdź połączenie i spróbuj ponownie.");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę regułę?")) return;

    try {
      const res = await fetch(`/api/admin/automation-rules/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete rule");

      setRules(rules.filter((r) => r.id !== id));
      toast.success("Reguła została usunięta");
    } catch (error) {
      toast.error("Nie udało się wykonać operacji. Sprawdź połączenie i spróbuj ponownie.");
      console.error(error);
    }
  };

  const formatTrigger = (config: TriggerConfig) => {
    switch (config.type) {
      case "ticketCreated":
        return "Zgłoszenie utworzone";
      case "ticketUpdated":
        return "Zgłoszenie zaktualizowane";
      case "statusChanged":
        return `Status zmieniony na ${statusOptions.find(s => s.value === config.status)?.label}`;
      case "priorityChanged":
        return `Priorytet zmieniony na ${priorityOptions.find(p => p.value === config.priority)?.label}`;
      default:
        return "Nieznany";
    }
  };

  const formatAction = (config: ActionConfig) => {
    switch (config.type) {
      case "assignUser":
        return `Przypisz do ${users.find(u => u.id === config.userId)?.name ?? "Nieznany użytkownik"}`;
      case "assignTeam":
        return `Przypisz do zespołu ${teams.find(t => t.id === config.teamId)?.name ?? "Nieznany zespół"}`;
      case "setPriority":
        return `Ustaw priorytet na ${priorityOptions.find(p => p.value === config.priority)?.label}`;
      case "setStatus":
        return `Ustaw status na ${statusOptions.find(s => s.value === config.status)?.label}`;
      case "addTag":
        return `Dodaj tag ${config.tagId}`;
      default:
        return "Nieznany";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Reguły Automatyzacji</h2>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            if (!isCreating) {
              setForm(defaultForm);
              setEditingId(null);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isCreating ? "Anuluj" : "Dodaj regułę"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nazwa reguły</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Wyzwalacz</label>
              <select
                value={form.trigger.type}
                onChange={(e) => {
                  const type = e.target.value as TriggerFormData["type"];
                  setForm({
                    ...form,
                    trigger: { type },
                  });
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                {triggerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {form.trigger.type === "statusChanged" && (
                <select
                  value={form.trigger.status || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      trigger: { ...form.trigger, status: e.target.value as TicketStatus },
                    })
                  }
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Wybierz status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {form.trigger.type === "priorityChanged" && (
                <select
                  value={form.trigger.priority || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      trigger: { ...form.trigger, priority: e.target.value as TicketPriority },
                    })
                  }
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Wybierz priorytet</option>
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Akcja</label>
              <select
                value={form.action.type}
                onChange={(e) => {
                  const type = e.target.value as ActionFormData["type"];
                  setForm({
                    ...form,
                    action: { type },
                  });
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                {actionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {form.action.type === "assignUser" && (
                <select
                  value={form.action.userId || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      action: { ...form.action, userId: e.target.value },
                    })
                  }
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Wybierz użytkownika</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              )}

              {form.action.type === "assignTeam" && (
                <select
                  value={form.action.teamId || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      action: { ...form.action, teamId: e.target.value },
                    })
                  }
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Wybierz zespół</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              )}

              {form.action.type === "setPriority" && (
                <select
                  value={form.action.priority || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      action: { ...form.action, priority: e.target.value as TicketPriority },
                    })
                  }
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Wybierz priorytet</option>
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {form.action.type === "setStatus" && (
                <select
                  value={form.action.status || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      action: { ...form.action, status: e.target.value as TicketStatus },
                    })
                  }
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Wybierz status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {form.action.type === "addTag" && (
                <input
                  type="text"
                  placeholder="ID tagu"
                  value={form.action.tagId || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      action: { ...form.action, tagId: e.target.value },
                    })
                  }
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Zapisywanie..." : editingId ? "Zaktualizuj" : "Utwórz"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setForm(defaultForm);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Anuluj
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {rules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Brak reguł automatyzacji</p>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{rule.name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatTrigger(rule.triggerConfig)} → {formatAction(rule.actionConfig)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Utworzona: {rule.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(rule.id, !rule.enabled)}
                    className={`px-3 py-1 rounded text-sm ${
                      rule.enabled
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {rule.enabled ? "Włączona" : "Wyłączona"}
                  </button>
                  <button
                    onClick={() => handleEdit(rule)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
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
  );
}
