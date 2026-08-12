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
- `languages/registry.ts`: **38 languages** registered (14 analyzable).
- `concepts/catalog.ts`: **147 concepts** with prerequisite DAG + aliases.
- `tracks/`: **8 track structures** (foundations, DSA, web, backend,
  systems, software-engineering, AI + the original NN track).
- `lessons/`: **16 genuine lessons** (variables-intro, variables-types,
  conditionals, loops, boolean-operators, functions-intro, recursion,
  lists, strings, dictionaries, binary-numbers, linked-lists, html-basics,
  sql-fundamentals, git-fundamentals, what-is-ml). Each has objectives,
  content blocks, animation, activity, comprehension checks, compare block.
  Authored for real educational depth — NOT templates.
- `validate.ts`: structural validation (dup IDs/titles, broken prereqs,
  concept-DAG cycle detection, track/course/module integrity, orphans).
- `duplicateDetector.ts`: semantic duplicate detection via token Jaccard
  + title n-gram similarity (improved).
- `qualityScorer.ts`: per-lesson **9-dimension** quality scoring
  (added contentVariety + nonTemplateContent dimensions).
- `learningStore.ts`: Zustand store (progress + mastery + short-session
  budget 5/10/15 min + adaptive recommendation via recommendNextLesson).
- `components/`: LessonBlocks, AnimationRenderer (step-through player with
  play-all/reset/progress dots), ActivityRenderer (11 activity types with
  real assertion evaluation: contains/notContains/regex/outputEquals),
  ComprehensionCheck (+ CSS modules), barrel index.ts.

### Curriculum UI
- `pages/LearnPage.tsx`: curriculum browser + lesson viewer. Session
  selector (Any/5/10/15 min), recommended-next card, locked lessons
  (prereq gating), "long" badge for lessons exceeding session budget.
- `pages/ValidatePage.tsx` (`/cambric-labs/validate`, dev tooling): runs
  validate + duplicateDetector + qualityScorer. Real run: 16 lessons,
  0 structural errors, 0 duplicates, avg quality 99% (15 at 100%, 1 at 95%).

### Developer Area (frontend/src/devarea/)
- Multi-language code analysis workspace. **30 analyzers** across 8
  categories (bugs, errors, gaps, suspicious, integrity, security,
  performance, maintainability) for JS/TS/Python/SQL/HTML/CSS + 15
  cross-language common analyzers covering all 14 analyzable languages.
  - `analyzers/javascript.ts` (7 rules), `python.ts` (7), `typescript.ts` (3),
    `sql.ts` (4: select-star, injection-risk, missing-where, destructive-no-where),
    `htmlCss.ts` (4: img-needs-alt, inline-style, !important, empty-rule),
    `common.ts` (5: hardcoded-secret, debug-print, todo-marker, long-line,
    localhost-url — runs for all 14 analyzable languages).
  - `suggestions/`: refactor engine, test generation (per-function stubs),
    `compare.ts` (bidirectional language comparison), **`explain.ts`** (NEW:
    code explanation engine — detects functions, infers purpose, produces
    natural-language summary + per-function explanation blocks).
  - `engine.ts`: analyzer registry + bounded run (one analyzer throwing
    does not abort the whole run).
  - `pages/AdminPage.tsx`: editor + language selector + analysis dashboard
    + findings + code explanation + refactor + generated tests + language
    comparison. Sample code for JS/TS/Python/SQL/HTML/CSS.
  - **Tests**: vitest infrastructure (`vitest.config.ts`, `npm test`).
    35 tests (20 engine + 15 suggestions) — all pass. Covers analyzer
    positive/negative cases, throwing-analyzer resilience, refactor
    patterns, test generation, language comparison, code explanation.

### Validation baseline
- tsc --noEmit: exit 0. Vite build: exit 0 (~729KB JS, ~66KB CSS).
- vitest: 39/39 pass across 3 files (`cd frontend && npm test`):
  `curriculum.test.ts` (4), `devarea.test.ts`, `suggestions.test.ts`.
- Curriculum validator: 64 lessons, 349 concepts, 38 languages; 7 tracks
  (Foundations, DSA, Web, Backend, Systems, SE, AI) fully populated;
  0 structural errors, 0 semantic duplicates, every lesson ≥0.6 quality floor.
- Backend: 189 tests pass (neural engine untouched).

## Recovery + expansion checkpoint (current branch)
- Branch: `cambric-overhaul-education-dev` (52 commits ahead of `origin/main`).
- **All commits PUSHED** to GitHub. Remote HEAD matches local HEAD.
- **PR #3 OPEN**: "Cambric Labs Education Platform Overhaul: Curriculum + Developer Area"
  https://github.com/Cambric-software/Cambric-labs/pull/3 (head: cambric-overhaul-education-dev → main)
- Lesson count: **96** (16 single-lesson files + 80 module-bundled across 44 modules).
- Concept catalog: **431** concepts (prerequisites + aliases wired).
- **9 tracks** (added Programming Languages track this session).
- Tracks populated (all 9 tracks fully populated, NO empty modules remain):
  - Foundations (7 lessons), DSA (24), Web (7), Backend (10), Systems (6),
    Software Engineering (8), AI (9), Programming Languages (4 new).
