import { describe, expect, it } from "vitest";
import { directionsUrl, distanceKm, formatDistance } from "@/lib/geo";

describe("distanceKm", () => {
  it("is zero for the same point", () => {
    expect(distanceKm({ lat: 28.6, lng: 77.2 }, { lat: 28.6, lng: 77.2 })).toBe(0);
  });

  it("matches a known distance (0.1° latitude ≈ 11.1 km)", () => {
    expect(distanceKm({ lat: 28.6, lng: 77.2 }, { lat: 28.7, lng: 77.2 })).toBeCloseTo(11.12, 1);
  });

  it("is symmetric", () => {
    const a = { lat: 28.55, lng: 77.05 };
    const b = { lat: 28.7, lng: 77.1 };
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 10);
  });
});

describe("formatDistance", () => {
  it("uses metres under 1 km, rounded to 10 m", () => {
    expect(formatDistance(0.853)).toBe("850 m");
  });
  it("uses one decimal under 10 km", () => {
    expect(formatDistance(4.24)).toBe("4.2 km");
  });
  it("rounds to whole km from 10 km", () => {
    expect(formatDistance(18.4)).toBe("18 km");
  });
});

describe("directionsUrl", () => {
  it("builds a Google Maps directions link", () => {
    expect(directionsUrl({ lat: 28.59, lng: 77.23 })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=28.59,77.23",
    );
  });
});
