import { getAppServerSession } from "@/lib/server-session";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAppServerSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <KeyboardShortcutsProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          Przejdź do głównej treści
        </a>
        <Topbar userName={session.user.name} role={session.user.role} />
        <main id="main-content" className="px-6 py-4" tabIndex={-1} role="main">
          {children}
        </main>
      </div>
    </KeyboardShortcutsProvider>
  );
}
