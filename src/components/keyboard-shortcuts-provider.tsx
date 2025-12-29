"use client";

import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.getAttribute("role") === "textbox" ||
        target.getAttribute("role") === "combobox"
      ) {
        return;
      }

      // Alt+N - New ticket
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        router.push("/app/tickets/new");
        return;
      }

      // Alt+H - Home
      if (e.altKey && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        router.push("/app");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return <>{children}</>;
}

