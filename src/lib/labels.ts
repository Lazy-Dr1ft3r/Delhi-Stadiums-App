/** Display labels for schema enums, and the "unknown ≠ false" renderer. */
import type { Access, Operator, Surface } from "./schema";

export const NOT_CONFIRMED = "Not confirmed";

/** Render an optional boolean. `undefined` means unknown and must never read as "No". */
export function yesNo(value: boolean | undefined): string {
  if (value === undefined) return NOT_CONFIRMED;
  return value ? "Yes" : "No";
}

export const SURFACE_LABELS: Record<Surface, string> = {
  synthetic: "Synthetic",
  cinder: "Cinder",
  grass: "Grass",
  mud: "Mud",
  concrete: "Concrete",
  unknown: NOT_CONFIRMED,
};

export const PUBLIC_ENTRY_LABELS: Record<Access["publicEntry"], string> = {
  open: "Open to the public",
  membership: "Membership required",
  registered_athletes_only: "Registered athletes only",
  restricted: "Restricted",
  unknown: NOT_CONFIRMED,
};

export const OPERATOR_LABELS: Record<Operator, string> = {
  SAI: "Sports Authority of India (SAI)",
  DDA: "Delhi Development Authority (DDA)",
  "Delhi Govt": "Delhi Government",
  MCD: "Municipal Corporation of Delhi (MCD)",
  NDMC: "New Delhi Municipal Council (NDMC)",
  University: "University",
  Private: "Private",
  Other: "Other",
};

/** Surfaces offered as filter chips (excludes "unknown"). */
export const FILTERABLE_SURFACES: Surface[] = ["synthetic", "cinder", "grass", "mud"];
