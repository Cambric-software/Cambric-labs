/**
 * Cambric Labs — Developer Area: Analysis Framework
 *
 * The Developer Area analyzes source code for bugs, errors, gaps, suspicious
 * structures, integrity problems, security issues, performance issues, and
 * maintainability issues — then offers explanations, simpler implementations,
 * refactor suggestions, and generated tests.
 *
 * This file defines the contracts every analyzer implements. Analyzers are
 * language-aware: each language can register its own set of analyzers. The
 * framework dispatches on a `severity` taxonomy and a stable `category`
 * enum so the UI can group findings consistently regardless of language.
 */

/** Severity ramp for a finding. */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

/** The category of issue a finding reports. These map 1:1 to the task's
 *  requested analysis dimensions. */
export type FindingCategory =
  | 'bug' // logic errors, wrong results
  | 'error' // syntax / type / will-not-run
  | 'gap' // missing functionality / incomplete logic
  | 'suspicious' // code smell, looks wrong, may be intentional
  | 'integrity' // corruption / inconsistency / data integrity
  | 'security' // vulnerabilities
  | 'performance' // inefficient patterns
  | 'maintainability' // readability / duplication / complexity

/** A source position. Lines are 1-based; columns optional. */
export interface SourceRange {
  startLine: number
  endLine: number
  startColumn?: number
  endColumn?: number
}

/** A single issue found in analyzed code. */
export interface Finding {
  /** Stable id for this finding rule, e.g. "js-eqeqeq". */
  ruleId: string
  category: FindingCategory
  severity: Severity
  message: string
  /** Where in the source the finding applies. */
  range?: SourceRange
  /** Why this matters, in plain language. */
  explanation?: string
  /** A suggested fix as a patch-like snippet, if applicable. */
  suggestion?: SuggestedFix
}

/** A concrete suggested change. */
export interface SuggestedFix {
  /** Short title, e.g. "Use === instead of ==". */
  title: string
  /** Replacement code the user can apply. */
  code?: string
  /** Natural-language reasoning. */
  rationale?: string
}

/** Input handed to an analyzer. */
export interface AnalysisInput {
  /** Source code text. */
  code: string
  /** Language id from the curriculum language registry. */
  languageId: string
  /** Optional entry file name for diagnostics. */
  fileName?: string
}

/** Result returned by an analyzer. */
export interface AnalysisResult {
  /** Which analyzer produced this. */
  analyzerId: string
  findings: Finding[]
}

/**
 * An analyzer is a pure function: code in, findings out. It must be
 * side-effect free and bounded — never run untrusted code. Analyzers run on
 * a best-effort static basis; they report what they can prove or strongly
 * suspect from the text alone.
 */
export interface Analyzer {
  id: string
  /** Human label, e.g. "Equality checks". */
  label: string
  /** Single category this analyzer primarily reports (for grouping). */
  category: FindingCategory
  /** Languages this analyzer supports (language ids). */
  supportedLanguages: string[]
  /** Run the analysis. Pure; throws never (returns [] on internal error). */
  analyze(input: AnalysisInput): Finding[]
}

/** Aggregated options for a full analysis run. */
export interface AnalysisOptions {
  /** Categories to include. If omitted, all run. */
  categories?: FindingCategory[]
  /** Max findings per analyzer (bounded output, memory safety). */
  maxFindingsPerAnalyzer?: number
}

/** A refactoring / simplification suggestion (separate from per-finding fixes). */
export interface RefactorSuggestion {
  id: string
  title: string
  category: 'simplification' | 'refactor' | 'test' | 'explanation' | 'comparison'
  rationale: string
  /** Original snippet being improved (optional). */
  before?: string
  /** Improved snippet. */
  after?: string
  /** Estimated benefit. */
  effort?: 'trivial' | 'low' | 'medium' | 'high'
}

/** A generated test (heuristic, language-aware). */
export interface GeneratedTest {
  title: string
  /** Language id the test is written in. */
  languageId: string
  code: string
  /** What the test asserts. */
  asserts: string[]
}
