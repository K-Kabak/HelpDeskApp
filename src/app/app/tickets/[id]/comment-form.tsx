"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CommentForm({
  ticketId,
  allowInternal,
}: {
  ticketId: string;
  allowInternal: boolean;
}) {
  const [bodyMd, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bodyMd, isInternal }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Nie udało się dodać komentarza");
      return;
    }
    toast.success("Komentarz dodany");
    setBody("");
    setIsInternal(false);
    router.refresh();
  };

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Treść</label>
        <textarea
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          rows={3}
          value={bodyMd}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>
      {allowInternal && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
          />
          Komentarz wewnętrzny (widoczny tylko dla agentów/admina)
        </label>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
      >
        {loading ? "Zapisywanie..." : "Dodaj komentarz"}
      </button>
    </form>
  );
}
