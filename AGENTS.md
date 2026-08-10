# Cambric Labs — Repository Memory (AGENTS.md)

> Persistent context for OpenHands agents working on this repo.

## Repo at a glance
- **App**: CAMBRIC LABS — a local-first Neural Network Laboratory (NOT "Cambric AI").
- **Stack**: React 18 + TypeScript + Vite (`frontend/`), Python/FastAPI + neural engine (`backend/`),
  Electron (`electron/`), Capacitor/Android (`android/`, `frontend/capacitor.config.ts`),
  GitHub Pages deploy (`docs/app`, `.github/workflows/pages.yml`).
- **Build/test commands**:
  - Frontend typecheck: `cd frontend && npx tsc --noEmit`
  - Frontend build: `cd frontend && npm run build` (outputs to `../docs/app`, gitignored)
  - Backend tests: `python -m pytest tests/ -q` (189 tests, must install `backend/requirements.txt` + pytest)
- **node_modules not committed**; must `npm install` in `frontend/` before building.
- **Build output `docs/app/` is gitignored** — do NOT commit it.

## Preserved functionality (do not break)
- Neural network engine: `backend/neural/{neuron,layer,network,activation,loss}.py`,
  `backend/training/{trainer,backpropagation}.py`. 189 passing tests in `tests/`.
- Frontend routes in `frontend/src/App.tsx` (`/`, `/cambric-labs/`, `/lab`, `/learn`, `/admin`).
- Existing pages: HomePage, LabPage, LearnPage (12 hardcoded NN lessons), AdminPage.
- Release infra: `.github/workflows/{build-android,build-windows,pages}.yml`. Tag v0.1.7.
- Security: Supabase creds loaded from env only (no hardcoding).

## Recovery audit (2026-08-10)
- A previous OpenHands execution reportedly crashed mid-task. **Audit result: NOTHING survived.**
- `git status` clean, reflog shows only `clone`, no stash, no dangling objects, only `main` branch.
- No curriculum/Developer-Area files existed beyond the 12 hardcoded neural-network lessons in `LearnPage.tsx`.
- The "1,128 lessons / many languages / Developer Area" from the prior task did NOT exist on disk.
- Baseline verified green: `tsc --noEmit` exit 0, `npm run build` exit 0, 189 backend tests pass.

## Working conventions for this overhaul
- Work in small batches; never one enormous generated file. Stream/batch/lazy-load (memory safety).
- Never fake quality or inflate lesson counts. Each lesson must have real educational purpose.
- Keep repo buildable after each phase: run `tsc --noEmit` + build + tests before moving on.
- Modify existing files in place; do not create duplicate versions of files.
