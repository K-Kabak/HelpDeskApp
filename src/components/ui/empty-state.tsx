/**
 * Reusable empty state components with illustrations and CTAs
 */

import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="mx-auto h-12 w-12 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const ActionButton = action && (
    action.href ? (
      <Link
        href={action.href}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
        aria-label={action.label}
      >
        {action.label}
      </Link>
    ) : action.onClick ? (
      <button
        onClick={action.onClick}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
        aria-label={action.label}
      >
        {action.label}
      </button>
    ) : null
  );

  const SecondaryButton = secondaryAction && (
    secondaryAction.href ? (
      <Link
        href={secondaryAction.href}
        className="mt-2 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
        aria-label={secondaryAction.label}
      >
        {secondaryAction.label}
      </Link>
    ) : secondaryAction.onClick ? (
      <button
        onClick={secondaryAction.onClick}
        className="mt-2 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 min-h-[44px]"
        aria-label={secondaryAction.label}
      >
        {secondaryAction.label}
      </button>
    ) : null
  );

  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
      {icon || defaultIcon}
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      {(ActionButton || SecondaryButton) && (
        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          {ActionButton}
          {SecondaryButton}
        </div>
      )}
    </div>
  );
}

// Specific empty states
export function EmptyTicketsList({
  hasFilters,
  onCreateClick,
}: {
  hasFilters?: boolean;
  onCreateClick?: () => void;
}) {
  return (
    <EmptyState
      title="Brak zgłoszeń"
      description={
        hasFilters
          ? "Nie znaleziono zgłoszeń pasujących do wybranych filtrów. Spróbuj zmienić kryteria wyszukiwania."
          : "Nie masz jeszcze żadnych zgłoszeń. Utwórz pierwsze zgłoszenie, aby rozpocząć."
      }
      icon={
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
      action={
        onCreateClick
          ? { label: "Utwórz zgłoszenie", onClick: onCreateClick }
          : { label: "Utwórz zgłoszenie", href: "/app/tickets/new" }
      }
      secondaryAction={
        hasFilters ? { label: "Wyczyść filtry", href: "/app" } : undefined
      }
    />
  );
}

export function EmptyComments({
  canSeeInternal,
}: {
  canSeeInternal?: boolean;
}) {
  return (
    <EmptyState
      title="Brak komentarzy"
      description={
        canSeeInternal
          ? "Dodaj pierwszy komentarz, aby rozpocząć dyskusję."
          : "Dodaj komentarz, aby rozpocząć dyskusję."
      }
      icon={
        <svg
          className="mx-auto h-10 w-10 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      }
    />
  );
}

export function EmptySearchResults({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      title="Nie znaleziono wyników"
      description="Spróbuj zmienić kryteria wyszukiwania lub wyczyścić filtry."
      icon={
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      action={
        onClearFilters
          ? { label: "Wyczyść filtry", onClick: onClearFilters }
          : { label: "Wyczyść filtry", href: "/app" }
      }
    />
  );
}

export function EmptyTable({
  title,
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-12 text-center">
        <EmptyState
          title={title || "Brak danych"}
          description={description || "Nie znaleziono żadnych rekordów."}
          icon={
            <svg
              className="mx-auto h-10 w-10 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          }
          action={action}
        />
      </td>
    </tr>
  );
}

