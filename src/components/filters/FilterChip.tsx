"use client";

interface Props {
  label: string;
  active: boolean;
  onToggle: () => void;
}

export function FilterChip({ label, active, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`min-h-10 shrink-0 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? "border-teal-700 bg-teal-700 text-white"
          : "border-neutral-300 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
      }`}
    >
      {label}
    </button>
  );
}
