/**
 * Pure filter/sort logic for the Explore screen.
 *
 * Unknown ≠ false applies here too: a filter like "floodlights" only matches facilities
 * where floodlights are *confirmed*; unknown values never match a positive filter.
 * All facility-level filters must hold for the *same* facility.
 */
import { distanceKm, type LatLng } from "./geo";
import type { RunningTrackFacility, Surface, Venue } from "./schema";
import { isCurrentlyOpen } from "./status";

export interface Filters {
  query: string;
  openNow: boolean;
  /** Empty = any surface. */
  surfaces: Surface[];
  full400m: boolean;
  publicAccess: boolean;
  floodlights: boolean;
}

export const EMPTY_FILTERS: Filters = {
  query: "",
  openNow: false,
  surfaces: [],
  full400m: false,
  publicAccess: false,
  floodlights: false,
};

export interface VenueResult {
  venue: Venue;
  /** The track shown on cards and markers: the first one that matched the filters. */
  track: RunningTrackFacility;
  distanceKm?: number;
}

export function runningTracks(venue: Venue): RunningTrackFacility[] {
  return venue.facilities.filter((f): f is RunningTrackFacility => f.type === "running_track");
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // strip accents left by NFKD
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function matchesQuery(venue: Venue, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = normalize(
    [
      venue.name,
      ...venue.aliases,
      venue.locality,
      venue.district ?? "",
      venue.operatorName ?? "",
    ].join(" "),
  );
  return q.split(" ").every((word) => haystack.includes(word));
}

export function matchesTrack(track: RunningTrackFacility, filters: Filters, now: Date): boolean {
  const d = track.details;
  if (filters.openNow && !isCurrentlyOpen(track.status, now)) return false;
  if (filters.surfaces.length > 0 && !filters.surfaces.includes(d.surface)) return false;
  if (filters.full400m && d.lengthMeters < 400) return false;
  if (filters.publicAccess && track.access.publicEntry !== "open") return false;
  if (filters.floodlights && d.floodlights !== true) return false;
  return true;
}

/**
 * Filter venues and sort them: by distance when `origin` is given, otherwise by name.
 */
export function filterVenues(
  venues: Venue[],
  filters: Filters,
  options: { now: Date; origin?: LatLng },
): VenueResult[] {
  const results: VenueResult[] = [];
  for (const venue of venues) {
    if (!matchesQuery(venue, filters.query)) continue;
    const track = runningTracks(venue).find((t) => matchesTrack(t, filters, options.now));
    if (!track) continue;
    results.push({
      venue,
      track,
      distanceKm: options.origin ? distanceKm(options.origin, venue.coordinates) : undefined,
    });
  }

  return results.sort((a, b) =>
    a.distanceKm !== undefined && b.distanceKm !== undefined
      ? a.distanceKm - b.distanceKm
      : a.venue.name.localeCompare(b.venue.name),
  );
}

export function activeFilterCount(filters: Filters): number {
  return (
    Number(filters.openNow) +
    Number(filters.full400m) +
    Number(filters.publicAccess) +
    Number(filters.floodlights) +
    filters.surfaces.length
  );
}
