import type { StatusTone } from "@/lib/status";

/** Tailwind classes per status tone. Text colours meet WCAG AA on their backgrounds. */
export const TONE_CLASSES: Record<StatusTone, { pill: string; dot: string }> = {
  green: { pill: "bg-green-100 text-green-900 ring-green-700/25", dot: "bg-green-600" },
  red: { pill: "bg-red-100 text-red-900 ring-red-700/25", dot: "bg-red-600" },
  orange: { pill: "bg-orange-100 text-orange-900 ring-orange-700/25", dot: "bg-orange-600" },
  amber: { pill: "bg-amber-100 text-amber-900 ring-amber-700/30", dot: "bg-amber-500" },
  grey: { pill: "bg-neutral-200 text-neutral-800 ring-neutral-500/25", dot: "bg-neutral-500" },
};

/** Hex colours for map markers (Leaflet can't use Tailwind classes). */
export const TONE_HEX: Record<StatusTone, string> = {
  green: "#16a34a",
  red: "#dc2626",
  orange: "#ea580c",
  amber: "#d97706",
  grey: "#6b7280",
};
