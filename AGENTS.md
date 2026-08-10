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

## Overhaul progress (2026-08-10, continued)
The programming-education overhaul is IN PROGRESS. Verified working:

### Curriculum architecture (frontend/src/curriculum/)
- `types.ts`: data model (Track→Course→Module→Lesson, concepts DAG, lesson
  blocks: paragraph/heading/code/codeWithOutput/callout/compare/steps,
  activities, animations, comprehension checks).
- `loader.ts`: registry with eager stub index + lazy lesson loading.
- `languages/registry.ts`: 13 languages registered.
- `concepts/catalog.ts`: 46 concepts with prerequisite DAG + aliases.
- `tracks/fundamentalsStructure.ts`: Programming Fundamentals track,
  2 courses (Values/Control Flow, Functions & Data), 4 modules.
- `lessons/`: 10 genuine lessons (variables-intro, variables-types,
  conditionals, loops, boolean-operators, functions-intro, recursion,
  lists, strings, dictionaries). Each has objectives, content blocks,
  animation, activity, comprehension checks, compare block. Authored
  for real educational depth — NOT templates.
- `validate.ts`: structural validation (dup IDs/titles, broken prereqs,
  concept-DAG cycle detection, track/course/module integrity, orphans).
- `duplicateDetector.ts`: semantic duplicate detection via token Jaccard.
- `qualityScorer.ts`: per-lesson 7-dimension quality scoring.
- `learningStore.ts`: Zustand store (progress + short-session budget 5/10/15 min).
- `components/`: LessonBlocks, AnimationRenderer, ActivityRenderer,
  ComprehensionCheck (+ CSS modules), barrel index.ts.

### Curriculum UI
- `pages/LearnPage.tsx`: curriculum browser + lesson viewer (replaces 12
  hardcoded NN lessons). Session selector (Any/5/10/15 min).
- `pages/ValidatePage.tsx` (`/cambric-labs/validate`, dev tooling): runs
  validate + duplicateDetector + qualityScorer. Real run: 10 lessons,
  0 structural errors, 0 duplicates, avg quality 99%.

### Developer Area (frontend/src/devarea/)
- Multi-language code analysis workspace. Analyzers (8 categories:
  bugs, errors, gaps, suspicious, integrity, security, performance,
  maintainability) for JS/TS/Python wired into a bounded engine.
  - `analyzers/`: language-specific rule sets — JS/TS (8 rules: var,
    eval, empty-catch, TODO, loose-equality, etc.), Python (7 rules:
    bare-except, mutable-default-arg, eval, global, etc.), TypeScript
    (3 rules: explicit-any, @ts-ignore, non-null assertion).
  - `suggestions/`: refactor engine (e.g. string concat → template
    literal), test generation (per-function jest-style stubs), and
    `compare.ts` — bidirectional language comparison that translates
    recognized idioms (function decl, list/dict literals, print) across
    Python↔JS/TS to teach concept transfer.
  - `pages/AdminPage.tsx`: editor + language selector + analysis
    dashboard + findings + refactor + generated tests + language
    comparison section (with target-language selector).
  - Browser-verified: JS sample → 4 findings + 2 tests + Python
    comparison (function decl js→py); Python sample → 6 findings + 3
    tests; TS analyzer regexes verified standalone.

### Validation baseline
- tsc --noEmit: exit 0. Vite build: exit 0 (~349KB JS, ~64KB CSS).
- Curriculum validator (`/cambric-labs/validate`): 10 lessons, 46
  concepts, 13 languages; 0 structural errors, 0 semantic duplicates,
  avg quality 99% (9 of 10 lessons at 100%).
- Backend: 189 tests pass (neural engine untouched).

## Working conventions for this overhaul
- Work in small batches; never one enormous generated file. Stream/batch/lazy-load (memory safety).
- Never fake quality or inflate lesson counts. Each lesson must have real educational purpose.
- Keep repo buildable after each phase: run `tsc --noEmit` + build + tests before moving on.
- Modify existing files in place; do not create duplicate versions of files.
- Supabase/GitHub keys: reference as env vars ONLY; never write to files or VC.
- User-provided credentials in USER_CONTEXT were exposed — user should rotate them.
