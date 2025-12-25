"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSetAsDefault(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nazwa widoku jest wymagana");
      return;
    }
    await onSave(name.trim(), setAsDefault);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
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
              id="view-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Moje otwarte zgłoszenia"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              maxLength={50}
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-500">
              Maksymalnie 50 znaków
            </p>
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
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              {isLoading ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

