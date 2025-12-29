import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <main className="w-full max-w-md rounded-xl bg-white shadow p-8 border border-slate-200">
            <div className="h-6 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="mt-3 h-4 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="mt-6 space-y-3">
              <div className="h-10 rounded bg-slate-200 animate-pulse" />
              <div className="h-10 rounded bg-slate-200 animate-pulse" />
              <div className="h-10 rounded bg-slate-200 animate-pulse" />
            </div>
          </main>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
