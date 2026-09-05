import { describe, it, expect } from "vitest";
import {
  createProject,
  createLevel,
  addLevel,
  createWall,
  addWall,
  removeWall,
  createDoor,
  addDoor,
  removeDoor,
  createWindow,
  addWindow,
  removeWindow,
  createRoom,
  addRoom
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

describe("removeWall", () => {
  it("removes the wall and returns a new project", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall1 = createWall(level.id, { x: 0, y: 0 }, { x: 20, y: 0 }, 10, 0.5);
    const wall2 = createWall(level.id, { x: 20, y: 0 }, { x: 20, y: 15 }, 10, 0.5);
    let updated = addWall(project, wall1);
    updated = addWall(updated, wall2);

    updated = removeWall(updated, wall1.id);

    expect(updated.walls).toEqual([wall2]);
  });

  it("also removes doors and windows hosted on the removed wall", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(level.id, { x: 0, y: 0 }, { x: 20, y: 0 }, 10, 0.5);
    const door = createDoor(wall.id, 5, 3, 7, "left");
    const win = createWindow(wall.id, 10, 4, 4);

    let updated = addWall(project, wall);
    updated = addDoor(updated, door);
    updated = addWindow(updated, win);

    updated = removeWall(updated, wall.id);

    expect(updated.walls).toEqual([]);
    expect(updated.doors).toEqual([]);
    expect(updated.windows).toEqual([]);
  });

  it("does not mutate the original project", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(level.id, { x: 0, y: 0 }, { x: 20, y: 0 }, 10, 0.5);
    const updated = addWall(project, wall);

    removeWall(updated, wall.id);

    expect(updated.walls).toEqual([wall]);
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

describe("removeDoor", () => {
  it("removes the door and returns a new project", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(level.id, { x: 0, y: 0 }, { x: 20, y: 0 }, 10, 0.5);
    const door = createDoor(wall.id, 5, 3, 7, "left");
    const updated = addDoor(project, door);

    const result = removeDoor(updated, door.id);

    expect(result.doors).toEqual([]);
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
describe("removeWindow", () => {
  it("removes the window and returns a new project", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(level.id, { x: 0, y: 0 }, { x: 20, y: 0 }, 10, 0.5);
    const win = createWindow(wall.id, 5, 3, 4);
    const updated = addWindow(project, win);

    const result = removeWindow(updated, win.id);

    expect(result.windows).toEqual([]);
  });
});
describe("addRoom", () => {
  it("returns a new project with the room appended", () => {
    const project = createProject("My House", 60, 90);
    const level = createLevel("Ground Floor", 0);
    const wall = createWall(level.id, { x: 0, y: 0 }, { x: 20, y: 0 }, 10, 0.5);
    const room = createRoom("Living Room", [wall.id]);
    const updated = addRoom(project, room);
    expect(updated.rooms).toEqual([room]);
  });
});