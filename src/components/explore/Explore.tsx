"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { EMPTY_FILTERS, filterVenues, type Filters } from "@/lib/filters";
import type { LatLng } from "@/lib/geo";
import type { Venue } from "@/lib/schema";
import { FilterBar } from "../filters/FilterBar";
import { useToday } from "../useToday";
import { VenueCard } from "../venue/VenueCard";

const VenueMap = dynamic(() => import("../map/VenueMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
      Loading map…
    </div>
  ),
});

type View = "list" | "map";
type Locate =
  | { state: "idle" }
  | { state: "locating" }
  | { state: "located"; origin: LatLng }
  | { state: "error"; message: string };

export function Explore({ venues, buildDay }: { venues: Venue[]; buildDay: string }) {
  const today = useToday(buildDay);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [view, setView] = useState<View>("list");
  const [locate, setLocate] = useState<Locate>({ state: "idle" });

  const origin = locate.state === "located" ? locate.origin : undefined;
  const results = useMemo(
    () => filterVenues(venues, filters, { now: today, origin }),
    [venues, filters, today, origin],
  );

  function toggleNearMe() {
    if (locate.state === "located") return setLocate({ state: "idle" });
    if (!("geolocation" in navigator)) {
      return setLocate({ state: "error", message: "Location isn't available in this browser." });
    }
    setLocate({ state: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocate({
          state: "located",
          origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }),
      (err) =>
        setLocate({
          state: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Location permission was denied."
              : "Couldn't get your location. Try again.",
        }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} onChange={setFilters} />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={toggleNearMe}
          aria-pressed={locate.state === "located"}
          disabled={locate.state === "locating"}
          className={`min-h-10 rounded-full border px-3.5 text-sm font-medium ${
            locate.state === "located"
              ? "border-blue-700 bg-blue-700 text-white"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          {locate.state === "locating" ? "Locating…" : "📍 Near me"}
        </button>

        <div
          role="group"
          aria-label="View"
          className="flex rounded-full border border-neutral-300 p-0.5 dark:border-neutral-700"
        >
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`min-h-9 rounded-full px-4 text-sm font-medium capitalize ${
                view === v ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : ""
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {locate.state === "error" && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {locate.message}
        </p>
      )}

      <p aria-live="polite" className="text-sm text-neutral-600 dark:text-neutral-400">
        {results.length} {results.length === 1 ? "venue" : "venues"}
        {origin ? " · nearest first" : ""}
      </p>

      {view === "map" ? (
        <div className="-mx-4 h-[65dvh] overflow-hidden border-y border-neutral-200 dark:border-neutral-800">
          <VenueMap results={results} today={today} origin={origin} />
        </div>
      ) : results.length > 0 ? (
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.venue.id}>
              <VenueCard result={r} buildDay={buildDay} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm dark:border-neutral-700">
          <p>No venues match these filters.</p>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-2 font-medium text-teal-800 underline dark:text-teal-300"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
