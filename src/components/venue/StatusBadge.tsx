"use client";

import type { Status } from "@/lib/schema";
import { formatDate, getStatusDisplay, SOURCE_LABELS } from "@/lib/status";
import { useToday } from "../useToday";
import { TONE_CLASSES } from "./tone";

interface Props {
  status: Status;
  buildDay: string;
  /** Compact: pill plus a short age line, for cards. Full: verified date, source, warning, reason. */
  variant?: "compact" | "full";
}

export function StatusBadge({ status, buildDay, variant = "full" }: Props) {
  const today = useToday(buildDay);
  const d = getStatusDisplay(status, today);
  const tone = TONE_CLASSES[d.tone];

  const pill = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold ring-1 ring-inset ${tone.pill}`}
    >
      <span aria-hidden className={`size-2 rounded-full ${tone.dot}`} />
      {d.label}
    </span>
  );

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {pill}
        <span className="text-xs text-neutral-600 dark:text-neutral-400">
          {d.freshness === "fresh" ? `Verified ${d.ageText}` : d.warning}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {pill}
      <p className="text-sm text-neutral-700 dark:text-neutral-300">
        Verified {formatDate(status.lastVerified)} ({d.ageText}) ·{" "}
        {status.sourceUrl ? (
          <a
            href={status.sourceUrl}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {SOURCE_LABELS[status.source]}
          </a>
        ) : (
          SOURCE_LABELS[status.source]
        )}
      </p>
      {d.warning && (
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">⚠ {d.warning}</p>
      )}
      {status.reason && (
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {d.freshness === "expired" ? "Last note: " : ""}
          {status.reason}
        </p>
      )}
    </div>
  );
}
