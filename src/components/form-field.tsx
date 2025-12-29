"use client";

import { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  success?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  helpText,
  success = false,
  children,
  className = "",
}: FormFieldProps) {
  const fieldId = htmlFor || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`grid gap-1 ${className}`}>
      <label
        htmlFor={fieldId}
        className="text-sm font-semibold text-slate-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-600" aria-label="wymagane">
            *
          </span>
        )}
      </label>
      <div className="relative">
        {children}
        {success && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="text-xs text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={helpId} className="text-xs text-slate-500">
          {helpText}
        </p>
      )}
    </div>
  );
}

