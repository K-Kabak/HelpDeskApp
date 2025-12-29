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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validate = () => {
    const trimmed = bodyMd.trim();
    if (!trimmed) {
      setError("Treść komentarza jest wymagana.");
      return false;
    }
    if (trimmed.length < 3) {
      setError("Komentarz musi mieć co najmniej 3 znaki.");
      return false;
    }
    if (trimmed.length > 5000) {
      setError("Komentarz może mieć maksymalnie 5000 znaków.");
      return false;
    }
    setError(null);
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyMd: bodyMd.trim(), isInternal }),
      });
      
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const message = errorBody?.error || errorBody?.message || "Nie udało się dodać komentarza. Spróbuj ponownie.";
        setError(message);
        toast.error(message);
        return;
      }
      
      toast.success("Komentarz dodany");
      setBody("");
      setIsInternal(false);
      setError(null);
      router.refresh();
    } catch (error) {
      const message = "Nie udało się dodać komentarza. Sprawdź połączenie i spróbuj ponownie.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={submit} aria-label="Formularz dodawania komentarza">
      <div className="grid gap-1">
        <label htmlFor="comment-body" className="text-sm text-slate-700">Treść</label>
        <textarea
          id="comment-body"
          className={`rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            error ? "border-red-500" : "border-slate-300"
          }`}
          rows={3}
          value={bodyMd}
          onChange={(e) => {
            setBody(e.target.value);
            if (error) setError(null);
          }}
          minLength={3}
          maxLength={5000}
          disabled={loading}
          aria-invalid={!!error}
          aria-describedby={error ? "comment-body-error" : "comment-body-help"}
          aria-label="Treść komentarza"
        />
        {error ? (
          <p id="comment-body-error" className="text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : (
          <p id="comment-body-help" className="text-xs text-slate-500">
            Minimum 3 znaki, maksimum 5000 znaków
          </p>
        )}
      </div>
      {allowInternal && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            aria-label="Oznacz jako komentarz wewnętrzny"
          />
          Komentarz wewnętrzny (widoczny tylko dla agentów/admina)
        </label>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-sky-600 px-4 py-3 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        aria-label={loading ? "Zapisywanie komentarza..." : "Dodaj komentarz"}
      >
        {loading ? "Zapisywanie..." : "Dodaj komentarz"}
      </button>
    </form>
  );
}
