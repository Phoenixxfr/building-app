import { describe, it, expect } from "vitest";
import { feetToPixels, PIXELS_PER_FOOT, canvasSizeForPlot } from "./draw";

describe("feetToPixels", () => {
  it("converts 0 feet to 0 pixels", () => {
    expect(feetToPixels(0)).toBe(0);
  });

  it("scales by PIXELS_PER_FOOT", () => {
    expect(feetToPixels(1)).toBe(PIXELS_PER_FOOT);
    expect(feetToPixels(20)).toBe(20 * PIXELS_PER_FOOT);
  });
});

describe("canvasSizeForPlot", () => {
  it("converts plot dimensions to pixels and adds margin on both sides", () => {
    const plot = { id: "p1", widthFt: 60, depthFt: 90 };

    const size = canvasSizeForPlot(plot, 20);

    expect(size.width).toBe(60 * PIXELS_PER_FOOT + 40);
    expect(size.height).toBe(90 * PIXELS_PER_FOOT + 40);
  });
});