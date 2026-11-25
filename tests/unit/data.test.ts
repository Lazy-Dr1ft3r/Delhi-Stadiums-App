import { describe, expect, it } from "vitest";
import { parseVenueFile, validateVenueDir } from "@/lib/data";
import { makeVenue } from "./fixtures";

describe("parseVenueFile", () => {
  it("accepts a valid venue whose id matches the file name", () => {
    const { venue, errors } = parseVenueFile("test-venue.json", JSON.stringify(makeVenue()));
    expect(errors).toEqual([]);
    expect(venue?.id).toBe("test-venue");
  });

  it("rejects an id that does not match the file name", () => {
    const { errors } = parseVenueFile("other-name.json", JSON.stringify(makeVenue()));
    expect(errors[0]?.message).toMatch(/must match file name/);
  });

  it("reports invalid JSON", () => {
    const { errors } = parseVenueFile("bad.json", "{ not json");
    expect(errors[0]?.message).toMatch(/invalid JSON/);
  });

  it("reports the path of a schema error", () => {
    const raw = JSON.stringify(makeVenue({ operator: "Nobody" as never }));
    const { errors } = parseVenueFile("test-venue.json", raw);
    expect(errors[0]?.message).toMatch(/^operator:/);
  });
});

describe("data/venues", () => {
  it("every committed venue file is valid", () => {
    const { venues, errors } = validateVenueDir();
    expect(errors).toEqual([]);
    expect(venues.length).toBeGreaterThan(0);
  });
});
