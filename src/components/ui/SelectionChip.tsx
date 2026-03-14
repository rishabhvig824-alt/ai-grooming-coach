"use client";

import { ButtonHTMLAttributes } from "react";

interface SelectionChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  label: string;
}

export function SelectionChip({
  selected = false,
  label,
  className = "",
  ...props
}: SelectionChipProps) {
  return (
    <button
      role="option"
      aria-selected={selected}
      className={`
        inline-flex items-center justify-center px-4 py-2 rounded-chip text-sm font-medium
        min-h-tap transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-brand-primary focus-visible:ring-offset-2
        ${selected
          ? "bg-brand-primary text-white"
          : "bg-chip-inactive text-content-primary hover:bg-gray-200"
        }
        ${className}
      `}
      {...props}
    >
      {label}
    </button>
  );
}
