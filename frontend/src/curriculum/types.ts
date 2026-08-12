/**
 * Cambric Labs — Curriculum Domain Model
 *
 * Core type definitions for the programming-education curriculum.
 * These types are intentionally framework-agnostic and serializable so
 * lessons can be authored as plain data modules and loaded lazily.
 *
 * Design goals:
 *  - Each lesson has a genuine educational purpose (no template inflation).
 *  - Lessons are organized into Tracks -> Courses -> Modules -> Lessons.
 *  - Concepts carry explicit prerequisite edges (a DAG) so an adaptive
 *    engine can schedule lessons that respect what a learner already knows.
 *  - Activities + animations are declarative descriptors, not hard-coded UI,
 *    so a single renderer can serve many lesson types.
 */

/** A programming language taught by the platform. */
export interface LanguageSpec {
  /** Stable id, e.g. "python", "rust", "typescript". */
  id: string
  /** Human display name, e.g. "Python", "Rust". */
  name: string
  /** Short tagline describing the language's primary use. */
  tagline: string
  /** Paradigms: imperative, oop, functional, declarative, ... */
  paradigms: Paradigm[]
  /** CodeMirror-like mime/mode token used by the editor. */
  editorMode: string
  /** File extension without the dot, e.g. "py", "rs". */
  extension: string
  /** Approximate comment line token, e.g. "#", "//". */
  lineComment: string
  /** True when this language ships in the Developer Area analyzers. */
  analyzable: boolean
  /** Difficulty ramp 1-5 for an absolute beginner. */
  beginnerDifficulty: 1 | 2 | 3 | 4 | 5
  /** Coarse category for grouping in the curriculum browser. */
  category: LanguageCategory
}

/** Coarse grouping for the language browser (markup/query are taught but not "programming languages" in the strict sense). */
export type LanguageCategory =
  | 'general' // general-purpose programming languages
  | 'systems' // C, C++, Rust, Assembly
  | 'mobile' // Swift, Dart
  | 'data' // R, MATLAB, Julia
  | 'shell' // Bash, PowerShell
  | 'query' // SQL
  | 'markup' // HTML, CSS
  | 'specialized' // Solidity, GDScript
  | 'legacy' // Fortran, COBOL
  | 'notation' // Pseudocode

export type Paradigm =
  | 'imperative'
  | 'object-oriented'
  | 'functional'
  | 'declarative'
  | 'concurrent'
  | 'systems'
  | 'scripting'

/** A top-level learning track, e.g. "Programming Fundamentals". */
export interface Track {
  id: string
  title: string
  summary: string
  /** Ordered course ids belonging to this track. */
  courseIds: string[]
  /** Accent color token from the design system. */
  accent: AccentToken
}

/** A course within a track, e.g. "Variables & Control Flow". */
export interface Course {
  id: string
  trackId: string
  title: string
  summary: string
  /** Ordered module ids. */
  moduleIds: string[]
}

/** A module within a course, e.g. "Loops". */
export interface CurriculumModule {
  id: string
  courseId: string
  title: string
  summary: string
  /** Ordered lesson ids. */
  lessonIds: string[]
}

/**
 * The unit of instruction. Authored as data so the renderer, validator,
 * and adaptive engine all share one definition of "what a lesson is".
 */
export interface Lesson {
  /** Globally unique, kebab-case, e.g. "python-variables-intro". */
  id: string
  title: string
  moduleId: string
  /** Primary language this lesson teaches (or "pseudo" for concept-only). */
  languageId: string
  /** 1-5 ramp of intrinsic difficulty. */
  difficulty: 1 | 2 | 3 | 4 | 5
  /** Estimated minutes for a focused learner (drives short-session UX). */
  estimatedMinutes: number
  summary: string
  /** Concept ids this lesson teaches (the "learning objectives"). */
  teachesConceptIds: string[]
  /** Concept ids the learner should already grasp before starting. */
  prerequisiteConceptIds: string[]
  /** Learning objectives as concrete, measurable statements. */
  objectives: string[]
  /** Rich content blocks rendered in order. */
  content: LessonBlock[]
  /** Optional interactive activity descriptor. */
  activity?: ActivityDescriptor
  /** Optional animation descriptor shown inline. */
  animation?: AnimationDescriptor
  /** A short check-for-understanding prompt set. */
  comprehensionChecks?: ComprehensionCheck[]
}

/** Accent color tokens backed by the design system in main.css. */
export type AccentToken =
  | 'blue'
  | 'green'
  | 'red'
  | 'orange'
  | 'purple'
  | 'cyan'

/** A discriminated union of renderable content blocks. */
export type LessonBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'callout'; variant: CalloutVariant; title?: string; text: string }
  | { kind: 'code'; languageId: string; caption?: string; code: string }
  | { kind: 'codeWithOutput'; languageId: string; code: string; output: string; caption?: string }
  | { kind: 'compare'; languageIds: [string, string] | [string, string, string]; caption?: string; snippets: [string, string] | [string, string, string] }
  | { kind: 'steps'; caption?: string; steps: string[] }

export type CalloutVariant = 'info' | 'warning' | 'success' | 'tip' | 'danger'

/**
 * Declarative description of an interactive activity. The activity
 * renderer dispatches on `type`. Keeping this data-driven means a lesson
 * can opt into an activity without writing bespoke UI.
 */
