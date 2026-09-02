import { describe, it, expect } from "vitest";
import {
  createProject,
  createLevel,
  addLevel,
  createWall,
  addWall,
  createDoor,
  addDoor,
  createWindow,
  addWindow,
} from "./types";

describe("createProject", () => {
  it("creates a project with the given name and plot dimensions", () => {
    const project = createProject("My House", 60, 90);

    expect(project.name).toBe("My House");
    expect(project.plot.widthFt).toBe(60);
    expect(project.plot.depthFt).toBe(90);
  });

  it("starts with no levels, walls, or doors", () => {
    const project = createProject("My House", 60, 90);

    expect(project.levels).toEqual([]);
    expect(project.walls).toEqual([]);
    expect(project.doors).toEqual([]);
  });

  it("gives each project and its plot a unique id", () => {
    const a = createProject("A", 10, 10);
    const b = createProject("B", 10, 10);

    expect(a.id).not.toBe(b.id);
    expect(a.plot.id).not.toBe(b.plot.id);
  });
});

describe("addLevel", () => {
  it("returns a new project with the level appended", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);

    const updated = addLevel(project, level);

    expect(updated.levels).toEqual([level]);
  });

  it("does not mutate the original project", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);

    addLevel(project, level);

    expect(project.levels).toEqual([]);
  });
});

describe("addWall", () => {
  it("returns a new project with the wall appended", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(
      level.id,
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      10,
      0.5
    );

    const updated = addWall(project, wall);

    expect(updated.walls).toEqual([wall]);
  });

  it("does not mutate the original project", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(
      level.id,
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      10,
      0.5
    );

    addWall(project, wall);

    expect(project.walls).toEqual([]);
  });
});

describe("addDoor", () => {
  it("returns a new project with the door appended", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(
      level.id,
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      10,
      0.5
    );
    const door = createDoor(wall.id, 5, 3, 7, "left");

    const updated = addDoor(project, door);

    expect(updated.doors).toEqual([door]);
  });

  it("does not mutate the original project", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(
      level.id,
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      10,
      0.5
    );
    const door = createDoor(wall.id, 5, 3, 7, "left");

    addDoor(project, door);

    expect(project.doors).toEqual([]);
  });
});

describe("addWindow", () => {
  it("returns a new project with the window appended", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(level.id, { x: 0, y: 0 }, { x: 20, y: 0 }, 10, 0.5);
    const win = createWindow(wall.id, 5, 3, 4);

    const updated = addWindow(project, win);

    expect(updated.windows).toEqual([win]);
  });
});