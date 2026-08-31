import type { Wall } from "./model/types";

/**
 * Milestone 4 (early) — first 2D drawing code.
 *
 * Kept intentionally minimal: no zoom, no pan, no selection, no
 * multiple walls yet. Just enough to prove a Wall from the model
 * can be drawn accurately on a canvas.
 */

/** How many pixels represent one foot. */
export const PIXELS_PER_FOOT = 10;

/** Converts a value in feet to pixels, using the fixed scale above. */
export function feetToPixels(feet: number): number {
  return feet * PIXELS_PER_FOOT;
}

/** Draws a single wall's centerline onto a canvas 2D context. */
export function drawWall(ctx: CanvasRenderingContext2D, wall: Wall): void {
  ctx.beginPath();
  ctx.moveTo(feetToPixels(wall.start.x), feetToPixels(wall.start.y));
  ctx.lineTo(feetToPixels(wall.end.x), feetToPixels(wall.end.y));
  ctx.lineWidth = Math.max(1, feetToPixels(wall.thicknessFt));
  ctx.strokeStyle = "#333";
  ctx.stroke();
}