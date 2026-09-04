import type { Door, Plot, Point, Wall, Window } from "./model/types";

/** Minimal shape needed to treat something as an opening in a wall. */
type Opening = { positionFt: number; widthFt: number };

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
  openings: Opening[]
): { start: Point; end: Point }[] {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0 || openings.length === 0) {
    return [{ start: wall.start, end: wall.end }];
  }

  // Each opening's gap along the wall, as a [fromFt, toFt] range,
  // sorted by position so segments can be built left-to-right.
  const gaps = openings
    .map((opening) => {
      const halfWidthFt = opening.widthFt / 2;
      return {
        fromFt: opening.positionFt - halfWidthFt,
        toFt: opening.positionFt + halfWidthFt,
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
  doors: Door[] = [],
  windows: Window[] = [],
  isSelected: boolean = false
): void {
  const segments = wallSegmentsWithOpenings(wall, [...doors, ...windows]);

  ctx.lineWidth = Math.max(1, feetToPixels(wall.thicknessFt));
  ctx.strokeStyle = isSelected ? "#dc2626" : "#333";

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
 * Returns the angle (in radians) of a wall's direction, from its
 * start point to its end point. Used to orient the door panel so it
 * sits flush with the wall regardless of the wall's angle.
 */
export function wallAngleRadians(wall: Wall): number {
  return Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
}

/**
 * Draws a door as a filled panel sitting in its opening — a rectangle
 * the width of the door and the thickness of the host wall, rotated
 * to match the wall's angle. This represents a closed door leaf
 * filling the gap left in the wall by wallSegmentsWithOpenings.
 *
 * Does not yet draw a swing arc showing which way the door opens —
 * that's a further refinement, and needs a swingDirection field on
 * Door that doesn't exist yet.
 */
export function drawDoor(
  ctx: CanvasRenderingContext2D,
  door: Door,
  hostWall: Wall,
  isSelected: boolean = false
): void {
  const center = pointAlongWall(hostWall, door.positionFt);
  const angle = wallAngleRadians(hostWall);
  const widthPx = feetToPixels(door.widthFt);
  const thicknessPx = Math.max(2, feetToPixels(hostWall.thicknessFt));

  ctx.save();
  ctx.translate(feetToPixels(center.x), feetToPixels(center.y));
  ctx.rotate(angle);

  ctx.fillStyle = "#dbeafe"; // light blue panel fill
  ctx.strokeStyle = isSelected ? "#dc2626" : "#2563eb"; // red when selected, else blue
  ctx.lineWidth = 1;
  ctx.fillRect(-widthPx / 2, -thicknessPx / 2, widthPx, thicknessPx);
  ctx.strokeRect(-widthPx / 2, -thicknessPx / 2, widthPx, thicknessPx);

  // Swing arc: quarter circle from the hinge (one jamb) showing the
  // door's open position, on whichever side it swings toward.
  const hingeX = -widthPx / 2;
  const sign = door.swingDirection === "left" ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(hingeX, sign * (thicknessPx / 2));
  ctx.arc(
    hingeX,
    sign * (thicknessPx / 2),
    widthPx,
    sign > 0 ? -Math.PI / 2 : 0,
    sign > 0 ? 0 : Math.PI / 2
  );
  ctx.strokeStyle = "#93c5fd"; // lighter blue, arc reads as secondary to the panel
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a window as a thin line across its opening in the wall
 * (representing glass), rotated to match the wall's angle. Simpler
 * than a door — no panel, no swing.
 */
export function drawWindow(
  ctx: CanvasRenderingContext2D,
  win: Window,
  hostWall: Wall,
  isSelected: boolean = false
): void {
  const center = pointAlongWall(hostWall, win.positionFt);
  const angle = wallAngleRadians(hostWall);
  const widthPx = feetToPixels(win.widthFt);

  ctx.save();
  ctx.translate(feetToPixels(center.x), feetToPixels(center.y));
  ctx.rotate(angle);

  ctx.strokeStyle = isSelected ? "#dc2626" : "#0ea5e9"; // red when selected, else sky blue
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-widthPx / 2, 0);
  ctx.lineTo(widthPx / 2, 0);
  ctx.stroke();

  ctx.restore();
}
/**
 * Shortest distance (in feet) from a point to a door/window's opening
 * on its host wall. The opening is treated as a segment of length
 * widthFt centered at positionFt along the wall, oriented with the
 * wall (same projection approach as distanceToWall).
 */
export function distanceToOpening(point: Point, hostWall: Wall, opening: Opening): number {
  const center = pointAlongWall(hostWall, opening.positionFt);
  const angle = wallAngleRadians(hostWall);

  // Project the click point into the wall's local frame (centered on
  // the opening), so the opening's half-width becomes a simple range
  // check along the local x-axis, and perpendicular offset is local y.
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const localX = dx * Math.cos(angle) + dy * Math.sin(angle);
  const localY = -dx * Math.sin(angle) + dy * Math.cos(angle);

  const halfWidth = opening.widthFt / 2;
  const clampedX = Math.max(-halfWidth, Math.min(halfWidth, localX));
  const ddx = localX - clampedX;
  const ddy = localY;
  return Math.sqrt(ddx * ddx + ddy * ddy);
}

/**
 * Shortest distance (in feet) from a point to a wall's centerline
 * segment. Used for click-to-select hit testing.
 */
export function distanceToWall(point: Point, wall: Wall): number {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const ddx = point.x - wall.start.x;
    const ddy = point.y - wall.start.y;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  }

  let t = ((point.x - wall.start.x) * dx + (point.y - wall.start.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = wall.start.x + t * dx;
  const closestY = wall.start.y + t * dy;
  const ddx = point.x - closestX;
  const ddy = point.y - closestY;
  return Math.sqrt(ddx * ddx + ddy * ddy);
}