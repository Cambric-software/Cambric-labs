/**
 * Cambric Labs — Developer Area: Analyzer Registry & Engine
 *
 * Registers analyzers per language and orchestrates a full analysis run.
 * The engine is deliberately bounded: it caps findings per analyzer and
 * never executes analyzed code. All analysis is static text inspection.
 */
import type {
  AnalysisInput,
  AnalysisOptions,
  AnalysisResult,
  Analyzer,
  Finding,
  FindingCategory,
} from './types'

const analyzers: Analyzer[] = []

/** Register an analyzer. Idempotent on analyzer.id. */
export function registerAnalyzer(analyzer: Analyzer): void {
  if (!analyzers.some((a) => a.id === analyzer.id)) {
    analyzers.push(analyzer)
  }
}

/** All registered analyzers. */
export function listAnalyzers(): Analyzer[] {
  return [...analyzers]
}

/** Analyzers applicable to a given language. */
export function analyzersForLanguage(languageId: string): Analyzer[] {
  return analyzers.filter((a) => a.supportedLanguages.includes(languageId))
}

const DEFAULT_MAX_FINDINGS = 50

/**
 * Run every applicable analyzer for the input's language. Bounded, pure,
 * and resilient: a throwing analyzer contributes zero findings rather than
 * aborting the whole run.
 */
export function runAnalysis(input: AnalysisInput, options: AnalysisOptions = {}): AnalysisResult[] {
  const maxPerAnalyzer = options.maxFindingsPerAnalyzer ?? DEFAULT_MAX_FINDINGS
  const categoryFilter = options.categories ? new Set(options.categories) : undefined
  const applicable = analyzersForLanguage(input.languageId)
  const results: AnalysisResult[] = []

  for (const analyzer of applicable) {
    let findings: Finding[] = []
    try {
      findings = analyzer.analyze(input)
    } catch {
      // An analyzer must never break the whole run; degrade to no findings.
      findings = []
    }
    if (categoryFilter) {
      findings = findings.filter((f) => categoryFilter.has(f.category))
    }
    if (findings.length > maxPerAnalyzer) {
      findings = findings.slice(0, maxPerAnalyzer)
    }
    results.push({ analyzerId: analyzer.id, findings })
  }
  return results
}

/** Flatten results into a single findings list, sorted by severity. */
export function flattenFindings(results: AnalysisResult[]): Finding[] {
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
  return results
    .flatMap((r) => r.findings)
    .sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9))
}

/** Count findings by category (for dashboard summaries). */
export function summarizeByCategory(results: AnalysisResult[]): Record<FindingCategory, number> {
  const summary: Record<FindingCategory, number> = {
    bug: 0,
    error: 0,
    gap: 0,
    suspicious: 0,
    integrity: 0,
    security: 0,
    performance: 0,
    maintainability: 0,
  }
  for (const result of results) {
    for (const finding of result.findings) {
      summary[finding.category] += 1
    }
  }
  return summary
}
