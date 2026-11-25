import Link from "next/link";
import type { VenueResult } from "@/lib/filters";
import { formatDistance } from "@/lib/geo";
import { PUBLIC_ENTRY_LABELS, SURFACE_LABELS } from "@/lib/labels";
import { SampleTag } from "./SampleTag";
import { StatusBadge } from "./StatusBadge";

export function VenueCard({ result, buildDay }: { result: VenueResult; buildDay: string }) {
  const { venue, track, distanceKm } = result;
  const d = track.details;

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="block rounded-xl border border-neutral-200 p-4 active:bg-neutral-50 dark:border-neutral-800 dark:active:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{venue.name}</h2>
            {venue.isSample && <SampleTag />}
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{venue.locality}</p>
        </div>
        {distanceKm !== undefined && (
          <span className="shrink-0 text-sm font-medium tabular-nums">
            {formatDistance(distanceKm)}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm">
        {d.lengthMeters}m · {SURFACE_LABELS[d.surface]} ·{" "}
        {PUBLIC_ENTRY_LABELS[track.access.publicEntry]}
      </p>

      <div className="mt-2">
        <StatusBadge status={track.status} buildDay={buildDay} variant="compact" />
      </div>
    </Link>
  );
}
