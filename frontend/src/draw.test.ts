import { describe, it, expect } from "vitest";
import {
  feetToPixels,
  PIXELS_PER_FOOT,
  canvasSizeForPlot,
  pointAlongWall,
  wallSegmentsWithOpenings,
} from "./draw";

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

describe("pointAlongWall", () => {
  it("returns the start point at positionFt 0", () => {
    const wall = {
      id: "w1",
      levelId: "l1",
      start: { x: 0, y: 0 },
      end: { x: 20, y: 0 },
      heightFt: 10,
      thicknessFt: 0.5,
    };

    expect(pointAlongWall(wall, 0)).toEqual({ x: 0, y: 0 });
  });

  it("returns the midpoint at half the wall's length", () => {
    const wall = {
      id: "w1",
      levelId: "l1",
      start: { x: 0, y: 0 },
      end: { x: 20, y: 0 },
      heightFt: 10,
      thicknessFt: 0.5,
    };

    expect(pointAlongWall(wall, 10)).toEqual({ x: 10, y: 0 });
  });

  it("works for diagonal walls", () => {
    const wall = {
      id: "w1",
      levelId: "l1",
      start: { x: 0, y: 0 },
      end: { x: 3, y: 4 }, // length 5 (3-4-5 triangle)
      heightFt: 10,
      thicknessFt: 0.5,
    };

    const point = pointAlongWall(wall, 2.5); // halfway along
    expect(point.x).toBeCloseTo(1.5);
    expect(point.y).toBeCloseTo(2);
  });
});

describe("wallSegmentsWithOpenings", () => {
  const wall = {
    id: "w1",
    levelId: "l1",
    start: { x: 0, y: 0 },
    end: { x: 20, y: 0 },
    heightFt: 10,
    thicknessFt: 0.5,
  };

  it("returns one segment spanning the whole wall when there are no doors", () => {
    const segments = wallSegmentsWithOpenings(wall, []);

    expect(segments).toEqual([{ start: wall.start, end: wall.end }]);
  });

  it("splits into two segments around a door in the middle", () => {
    const door = {
      id: "d1",
      hostWallId: "w1",
      positionFt: 10,
      widthFt: 4,
      heightFt: 7,
    };

    const segments = wallSegmentsWithOpenings(wall, [door]);

    expect(segments).toEqual([
      { start: { x: 0, y: 0 }, end: { x: 8, y: 0 } },
      { start: { x: 12, y: 0 }, end: { x: 20, y: 0 } },
    ]);
  });

  it("omits the segment entirely when a door is flush with the wall's start", () => {
    const door = {
      id: "d1",
      hostWallId: "w1",
      positionFt: 2,
      widthFt: 4,
      heightFt: 7,
    };

    const segments = wallSegmentsWithOpenings(wall, [door]);

    // gap covers [0, 4], so only the far segment remains
    expect(segments).toEqual([{ start: { x: 4, y: 0 }, end: { x: 20, y: 0 } }]);
  });
});