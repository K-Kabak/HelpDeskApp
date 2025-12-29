"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("B?'?tdny email lub has?'o");
      return;
    }
    router.push(res?.url ?? "/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <main className="w-full max-w-md rounded-xl bg-white shadow p-8 border border-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">SerwisDesk</h1>
        <p className="text-sm text-slate-600 mb-6">Zaloguj si?t</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${error ? "border-red-500" : "border-slate-300"}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              required
              autoComplete="email"
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Haslo</label>
            <input
              id="password"
              type="password"
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${error ? "border-red-500" : "border-slate-300"}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              required
              autoComplete="current-password"
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
          {error && (
            <p id="login-error" className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 text-white py-2 font-medium hover:bg-sky-700 transition disabled:opacity-50"
          >
            {loading ? "Logowanie..." : "Zaloguj"}
          </button>
        </form>
        <p className="mt-6 text-xs text-slate-500">
          Konto demo: admin@serwisdesk.local / Admin123!
        </p>
      </main>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {/* Screen reader announcements for login status */}
      </div>
    </div>
  );
}
