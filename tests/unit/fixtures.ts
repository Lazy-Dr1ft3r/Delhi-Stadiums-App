import type { VenueInput } from "@/lib/schema";

/** A minimal valid venue. Tests override fields to probe the schema. */
export function makeVenue(overrides: Partial<VenueInput> = {}): VenueInput {
  return {
    id: "test-venue",
    name: "Test Venue",
    aliases: [],
    address: "Test address",
    locality: "Test locality",
    coordinates: { lat: 28.6, lng: 77.2 },
    operator: "Other",
    facilities: [
      {
        id: "track",
        type: "running_track",
        details: { lengthMeters: 400, surface: "synthetic" },
        access: { publicEntry: "open" },
        status: { state: "open", lastVerified: "2026-01-01", source: "site_visit" },
      },
    ],
    ...overrides,
  };
}
