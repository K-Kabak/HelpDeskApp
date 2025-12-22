"use client";

import { TicketPriority } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SafeMarkdown } from "@/components/safe-markdown";

type CategoryOption = {
  id: string;
  name: string;
  description?: string | null;
};

export default function TicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [descriptionMd, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.SREDNI);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryMode, setCategoryMode] = useState<"select" | "custom">("custom");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoriesStatus, setCategoriesStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

  const validationRules = useMemo(
    () => ({
      title: { min: 5, max: 120 },
      descriptionMd: { min: 20, max: 5000 },
      category: { min: 3, max: 50 },
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      setCategoriesStatus("loading");
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        const options: CategoryOption[] = data.categories ?? [];
        if (cancelled) return;
        if (options.length === 0) {
          setCategoriesStatus("empty");
          setCategoryMode("custom");
          return;
        }
        setCategories(options);
        setCategoriesStatus("ready");
        setCategoryMode("select");
        setSelectedCategoryId(options[0].id);
        setCategory(options[0].name);
      } catch {
        if (cancelled) return;
        setCategoriesStatus("error");
        setCategoryMode("custom");
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = () => {
    const nextErrors: { [key: string]: string } = {};
    if (title.trim().length < validationRules.title.min) {
      nextErrors.title = `Tytuł musi mieć co najmniej ${validationRules.title.min} znaki.`;
    } else if (title.trim().length > validationRules.title.max) {
      nextErrors.title = `Tytuł może mieć maksymalnie ${validationRules.title.max} znaków.`;
    }

    if (descriptionMd.trim().length < validationRules.descriptionMd.min) {
      nextErrors.descriptionMd = `Opis musi mieć co najmniej ${validationRules.descriptionMd.min} znaków.`;
    } else if (descriptionMd.trim().length > validationRules.descriptionMd.max) {
      nextErrors.descriptionMd = `Opis może mieć maksymalnie ${validationRules.descriptionMd.max} znaków.`;
    }

    if (!category.trim()) {
      nextErrors.category = "Kategoria jest wymagana.";
    } else if (category.trim().length < validationRules.category.min) {
      nextErrors.category = `Kategoria musi mieć co najmniej ${validationRules.category.min} znaki.`;
    } else if (category.trim().length > validationRules.category.max) {
      nextErrors.category = `Kategoria może mieć maksymalnie ${validationRules.category.max} znaków.`;
    }

    if (!priority) {
      nextErrors.priority = "Priorytet jest wymagany.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, descriptionMd, priority, category }),
    });
    setLoading(false);
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const message =
        errorBody?.message ||
        errorBody?.error ||
        "Błąd przy tworzeniu zgłoszenia. Spróbuj ponownie lub skontaktuj się z administratorem.";
      toast.error(message);
      return;
    }
    toast.success("Zgłoszenie utworzone");
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority(TicketPriority.SREDNI);
    setErrors({});
    router.refresh();
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Tytuł</label>
        <input
          className={`rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.title ? "border-red-500" : "border-slate-300"}`}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          minLength={validationRules.title.min}
          maxLength={validationRules.title.max}
          disabled={loading}
          aria-invalid={!!errors.title}
          aria-describedby="title-error"
        />
        {errors.title && (
          <p id="title-error" className="text-xs text-red-600">
            {errors.title}
          </p>
        )}
      </div>
      <div className="grid gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm text-slate-700">Opis (Markdown)</label>
          <div className="flex gap-2 text-xs font-semibold text-slate-600">
            <button
              type="button"
              className={`rounded px-2 py-1 ${previewMode === "edit" ? "bg-sky-100 text-sky-700" : "bg-slate-100"}`}
              onClick={() => setPreviewMode("edit")}
              disabled={loading}
            >
              Edycja
            </button>
            <button
              type="button"
              className={`rounded px-2 py-1 ${previewMode === "preview" ? "bg-sky-100 text-sky-700" : "bg-slate-100"}`}
              onClick={() => setPreviewMode("preview")}
              disabled={loading}
            >
              Podgląd
            </button>
          </div>
        </div>
        {previewMode === "edit" ? (
          <textarea
            className={`rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.descriptionMd ? "border-red-500" : "border-slate-300"}`}
            rows={4}
            value={descriptionMd}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.descriptionMd)
                setErrors((prev) => ({ ...prev, descriptionMd: "" }));
            }}
            minLength={validationRules.descriptionMd.min}
            maxLength={validationRules.descriptionMd.max}
            disabled={loading}
            aria-invalid={!!errors.descriptionMd}
            aria-describedby="description-error"
          />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 prose prose-sm max-w-none">
            <SafeMarkdown>
              {descriptionMd || "Podgląd pojawi się po wpisaniu treści."}
            </SafeMarkdown>
          </div>
        )}
        {errors.descriptionMd && (
          <p id="description-error" className="text-xs text-red-600">
            {errors.descriptionMd}
          </p>
        )}
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Priorytet</label>
        <select
          className={`rounded-lg border px-3 py-2 ${errors.priority ? "border-red-500" : "border-slate-300"}`}
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as TicketPriority);
            if (errors.priority) setErrors((prev) => ({ ...prev, priority: "" }));
          }}
          disabled={loading}
          aria-invalid={!!errors.priority}
          aria-describedby="priority-error"
        >
          <option value={TicketPriority.NISKI}>Niski</option>
          <option value={TicketPriority.SREDNI}>Średni</option>
          <option value={TicketPriority.WYSOKI}>Wysoki</option>
          <option value={TicketPriority.KRYTYCZNY}>Krytyczny</option>
        </select>
        {errors.priority && (
          <p id="priority-error" className="text-xs text-red-600">
            {errors.priority}
          </p>
        )}
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Kategoria</label>
        {categoriesStatus === "loading" && (
          <p className="text-xs text-slate-500">Ładowanie listy kategorii...</p>
        )}
        {categoriesStatus === "error" && (
          <p className="text-xs text-amber-600">
            Nie udało się pobrać kategorii. Możesz wpisać własną.
          </p>
        )}
        {categoriesStatus === "ready" && categoryMode === "select" && (
          <select
            className={`rounded-lg border px-3 py-2 ${errors.category ? "border-red-500" : "border-slate-300"}`}
            value={selectedCategoryId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedCategoryId(id);
              const match = categories.find((c) => c.id === id);
              const name = match?.name ?? "";
              setCategory(name);
              if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
              if (!id) {
                setCategoryMode("custom");
              }
            }}
            disabled={loading}
            aria-invalid={!!errors.category}
            aria-describedby="category-error"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            <option value="">Wpisz ręcznie…</option>
          </select>
        )}
        {(categoryMode === "custom" || categoriesStatus !== "ready" || selectedCategoryId === "") && (
          <input
            className={`rounded-lg border px-3 py-2 ${errors.category ? "border-red-500" : "border-slate-300"}`}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
            }}
            placeholder="np. Sieć"
            minLength={validationRules.category.min}
            maxLength={validationRules.category.max}
            disabled={loading}
            aria-invalid={!!errors.category}
            aria-describedby="category-error"
          />
        )}
        {categoriesStatus === "ready" && categoryMode === "select" && (
          <button
            type="button"
            className="text-xs font-semibold text-sky-700 underline"
            onClick={() => {
              setCategoryMode("custom");
              setSelectedCategoryId("");
              setCategory("");
            }}
            disabled={loading}
          >
            Wpisz kategorię ręcznie
          </button>
        )}
        {errors.category && (
          <p id="category-error" className="text-xs text-red-600">
            {errors.category}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        {loading ? "Zapisywanie..." : "Utwórz zgłoszenie"}
      </button>
    </form>
  );
}
