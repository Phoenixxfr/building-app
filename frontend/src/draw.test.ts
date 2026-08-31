import { describe, it, expect } from "vitest";
import { feetToPixels, PIXELS_PER_FOOT } from "./draw";

describe("feetToPixels", () => {
  it("converts 0 feet to 0 pixels", () => {
    expect(feetToPixels(0)).toBe(0);
  });

  it("scales by PIXELS_PER_FOOT", () => {
    expect(feetToPixels(1)).toBe(PIXELS_PER_FOOT);
    expect(feetToPixels(20)).toBe(20 * PIXELS_PER_FOOT);
  });
});