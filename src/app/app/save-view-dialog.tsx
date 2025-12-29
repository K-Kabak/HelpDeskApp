"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type SaveViewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, setAsDefault: boolean) => Promise<void>;
  isLoading: boolean;
};

export function SaveViewDialog({
  isOpen,
  onClose,
  onSave,
  isLoading,
}: SaveViewDialogProps) {
  const [name, setName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setName("");
    setSetAsDefault(false);
    setError(null);
    onClose();
  }, [onClose]);

  // Focus management and keyboard handling
  useEffect(() => {
    if (isOpen) {
      // Focus the input when dialog opens
      inputRef.current?.focus();
      
      // Handle ESC key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isLoading) {
          handleClose();
        }
      };
      
      document.addEventListener("keydown", handleEscape);
      
      // Trap focus within dialog
      const handleTab = (e: KeyboardEvent) => {
        if (!dialogRef.current) return;
        
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.key === "Tab") {
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
      
      document.addEventListener("keydown", handleTab);
      
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("keydown", handleTab);
      };
    }
  }, [isOpen, isLoading, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError("Nazwa widoku jest wymagana");
      inputRef.current?.focus();
      return;
    }
    
    if (name.trim().length > 50) {
      setError("Nazwa widoku może mieć maksymalnie 50 znaków");
      inputRef.current?.focus();
      return;
    }
    
    await onSave(name.trim(), setAsDefault);
    // Reset state after successful save
    setName("");
    setSetAsDefault(false);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-view-dialog-title"
    >
      <div 
        ref={dialogRef}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="save-view-dialog-title" className="mb-4 text-lg font-semibold text-slate-900">
          Zapisz widok
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="view-name"
              className="block text-sm font-medium text-slate-700"
            >
              Nazwa widoku
            </label>
            <input
              ref={inputRef}
              id="view-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="np. Moje otwarte zgłoszenia"
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-100 ${
                error ? "border-red-500" : "border-slate-300 focus:border-sky-500"
              }`}
              maxLength={50}
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? "view-name-error" : "view-name-help"}
              disabled={isLoading}
            />
            {error ? (
              <p id="view-name-error" className="mt-1 text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : (
              <p id="view-name-help" className="mt-1 text-xs text-slate-500">
                Maksymalnie 50 znaków
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="set-default"
              type="checkbox"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label
              htmlFor="set-default"
              className="ml-2 text-sm text-slate-700"
            >
              Ustaw jako domyślny widok
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 min-h-[44px]"
              aria-label="Anuluj zapisywanie widoku"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
              aria-label={isLoading ? "Zapisywanie widoku..." : "Zapisz widok"}
              aria-busy={isLoading}
            >
              {isLoading ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




