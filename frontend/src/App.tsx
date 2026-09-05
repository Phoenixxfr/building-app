import { useEffect, useRef, useState } from "react";
import type { Point } from "./model/types";
import {
  createProject,
  createLevel,
  addLevel,
  createWall,
  addWall,
  removeWall,
  updateWall,
  createDoor,
  addDoor,
  removeDoor,
  updateDoorPosition,
  createWindow,
  addWindow,
  removeWindow,
  updateWindowPosition,
} from "./model/types";
import {
  drawWall,
  drawPlot,
  drawDoor,
  drawWindow,
  canvasSizeForPlot,
  distanceToWall,
  distanceToOpening,
  positionFtAlongWall,
  PIXELS_PER_FOOT,
} from "./draw";

/** What's currently selected on the canvas, if anything. */
type Selection =
  | { type: "wall"; id: string }
  | { type: "door"; id: string }
  | { type: "window"; id: string }
  | null;

/** In-progress drag, tracked in a ref so mousemove handlers stay cheap. */
type DragState =
  | { kind: "wall"; id: string; startClientX: number; startClientY: number; originalStart: Point; originalEnd: Point }
  | { kind: "door" | "window"; id: string; hostWallId: string }
  | null;

const CANVAS_MARGIN_PX = 20;

function buildSampleProject() {
  let project = createProject("Sample House", 60, 90);

  const groundFloor = createLevel("Ground Floor", 0);
  project = addLevel(project, groundFloor);

  const wall1 = createWall(
    groundFloor.id,
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    10,
    0.5
  );
  project = addWall(project, wall1);

  const wall2 = createWall(
    groundFloor.id,
    { x: 20, y: 0 },
    { x: 20, y: 15 },
    10,
    0.5
  );
  project = addWall(project, wall2);

  const door = createDoor(wall1.id, 15, 3, 7, "left");
  project = addDoor(project, door);

  const win = createWindow(wall2.id, 7, 4, 4);
  project = addWindow(project, win);

  return project;
}

