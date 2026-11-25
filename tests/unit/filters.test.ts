import { describe, expect, it } from "vitest";
import { activeFilterCount, EMPTY_FILTERS, filterVenues, type Filters } from "@/lib/filters";
import { venueSchema, type Venue } from "@/lib/schema";
import { makeVenue } from "./fixtures";

const NOW = new Date("2026-11-25T10:00:00Z");

type TrackOverrides = {
  id?: string;
  details?: Partial<Venue["facilities"][number]["details"]>;
  access?: Partial<Venue["facilities"][number]["access"]>;
  status?: Partial<Venue["facilities"][number]["status"]>;
};

function track(o: TrackOverrides = {}) {
  return {
    id: o.id ?? "track",
    type: "running_track" as const,
    details: { lengthMeters: 400, surface: "synthetic" as const, ...o.details },
    access: { publicEntry: "open" as const, ...o.access },
    status: {
      state: "open" as const,
      lastVerified: "2026-11-20",
      source: "site_visit" as const,
      ...o.status,
    },
  };
}

function venue(id: string, name: string, coords: { lat: number; lng: number }, tracks = [track()]) {
  return venueSchema.parse(makeVenue({ id, name, coordinates: coords, facilities: tracks }));
}

const run = (venues: Venue[], f: Partial<Filters>, origin?: { lat: number; lng: number }) =>
  filterVenues(venues, { ...EMPTY_FILTERS, ...f }, { now: NOW, origin }).map((r) => r.venue.id);

describe("filterVenues", () => {
  const a = venue("a", "Alpha", { lat: 28.6, lng: 77.2 });
  const b = venue("b", "Bravo", { lat: 28.7, lng: 77.1 }, [
    track({ details: { surface: "cinder", lengthMeters: 300 }, status: { state: "closed" } }),
  ]);
  const c = venue("c", "Charlie", { lat: 28.55, lng: 77.05 }, [
    track({ details: { floodlights: true }, access: { publicEntry: "membership" } }),
  ]);
  const all = [c, b, a];

  it("returns everything sorted by name with no filters", () => {
    expect(run(all, {})).toEqual(["a", "b", "c"]);
  });

  it("sorts by distance when an origin is given, and reports distance", () => {
    const origin = { lat: 28.7, lng: 77.1 };
    // From Bravo: Alpha ≈ 14.6 km, Charlie ≈ 17.4 km.
    expect(run(all, {}, origin)).toEqual(["b", "a", "c"]);
    const results = filterVenues(all, EMPTY_FILTERS, { now: NOW, origin });
    expect(results[0]?.distanceKm).toBe(0);
  });

  it("filters open now", () => {
    expect(run(all, { openNow: true })).toEqual(["a", "c"]);
  });

  it("treats an expired 'open' status as not open", () => {
    const old = venue("old", "Old", { lat: 28.6, lng: 77.2 }, [
      track({ status: { lastVerified: "2026-01-01" } }),
    ]);
    expect(run([old], { openNow: true })).toEqual([]);
  });

  it("filters by surface (any of the selected)", () => {
    expect(run(all, { surfaces: ["cinder"] })).toEqual(["b"]);
    expect(run(all, { surfaces: ["cinder", "synthetic"] })).toEqual(["a", "b", "c"]);
  });

  it("filters full 400m tracks", () => {
    expect(run(all, { full400m: true })).toEqual(["a", "c"]);
  });

  it("filters public access", () => {
    expect(run(all, { publicAccess: true })).toEqual(["a", "b"]);
  });

  it("only matches floodlights when confirmed — unknown never matches", () => {
    expect(run(all, { floodlights: true })).toEqual(["c"]);
  });

  it("requires all facility filters to hold on the same facility", () => {
    const mixed = venue("m", "Mixed", { lat: 28.6, lng: 77.2 }, [
      track({ id: "big", details: { lengthMeters: 400, floodlights: false } }),
      track({ id: "small", details: { lengthMeters: 200, floodlights: true } }),
    ]);
    expect(run([mixed], { full400m: true, floodlights: true })).toEqual([]);
    const result = filterVenues([mixed], { ...EMPTY_FILTERS, floodlights: true }, { now: NOW });
    expect(result[0]?.track.id).toBe("small");
  });

  it("searches name, aliases and locality, case- and punctuation-insensitive", () => {
    const v = venueSchema.parse(
      makeVenue({ id: "j", name: "Big Stadium", aliases: ["The Bowl"], locality: "Lodhi Road" }),
    );
    expect(run([v], { query: "big" })).toEqual(["j"]);
    expect(run([v], { query: "BOWL" })).toEqual(["j"]);
    expect(run([v], { query: "lodhi-road" })).toEqual(["j"]);
    expect(run([v], { query: "stadium lodhi" })).toEqual(["j"]);
    expect(run([v], { query: "dwarka" })).toEqual([]);
    expect(run([v], { query: "Lódhi" })).toEqual(["j"]); // accents ignored
  });
});

describe("activeFilterCount", () => {
  it("counts toggles and selected surfaces, not the search query", () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(
      activeFilterCount({
        ...EMPTY_FILTERS,
        query: "x",
        openNow: true,
        surfaces: ["grass", "mud"],
      }),
    ).toBe(3);
  });
});