export interface ActivityDescriptor {
  type: ActivityType
  title: string
  /** Prompt shown above the activity. */
  prompt: string
  /** Language for code-based activities. */
  languageId?: string
  /** Starter code placed in the editor. */
  starterCode?: string
  /** A reference solution used to validate self-checks (never shipped to prod builds). */
  solutionCode?: string
  /** Free-form check constraints the runner evaluates. */
  checks?: ActivityCheck[]
  /** For non-code activities (e.g. ordering, matching). */
  data?: Record<string, unknown>
}

export type ActivityType =
  | 'codeChallenge' // write code that satisfies checks
  | 'fillBlank' // complete a partial code snippet
  | 'ordering' // reorder shuffled steps into the correct sequence
  | 'matching' // match items from two columns
  | 'predictOutput' // predict what code prints
  | 'sandbox' // free-form code experimentation
  | 'fixCode' // repair broken/buggy code so checks pass
  | 'findBug' // identify which line contains the bug
  | 'completeCode' // fill in a missing piece to reach a goal
  | 'traceExecution' // step through code and report variable state
  | 'multipleChoice' // concept / "which is better" question
  | 'spotBadPractice' // identify the problematic pattern
  | 'compareImplementations' // judge which solution is better and why
  | 'codeReview' // review a snippet for issues

export interface ActivityCheck {
  /** Human description of what the check verifies. */
  description: string
  /** Type of assertion the runner performs. */
  assertion: ActivityAssertion
}

export type ActivityAssertion =
  | { kind: 'contains'; value: string }
  | { kind: 'notContains'; value: string }
  | { kind: 'matchesRegex'; pattern: string }
  | { kind: 'outputEquals'; value: string }
  | { kind: 'outputContains'; value: string }

/** Declarative animation descriptor. */
export interface AnimationDescriptor {
  type: AnimationType
  title: string
  /** Steps the animation plays through, in order. */
  steps: AnimationStep[]
}

export type AnimationType =
  | 'codeWalk' // step through code lines with highlights
  | 'memoryDiagram' // boxes/values in memory (stack vs heap)
  | 'dataFlow' // values flowing through expressions
  | 'callStack' // frames pushing/popping
  | 'timeline' // sequential events over time
  | 'sorting' // array elements rearranging during a sort
  | 'treeTraversal' // visiting nodes of a tree
  | 'graphTraversal' // visiting nodes of a graph (BFS/DFS)
  | 'eventLoop' // task queue / microtask / call stack interplay
  | 'asyncFlow' // promise / async-await resolution order
  | 'compare' // same operation across languages/strategies side by side

export interface AnimationStep {
  caption: string
  /** Highlighted code lines, if applicable. */
  highlightLines?: number[]
  /** Optional free-form payload for specialized renderers. */
  payload?: Record<string, unknown>
}

/** A single comprehension question with one correct answer. */
export interface ComprehensionCheck {
  question: string
  options: string[]
  correctIndex: number
  /** Why the correct answer is correct, shown after answering. */
  explanation: string
}

/**
 * A project learners build incrementally. Each milestone combines
 * previously learned concepts and ends with a checkpoint. Projects live
 * in tracks alongside lessons; the registry keeps stub metadata only
 * and loads milestone detail lazily.
 */
export interface Project {
  id: string
  title: string
  trackId: string
  /** Primary language for the project's code. */
  languageId: string
  summary: string
  /** Concept ids the project exercises (cumulative). */
  usesConceptIds: string[]
  /** Concept ids the learner should know before starting. */
  prerequisiteConceptIds: string[]
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedHours: number
  /** Ordered milestones; each is a self-contained checkpoint. */
  milestones: ProjectMilestone[]
}

/** One checkpoint within a project. */
export interface ProjectMilestone {
  id: string
  title: string
  goal: string
  /** Concept ids this milestone introduces or applies. */
  conceptIds: string[]
  /** Hints revealed one at a time, not all at once. */
  hints: string[]
  /** A check confirming the milestone is reached. */
  check?: ActivityCheck
}

/**
 * A concept is a fine-grained, reusable unit of knowledge (e.g. "variable",
 * "for-loop", "ownership"). Concepts let us express prerequisite edges and
 * detect semantic duplication across languages.
 */
export interface Concept {
  id: string
  title: string
  summary: string
  /** Other concept ids that must be understood first. */
  prerequisiteConceptIds: string[]
  /** Aliases / synonyms for semantic-duplicate detection. */
  aliases?: string[]
}

/** Aggregated registry returned by the curriculum loader. */
export interface CurriculumRegistry {
  languages: Record<string, LanguageSpec>
  tracks: Record<string, Track>
  courses: Record<string, Course>
  modules: Record<string, CurriculumModule>
  concepts: Record<string, Concept>
  /** Lessons are keyed by id for O(1) lookup; loaded lazily by module. */
  lessonIndex: Record<string, LessonStub>
  /** Projects keyed by id (stubs only; milestone detail lives in the project). */
  projects?: Record<string, Project>
}

/** Lightweight lesson metadata kept in memory; full content loaded on demand. */
export interface LessonStub {
  id: string
  title: string
  moduleId: string
  languageId: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedMinutes: number
  summary: string
  teachesConceptIds: string[]
  prerequisiteConceptIds: string[]
}

/** Full lesson payload (stub + content). */
export type LessonDetail = LessonStub & {
  objectives: string[]
  content: LessonBlock[]
  activity?: ActivityDescriptor
  animation?: AnimationDescriptor
  comprehensionChecks?: ComprehensionCheck[]
}
