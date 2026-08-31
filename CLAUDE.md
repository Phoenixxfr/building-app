# CLAUDE.md — Project Rules

## What this project is

An AI-native professional building-design platform — a simpler, AI-first
alternative to Autodesk Revit. Combines BIM/CAD concepts, 2D/3D modeling,
natural-language and voice interaction, and direct manipulation, all driven
by one structured building model.

Initial focus: buildings only. Infrastructure (bridges, roads, tunnels) is
out of scope until well after V1.

## Core architectural principle

**The structured building model is the source of truth.** Not the AI, not
a render, not a mesh. All views (2D, 3D, sections, docs) derive from the
same model. Never let AI mutate raw geometry directly — it should propose
structured operations that get validated before touching the model.

## How to work on this project

- One small task at a time. Never build ahead or add features that weren't
  explicitly requested.
- Before writing non-trivial code, report: what you understood the task to
  be, which files/modules will change, architectural impact, dependencies,
  risks/edge cases, and what should be tested. Then wait for approval.
- Do not rewrite working systems. Prefer incremental changes.
- If something is uncertain, architecturally questionable, or risky — say
  so. Don't silently pick a direction and pretend it's obviously correct.
- Break large requests into small, independently verifiable tasks.

## Git

- Git is mandatory. The founder is a Git beginner — explain Git concepts
  simply when relevant.
- **Never commit automatically.** The workflow is: implement → test →
  founder verifies it works → founder confirms → then commit.
- Commit messages should describe a meaningful working checkpoint (e.g.
  "Add wall geometry"), not every tiny edit.
- Never commit secrets, API keys, or credentials. Use environment
  variables and `.gitignore`.

## Cost / stack

- Prefer ₹0 development cost where reasonable: open-source tools, free
  tiers, local-first execution. This won't stay free forever — flag real
  future costs (hosting, cloud AI, etc.) when relevant.
- Candidate stack (not locked in): React + TypeScript frontend, Three.js/
  WebGL for 3D, Python or Node.js backend, SQLite locally, IFC/open-source
  BIM tooling. Re-evaluate before finalizing.
- Keep AI provider integration behind an abstraction layer — don't hard-
  code one provider everywhere.

## Roadmap (high level)

0. Project foundation (repo, tooling, hello-world) — **current**
1. AI building playground foundation
2. Building model core (project/levels/elements/walls, stable IDs)
3. Geometry (points, wall geometry/joining, room boundaries)
4. 2D editor
5. 3D viewport, synced with 2D
6. Core building objects, one family at a time (doors, windows, floors,
   rooms, stairs, roof, furniture)
7. AI command system (structured operations, not raw geometry edits)
8. AI project context/queries (model-aware, no hallucinated data)
9. Validation (collisions, boundaries, connections)
10. Undo/redo
11. Voice (only after text commands are reliable)
12. Materials/visualization (incl. a "hologram mode")
13. Levels/categories/professional controls (hide/show/isolate/lock)
14. Documentation (dimensions, sections, elevations, schedules, quantities)
15. V1 demo

## Things to never do

- Build ahead of the current task or add unrequested features.
- Treat a render or mesh as authoritative — the model always is.
- Hallucinate model data (quantities, counts, dimensions) instead of
  reading them from the actual model.
- Claim AI-generated designs are engineering-certified, structurally safe,
  code-compliant, or construction-approved without real validation.
- Commit secrets, or commit without the founder's confirmation.
