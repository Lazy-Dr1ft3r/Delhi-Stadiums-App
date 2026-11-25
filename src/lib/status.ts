/**
 * Status freshness and badge logic. Pure: every function takes `now` explicitly.
 *
 * Rules (brief §4): a status is "fresh" for 60 days after lastVerified, "stale" (amber)
 * until 180 days, then "expired" — shown as Unknown (grey) whatever it last said.
 */
import type { Status, StatusState } from "./schema";

export const STALE_AFTER_DAYS = 60;
export const EXPIRED_AFTER_DAYS = 180;

export type Freshness = "fresh" | "stale" | "expired";
export type StatusTone = "green" | "red" | "orange" | "amber" | "grey";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse YYYY-MM-DD as a UTC calendar date, so results don't depend on the viewer's timezone. */
function utcDay(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

function utcToday(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/** Whole days since `lastVerified` (never negative). */
export function daysSince(lastVerified: string, now: Date): number {
  return Math.max(0, Math.floor((utcToday(now) - utcDay(lastVerified)) / DAY_MS));
}

export function getFreshness(lastVerified: string, now: Date): Freshness {
  const days = daysSince(lastVerified, now);
  if (days > EXPIRED_AFTER_DAYS) return "expired";
  if (days > STALE_AFTER_DAYS) return "stale";
  return "fresh";
}

export const STATE_LABELS: Record<StatusState, string> = {
  open: "Open",
  closed: "Closed",
  under_renovation: "Under renovation",
  restricted: "Restricted",
  unknown: "Unknown",
};

const STATE_TONES: Record<StatusState, StatusTone> = {
  open: "green",
  closed: "red",
  under_renovation: "orange",
  restricted: "orange",
  unknown: "grey",
};

export const SOURCE_LABELS: Record<Status["source"], string> = {
  site_visit: "Site visit",
  phone_call: "Phone call",
  official_notice: "Official notice",
  news: "News report",
  user_report: "User report",
  other: "Other source",
};

export interface StatusDisplay {
  /** The state we are willing to show: "unknown" once the status has expired. */
  effectiveState: StatusState;
  /** The state as recorded in the data. */
  recordedState: StatusState;
  label: string;
  tone: StatusTone;
  freshness: Freshness;
  ageDays: number;
  /** Human-readable age, e.g. "today", "12 days ago", "3 months ago". */
  ageText: string;
  /** Shown under the badge when the status is stale or expired. */
  warning?: string;
}

export function formatAge(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 45) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} months ago`;
  const years = Math.round(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function getStatusDisplay(status: Status, now: Date): StatusDisplay {
  const ageDays = daysSince(status.lastVerified, now);
  const freshness = getFreshness(status.lastVerified, now);
  const ageText = formatAge(ageDays);
  const recorded = STATE_LABELS[status.state];

  if (freshness === "expired") {
    return {
      effectiveState: "unknown",
      recordedState: status.state,
      label: "Unknown",
      tone: "grey",
      freshness,
      ageDays,
      ageText,
      warning:
        status.state === "unknown"
          ? `Last checked ${ageText}`
          : `Last confirmed ${recorded.toLowerCase()} ${ageText}`,
    };
  }

  if (freshness === "stale") {
    return {
      effectiveState: status.state,
      recordedState: status.state,
      label: recorded,
      tone: "amber",
      freshness,
      ageDays,
      ageText,
      warning: `Not re-checked since ${ageText} — may have changed`,
    };
  }

  return {
    effectiveState: status.state,
    recordedState: status.state,
    label: recorded,
    tone: STATE_TONES[status.state],
    freshness,
    ageDays,
    ageText,
  };
}

/** Open and not expired. Stale "open" still counts (it is shown amber, with a warning). */
export function isCurrentlyOpen(status: Status, now: Date): boolean {
  return getStatusDisplay(status, now).effectiveState === "open";
}

/** The calendar date of `d` in the runtime's local timezone, as YYYY-MM-DD. */
export function localISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Midnight UTC of a YYYY-MM-DD date — the `now` to pass to the functions above. */
export function dayToDate(isoDate: string): Date {
  return new Date(utcDay(isoDate));
}

/** Format an ISO date for display, e.g. "10 Nov 2026". */
export function formatDate(isoDate: string): string {
  return new Date(utcDay(isoDate)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
