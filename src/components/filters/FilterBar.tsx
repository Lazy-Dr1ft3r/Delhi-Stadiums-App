"use client";

import { activeFilterCount, EMPTY_FILTERS, type Filters } from "@/lib/filters";
import { FILTERABLE_SURFACES, SURFACE_LABELS } from "@/lib/labels";
import type { Surface } from "@/lib/schema";
import { FilterChip } from "./FilterChip";

type Toggle = "openNow" | "full400m" | "publicAccess" | "floodlights";

const TOGGLES: [Toggle, string][] = [
  ["openNow", "Open now"],
  ["full400m", "400m"],
  ["publicAccess", "Public entry"],
  ["floodlights", "Floodlights"],
];

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const toggle = (key: Toggle) => onChange({ ...filters, [key]: !filters[key] });
  const toggleSurface = (s: Surface) =>
    onChange({
      ...filters,
      surfaces: filters.surfaces.includes(s)
        ? filters.surfaces.filter((x) => x !== s)
        : [...filters.surfaces, s],
    });
  const count = activeFilterCount(filters);

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="sr-only">Search venues</span>
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search by name or area"
          className="min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      {/* One scrollable row keeps the list visible on small screens. */}
      <div
        role="group"
        aria-label="Filters"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      >
        {TOGGLES.map(([key, label]) => (
          <FilterChip key={key} label={label} active={filters[key]} onToggle={() => toggle(key)} />
        ))}
        {FILTERABLE_SURFACES.map((s) => (
          <FilterChip
            key={s}
            label={SURFACE_LABELS[s]}
            active={filters.surfaces.includes(s)}
            onToggle={() => toggleSurface(s)}
          />
        ))}
        {count > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS, query: filters.query })}
            className="min-h-10 shrink-0 px-2 text-sm font-medium text-teal-800 underline dark:text-teal-300"
          >
            Clear ({count})
          </button>
        )}
      </div>
    </div>
  );
}