function App() {
  const [project, setProject] = useState(() => buildSampleProject());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState>(null);
  const canvasSize = canvasSizeForPlot(project.plot, CANVAS_MARGIN_PX);
  const [selection, setSelection] = useState<Selection>(null);

  const [startX, setStartX] = useState("0");
  const [startY, setStartY] = useState("0");
  const [endX, setEndX] = useState("0");
  const [endY, setEndY] = useState("0");
  const [heightFt, setHeightFt] = useState("10");
  const [thicknessFt, setThicknessFt] = useState("0.5");

  const [doorPositionFt, setDoorPositionFt] = useState("5");
  const [doorWidthFt, setDoorWidthFt] = useState("3");
  const [doorHeightFt, setDoorHeightFt] = useState("7");
  const [doorSwing, setDoorSwing] = useState<"left" | "right">("left");

  const [winPositionFt, setWinPositionFt] = useState("5");
  const [winWidthFt, setWinWidthFt] = useState("3");
  const [winHeightFt, setWinHeightFt] = useState("4");

  function handleAddWall(e: React.FormEvent) {
    e.preventDefault();

    const parsed = {
      startX: parseFloat(startX),
      startY: parseFloat(startY),
      endX: parseFloat(endX),
      endY: parseFloat(endY),
      heightFt: parseFloat(heightFt),
      thicknessFt: parseFloat(thicknessFt),
    };

    const allValid = Object.values(parsed).every((n) => Number.isFinite(n));
    if (!allValid || parsed.heightFt <= 0 || parsed.thicknessFt <= 0) {
      alert("Please enter valid numbers (height and thickness must be positive).");
      return;
    }

    const level = project.levels[0];
    if (!level) {
      alert("No level exists to add a wall to.");
      return;
    }

    const newWall = createWall(
      level.id,
      { x: parsed.startX, y: parsed.startY },
      { x: parsed.endX, y: parsed.endY },
      parsed.heightFt,
      parsed.thicknessFt
    );
    setProject((p) => addWall(p, newWall));
  }

  function handleDeleteWall() {
    if (selection?.type !== "wall") return;
    setProject((p) => removeWall(p, selection.id));
    setSelection(null);
  }

  function handleDeleteDoor() {
    if (selection?.type !== "door") return;
    setProject((p) => removeDoor(p, selection.id));
    setSelection(null);
  }

  function handleDeleteWindow() {
    if (selection?.type !== "window") return;
    setProject((p) => removeWindow(p, selection.id));
    setSelection(null);
  }

  function handleAddDoor(e: React.FormEvent) {
    e.preventDefault();
    if (selection?.type !== "wall") return;

    const positionFt = parseFloat(doorPositionFt);
    const widthFt = parseFloat(doorWidthFt);
    const doorHeight = parseFloat(doorHeightFt);
    if (![positionFt, widthFt, doorHeight].every(Number.isFinite) || widthFt <= 0 || doorHeight <= 0) {
      alert("Please enter valid numbers for the door.");
      return;
    }

    const newDoor = createDoor(selection.id, positionFt, widthFt, doorHeight, doorSwing);
    setProject((p) => addDoor(p, newDoor));
  }

  function handleAddWindow(e: React.FormEvent) {
    e.preventDefault();
    if (selection?.type !== "wall") return;

    const positionFt = parseFloat(winPositionFt);
    const widthFt = parseFloat(winWidthFt);
    const winHeight = parseFloat(winHeightFt);
    if (![positionFt, widthFt, winHeight].every(Number.isFinite) || widthFt <= 0 || winHeight <= 0) {
      alert("Please enter valid numbers for the window.");
      return;
    }

    const newWindow = createWindow(selection.id, positionFt, widthFt, winHeight);
    setProject((p) => addWindow(p, newWindow));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(CANVAS_MARGIN_PX, CANVAS_MARGIN_PX);

    drawPlot(ctx, project.plot);

    for (const wall of project.walls) {
      const wallDoors = project.doors.filter((d) => d.hostWallId === wall.id);
      const wallWindows = project.windows.filter((w) => w.hostWallId === wall.id);
      drawWall(ctx, wall, wallDoors, wallWindows, selection?.type === "wall" && selection.id === wall.id);
    }

    for (const door of project.doors) {
      const hostWall = project.walls.find((w) => w.id === door.hostWallId);
      if (hostWall) {
        drawDoor(ctx, door, hostWall, selection?.type === "door" && selection.id === door.id);
      }
    }

    for (const win of project.windows) {
      const hostWall = project.walls.find((w) => w.id === win.hostWallId);
      if (hostWall) {
        drawWindow(ctx, win, hostWall, selection?.type === "window" && selection.id === win.id);
      }
    }
  }, [project, selection]);

  function hitTestAt(clickPoint: { x: number; y: number }): Selection {
    const HIT_TOLERANCE_FT = 2;

    const clickedDoor = project.doors.find((door) => {
      const hostWall = project.walls.find((w) => w.id === door.hostWallId);
      return hostWall && distanceToOpening(clickPoint, hostWall, door) < HIT_TOLERANCE_FT;
    });
    if (clickedDoor) return { type: "door", id: clickedDoor.id };

    const clickedWindow = project.windows.find((win) => {
      const hostWall = project.walls.find((w) => w.id === win.hostWallId);
      return hostWall && distanceToOpening(clickPoint, hostWall, win) < HIT_TOLERANCE_FT;
    });
    if (clickedWindow) return { type: "window", id: clickedWindow.id };

    const clickedWall = project.walls.find(
      (wall) => distanceToWall(clickPoint, wall) < HIT_TOLERANCE_FT
    );
    return clickedWall ? { type: "wall", id: clickedWall.id } : null;
  }

  function clientToCanvasFt(clientX: number, clientY: number): { x: number; y: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - CANVAS_MARGIN_PX) / PIXELS_PER_FOOT,
      y: (clientY - rect.top - CANVAS_MARGIN_PX) / PIXELS_PER_FOOT,
    };
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const clickPoint = clientToCanvasFt(e.clientX, e.clientY);
    const hit = hitTestAt(clickPoint);
    setSelection(hit);

    if (hit?.type === "wall") {
      const wall = project.walls.find((w) => w.id === hit.id);
      if (wall) {
        dragRef.current = {
          kind: "wall",
          id: hit.id,
          startClientX: e.clientX,
          startClientY: e.clientY,
          originalStart: wall.start,
          originalEnd: wall.end,
        };
      }
    } else if (hit?.type === "door" || hit?.type === "window") {
      const opening =
        hit.type === "door"
          ? project.doors.find((d) => d.id === hit.id)
          : project.windows.find((w) => w.id === hit.id);
      if (opening) {
        dragRef.current = { kind: hit.type, id: hit.id, hostWallId: opening.hostWallId };
      }
    } else {
      dragRef.current = null;
    }

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  }

  function handleWindowMouseMove(e: MouseEvent) {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.kind === "wall") {
      const deltaXft = (e.clientX - drag.startClientX) / PIXELS_PER_FOOT;
      const deltaYft = (e.clientY - drag.startClientY) / PIXELS_PER_FOOT;
      const newStart = { x: drag.originalStart.x + deltaXft, y: drag.originalStart.y + deltaYft };
      const newEnd = { x: drag.originalEnd.x + deltaXft, y: drag.originalEnd.y + deltaYft };
      setProject((p) => updateWall(p, drag.id, newStart, newEnd));
      return;
    }

    // Door/window: slide along the host wall, clamped so the opening
    // stays within the wall's length.
    const hostWall = project.walls.find((w) => w.id === drag.hostWallId);
    if (!hostWall) return;

    const mousePoint = clientToCanvasFt(e.clientX, e.clientY);
    const rawPositionFt = positionFtAlongWall(mousePoint, hostWall);
    const wallLengthFt = Math.sqrt(
      Math.pow(hostWall.end.x - hostWall.start.x, 2) + Math.pow(hostWall.end.y - hostWall.start.y, 2)
    );

    const opening =
      drag.kind === "door"
        ? project.doors.find((d) => d.id === drag.id)
        : project.windows.find((w) => w.id === drag.id);
    if (!opening) return;

    const halfWidthFt = opening.widthFt / 2;
    const clampedPositionFt = Math.max(halfWidthFt, Math.min(wallLengthFt - halfWidthFt, rawPositionFt));

    if (drag.kind === "door") {
      setProject((p) => updateDoorPosition(p, drag.id, clampedPositionFt));
    } else {
      setProject((p) => updateWindowPosition(p, drag.id, clampedPositionFt));
    }
  }

  function handleWindowMouseUp() {
    dragRef.current = null;
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
  }

  const selectedWall =
    selection?.type === "wall" ? project.walls.find((w) => w.id === selection.id) : undefined;
  const selectedWallLengthFt = selectedWall
    ? Math.sqrt(
        Math.pow(selectedWall.end.x - selectedWall.start.x, 2) +
          Math.pow(selectedWall.end.y - selectedWall.start.y, 2)
      )
    : null;

  const selectedDoor =
    selection?.type === "door" ? project.doors.find((d) => d.id === selection.id) : undefined;
  const selectedWindow =
    selection?.type === "window" ? project.windows.find((w) => w.id === selection.id) : undefined;

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Building Model — Demo</h1>

      <p>Click a wall, door, or window below to select it (turns red):</p>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#f5f5f5", border: "1px solid #ccc", cursor: "pointer" }}
        onMouseDown={handleCanvasMouseDown}
      />
            {selectedWallLengthFt !== null && (
        <p>
          Selected wall length: {selectedWallLengthFt.toFixed(1)} ft{" "}
          <button onClick={handleDeleteWall}>Delete Wall</button>
        </p>
      )}
      {selectedWall && (
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <form onSubmit={handleAddDoor} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <strong>Add door on selected wall:</strong>
            <label>
              Position (ft) <input value={doorPositionFt} onChange={(e) => setDoorPositionFt(e.target.value)} size={4} />
            </label>
            <label>
              Width (ft) <input value={doorWidthFt} onChange={(e) => setDoorWidthFt(e.target.value)} size={4} />
            </label>
            <label>
              Height (ft) <input value={doorHeightFt} onChange={(e) => setDoorHeightFt(e.target.value)} size={4} />
            </label>
            <label>
              Swing{" "}
              <select value={doorSwing} onChange={(e) => setDoorSwing(e.target.value as "left" | "right")}>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </label>
            <button type="submit">Add Door</button>
          </form>

          <form onSubmit={handleAddWindow} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <strong>Add window on selected wall:</strong>
            <label>
              Position (ft) <input value={winPositionFt} onChange={(e) => setWinPositionFt(e.target.value)} size={4} />
            </label>
            <label>
              Width (ft) <input value={winWidthFt} onChange={(e) => setWinWidthFt(e.target.value)} size={4} />
            </label>
            <label>
              Height (ft) <input value={winHeightFt} onChange={(e) => setWinHeightFt(e.target.value)} size={4} />
            </label>
            <button type="submit">Add Window</button>
          </form>
        </div>
      )}
      {selectedDoor && (
        <p>
          Selected door: {selectedDoor.widthFt} ft wide, {selectedDoor.heightFt} ft high{" "}
          <button onClick={handleDeleteDoor}>Delete Door</button>
        </p>
      )}
      {selectedWindow && (
        <p>
          Selected window: {selectedWindow.widthFt} ft wide, {selectedWindow.heightFt} ft high{" "}
          <button onClick={handleDeleteWindow}>Delete Window</button>
        </p>
      )}

      <h2>Add a wall</h2>
      <form onSubmit={handleAddWall} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <label>
          Start X <input value={startX} onChange={(e) => setStartX(e.target.value)} size={4} />
        </label>
        <label>
          Start Y <input value={startY} onChange={(e) => setStartY(e.target.value)} size={4} />
        </label>
        <label>
          End X <input value={endX} onChange={(e) => setEndX(e.target.value)} size={4} />
        </label>
        <label>
          End Y <input value={endY} onChange={(e) => setEndY(e.target.value)} size={4} />
        </label>
        <label>
          Height (ft) <input value={heightFt} onChange={(e) => setHeightFt(e.target.value)} size={4} />
        </label>
        <label>
          Thickness (ft) <input value={thicknessFt} onChange={(e) => setThicknessFt(e.target.value)} size={4} />
        </label>
        <button type="submit">Add Wall</button>
      </form>

      <p>Same project, as JSON:</p>
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: "1rem",
          borderRadius: "8px",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(project, null, 2)}
      </pre>
    </div>
  );
}

export default App;