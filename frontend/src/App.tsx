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
  PIXELS_PER_FOOT,
} from "./draw";

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
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);

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
      drawWall(ctx, wall, wallDoors, wallWindows, wall.id === selectedWallId);
    }

    for (const door of project.doors) {
      const hostWall = project.walls.find((w) => w.id === door.hostWallId);
      if (hostWall) {
        drawDoor(ctx, door, hostWall);
      }
    }

    for (const win of project.windows) {
      const hostWall = project.walls.find((w) => w.id === win.hostWallId);
      if (hostWall) {
        drawWindow(ctx, win, hostWall);
      }
    }
  }, [project, selectedWallId]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickXFt = (e.clientX - rect.left - CANVAS_MARGIN_PX) / PIXELS_PER_FOOT;
    const clickYFt = (e.clientY - rect.top - CANVAS_MARGIN_PX) / PIXELS_PER_FOOT;
    
    const clicked = project.walls.find(
      (wall) => distanceToWall({ x: clickXFt, y: clickYFt }, wall) < 2
    );
    setSelectedWallId(clicked ? clicked.id : null);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Building Model — Demo</h1>

      <p>Click a wall below to select it (turns red):</p>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#f5f5f5", border: "1px solid #ccc", cursor: "pointer" }}
        onClick={handleCanvasClick}
      />

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