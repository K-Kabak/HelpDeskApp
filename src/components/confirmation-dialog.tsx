"use client";

import { useEffect, useRef } from "react";

type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Potwierdź",
  cancelLabel = "Anuluj",
  variant = "default",
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      // Focus the confirm button after a short delay to ensure dialog is rendered
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    // Trap focus within dialog
    if (e.key === "Tab") {
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-black/50"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      role="dialog"
    >
      <div className="space-y-4">
        <div>
          <h2 id="dialog-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <p id="dialog-description" className="mt-2 text-sm text-slate-600">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500"
            }`}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

