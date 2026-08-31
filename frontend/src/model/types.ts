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
 * A floor/storey of a building (e.g. "Ground Floor", "First Floor").
 *
 * Intentionally minimal for now — no reference to walls or other
 * elements yet, since those don't exist as a concept in the model
 * until a later milestone.
 */
export interface Level {
  id: string;
  name: string;
  /** Height of this level above the plot's ground reference, in feet. */
  elevationFt: number;
}

/** A 2D point in feet, used for wall endpoints. */
export interface Point {
  x: number;
  y: number;
}

/**
 * A wall, defined by its centerline (start -> end), height, and thickness.
 *
 * References its Level by ID (levelId) rather than nesting the Level
 * object, to avoid duplicated/out-of-sync data.
 *
 * Intentionally does NOT reference doors/windows/materials yet — those
 * concepts don't exist in the model until later milestones.
 */
export interface Wall {
  id: string;
  levelId: string;
  start: Point;
  end: Point;
  heightFt: number;
  thicknessFt: number;
}

/**
 * The top-level container for a single building design.
 * Everything else in the app (elements, views) will
 * eventually hang off of a Project via its levels and walls.
 */
export interface Project {
  id: string;
  name: string;
  plot: Plot;
  levels: Level[];
  walls: Wall[];
}

/** Creates a new Project with a given name and plot dimensions. Starts with no levels or walls. */
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
    levels: [],
    walls: [],
  };
}

/** Creates a new Level with a given name and elevation. */
export function createLevel(name: string, elevationFt: number): Level {
  return {
    id: createId(),
    name,
    elevationFt,
  };
}

/** Returns a new Project with the given level appended (does not mutate the original). */
export function addLevel(project: Project, level: Level): Project {
  return {
    ...project,
    levels: [...project.levels, level],
  };
}

/** Creates a new Wall on the given level, from start to end, with the given height/thickness. */
export function createWall(
  levelId: string,
  start: Point,
  end: Point,
  heightFt: number,
  thicknessFt: number
): Wall {
  return {
    id: createId(),
    levelId,
    start,
    end,
    heightFt,
    thicknessFt,
  };
}

/** Returns a new Project with the given wall appended (does not mutate the original). */
export function addWall(project: Project, wall: Wall): Project {
  return {
    ...project,
    walls: [...project.walls, wall],
  };
}