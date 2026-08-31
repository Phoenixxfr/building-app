import {
  createProject,
  createLevel,
  addLevel,
  createWall,
  addWall,
} from "./model/types";

/**
 * Milestone 1 demo — proves the data model works end-to-end.
 *
 * Builds one sample project (with a level and a wall) and prints its
 * JSON. No styling, no drawing, no persistence — just visual proof
 * that createProject/addLevel/addWall produce the shape we expect.
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

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Building Model — Demo</h1>
      <p>This is a sample Project built from the model helpers:</p>
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