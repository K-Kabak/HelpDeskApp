/**
 * Reusable error state components with retry actions
 */

type ErrorStateProps = {
  title?: string;
  message: string;
  error?: Error | string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

export function ErrorState({
  title = "Wystąpił błąd",
  message,
  error,
  onRetry,
  retryLabel = "Spróbuj ponownie",
  action,
}: ErrorStateProps) {
  const errorMessage =
    typeof error === "string" ? error : error?.message || "Nieznany błąd";

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
      <svg
        className="mx-auto h-12 w-12 text-red-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      <h2 className="mt-4 text-lg font-semibold text-red-900">{title}</h2>
      <p className="mt-1 text-sm text-red-800">{message}</p>
      {error && (
        <p className="mt-2 text-xs text-red-700" role="alert" aria-live="polite">
          Szczegóły: {errorMessage}
        </p>
      )}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px]"
            aria-label={retryLabel}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {retryLabel}
          </button>
        )}
        {action && (
          action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px]"
              aria-label={action.label}
            >
              {action.label}
            </a>
          ) : action.onClick ? (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px]"
              aria-label={action.label}
            >
              {action.label}
            </button>
          ) : null
        )}
      </div>
    </div>
  );
}

export function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
            >
              Spróbuj ponownie
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

