"use client";

import { TicketPriority } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [descriptionMd, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.SREDNI);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, descriptionMd, priority, category }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Błąd przy tworzeniu zgłoszenia");
      return;
    }
    toast.success("Zgłoszenie utworzone");
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority(TicketPriority.SREDNI);
    router.refresh();
  };

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Tytuł</label>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Opis (Markdown)</label>
        <textarea
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          rows={4}
          value={descriptionMd}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Priorytet</label>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority)}
        >
          <option value={TicketPriority.NISKI}>Niski</option>
          <option value={TicketPriority.SREDNI}>Średni</option>
          <option value={TicketPriority.WYSOKI}>Wysoki</option>
          <option value={TicketPriority.KRYTYCZNY}>Krytyczny</option>
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Kategoria</label>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="np. Sieć"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
      >
        {loading ? "Zapisywanie..." : "Utwórz zgłoszenie"}
      </button>
    </form>
  );
}
