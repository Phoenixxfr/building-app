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
  doors: Door[];
  windows: Window[];
  rooms: Room[];
}

/** Creates a new Project with a given name and plot dimensions. Starts with no levels, walls, or doors. */
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
    doors: [],
    windows: [],
    rooms: [],
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

/**
 * A door, hosted by a wall.
 *
 * References its Wall by ID (hostWallId) rather than nesting the Wall
 * object, to avoid duplicated/out-of-sync data — same pattern as
 * Wall referencing its Level.
 *
 * positionFt is the distance along the host wall's centerline (from
 * its start point) where the door's center sits.
 *
 * swingDirection is which side of the wall the door opens toward
 * ("left" or "right" of the direction from the wall's start to end).
 * Used to draw the swing arc; does not yet model door type
 * (single/double) — that comes later.
 */
export interface Door {
  id: string;
  hostWallId: string;
  /** Distance in feet along the host wall's centerline to the door's center. */
  positionFt: number;
  widthFt: number;
  heightFt: number;
  swingDirection: "left" | "right";
}

/** Creates a new Door on the given wall, at the given position/width/height, with the given swing direction. */
export function createDoor(
  hostWallId: string,
  positionFt: number,
  widthFt: number,
  heightFt: number,
  swingDirection: "left" | "right"
): Door {
  return {
    id: createId(),
    hostWallId,
    positionFt,
    widthFt,
    heightFt,
    swingDirection,
  };
}

/** Returns a new Project with the given door appended (does not mutate the original). */
export function addDoor(project: Project, door: Door): Project {
  return {
    ...project,
    doors: [...project.doors, door],
  };
}

/** A window, hosted by a wall. Same pattern as Door, minus swing direction. */
export interface Window {
  id: string;
  hostWallId: string;
  positionFt: number;
  widthFt: number;
  heightFt: number;
}

/** Creates a new Window on the given wall, at the given position/width/height. */
export function createWindow(
  hostWallId: string,
  positionFt: number,
  widthFt: number,
  heightFt: number
): Window {
  return {
    id: createId(),
    hostWallId,
    positionFt,
    widthFt,
    heightFt,
  };
}

/** Returns a new Project with the given window appended (does not mutate the original). */
export function addWindow(project: Project, window: Window): Project {
  return {
    ...project,
    windows: [...project.windows, window],
  };
}
/**
 * A room, defined by the walls that bound it (referenced by ID, in
 * order around the boundary). Does not store its own geometry —
 * area/shape are derived from the referenced walls, not duplicated
 * here, to keep the walls as the single source of truth.
 */
export interface Room {
  id: string;
  name: string;
  wallIds: string[];
}

export function createRoom(name: string, wallIds: string[]): Room {
  return { id: createId(), name, wallIds };
}

export function addRoom(project: Project, room: Room): Project {
  return { ...project, rooms: [...project.rooms, room] };
}