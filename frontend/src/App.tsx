import { useEffect, useRef } from "react";
import {
  createProject,
  createLevel,
  addLevel,
  createWall,
  addWall,
  createDoor,
  addDoor,
} from "./model/types";
import { drawWall, drawPlot, drawDoor, canvasSizeForPlot } from "./draw";

/**
 * Milestone 1 demo (data) + first 2D drawing (Milestone 4, early).
 *
 * Builds one sample project (with a level, two walls, and a door),
 * prints its JSON, and draws the plot boundary + walls + door on a
 * canvas sized to fit the plot. No zoom, no pan, no selection yet —
 * just proof the model's data can be rendered visually, to scale.
 */
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

  const door = createDoor(wall1.id, 15, 3, 7);
  project = addDoor(project, door);

  return project;
}

function App() {
  const project = buildSampleProject();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = canvasSizeForPlot(project.plot, CANVAS_MARGIN_PX);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any transform from a previous run
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(CANVAS_MARGIN_PX, CANVAS_MARGIN_PX);

    drawPlot(ctx, project.plot);

        for (const wall of project.walls) {
      const wallDoors = project.doors.filter((d) => d.hostWallId === wall.id);
      drawWall(ctx, wall, wallDoors);
    }

    for (const door of project.doors) {
      const hostWall = project.walls.find((w) => w.id === door.hostWallId);
      if (hostWall) {
        drawDoor(ctx, door, hostWall);
      }
    }
  }, [project]);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Building Model — Demo</h1>

      <p>
        The sample project's plot boundary, walls (dark), and door
        (blue), drawn to scale:
      </p>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#f5f5f5", border: "1px solid #ccc" }}
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