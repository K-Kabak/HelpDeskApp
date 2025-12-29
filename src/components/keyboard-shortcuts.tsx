"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description?: string;
};

export function KeyboardShortcuts({ shortcuts }: { shortcuts: KeyboardShortcut[] }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.getAttribute("role") === "textbox"
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key === shortcut.key || e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  return null;
}

// Hook for common shortcuts
export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "n",
        altKey: true,
        action: () => {
          router.push("/app/tickets/new");
        },
        description: "Nowe zgłoszenie",
      },
      {
        key: "h",
        altKey: true,
        action: () => {
          router.push("/app");
        },
        description: "Strona główna",
      },
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.getAttribute("role") === "textbox"
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key === shortcut.key || e.key.toLowerCase() === shortcut.key.toLowerCase();
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey;
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;

        if (keyMatch && altMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}

