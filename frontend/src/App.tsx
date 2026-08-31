import { useEffect, useRef } from "react";
import {
  createProject,
  createLevel,
  addLevel,
  createWall,
  addWall,
} from "./model/types";
import { drawWall } from "./draw";

/**
 * Milestone 1 demo (data) + first 2D drawing (Milestone 4, early).
 *
 * Builds one sample project (with a level and a wall), prints its
 * JSON, and draws that same wall on a canvas. No zoom, no pan, no
 * selection, no multiple walls yet — just proof the model's data can
 * be rendered visually and matches what's printed.
 */
function buildSampleProject() {
  let project = createProject("Sample House", 60, 90);

  const groundFloor = createLevel("Ground Floor", 0);
  project = addLevel(project, groundFloor);

  const wall = createWall(
    groundFloor.id,
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    10,
    0.5
  );
  project = addWall(project, wall);

  return project;
}

function App() {
  const project = buildSampleProject();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any transform from a previous run
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(20, 20); // small margin so the wall isn't flush with the edge

    for (const wall of project.walls) {
      drawWall(ctx, wall);
    }
  }, [project]);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Building Model — Demo</h1>

      <p>The sample project's wall, drawn on a canvas (10px per foot):</p>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
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