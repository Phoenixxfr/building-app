import { useEffect, useRef, useState } from "react";
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
} from "./model/types";
import {
  drawWall,
  drawPlot,
  drawDoor,
  drawWindow,
  canvasSizeForPlot,
  distanceToWall,
  distanceToOpening,
  PIXELS_PER_FOOT,
} from "./draw";

/** What's currently selected on the canvas, if anything. */
type Selection =
  | { type: "wall"; id: string }
  | { type: "door"; id: string }
  | { type: "window"; id: string }
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
    const [project] = useState(() => buildSampleProject());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = canvasSizeForPlot(project.plot, CANVAS_MARGIN_PX);
  const [selection, setSelection] = useState<Selection>(null);

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
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickXFt = (e.clientX - rect.left - CANVAS_MARGIN_PX) / PIXELS_PER_FOOT;
    const clickYFt = (e.clientY - rect.top - CANVAS_MARGIN_PX) / PIXELS_PER_FOOT;
    
        const clickPoint = { x: clickXFt, y: clickYFt };
    const HIT_TOLERANCE_FT = 2;

    const clickedDoor = project.doors.find((door) => {
      const hostWall = project.walls.find((w) => w.id === door.hostWallId);
      return hostWall && distanceToOpening(clickPoint, hostWall, door) < HIT_TOLERANCE_FT;
    });
    if (clickedDoor) {
      setSelection({ type: "door", id: clickedDoor.id });
      return;
    }

    const clickedWindow = project.windows.find((win) => {
      const hostWall = project.walls.find((w) => w.id === win.hostWallId);
      return hostWall && distanceToOpening(clickPoint, hostWall, win) < HIT_TOLERANCE_FT;
    });
    if (clickedWindow) {
      setSelection({ type: "window", id: clickedWindow.id });
      return;
    }

    const clickedWall = project.walls.find(
      (wall) => distanceToWall(clickPoint, wall) < HIT_TOLERANCE_FT
    );
    setSelection(clickedWall ? { type: "wall", id: clickedWall.id } : null);
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
        onClick={handleCanvasClick}
      />
                        {selectedWallLengthFt !== null && (
        <p>Selected wall length: {selectedWallLengthFt.toFixed(1)} ft</p>
      )}
      {selectedDoor && (
        <p>
          Selected door: {selectedDoor.widthFt} ft wide, {selectedDoor.heightFt} ft high
        </p>
      )}
      {selectedWindow && (
        <p>
          Selected window: {selectedWindow.widthFt} ft wide, {selectedWindow.heightFt} ft high
        </p>
      )}

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