import { describe, expect, it } from "vitest";
import { NOT_CONFIRMED, yesNo } from "@/lib/labels";

describe("yesNo", () => {
  it("renders unknown as Not confirmed, never No", () => {
    expect(yesNo(undefined)).toBe(NOT_CONFIRMED);
    expect(yesNo(false)).toBe("No");
    expect(yesNo(true)).toBe("Yes");
  });
});
