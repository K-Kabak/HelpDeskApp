"use client";

import { TicketPriority } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SafeMarkdown } from "@/components/safe-markdown";
import { FormField } from "@/components/form-field";
import { AutocompleteInput } from "@/components/autocomplete-input";

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
  const [slaPreview, setSlaPreview] = useState<{
    status: "idle" | "loading" | "ready" | "missing" | "error";
    firstResponseDue?: string | null;
    resolveDue?: string | null;
    firstResponseHours?: number | null;
    resolveHours?: number | null;
  }>({ status: "idle" });

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

  useEffect(() => {
    let cancelled = false;
    const fetchPreview = async () => {
      setSlaPreview((prev) => ({ ...prev, status: "loading" }));
      try {
        const res = await fetch("/api/sla/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priority,
            category: category.trim() || undefined,
          }),
        });
        if (!res.ok) throw new Error("preview failed");
        const data = await res.json();
        if (cancelled) return;
        setSlaPreview({
          status: data.policy ? "ready" : "missing",
          firstResponseDue: data.preview?.firstResponseDue ?? null,
          resolveDue: data.preview?.resolveDue ?? null,
          firstResponseHours: data.policy?.firstResponseHours ?? null,
          resolveHours: data.policy?.resolveHours ?? null,
        });
      } catch {
        if (cancelled) return;
        setSlaPreview({ status: "error" });
      }
    };

    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [priority, category]);

  const formatDue = (iso?: string | null) => {
    if (!iso) return "Brak terminu";
    return new Date(iso).toLocaleString("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, descriptionMd, priority, category }),
      });
      
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
    } catch (error) {
      toast.error("Błąd przy tworzeniu zgłoszenia. Sprawdź połączenie i spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        label: cat.name,
        description: cat.description || undefined,
      })),
    [categories]
  );

  return (
    <form className="grid gap-4" onSubmit={submit} aria-label="Formularz tworzenia zgłoszenia">
      <FormField
        label="Tytuł"
        htmlFor="title"
        required
        error={errors.title}
        helpText={`Minimum ${validationRules.title.min}, maksimum ${validationRules.title.max} znaków`}
      >
        <input
          id="title"
          type="text"
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            errors.title
              ? "border-red-500 focus:ring-red-500"
              : title.trim().length >= validationRules.title.min && title.trim().length <= validationRules.title.max
              ? "border-green-500"
              : "border-slate-300"
          }`}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          minLength={validationRules.title.min}
          maxLength={validationRules.title.max}
          disabled={loading}
          aria-invalid={!!errors.title}
          autoComplete="off"
        />
      </FormField>
      <FormField
        label="Opis (Markdown)"
        htmlFor="description"
        required
        error={errors.descriptionMd}
        helpText={`Minimum ${validationRules.descriptionMd.min}, maksimum ${validationRules.descriptionMd.max} znaków`}
      >
        <div className="space-y-2">
          <div className="flex gap-2 text-xs font-semibold text-slate-600" role="group" aria-label="Tryb edycji opisu">
            <button
              type="button"
              className={`rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 transition-colors ${
                previewMode === "edit"
                  ? "bg-sky-100 text-sky-700 ring-2 ring-sky-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              onClick={() => setPreviewMode("edit")}
              disabled={loading}
              aria-pressed={previewMode === "edit"}
              aria-label="Tryb edycji"
            >
              ✏️ Edycja
            </button>
            <button
              type="button"
              className={`rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 transition-colors ${
                previewMode === "preview"
                  ? "bg-sky-100 text-sky-700 ring-2 ring-sky-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              onClick={() => setPreviewMode("preview")}
              disabled={loading}
              aria-pressed={previewMode === "preview"}
              aria-label="Tryb podglądu"
            >
              👁️ Podgląd
            </button>
          </div>
          {previewMode === "edit" ? (
            <textarea
              id="description"
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.descriptionMd
                  ? "border-red-500 focus:ring-red-500"
                  : descriptionMd.trim().length >= validationRules.descriptionMd.min &&
                    descriptionMd.trim().length <= validationRules.descriptionMd.max
                  ? "border-green-500"
                  : "border-slate-300"
              }`}
              rows={6}
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
              placeholder="Opisz problem używając Markdown..."
            />
          ) : (
            <div className="min-h-[150px] rounded-lg border border-slate-200 bg-slate-50 p-4 prose prose-sm max-w-none">
              {descriptionMd ? (
                <SafeMarkdown>{descriptionMd}</SafeMarkdown>
              ) : (
                <p className="text-slate-400 italic">Podgląd pojawi się po wpisaniu treści.</p>
              )}
            </div>
          )}
        </div>
      </FormField>
      <FormField
        label="Priorytet"
        htmlFor="priority"
        required
        error={errors.priority}
      >
        <select
          id="priority"
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            errors.priority ? "border-red-500 focus:ring-red-500" : "border-slate-300"
          }`}
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as TicketPriority);
            if (errors.priority) setErrors((prev) => ({ ...prev, priority: "" }));
          }}
          disabled={loading}
          aria-invalid={!!errors.priority}
        >
          <option value={TicketPriority.NISKI}>Niski</option>
          <option value={TicketPriority.SREDNI}>Średni</option>
          <option value={TicketPriority.WYSOKI}>Wysoki</option>
          <option value={TicketPriority.KRYTYCZNY}>Krytyczny</option>
        </select>
      </FormField>
      <FormField
        label="Kategoria"
        htmlFor="category"
        required
        error={errors.category}
        helpText={`Minimum ${validationRules.category.min}, maksimum ${validationRules.category.max} znaków`}
      >
        {categoriesStatus === "loading" && (
          <p className="text-xs text-slate-500" role="status" aria-live="polite">
            Ładowanie listy kategorii...
          </p>
        )}
        {categoriesStatus === "error" && (
          <p className="text-xs text-amber-600" role="alert">
            Nie udało się pobrać kategorii. Możesz wpisać własną.
          </p>
        )}
        {categoriesStatus === "ready" && categoryMode === "select" ? (
          <div className="space-y-2">
            <AutocompleteInput
              id="category"
              options={categoryOptions}
              value={category}
              onChange={(value) => {
                setCategory(value);
                const match = categories.find((c) => c.name === value);
                if (match) {
                  setSelectedCategoryId(match.id);
                }
                if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
              }}
              onSelect={(option) => {
                setCategory(option.label);
                setSelectedCategoryId(option.id);
                if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
              }}
              placeholder="Wybierz lub wpisz kategorię..."
              disabled={loading}
              error={errors.category}
              aria-label="Kategoria zgłoszenia"
            />
            <button
              type="button"
              className="text-xs font-semibold text-sky-700 underline hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 rounded px-1"
              onClick={() => {
                setCategoryMode("custom");
                setSelectedCategoryId("");
                setCategory("");
              }}
              disabled={loading}
              aria-label="Przełącz na ręczne wpisywanie kategorii"
            >
              Wpisz kategorię ręcznie
            </button>
          </div>
        ) : (
          <input
            id="category"
            type="text"
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              errors.category
                ? "border-red-500 focus:ring-red-500"
                : category.trim().length >= validationRules.category.min &&
                  category.trim().length <= validationRules.category.max
                ? "border-green-500"
                : "border-slate-300"
            }`}
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
            autoComplete="off"
          />
        )}
      </FormField>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Podgląd SLA</p>
          <p className="text-xs text-slate-500">Aktualizuje się po zmianie priorytetu/kategorii</p>
        </div>
        {slaPreview.status === "loading" || slaPreview.status === "idle" ? (
          <p className="text-xs text-slate-600">Ładowanie podglądu SLA...</p>
        ) : null}
        {slaPreview.status === "error" && (
          <p className="text-xs text-amber-700">Nie udało się pobrać podglądu SLA.</p>
        )}
        {slaPreview.status === "missing" && (
          <p className="text-xs text-slate-600">Brak polityki SLA dla wybranego priorytetu lub kategorii.</p>
        )}
        {slaPreview.status === "ready" && (
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            <li>
              <span className="font-semibold">Odpowiedź:</span>{" "}
              {slaPreview.firstResponseDue ? formatDue(slaPreview.firstResponseDue) : "Brak terminu"}{" "}
              {typeof slaPreview.firstResponseHours === "number" && `(~${slaPreview.firstResponseHours}h)`}
            </li>
            <li>
              <span className="font-semibold">Rozwiązanie:</span>{" "}
              {slaPreview.resolveDue ? formatDue(slaPreview.resolveDue) : "Brak terminu"}{" "}
              {typeof slaPreview.resolveHours === "number" && `(~${slaPreview.resolveHours}h)`}
            </li>
          </ul>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
        aria-label={loading ? "Zapisywanie zgłoszenia..." : "Utwórz zgłoszenie"}
        aria-busy={loading}
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
