import { describe, expect, it } from "vitest";
import type { Status } from "@/lib/schema";
import {
  daysSince,
  formatAge,
  formatDate,
  getFreshness,
  getStatusDisplay,
  isCurrentlyOpen,
} from "@/lib/status";

const NOW = new Date("2026-11-25T10:00:00Z");
const status = (state: Status["state"], lastVerified: string): Status => ({
  state,
  lastVerified,
  source: "site_visit",
});

describe("daysSince", () => {
  it("counts whole calendar days in UTC", () => {
    expect(daysSince("2026-11-25", NOW)).toBe(0);
    expect(daysSince("2026-11-24", NOW)).toBe(1);
    expect(daysSince("2026-09-26", NOW)).toBe(60);
  });

  it("is not affected by time of day", () => {
    expect(daysSince("2026-11-24", new Date("2026-11-25T00:00:01Z"))).toBe(1);
    expect(daysSince("2026-11-24", new Date("2026-11-25T23:59:59Z"))).toBe(1);
  });

  it("never goes negative", () => {
    expect(daysSince("2026-11-30", NOW)).toBe(0);
  });
});

describe("getFreshness", () => {
  it("is fresh up to and including 60 days", () => {
    expect(getFreshness("2026-09-26", NOW)).toBe("fresh"); // 60 days
  });
  it("is stale from 61 to 180 days", () => {
    expect(getFreshness("2026-09-25", NOW)).toBe("stale"); // 61 days
    expect(getFreshness("2026-05-29", NOW)).toBe("stale"); // 180 days
  });
  it("is expired after 180 days", () => {
    expect(getFreshness("2026-05-28", NOW)).toBe("expired"); // 181 days
  });
});

describe("getStatusDisplay", () => {
  it("shows the recorded state with its colour when fresh", () => {
    const d = getStatusDisplay(status("open", "2026-11-20"), NOW);
    expect(d).toMatchObject({
      label: "Open",
      tone: "green",
      freshness: "fresh",
      effectiveState: "open",
    });
    expect(d.warning).toBeUndefined();
  });

  it("maps fresh states to tones", () => {
    expect(getStatusDisplay(status("closed", "2026-11-20"), NOW).tone).toBe("red");
    expect(getStatusDisplay(status("under_renovation", "2026-11-20"), NOW).tone).toBe("orange");
    expect(getStatusDisplay(status("unknown", "2026-11-20"), NOW).tone).toBe("grey");
  });

  it("goes amber with a warning when stale, keeping the recorded state", () => {
    const d = getStatusDisplay(status("open", "2026-08-15"), NOW);
    expect(d).toMatchObject({
      label: "Open",
      tone: "amber",
      freshness: "stale",
      effectiveState: "open",
    });
    expect(d.warning).toMatch(/may have changed/);
  });

  it("becomes Unknown (grey) when expired, whatever it last said", () => {
    const d = getStatusDisplay(status("open", "2026-03-01"), NOW);
    expect(d).toMatchObject({
      label: "Unknown",
      tone: "grey",
      freshness: "expired",
      effectiveState: "unknown",
      recordedState: "open",
    });
    expect(d.warning).toBe("Last confirmed open 9 months ago");
  });
});

describe("isCurrentlyOpen", () => {
  it("is true for fresh or stale open statuses", () => {
    expect(isCurrentlyOpen(status("open", "2026-11-20"), NOW)).toBe(true);
    expect(isCurrentlyOpen(status("open", "2026-08-15"), NOW)).toBe(true);
  });
  it("is false for expired open statuses and non-open states", () => {
    expect(isCurrentlyOpen(status("open", "2026-03-01"), NOW)).toBe(false);
    expect(isCurrentlyOpen(status("closed", "2026-11-20"), NOW)).toBe(false);
    expect(isCurrentlyOpen(status("unknown", "2026-11-20"), NOW)).toBe(false);
  });
});

describe("formatAge / formatDate", () => {
  it("formats ages", () => {
    expect(formatAge(0)).toBe("today");
    expect(formatAge(1)).toBe("yesterday");
    expect(formatAge(12)).toBe("12 days ago");
    expect(formatAge(100)).toBe("3 months ago");
    expect(formatAge(400)).toBe("1 year ago");
    expect(formatAge(800)).toBe("2 years ago");
  });
  it("formats ISO dates without timezone drift", () => {
    expect(formatDate("2026-11-01")).toBe("1 Nov 2026");
  });
});
