"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CsatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const ticketId = params.id as string;
  const token = searchParams.get("token");
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Validate token on mount if present
  useEffect(() => {
    if (token) {
      // Token validation happens server-side, but we can show a loading state
      // setTokenValid(true);
    } else {
      // No token - session-based auth will be used
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score) {
      setError("Proszę wybrać ocenę");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // Include token in request if present
      const body: { score: number; comment?: string; token?: string } = {
        score,
        comment: comment || undefined,
      };
      if (token) {
        body.token = token;
      }

      // If token is in URL, also pass it as query param for flexibility
      const url = token 
        ? `/api/tickets/${ticketId}/csat?token=${encodeURIComponent(token)}`
        : `/api/tickets/${ticketId}/csat`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd podczas wysyłania odpowiedzi");
      }

      router.push(`/app/tickets/${ticketId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="mb-6">
        <Link
          href={`/app/tickets/${ticketId}`}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Powrót do zgłoszenia
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Ankieta satysfakcji</h1>
        <p className="text-gray-600 mb-6">
          Prosimy o ocenę obsługi zgłoszenia. Twoja opinia pomoże nam poprawić jakość usług.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Jak oceniasz obsługę? *
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  className={`w-12 h-12 rounded-lg font-semibold transition-colors ${
                    score === value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Komentarz (opcjonalnie)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Podziel się swoją opinią..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !score}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? "Wysyłanie..." : "Wyślij odpowiedź"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/app/tickets/${ticketId}`)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
