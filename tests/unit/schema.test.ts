import { describe, expect, it } from "vitest";
import { venueSchema } from "@/lib/schema";
import { makeVenue } from "./fixtures";

const track = makeVenue().facilities[0]!;

describe("venueSchema", () => {
  it("accepts a minimal valid venue", () => {
    expect(venueSchema.safeParse(makeVenue()).success).toBe(true);
  });

  it("keeps unknown booleans undefined rather than false", () => {
    const venue = venueSchema.parse(makeVenue());
    const f = venue.facilities[0]!;
    expect(f.details.floodlights).toBeUndefined();
    expect(f.details.spikesAllowed).toBeUndefined();
    expect(f.access.coachingAvailable).toBeUndefined();
  });

  it("requires status.lastVerified", () => {
    const status: Record<string, unknown> = { ...track.status };
    delete status.lastVerified;
    const result = venueSchema.safeParse(
      makeVenue({ facilities: [{ ...track, status } as never] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a lastVerified date in the future", () => {
    const status = { ...track.status, lastVerified: "2999-01-01" };
    expect(venueSchema.safeParse(makeVenue({ facilities: [{ ...track, status }] })).success).toBe(
      false,
    );
  });

  it("rejects non-ISO dates", () => {
    const status = { ...track.status, lastVerified: "01/02/2026" };
    expect(venueSchema.safeParse(makeVenue({ facilities: [{ ...track, status }] })).success).toBe(
      false,
    );
  });

  it("rejects coordinates outside the Delhi NCR box (e.g. swapped lat/lng)", () => {
    expect(
      venueSchema.safeParse(makeVenue({ coordinates: { lat: 77.2, lng: 28.6 } })).success,
    ).toBe(false);
  });

  it("rejects unknown keys so typos fail loudly", () => {
    expect(venueSchema.safeParse({ ...makeVenue(), adress: "typo" }).success).toBe(false);
  });

  it("rejects an unsupported facility type", () => {
    const pool = { ...track, type: "pool" };
    expect(venueSchema.safeParse(makeVenue({ facilities: [pool as never] })).success).toBe(false);
  });

  it("rejects duplicate facility ids within a venue", () => {
    expect(venueSchema.safeParse(makeVenue({ facilities: [track, track] })).success).toBe(false);
  });

  it("rejects a venue with no facilities", () => {
    expect(venueSchema.safeParse(makeVenue({ facilities: [] })).success).toBe(false);
  });

  it("rejects non-slug ids", () => {
    expect(venueSchema.safeParse(makeVenue({ id: "JLN Stadium" })).success).toBe(false);
  });
});
