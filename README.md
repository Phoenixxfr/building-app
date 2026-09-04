# AI-Native Building Design Platform

An AI-native professional building-design platform aiming to be a simpler, AI-first alternative to Autodesk Revit — combining BIM/CAD concepts, 2D and 3D modeling, natural-language and voice interaction, and direct manipulation, all driven by a single structured building model as the source of truth.

## Status

Milestone 4 (early) in progress — 2D editor foundation.

Working so far:
- Data model: Project, Plot, Level, Wall, Door, Window, Room (`frontend/src/model/types.ts`)
- 2D canvas rendering: walls, doors (with swing arc), windows, plot boundary (`frontend/src/draw.ts`)
- Click-to-select on walls, doors, and windows (highlights red, shows info below canvas)
- Add a new wall via a form
- Delete a selected wall (also removes any doors/windows hosted on it)
- 32 automated tests passing (`npx vitest run` from `frontend/`)

Still hardcoded: the app starts from one sample project (`buildSampleProject()` in `App.tsx`) — no project creation/save/load UI yet.

## Frontend

The `frontend/` folder contains a React + TypeScript app scaffolded with Vite.

```bash
cd frontend
npm install
npm run dev
```

See `CLAUDE.md` for project rules and development conventions.