- Module files authored this session (the 14 empty modules, 2 lessons each):
  Backend: moduleAuthSecurity, moduleCachingScaling, moduleNosql.
  Systems: moduleOwnership, moduleConcurrency, moduleCompilation.
  SE: moduleCodeReview, moduleDebugging, moduleDesignPatterns.
  AI: moduleStatistics, moduleLinearAlgebra, moduleTransformers.
  (Earlier session: moduleHardware, moduleSourceToProgram, moduleTerminalAndFiles,
  moduleCss, moduleHttp, moduleDomEvents, moduleServerBasics, moduleRelationalDesign,
  moduleMemoryModel, moduleTesting, moduleNeuralNetworks.)
- **All 14 empty modules are now filled.** Verified: `grep "lessonIds: \[\]" tracks/*Structure.ts` returns nothing.
- Concepts added this session: security, performance, consistency, token (auth); readability,
  maintainability, pair-programming, communication, debugging-strategy, reproducibility,
  hypothesis-testing, root-cause, logging, console-io, strategy-pattern, observer-pattern,
  factory-pattern, composition, interface, mean-median, normal-distribution, outlier,
  sampling, correlation, bias-variance, arithmetic, vector-addition, coordinate-system,
  linear-transformation, softmax, layer-normalization, residual-connection,
  type-system, static-typing, dynamic-typing, type-inference, type-error,
  strong-typing, weak-typing, type-coercion.

## Continuation session (2026-08-12) — Developer Area + curriculum expansion
- **Developer Area: 50 analyzers** across 9 files + 4 suggestion engines.
  - `analyzers/security.ts` (NEW, 5): XSS-innerHTML, command-injection, path-traversal,
    weak-crypto (MD5/SHA1), open-redirect.
  - `analyzers/performance.ts` (NEW, 5): nested-loop (O(n²)), repeated-computation,
    list-concat-in-loop (Python), sequential-await-in-loop (JS/TS), regex-in-loop.
  - `analyzers/maintainability.ts` (NEW, 4): magic-number, huge-function (>50 lines),
    deep-nesting (4+ levels), dead-code-block (5+ commented lines).
  - `analyzers/errors.ts` (6): unbalanced-delimiters, py-tab-space-mix, py-return-outside-function,
    js-leading-comma, js-duplicate-params, sql-trailing-comma.
  - Plus existing: javascript(7), python(7), typescript(3), sql(4), htmlCss(4), common(5).
  - `suggestions/tests.ts`: enhanced — detects arrow functions + class methods (not just `function name`).
- **Curriculum: Programming Languages track** (NEW, 4 lessons, 2 modules):
  - module-type-systems: static-vs-dynamic-typing, strong-vs-weak-typing.
  - module-memory-models: memory-management-strategies, ownership-and-borrowing-concepts.
  - Teaches genuine language design differences (Python/JS/TS/Java/Rust/C), not syntax.
  - Types extended: compare content block now allows 2-or-3 languages; added 'compare' to AnimationType.

## Finalization session (2026-08-10) — polish, verify, release
- **Compare animation renderer** (`AnimationRenderer.tsx`): `ComparePlayer` component
  renders side-by-side panels with side highlighting. Dispatched on `animation.type === 'compare'`.
  Updated 3 compare animations (moduleTypeSystems x2, moduleMemoryModels x1) with `payload.sides`.
- **Sequential prev/next navigation** (`LearnPage.tsx`): prev/next now follows curriculum
  hierarchy (lessons in module order → modules in course order → courses in track order)
  instead of global difficulty sort. Breadcrumb added (track › course › module).
- **Test generator async-aware** (`suggestions/tests.ts`): `DetectedFunction` now has `isAsync`.
  Python `async def` → `async def test_foo()` with `await`. JS/TS async named/arrow/method →
  `async ()` test with `await`. Python dedup added (was JS/TS only). Malformed/empty input safe.
- **Language comparison fallback** (`suggestions/compare.ts`): when no patterns match,
  returns single informative result instead of empty array. `source==target` still returns [].
- **Loop Control lesson** (`lessonLoopControl.ts`, NEW): teaches break/continue — fills the
  genuine gap where `break-continue` was a registered-but-untaught concept. Added to
  module-control-flow after lesson-loops. Compare block (flag vs break), codeWalk animation,
  codeChallenge activity, 3 comprehension checks.
- **Validation baseline (all green)**:
  - tsc --noEmit: exit 0.
  - vitest: **94/94** pass (3 files: curriculum 4, devarea 62, suggestions 28).
  - vite build: succeeds.
  - Backend pytest: 189/189 pass.
  - Curriculum validator: 0 structural errors, 0 duplicates, all lessons ≥ quality floor.
  - Browser verification: Learn page renders all tracks/courses/modules/lessons; new loop-control
    lesson renders with breadcrumb, animation, activity, comprehension; Developer Area runs
    analysis end-to-end (findings + generated tests displayed).
- **Counts**: 97 lessons, 44 modules, 9 tracks, 431 concepts, 38 languages, 50 analyzers.
- Remaining work: further curriculum expansion for the 28 registered-but-untaught languages
  (architecture supports it; content authoring is the long-tail task).

## Working conventions for this overhaul
- Work in small batches; never one enormous generated file. Stream/batch/lazy-load (memory safety).
- Never fake quality or inflate lesson counts. Each lesson must have real educational purpose.
- Keep repo buildable after each phase: run `tsc --noEmit` + build + tests before moving on.
- Modify existing files in place; do not create duplicate versions of files.
- Supabase/GitHub keys: reference as env vars ONLY; never write to files or VC.
- User-provided credentials in USER_CONTEXT were exposed — user should rotate them.
