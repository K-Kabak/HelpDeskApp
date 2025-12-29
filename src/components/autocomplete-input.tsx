"use client";

import { useState, useRef, useEffect, useMemo } from "react";

type AutocompleteOption = {
  id: string;
  label: string;
  description?: string;
};

type AutocompleteInputProps = {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

export function AutocompleteInput({
  options,
  value,
  onChange,
  onSelect,
  placeholder,
  className = "",
  disabled = false,
  required = false,
  error,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on value - use useMemo to avoid setState in effect
  const filteredOptionsMemo = useMemo(() => {
    if (value.trim()) {
      return options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(value.toLowerCase()) ||
          opt.description?.toLowerCase().includes(value.toLowerCase())
      );
    }
    return options;
  }, [value, options]);

  useEffect(() => {
    setFilteredOptions(filteredOptionsMemo);
    setIsOpen(value.trim() ? filteredOptionsMemo.length > 0 : false);
  }, [filteredOptionsMemo, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.label);
    onSelect?.(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredOptions.length === 0) {
      if (e.key === "Enter" && value.trim()) {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length === 1) {
          handleSelect(filteredOptions[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (filteredOptions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-sky-500"
        } ${className}`}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${id}-listbox` : undefined}
        aria-activedescendant={
          highlightedIndex >= 0 && isOpen
            ? `${id}-option-${highlightedIndex}`
            : undefined
        }
        role="combobox"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={highlightedIndex === index}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                highlightedIndex === index
                  ? "bg-sky-100 text-sky-900"
                  : "text-slate-900 hover:bg-slate-50"
              }`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="font-medium">{option.label}</div>
              {option.description && (
                <div className="text-xs text-slate-500">{option.description}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

