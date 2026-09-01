import type { Plot, Wall } from "./model/types";

/**
 * Milestone 4 (early) — first 2D drawing code.
 *
 * Kept intentionally minimal: no zoom, no pan, no selection yet.
 * Just enough to prove Walls and the Plot from the model can be
 * drawn accurately, to scale, on a canvas.
 */

/** How many pixels represent one foot. */
export const PIXELS_PER_FOOT = 5;

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