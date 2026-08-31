/**
 * Milestone 1 — initial data model.
 *
 * This is the outermost shape of the structured building model:
 * a Project contains a Plot. Levels, Elements (walls, doors, etc.)
 * are intentionally NOT modeled yet — they come in later milestones.
 *
 * This file defines shapes only. No logic, no persistence, no UI.
 */

/** Generates a stable, unique ID for a model object. */
export function createId(): string {
  return crypto.randomUUID();
}

/**
 * The land boundary a building sits on.
 *
 * Starting with a simple rectangular plot (width x depth) rather than
 * an arbitrary polygon boundary — arbitrary boundaries can be added
 * later without breaking this shape (widthFt/depthFt can stay as a
 * convenience even after polygon support exists).
 */
export interface Plot {
  id: string;
  /** Width of the plot in feet. */
  widthFt: number;
  /** Depth of the plot in feet. */
  depthFt: number;
}

/**
 * The top-level container for a single building design.
 * Everything else in the app (levels, elements, views) will
 * eventually hang off of a Project.
 */
export interface Project {
  id: string;
  name: string;
  plot: Plot;
}

/** Creates a new Project with a given name and plot dimensions. */
export function createProject(
  name: string,
  widthFt: number,
  depthFt: number
): Project {
  return {
    id: createId(),
    name,
    plot: {
      id: createId(),
      widthFt,
      depthFt,
    },
  };
}