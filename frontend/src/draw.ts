import type { Door, Plot, Point, Wall } from "./model/types";

/**
 * Milestone 4 (early) — first 2D drawing code.
 *
 * Kept intentionally minimal: no zoom, no pan, no selection yet.
 * Just enough to prove Walls, Doors, and the Plot from the model can
 * be drawn accurately, to scale, on a canvas.
 */

/** How many pixels represent one foot. */
export const PIXELS_PER_FOOT = 5;

/** Converts a value in feet to pixels, using the fixed scale above. */
export function feetToPixels(feet: number): number {
  return feet * PIXELS_PER_FOOT;
}

/**
 * Given a wall and the doors hosted on it, returns the solid parts of
 * the wall's centerline as start/end segments, with a gap left open
 * wherever each door sits (so the wall reads as having an opening,
 * like a real floor plan, instead of drawing straight through doors).
 *
 * Doors are expected to be pre-filtered to the ones hosted on this
 * wall — this function does not check hostWallId itself, since that
 * filtering already lives at the call site (App.tsx).
 */
export function wallSegmentsWithOpenings(
  wall: Wall,
  doors: Door[]
): { start: Point; end: Point }[] {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0 || doors.length === 0) {
    return [{ start: wall.start, end: wall.end }];
  }

  // Each door's gap along the wall, as a [fromFt, toFt] range, sorted
  // by position so segments can be built left-to-right.
  const gaps = doors
    .map((door) => {
      const halfWidthFt = door.widthFt / 2;
      return {
        fromFt: door.positionFt - halfWidthFt,
        toFt: door.positionFt + halfWidthFt,
      };
    })
    .sort((a, b) => a.fromFt - b.fromFt);

  const segments: { start: Point; end: Point }[] = [];
  let cursorFt = 0;

  for (const gap of gaps) {
    if (gap.fromFt > cursorFt) {
      segments.push({
        start: pointAlongWall(wall, cursorFt),
        end: pointAlongWall(wall, gap.fromFt),
      });
    }
    cursorFt = Math.max(cursorFt, gap.toFt);
  }

  if (cursorFt < length) {
    segments.push({
      start: pointAlongWall(wall, cursorFt),
      end: pointAlongWall(wall, length),
    });
  }

  return segments;
}

/**
 * Draws a wall's centerline onto a canvas 2D context. If doors hosted
 * on this wall are passed, a gap is left open at each door's position
 * instead of drawing straight through it.
 */
export function drawWall(
  ctx: CanvasRenderingContext2D,
  wall: Wall,
  doors: Door[] = []
): void {
  const segments = wallSegmentsWithOpenings(wall, doors);

  ctx.lineWidth = Math.max(1, feetToPixels(wall.thicknessFt));
  ctx.strokeStyle = "#333";

  for (const segment of segments) {
    ctx.beginPath();
    ctx.moveTo(feetToPixels(segment.start.x), feetToPixels(segment.start.y));
    ctx.lineTo(feetToPixels(segment.end.x), feetToPixels(segment.end.y));
    ctx.stroke();
  }
}

/**
 * Draws the plot boundary as a rectangle from (0,0) to
 * (widthFt, depthFt), as a light outline so it reads as context
 * rather than competing visually with walls.
 */
export function drawPlot(ctx: CanvasRenderingContext2D, plot: Plot): void {
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, feetToPixels(plot.widthFt), feetToPixels(plot.depthFt));
}

/** Pixel size of the canvas needed to fit a plot, plus a margin on each side. */
export function canvasSizeForPlot(
  plot: Plot,
  marginPx: number
): { width: number; height: number } {
  return {
    width: feetToPixels(plot.widthFt) + marginPx * 2,
    height: feetToPixels(plot.depthFt) + marginPx * 2,
  };
}

/**
 * Returns the point along a wall's centerline at the given distance
 * (in feet) from its start. Used to place a door on its host wall.
 *
 * Does not clamp positionFt to the wall's actual length — callers are
 * expected to pass a sensible value; validation belongs to a later
 * milestone (Milestone 9), not to drawing code.
 */
export function pointAlongWall(wall: Wall, positionFt: number): Point {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return { x: wall.start.x, y: wall.start.y };
  }

  const t = positionFt / length;
  return {
    x: wall.start.x + dx * t,
    y: wall.start.y + dy * t,
  };
}

/**
 * Draws a door as a short blue segment centered on its position along
 * the host wall's centerline, so it's visually distinct from the wall
 * itself. Does not yet draw a swing arc or opening gap in the wall —
 * that's a later refinement once wall-opening geometry exists.
 */
export function drawDoor(
  ctx: CanvasRenderingContext2D,
  door: Door,
  hostWall: Wall
): void {
  const center = pointAlongWall(hostWall, door.positionFt);
  const dx = hostWall.end.x - hostWall.start.x;
  const dy = hostWall.end.y - hostWall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const halfWidthFt = door.widthFt / 2;
  const ux = dx / length;
  const uy = dy / length;

  const start: Point = {
    x: center.x - ux * halfWidthFt,
    y: center.y - uy * halfWidthFt,
  };
  const end: Point = {
    x: center.x + ux * halfWidthFt,
    y: center.y + uy * halfWidthFt,
  };

  ctx.beginPath();
  ctx.moveTo(feetToPixels(start.x), feetToPixels(start.y));
  ctx.lineTo(feetToPixels(end.x), feetToPixels(end.y));
  ctx.lineWidth = Math.max(2, feetToPixels(hostWall.thicknessFt));
  ctx.strokeStyle = "#2563eb";
  ctx.stroke();
}